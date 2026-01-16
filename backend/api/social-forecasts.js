const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

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
      return res.status(500).json({ success: false, error: 'Failed to fetch forecasts' });
    }

    // Flatten the structure to put media_url at the top level
    const forecasts = (forecastsData || []).map(f => ({
      ...f,
      media_url: f.content?.media_url || null
    }));

    res.json(forecasts);
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forecasts' });
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

// Create new social forecast
router.post('/', async (req, res) => {
  try {
    const {
      content_id,
      platform,
      content_url,
      forecast_type,
      target_value,
      odds,
      expires_at,
      initial_amount,
      initial_side
    } = req.body;

    if (!content_url || !forecast_type || !target_value || !odds || !expires_at || !initial_amount || !initial_side) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (!supabase) {
      // Mock creation for development
      return res.json({
        success: true,
        forecast: {
          id: Date.now(),
          content_id: content_id || null,
          creator_id: 1, // TODO: Get from authenticated user
          creator_name: 'Demo User',
          platform,
          content_url,
          content_title: 'Demo Content',
          forecast_type,
          target_value: parseInt(target_value),
          current_value: 0,
          odds: parseFloat(odds),
          pool_size: parseFloat(initial_amount),
          creator_initial_amount: parseFloat(initial_amount),
          creator_side: initial_side,
          expires_at,
          created_at: new Date().toISOString(),
          participants: 1,
          status: 'active'
        },
        message: 'Forecast created successfully (development mode)'
      });
    }

    // Create forecast in database
    const { data: forecast, error } = await supabase
      .from('social_forecasts')
      .insert([{
        content_id: content_id || null,
        creator_id: 1, // TODO: Get from authenticated user
        platform,
        content_url,
        forecast_type,
        target_value: parseInt(target_value),
        odds: parseFloat(odds),
        expires_at,
        initial_amount: parseFloat(initial_amount),
        initial_side,
        pool_size: parseFloat(initial_amount),
        current_value: 0,
        status: 'active',
        participants: 1
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error creating forecast:', error);
      return res.status(500).json({ success: false, error: 'Failed to create forecast' });
    }

    // Update user wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        balance: supabase.raw(`balance - ${parseFloat(initial_amount)}`)
      })
      .eq('user_id', 1) // TODO: Get from authenticated user
      .eq('currency_type', 'USD');

    if (walletError) {
      console.error('Database error updating wallet:', walletError);
    }

    res.json({
      success: true,
      forecast,
      message: 'Forecast created successfully'
    });
  } catch (error) {
    console.error('Error creating forecast:', error);
    res.status(500).json({ success: false, error: 'Failed to create forecast' });
  }
});

// Place prediction on forecast
router.post('/:id/predict', async (req, res) => {
  try {
    const { id } = req.params;
    const { prediction_amount, prediction_side } = req.body;

    if (!prediction_amount || !prediction_side) {
      return res.status(400).json({
        success: false,
        error: 'Prediction amount and side are required'
      });
    }

    if (!supabase) {
      // Mock prediction for development
      return res.json({
        success: true,
        prediction: {
          id: Date.now(),
          forecast_id: parseInt(id),
          user_id: 1, // TODO: Get from authenticated user
          prediction_amount: parseFloat(prediction_amount),
          prediction_side,
          potential_payout: (parseFloat(prediction_amount) * 2.0).toFixed(2), // Mock odds
          created_at: new Date().toISOString()
        },
        message: 'Prediction placed successfully (development mode)'
      });
    }

    // Get forecast details
    const { data: forecast, error: forecastError } = await supabase
      .from('social_forecasts')
      .select('*')
      .eq('id', id)
      .single();

    if (forecastError || !forecast) {
      return res.status(404).json({ success: false, error: 'Forecast not found' });
    }

    if (forecast.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Forecast is no longer active' });
    }

    if (new Date(forecast.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'Forecast has expired' });
    }

    // Create prediction
    const { data: prediction, error: predictionError } = await supabase
      .from('investor_predictions')
      .insert([{
        forecast_id: parseInt(id),
        user_id: 1, // TODO: Get from authenticated user
        prediction_amount: parseFloat(prediction_amount),
        prediction_side,
        potential_payout: parseFloat(prediction_amount) * forecast.odds,
        status: 'active'
      }])
      .select()
      .single();

    if (predictionError) {
      console.error('Database error creating prediction:', predictionError);
      return res.status(500).json({ success: false, error: 'Failed to place prediction' });
    }

    // Update forecast pool size and participant count
    const { error: updateError } = await supabase
      .from('social_forecasts')
      .update({
        pool_size: supabase.raw(`pool_size + ${parseFloat(prediction_amount)}`),
        participants: supabase.raw('participants + 1')
      })
      .eq('id', id);

    if (updateError) {
      console.error('Database error updating forecast:', updateError);
    }

    // Update user wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        balance: supabase.raw(`balance - ${parseFloat(prediction_amount)}`)
      })
      .eq('user_id', 1) // TODO: Get from authenticated user
      .eq('currency_type', 'USD');

    if (walletError) {
      console.error('Database error updating wallet:', walletError);
    }

    res.json({
      success: true,
      prediction,
      message: 'Prediction placed successfully'
    });
  } catch (error) {
    console.error('Error placing prediction:', error);
    res.status(500).json({ success: false, error: 'Failed to place prediction' });
  }
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
    // IMPORTANT: To ensure solvency, we must use the Total Pool divided by Winning Pool volume.
    // If we strictly honored fixed odds, we might be insolvent. 
    // For this hardening patch, we will prioritize Solvency over Fixed Odds fidelity if the pool is insufficient.

    const side = winning_side.toLowerCase();
    const winningPredictions = predictions.filter(p => p.prediction_side.toLowerCase() === side);
    const totalPool = forecast.pool_size;

    // Sum of money bet on the winning side (excluding creator stake for now, assuming creator stake is in pool_size but logic handled separately or simplistically)
    // Actually, let's treat the 'creator_initial_amount' as just another bet in the pool for simplicity of this v1 implementation
    let volumeOnWinner = winningPredictions.reduce((sum, p) => sum + p.prediction_amount, 0);

    // If creator won, add their stake
    const creatorWon = forecast.creator_side === side;
    if (creatorWon) {
      volumeOnWinner += forecast.creator_initial_amount;
    }

    // Avoid division by zero
    if (volumeOnWinner === 0) {
      // House takes it all? Or refund? Let's just resolve state and exit.
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

    // Pay Creators
    if (creatorWon) {
      // Share of pool = (MyStake / TotalWinningVolume)
      const share = forecast.creator_initial_amount / volumeOnWinner;
      const payout = share * totalPool;
      payouts.push({ user_id: forecast.creator_id, amount: payout, type: 'creator' });
    }

    // Pay Predictors
    for (const p of winningPredictions) {
      const share = p.prediction_amount / volumeOnWinner;
      const payout = share * totalPool;
      payouts.push({ user_id: p.user_id, amount: payout, type: 'investor', prediction_id: p.id });
    }

    // 5. Execute Transactions
    for (const pay of payouts) {
      // Credit User Wallet
      await supabase
        .from('wallets')
        .update({ balance: supabase.raw(`balance + ${pay.amount}`) })
        .eq('user_id', pay.user_id)
        .eq('currency_type', 'USD');

      // Update Prediction Record
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

    // Mark losing predictions as lost
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
