import { Hono } from 'hono';
import { z } from 'zod';
import { authService } from '../auth/service';
import { authMiddleware } from '../auth/middleware';
import { getCookie, setCookie } from 'hono/cookie';

const authRouter = new Hono();

// Input validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30),
  display_name: z.string().optional(),
  user_type: z.enum(['user', 'creator', 'investor', 'advertiser']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Signup route
authRouter.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const data = signupSchema.parse(body);
    
    const { user, token } = await authService.register(data);
    
    return c.json({
      success: true,
      token,
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
    console.error('Signup error:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 400 }
    );
  }
});

// Login route
authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);
    
    const { user, token } = await authService.login(email, password);
    
    return c.json({
      success: true,
      token,
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
    console.error('Login error:', error);
    return c.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  }
});

// Get current user
authRouter.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const user = await authService.getCurrentUser(userId);
    return c.json({ success: true, user });
  } catch (error) {
    console.error('Get current user error:', error);
    return c.json(
      { success: false, error: 'Failed to get user data' },
      { status: 401 }
    );
  }
});

// Logout
authRouter.post('/logout', authMiddleware, async (c) => {
  try {
    const refreshToken = getCookie(c, 'refreshToken');
    if (refreshToken) {
      await authService.logout(refreshToken);
      // Clear cookies
      setCookie(c, 'refreshToken', '', { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0)
      });
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json(
      { success: false, error: 'Failed to log out' },
      { status: 500 }
    );
  }
});

// Refresh token
authRouter.post('/refresh', async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    if (!refreshToken) {
      return c.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const tokens = await authService.refreshTokens(refreshToken);
    
    // Set refresh token as HTTP-only cookie
    setCookie(c, 'refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return c.json({
      success: true,
      token: tokens.token,
      user: tokens.user
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json(
      { success: false, error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
});

// Request password reset
authRouter.post('/request-password-reset', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    await authService.requestPasswordReset(email);
    return c.json({ success: true });
  } catch (error) {
    console.error('Request password reset error:', error);
    return c.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
});

// Reset password
authRouter.post('/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    if (!token || !newPassword) {
      return c.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    await authService.resetPassword(token, newPassword);
    return c.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: 400 }
    );
  }
});

// Update user
authRouter.put('/user', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const updateData = await c.req.json();
    
    const updatedUser = await authService.updateUser(userId, updateData);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return c.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user' 
      },
      { status: 400 }
    );
  }
});

export { authRouter };
