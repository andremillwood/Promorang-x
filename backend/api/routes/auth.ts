import { Router, urlencoded, json } from 'express';
import { authService } from '../../src/auth/service';
import { requireAuth } from '../_core/auth';
import { z } from 'zod';

const router = Router();

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Logout route
router.post('/api/auth/logout', requireAuth, async (req, res) => {
  try {
    const bodyRefreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
    const headerRefreshToken = typeof req.headers['x-refresh-token'] === 'string' ? req.headers['x-refresh-token'] : undefined;
    const cookieRefreshToken = typeof (req as any).cookies?.refreshToken === 'string' ? (req as any).cookies.refreshToken : undefined;

    const refreshToken = bodyRefreshToken || headerRefreshToken || cookieRefreshToken;

    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (logoutError) {
        console.warn('Refresh token cleanup failed during logout:', logoutError);
      }
    }

    res.clearCookie?.('auth_token');
    res.clearCookie?.('refreshToken');

    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, error: 'Failed to log out' });
  }
});

// Handle both JSON and form-urlencoded data
router.use(urlencoded({ extended: true }));
router.use(json());

// Login route
router.post('/api/auth/login', async (req, res) => {
  console.log('Login request received:', {
    contentType: req.headers['content-type'],
    body: req.body,
    rawBody: (req as any).rawBody?.toString()
  });

  try {
    // Handle different content types
    let email, password;
    
    if (req.is('application/json')) {
      const data = loginSchema.parse(req.body);
      email = data.email;
      password = data.password;
    } else if (req.is('application/x-www-form-urlencoded')) {
      const data = loginSchema.parse(req.body);
      email = data.email;
      password = data.password;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be application/json or application/x-www-form-urlencoded'
      });
    }

    console.log('Attempting login for email:', email);
    
    const { user, token, refreshToken } = await authService.login(email, password);
    
    console.log('Login successful for user:', user.id);
    
    return res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
});

export default router;
