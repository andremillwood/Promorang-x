const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const jwt = require('jsonwebtoken');

const DEFAULT_CACHE_TTL_MS = Number(process.env.API_CACHE_TTL_MS || 15000);
const cacheStore = new Map();

const getCachedValue = async (key, fetcher, ttl = DEFAULT_CACHE_TTL_MS) => {
  const now = Date.now();
  const cached = cacheStore.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await fetcher();
  if (value !== undefined) {
    cacheStore.set(key, {
      value,
      expiresAt: now + ttl
    });
  }
  return value;
};

const invalidateCache = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const createDemoWallet = (userId, balance = 0) => ({
  id: `demo-wallet-${userId}`,
  user_id: userId,
  currency_type: 'usd',
  balance,
  is_primary: true,
  payment_method: 'stripe',
  payment_details: { card_last_four: '4242', card_brand: 'visa' },
  created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString()
});

const createDemoTransaction = (userId, overrides = {}) => ({
  id: `demo-transaction-${Date.now()}`,
  user_id: userId,
  transaction_type: 'reward',
  amount: 25.0,
  currency_type: 'points',
  status: 'completed',
  description: 'Demo engagement reward',
  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  ...overrides
});

const MOCK_UPGRADE_COSTS = {
  free: {
    premium: { points: 7500, gems: 200 },
    super: { points: 15000, gems: 450 }
  },
  premium: {
    super: { points: 9000, gems: 275 }
  },
  super: {}
};

const createDemoUserForecast = (userId, overrides = {}) => ({
  id: `demo-user-forecast-${Date.now()}`,
  forecast_id: overrides.forecast_id || 101,
  prediction_amount: overrides.prediction_amount ?? 50,
  prediction_side: overrides.prediction_side || 'over',
  potential_payout: overrides.potential_payout ?? 95,
  actual_payout: overrides.actual_payout ?? null,
  status: overrides.status || 'active',
  forecast_type: overrides.forecast_type || 'views',
  target_value: overrides.target_value ?? 15000,
  current_value: overrides.current_value ?? 9200,
  platform: overrides.platform || 'instagram',
  content_url: overrides.content_url || 'https://instagram.com/p/demo123',
  expires_at: overrides.expires_at || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  forecast_status: overrides.forecast_status || 'active',
  result: overrides.result || null,
  creator_name: overrides.creator_name || 'Demo Creator',
  created_at: overrides.created_at || new Date().toISOString(),
});

const createDemoCreatedForecast = (userId, overrides = {}) => ({
  id: overrides.id || 201,
  creator_id: userId,
  creator_name: overrides.creator_name || 'Demo Creator',
  creator_avatar: overrides.creator_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo-creator',
  platform: overrides.platform || 'youtube',
  content_url: overrides.content_url || 'https://youtube.com/watch?v=demo456',
  content_title: overrides.content_title || 'Behind the scenes vlog',
  forecast_type: overrides.forecast_type || 'views',
  target_value: overrides.target_value ?? 50000,
  current_value: overrides.current_value ?? 22500,
  odds: overrides.odds ?? 1.9,
  pool_size: overrides.pool_size ?? 320.75,
  creator_initial_amount: overrides.creator_initial_amount ?? 75,
  creator_side: overrides.creator_side || 'over',
  expires_at: overrides.expires_at || new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
  status: overrides.status || 'active',
  created_at: overrides.created_at || new Date().toISOString(),
});

const {
  ensureUserProfile,
  updateUserProfile,
  getUserProfile,
} = require('./mockStore');

const fetchWalletsForUser = async (userId) => {
  if (!userId) {
    return [createDemoWallet('demo', 0)];
  }

  return getCachedValue(`users:${userId}:wallets`, async () => {
    if (!supabase || process.env.USE_DEMO_WALLETS === 'true') {
      return [createDemoWallet(userId, 250.75)];
    }

    const queryStart = Date.now();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const durationMs = Date.now() - queryStart;
    if (durationMs > 250) {
      console.log(`[users:wallets:${userId}] Supabase query took ${durationMs}ms`);
    }

    if (error) {
      console.error('Database error fetching wallets:', error);
      return [createDemoWallet(userId, 250.75)];
    }

    if (!data || data.length === 0) {
      return [createDemoWallet(userId, 0)];
    }

    return data;
  });
};

