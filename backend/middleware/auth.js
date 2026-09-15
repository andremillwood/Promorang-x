const { createClient } = require('@supabase/supabase-js');
const {
  ADMIN_CAPABILITIES,
  capabilitiesForRoles,
  isAdminRole,
  normalizeRoles,
} = require('../lib/adminCapabilities');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log environment variable status for debugging
console.log('[Auth] Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('[Auth] Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Auth] ❌ Required credentials missing; protected routes will reject requests.');
  console.error('[Auth] Make sure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      multiTab: false
    },
  })
  : null;

const ADMIN_ROLES = ['support', 'support_agent', 'admin', 'administrator', 'master_admin', 'moderator', 'platform_admin'];
const PLATFORM_ADMIN_ROLES = ['admin', 'administrator', 'master_admin'];

// Self-selected account categories are presentation/workflow context only.
// Privileged roles always come from the protected user_roles table.
function accountRole(roles, category) {
  const categories = ['regular', 'participant', 'creator', 'host', 'brand', 'merchant', 'agency', 'advertiser', 'investor', 'promoter', 'pro'];
  return roles.find((value) => ADMIN_ROLES.includes(value)) || roles[0]
    || (categories.includes(category) ? category : 'regular');
}

async function getUserRoles(userId) {
  if (!supabase || !userId) {
    return [];
  }

  const roles = new Set();

  const { data: roleRecords, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (roleError) {
    console.warn('[Auth] Failed to fetch user_roles:', roleError.message);
  }

  for (const row of roleRecords || []) {
    if (row?.role) roles.add(row.role);
  }

  return Array.from(roles);
}

async function getTrustedRequestRoles(req) {
  if (req.adminRoles) return req.adminRoles;
  const roles = normalizeRoles(await getUserRoles(req.user?.id));
  req.adminRoles = roles;
  req.user.roles = roles;
  const primaryAdminRole = roles.find((role) => isAdminRole(role));
  if (primaryAdminRole) req.user.role = primaryAdminRole;
  return roles;
}

async function getTrustedRequestCapabilities(req) {
  if (req.adminCapabilities) return req.adminCapabilities;
  const roles = await getTrustedRequestRoles(req);
  const capabilities = capabilitiesForRoles(roles);

  if (supabase && roles.length > 0) {
    const roleQuery = supabase.from('admin_role_capabilities').select('capability');
    const grantQuery = supabase.from('admin_user_capability_grants').select('capability, expires_at, revoked_at');
    const [{ data: roleRows, error: roleError }, { data: grantRows, error: grantError }] = await Promise.all([
      typeof roleQuery.in === 'function' ? roleQuery.in('role', roles) : { data: [], error: null },
      typeof grantQuery.eq === 'function' && typeof grantQuery.is === 'function'
        ? grantQuery.eq('user_id', req.user.id).is('revoked_at', null)
        : { data: [], error: null },
    ]);
    if (!roleError) for (const row of roleRows || []) capabilities.add(row.capability);
    if (!grantError) {
      const now = Date.now();
      for (const row of grantRows || []) {
        if (!row.expires_at || new Date(row.expires_at).getTime() > now) capabilities.add(row.capability);
      }
    }
  }

  req.adminCapabilities = capabilities;
  return capabilities;
}

/**
 * Middleware to require authentication for protected routes
 * Verifies the Supabase JWT token and attaches the user to the request object
 */
async function requireAuth(req, res, next) {
  if (!supabase) {
    console.error('[Auth] ❌ Supabase client not initialized');
    return res.status(500).json({
      success: false,
      error: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_UNAVAILABLE'
    });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    console.warn('[Auth] 🔒 No token provided in Authorization header');
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'MISSING_TOKEN',
      hint: 'Include your Supabase JWT in the Authorization header as: Bearer <token>'
    });
  }

  console.log('[Auth] 🔍 Verifying token...');

  try {
    let authData, authError;
    try {
      const result = await supabase.auth.getUser(token);
      authData = result.data;
      authError = result.error;
    } catch (err) {
      console.error('[Auth] Exception during getUser:', err.message);
      authError = err;
    }

    if (authError || !authData?.user) {
      console.warn('[Auth] ⚠️ Supabase API verification failed:', authError?.message || 'No user returned');
      
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'INVALID_TOKEN',
        details: authError?.message || 'Token verification failed',
        hint: 'Backend could not verify your token.',
        auth_service_error: authError?.message
      });
    }

    const verifiedUserId = authData.user.id;
    const roles = await getUserRoles(verifiedUserId);

    // Look up the user profile in public.profiles. Rows may be keyed by id
    // or user_id depending on how they were created.
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', verifiedUserId)
      .maybeSingle();

    if (!profileData) {
      const byId = await supabase
        .from('profiles')
        .select('*')
        .eq('id', verifiedUserId)
        .maybeSingle();
      profileData = byId.data;
      profileError = profileError || byId.error;
    }

    if (profileError) {
      console.warn('[Auth] ⚠️ Error fetching profile data:', profileError.message);
    }

    const role = accountRole(roles, profileData?.user_type);
    const placeholderNames = new Set(['member', 'you', 'there', 'explorer', 'user', 'community']);
    const realName = (...values) => values
      .map((value) => String(value || '').trim())
      .find((value) => value && !placeholderNames.has(value.toLowerCase())) || '';
    const resolvedName = realName(
      profileData?.display_name,
      profileData?.full_name,
      authData.user.user_metadata?.full_name,
      authData.user.user_metadata?.name,
      authData.user.email?.split('@')[0],
    ) || 'You';

    // Attach user to request for use in route handlers
    // We prioritize authData.user (the source of truth from Auth service) 
    // and use profileData for supplementary info like username/display_name
    req.user = {
      id: verifiedUserId,
      email: authData.user.email,
      username: profileData?.username || authData.user.email?.split('@')[0] || 'user',
      display_name: resolvedName,
      full_name: resolvedName,
      user_type: role,
      role,
      roles,
      points_balance: profileData?.points_balance || 0,
      keys_balance: profileData?.keys_balance || 0,
      gems_balance: profileData?.gems_balance || 0,
      is_verified: !!authData.user.email_confirmed_at
    };

    console.log(`[Auth] ✅ Authenticated as user: ${req.user.email} (${req.user.id})`);
    return next();

  } catch (error) {
    console.error('[Auth] ❌ Error during authentication:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      code: 'AUTH_ERROR',
      details: error.message
    });
  }
}


