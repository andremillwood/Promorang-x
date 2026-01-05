import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { config } from '../config';

declare module 'hono' {
  interface ContextVariableMap {
    user: any;
  }
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/health',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout'
];

export const authMiddleware = async (c: Context, next: Next) => {
  // Skip auth for public routes
  if (PUBLIC_ROUTES.some((route: string) => c.req.path.endsWith(route))) {
    return next();
  }

  // Get token from Authorization header
  const authHeader = c.req.header('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const payload = await verify(token, config.jwtSecret);
    
    // Set user in context
    c.set('user', payload);
    
    // Check if token is about to expire (within 15 minutes)
    if (payload.exp && (payload.exp * 1000 - Date.now() < 15 * 60 * 1000)) {
      // Set header to indicate token needs refresh
      c.header('X-Token-Expiring-Soon', 'true');
    }
    
    return await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    
    // Handle token expiration specifically
    if (error instanceof Error && error.name === 'JwtTokenExpired') {
      return c.json(
        { 
          success: false, 
          error: 'Token expired', 
          code: 'TOKEN_EXPIRED' 
        },
        401
      );
    }
    
    return c.json(
      { 
        success: false, 
        error: 'Invalid or expired token', 
        code: 'INVALID_TOKEN' 
      },
      401
    );
  }
};

// Middleware to require authentication
export const requireAuth = () => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }, 
        401
      );
    }
    return next();
  };
};
