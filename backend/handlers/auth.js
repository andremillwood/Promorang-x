const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const { Readable } = require('stream');

// Custom body parser middleware to handle raw body
const rawBodyMiddleware = (req, res, next) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    try {
      if (data) {
        req.rawBody = data;
        req.body = data ? JSON.parse(data) : {};
      }
      next();
    } catch (error) {
      console.error('Error parsing request body:', error);
      req.body = {};
      next();
    }
  });
};

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Demo accounts for local testing
const DEMO_ACCOUNTS = [
  {
    email: 'creator@demo.com',
    password: 'demo123',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator'
  },
  {
    email: 'investor@demo.com',
    password: 'demo123',
    username: 'demo_investor',
    display_name: 'Demo Investor',
    user_type: 'investor'
  },
  {
    email: 'advertiser@demo.com',
    password: 'demo123',
    username: 'demo_advertiser',
    display_name: 'Demo Advertiser',
    user_type: 'advertiser'
  },
  {
    email: 'operator@demo.com',
    password: 'demo123',
    username: 'demo_operator',
    display_name: 'Demo Operator',
    user_type: 'operator'
  },
  {
    email: 'merchant@demo.com',
    password: 'demo123',
    username: 'demo_merchant',
    display_name: 'Demo Merchant',
    user_type: 'merchant'
  }
];

const { generateToken, verifyToken, authMiddleware } = require('../lib/auth');

// Email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if it's a demo account
    const demoAccount = DEMO_ACCOUNTS.find(account => account.email === email && account.password === password);

    if (demoAccount) {
      // For demo accounts, create or get the user
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        // Create demo user if doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: demoAccount.email,
            username: demoAccount.username,
            display_name: demoAccount.display_name,
            user_type: demoAccount.user_type,
            points_balance: 1000,
            keys_balance: 50,
            gems_balance: 100,
            gold_collected: 0,
            user_tier: 'free',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating demo user:', createError);
          return res.status(500).json({
            success: false,
            error: 'Failed to create demo account'
          });
        }

        user = newUser;
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          display_name: user.display_name,
          user_type: user.user_type,
          points_balance: user.points_balance,
          keys_balance: user.keys_balance,
          gems_balance: user.gems_balance,
          gold_collected: user.gold_collected,
          user_tier: user.user_tier,
          avatar_url: user.avatar_url
        },
        token
      });
    }

    // For production: use Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      // Get user profile data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to get user profile'
        });
      }

      const token = generateToken(user || data.user);

      return res.json({
        success: true,
        user: {
          id: user?.id || data.user.id,
          email: data.user.email,
          username: user?.username,
          display_name: user?.display_name,
          user_type: user?.user_type || 'creator',
          points_balance: user?.points_balance || 0,
          keys_balance: user?.keys_balance || 0,
          gems_balance: user?.gems_balance || 0,
          gold_collected: user?.gold_collected || 0,
          user_tier: user?.user_tier || 'free',
          avatar_url: user?.avatar_url
        },
        token
      });
    }

    // Fallback for development without Supabase
    return res.status(400).json({
      success: false,
      error: 'Authentication service not available'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Email/password registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, display_name } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and username are required'
      });
    }

    // For production: use Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: display_name || username,
            user_type: 'creator'
          }
        }
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email,
          username,
          display_name: display_name || username,
          user_type: 'creator',
          points_balance: 100,
          keys_balance: 10,
          gems_balance: 0,
          gold_collected: 0,
          user_tier: 'free'
        }]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      const token = generateToken(data.user);

      return res.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          username,
          display_name: display_name || username,
          user_type: 'creator',
          points_balance: 100,
          keys_balance: 10,
          gems_balance: 0,
          gold_collected: 0,
          user_tier: 'free'
        },
        token,
        message: 'Registration successful'
      });
    }

    // Fallback for development without Supabase
    return res.status(400).json({
      success: false,
      error: 'Registration service not available'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Google OAuth callback
router.post('/oauth/google', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'Access token required'
      });
    }

    if (supabase) {
      // Verify the Google token and get user info
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
        }
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        auth_url: data.url
      });
    }

    // Fallback for development
    return res.status(400).json({
      success: false,
      error: 'OAuth service not available'
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return res.status(500).json({
      success: false,
      error: 'OAuth authentication failed'
    });
  }
});

// Get Google OAuth URL
router.get('/oauth/google/url', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
        }
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        auth_url: data.url
      });
    }

    // Fallback for development
    return res.json({
      success: true,
      auth_url: '#demo-oauth'
    });

  } catch (error) {
    console.error('OAuth URL error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get OAuth URL'
    });
  }
});