/**
 * Middleware to resolve the active advertiser account context
 * Checks X-Advertiser-Account-Id header or falls back to the user's primary/first account
 */
async function resolveAdvertiserContext(req, res, next) {
  if (!req.user) return next();

  // Skip if already resolved
  if (req.advertiserAccount) return next();

  const headerAccountId = req.headers['x-advertiser-account-id'];

  try {
    if (!supabase) {
      // Mock mode: if demo advertiser, give them a mock account
      if (req.user.user_type === 'advertiser' || req.user.role === 'advertiser') {
        req.advertiserAccount = {
          id: 'demo-advertiser-account-id',
          role: 'owner',
          name: 'Demo Account',
          company_name: 'Demo Corp',
          status: 'active'
        };
      }
      return next();
    }

    // Fetch the advertiser accounts this user belongs to
    const { data: teamMembers, error } = await supabase
      .from('advertiser_team_members')
      .select(`
        account_id,
        role,
        advertiser_accounts (
          id,
          name
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('[Auth] Error fetching advertiser team relations:', error);
      return next();
    }

    if (teamMembers && teamMembers.length > 0) {
      let activeMember;

      if (headerAccountId) {
        activeMember = teamMembers.find(m => m.account_id === headerAccountId);
      }

      // Fallback to first account if none specified or not found
      if (!activeMember) {
        activeMember = teamMembers[0];
      }

      if (activeMember && activeMember.advertiser_accounts) {
        req.advertiserAccount = {
          id: activeMember.account_id,
          role: activeMember.role,
          name: activeMember.advertiser_accounts.name,
          company_name: activeMember.advertiser_accounts.company_name,
          status: activeMember.advertiser_accounts.status
        };

        // Also set legacy advertiser_id for compatibility if needed
        req.advertiser_id = activeMember.account_id;
      }
    }

    next();
  } catch (err) {
    console.error('[Auth] Unexpected error in resolveAdvertiserContext:', err);
    next();
  }
}


/**
 * Middleware to resolve the active merchant account context
 * Checks X-Merchant-Account-Id header or falls back to the user's primary/first account
 */
async function resolveMerchantContext(req, res, next) {
  if (!req.user) return next();

  // Skip if already resolved
  if (req.merchantAccount) return next();

  const headerAccountId = req.headers['x-merchant-account-id'];

  try {
    if (!supabase) {
      // Mock mode
      if (req.user.user_type === 'merchant' || req.user.has_store) {
        req.merchantAccount = {
          id: 'demo-merchant-account-id',
          role: 'owner',
          name: 'Demo Store Account',
          status: 'active'
        };
      }
      return next();
    }

    // Fetch the merchant accounts this user belongs to
    const { data: teamMembers, error } = await supabase
      .from('merchant_team_members')
      .select(`
        merchant_account_id,
        role,
        merchant_accounts (
          id,
          name,
          slug,
          status
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('[Auth] Error fetching merchant team relations:', error);
      return next();
    }

    if (teamMembers && teamMembers.length > 0) {
      let activeMember;

      if (headerAccountId) {
        activeMember = teamMembers.find(m => m.merchant_account_id === headerAccountId);
      }

      if (!activeMember) {
        activeMember = teamMembers[0];
      }

      if (activeMember && activeMember.merchant_accounts) {
        req.merchantAccount = {
          id: activeMember.merchant_account_id,
          role: activeMember.role,
          name: activeMember.merchant_accounts.name,
          slug: activeMember.merchant_accounts.slug,
          status: activeMember.merchant_accounts.status
        };
      }
    }

    next();
  } catch (err) {
    console.error('[Auth] Unexpected error in resolveMerchantContext:', err);
    next();
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || !supabase) {
    return next();
  }

  try {
    // Verify token via Supabase auth API
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) return next();

    const verifiedUserId = authData.user.id;
    const roles = await getUserRoles(verifiedUserId);

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, username, display_name, user_type, points_balance, keys_balance, gems_balance, email_verified')
      .eq('id', verifiedUserId)
      .single();

    if (userData) {
      const role = accountRole(roles, userData.user_type);
      req.user = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        display_name: userData.display_name,
        user_type: role,
        role,
        roles,
        points_balance: userData.points_balance,
        keys_balance: userData.keys_balance,
        gems_balance: userData.gems_balance,
        is_verified: Boolean(userData.email_verified)
      };
    }
    return next();
  } catch (error) {
    console.error('[Auth] Optional auth error:', error.message);
    return next();
  }
}

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const roles = await getTrustedRequestRoles(req);
    if (roles.some((role) => isAdminRole(role))) {
      return next();
    }
  } catch (error) {
    console.error('[Auth] Admin role lookup failed:', error.message);
  }

  return res.status(403).json({ error: 'Admin access required' });
};