const fetchTransactionsForUser = async (userId) => {
  if (!userId) {
    return [createDemoTransaction('demo')];
  }

  return getCachedValue(`users:${userId}:transactions`, async () => {
    if (!supabase || process.env.USE_DEMO_TRANSACTIONS === 'true') {
      return [createDemoTransaction(userId, { amount: 50 })];
    }

    const queryStart = Date.now();
    const { data, error } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    const durationMs = Date.now() - queryStart;
    if (durationMs > 250) {
      console.log(`[users:transactions:${userId}] Supabase query took ${durationMs}ms`);
    }

    if (!error && data) {
      // Map to frontend expected format if needed
      return data.map(tx => ({
        ...tx,
        currency_type: tx.currency, // Map 'currency' to 'currency_type'
        status: 'completed' // Assume completed
      }));
    }

    if (error) {
      console.error('Database error fetching transactions:', error);
      return [createDemoTransaction(userId)];
    }

    return data || [];
  });
};

const generateToken = (user) => {
  const payload = {
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
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware - extract user from JWT token or use mock for development
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = decodeToken(token);
      if (decoded) {
        // Map userId or sub to id for compatibility
        req.user = {
          ...decoded,
          id: decoded.userId || decoded.id || decoded.sub
        };
        return next();
      }
    }

    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'demo-creator-id',
        email: 'creator@demo.com',
        username: 'demo_creator',
        display_name: 'Demo Creator',
        user_type: 'creator',
        points_balance: 1000,
        keys_balance: 50,
        gems_balance: 100,
        gold_collected: 0,
        user_tier: 'free'
      };
      return next();
    }

    return res.status(401).json({ success: false, error: 'Unauthorized' });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

