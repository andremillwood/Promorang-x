const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const { trackCampaignSpend } = require('../utils/referralTracker');
const merchantSamplingService = require('../services/merchantSamplingService');

const DEMO_ADVERTISER_FALLBACK_ID = 'demo-advertiser-id';
const DEMO_ADVERTISER_SUPABASE_ID = '00000000-0000-0000-0000-00000000ad01';

const { requireAuth, resolveAdvertiserContext } = require('../middleware/auth');

const advertiserIdCache = new Map();

const toNumber = (value, precision) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  if (typeof precision === 'number') {
    return Number(numeric.toFixed(precision));
  }
  return numeric;
};

const parseJsonField = (input, fallback = {}) => {
  if (!input) return fallback;
  if (typeof input === 'object') return input;
  try {
    return JSON.parse(input);
  } catch (error) {
    return fallback;
  }
};

const resolveAdvertiserId = async (req) => {
  // Use the context resolved by middleware
  if (req.advertiserAccount) {
    return req.advertiserAccount.id;
  }

  // Fallback for development/legacy if middleware hasn't run
  const user = req.user;
  if (!supabase) {
    return user?.id || DEMO_ADVERTISER_FALLBACK_ID;
  }

  const cacheKey = user?.id || user?.username || 'demo_advertiser';
  if (advertiserIdCache.has(cacheKey)) {
    return advertiserIdCache.get(cacheKey);
  }

  if (!user || !user.id) {
    console.warn('resolveAdvertiserId: No user found in request');
    return DEMO_ADVERTISER_FALLBACK_ID;
  }

  // Look for the user's primary/first advertiser account in the DB
  const { data: teamMember, error } = await supabase
    .from('advertiser_team_members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!error && teamMember) {
    advertiserIdCache.set(cacheKey, teamMember.account_id);
    return teamMember.account_id;
  }

  // Final fallback to the seeded demo advertiser ID for safety
  advertiserIdCache.set(cacheKey, DEMO_ADVERTISER_SUPABASE_ID);
  return DEMO_ADVERTISER_SUPABASE_ID;
};

const isProduction = process.env.NODE_ENV === 'production';

const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

// Import centralized pricing constants
const { ADVERTISER_TIERS, getAdvertiserTierList, MOVE_RULES } = require('../constants/pricing');

// Transform ADVERTISER_TIERS to the format expected by the API
const availablePlans = getAdvertiserTierList().map(tier => ({
  id: tier.id,
  name: tier.name,
  price: tier.price,
  billingInterval: tier.billingInterval,
  features: tier.features,
  moves: tier.moves,
  inventory: tier.inventory,
  isCustom: tier.isCustom || false,
}));

const getUserTier = (user = {}) => user?.advertiser_tier || user?.user_tier || 'free';

const ensureDemoCoupons = (advertiserId = 'demo-advertiser-id') => {
  if (isProduction) {
    return;
  }

  const now = new Date();

  if (advertiserCoupons.length === 0) {
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
      },
    );
  }

  if (couponAssignments.length === 0) {
    couponAssignments.push(
      {
        id: 'assign-1',
        coupon_id: 'coupon-2',
        target_type: 'drop',
        target_id: 'drop-1',
        target_label: 'Launch Campaign: Social Buzz',
        assigned_at: now.toISOString(),
        status: 'active',
      },
      {
        id: 'assign-2',
        coupon_id: 'coupon-1',
        target_type: 'leaderboard',
        target_id: 'daily-top-25',
        target_label: 'Daily Leaderboard Top 25',
        assigned_at: now.toISOString(),
        status: 'active',
      },
      {
        id: 'assign-3',
        coupon_id: 'coupon-1',
        target_type: 'campaign',
        target_id: '10000000-0000-0000-0000-000000000001',
        target_label: 'Launch Campaign: Social Buzz',
        assigned_at: now.toISOString(),
        status: 'active',
      },
    );
  }

  if (couponRedemptions.length === 0) {
    couponRedemptions.push(
      {
        id: 'redeem-1',
        coupon_id: 'coupon-1',
        user_id: 'demo-creator',
        user_name: 'Demo Creator',
        redeemed_at: now.toISOString(),
        reward_value: 50,
        reward_unit: 'percentage',
        status: 'completed',
      },
      {
        id: 'redeem-2',
        coupon_id: 'coupon-2',
        user_id: 'demo-creator',
        user_name: 'Demo Creator',
        redeemed_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        reward_value: 1,
        reward_unit: 'item',
        status: 'completed',
      },
    );
  }

  advertiserCoupons.forEach((coupon) => {
    coupon.assignments = couponAssignments.filter((assignment) => assignment.coupon_id === coupon.id);
  });
};

