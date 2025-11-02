const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const advertiserCoupons = [];
const couponAssignments = [];
const couponRedemptions = [];

const isProduction = process.env.NODE_ENV === 'production';

const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

const availablePlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingInterval: 'monthly',
    features: [
      '50 moves / month',
      '5 proof drops',
      'Basic analytics',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 249,
    billingInterval: 'monthly',
    features: [
      '200 moves / week',
      '15 proof drops',
      '8 paid drops',
      'Advanced analytics',
      'Audience targeting tools',
    ],
  },
  {
    id: 'super',
    name: 'Super',
    price: 799,
    billingInterval: 'monthly',
    features: [
      '500 moves / week',
      '25 proof drops',
      '15 paid drops',
      'Premium analytics + reporting',
      'Dedicated success manager',
      'Leaderboard incentive targeting',
    ],
  },
];

const getUserTier = (user = {}) => user?.advertiser_tier || user?.user_tier || 'free';

const ensureDemoCoupons = (advertiserId = 'demo-advertiser-id') => {
  if (isProduction || advertiserCoupons.length > 0) {
    return;
  }

  const now = new Date();
  advertiserCoupons.push(
    {
      id: 'coupon-1',
      advertiser_id: advertiserId,
      title: '50% Off Premium Subscription',
      description: 'Reward top performers with a 50% discount on their next purchase.',
      reward_type: 'coupon',
      value: 50,
      value_unit: 'percentage',
      quantity_total: 25,
      quantity_remaining: 25,
      start_date: now.toISOString(),
      end_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      conditions: {
        leaderboard_position_min: 1,
        leaderboard_position_max: 25,
      },
      assignments: [],
    },
    {
      id: 'coupon-2',
      advertiser_id: advertiserId,
      title: 'Creator Merch Pack Giveaway',
      description: 'Send custom merch to the first 10 creators who complete the drop.',
      reward_type: 'giveaway',
      value: 1,
      value_unit: 'item',
      quantity_total: 10,
      quantity_remaining: 10,
      start_date: now.toISOString(),
      end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      conditions: {
        drop_ids: ['drop-1'],
      },
      assignments: [
        {
          id: 'assign-1',
          coupon_id: 'coupon-2',
          target_type: 'drop',
          target_id: 'drop-1',
          target_label: 'Launch Campaign: Social Buzz',
          assigned_at: now.toISOString(),
          status: 'active',
        },
      ],
    },
  );
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Simple auth middleware mirroring behaviour from users route
router.use((req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const decoded = decodeToken(authHeader.substring(7));
    if (decoded) {
      req.user = decoded;
    }
  }

  if (!req.user && process.env.NODE_ENV === 'development') {
    req.user = {
      id: 'demo-advertiser-id',
      email: 'advertiser@demo.com',
      username: 'demo_advertiser',
      display_name: 'Demo Advertiser',
      user_type: 'advertiser',
      advertiser_tier: 'free',
      points_balance: 10000,
      gems_balance: 2000,
      keys_balance: 500,
    };
  }

  if (!req.user) {
    return sendError(res, 401, 'Unauthorized', 'UNAUTHENTICATED');
  }

  if ((req.user.user_type || req.user.role) !== 'advertiser') {
    return sendError(res, 403, 'Advertiser privileges required', 'NOT_ADVERTISER');
  }

  return next();
});

router.get('/subscription/plans', (req, res) => {
  return sendSuccess(res, {
    plans: availablePlans,
    current_tier: getUserTier(req.user),
  });
});

