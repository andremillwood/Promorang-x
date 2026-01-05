const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authMiddleware } = require('../lib/auth');

// Apply auth to all routes
router.use(authMiddleware);

const mockHoldings = (userId) => {
  const now = new Date();
  return [
    {
      content_id: 'content-demo-1',
      content_title: 'Launch Campaign: Social Buzz',
      content_thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80',
      creator_id: '00000000-0000-0000-0000-000000000001',
      creator_name: 'Demo Creator',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_content',
      platform: 'instagram',
      owned_shares: 180,
      available_to_sell: 60,
      avg_cost: 8.75,
      current_price: 12.5,
      market_value: 2250,
      unrealized_gain: 675,
      day_change_pct: 3.2,
      week_change_pct: 8.5,
      month_change_pct: 22.4,
      last_trade_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      is_listed: true,
      listing_id: 'listing-demo-1',
      visibility: 'public',
    },
    {
      content_id: 'content-demo-2',
      content_title: 'Creator Toolkit Walkthrough',
      content_thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
      creator_id: '00000000-0000-0000-0000-000000000002',
      creator_name: 'Creator Collective',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator_collective',
      platform: 'youtube',
      owned_shares: 95,
      available_to_sell: 95,
      avg_cost: 15.0,
      current_price: 18.75,
      market_value: 1781.25,
      unrealized_gain: 356.25,
      day_change_pct: 1.2,
      week_change_pct: 4.7,
      month_change_pct: 12.8,
      last_trade_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      is_listed: false,
      visibility: 'public',
    },
    {
      content_id: 'content-demo-3',
      content_title: 'Weekly Market Recap',
      content_thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80',
      creator_id: '00000000-0000-0000-0000-000000000003',
      creator_name: 'Growth Analyst',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=growth_analyst',
      platform: 'tiktok',
      owned_shares: 60,
      available_to_sell: 20,
      avg_cost: 5.4,
      current_price: 6.1,
      market_value: 366,
      unrealized_gain: 42,
      day_change_pct: -0.5,
      week_change_pct: 2.2,
      month_change_pct: 6.7,
      last_trade_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      is_listed: false,
      visibility: 'private',
    },
  ];
};

const mockPredictions = (userId) => [
  {
    id: 'prediction-1',
    forecast_id: 'forecast-1',
    content_title: 'Creator Toolkit Walkthrough',
    platform: 'youtube',
    prediction_side: 'over',
    amount: 150,
    potential_payout: 315,
    status: 'active',
    result: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'prediction-2',
    forecast_id: 'forecast-2',
    content_title: 'Launch Day Reach',
    platform: 'instagram',
    prediction_side: 'under',
    amount: 80,
    potential_payout: 152,
    status: 'settled',
    result: 'won',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockHoldingDetail = (userId, contentId) => {
  const holding = mockHoldings(userId).find((item) => item.content_id === contentId);
  if (!holding) return null;

  const now = Date.now();
  return {
    holding,
    content: {
      description:
        'Behind-the-scenes look at the launch strategy, featuring creator testimonials and performance metrics.',
      genres: ['Campaign Spotlight', 'Community'],
      tags: ['launch', 'social buzz', 'behind the scenes'],
      published_at: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_views: 128000,
      engagement_rate: 12.4,
      earnings_to_date: 4320,
    },
    performance: {
      history: Array.from({ length: 14 }, (_, index) => {
        const day = new Date(now - (13 - index) * 24 * 60 * 60 * 1000);
        return {
          date: day.toISOString().split('T')[0],
          price: holding.current_price * (0.85 + index * 0.01),
          volume: Math.round(Math.random() * 120 + 40),
        };
      }),
      ledger: [
        {
          id: 'txn-1',
          type: 'purchase',
          quantity: holding.owned_shares,
          price: holding.avg_cost,
          timestamp: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'txn-2',
          type: 'dividend',
          quantity: 0,
          price: 120,
          timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    marketplace: {
      listings: [
        {
          id: 'listing-history-1',
          quantity: 40,
          ask_price: 11.8,
          status: 'filled',
          filled_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      offers: [
        {
          id: 'offer-history-1',
          quantity: 30,
          bid_price: 12.6,
          status: 'pending',
          buyer_name: 'Marketplace Analyst',
          message: 'Happy to take this block before launch day finale.',
        },
      ],
    },
  };
};

const mockPredictionDetail = (predictionId) => {
  const prediction = mockPredictions().find((item) => item.id === predictionId);
  if (!prediction) return null;

  const now = Date.now();
  return {
    prediction,
    forecast: {
      metric: '7-day reach',
      target: '125K',
      odds: 2.1,
      expires_at: new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
      creator_projection: 'Over performance expected due to paid boosts and influencer cross-promotions scheduled mid-week.',
    },
    trajectory: Array.from({ length: 10 }, (_, index) => {
      const day = new Date(now - (9 - index) * 24 * 60 * 60 * 1000);
      const actual = 60000 + index * 6500 + Math.round(Math.random() * 2500);
      return {
        date: day.toISOString().split('T')[0],
        actual,
        expected: 55000 + index * 7000,
      };
    }),
    participants: [
      {
        username: 'growth_analyst',
        amount: 150,
        side: 'over',
        status: 'active',
      },
      {
        username: 'launch_partner',
        amount: 90,
        side: 'under',
        status: 'active',
      },
    ],
  };
};

router.get('/holdings', async (req, res) => {
  const userId = req.query.userId || req.user.id;

  if (!supabase) {
    return res.json({
      user_id: userId,
      holdings: mockHoldings(userId),
      totals: {
        portfolio_value: 4400,
        invested: 3120,
        unrealized_gain: 980,
        day_change_pct: 2.1,
      },
    });
  }

  try {
    // Placeholder response until Supabase view is defined
    return res.json({
      user_id: userId,
      holdings: mockHoldings(userId),
      totals: {
        portfolio_value: 0,
        invested: 0,
        unrealized_gain: 0,
        day_change_pct: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio holdings:', error);
    return res.json({
      user_id: userId,
      holdings: mockHoldings(userId),
      totals: {
        portfolio_value: 0,
        invested: 0,
        unrealized_gain: 0,
        day_change_pct: 0,
      },
    });
  }
});

router.get('/predictions', async (req, res) => {
  const userId = req.query.userId || req.user.id;

  if (!supabase) {
    return res.json({
      user_id: userId,
      predictions: mockPredictions(userId),
    });
  }

  try {
    return res.json({
      user_id: userId,
      predictions: mockPredictions(userId),
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return res.json({
      user_id: userId,
      predictions: mockPredictions(userId),
    });
  }
});

router.get('/holdings/:id', async (req, res) => {
  const userId = req.query.userId || req.user.id;
  const { id } = req.params;

  if (!supabase) {
    const detail = mockHoldingDetail(userId, id);
    if (!detail) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }
    return res.json(detail);
  }

  try {
    const detail = mockHoldingDetail(userId, id);
    if (!detail) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }
    return res.json(detail);
  } catch (error) {
    console.error('Error fetching holding detail:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch holding detail' });
  }
});

router.get('/predictions/:id', async (req, res) => {
  const { id } = req.params;

  if (!supabase) {
    const detail = mockPredictionDetail(id);
    if (!detail) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }
    return res.json(detail);
  }

  try {
    const detail = mockPredictionDetail(id);
    if (!detail) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }
    return res.json(detail);
  } catch (error) {
    console.error('Error fetching prediction detail:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch prediction detail' });
  }
});

module.exports = router;
