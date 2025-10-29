import { ContentHolding, PredictionSummary, ContentHoldingDetail, PredictionDetail } from '@/shared/types';

const USE_MOCK_DATA = !import.meta.env.VITE_API_BASE_URL;

const fallbackHoldings = (): ContentHolding[] => [
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
    last_trade_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
    last_trade_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    is_listed: false,
    visibility: 'public',
  },
];

const fallbackPredictions = (): PredictionSummary[] => [
  {
    id: 'prediction-demo-1',
    forecast_id: 'forecast-demo-1',
    content_title: 'Creator Toolkit Walkthrough',
    platform: 'youtube',
    prediction_side: 'over',
    amount: 150,
    potential_payout: 315,
    status: 'active',
    result: undefined,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: undefined,
  },
  {
    id: 'prediction-demo-2',
    forecast_id: 'forecast-demo-2',
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

const fallbackHoldingDetail = (contentId: string): ContentHoldingDetail => {
  const holdings = fallbackHoldings();
  const holding = holdings.find((item) => item.content_id === contentId) || holdings[0];
  const now = Date.now();

  return {
    holding,
    content: {
      description:
        'Behind-the-scenes look at the launch strategy, featuring creator testimonials and performance metrics.',
      genres: ['Campaign Spotlight', 'Community'],
      tags: ['launch', 'growth', 'community'],
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

const fallbackPredictionDetail = (predictionId: string): PredictionDetail => {
  const predictions = fallbackPredictions();
  const prediction = predictions.find((item) => item.id === predictionId) || predictions[0];
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

export const getPortfolioHoldings = async (userId?: string): Promise<ContentHolding[]> => {
  if (USE_MOCK_DATA) {
    return fallbackHoldings();
  }

  try {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await fetch(`/api/portfolio/holdings${params}`, { credentials: 'include' });
    if (!response.ok) {
      return fallbackHoldings();
    }
    const data = await response.json();
    return data.holdings || fallbackHoldings();
  } catch (error) {
    console.error('Failed to fetch portfolio holdings:', error);
    return fallbackHoldings();
  }
};

export const getPortfolioPredictions = async (userId?: string): Promise<PredictionSummary[]> => {
  if (USE_MOCK_DATA) {
    return fallbackPredictions();
  }

  try {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await fetch(`/api/portfolio/predictions${params}`, { credentials: 'include' });
    if (!response.ok) {
      return fallbackPredictions();
    }
    const data = await response.json();
    return data.predictions || fallbackPredictions();
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    return fallbackPredictions();
  }
};

export const getHoldingDetail = async (contentId: string, userId?: string): Promise<ContentHoldingDetail> => {
  if (USE_MOCK_DATA) {
    return fallbackHoldingDetail(contentId);
  }

  try {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await fetch(`/api/portfolio/holdings/${contentId}${params}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      return fallbackHoldingDetail(contentId);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch holding detail:', error);
    return fallbackHoldingDetail(contentId);
  }
};

export const getPredictionDetail = async (predictionId: string): Promise<PredictionDetail> => {
  if (USE_MOCK_DATA) {
    return fallbackPredictionDetail(predictionId);
  }

  try {
    const response = await fetch(`/api/portfolio/predictions/${predictionId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      return fallbackPredictionDetail(predictionId);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch prediction detail:', error);
    return fallbackPredictionDetail(predictionId);
  }
};
