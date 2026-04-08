const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Auth middleware - extract user ID from JWT token or use mock for development
const authMiddleware = async (req, res, next) => {
  try {
    // For development, use mock user
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 'mock-user-id', email: 'demo@example.com' };
      return next();
    }

    // For production, extract from JWT token or session
    // const token = req.headers.authorization?.replace('Bearer ', '');
    // if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // TODO: Implement proper JWT verification
    req.user = { id: 'mock-user-id', email: 'demo@example.com' };
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

// =====================================================
// PUBLIC ENDPOINTS - No auth required (for SEO/browsing)
// =====================================================

// Public forecasts listing
router.get('/public', async (req, res) => {
  try {
    if (!supabase) {
      const mockForecasts = [
        {
          id: 1,
          creator_name: 'Demo Creator',
          platform: 'instagram',
          content_title: 'Amazing sunset view!',
          media_url: '/assets/demo/neon-festival.png',
          forecast_type: 'views',
          target_value: 10000,
          current_value: 7500,
          odds: 2.0,
          pool_size: 250.50,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          participants: 12,
          status: 'active'
        },
        {
          id: 2,
          creator_name: 'Content Creator',
          platform: 'youtube',
          content_title: 'Tutorial: How to grow your audience',
          media_url: '/assets/demo/tech-summit.png',
          forecast_type: 'likes',
          target_value: 5000,
          current_value: 3200,
          odds: 1.8,
          pool_size: 180.25,
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          participants: 8,
          status: 'active'
        },
        {
          id: 3,
          creator_name: 'Viral Star',
          platform: 'tiktok',
          content_title: 'Dance Challenge Video',
          media_url: '/assets/demo/tiktok-drop.png',
          forecast_type: 'views',
          target_value: 50000,
          current_value: 32000,
          odds: 1.5,
          pool_size: 420.00,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          participants: 24,
          status: 'active'
        }
      ];
      return res.json(mockForecasts);
    }

    const { data: forecasts, error } = await supabase
      .from('social_forecasts')
      .select('id, creator_side, platform, content_title, forecast_type, target_value, current_value, odds, pool_size, expires_at, participants, status, content:content_pieces(media_url, creator_name)')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('pool_size', { ascending: false })
      .limit(12);

    if (error) throw error;

    const result = (forecasts || []).map(f => ({
      ...f,
      media_url: f.content?.media_url || '/assets/demo/neon-festival.png'
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching public forecasts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forecasts' });
  }
});

// Public single forecast
router.get('/:id/public', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.json({
        id: parseInt(id),
        creator_name: 'Demo Creator',
        platform: 'instagram',
        content_title: 'Amazing content!',
        media_url: '/assets/demo/neon-festival.png',
        forecast_type: 'views',
        target_value: 10000,
        current_value: 7500,
        odds: 2.0,
        pool_size: 250.50,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        participants: 12,
        status: 'active'
      });
    }

    const { data: forecast, error } = await supabase
      .from('social_forecasts')
      .select('id, creator_side, platform, content_title, forecast_type, target_value, current_value, odds, pool_size, expires_at, participants, status, content:content_pieces(media_url, creator_name)')
      .eq('id', id)
      .single();

    if (error || !forecast) {
      return res.status(404).json({ error: 'Forecast not found' });
    }

    res.json({
      ...forecast,
      media_url: forecast.content?.media_url || null
    });
  } catch (error) {
    console.error('Error fetching public forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// =====================================================
// PROTECTED ROUTES - Auth required below this line
// =====================================================
// Apply auth to all routes
router.use(authMiddleware);

// Get all social forecasts
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      // Mock data fallback for development
      const mockForecasts = [
        {
          id: 1,
          content_id: 1,
          creator_id: 1,
          creator_name: 'Demo Creator',
          platform: 'instagram',
          content_url: 'https://instagram.com/p/demo123',
          media_url: '/assets/demo/neon-festival.png',
          content_title: 'Amazing sunset view!',
          forecast_type: 'views',
          target_value: 10000,
          current_value: 7500,
          odds: 2.0,
          pool_size: 250.50,
          creator_initial_amount: 50.00,
          creator_side: 'over',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          participants: 12,
          status: 'active'
        },
        {
          id: 2,
          content_id: 2,
          creator_id: 2,
          creator_name: 'Content Creator',
          platform: 'youtube',
          content_url: 'https://youtube.com/watch?v=demo456',
          media_url: '/assets/demo/tech-summit.png',
          content_title: 'Tutorial: How to create forecasts',
          forecast_type: 'likes',
          target_value: 5000,
          current_value: 3200,
          odds: 1.8,
          pool_size: 180.25,
          creator_initial_amount: 25.00,
          creator_side: 'over',
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          participants: 8,
          status: 'active'
        }
      ];
      return res.json(mockForecasts);
    }

    // Query forecasts from database
    const { data: forecastsData, error } = await supabase
      .from('social_forecasts')
      .select('*, content:content_items(media_url)')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Database error fetching forecasts:', error);
      // Return empty array instead of 500 - graceful degradation
      return res.json([]);
    }

    // Flatten the structure to put media_url at the top level
    const forecasts = (forecastsData || []).map(f => ({
      ...f,
      media_url: f.content?.media_url || null
    }));

    res.json(forecasts);
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    // Return empty array instead of 500 - graceful degradation
    res.json([]);
  }
});

