const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../lib/auth');

// Apply auth to all routes
router.use(authMiddleware);

router.get('/dashboard', async (req, res) => {
  const userTier = req.user?.advertiser_tier || req.user?.user_tier || 'free';

  try {
    if (!supabase) {
      // Return existing mock logic if Supabase is unavailable
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

      return res.json({
        drops: mockDrops,
        analytics: [],
        user_tier: userTier,
        monthly_inventory: { moves: 50, proof_drops: 5, paid_drops: 0 }
      });
    }

    const userId = req.user.id;

    // Fetch real drops created by this advertiser
    const { data: drops, error: dropsError } = await supabase
      .from('drops')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (dropsError) {
      console.error('Error fetching advertiser drops:', dropsError);
      return res.status(500).json({ success: false, error: 'Failed to fetch drops' });
    }

    // Fetch analytics aggregation (Simplified for MVP, would ideally be a dedicated table or complex RPC)
    // We'll aggregate from existing drops
    const analytics = (drops || []).reduce((acc, drop) => {
      const weekStart = new Date(drop.created_at);
      weekStart.setUTCHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
      const periodKey = weekStart.toISOString();

      if (!acc[periodKey]) {
        acc[periodKey] = {
          period_start: periodKey,
          drops_created: 0,
          total_participants: 0,
          gems_spent: 0,
          impressions: 0,
          engagement_rate: 0
        };
      }

      acc[periodKey].drops_created++;
      acc[periodKey].total_participants += drop.total_applications || 0;
      acc[periodKey].gems_spent += drop.gems_paid || 0;
      acc[periodKey].impressions += (drop.total_applications || 0) * 500; // Formulaic estimate for now
      acc[periodKey].engagement_rate = 4.5; // Static base for now

      return acc;
    }, {});

    const sortedAnalytics = Object.values(analytics).sort((a, b) =>
      new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
    ).slice(0, 4);

    const inventory = {
      free: { monthly_inventory: { moves: 50, proof_drops: 5, paid_drops: 0 } },
      premium: { weekly_inventory: { moves: 200, proof_drops: 15, paid_drops: 8 } },
      super: { weekly_inventory: { moves: 500, proof_drops: 25, paid_drops: 15 } }
    };

    const tierInventory = inventory[userTier] || inventory.free;

    res.json({
      drops: drops || [],
      analytics: sortedAnalytics,
      user_tier: userTier,
      ...tierInventory
    });
  } catch (error) {
    console.error('Error in advertiser dashboard handler:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/suggested-content', async (req, res) => {
  try {
    if (supabase) {
      // Attempt to fetch high-performing content from the database
      const { data: realContent, error } = await supabase
        .from('content')
        .select('*')
        .order('views', { ascending: false })
        .limit(3);

      if (!error && realContent && realContent.length > 0) {
        return res.json(realContent.map(c => ({
          id: c.id,
          title: c.title || 'Untitled Content',
          creator_name: c.creator_name || 'Active Creator',
          platform: c.platform || 'instagram',
          platform_url: c.content_url,
          impressions_last_7_days: c.views || 0,
          engagement_rate: 5.2,
          category: 'Trending',
          thumbnail_url: c.thumbnail_url || 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=250&fit=crop',
          roi_potential: 25,
          current_sponsor_count: 0
        })));
      }
    }

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
  } catch (error) {
    console.error('Error in suggested-content:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
