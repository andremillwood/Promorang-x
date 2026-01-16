/**
 * PROMORANG REFERRAL API
 * RESTful endpoints for referral system management
 */

const express = require('express');
const router = express.Router();
const referralService = require('../services/referralService');
const { supabase: serviceSupabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const supabase = global.supabase || serviceSupabase || null;

// Helper functions
const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

// Auth middleware: use shared JWT validator so req.user is populated consistently
router.use(requireAuth);

/**
 * GET /api/referrals/my-code
 * Get or generate user's primary referral code
 */
router.get('/my-code', async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has a code
    if (!supabase) {
      return sendSuccess(res, {
        code: 'PROMO-DEMO1234',
        share_url: `https://promorang.com/signup?ref=PROMO-DEMO1234`,
      });
    }

    const { data: user } = await supabase
      .from('users')
      .select('primary_referral_code')
      .eq('id', userId)
      .single();

    let code = user?.primary_referral_code;

    // Generate if doesn't exist
    if (!code) {
      code = await referralService.generateReferralCode(userId);
    }

    const shareUrl = `${process.env.APP_URL || 'https://promorang.com'}/signup?ref=${code}`;

    return sendSuccess(res, {
      code,
      share_url: shareUrl,
      qr_code_url: `${process.env.API_URL || 'http://localhost:3001'}/api/referrals/qr/${code}`,
    });
  } catch (error) {
    console.error('[Referrals API] Error getting code:', error);
    return sendError(res, 500, 'Failed to get referral code', 'SERVER_ERROR');
  }
});

/**
 * POST /api/referrals/generate-code
 * Generate a new custom referral code
 */
router.post('/generate-code', async (req, res) => {
  try {
    const userId = req.user.id;
    const { prefix, display_name } = req.body;

    if (!supabase) {
      return sendSuccess(res, {
        code: 'PROMO-CUSTOM1234',
      }, 'Custom code generated');
    }

    const code = await referralService.generateReferralCode(
      userId,
      prefix || 'PROMO',
      display_name
    );

    return sendSuccess(res, { code }, 'Referral code generated successfully');
  } catch (error) {
    console.error('[Referrals API] Error generating code:', error);
    return sendError(res, 500, 'Failed to generate code', 'SERVER_ERROR');
  }
});

/**
 * GET /api/referrals/stats
 * Get comprehensive referral statistics for the user
 */
router.get('/stats', async (req, res) => {
  console.log('[Referrals API] GET /stats called by user:', req.user?.id);
  try {
    const userId = req.user.id;

    if (!supabase) {
      return sendSuccess(res, {
        summary: {
          total_referrals: 15,
          active_referrals: 12,
          pending_referrals: 3,
          conversion_rate: '80.0',
          total_earnings: {
            usd: 125.50,
            gems: 2500,
            points: 5000,
          },
          referral_code: 'PROMO-DEMO1234',
          tier: {
            tier_name: 'Silver',
            tier_level: 2,
            commission_rate: 0.06,
            badge_icon: '🥈',
            badge_color: '#C0C0C0',
          },
        },
        referrals: [],
        recent_commissions: [],
      });
    }

    const stats = await referralService.getReferralStats(userId);

    if (!stats) {
      return sendError(res, 404, 'Stats not found', 'NOT_FOUND');
    }

    return sendSuccess(res, stats);
  } catch (error) {
    console.error('[Referrals API] Error getting stats:', error);
    return sendError(res, 500, 'Failed to get stats', 'SERVER_ERROR');
  }
});

/**
 * GET /api/referrals/my-referrals
 * Get list of users referred by the current user
 */
router.get('/my-referrals', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    if (!supabase) {
      return sendSuccess(res, {
        referrals: [],
        total: 0,
      });
    }

    let query = supabase
      .from('user_referrals')
      .select(`
        id,
        referred_id,
        status,
        activated_at,
        total_commission_paid,
        total_gems_earned,
        total_points_earned,
        created_at,
        users!user_referrals_referred_id_fkey(username, display_name, profile_image, created_at)
      `, { count: 'exact' })
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return sendSuccess(res, {
      referrals: data || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('[Referrals API] Error getting referrals:', error);
    return sendError(res, 500, 'Failed to get referrals', 'SERVER_ERROR');
  }
});

