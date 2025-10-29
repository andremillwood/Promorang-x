const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
      return next();
    }
  }

  if (process.env.NODE_ENV === 'development') {
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
    return next();
  }

  return res.status(401).json({ success: false, error: 'Unauthorized' });
});

router.get('/dashboard', async (req, res) => {
  const userTier = req.user?.advertiser_tier || req.user?.user_tier || 'free';

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

  res.json({
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

  res.json(mockContent);
});

module.exports = router;