// Get specific forecast
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      // Mock data fallback
      return res.json({
        id: parseInt(id),
        content_id: 1,
        creator_id: 1,
        creator_name: 'Demo Creator',
        platform: 'instagram',
        content_url: 'https://instagram.com/p/demo123',
        content_title: 'Amazing content!',
        forecast_type: 'views',
        target_value: 10000,
        current_value: 7500,
        odds: 2.0,
        pool_size: 250.50,
        creator_initial_amount: 50.00,
        creator_side: 'over',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        participants: 12,
        status: 'active'
      });
    }

    const { data: forecast, error } = await supabase
      .from('social_forecasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'Forecast not found' });
    }

    res.json(forecast);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forecast' });
  }
});

// Create new social forecast - DISABLED
router.post('/', async (req, res) => {
  return res.status(403).json({
    error: 'Forecasts Frozen',
    message: 'Creating new social forecasts is currently disabled during our strategic realignment.'
  });
});

// Place prediction on forecast - DISABLED
router.post('/:id/predict', async (req, res) => {
  return res.status(403).json({
    error: 'Forecasts Frozen',
    message: 'Placing predictions is currently disabled.'
  });
});

// Get forecasts for specific content
router.get('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;

    if (!supabase) {
      // Mock data fallback
      return res.json([]);
    }

    const { data: forecasts, error } = await supabase
      .from('social_forecasts')
      .select('*')
      .eq('content_id', contentId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching content forecasts:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch forecasts' });
    }

    res.json(forecasts || []);
  } catch (error) {
    console.error('Error fetching content forecasts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forecasts' });
  }
});

// Resolve forecast and distribute payouts (Admin/Oracle only)
router.post('/:id/resolve', async (req, res) => {
  try {
    return res.status(403).json({
      error: 'Forecasts Frozen',
      message: 'Forecast resolution is disabled.'
    });
    const { id } = req.params;
    const { result, winning_side } = req.body; // result: 'over' | 'under', winning_side: 'over' | 'under'

    if (!result || !winning_side) {
      return res.status(400).json({ success: false, error: 'Result and winning_side are required' });
    }

    // 1. Fetch Forecast
    const { data: forecast, error: forecastError } = await supabase
      .from('social_forecasts')
      .select('*')
      .eq('id', id)
      .single();

    if (forecastError || !forecast) {
      return res.status(404).json({ success: false, error: 'Forecast not found' });
    }

    if (forecast.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Forecast is already resolved or not active' });
    }

    // 2. Fetch All Predictions
    const { data: predictions, error: predError } = await supabase
      .from('investor_predictions')
      .select('*')
      .eq('forecast_id', id);

    if (predError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch predictions' });
    }

    // 3. Calculate Pool Math (Parimutuel Logic)
    const side = winning_side.toLowerCase();
    const winningPredictions = predictions.filter(p => p.prediction_side.toLowerCase() === side);
    const totalPool = forecast.pool_size;

    let volumeOnWinner = winningPredictions.reduce((sum, p) => sum + p.prediction_amount, 0);

    const creatorWon = forecast.creator_side === side;
    if (creatorWon) {
      volumeOnWinner += forecast.creator_initial_amount;
    }

    if (volumeOnWinner === 0) {
      await supabase
        .from('social_forecasts')
        .update({ status: 'resolved', result, winning_side: side })
        .eq('id', id);

      return res.json({
        success: true,
        message: 'Resolved, but no winners to pay out.'
      });
    }

    // 4. Distribute Payouts
    const payouts = [];

    if (creatorWon) {
      const share = forecast.creator_initial_amount / volumeOnWinner;
      const payout = share * totalPool;
      payouts.push({ user_id: forecast.creator_id, amount: payout, type: 'creator' });
    }

    for (const p of winningPredictions) {
      const share = p.prediction_amount / volumeOnWinner;
      const payout = share * totalPool;
      payouts.push({ user_id: p.user_id, amount: payout, type: 'investor', prediction_id: p.id });
    }

    // 5. Execute Transactions
    for (const pay of payouts) {
      await supabase
        .from('wallets')
        .update({ balance: supabase.raw(`balance + ${pay.amount}`) })
        .eq('user_id', pay.user_id)
        .eq('currency_type', 'USD');

      if (pay.type === 'investor' && pay.prediction_id) {
        await supabase
          .from('investor_predictions')
          .update({
            status: 'resolved',
            actual_payout: pay.amount,
            result: 'win'
          })
          .eq('id', pay.prediction_id);
      }
    }

    const losingPredictions = predictions.filter(p => p.prediction_side.toLowerCase() !== side);
    for (const p of losingPredictions) {
      await supabase
        .from('investor_predictions')
        .update({
          status: 'resolved',
          actual_payout: 0,
          result: 'loss'
        })
        .eq('id', p.id);
    }

    // 6. Update Forecast Status
    await supabase
      .from('social_forecasts')
      .update({
        status: 'resolved',
        result: side
      })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Forecast resolved and payouts distributed',
      payout_count: payouts.length,
      total_payout: totalPool
    });

  } catch (error) {
    console.error('Error resolving forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve forecast' });
  }
});

module.exports = router;