// Demo login endpoints for easy testing
router.post('/demo/creator', rawBodyMiddleware, async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Demo creator login request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
      process.env.LOCAL_DEV_URL
    ].filter(Boolean);

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    const demoAccount = DEMO_ACCOUNTS[0];

    if (!supabase) {
      const token = generateToken({
        id: 'demo-creator-id',
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        gold_collected: 0,
        user_tier: 'free'
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        user: {
          id: 'demo-creator-id',
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 1000,
          keys_balance: 50,
          gems_balance: 100,
          gold_collected: 0,
          user_tier: 'free'
        },
        token
      });
    }

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', demoAccount.email)
      .single();

    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 1000,
          keys_balance: 50,
          gems_balance: 100,
          gold_collected: 0,
          user_tier: 'free',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create demo account'
        });
      }

      user = newUser;
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        gold_collected: user.gold_collected,
        user_tier: user.user_tier,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Demo login failed'
    });
  }
});

router.post('/demo/investor', async (req, res) => {
  try {
    if (!supabase) {
      // Fallback when Supabase is not available
      const demoAccount = DEMO_ACCOUNTS[1];
      const demoToken = generateToken({
        id: 'demo-investor-id',
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 5000,
        keys_balance: 200,
        gems_balance: 500,
        gold_collected: 25,
        user_tier: 'premium'
      });

      res.cookie('auth_token', demoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        user: {
          id: 'demo-investor-id',
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 5000,
          keys_balance: 200,
          gems_balance: 500,
          gold_collected: 25,
          user_tier: 'premium'
        },
        token: demoToken
      });
    }

    const demoAccount = DEMO_ACCOUNTS[1];

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', demoAccount.email)
      .single();

    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 5000,
          keys_balance: 200,
          gems_balance: 500,
          gold_collected: 25,
          user_tier: 'premium',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create demo account'
        });
      }

      user = newUser;
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        gold_collected: user.gold_collected,
        user_tier: user.user_tier,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Demo login failed'
    });
  }
});

router.post('/demo/advertiser', async (req, res) => {
  try {
    if (!supabase) {
      // Fallback when Supabase is not available
      const demoAccount = DEMO_ACCOUNTS[2];
      const demoToken = generateToken({
        id: 'demo-advertiser-id',
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 10000,
        keys_balance: 1000,
        gems_balance: 2000,
        gold_collected: 100,
        user_tier: 'super'
      });

      res.cookie('auth_token', demoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        user: {
          id: 'demo-advertiser-id',
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 10000,
          keys_balance: 1000,
          gems_balance: 2000,
          gold_collected: 100,
          user_tier: 'super'
        },
        token: demoToken
      });
    }

    const demoAccount = DEMO_ACCOUNTS[2];

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', demoAccount.email)
      .single();

    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 10000,
          keys_balance: 1000,
          gems_balance: 2000,
          gold_collected: 100,
          user_tier: 'super',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create demo account'
        });
      }

      user = newUser;
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        gold_collected: user.gold_collected,
        user_tier: user.user_tier,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Demo login failed'
    });
  }
});

// Demo operator login
router.post('/demo/operator', async (req, res) => {
  try {
    const demoAccount = DEMO_ACCOUNTS[3]; // operator account

    if (!supabase) {
      const demoToken = generateToken({
        id: 'demo-operator-id',
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 8000,
        keys_balance: 500,
        gems_balance: 1500,
        gold_collected: 75,
        user_tier: 'premium'
      });

      res.cookie('auth_token', demoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        user: {
          id: 'demo-operator-id',
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 8000,
          keys_balance: 500,
          gems_balance: 1500,
          gold_collected: 75,
          user_tier: 'premium'
        },
        token: demoToken
      });
    }

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', demoAccount.email)
      .single();

    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 8000,
          keys_balance: 500,
          gems_balance: 1500,
          gold_collected: 75,
          user_tier: 'premium',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create demo account'
        });
      }

      user = newUser;
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        gold_collected: user.gold_collected,
        user_tier: user.user_tier,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Demo login failed'
    });
  }
});

// Demo merchant login
router.post('/demo/merchant', async (req, res) => {
  try {
    const demoAccount = DEMO_ACCOUNTS[4]; // merchant account

    if (!supabase) {
      const demoToken = generateToken({
        id: 'demo-merchant-id',
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 3000,
        keys_balance: 100,
        gems_balance: 500,
        gold_collected: 50,
        user_tier: 'premium'
      });

      res.cookie('auth_token', demoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        user: {
          id: 'demo-merchant-id',
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 3000,
          keys_balance: 100,
          gems_balance: 500,
          gold_collected: 50,
          user_tier: 'premium'
        },
        token: demoToken
      });
    }

    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', demoAccount.email)
      .single();

    if (userError || !user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 3000,
          keys_balance: 100,
          gems_balance: 500,
          gold_collected: 50,
          user_tier: 'premium',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create demo account'
        });
      }

      user = newUser;
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        user_type: user.user_type,
        points_balance: user.points_balance,
        keys_balance: user.keys_balance,
        gems_balance: user.gems_balance,
        gold_collected: user.gold_collected,
        user_tier: user.user_tier,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Demo login failed'
    });
  }
});