/**
 * GET /api/referrals/earnings
 * Get detailed earnings breakdown
 */
router.get('/earnings', async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date, earning_type, limit = 100 } = req.query;

    if (!supabase) {
      return sendSuccess(res, {
        earnings: [],
        total: {
          usd: 0,
          gems: 0,
          points: 0,
        },
      });
    }

    let query = supabase
      .from('referral_commissions')
      .select('*')
      .eq('referrer_id', userId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(limit);

    if (start_date) {
      query = query.gte('paid_at', start_date);
    }

    if (end_date) {
      query = query.lte('paid_at', end_date);
    }

    if (earning_type) {
      query = query.eq('earning_type', earning_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate totals
    const totals = {
      usd: 0,
      gems: 0,
      points: 0,
    };

    (data || []).forEach(commission => {
      const currency = commission.commission_currency;
      if (totals.hasOwnProperty(currency)) {
        totals[currency] += parseFloat(commission.commission_amount);
      }
    });

    return sendSuccess(res, {
      earnings: data || [],
      total: totals,
    });
  } catch (error) {
    console.error('[Referrals API] Error getting earnings:', error);
    return sendError(res, 500, 'Failed to get earnings', 'SERVER_ERROR');
  }
});

/**
 * GET /api/referrals/tiers
 * Get all available referral tiers
 */
router.get('/tiers', async (req, res) => {
  try {
    if (!supabase) {
      return sendSuccess(res, {
        tiers: [
          {
            tier_name: 'Bronze',
            tier_level: 1,
            min_referrals: 0,
            commission_rate: 0.05,
            badge_icon: '🥉',
            badge_color: '#CD7F32',
          },
          {
            tier_name: 'Silver',
            tier_level: 2,
            min_referrals: 10,
            commission_rate: 0.06,
            badge_icon: '🥈',
            badge_color: '#C0C0C0',
          },
          {
            tier_name: 'Gold',
            tier_level: 3,
            min_referrals: 50,
            commission_rate: 0.075,
            badge_icon: '🥇',
            badge_color: '#FFD700',
          },
          {
            tier_name: 'Platinum',
            tier_level: 4,
            min_referrals: 100,
            commission_rate: 0.10,
            badge_icon: '💎',
            badge_color: '#E5E4E2',
          },
        ],
      });
    }

    const { data, error } = await supabase
      .from('referral_tiers')
      .select('*')
      .eq('is_active', true)
      .order('tier_level', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, { tiers: data || [] });
  } catch (error) {
    console.error('[Referrals API] Error getting tiers:', error);
    return sendError(res, 500, 'Failed to get tiers', 'SERVER_ERROR');
  }
});

/**
 * POST /api/referrals/validate-code
 * Validate a referral code before signup
 */
router.post('/validate-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return sendError(res, 422, 'Referral code is required', 'VALIDATION_ERROR');
    }

    if (!supabase) {
      return sendSuccess(res, {
        valid: true,
        referrer: {
          username: 'demo_user',
          display_name: 'Demo User',
        },
      });
    }

    const { data, error } = await supabase
      .from('referral_codes')
      .select(`
        id,
        is_active,
        max_uses,
        uses_count,
        expires_at,
        users!referral_codes_user_id_fkey(username, display_name, profile_image)
      `)
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return sendError(res, 404, 'Invalid referral code', 'INVALID_CODE');
    }

    // Validate code
    if (!data.is_active) {
      return sendError(res, 400, 'Referral code is inactive', 'INACTIVE_CODE');
    }

    if (data.max_uses && data.uses_count >= data.max_uses) {
      return sendError(res, 400, 'Referral code has reached maximum uses', 'MAX_USES_REACHED');
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return sendError(res, 400, 'Referral code has expired', 'EXPIRED_CODE');
    }

    return sendSuccess(res, {
      valid: true,
      referrer: data.users,
    });
  } catch (error) {
    console.error('[Referrals API] Error validating code:', error);
    return sendError(res, 500, 'Failed to validate code', 'SERVER_ERROR');
  }
});