// Public profile routes (no auth required)
router.get('/public/:username', async (req, res) => {
  const rawUsername = req.params.username || '';
  const decodedUsername = decodeURIComponent(rawUsername).trim();
  const slug = decodedUsername
    ? decodedUsername.toLowerCase().trim().replace(/[^a-z0-9\s_-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^[-_]+|[-_]+$/g, '')
    : 'demo-user';


  const buildFallbackProfile = () => {
    const profile = ensureUserProfile({
      id: `public-${slug}`,
      username: slug,
      display_name: decodedUsername || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      bio: 'This creator profile is using demo data. Connect Supabase to replace with live stats.',
      website_url: 'https://promorang.co',
      user_type: 'creator',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(slug)}`,
      follower_count: 1200,
      following_count: 320,
      points_balance: 12345,
      gems_balance: 250,
      keys_balance: 12,
    });

    return res.json({
      success: true,
      fallback: true,
      user: profile,
      content: [],
      drops: [],
      leaderboard_position: null
    });
  };

  if (!decodedUsername) {
    return buildFallbackProfile();
  }

  try {
    if (!supabase) {
      return buildFallbackProfile();
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', decodedUsername)
      .single();

    if (error || !user) {
      console.warn('Public profile not found in Supabase, using fallback:', decodedUsername, error?.message);
      return buildFallbackProfile();
    }

    res.json({ success: true, user, content: [], drops: [], leaderboard_position: null });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return buildFallbackProfile();
  }
});

router.get('/public/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      return res.json({
        success: true,
        user: {
          id,
          username: `demo_user_${id}`,
          display_name: 'Demo User',
          bio: 'This is a demo public profile.',
          website_url: 'https://example.com',
          user_type: 'creator',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_public'
        },
        content: [],
        drops: [],
        leaderboard_position: null
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user, content: [], drops: [], leaderboard_position: null });
  } catch (error) {
    console.error('Error fetching public profile by id:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch public profile' });
  }
});

// Apply auth to all routes
router.use(authMiddleware);

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    if (!supabase) {
      const profile = ensureUserProfile(req.user || {});
      req.user = profile;
      return res.json(profile);
    }

    const cacheKey = `users:profile:${req.user.id}`;
    const profile = await getCachedValue(cacheKey, async () => {
      // Query user from database with economy balances
      const queryStart = Date.now();
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          user_balances (*)
        `)
        .eq('id', req.user.id)
        .single();
      const durationMs = Date.now() - queryStart;
      if (durationMs > 250) {
        console.log(`[users:profile:${req.user.id}] Supabase query took ${durationMs}ms`);
      }

      if (user && user.user_balances) {
        // Map new economy table to expected user fields
        const balances = user.user_balances; // It might be an array or object depending on relation, usually object for 1:1
        // If it's 1:1 via FK, supabase returns object or array depending on setup. Assuming object or single item array.
        // Actually, let's handle both.
        const balanceData = Array.isArray(balances) ? balances[0] : balances;

        if (balanceData) {
          user.points_balance = balanceData.points || 0;
          user.keys_balance = balanceData.promokeys || 0;
          user.gems_balance = balanceData.gems || 0;
          user.gold_collected = balanceData.gold || 0;
          user.master_key_activated_at = balanceData.master_key_unlocked ? (balanceData.master_key_expires_at || new Date().toISOString()) : null;
        }
      }

      if (error || !user) {
        if (error) {
          console.error('Database error fetching user:', error);
        }

        return {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          display_name: req.user.display_name || req.user.username || 'Demo User',
          user_type: req.user.user_type || 'creator',
          points_balance: req.user.points_balance ?? 0,
          keys_balance: req.user.keys_balance ?? 0,
          gems_balance: req.user.gems_balance ?? 0,
          gold_collected: req.user.gold_collected ?? 0,
          user_tier: req.user.user_tier || 'free',
          avatar_url: req.user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
          master_key_activated_at: req.user.master_key_activated_at ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return user;
    });

    res.json({
      ...profile,
      master_key_activated_at: profile.master_key_activated_at ?? null
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

// Get user wallets
router.get('/me/wallets', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const wallets = await fetchWalletsForUser(userId);

    res.json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet data' });
  }
});

router.get('/master-key-status', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    if (!supabase || process.env.USE_DEMO_MASTER_KEYS === 'true') {
      return res.json({
        success: true,
        status: {
          has_master_key: true,
          last_issued_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          remaining_daily_uses: 3,
          total_daily_uses: 5
        }
      });
    }

    const queryStart = Date.now();
    const { data, error } = await supabase
      .from('master_keys')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const durationMs = Date.now() - queryStart;
    if (durationMs > 250) {
      console.log(`[users:master-key-status:${userId}] Supabase query took ${durationMs}ms`);
    }

    if (error) {
      console.error('Database error fetching master key status:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch master key status' });
    }

    if (!data) {
      return res.json({
        success: true,
        status: {
          has_master_key: false,
          last_issued_at: null,
          expires_at: null,
          remaining_daily_uses: 0,
          total_daily_uses: 0
        }
      });
    }

    const remainingDailyUses = Math.max((data.daily_limit || 5) - (data.uses_today || 0), 0);

    res.json({
      success: true,
      status: {
        has_master_key: true,
        last_issued_at: data.issued_at,
        expires_at: data.expires_at,
        remaining_daily_uses: remainingDailyUses,
        total_daily_uses: data.daily_limit || 5
      }
    });
  } catch (error) {
    console.error('Error fetching master key status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch master key status' });
  }
});