// Forgot password - initiate password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!supabase) {
      // Demo mode - just acknowledge
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Use Supabase password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      // Don't reveal if email exists or not for security
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { password, token: resetToken } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'New password is required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    if (!supabase) {
      return res.json({
        success: true,
        message: 'Password reset successful (demo mode)'
      });
    }

    // Update password via Supabase
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('Password update error:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to reset password. The reset link may have expired.'
      });
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Current token required'
      });
    }

    const currentToken = authHeader.substring(7);
    let decoded;

    try {
      // Allow expired tokens for refresh (within 30 days)
      decoded = jwt.verify(currentToken, JWT_SECRET, { ignoreExpiration: true });

      // Check if token is too old (> 30 days since issued)
      const issuedAt = decoded.iat * 1000;
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      if (issuedAt < thirtyDaysAgo) {
        return res.status(401).json({
          success: false,
          error: 'Token too old to refresh, please login again'
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get fresh user data
    let userData = decoded;

    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (!error && user) {
        userData = user;
      }
    }

    // Generate new token
    const newToken = generateToken(userData);

    res.json({
      success: true,
      token: newToken,
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        display_name: userData.display_name,
        user_type: userData.user_type,
        points_balance: userData.points_balance || 0,
        keys_balance: userData.keys_balance || 0,
        gems_balance: userData.gems_balance || 0,
        gold_collected: userData.gold_collected || 0,
        user_tier: userData.user_tier || 'free',
        avatar_url: userData.avatar_url
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

// Verify email (stub for email verification flow)
router.post('/verify-email', async (req, res) => {
  try {
    const { token: verificationToken } = req.body;

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        error: 'Verification token required'
      });
    }

    if (!supabase) {
      return res.json({
        success: true,
        message: 'Email verified successfully (demo mode)'
      });
    }

    // In production, Supabase handles email verification automatically
    // This endpoint is for custom verification flows
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!supabase) {
      return res.json({
        success: true,
        message: 'Verification email sent (demo mode)'
      });
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) {
      console.error('Resend verification error:', error);
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a verification email has been sent.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
});

// Protected routes - require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/profile', (req, res) => {
  if (!supabase) {
    // Fallback when Supabase is not available - use the user data from the JWT token
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        display_name: req.user.display_name || req.user.username,
        user_type: req.user.user_type,
        points_balance: req.user.points_balance || 0,
        keys_balance: req.user.keys_balance || 0,
        gems_balance: req.user.gems_balance || 0,
        gold_collected: req.user.gold_collected || 0,
        user_tier: req.user.user_tier || 'free',
        avatar_url: req.user.avatar_url
      }
    });
  }

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      display_name: req.user.display_name,
      user_type: req.user.user_type,
      points_balance: req.user.points_balance,
      keys_balance: req.user.keys_balance,
      gems_balance: req.user.gems_balance,
      gold_collected: req.user.gold_collected,
      user_tier: req.user.user_tier,
      avatar_url: req.user.avatar_url,
      created_at: req.user.created_at
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  // For now, just return success
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user's profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // If this is one of our demo accounts, return the seeded profile without touching Supabase.
    const demoAccount = DEMO_ACCOUNTS.find(account => account.email === decoded.email);
    if (demoAccount) {
      return res.json({
        success: true,
        user: {
          id: decoded.id || `demo-${demoAccount.user_type}-id`,
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: decoded.points_balance || 1000,
          keys_balance: decoded.keys_balance || 50,
          gems_balance: decoded.gems_balance || 100,
          gold_collected: decoded.gold_collected || 0,
          user_tier: decoded.user_tier || 'free',
          avatar_url: decoded.avatar_url || null
        }
      });
    }

    if (!supabase) {
      // Return mock user data in development if Supabase isn't available
      return res.json({
        success: true,
        user: {
          id: decoded.id || 'demo-user-id',
          email: decoded.email || 'demo@example.com',
          username: 'demo_user',
          display_name: 'Demo User',
          user_type: 'demo',
          points_balance: 1000,
          keys_balance: 50,
          gems_balance: 100,
          gold_collected: 0,
          user_tier: 'free',
          avatar_url: null
        }
      });
    }

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return user data without sensitive information
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Me endpoint error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