const demoCampaigns = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    advertiser_id: DEMO_ADVERTISER_SUPABASE_ID,
    name: 'Launch Campaign: Social Buzz',
    objective: 'Drive viral social proof from top creators',
    status: 'active',
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_budget: 12000,
    budget_spent: 4200,
    target_audience: { persona: 'creators', focus: 'wellness influencers' },
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    advertiser_id: DEMO_ADVERTISER_SUPABASE_ID,
    name: 'Product Review Blitz',
    objective: 'Generate review content with measurable conversions',
    status: 'paused',
    start_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    total_budget: 8000,
    budget_spent: 7600,
    target_audience: { persona: 'micro-influencers', focus: 'honest reviews' },
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const demoCampaignMetrics = new Map([
  [
    '10000000-0000-0000-0000-000000000001',
    [
      {
        id: 'metric-demo-1',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        metric_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 18500,
        clicks: 1240,
        conversions: 180,
        spend: 1200,
        revenue: 3800,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'metric-demo-2',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        metric_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 21200,
        clicks: 1580,
        conversions: 220,
        spend: 1460,
        revenue: 4520,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'metric-demo-3',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        metric_date: new Date().toISOString(),
        impressions: 24350,
        clicks: 1725,
        conversions: 265,
        spend: 1750,
        revenue: 5360,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ],
  [
    '10000000-0000-0000-0000-000000000002',
    [
      {
        id: 'metric-demo-4',
        campaign_id: '10000000-0000-0000-0000-000000000002',
        metric_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 15600,
        clicks: 980,
        conversions: 140,
        spend: 980,
        revenue: 3200,
        created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'metric-demo-5',
        campaign_id: '10000000-0000-0000-0000-000000000002',
        metric_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 14250,
        clicks: 840,
        conversions: 112,
        spend: 860,
        revenue: 2880,
        created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  ],
]);

const demoCampaignContent = new Map([
  [
    '10000000-0000-0000-0000-000000000001',
    [
      {
        id: 'content-demo-1',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        title: 'Creator Spotlight: Wellness Morning Routine',
        description: 'Sponsored TikTok walkthrough showcasing morning rituals with the product.',
        platform: 'tiktok',
        media_url: 'https://www.tiktok.com/@creator/video/123',
        status: 'live',
        posted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 18500,
        clicks: 1240,
        engagements: 2400,
        conversions: 180,
      },
      {
        id: 'content-demo-2',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        title: 'Instagram Reel: 3 Ways to Use Promorang',
        description: 'Short-form reel driving swipe-up traffic to the landing page.',
        platform: 'instagram',
        media_url: 'https://instagram.com/reel/456',
        status: 'approved',
        posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 9600,
        clicks: 720,
        engagements: 1500,
        conversions: 90,
      },
    ],
  ],
  [
    '10000000-0000-0000-0000-000000000002',
    [
      {
        id: 'content-demo-3',
        campaign_id: '10000000-0000-0000-0000-000000000002',
        title: 'YouTube Review: Honest Thoughts after 30 Days',
        description: 'Long-form review covering pros, cons, and measurable results.',
        platform: 'youtube',
        media_url: 'https://youtube.com/watch?v=789',
        status: 'live',
        posted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        impressions: 14250,
        clicks: 980,
        engagements: 1800,
        conversions: 112,
      },
    ],
  ],
]);

const demoCampaignDrops = new Map([
  [
    '10000000-0000-0000-0000-000000000001',
    [
      {
        id: 'drop-demo-1',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        title: 'Proof Drop: Wellness Morning Routine',
        description: 'Creators submit their morning routine featuring the product.',
        status: 'active',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        total_applications: 42,
        approved_applications: 19,
        reward: 150,
      },
      {
        id: 'drop-demo-2',
        campaign_id: '10000000-0000-0000-0000-000000000001',
        title: 'Paid Drop: In-Store Demo',
        description: 'Invite-only drop for premium creators to run in-store sessions.',
        status: 'planned',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        total_applications: 8,
        approved_applications: 3,
        reward: 500,
      },
    ],
  ],
  [
    '10000000-0000-0000-0000-000000000002',
    [
      {
        id: 'drop-demo-3',
        campaign_id: '10000000-0000-0000-0000-000000000002',
        title: 'Review Drop: Honest Takes',
        description: 'Creators record unbiased reviews and receive affiliate bonus.',
        status: 'completed',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        total_applications: 57,
        approved_applications: 30,
        reward: 200,
      },
    ],
  ],
]);

const formatCampaignRecord = (campaign = {}) => ({
  id: campaign.id,
  advertiser_id: campaign.advertiser_id,
  name: campaign.name,
  objective: campaign.objective,
  status: campaign.status,
  start_date: campaign.start_date,
  end_date: campaign.end_date,
  total_budget: toNumber(campaign.total_budget, 2),
  budget_spent: toNumber(campaign.budget_spent, 2),
  target_audience: parseJsonField(campaign.target_audience, {}),
  created_at: campaign.created_at,
  updated_at: campaign.updated_at,
});

const formatMetricRecord = (metric = {}) => ({
  id: metric.id,
  campaign_id: metric.campaign_id,
  metric_date: metric.metric_date,
  impressions: toNumber(metric.impressions, 0),
  clicks: toNumber(metric.clicks, 0),
  conversions: toNumber(metric.conversions, 0),
  spend: toNumber(metric.spend, 2),
  revenue: toNumber(metric.revenue, 2),
  created_at: metric.created_at,
  updated_at: metric.updated_at,
});

const formatContentRecord = (content = {}) => ({
  id: content.id,
  campaign_id: content.campaign_id,
  title: content.title,
  description: content.description,
  platform: content.platform,
  media_url: content.media_url,
  status: content.status,
  posted_at: content.posted_at,
  impressions: toNumber(content.impressions, 0),
  clicks: toNumber(content.clicks, 0),
  engagements: toNumber(content.engagements, 0),
  conversions: toNumber(content.conversions, 0),
});

const sortMetricsDesc = (metrics = []) =>
  [...metrics].sort((a, b) => new Date(b.metric_date).getTime() - new Date(a.metric_date).getTime());

const formatCouponRecord = (coupon = {}) => ({
  id: coupon.id,
  advertiser_id: coupon.advertiser_id,
  title: coupon.title,
  description: coupon.description,
  reward_type: coupon.reward_type,
  value: toNumber(coupon.value, 2),
  value_unit: coupon.value_unit,
  quantity_total: toNumber(coupon.quantity_total, 0),
  quantity_remaining: toNumber(coupon.quantity_remaining, 0),
  start_date: coupon.start_date,
  end_date: coupon.end_date,
  status: coupon.status,
  created_at: coupon.created_at,
  updated_at: coupon.updated_at,
  conditions: parseJsonField(coupon.conditions, {}),
  assignments: Array.isArray(coupon.assignments)
    ? coupon.assignments.map((assignment) => ({
      id: assignment.id,
      coupon_id: assignment.coupon_id,
      target_type: assignment.target_type,
      target_id: assignment.target_id,
      target_label: assignment.target_label,
      assigned_at: assignment.assigned_at,
      status: assignment.status,
    }))
    : [],
  redemptions: Array.isArray(coupon.redemptions)
    ? coupon.redemptions.map((redemption) => ({
      id: redemption.id,
      coupon_id: redemption.coupon_id,
      user_id: redemption.user_id,
      user_name: redemption.user_name,
      redeemed_at: redemption.redeemed_at,
      reward_value: toNumber(redemption.reward_value, 2),
      reward_unit: redemption.reward_unit,
      status: redemption.status,
    }))
    : [],
});

const createCampaignSummary = (campaign, metrics = [], coupons = []) => {
  const orderedMetrics = sortMetricsDesc(metrics);
  const latestMetric = orderedMetrics[0];
  return {
    ...formatCampaignRecord(campaign),
    metrics: orderedMetrics.map(formatMetricRecord),
    latest_metrics: latestMetric ? formatMetricRecord(latestMetric) : null,
    performance:
      latestMetric
        ? {
          impressions: toNumber(latestMetric.impressions, 0),
          clicks: toNumber(latestMetric.clicks, 0),
          conversions: toNumber(latestMetric.conversions, 0),
          spend: toNumber(latestMetric.spend, 2),
          revenue: toNumber(latestMetric.revenue, 2),
        }
        : null,
    coupons: coupons.map(formatCouponRecord),
  };
};

const buildDemoCampaignResponse = (campaignId) => {
  const campaign = demoCampaigns.find((entry) => entry.id === campaignId);
  if (!campaign) {
    return null;
  }

  ensureDemoCoupons();
  const metrics = sortMetricsDesc(demoCampaignMetrics.get(campaignId) || []);
  const relatedCoupons = advertiserCoupons
    .map((coupon) => ({
      ...coupon,
      assignments: (coupon.assignments || []).filter(
        (assignment) => assignment.target_type === 'campaign' && assignment.target_id === campaignId
      ),
    }))
    .filter((coupon) => coupon.assignments.length > 0)
    .map(formatCouponRecord);

  const content = (demoCampaignContent.get(campaignId) || []).map(formatContentRecord);

  return {
    campaign: formatCampaignRecord(campaign),
    metrics: metrics.map(formatMetricRecord),
    content,
    coupons: relatedCoupons,
  };
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Apply shared authentication and advertiser context resolution
router.use(requireAuth);
router.use(resolveAdvertiserContext);

// Optional: verify they actually HAVE an advertiser account
router.use((req, res, next) => {
  if (!req.advertiserAccount && (req.user.user_type !== 'advertiser' && req.user.role !== 'advertiser')) {
    return sendError(res, 403, 'Advertiser account required', 'NOT_ADVERTISER');
  }
  next();
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
  const advertiserId = await resolveAdvertiserId(req);

  // Get merchant sampling state and visibility rules
  const { state: merchantState, profile: merchantProfile } = await merchantSamplingService.getMerchantState(advertiserId);
  const merchantVisibility = merchantSamplingService.getMerchantVisibilityRules(merchantState);

  // Get sampling metrics if in sampling state
  let samplingData = null;
  if (merchantState === merchantSamplingService.MerchantState.SAMPLING) {
    const { has_activation, metrics } = await merchantSamplingService.getSamplingMetrics(advertiserId);
    if (has_activation) {
      samplingData = metrics;
    }
  }

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

  if (!supabase) {
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
      }
    ];

    return sendSuccess(res, {
      drops: mockDrops,
      analytics: [],
      user_tier: userTier,
      merchant_state: merchantState,
      merchant_visibility: merchantVisibility,
      sampling_data: samplingData,
      ...tierInventory
    });
  }

  try {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('advertiser_campaigns')
      .select('*')
      .eq('advertiser_account_id', advertiserId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
    }

    const drops = (campaigns || []).map((campaign) => ({
      id: campaign.id,
      title: campaign.name,
      drop_type: campaign.status === 'active' ? 'proof_drop' : 'paid_drop',
      difficulty: 'medium',
      total_applications: 0,
      gems_paid: toNumber(campaign.budget_spent, 0),
      total_spend: toNumber(campaign.budget_spent, 0),
      created_at: campaign.created_at,
      status: campaign.status
    }));

    const { data: metrics, error: metricsError } = await supabase
      .from('advertiser_campaign_metrics')
      .select('*, advertiser_campaigns!inner(advertiser_account_id)')
      .eq('advertiser_campaigns.advertiser_account_id', advertiserId)
      .order('metric_date', { ascending: false })
      .limit(10);

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
    }

    const analytics = (metrics || []).map((metric) => ({
      id: metric.id,
      advertiser_account_id: advertiserId,
      period_start: metric.metric_date,
      period_end: metric.metric_date,
      drops_created: 1,
      total_participants: 0,
      gems_spent: toNumber(metric.spend, 2),
      conversions: toNumber(metric.conversions, 0),
      impressions: toNumber(metric.impressions, 0),
      engagement_rate: toNumber(
        metric.impressions > 0 ? (metric.clicks / metric.impressions) * 100 : 0,
        1
      )
    }));

    return sendSuccess(res, {
      drops,
      analytics,
      user_tier: userTier,
      merchant_state: merchantState,
      merchant_visibility: merchantVisibility,
      sampling_data: samplingData,
      ...tierInventory
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return sendSuccess(res, {
      drops: [],
      analytics: [],
      user_tier: userTier,
      merchant_state: merchantState,
      merchant_visibility: merchantVisibility,
      sampling_data: samplingData,
      ...tierInventory
    });
  }
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

router.get('/coupons', async (req, res) => {
  const advertiserId = await resolveAdvertiserId(req.user);

  if (!supabase) {
    ensureDemoCoupons(req.user?.id);
    const coupons = advertiserCoupons.filter((coupon) => coupon.advertiser_id === (req.user?.id || 'demo-advertiser-id'))
      .map((coupon) => ({
        ...coupon,
        assignments: couponAssignments.filter((assignment) => assignment.coupon_id === coupon.id),
      }));
    const redemptions = couponRedemptions.filter((entry) => coupons.some((coupon) => coupon.id === entry.coupon_id));
    return sendSuccess(res, { coupons, redemptions });
  }

  try {
    const { data: coupons, error: couponsError } = await supabase
      .from('advertiser_coupons')
      .select('*')
      .eq('advertiser_account_id', advertiserId)
      .order('created_at', { ascending: false });

    if (couponsError) {
      console.error('Error fetching coupons:', couponsError);
      return sendSuccess(res, { coupons: [], redemptions: [] });
    }

    const couponIds = (coupons || []).map((c) => c.id);

    const { data: assignments, error: assignmentsError } = await supabase
      .from('advertiser_coupon_assignments')
      .select('*')
      .in('coupon_id', couponIds.length > 0 ? couponIds : ['none']);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
    }

    const { data: redemptions, error: redemptionsError } = await supabase
      .from('advertiser_coupon_redemptions')
      .select('*')
      .in('coupon_id', couponIds.length > 0 ? couponIds : ['none'])
      .order('redeemed_at', { ascending: false });

    if (redemptionsError) {
      console.error('Error fetching redemptions:', redemptionsError);
    }

    const couponsWithAssignments = (coupons || []).map((coupon) => ({
      ...coupon,
      conditions: parseJsonField(coupon.conditions, {}),
      assignments: (assignments || []).filter((a) => a.coupon_id === coupon.id)
    }));

    return sendSuccess(res, {
      coupons: couponsWithAssignments,
      redemptions: redemptions || [],
    });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return sendSuccess(res, { coupons: [], redemptions: [] });
  }
});

router.post('/coupons', async (req, res) => {
  const advertiserId = await resolveAdvertiserId(req.user);
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

  if (!supabase) {
    const id = `coupon-${Date.now()}`;
    const coupon = {
      id,
      advertiser_account_id: advertiserId,
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
    advertiserCoupons.push(coupon);
    return res.status(201).json({ status: 'success', data: { coupon }, message: 'Coupon created successfully' });
  }

  try {
    const { data: coupon, error } = await supabase
      .from('advertiser_coupons')
      .insert({
        advertiser_account_id: advertiserId,
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
        conditions: JSON.stringify(conditions)
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      return sendError(res, 500, 'Failed to create coupon', 'DATABASE_ERROR');
    }

    return res.status(201).json({
      status: 'success',
      data: { coupon: { ...coupon, conditions: parseJsonField(coupon.conditions, {}) } },
      message: 'Coupon created successfully'
    });
  } catch (error) {
    console.error('Coupon creation error:', error);
    return sendError(res, 500, 'Failed to create coupon', 'SERVER_ERROR');
  }
});

router.post('/coupons/:couponId/assign', async (req, res) => {
  const { couponId } = req.params;
  const { target_type, target_id, target_label } = req.body || {};

  if (!target_type || !target_id) {
    return sendError(res, 422, 'Target type and ID are required', 'VALIDATION_ERROR');
  }

  if (!supabase) {
    ensureDemoCoupons(req.user?.id);
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
  }

  try {
    const { data: assignment, error } = await supabase
      .from('advertiser_coupon_assignments')
      .insert({
        coupon_id: couponId,
        target_type,
        target_id,
        target_label: target_label || target_id,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return sendError(res, 500, 'Failed to assign coupon', 'DATABASE_ERROR');
    }

    return sendSuccess(res, { assignment }, 'Coupon assignment saved');
  } catch (error) {
    console.error('Assignment error:', error);
    return sendError(res, 500, 'Failed to assign coupon', 'SERVER_ERROR');
  }
});

router.post('/campaigns', async (req, res) => {
  const advertiserId = await resolveAdvertiserId(req);
  const {
    name,
    description,
    start_date,
    end_date,
    content_items = [],
    drops = [],
    coupons = [],
    budget_gems = 0,
    promoshare_contribution = 0
  } = req.body || {};

  if (!name) {
    return sendError(res, 422, 'Campaign name is required', 'VALIDATION_ERROR');
  }

  // Calculate total gem budget from drops
  const totalDropRewards = drops.reduce((sum, drop) => {
    return sum + ((drop.gemReward || 10) * (drop.maxParticipants || 100));
  }, 0);
  const totalGemBudget = totalDropRewards + promoshare_contribution;

  if (!supabase) {
    // Mock response for development
    const campaignId = `campaign-${Date.now()}`;
    const campaign = {
      id: campaignId,
      advertiser_id: advertiserId,
      name,
      description,
      status: 'active',
      start_date: start_date || new Date().toISOString(),
      end_date: end_date || null,
      total_gem_budget: totalGemBudget,
      gems_spent: 0,
      promoshare_contribution,
      created_at: new Date().toISOString(),
      content_items: content_items.map((item, i) => ({ ...item, id: `content-${i}` })),
      drops: drops.map((drop, i) => ({ ...drop, id: `drop-${i}`, status: 'active', current_participants: 0 })),
      coupons: coupons.map((coupon, i) => ({ ...coupon, id: `coupon-${i}`, quantity_remaining: coupon.quantity }))
    };
    return res.status(201).json({ 
      status: 'success', 
      data: { campaign, id: campaignId }, 
      message: 'Campaign created successfully' 
    });
  }

  try {
    // 1. Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('advertiser_campaigns')
      .insert({
        advertiser_id: advertiserId,
        name,
        description,
        status: 'active',
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || null,
        total_gem_budget: totalGemBudget,
        gems_spent: 0,
        promoshare_contribution
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      return sendError(res, 500, 'Failed to create campaign', 'DATABASE_ERROR');
    }

    const campaignId = campaign.id;

    // 2. Create content items
    if (content_items.length > 0) {
      const contentToInsert = content_items.map((item, index) => ({
        campaign_id: campaignId,
        content_type: item.type || 'link',
        title: item.title || `Content ${index + 1}`,
        url: item.url || null,
        description: item.description || null,
        sort_order: index
      }));

      const { error: contentError } = await supabase
        .from('campaign_content_items')
        .insert(contentToInsert);

      if (contentError) {
        console.error('Error creating content items:', contentError);
      }
    }

    // 3. Create drops
    if (drops.length > 0) {
      const dropsToInsert = drops.map(drop => ({
        campaign_id: campaignId,
        title: drop.title || 'Untitled Drop',
        description: drop.description || null,
        drop_type: drop.type || 'share',
        gem_reward: drop.gemReward || 10,
        keys_cost: drop.keysCost || 1,
        max_participants: drop.maxParticipants || 100,
        current_participants: 0,
        requirements: drop.requirements || null,
        status: 'active',
        promoshare_tickets_per_completion: 1
      }));

      const { error: dropsError } = await supabase
        .from('campaign_drops')
        .insert(dropsToInsert);

      if (dropsError) {
        console.error('Error creating drops:', dropsError);
      }
    }

    // 4. Create coupons
    if (coupons.length > 0) {
      const couponsToInsert = coupons.map(coupon => ({
        campaign_id: campaignId,
        title: coupon.title || 'Discount',
        description: coupon.description || null,
        discount_type: coupon.discountType || 'percent',
        discount_value: coupon.discountValue || 10,
        quantity_total: coupon.quantity || 100,
        quantity_remaining: coupon.quantity || 100,
        expires_at: coupon.expiresAt || null
      }));

      const { error: couponsError } = await supabase
        .from('campaign_coupons')
        .insert(couponsToInsert);

      if (couponsError) {
        console.error('Error creating coupons:', couponsError);
      }
    }

    // 5. If there's a PromoShare contribution, add to the active grand jackpot
    if (promoshare_contribution > 0) {
      const { data: grandCycle } = await supabase
        .from('promoshare_cycles')
        .select('id, jackpot_amount')
        .eq('cycle_type', 'grand')
        .eq('status', 'active')
        .single();

      if (grandCycle) {
        await supabase
          .from('promoshare_cycles')
          .update({ jackpot_amount: (grandCycle.jackpot_amount || 0) + promoshare_contribution })
          .eq('id', grandCycle.id);

        // Add as pool item
        await supabase
          .from('promoshare_pool_items')
          .insert({
            cycle_id: grandCycle.id,
            reward_type: 'gem',
            amount: promoshare_contribution,
            description: `Sponsored by ${name}`,
            sponsor_name: name
          });
      }
    }

    return res.status(201).json({
      status: 'success',
      data: { campaign, id: campaignId },
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return sendError(res, 500, 'Failed to create campaign', 'SERVER_ERROR');
  }
});

router.get('/campaigns', async (req, res) => {
  const advertiserId = await resolveAdvertiserId(req.user);

  if (!supabase) {
    ensureDemoCoupons();
    const campaigns = demoCampaigns.map((campaign) => {
      const metrics = sortMetricsDesc(demoCampaignMetrics.get(campaign.id) || []);
      return createCampaignSummary(campaign, metrics, []);
    });
    return sendSuccess(res, { campaigns });
  }

  try {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('advertiser_campaigns')
      .select('*')
      .eq('advertiser_account_id', advertiserId)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return sendSuccess(res, { campaigns: [] });
    }

    const campaignIds = (campaigns || []).map((c) => c.id);
    const { data: metrics, error: metricsError } = await supabase
      .from('advertiser_campaign_metrics')
      .select('*')
      .in('campaign_id', campaignIds.length > 0 ? campaignIds : ['none'])
      .order('metric_date', { ascending: false });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
    }

    const metricsMap = new Map();
    (metrics || []).forEach((metric) => {
      if (!metricsMap.has(metric.campaign_id)) {
        metricsMap.set(metric.campaign_id, []);
      }
      metricsMap.get(metric.campaign_id).push(metric);
    });

    const enrichedCampaigns = (campaigns || []).map((campaign) => {
      const campaignMetrics = metricsMap.get(campaign.id) || [];
      return createCampaignSummary(campaign, campaignMetrics, []);
    });

    return sendSuccess(res, { campaigns: enrichedCampaigns });
  } catch (error) {
    console.error('Campaigns list error:', error);
    return sendSuccess(res, { campaigns: [] });
  }
});

router.get('/campaigns/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  const advertiserId = await resolveAdvertiserId(req);

  if (!supabase) {
    // Mock response for development
    const mockCampaign = {
      id: campaignId,
      name: 'Demo Campaign',
      description: 'A sample campaign with drops and content',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: null,
      total_gem_budget: 1500,
      gems_spent: 250,
      promoshare_contribution: 100,
      created_at: new Date().toISOString(),
      content_items: [
        { id: 'c1', content_type: 'link', title: 'Product Launch Post', url: 'https://instagram.com/p/example' }
      ],
      drops: [
        { id: 'd1', title: 'Share our launch post', drop_type: 'share', gem_reward: 10, keys_cost: 1, max_participants: 100, current_participants: 25, status: 'active' },
        { id: 'd2', title: 'Create a review video', drop_type: 'create', gem_reward: 50, keys_cost: 3, max_participants: 20, current_participants: 5, status: 'active' }
      ],
      coupons: [
        { id: 'cp1', title: '20% Off First Order', discount_type: 'percent', discount_value: 20, quantity_total: 100, quantity_remaining: 85 }
      ],
      stats: {
        total_drops: 2,
        total_applications: 30,
        completed_applications: 20,
        total_gems_awarded: 250,
        total_tickets_awarded: 20
      }
    };
    return sendSuccess(res, { campaign: mockCampaign });
  }

  try {
    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('advertiser_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('advertiser_id', advertiserId)
      .single();

    if (campaignError || !campaign) {
      console.error('Error fetching campaign:', campaignError);
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    // Fetch content items
    const { data: contentItems } = await supabase
      .from('campaign_content_items')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sort_order', { ascending: true });

    // Fetch drops with application counts
    const { data: drops } = await supabase
      .from('campaign_drops')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });

    // Fetch coupons
    const { data: coupons } = await supabase
      .from('campaign_coupons')
      .select('*')
      .eq('campaign_id', campaignId);

    // Get campaign stats
    const { data: stats } = await supabase
      .rpc('get_campaign_stats', { p_campaign_id: campaignId });

    return sendSuccess(res, {
      campaign: {
        ...campaign,
        content_items: contentItems || [],
        drops: drops || [],
        coupons: coupons || [],
        stats: stats?.[0] || {
          total_drops: drops?.length || 0,
          total_applications: 0,
          completed_applications: 0,
          total_gems_awarded: 0,
          total_tickets_awarded: 0,
          total_coupons: coupons?.length || 0,
          coupons_claimed: 0
        }
      }
    });
  } catch (error) {
    console.error('Campaign detail error:', error);
    return sendError(res, 500, 'Failed to load campaign', 'SERVER_ERROR');
  }
});

// Update campaign
router.patch('/campaigns/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);
  const {
    name,
    objective,
    status,
    start_date,
    end_date,
    total_budget,
    target_audience,
  } = req.body || {};

  if (!supabase) {
    const campaign = demoCampaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    if (name !== undefined) campaign.name = name;
    if (objective !== undefined) campaign.objective = objective;
    if (status !== undefined) campaign.status = status;
    if (start_date !== undefined) campaign.start_date = start_date;
    if (end_date !== undefined) campaign.end_date = end_date;
    if (total_budget !== undefined) campaign.total_budget = total_budget;
    if (target_audience !== undefined) campaign.target_audience = target_audience;
    campaign.updated_at = new Date().toISOString();

    return sendSuccess(res, { campaign: formatCampaignRecord(campaign) }, 'Campaign updated successfully');
  }

  try {
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (objective !== undefined) updates.objective = objective;
    if (status !== undefined) updates.status = status;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (total_budget !== undefined) updates.total_budget = total_budget;
    if (target_audience !== undefined) updates.target_audience = JSON.stringify(target_audience);

    if (Object.keys(updates).length === 0) {
      return sendError(res, 422, 'No fields to update', 'VALIDATION_ERROR');
    }

    const { data: campaign, error } = await supabase
      .from('advertiser_campaigns')
      .update(updates)
      .eq('id', campaignId)
      .eq('advertiser_account_id', advertiserId)
      .select()
      .single();

    if (error || !campaign) {
      console.error('Error updating campaign:', error);
      return sendError(res, 404, 'Campaign not found or update failed', 'CAMPAIGN_NOT_FOUND');
    }

    return sendSuccess(res, {
      campaign: formatCampaignRecord(campaign)
    }, 'Campaign updated successfully');
  } catch (error) {
    console.error('Campaign update error:', error);
    return sendError(res, 500, 'Failed to update campaign', 'SERVER_ERROR');
  }
});

// Delete campaign
router.delete('/campaigns/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);

  if (!supabase) {
    const index = demoCampaigns.findIndex((c) => c.id === campaignId);
    if (index === -1) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    demoCampaigns.splice(index, 1);
    demoCampaignMetrics.delete(campaignId);
    demoCampaignContent.delete(campaignId);
    demoCampaignDrops.delete(campaignId);

    return sendSuccess(res, {}, 'Campaign deleted successfully');
  }

  try {
    const { error } = await supabase
      .from('advertiser_campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('advertiser_account_id', advertiserId);

    if (error) {
      console.error('Error deleting campaign:', error);
      return sendError(res, 404, 'Campaign not found or delete failed', 'CAMPAIGN_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Campaign deleted successfully');
  } catch (error) {
    console.error('Campaign delete error:', error);
    return sendError(res, 500, 'Failed to delete campaign', 'SERVER_ERROR');
  }
});

// Add funds to campaign
router.post('/campaigns/:campaignId/funds', async (req, res) => {
  const { campaignId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);
  const { amount, provider = 'mock' } = req.body || {};

  if (!amount || amount <= 0) {
    return sendError(res, 422, 'Valid amount is required', 'VALIDATION_ERROR');
  }

  if (!supabase) {
    const campaign = demoCampaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    campaign.total_budget = toNumber(campaign.total_budget, 2) + toNumber(amount, 2);
    campaign.updated_at = new Date().toISOString();

    return sendSuccess(res, {
      campaign: formatCampaignRecord(campaign),
      amount_added: toNumber(amount, 2),
      new_total: campaign.total_budget,
    }, 'Funds added successfully');
  }

  try {
    const { data: campaign, error: fetchError } = await supabase
      .from('advertiser_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('advertiser_account_id', advertiserId)
      .single();

    if (fetchError || !campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    const newTotal = toNumber(campaign.total_budget, 2) + toNumber(amount, 2);

    const { data: updated, error: updateError } = await supabase
      .from('advertiser_campaigns')
      .update({ total_budget: newTotal })
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campaign budget:', updateError);
      return sendError(res, 500, 'Failed to add funds', 'DATABASE_ERROR');
    }

    return sendSuccess(res, {
      campaign: formatCampaignRecord(updated),
      amount_added: toNumber(amount, 2),
      new_total: newTotal,
    }, 'Funds added successfully');
  } catch (error) {
    console.error('Add funds error:', error);
    return sendError(res, 500, 'Failed to add funds', 'SERVER_ERROR');
  }
});

// Add content to campaign
router.post('/campaigns/:campaignId/content', async (req, res) => {
  const { campaignId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);
  const {
    title,
    description,
    platform,
    media_url,
    status = 'pending',
  } = req.body || {};

  if (!title || !platform) {
    return sendError(res, 422, 'Title and platform are required', 'VALIDATION_ERROR');
  }

  const now = new Date().toISOString();

  if (!supabase) {
    const campaign = demoCampaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    const content = {
      id: `content-${Date.now()}`,
      campaign_id: campaignId,
      title,
      description: description || '',
      platform,
      media_url: media_url || '',
      status,
      posted_at: now,
      impressions: 0,
      clicks: 0,
      engagements: 0,
      conversions: 0,
    };

    const existingContent = demoCampaignContent.get(campaignId) || [];
    existingContent.push(content);
    demoCampaignContent.set(campaignId, existingContent);

    return res.status(201).json({
      status: 'success',
      data: { content: formatContentRecord(content) },
      message: 'Content added successfully'
    });
  }

  try {
    const { data: campaign, error: fetchError } = await supabase
      .from('advertiser_campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('advertiser_account_id', advertiserId)
      .single();

    if (fetchError || !campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    const { data: content, error: insertError } = await supabase
      .from('content_items')
      .insert({
        drop_id: campaignId,
        title,
        description: description || '',
        platform,
        media_url: media_url || '',
        status,
        posted_at: now,
        impressions: 0,
        clicks: 0,
        engagements: 0,
        conversions: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating content:', insertError);
      return sendError(res, 500, 'Failed to add content', 'DATABASE_ERROR');
    }

    return res.status(201).json({
      status: 'success',
      data: { content: formatContentRecord(content) },
      message: 'Content added successfully'
    });
  } catch (error) {
    console.error('Add content error:', error);
    return sendError(res, 500, 'Failed to add content', 'SERVER_ERROR');
  }
});

// Get campaign drops
router.get('/campaigns/:campaignId/drops', async (req, res) => {
  const { campaignId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);

  if (!supabase) {
    const campaign = demoCampaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    const drops = demoCampaignDrops.get(campaignId) || [];
    return sendSuccess(res, { drops });
  }

  try {
    const { data: campaign, error: fetchError } = await supabase
      .from('advertiser_campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('advertiser_account_id', advertiserId)
      .single();

    if (fetchError || !campaign) {
      return sendError(res, 404, 'Campaign not found', 'CAMPAIGN_NOT_FOUND');
    }

    // For now, return empty array - drops table integration can be added later
    return sendSuccess(res, { drops: [] });
  } catch (error) {
    console.error('Get drops error:', error);
    return sendError(res, 500, 'Failed to fetch drops', 'SERVER_ERROR');
  }
});

router.get('/coupons/:couponId', async (req, res) => {
  const { couponId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);

  if (!supabase) {
    ensureDemoCoupons();
    const coupon = advertiserCoupons.find((entry) => entry.id === couponId);
    if (!coupon) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }
    const assignments = couponAssignments.filter((assignment) => assignment.coupon_id === couponId);
    const redemptions = couponRedemptions.filter((redemption) => redemption.coupon_id === couponId);
    return sendSuccess(res, {
      coupon: formatCouponRecord({ ...coupon, assignments, redemptions }),
    });
  }

  try {
    const { data: coupon, error: couponError } = await supabase
      .from('advertiser_coupons')
      .select('*')
      .eq('id', couponId)
      .eq('advertiser_account_id', advertiserId)
      .single();

    if (couponError || !coupon) {
      console.error('Error fetching coupon:', couponError);
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }

    const { data: assignments, error: assignmentsError } = await supabase
      .from('advertiser_coupon_assignments')
      .select('*')
      .eq('coupon_id', couponId);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
    }

    const { data: redemptions, error: redemptionsError } = await supabase
      .from('advertiser_coupon_redemptions')
      .select('*')
      .eq('coupon_id', couponId)
      .order('redeemed_at', { ascending: false });

    if (redemptionsError) {
      console.error('Error fetching redemptions:', redemptionsError);
    }

    return sendSuccess(res, {
      coupon: formatCouponRecord({
        ...coupon,
        conditions: parseJsonField(coupon.conditions, {}),
        assignments: assignments || [],
        redemptions: redemptions || [],
      }),
    });
  } catch (error) {
    console.error('Coupon detail error:', error);
    return sendError(res, 500, 'Failed to load coupon', 'SERVER_ERROR');
  }
});

// Update coupon
router.patch('/coupons/:couponId', async (req, res) => {
  const { couponId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);
  const {
    title,
    description,
    status,
    reward_type,
    value,
    value_unit,
    start_date,
    end_date,
    conditions,
  } = req.body || {};

  if (!supabase) {
    ensureDemoCoupons(req.user?.id);
    const coupon = advertiserCoupons.find((entry) => entry.id === couponId);
    if (!coupon) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }

    if (title !== undefined) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (status !== undefined) coupon.status = status;
    if (reward_type !== undefined) coupon.reward_type = reward_type;
    if (value !== undefined) coupon.value = toNumber(value, 2);
    if (value_unit !== undefined) coupon.value_unit = value_unit;
    if (start_date !== undefined) coupon.start_date = start_date;
    if (end_date !== undefined) coupon.end_date = end_date;
    if (conditions !== undefined) coupon.conditions = conditions;
    coupon.updated_at = new Date().toISOString();

    return sendSuccess(res, { coupon: formatCouponRecord(coupon) }, 'Coupon updated successfully');
  }

  try {
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (reward_type !== undefined) updates.reward_type = reward_type;
    if (value !== undefined) updates.value = toNumber(value, 2);
    if (value_unit !== undefined) updates.value_unit = value_unit;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (conditions !== undefined) updates.conditions = JSON.stringify(conditions);

    if (Object.keys(updates).length === 0) {
      return sendError(res, 422, 'No fields to update', 'VALIDATION_ERROR');
    }

    const { data: coupon, error } = await supabase
      .from('advertiser_coupons')
      .update(updates)
      .eq('id', couponId)
      .eq('advertiser_account_id', advertiserId)
      .select()
      .single();

    if (error || !coupon) {
      console.error('Error updating coupon:', error);
      return sendError(res, 404, 'Coupon not found or update failed', 'COUPON_NOT_FOUND');
    }

    return sendSuccess(res, {
      coupon: { ...coupon, conditions: parseJsonField(coupon.conditions, {}) }
    }, 'Coupon updated successfully');
  } catch (error) {
    console.error('Coupon update error:', error);
    return sendError(res, 500, 'Failed to update coupon', 'SERVER_ERROR');
  }
});

// Delete coupon
router.delete('/coupons/:couponId', async (req, res) => {
  const { couponId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);

  if (!supabase) {
    const index = advertiserCoupons.findIndex((entry) => entry.id === couponId);
    if (index === -1) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }
    advertiserCoupons.splice(index, 1);
    return sendSuccess(res, {}, 'Coupon deleted successfully');
  }

  try {
    // Check if it has active assignments first? Maybe just delete.
    const { error } = await supabase
      .from('advertiser_coupons')
      .delete()
      .eq('id', couponId)
      .eq('advertiser_account_id', advertiserId);

    if (error) {
      console.error('Error deleting coupon:', error);
      return sendError(res, 404, 'Coupon not found or delete failed', 'COUPON_NOT_FOUND');
    }

    return sendSuccess(res, {}, 'Coupon deleted successfully');
  } catch (error) {
    console.error('Coupon delete error:', error);
    return sendError(res, 500, 'Failed to delete coupon', 'SERVER_ERROR');
  }
});

// Replenish coupon
router.post('/coupons/:couponId/replenish', async (req, res) => {
  const { couponId } = req.params;
  const advertiserId = await resolveAdvertiserId(req.user);
  const { quantity } = req.body || {};

  if (!quantity || quantity <= 0) {
    return sendError(res, 422, 'Valid quantity is required', 'VALIDATION_ERROR');
  }

  if (!supabase) {
    ensureDemoCoupons(req.user?.id);
    const coupon = advertiserCoupons.find((entry) => entry.id === couponId);
    if (!coupon) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }

    coupon.quantity_total += Math.floor(quantity);
    coupon.quantity_remaining += Math.floor(quantity);
    coupon.updated_at = new Date().toISOString();

    return sendSuccess(res, { coupon: formatCouponRecord(coupon) }, 'Coupon replenished successfully');
  }

  try {
    const { data: coupon, error: fetchError } = await supabase
      .from('advertiser_coupons')
      .select('*')
      .eq('id', couponId)
      .eq('advertiser_account_id', advertiserId)
      .single();

    if (fetchError || !coupon) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }

    const { data: updated, error: updateError } = await supabase
      .from('advertiser_coupons')
      .update({
        quantity_total: coupon.quantity_total + Math.floor(quantity),
        quantity_remaining: coupon.quantity_remaining + Math.floor(quantity)
      })
      .eq('id', couponId)
      .select()
      .single();

    if (updateError) {
      console.error('Error replenishing coupon:', updateError);
      return sendError(res, 500, 'Failed to replenish coupon', 'DATABASE_ERROR');
    }

    return sendSuccess(res, {
      coupon: { ...updated, conditions: parseJsonField(updated.conditions, {}) }
    }, 'Coupon replenished successfully');
  } catch (error) {
    console.error('Replenish error:', error);
    return sendError(res, 500, 'Failed to replenish coupon', 'SERVER_ERROR');
  }
});

router.post('/coupons/:couponId/redeem', async (req, res) => {
  const { couponId } = req.params;
  const { user_id, user_name } = req.body || {};

  if (!supabase) {
    ensureDemoCoupons(req.user?.id);
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
  }

  try {
    const { data: coupon, error: fetchError } = await supabase
      .from('advertiser_coupons')
      .select('*')
      .eq('id', couponId)
      .single();

    if (fetchError || !coupon) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }

    if (coupon.quantity_remaining <= 0) {
      return sendError(res, 422, 'No remaining quantity', 'COUPON_DEPLETED');
    }

    const { data: redemption, error: redemptionError } = await supabase
      .from('advertiser_coupon_redemptions')
      .insert({
        coupon_id: couponId,
        user_id: user_id || null,
        user_name: user_name || 'Demo User',
        reward_value: coupon.value,
        reward_unit: coupon.value_unit,
        status: 'completed'
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      return sendError(res, 500, 'Failed to redeem coupon', 'DATABASE_ERROR');
    }

    const { error: updateError } = await supabase
      .from('advertiser_coupons')
      .update({ quantity_remaining: Math.max(0, coupon.quantity_remaining - 1) })
      .eq('id', couponId);

    if (updateError) {
      console.error('Error updating coupon quantity:', updateError);
    }

    return sendSuccess(res, {
      redemption,
      coupon: { ...coupon, quantity_remaining: Math.max(0, coupon.quantity_remaining - 1) }
    }, 'Coupon redemption recorded');
  } catch (error) {
    console.error('Redemption error:', error);
    return sendError(res, 500, 'Failed to redeem coupon', 'SERVER_ERROR');
  }
});

module.exports = router;