/**
 * GET /api/referrals/leaderboard
 * Get top referrers leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 50, period = 'all_time' } = req.query;

    if (!supabase) {
      return sendSuccess(res, {
        leaderboard: [],
      });
    }

    let query = supabase
      .from('users')
      .select('id, username, display_name, profile_image, total_referrals, active_referrals, referral_earnings_gems, referral_tier_id, referral_tiers(tier_name, badge_icon, badge_color)')
      .gt('total_referrals', 0)
      .order('total_referrals', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    // Add rank
    const leaderboard = (data || []).map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

    return sendSuccess(res, { leaderboard });
  } catch (error) {
    console.error('[Referrals API] Error getting leaderboard:', error);
    return sendError(res, 500, 'Failed to get leaderboard', 'SERVER_ERROR');
  }
});

/**
 * POST /api/referrals/track-referral
 * Track a new referral signup
 */
router.post('/track-referral', async (req, res) => {
  try {
    const { referred_user_id, referral_code } = req.body;

    if (!referred_user_id || !referral_code) {
      return sendError(res, 422, 'Missing required fields', 'VALIDATION_ERROR');
    }

    if (!supabase) {
      return sendSuccess(res, {
        tracked: true,
        message: 'Demo mode - referral tracked',
      });
    }

    const referral = await referralService.trackReferral(
      referred_user_id,
      referral_code,
      {
        signup_source: 'web',
        user_agent: req.headers['user-agent'],
      }
    );

    return sendSuccess(res, { referral }, 'Referral tracked successfully');
  } catch (error) {
    console.error('[Referrals API] Error tracking referral:', error);
    return sendError(res, 500, error.message || 'Failed to track referral', 'SERVER_ERROR');
  }
});

/**
 * POST /api/referrals/track-earning
 * Internal endpoint to track earnings and calculate commissions
 * Called by other services when a referred user earns
 */
router.post('/track-earning', async (req, res) => {
  try {
    const {
      user_id,
      earning_type,
      earning_amount,
      earning_currency,
      source_transaction_id,
      source_table,
      metadata,
    } = req.body;

    if (!user_id || !earning_type || !earning_amount) {
      return sendError(res, 422, 'Missing required fields', 'VALIDATION_ERROR');
    }

    if (!supabase) {
      return sendSuccess(res, {
        commission_calculated: false,
        message: 'Demo mode - no commission calculated',
      });
    }

    const commission = await referralService.calculateCommission({
      referredUserId: user_id,
      earningType: earning_type,
      earningAmount: parseFloat(earning_amount),
      earningCurrency: earning_currency || 'usd',
      sourceTransactionId: source_transaction_id,
      sourceTable: source_table,
      metadata: metadata || {},
    });

    if (!commission) {
      return sendSuccess(res, {
        commission_calculated: false,
        message: 'No active referral found for user',
      });
    }

    // Check if referred user should be activated
    await referralService.activateReferral(user_id);

    // Update referrer's tier if needed
    await referralService.updateReferralTier(commission.referrer_id);

    return sendSuccess(res, {
      commission_calculated: true,
      commission,
    }, 'Commission calculated and processed');
  } catch (error) {
    console.error('[Referrals API] Error tracking earning:', error);
    return sendError(res, 500, 'Failed to track earning', 'SERVER_ERROR');
  }
});

/**
 * POST /api/referrals/track-oauth-signup
 * Track referral for OAuth signups (Google, etc.)
 * Called after OAuth callback when user is authenticated
 */
