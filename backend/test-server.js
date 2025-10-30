const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  process.env.LOCAL_DEV_URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

const DEMO_USERS = {
  creator: {
    token: 'demo-token-creator',
    user: {
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
    }
  },
  investor: {
    token: 'demo-token-investor',
    user: {
      id: 'demo-investor-id',
      email: 'investor@demo.com',
      username: 'demo_investor',
      display_name: 'Demo Investor',
      user_type: 'investor',
      points_balance: 5000,
      keys_balance: 200,
      gems_balance: 500,
      gold_collected: 25,
      user_tier: 'premium'
    }
  },
  advertiser: {
    token: 'demo-token-advertiser',
    user: {
      id: 'demo-advertiser-id',
      email: 'advertiser@demo.com',
      username: 'demo_advertiser',
      display_name: 'Demo Advertiser',
      user_type: 'advertiser',
      points_balance: 2500,
      keys_balance: 80,
      gems_balance: 300,
      gold_collected: 10,
      user_tier: 'business'
    }
  }
};

const DEMO_CONTENT = [
  {
    id: 1,
    title: 'Demo Growth Content Spotlight',
    description: 'Experience a highlight clip from our creator community.',
    creator_id: 'demo-creator-id',
    creator_name: 'Demo Creator',
    creator_username: 'demo_creator',
    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_creator',
    platform: 'instagram',
    platform_url: 'https://instagram.com/promorang',
    media_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80&sat=-10',
    total_shares: 3500,
    available_shares: 1240,
    engagement_shares_total: 3200,
    engagement_shares_remaining: 880,
    share_price: 12.5,
    current_revenue: 8450,
    views_count: 98000,
    likes_count: 15420,
    comments_count: 2450,
    reposts_count: 1200,
    is_demo: true,
    is_sponsored: false,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Demo Sponsored Collaboration',
    description: 'Showcase a collaboration between creator and brand.',
    creator_id: 'demo-advertiser-id',
    creator_name: 'Demo Advertiser',
    creator_username: 'demo_advertiser',
    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_advertiser',
    platform: 'youtube',
    platform_url: 'https://youtube.com/@promorang',
    media_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80&sat=-10',
    total_shares: 4200,
    available_shares: 980,
    engagement_shares_total: 3900,
    engagement_shares_remaining: 620,
    share_price: 15.2,
    current_revenue: 12450,
    views_count: 125000,
    likes_count: 18250,
    comments_count: 3120,
    reposts_count: 1800,
    is_demo: true,
    is_sponsored: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEMO_DROPS = [
  {
    id: 201,
    title: 'Launch Week Creator Challenge',
    creator_name: 'Demo Creator',
    creator_id: 'demo-creator-id',
    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_creator',
    preview_image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1368&q=80',
    created_at: new Date().toISOString(),
    current_participants: 240,
    max_participants: 500,
    platform: 'TikTok',
    content_url: 'https://www.tiktok.com/@promorang',
    drop_type: 'ugc_creation',
    description: 'Help us launch Promorang by creating a short-form video showcasing your favorite marketplace feature.',
    key_cost: 25,
    gem_reward_base: 150,
    gem_reward_bonus: 50,
    difficulty: 'medium',
    status: 'active',
    is_proof_drop: true,
    is_paid_drop: true,
    deadline_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: 'Post a 30s clip highlighting Promorang platform features.',
    follower_threshold: 500,
    gem_pool_total: 5000,
    gem_pool_remaining: 3120,
    move_cost_points: 50,
    key_reward_amount: 10,
    time_commitment: 'Approx 2 hours',
    deliverables: 'Submit final video link and engagement metrics within 48 hours.',
    move_actions: [
      { id: 'share', label: 'Share on TikTok', reward: 20 },
      { id: 'analytics', label: 'Submit analytics screenshot', reward: 30 }
    ]
  }
];

const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) return DEMO_USERS.creator.user;

  const entry = Object.values(DEMO_USERS).find((demo) => demo.token === token);
  return entry ? entry.user : DEMO_USERS.creator.user;
};

const respondWithUser = (res, user) => {
  res.json({
    success: true,
    user
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'promorang-test-server'
  });
});

