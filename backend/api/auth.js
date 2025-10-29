const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const jwt = require('jsonwebtoken');

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
  }
];

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      user_type: user.user_type
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  try {
    // For development mode without Supabase, use mock user data
    if (!supabase) {
      // Create mock user based on token data
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        display_name: decoded.display_name || decoded.username,
        user_type: decoded.user_type,
        points_balance: decoded.points_balance || 0,
        keys_balance: decoded.keys_balance || 0,
        gems_balance: decoded.gems_balance || 0,
        gold_collected: decoded.gold_collected || 0,
        user_tier: decoded.user_tier || 'free',
        avatar_url: decoded.avatar_url
      };
      return next();
    }

    // Get user data from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

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
router.post('/demo/creator', async (req, res) => {
  try {
    if (!supabase) {
      // Fallback when Supabase is not available
      const demoAccount = DEMO_ACCOUNTS[0];
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

      return res.json({
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

    const demoAccount = DEMO_ACCOUNTS[0];

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
      const token = generateToken({
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
        token
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
      const token = generateToken({
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
        token
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

module.exports = router;