router.post('/track-oauth-signup', async (req, res) => {
  try {
    const userId = req.user.id;
    const { referral_code } = req.body;

    if (!referral_code) {
      return sendSuccess(res, {
        tracked: false,
        message: 'No referral code provided',
      });
    }

    if (!supabase) {
      return sendSuccess(res, {
        tracked: true,
        message: 'Demo mode - OAuth referral tracked',
      });
    }

    // Check if user already has a referrer
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referred_id', userId)
      .single();

    if (existingReferral) {
      return sendSuccess(res, {
        tracked: false,
        message: 'User already has a referrer',
      });
    }

    const referral = await referralService.trackReferral(
      userId,
      referral_code,
      {
        signup_source: 'oauth_google',
        user_agent: req.headers['user-agent'],
      }
    );

    return sendSuccess(res, {
      tracked: true,
      referral
    }, 'OAuth referral tracked successfully');
  } catch (error) {
    console.error('[Referrals API] Error tracking OAuth referral:', error);
    // Don't fail the auth flow if referral tracking fails
    return sendSuccess(res, {
      tracked: false,
      message: error.message || 'Failed to track referral',
    });
  }
});

/**
 * GET /api/referrals/affiliate-link
 * Generate an affiliate link for a product, store, or any URL
 */
router.get('/affiliate-link', async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, store_id, url, type = 'product' } = req.query;

    // Get user's referral code
    let code;
    if (!supabase) {
      code = 'PROMO-DEMO1234';
    } else {
      const { data: user } = await supabase
        .from('users')
        .select('primary_referral_code')
        .eq('id', userId)
        .single();

      code = user?.primary_referral_code;

      // Generate if doesn't exist
      if (!code) {
        code = await referralService.generateReferralCode(userId);
      }
    }

    const baseUrl = process.env.APP_URL || 'https://promorang.co';
    let affiliateLink;

    if (product_id) {
      affiliateLink = `${baseUrl}/marketplace/${product_id}?ref=${code}`;
    } else if (store_id) {
      affiliateLink = `${baseUrl}/store/${store_id}?ref=${code}`;
    } else if (url) {
      // For custom URLs, append ref param
      const separator = url.includes('?') ? '&' : '?';
      affiliateLink = `${url}${separator}ref=${code}`;
    } else {
      // General signup link
      affiliateLink = `${baseUrl}/auth?ref=${code}`;
    }

    return sendSuccess(res, {
      affiliate_link: affiliateLink,
      referral_code: code,
      type,
      product_id,
      store_id,
    });
  } catch (error) {
    console.error('[Referrals API] Error generating affiliate link:', error);
    return sendError(res, 500, 'Failed to generate affiliate link', 'SERVER_ERROR');
  }
});

/**
 * POST /api/referrals/track-click
 * Track affiliate link clicks (for analytics)
 */
router.post('/track-click', async (req, res) => {
  try {
    const { referral_code, product_id, store_id, target_url } = req.body;

    if (!referral_code) {
      return sendError(res, 422, 'Referral code is required', 'VALIDATION_ERROR');
    }

    if (!supabase) {
      return sendSuccess(res, { tracked: true });
    }

    // Find the referrer
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referral_code.toUpperCase())
      .single();

    if (!codeData) {
      return sendSuccess(res, { tracked: false, message: 'Invalid code' });
    }

    // Log the click for analytics (use affiliate_clicks table if exists, or log to console)
    console.log('[Affiliate] Click tracked:', {
      referrer: codeData.user_id,
      product_id,
      store_id,
      target_url,
      timestamp: new Date().toISOString(),
    });

    // Optionally store in affiliate_clicks table if it exists
    try {
      await supabase.from('affiliate_clicks').insert({
        affiliate_user_id: codeData.user_id,
        product_id,
        store_id,
        target_url,
        ip_hash: req.ip ? require('crypto').createHash('sha256').update(req.ip).digest('hex').substring(0, 16) : null,
        user_agent: req.headers['user-agent']?.substring(0, 255),
      });
    } catch (insertError) {
      // Table might not exist yet, that's okay
      console.log('[Affiliate] Could not store click (table may not exist):', insertError.message);
    }

    return sendSuccess(res, { tracked: true });
  } catch (error) {
    console.error('[Referrals API] Error tracking click:', error);
    return sendSuccess(res, { tracked: false });
  }
});

module.exports = router;