router.post('/subscription/upgrade', (req, res) => {
  const { planId } = req.body || {};
  const plan = availablePlans.find((entry) => entry.id === planId);

  if (!plan) {
    return sendError(res, 422, 'Invalid plan selection', 'INVALID_PLAN');
  }

  const now = new Date().toISOString();

  return sendSuccess(res, {
    plan: {
      ...plan,
      activated_at: now,
      renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  }, `Subscription upgraded to ${plan.name}`);
});

router.get('/dashboard', async (req, res) => {
  const userTier = getUserTier(req.user);

  ensureDemoCoupons(req.user?.id);

  const mockDrops = [
    {
      id: 'drop-1',
      title: 'Launch Campaign: Social Buzz',
      drop_type: 'proof_drop',
      difficulty: 'medium',
      total_applications: 42,
      gems_paid: 540,
      total_spend: 1200,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    },
    {
      id: 'drop-2',
      title: 'Product Review Blitz',
      drop_type: 'paid_drop',
      difficulty: 'easy',
      total_applications: 18,
      gems_paid: 275,
      total_spend: 750,
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];

  const now = new Date();
  const startOfWeek = (offsetWeeks = 0) => {
    const date = new Date(now);
    const day = date.getUTCDay();
    const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday start
    date.setUTCDate(diff + offsetWeeks * 7);
    date.setUTCDate(date.getUTCDate());
    date.setUTCHours(0, 0, 0, 0);
    return date;
  };

  const mockAnalytics = Array.from({ length: 4 }).map((_, index) => {
    const periodStart = startOfWeek(-index);
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 6);

    const dropsCreated = index === 0 ? 3 : 2;
    const totalParticipants = 60 + index * 12;
    const gemsSpent = 320 + index * 45;
    const impressions = 18000 + index * 1200;
    const engagementRate = 4.5 + index * 0.3;
    const conversions = 18 + index * 4;

    return {
      id: `period-${index + 1}`,
      advertiser_id: req.user?.id || 'demo-advertiser-id',
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      drops_created: dropsCreated,
      total_participants: totalParticipants,
      gems_spent: Number(gemsSpent.toFixed(1)),
      conversions,
      impressions,
      engagement_rate: Number(engagementRate.toFixed(1))
    };
  });

  const inventory = {
    free: {
      monthly_inventory: {
        moves: 50,
        proof_drops: 5,
        paid_drops: 0
      }
    },
    premium: {
      weekly_inventory: {
        moves: 200,
        proof_drops: 15,
        paid_drops: 8
      }
    },
    super: {
      weekly_inventory: {
        moves: 500,
        proof_drops: 25,
        paid_drops: 15
      }
    }
  };

  const tierInventory = inventory[userTier] || inventory.free;

  if (isProduction) {
    return sendSuccess(res, {
      drops: [],
      analytics: [],
      user_tier: userTier,
      ...tierInventory
    });
  }

  return sendSuccess(res, {
    drops: mockDrops,
    analytics: mockAnalytics,
    user_tier: userTier,
    ...tierInventory
  });
});

router.get('/suggested-content', (req, res) => {
  const mockContent = [
    {
      id: 'content-1',
      title: 'Top 5 Productivity Apps for Creators',
      creator_name: 'Alex Johnson',
      platform: 'youtube',
      platform_url: 'https://youtube.com/watch?v=productivity-apps',
      impressions_last_7_days: 12450,
      engagement_rate: 5.8,
      category: 'Productivity',
      thumbnail_url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=250&fit=crop',
      total_engagement: 8200,
      roi_potential: 28,
      estimated_views: 27500,
      current_sponsor_count: 3,
      suggested_package: 'popular-boost',
      competition_level: 'Medium'
    },
    {
      id: 'content-2',
      title: 'Daily Fitness Routine Challenge',
      creator_name: 'Taylor Smith',
      platform: 'instagram',
      platform_url: 'https://instagram.com/p/daily-fitness-challenge',
      impressions_last_7_days: 9800,
      engagement_rate: 6.5,
      category: 'Health & Wellness',
      thumbnail_url: 'https://images.unsplash.com/photo-1546484959-f9a6ef084e76?w=400&h=250&fit=crop',
      total_engagement: 6400,
      roi_potential: 31,
      estimated_views: 19800,
      current_sponsor_count: 1,
      suggested_package: 'daily-featured',
      competition_level: 'Low'
    },
    {
      id: 'content-3',
      title: 'Morning Rituals for a Productive Day',
      creator_name: 'Jordan Blake',
      platform: 'tiktok',
      platform_url: 'https://www.tiktok.com/@jordan/video/morning-rituals',
      impressions_last_7_days: 11230,
      engagement_rate: 4.9,
      category: 'Lifestyle',
      thumbnail_url: 'https://images.unsplash.com/photo-1497216053564-eda9d00bcd7e?w=400&h=250&fit=crop',
      total_engagement: 7100,
      roi_potential: 22,
      estimated_views: 22300,
      current_sponsor_count: 0,
      suggested_package: 'quick-boost',
      competition_level: 'High'
    }
  ];

  if (isProduction) {
    return sendSuccess(res, []);
  }

  return sendSuccess(res, mockContent);
});

router.get('/coupons', (req, res) => {
  ensureDemoCoupons(req.user?.id);

  const coupons = advertiserCoupons.filter((coupon) => coupon.advertiser_id === (req.user?.id || 'demo-advertiser-id'))
    .map((coupon) => ({
      ...coupon,
      assignments: couponAssignments.filter((assignment) => assignment.coupon_id === coupon.id),
    }));

  const redemptions = couponRedemptions.filter((entry) => coupons.some((coupon) => coupon.id === entry.coupon_id));

  if (isProduction) {
    return sendSuccess(res, { coupons: [], redemptions: [] });
  }

  return sendSuccess(res, {
    coupons,
    redemptions,
  });
});

router.post('/coupons', (req, res) => {
  const advertiserId = req.user?.id || 'demo-advertiser-id';
  const {
    title,
    description,
    reward_type = 'coupon',
    value = 0,
    value_unit = 'usd',
    quantity_total = 0,
    start_date,
    end_date,
    conditions = {},
  } = req.body || {};

  if (!title || !quantity_total) {
    return sendError(res, 422, 'Title and quantity are required', 'VALIDATION_ERROR');
  }

  const now = new Date().toISOString();
  const id = `coupon-${Date.now()}`;

  const coupon = {
    id,
    advertiser_id: advertiserId,
    title,
    description,
    reward_type,
    value,
    value_unit,
    quantity_total,
    quantity_remaining: quantity_total,
    start_date: start_date || now,
    end_date: end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: now,
    updated_at: now,
    conditions,
  };

  if (!isProduction) {
    advertiserCoupons.push(coupon);
  }

  return res.status(201).json({ status: 'success', data: { coupon }, message: 'Coupon created successfully' });
});

router.post('/coupons/:couponId/assign', (req, res) => {
  ensureDemoCoupons(req.user?.id);
  const { couponId } = req.params;
  const { target_type, target_id, target_label } = req.body || {};

  if (!target_type || !target_id) {
    return sendError(res, 422, 'Target type and ID are required', 'VALIDATION_ERROR');
  }

  const coupon = advertiserCoupons.find((entry) => entry.id === couponId);
  if (!coupon) {
    return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
  }

  const assignment = {
    id: `assign-${Date.now()}`,
    coupon_id: couponId,
    target_type,
    target_id,
    target_label: target_label || target_id,
    assigned_at: new Date().toISOString(),
    status: 'active',
  };

  couponAssignments.push(assignment);
  coupon.assignments = [...(coupon.assignments || []), assignment];

  return sendSuccess(res, { assignment }, 'Coupon assignment saved');
});

router.post('/coupons/:couponId/redeem', (req, res) => {
  ensureDemoCoupons(req.user?.id);
  const { couponId } = req.params;
  const { user_id, user_name } = req.body || {};

  const coupon = advertiserCoupons.find((entry) => entry.id === couponId);
  if (!coupon) {
    return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
  }

  if (coupon.quantity_remaining <= 0) {
    return sendError(res, 422, 'No remaining quantity', 'COUPON_DEPLETED');
  }

  const redemption = {
    id: `redeem-${Date.now()}`,
    coupon_id: couponId,
    user_id: user_id || 'demo-user',
    user_name: user_name || 'Demo User',
    redeemed_at: new Date().toISOString(),
    reward_value: coupon.value,
    reward_unit: coupon.value_unit,
    status: 'completed',
  };

  coupon.quantity_remaining = Math.max(0, coupon.quantity_remaining - 1);
  coupon.updated_at = new Date().toISOString();
  couponRedemptions.push(redemption);

  return sendSuccess(res, { redemption, coupon }, 'Coupon redemption recorded');
});

module.exports = router;