const requireCapability = (capability) => async (req, res, next) => {
  if (!Object.values(ADMIN_CAPABILITIES).includes(capability)) {
    return res.status(500).json({ error: 'Unknown administrative capability', code: 'UNKNOWN_CAPABILITY' });
  }
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  try {
    const capabilities = await getTrustedRequestCapabilities(req);
    if (capabilities.has(capability)) return next();
  } catch (error) {
    console.error('[Auth] Capability lookup failed:', error.message);
  }
  return res.status(403).json({
    error: 'You do not have permission to perform this administrative task.',
    code: 'CAPABILITY_REQUIRED',
    required_capability: capability,
  });
};

/**
 * Require platform-management privileges. Moderators intentionally do not pass
 * this guard: they can review and moderate records, but cannot perform arbitrary
 * CRUD, ownership transfers, or other platform-management changes.
 */
const requirePlatformAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const roles = await getUserRoles(req.user.id);
    if (roles.some((role) => PLATFORM_ADMIN_ROLES.includes(role))) {
      req.user.roles = Array.from(new Set([...(req.user.roles || []), ...roles]));
      req.user.role = roles.find((role) => PLATFORM_ADMIN_ROLES.includes(role)) || req.user.role;
      return next();
    }
  } catch (error) {
    console.error('[Auth] Platform admin role lookup failed:', error.message);
  }

  return res.status(403).json({ error: 'Platform admin access required' });
};

const requireMasterAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  try {
    const roles = await getUserRoles(req.user.id);
    if (roles.includes('master_admin')) {
      req.user.roles = Array.from(new Set([...(req.user.roles || []), ...roles]));
      req.user.role = 'master_admin';
      return next();
    }
  } catch (error) {
    console.error('[Auth] Master admin role lookup failed:', error.message);
  }

  return res.status(403).json({ error: 'Master Admin privileges required' });
};

/**
 * Middleware to enforce specific user roles
 * @param {string|string[]} roles - Single role or array of allowed roles
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const userRole = req.user.user_type || req.user.role;

  if (allowedRoles.includes(userRole) || allowedRoles.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied',
    required_role: allowedRoles,
    current_role: userRole
  });
};

module.exports = {
  requireAuth,
  requireAdmin,
  requirePlatformAdmin,
  requireMasterAdmin,
  requireCapability,
  requireRole,
  optionalAuth,
  resolveAdvertiserContext,
  resolveMerchantContext,
  getUserRoles,
  getTrustedRequestRoles,
  getTrustedRequestCapabilities,
};