router.get('/:id/leaderboard-position', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase || process.env.USE_DEMO_LEADERBOARD === 'true') {
      return res.json({
        success: true,
        leaderboard_position: {
          user_id: id,
          daily_rank: Math.floor(Math.random() * 100) + 1,
          weekly_rank: Math.floor(Math.random() * 120) + 1,
          monthly_rank: Math.floor(Math.random() * 150) + 1,
          composite_score: Number((Math.random() * 100).toFixed(1)),
          points_earned: Math.floor(Math.random() * 5000),
          gems_earned: Math.floor(Math.random() * 500),
          keys_used: Math.floor(Math.random() * 40),
          gold_collected: Math.floor(Math.random() * 200),
        },
      });
    }

    const { data, error } = await supabase
      .from('leaderboard_positions')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching leaderboard position:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch leaderboard position' });
    }

    if (!data) {
      return res.json({
        success: true,
        leaderboard_position: {
          user_id: id,
          daily_rank: null,
          weekly_rank: null,
          monthly_rank: null,
          composite_score: 0,
          points_earned: 0,
          gems_earned: 0,
          keys_used: 0,
          gold_collected: 0,
        },
      });
    }

    res.json({ success: true, leaderboard_position: data });
  } catch (error) {
    console.error('Error fetching leaderboard position:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard position' });
  }
});

// Get user transactions
router.get('/me/transactions', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const transactions = await fetchTransactionsForUser(userId);

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction data' });
  }
});

