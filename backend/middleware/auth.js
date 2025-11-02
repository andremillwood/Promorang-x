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

    // Then verify with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('[Auth] ❌ Supabase token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
        details: error.message
      });
    }

    if (!data?.user) {
      console.error('[Auth] ❌ No user data found in token');
      return res.status(401).json({
        success: false,
        error: 'Invalid user data in token',
        code: 'INVALID_USER_DATA'
      });
    }

    // Verify the token hasn't been revoked
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('[Auth] ❌ Session verification failed:', sessionError?.message);
      return res.status(401).json({
        success: false,
        error: 'Session verification failed',
        code: 'SESSION_VERIFICATION_FAILED',
        details: sessionError?.message
      });
    }

    // Attach user to request for use in route handlers
    req.user = {
      ...data.user,
      // Include any additional user data you need
      role: data.user.user_metadata?.role,
      is_verified: data.user.confirmed_at !== null
    };
    
    console.log(`[Auth] ✅ Authenticated as user: ${data.user.email || data.user.id}`);
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
