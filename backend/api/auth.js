const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const jwt = require('jsonwebtoken');
const { Readable } = require('stream');
const { sendWelcomeEmail } = require('../services/resendService');

// Body is already parsed by express.json() in api/index.js

// JWT secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-secret-key-change-in-production';

// Demo accounts for local testing - must match seeded UUIDs in migration
const DEMO_ACCOUNTS = [
  {
    id: '00000000-0000-0000-0000-00000000c001',
    email: 'creator@promorang.co',
    password: 'demo123',
    username: 'demo_creator',
    display_name: 'Demo Creator',
    user_type: 'creator'
  },
  {
    id: '00000000-0000-0000-0000-00000000b001',
    email: 'investor@promorang.co',
    password: 'demo123',
    username: 'demo_investor',
    display_name: 'Demo Investor',
    user_type: 'investor'
  },
  {
    id: '00000000-0000-0000-0000-00000000ad01',
    email: 'advertiser@promorang.co',
    password: 'demo123',
    username: 'demo_advertiser',
    display_name: 'Demo Advertiser',
    user_type: 'advertiser'
  },
  {
    id: '00000000-0000-0000-0000-000000000404',
    email: 'operator@promorang.co',
    password: 'demo123',
    username: 'demo_operator',
    display_name: 'Demo Operator',
    user_type: 'operator'
  },
  {
    id: '00000000-0000-0000-0000-000000000505',
    email: 'merchant@promorang.co',
    password: 'demo123',
    username: 'demo_merchant',
    display_name: 'Demo Merchant',
    user_type: 'merchant'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000100',
    email: 'matrix_demo@promorang.co',
    password: 'demo123',
    username: 'matrix_builder',
    display_name: 'Matrix Builder Demo',
    user_type: 'matrix_builder'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000200',
    email: 'sampling_merchant@promorang.co',
    password: 'demo123',
    username: 'sampling_merchant',
    display_name: 'Sample Coffee Shop',
    user_type: 'advertiser'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000201',
    email: 'active_sampling@promorang.co',
    password: 'demo123',
    username: 'active_sampling',
    display_name: 'Downtown Boutique',
    user_type: 'advertiser'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000202',
    email: 'graduated_merchant@promorang.co',
    password: 'demo123',
    username: 'graduated_merchant',
    display_name: 'Fitness Studio Pro',
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
      user_type: user.user_type,
      onboarding_completed: user.onboarding_completed
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
      // For demo accounts, fetch the seeded user by username
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', demoAccount.username)
        .single();

      if (userError || !user) {
        console.error('Demo user not found in database:', demoAccount.username);
        return res.status(500).json({
          success: false,
          error: 'Demo account not seeded. Please run migrations first.'
        });
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

      // Send welcome email (async, don't block response)
      sendWelcomeEmail(email, display_name || username).catch(err => {
        console.error('Failed to send welcome email:', err);
      });

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

// Demo system health and initialization
router.get('/demo-health', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ success: true, status: 'mock', message: 'Running in mock mode' });
    }

    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('id', DEMO_ACCOUNTS.map(a => a.id));

    if (error) throw error;

    const isReady = count === DEMO_ACCOUNTS.length;
    res.json({
      success: true,
      status: isReady ? 'ready' : 'incomplete',
      count,
      total: DEMO_ACCOUNTS.length,
      missing: DEMO_ACCOUNTS.length - count
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/demo-initialize', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ success: true, message: 'Mock mode: No initialization needed' });
    }

    console.log('Initializing demo environment...');
    const results = [];

    for (const account of DEMO_ACCOUNTS) {
      // Use robust find-or-create logic for each
      const { data: existing } = await supabase.from('users').select('id').eq('id', account.id).maybeSingle();

      if (!existing) {
        // Try deleting by email/username first to avoid unique constraint violations
        await supabase.from('users').delete().or(`email.eq.${account.email},username.eq.${account.username}`);

        const { error } = await supabase.from('users').insert([{
          id: account.id,
          email: account.email,
          username: account.username,
          display_name: account.display_name,
          user_type: account.user_type,
          points_balance: 1000,
          keys_balance: 50,
          gems_balance: 100,
          user_tier: 'free',
          created_at: new Date().toISOString()
        }]);

        results.push({ email: account.email, status: error ? 'failed' : 'created', error: error?.message });
      } else {
        results.push({ email: account.email, status: 'exists' });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Demo initialization failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Demo login endpoints for easy testing
router.post('/demo/:role', async (req, res) => {
  try {
    const role = req.params.role;
    console.log(`Demo login request received for role: ${role}`);

    const roleMap = {
      'creator': 0,
      'investor': 1,
      'advertiser': 2,
      'operator': 3,
      'merchant': 4,
      'matrix': 5,
      'sampling-merchant': 6,
      'active-sampling': 7,
      'graduated-merchant': 8
    };

    const index = roleMap[role];
    if (index === undefined) {
      return res.status(400).json({ success: false, error: 'Invalid demo role' });
    }

    const demoAccount = DEMO_ACCOUNTS[index];

    if (!supabase) {
      const token = generateToken({
        ...demoAccount,
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        gold_collected: 0,
        user_tier: 'free'
      });

      return res.status(200).json({
        success: true,
        user: demoAccount,
        token
      });
    }

    // Standardized robust find-or-create logic
    // 1. Try finding by ID first (most reliable for demo accounts)
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('id', demoAccount.id)
      .maybeSingle();

    // 2. If not found by ID, try email (handles cases where record exists but ID differs)
    if (!user) {
      let { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', demoAccount.email)
        .maybeSingle();

      if (userByEmail) {
        user = userByEmail;
        console.log(`Found existing user by email ${demoAccount.email} with different ID: ${user.id}`);
      }
    }

    // 3. If still not found, create the user with the guaranteed ID
    if (!user) {
      console.log(`Creating new demo user for role ${role} with ID ${demoAccount.id}`);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: demoAccount.id,
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
        console.error(`Failed to create demo user ${role}:`, createError);
        // Last ditch effort: find by username if email check also missed it somehow
        let { data: userByUsername } = await supabase
          .from('users')
          .select('*')
          .eq('username', demoAccount.username)
          .maybeSingle();

        if (userByUsername) {
          user = userByUsername;
        } else {
          return res.status(500).json({
            success: false,
            error: 'Failed to create demo account',
            details: createError.message
          });
        }
      } else {
        user = newUser;
      }
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user,
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

// Logout (does not require auth header; frontends may just clear cookies/tokens)
router.post('/logout', (req, res) => {
  // In a real implementation, tokens could be revoked/blacklisted.
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
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

// Demo Matrix Builder login - for MLM dashboard testing
router.post('/demo/matrix', async (req, res) => {
  try {
    const demoAccount = DEMO_ACCOUNTS[5]; // matrix_builder account

    if (!supabase) {
      const demoToken = generateToken({
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type,
        points_balance: 15000,
        keys_balance: 250,
        gems_balance: 500,
        gold_collected: 1200,
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
          id: demoAccount.id,
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 15000,
          keys_balance: 250,
          gems_balance: 500,
          gold_collected: 1200,
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
          id: demoAccount.id,
          email: demoAccount.email,
          username: demoAccount.username,
          display_name: demoAccount.display_name,
          user_type: demoAccount.user_type,
          points_balance: 15000,
          keys_balance: 250,
          gems_balance: 500,
          gold_collected: 1200,
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
    console.error('Demo Matrix login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Demo login failed'
    });
  }
});

// Demo Sampling Merchant login
router.post('/demo/sampling-merchant', async (req, res) => {
  try {
    const demoAccount = DEMO_ACCOUNTS[6]; // sampling_merchant

    if (!supabase) {
      const token = generateToken({
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type
      });
      return res.json({ success: true, user: demoAccount, token });
    }

    let { data: user, error } = await supabase.from('users').select('*').eq('email', demoAccount.email).single();
    if (error || !user) {
      const { data: newUser } = await supabase.from('users').insert([{
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type
      }]).select().single();
      user = newUser;
    }

    const token = generateToken(user);
    return res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Demo login failed' });
  }
});

// Demo Active Sampling login
router.post('/demo/active-sampling', async (req, res) => {
  try {
    const demoAccount = DEMO_ACCOUNTS[7]; // active_sampling

    if (!supabase) {
      const token = generateToken({
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type
      });
      return res.json({ success: true, user: demoAccount, token });
    }

    let { data: user, error } = await supabase.from('users').select('*').eq('email', demoAccount.email).single();
    if (error || !user) {
      const { data: newUser } = await supabase.from('users').insert([{
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type
      }]).select().single();
      user = newUser;
    }

    const token = generateToken(user);
    return res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Demo login failed' });
  }
});

// Demo Graduated Merchant login
router.post('/demo/graduated-merchant', async (req, res) => {
  try {
    const demoAccount = DEMO_ACCOUNTS[8]; // graduated_merchant

    if (!supabase) {
      const token = generateToken({
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type
      });
      return res.json({ success: true, user: demoAccount, token });
    }

    let { data: user, error } = await supabase.from('users').select('*').eq('email', demoAccount.email).single();
    if (error || !user) {
      const { data: newUser } = await supabase.from('users').insert([{
        id: demoAccount.id,
        email: demoAccount.email,
        username: demoAccount.username,
        display_name: demoAccount.display_name,
        user_type: demoAccount.user_type
      }]).select().single();
      user = newUser;
    }

    const token = generateToken(user);
    return res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Demo login failed' });
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