router.get('/wallets', async (req, res) => {
  try {
    const userId = req.user?.id;
    const wallets = await fetchWalletsForUser(userId);
    res.json(wallets);
  } catch (error) {
    console.error('Error fetching wallets list:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallets' });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user?.id;
    const transactions = await fetchTransactionsForUser(userId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions list:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

router.get('/upgrade-costs', async (req, res) => {
  try {
    if (!supabase) {
      return res.json(MOCK_UPGRADE_COSTS);
    }

    // TODO: replace with persistence-backed pricing when available
    res.json(MOCK_UPGRADE_COSTS);
  } catch (error) {
    console.error('Error fetching upgrade costs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch upgrade costs' });
  }
});

router.post('/upgrade-tier', async (req, res) => {
  try {
    const { target_tier: targetTier, payment_method: paymentMethod } = req.body || {};

    if (!targetTier || !['points', 'gems'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Invalid upgrade request' });
    }

    if (!supabase) {
      const profile = ensureUserProfile(req.user || {});
      const currentTier = profile.user_tier || 'free';
      const availableTier = MOCK_UPGRADE_COSTS[currentTier]?.[targetTier];

      if (!availableTier) {
        return res.status(400).json({ success: false, error: 'Upgrade not available for current tier' });
      }

      const cost = availableTier[paymentMethod];
      const balanceKey = paymentMethod === 'points' ? 'points_balance' : 'gems_balance';

      if (typeof cost !== 'number') {
        return res.status(400).json({ success: false, error: 'Upgrade pricing unavailable' });
      }

      if ((profile[balanceKey] ?? 0) < cost) {
        return res.status(400).json({ success: false, error: `Not enough ${paymentMethod} to upgrade` });
      }

      const updatedProfile = updateUserProfile(profile.id, {
        user_tier: targetTier,
        [balanceKey]: (profile[balanceKey] ?? 0) - cost
      });

      req.user = { ...req.user, ...updatedProfile };
      const token = generateToken(updatedProfile);

      return res.json({
        success: true,
        user: updatedProfile,
        token,
        message: `Tier upgraded to ${targetTier}`
      });
    }

    const { data: userRecord, error: fetchError } = await supabase
      .from('users')
      .select('id, user_tier, points_balance, gems_balance')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !userRecord) {
      console.error('Database error fetching user for upgrade:', fetchError);
      return res.status(500).json({ success: false, error: 'Failed to process upgrade' });
    }

    const currentTier = userRecord.user_tier || 'free';
    const availableTier = MOCK_UPGRADE_COSTS[currentTier]?.[targetTier];

    if (!availableTier) {
      return res.status(400).json({ success: false, error: 'Upgrade not available for current tier' });
    }

    const cost = availableTier[paymentMethod];
    const balanceKey = paymentMethod === 'points' ? 'points_balance' : 'gems_balance';

    if (typeof cost !== 'number') {
      return res.status(400).json({ success: false, error: 'Upgrade pricing unavailable' });
    }

    if ((userRecord[balanceKey] ?? 0) < cost) {
      return res.status(400).json({ success: false, error: `Not enough ${paymentMethod} to upgrade` });
    }

    const updates = {
      user_tier: targetTier,
      [balanceKey]: (userRecord[balanceKey] ?? 0) - cost,
      updated_at: new Date().toISOString()
    };

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userRecord.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      console.error('Database error upgrading tier:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to complete upgrade' });
    }

    const token = generateToken(updatedUser);

    res.json({
      success: true,
      user: updatedUser,
      token,
      message: `Tier upgraded to ${targetTier}`
    });
  } catch (error) {
    console.error('Error upgrading user tier:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade tier' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!supabase) {
      return res.json({
        success: true,
        user: { id: parseInt(id), ...updates },
        message: 'User updated successfully (mock)'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating user:', error);
      return res.status(500).json({ success: false, error: 'Failed to update user' });
    }

    res.json({ success: true, user, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Mark onboarding as complete
router.post('/onboarding/complete', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ success: false, error: 'User context missing' });

    if (!supabase) {
      return res.json({ success: true, message: 'Onboarding marked complete (mock)' });
    }

    const { error } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId);

    if (error) {
      console.error('Error marking onboarding complete:', error);
      return res.status(500).json({ success: false, error: 'Failed to update onboarding status' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in onboarding complete:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get guide progress
router.get('/guide-progress', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ success: false, error: 'User context missing' });

    if (!supabase) {
      return res.json({
        success: true,
        progress: [
          { guide_id: 'onboarding', completed_steps: ['welcome', 'interests'], is_completed: false }
        ]
      });
    }

    const { data, error } = await supabase
      .from('user_guide_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching guide progress:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch guide progress' });
    }

    res.json({ success: true, progress: data || [] });
  } catch (error) {
    console.error('Error fetching guide progress:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update guide step
router.post('/guide-progress/step', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { guide_id, step_id, is_completed } = req.body;

    if (!userId || !guide_id || !step_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!supabase) {
      return res.json({ success: true, message: 'Step updated (mock)' });
    }

    // First get current progress
    const { data: current, error: fetchError } = await supabase
      .from('user_guide_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('guide_id', guide_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(500).json({ success: false, error: 'Error fetching progress' });
    }

    let completedSteps = current ? (current.completed_steps || []) : [];

    if (is_completed && !completedSteps.includes(step_id)) {
      completedSteps.push(step_id);
    } else if (!is_completed && completedSteps.includes(step_id)) {
      completedSteps = completedSteps.filter(id => id !== step_id);
    }

    const { error: upsertError } = await supabase
      .from('user_guide_progress')
      .upsert({
        user_id: userId,
        guide_id,
        completed_steps: completedSteps,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('Error updating guide progress:', upsertError);
      return res.status(500).json({ success: false, error: 'Failed to update progress' });
    }

    res.json({ success: true, completed_steps: completedSteps });
  } catch (error) {
    console.error('Error updating guide step:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get user's master key status
router.get('/master-key-status', async (req, res) => {
  try {
    if (!supabase) {
      // Mock master key status
      return res.json({
        is_activated: true,
        proof_drops_completed: 3,
        proof_drops_required: 3,
        last_activated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      });
    }

    // TODO: Implement actual master key status logic
    const { data: status, error } = await supabase
      .from('master_key_status')
      .select('*')
      .eq('user_id', 1) // TODO: Get from authenticated user
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Database error fetching master key status:', error);
      return res.json({
        is_activated: false,
        proof_drops_completed: 0,
        proof_drops_required: 3,
        last_activated_at: null,
      });
    }

    res.json(status || {
      is_activated: false,
      proof_drops_completed: 0,
      proof_drops_required: 3,
      last_activated_at: null
    });
  } catch (error) {
    console.error('Error fetching master key status:', error);
    res.json({
      is_activated: false,
      proof_drops_completed: 0,
      proof_drops_required: 3,
      last_activated_at: null,
    });
  }
});

// Convert current user into an advertiser
router.post('/become-advertiser', async (req, res) => {
  try {
    const advertiserDetails = {
      user_type: 'advertiser',
      advertiser_tier: 'free',
      updated_at: new Date().toISOString()
    };

    if (!supabase) {
      const updatedUser = {
        ...req.user,
        ...advertiserDetails
      };

      const token = generateToken(updatedUser);

      return res.json({
        success: true,
        user: updatedUser,
        token,
        message: 'User converted to advertiser (mock)'
      });
    }

    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .update(advertiserDetails)
      .or(`id.eq.${userId},mocha_user_id.eq.${userId}`)
      .select()
      .single();

    if (error || !user) {
      console.error('Database error updating advertiser status:', error);
      return res.status(500).json({ success: false, error: 'Failed to become advertiser' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      user,
      token,
      message: 'User converted to advertiser successfully'
    });
  } catch (error) {
    console.error('Error converting user to advertiser:', error);
    res.status(500).json({ success: false, error: 'Failed to become advertiser' });
  }
});

// Forecast participation for current user
router.get('/forecasts', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('user_forecasts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return res.json(data);
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Database error fetching user forecasts:', error);
      }
    }

    return res.json([
      createDemoUserForecast(userId),
      createDemoUserForecast(userId, {
        forecast_id: 102,
        prediction_amount: 30,
        potential_payout: 54,
        platform: 'tiktok',
        content_url: 'https://tiktok.com/@demo/video/123456',
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      }),
    ]);
  } catch (error) {
    console.error('Error fetching user forecasts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user forecasts' });
  }
});

// Forecasts created by current user
router.get('/created-forecasts', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('social_forecasts')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return res.json(data);
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Database error fetching created forecasts:', error);
      }
    }

    return res.json([
      createDemoCreatedForecast(userId),
      createDemoCreatedForecast(userId, {
        id: 202,
        platform: 'instagram',
        forecast_type: 'likes',
        target_value: 12000,
        current_value: 6400,
        odds: 2.1,
        pool_size: 210.4,
        creator_initial_amount: 40,
        content_title: 'Launch day teaser',
      }),
    ]);
  } catch (error) {
    console.error('Error fetching created forecasts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch created forecasts' });
  }
});