// Demo authentication endpoints
['creator', 'investor', 'advertiser'].forEach((type) => {
  app.post(`/api/auth/demo/${type}`, (req, res) => {
    const { token, user } = DEMO_USERS[type];
    res.json({
      success: true,
      user,
      token
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  respondWithUser(res, getUserFromRequest(req));
});

app.get('/api/auth/profile', (req, res) => {
  const user = getUserFromRequest(req);
  respondWithUser(res, {
    ...user,
    followers: 1250,
    following: 300,
    content_shared: 42,
    bio: 'Demo account for Promorang platform preview.'
  });
});

// Content APIs
app.get('/api/content', (req, res) => {
  res.json(DEMO_CONTENT);
});

app.get('/api/content/sponsored', (req, res) => {
  res.json(DEMO_CONTENT.filter((item) => item.is_sponsored));
});

app.get('/api/content/:id', (req, res) => {
  const id = Number(req.params.id);
  const content = DEMO_CONTENT.find((item) => item.id === id);
  res.json(content || DEMO_CONTENT[0]);
});

app.get('/api/content/:id/metrics', (req, res) => {
  res.json({
    likes: 15000,
    comments: 3200,
    shares: 1800,
    views: 120000,
    internal_moves: 420,
    external_moves: 215,
    total_engagement: 15000
  });
});

app.get('/api/content/:id/user-status', (req, res) => {
  res.json({
    has_liked: true,
    has_saved: false
  });
});

app.get('/api/content/:id/sponsorship', (req, res) => {
  res.json({
    is_sponsored: true,
    sponsor_name: 'TechCorp',
    sponsor_budget: 1500,
    remaining_budget: 850
  });
});

app.post('/api/content/buy-shares', (req, res) => {
  res.json({
    success: true,
    new_balance: 1180
  });
});

app.post('/api/users/social-action', (req, res) => {
  res.json({ success: true });
});

app.post('/api/content/tip', (req, res) => {
  res.json({
    success: true,
    new_balance: 95
  });
});

app.put('/api/content/:id', (req, res) => {
  res.json({
    success: true,
    content: {
      ...req.body,
      id: Number(req.params.id)
    }
  });
});

app.delete('/api/content/:id', (req, res) => {
  res.json({ success: true });
});

app.post('/api/content/:id/sponsor', (req, res) => {
  res.json({
    success: true,
    sponsorship: {
      amount: req.body?.amount || 0,
      remaining: 750
    }
  });
});

// Drop APIs
app.get('/api/drops', (req, res) => {
  const limit = Number(req.query.limit) || DEMO_DROPS.length;
  res.json(DEMO_DROPS.slice(0, limit));
});

app.get('/api/drops/:id', (req, res) => {
  const id = Number(req.params.id);
  const drop = DEMO_DROPS.find((d) => d.id === id);
  if (drop) {
    return res.json(drop);
  }
  return res.status(404).json({ error: 'Drop not found' });
});

app.post('/api/drops/:id/apply', (req, res) => {
  const id = Number(req.params.id);
  const drop = DEMO_DROPS.find((d) => d.id === id);
  if (!drop) {
    return res.status(404).json({ success: false, error: 'Drop not found' });
  }

  res.json({
    success: true,
    application: {
      id: `application-${id}`,
      drop_id: id,
      status: 'submitted',
      application_message: req.body?.message || 'Excited to contribute!',
      submitted_at: new Date().toISOString()
    }
  });
});

app.put('/api/drops/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = DEMO_DROPS.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Drop not found' });
  }

  DEMO_DROPS[index] = {
    ...DEMO_DROPS[index],
    ...req.body,
    id,
    updated_at: new Date().toISOString(),
  };

  res.json({ success: true, drop: DEMO_DROPS[index] });
});

app.delete('/api/drops/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = DEMO_DROPS.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Drop not found' });
  }

  res.json({ success: true });
});

app.get('/api/users/me/wallets', (req, res) => {
  const user = getUserFromRequest(req);
  res.json([
    {
      id: `${user.id}-wallet-points`,
      type: 'points',
      currency_type: 'points',
      balance: user.points_balance
    },
    {
      id: `${user.id}-wallet-keys`,
      type: 'keys',
      currency_type: 'keys',
      balance: user.keys_balance
    },
    {
      id: `${user.id}-wallet-gems`,
      type: 'gems',
      currency_type: 'gems',
      balance: user.gems_balance
    }
  ]);
});

app.get('/api/users/me', (req, res) => {
  res.json(getUserFromRequest(req));
});

app.get('/api/users/master-key-status', (req, res) => {
  res.json({
    is_activated: true,
    proof_drops_completed: 3,
    proof_drops_required: 3,
    last_activated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  });
});

app.get('/api/users/drop-applications', (req, res) => {
  res.json([
    {
      id: 'application-1',
      drop_id: DEMO_DROPS[0].id,
      status: 'approved',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/users/:userId/content', (req, res) => {
  res.json(DEMO_CONTENT);
});

app.get('/api/users/:userId/drops', (req, res) => {
  res.json(DEMO_DROPS);
});

app.get('/api/users/:userId/leaderboard-position', (req, res) => {
  res.json({
    rank: 8,
    total_users: 1250,
    percentile: 99
  });
});

app.get('/api/users/public/id/:id', (req, res) => {
  res.json({
    user: DEMO_USERS.creator.user,
    content: DEMO_CONTENT,
    drops: DEMO_DROPS,
    leaderboard_position: { rank: 12, total_users: 1250 }
  });
});

app.get('/api/users/public/:username', (req, res) => {
  const entry = Object.values(DEMO_USERS).find((demo) => demo.user.username === req.params.username);
  res.json({
    user: entry ? entry.user : DEMO_USERS.creator.user,
    content: DEMO_CONTENT,
    drops: DEMO_DROPS,
    leaderboard_position: { rank: 12, total_users: 1250 }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
