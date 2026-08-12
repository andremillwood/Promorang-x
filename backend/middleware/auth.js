const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

// Log environment variable status for debugging
console.log('[Auth] Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('[Auth] Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Missing');
console.log('[Auth] JWT Secret:', jwtSecret ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
  console.error('[Auth] ❌ Required credentials missing; protected routes will reject requests.');
  console.error('[Auth] Make sure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JWT_SECRET are set in your .env file');
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

const DEMO_USER_ID_PREFIXES = ['demo-', 'a0000000', '00000000-0000-'];
const ADMIN_ROLES = ['admin', 'administrator', 'master_admin', 'moderator'];
const PLATFORM_ADMIN_ROLES = ['admin', 'administrator', 'master_admin'];

function isDemoUserId(userId) {
  const value = String(userId || '');
  return DEMO_USER_ID_PREFIXES.some((prefix) => value.startsWith(prefix));
}

async function getUserRoles(userId) {
  if (!supabase || !userId || isDemoUserId(userId)) {
    return [];
  }

  const roles = new Set();

  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('role, user_type')
    .eq('id', userId)
    .maybeSingle();

  if (userError) {
    console.warn('[Auth] Failed to fetch user role:', userError.message);
  }

  if (userRecord?.role) roles.add(userRecord.role);
  if (userRecord?.user_type) roles.add(userRecord.user_type);

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
    // Decode the token to check for demo users first (no verification needed for decode)
    const decoded = jwt.decode(token);

    if (!decoded) {
      console.error('[Auth] ❌ Token could not be decoded');
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const userId = decoded.userId || decoded.id || decoded.sub;

    if (!userId) {
      console.error('[Auth] ❌ Token missing user identifier');
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // Special handling for demo users to bypass database lookups
    const isStateDemo = String(userId).startsWith('a0000000');
    const isSeededDemo = String(userId).startsWith('00000000-0000-');
    
    if (String(userId).startsWith('demo-') || isStateDemo || isSeededDemo) {
      const role = decoded.user_metadata?.role || decoded.user_type || (isSeededDemo ? 'merchant' : 'creator');

      // Map demo IDs to valid UUIDs for database operations
      const DEMO_UUID_MAP = {
        'demo-creator-id': '00000000-0000-0000-0000-000000000001',
        'demo-advertiser-id': '00000000-0000-0000-0000-000000000002',
        'demo-pro-id': '00000000-0000-0000-0000-000000000003',
        'demo-merchant-id': '00000000-0000-0000-0000-000000000004'
      };

      const mappedId = DEMO_UUID_MAP[userId] ||
        (isStateDemo || isSeededDemo ? userId : (DEMO_UUID_MAP[`demo-${role}-id`] || '00000000-0000-0000-0000-00000000ffff'));

      req.user = {
        id: mappedId,
        original_demo_id: userId,
        email: decoded.email || `${role}@demo.com`,
        username: decoded.user_metadata?.username || `demo-${role}`,
        display_name: decoded.display_name || decoded.user_metadata?.full_name || `Demo ${role}`,
        user_type: role,
        role: role,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        is_verified: true,
        token_payload: decoded
      };
      console.log(`[Auth] ✅ Authenticated as Seeding/State Demo User: ${req.user.email} (ID: ${userId})`);
      res.setHeader('X-Auth-Mode', 'demo-bypass');
      return next();
    }

    // 116: Verify the token using Supabase's auth API
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
      
      // DEEP DIAGNOSTIC: Set headers to help pinpoint the issue in the browser console
      res.setHeader('X-Auth-Error', authError?.message || 'Verification failed');
      res.setHeader('X-Auth-Status', authError?.status || 'Unknown');
      
      // Fallback to local signature verification only. Never trust decoded JWTs
      // without signature verification in production.
      try {
        let verified = null;
        if (jwtSecret) {
          try {
            verified = jwt.verify(token, jwtSecret);
            console.log('[Auth] Token verified manually via JWT_SECRET fallback');
          } catch (jwtErr) {
            console.warn('[Auth] Manual JWT signature verification failed:', jwtErr.message);
            res.setHeader('X-Auth-JWT-Error', jwtErr.message);
          }
        }

        if (verified) {
          req.user = {
            id: verified.sub,
            email: verified.email,
            username: verified.user_metadata?.username || verified.email?.split('@')[0] || 'user',
            display_name: verified.user_metadata?.full_name || verified.email?.split('@')[0] || 'User',
            user_type: verified.user_metadata?.user_type || 'regular',
            role: verified.role || verified.user_metadata?.user_type || 'regular',
            is_verified: true,
            token_payload: verified
          };
          return next();
        }
      } catch (recoveryErr) {
        console.error('[Auth] ❌ Recovery Mode failed:', recoveryErr.message);
      }

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

    // Look up the user profile in public.profiles (the UUID-compatible table)
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', verifiedUserId)
      .maybeSingle();

    if (profileError) {
      console.warn('[Auth] ⚠️ Error fetching profile data:', profileError.message);
    }

    // Attach user to request for use in route handlers
    // We prioritize authData.user (the source of truth from Auth service) 
    // and use profileData for supplementary info like username/display_name
    req.user = {
      id: verifiedUserId,
      email: authData.user.email,
      username: profileData?.username || authData.user.email?.split('@')[0] || 'user',
      display_name: profileData?.full_name || authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
      user_type: profileData?.user_type || 'regular',
      role: decoded.role || profileData?.user_type || 'regular',
      points_balance: profileData?.points_balance || 0,
      keys_balance: profileData?.keys_balance || 0,
      gems_balance: profileData?.gems_balance || 0,
      is_verified: !!authData.user.email_confirmed_at,
      token_payload: decoded
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

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded) return next();

    const userId = decoded.userId || decoded.id || decoded.sub;
    if (!userId) return next();

    // Special handling for demo users to bypass database lookups
    const isStateDemo = String(userId).startsWith('a0000000');
    if (String(userId).startsWith('demo-') || isStateDemo) {
      const role = decoded.user_metadata?.role || decoded.user_type || 'creator';
      const DEMO_UUID_MAP = {
        'demo-creator-id': '00000000-0000-0000-0000-000000000001',
        'demo-advertiser-id': '00000000-0000-0000-0000-000000000002',
        'demo-pro-id': '00000000-0000-0000-0000-000000000003'
      };

      const mappedId = DEMO_UUID_MAP[userId] ||
        (isStateDemo ? userId : (DEMO_UUID_MAP[`demo-${role}-id`] || '00000000-0000-0000-0000-00000000ffff'));

      req.user = {
        id: mappedId,
        original_demo_id: userId,
        email: decoded.email || `${role}@demo.com`,
        username: decoded.user_metadata?.username || `demo-${role}`,
        display_name: decoded.display_name || decoded.user_metadata?.full_name || `Demo ${role}`,
        user_type: role,
        role: role,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        is_verified: true,
        token_payload: decoded
      };
      return next();
    }

    // Verify token via Supabase auth API
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) return next();

    const verifiedUserId = authData.user.id;

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, username, display_name, user_type, points_balance, keys_balance, gems_balance, email_verified')
      .eq('id', verifiedUserId)
      .single();

    if (userData) {
      req.user = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        display_name: userData.display_name,
        user_type: userData.user_type,
        role: decoded.role || userData.user_type,
        points_balance: userData.points_balance,
        keys_balance: userData.keys_balance,
        gems_balance: userData.gems_balance,
        is_verified: Boolean(userData.email_verified),
        token_payload: decoded
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

  const tokenRoles = [
    req.user.role,
    req.user.user_type,
    req.user.token_payload?.role,
    req.user.token_payload?.user_role,
    req.user.token_payload?.user_metadata?.role,
    req.user.token_payload?.user_metadata?.user_type
  ].filter(Boolean);

  if (tokenRoles.some((role) => ADMIN_ROLES.includes(role))) {
    return next();
  }

  try {
    const roles = await getUserRoles(req.user.id);
    if (roles.some((role) => ADMIN_ROLES.includes(role))) {
      req.user.roles = Array.from(new Set([...(req.user.roles || []), ...roles]));
      req.user.role = roles.find((role) => ADMIN_ROLES.includes(role)) || req.user.role;
      return next();
    }
  } catch (error) {
    console.error('[Auth] Admin role lookup failed:', error.message);
  }

  return res.status(403).json({ error: 'Admin access required' });
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

  const tokenRoles = [
    req.user.role,
    req.user.user_type,
    ...(req.user.roles || []),
    req.user.token_payload?.role,
    req.user.token_payload?.user_role,
    req.user.token_payload?.user_metadata?.role,
    req.user.token_payload?.user_metadata?.user_type
  ].filter(Boolean);

  if (tokenRoles.some((role) => PLATFORM_ADMIN_ROLES.includes(role))) {
    return next();
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

  const tokenRoles = [
    req.user.role,
    req.user.user_type,
    req.user.token_payload?.role,
    req.user.token_payload?.user_role,
    req.user.token_payload?.user_metadata?.role,
    req.user.token_payload?.user_metadata?.user_type
  ].filter(Boolean);

  if (tokenRoles.includes('master_admin')) {
    return next();
  }

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

module.exports = { requireAuth, requireAdmin, requirePlatformAdmin, requireMasterAdmin, requireRole, optionalAuth, resolveAdvertiserContext, resolveMerchantContext, getUserRoles };