router.get('/drop-applications', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('drop_applications')
        .select('*')
        .eq('user_id', userId)
        .order('applied_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return res.json(data);
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Database error fetching drop applications:', error);
      }
    }

    const now = Date.now();
    return res.json([
      {
        id: 1,
        drop_id: '10000000-0000-0000-0000-000000000002',
        user_id: userId,
        status: 'approved',
        application_message: 'Excited to deliver a polished review within 48 hours.',
        submission_url: 'https://drive.google.com/demo-submission',
        submission_notes: 'Approved with high engagement potential.',
        review_score: 4.8,
        gems_earned: 120,
        applied_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        drop_id: '10000000-0000-0000-0000-000000000003',
        user_id: userId,
        status: 'submitted',
        application_message: 'Delivering a promotional trailer with motion graphics.',
        submission_url: null,
        submission_notes: null,
        review_score: null,
        gems_earned: 0,
        applied_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        paid_at: null,
        created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Error fetching drop applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch drop applications' });
  }
});

// Get user by ID (fallback for admin views)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.json({
        success: true,
        user: {
          id,
          username: `user_${id}`,
          email: `user${id}@example.com`,
          created_at: new Date().toISOString(),
          stats: {
            posts: Math.floor(Math.random() * 100),
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500)
          }
        }
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// =============================================
// ECONOMY v3.3 ENDPOINTS
// =============================================

// Get follower points preview (without claiming)
router.get('/follower-points/preview', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const followerPointsService = require('../services/followerPointsService');
    const preview = await followerPointsService.getFollowerPointsPreview(userId);

    res.json({
      success: true,
      ...preview
    });
  } catch (error) {
    console.error('Error getting follower points preview:', error);
    res.status(500).json({ success: false, error: 'Failed to get follower points preview' });
  }
});

