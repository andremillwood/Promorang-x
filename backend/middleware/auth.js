const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.SUPABASE_URL;
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
    // First, verify the JWT signature
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded) {
      console.error('[Auth] ❌ Invalid token signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid token signature',
        code: 'INVALID_TOKEN_SIGNATURE'
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
    if (String(userId).startsWith('demo-') || isStateDemo) {
      const role = decoded.user_metadata?.role || decoded.user_type || 'creator';

      // Map demo IDs to valid UUIDs for database operations
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
        username: decoded.username || decoded.user_metadata?.username || `demo-${role}`,
        display_name: decoded.display_name || decoded.user_metadata?.full_name || `Demo ${role}`,
        user_type: role,
        role: role,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        is_verified: true,
        token_payload: decoded
      };
      console.log(`[Auth] ✅ Authenticated as Demo User: ${req.user.email} (ID: ${userId})`);
      return next();
    }

    // Look up the user record using the service role key
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username, display_name, user_type, points_balance, keys_balance, gems_balance, email_verified')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[Auth] ❌ Failed to load user for token:', userError?.message || 'No user found');
      return res.status(401).json({
        success: false,
        error: 'User not found for token',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request for use in route handlers
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

    console.log(`[Auth] ✅ Authenticated as user: ${userData.email || userData.id}`);
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
    const decoded = jwt.verify(token, jwtSecret);
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

    const { data: userData } = await supabase
      .from('users')
      .select('id, email, username, display_name, user_type, points_balance, keys_balance, gems_balance, email_verified')
      .eq('id', userId)
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
    return next(); // Proceed even if user data not found, req.user will be undefined
  } catch (error) {
    console.error('[Auth] Optional auth error:', error.message);
    return next(); // Proceed even if token verification fails, req.user will be undefined
  }
}

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Development Bypass (Optional: strict mode can disable this)
  if (process.env.NODE_ENV === 'development') {
    // In dev, let everyone pass for now unless checking specific role logic
    // OR enforce roles even in dev if we want to test RBAC properly.
    // Let's enforce it now that we have role support.
    // If mocking, we assume req.user is populated by some mock logic or earlier middleware.

    // Fallback for demo emails if DB lookup failed to populate role
    const adminEmails = ['andremillwood@gmail.com', 'admin@promorang.com'];
    if (adminEmails.includes(req.user.email)) {
      return next();
    }
  }

  // Check role from DB (assuming populated in req.user by requireAuth)
  const allowedRoles = ['admin', 'master_admin', 'moderator']; // Moderators can access admin panel views
  if (allowedRoles.includes(req.user.role || 'user')) {
    return next();
  }

  // Specific fallback for Master Admin email if role missing
  if (req.user.email === 'andremillwood@gmail.com') return next();

  return res.status(403).json({ error: 'Admin access required' });
};

const requireMasterAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  // HARDCODED MASTER ADMIN
  if (req.user.email === 'andremillwood@gmail.com') {
    return next();
  }

  if (req.user.role === 'master_admin') {
    return next();
  }

  return res.status(403).json({ error: 'Master Admin privileges required' });
};

module.exports = { requireAuth, requireAdmin, requireMasterAdmin, optionalAuth, resolveAdvertiserContext, resolveMerchantContext };
