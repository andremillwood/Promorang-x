import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { supabaseAdmin } from './supabase';

// JWT verification options
const JWT_OPTIONS: jwt.VerifyOptions = {
  algorithms: ['HS256'],
  ignoreExpiration: false,
};


/**
 * Middleware to verify JWT token and attach user to request
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', JWT_OPTIONS) as jwt.JwtPayload;
    
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.sub)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
}

/**
 * Middleware to check if user has required roles
 */
export function requireRole(roles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const userRoles = Array.isArray(req.user.role) 
      ? req.user.role 
      : req.user.role ? [req.user.role] : [];
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Middleware for demo account protection
 */
export function checkDemoAccess(req: Request, res: Response, next: NextFunction) {
  // Skip check if demo logins are enabled or if we're in development
  if (process.env.DEMO_LOGINS_ENABLED === 'true' || process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Get the IP address from the request
  const ip = req.ip || 
             req.socket.remoteAddress ||
             (req.connection && req.connection.remoteAddress) ||
             '';

  // Add IP-based access control here if needed
  // Example: Allow specific IPs to access demo endpoints
  const allowedIps = process.env.DEMO_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
  
  if (allowedIps.includes(ip)) {
    return next();
  }

  // For demo endpoints, check if the request is coming from an allowed origin
  const origin = req.get('origin');
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  if (origin && allowedOrigins.includes(origin)) {
    return next();
  }

  // If none of the checks pass, deny access
  return res.status(403).json({
    success: false,
    error: 'Demo access is restricted',
  });
}