// Claim monthly follower points
router.post('/follower-points/claim', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const followerPointsService = require('../services/followerPointsService');
    const result = await followerPointsService.claimMonthlyFollowerPoints(userId);

    invalidateCache(`users:${userId}`);

    res.json(result);
  } catch (error) {
    console.error('Error claiming follower points:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to claim follower points'
    });
  }
});

// Sync engagement metrics from platform
router.post('/engagement/sync', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const { raw_followers, engagement_rate, avg_likes_per_post, avg_comments_per_post, total_posts_analyzed } = req.body;

    const followerPointsService = require('../services/followerPointsService');
    const result = await followerPointsService.updateEngagementMetrics(userId, {
      raw_followers,
      engagement_rate,
      avg_likes_per_post,
      avg_comments_per_post,
      total_posts_analyzed
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error syncing engagement metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to sync engagement metrics' });
  }
});

// Get engagement metrics
router.get('/engagement/metrics', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const followerPointsService = require('../services/followerPointsService');
    const metrics = await followerPointsService.getEngagementMetrics(userId);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error getting engagement metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to get engagement metrics' });
  }
});

// Get trust tier information
router.get('/trust-tier', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const followerPointsService = require('../services/followerPointsService');
    const tier = await followerPointsService.getTrustTier(userId);

    res.json({
      success: true,
      ...tier
    });
  } catch (error) {
    console.error('Error getting trust tier:', error);
    res.status(500).json({ success: false, error: 'Failed to get trust tier' });
  }
});

// Get next recommended action (One Action Path)
router.get('/next-action', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const userJourneyService = require('../services/userJourneyService');
    const nextAction = await userJourneyService.getNextAction(userId);

    res.json({
      success: true,
      ...nextAction
    });
  } catch (error) {
    console.error('Error getting next action:', error);
    res.status(500).json({ success: false, error: 'Failed to get next action' });
  }
});

// Get user journey progress
router.get('/journey-progress', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const userJourneyService = require('../services/userJourneyService');
    const progress = await userJourneyService.getJourneyProgress(userId);

    res.json({
      success: true,
      ...progress
    });
  } catch (error) {
    console.error('Error getting journey progress:', error);
    res.status(500).json({ success: false, error: 'Failed to get journey progress' });
  }
});

// Get visible features (progressive disclosure)
router.get('/visible-features', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const progressiveDisclosureService = require('../services/progressiveDisclosureService');
    const summary = await progressiveDisclosureService.getDisclosureSummary(userId);

    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    console.error('Error getting visible features:', error);
    res.status(500).json({ success: false, error: 'Failed to get visible features' });
  }
});

// Unlock all features (skip progressive disclosure)
router.post('/unlock-all-features', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const progressiveDisclosureService = require('../services/progressiveDisclosureService');
    await progressiveDisclosureService.unlockAllFeatures(userId);

    res.json({
      success: true,
      message: 'All features unlocked'
    });
  } catch (error) {
    console.error('Error unlocking features:', error);
    res.status(500).json({ success: false, error: 'Failed to unlock features' });
  }
});

// Get tour status
router.get('/tour-status', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const progressiveDisclosureService = require('../services/progressiveDisclosureService');
    const status = await progressiveDisclosureService.getTourStatus(userId);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Error getting tour status:', error);
    res.status(500).json({ success: false, error: 'Failed to get tour status' });
  }
});

// Update tour progress
router.post('/tour-progress', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User context missing' });
    }

    const { step, completed } = req.body;

    const progressiveDisclosureService = require('../services/progressiveDisclosureService');
    await progressiveDisclosureService.updateTourProgress(userId, step, completed);

    res.json({
      success: true,
      message: 'Tour progress updated'
    });
  } catch (error) {
    console.error('Error updating tour progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update tour progress' });
  }
});

module.exports = router;
