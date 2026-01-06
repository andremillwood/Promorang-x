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
    if (String(userId).startsWith('demo-')) {
      const role = decoded.user_metadata?.role || 'creator';
      req.user = {
        id: userId,
        email: decoded.email || `${role}@demo.com`,
        username: decoded.user_metadata?.username || `demo-${role}`,
        display_name: decoded.user_metadata?.full_name || `Demo ${role}`,
        user_type: role,
        role: role,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        is_verified: true,
        token_payload: decoded
      };
      console.log(`[Auth] ✅ Authenticated as Demo User: ${req.user.email}`);
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

module.exports = { requireAuth };
