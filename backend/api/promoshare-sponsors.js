const express = require('express');
const router = express.Router();
const { requireAuth, resolveAdvertiserContext } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');
const stripeService = require('../services/stripeService');

// ============================================
// SPONSOR PRICING CONFIG
// ============================================
const SPONSOR_TIERS = {
  daily: {
    min_pool: 50,
    max_pool: 200,
    platform_fee_percent: 20,
    max_winners: 5,
    min_win_value: 10,
    duration_days: 1
  },
  weekly: {
    min_pool: 200,
    max_pool: 1000,
    platform_fee_percent: 15,
    max_winners: 15,
    min_win_value: 8,
    duration_days: 7
  },
  monthly: {
    min_pool: 1000,
    max_pool: 5000,
    platform_fee_percent: 12,
    max_winners: 20,
    min_win_value: 15,
    duration_days: 30
  },
  grand: {
    min_pool: 5000,
    max_pool: 25000,
    platform_fee_percent: 10,
    max_winners: 50,
    min_win_value: 50,
    duration_days: 90
  }
};

const PREMIUM_PLACEMENTS = {
  homepage_banner: { price: 500, duration_days: 7 },
  push_notification: { price: 200, per_send: true },
  sponsored_badge: { price: 100, per_pool: true },
  exclusive_category: { price_multiplier: 1.25 }
};

// ============================================
// MIDDLEWARE: Require Advertiser/Sponsor
// ============================================
const requireSponsor = async (req, res, next) => {
  if (!req.advertiserAccount && req.user.user_type !== 'advertiser' && req.user.user_type !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Advertiser or sponsor account required',
      upgrade_url: '/for-brands'
    });
  }
  next();
};

// ============================================
// GET /api/promoshare/sponsors/config
// Get pricing and configuration options
// ============================================
router.get('/sponsors/config', async (req, res) => {
  res.json({
    success: true,
    data: {
      tiers: SPONSOR_TIERS,
      placements: PREMIUM_PLACEMENTS,
      eligibility_options: {
        min_verified_moves: { min: 0, max: 20, default: 3 },
        min_moments_joined: { min: 0, max: 10, default: 1 },
        min_referrals: { min: 0, max: 10, default: 1 },
        require_subscription: { type: 'boolean', default: false }
      },
      targeting_options: {
        categories: ['tech', 'fashion', 'food', 'travel', 'music', 'sports', 'gaming', 'lifestyle'],
        locations: ['usa', 'canada', 'uk', 'europe', 'asia', 'global'],
        user_tiers: ['free', 'pro', 'power', 'all']
      }
    }
  });
});

// ============================================
// POST /api/promoshare/sponsors/calculate
// Calculate cost breakdown before purchase
// ============================================
router.post('/sponsors/calculate', requireAuth, requireSponsor, async (req, res) => {
  try {
    const {
      tier = 'weekly',
      pool_amount,
      placements = [],
      targeting = {}
    } = req.body;

    const tierConfig = SPONSOR_TIERS[tier];
    if (!tierConfig) {
      return res.status(400).json({ success: false, error: 'Invalid tier' });
    }

    // Validate pool amount
    if (pool_amount < tierConfig.min_pool || pool_amount > tierConfig.max_pool) {
      return res.status(400).json({
        success: false,
        error: `Pool amount must be between $${tierConfig.min_pool} and $${tierConfig.max_pool} for ${tier} tier`
      });
    }

    // Calculate costs
    const platformFee = Math.round(pool_amount * (tierConfig.platform_fee_percent / 100));
    const actualPrizePool = pool_amount - platformFee;
    
    // Calculate winner range
    const minWinners = 1;
    const maxWinners = Math.min(
      tierConfig.max_winners,
      Math.floor(actualPrizePool / tierConfig.min_win_value)
    );
    const avgWinners = Math.floor((minWinners + maxWinners) / 2);
    const avgPrizePerWinner = Math.floor(actualPrizePool / avgWinners);

    // Calculate placement costs
    let placementCost = 0;
    const placementBreakdown = [];

    placements.forEach(placement => {
      const config = PREMIUM_PLACEMENTS[placement.type];
      if (!config) return;

      let cost = config.price;
      if (placement.duration && config.duration_days) {
        cost = cost * (placement.duration / config.duration_days);
      }
      
      placementCost += cost;
      placementBreakdown.push({
        type: placement.type,
        cost: Math.round(cost),
        duration: placement.duration || config.duration_days
      });
    });

    // Apply category premium if exclusive
    let categoryPremium = 0;
    if (targeting.exclusive_category) {
      categoryPremium = pool_amount * 0.25; // 25% premium
    }

    const totalCost = pool_amount + placementCost + categoryPremium;

    res.json({
      success: true,
      data: {
        tier,
        pool_amount,
        breakdown: {
          prize_pool: actualPrizePool,
          platform_fee: platformFee,
          platform_fee_percent: tierConfig.platform_fee_percent,
          placements: placementCost,
          category_premium: categoryPremium,
          total: totalCost
        },
        projections: {
          min_winners: minWinners,
          max_winners: maxWinners,
          avg_winners: avgWinners,
          avg_prize_per_winner: avgPrizePerWinner,
          min_prize_value: tierConfig.min_win_value,
          duration_days: tierConfig.duration_days
        },
        placement_breakdown: placementBreakdown,
        targeting: targeting
      }
    });

  } catch (error) {
    console.error('Error calculating sponsor cost:', error);
    res.status(500).json({ success: false, error: 'Calculation failed' });
  }
});

// ============================================
// POST /api/promoshare/sponsors/pools
// Create a sponsored pool (self-serve)
// ============================================
router.post('/sponsors/pools', requireAuth, requireSponsor, async (req, res) => {
  try {
    const {
      tier = 'weekly',
      pool_amount,
      cycle_name,
      brand_message,
      logo_url,
      eligibility_config = {},
      weight_config = {},
      placements = [],
      targeting = {},
      prize_distribution = {},
      payment_method = 'stripe' // stripe, crypto, invoice
    } = req.body;

    const advertiserId = req.advertiserAccount?.id || req.user.id;

    // Validate tier
    const tierConfig = SPONSOR_TIERS[tier];
    if (!tierConfig) {
      return res.status(400).json({ success: false, error: 'Invalid tier' });
    }

    // Validate pool amount
    if (pool_amount < tierConfig.min_pool || pool_amount > tierConfig.max_pool) {
      return res.status(400).json({
        success: false,
        error: `Pool amount must be between $${tierConfig.min_pool} and $${tierConfig.max_pool}`
      });
    }

    // Calculate dates
    const startAt = new Date();
    const endAt = new Date();
    endAt.setDate(endAt.getDate() + tierConfig.duration_days);

    // Calculate platform fee
    const platformFee = Math.round(pool_amount * (tierConfig.platform_fee_percent / 100));
    const actualPrizePool = pool_amount - platformFee;

    // Create the cycle
    const { data: cycle, error: cycleError } = await supabase
      .from('promoshare_cycles')
      .insert({
        cycle_type: tier,
        cycle_name: cycle_name || `${req.advertiserAccount?.company_name || 'Sponsored'} ${tier}`,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        status: 'draft', // Start as draft until payment confirmed
        eligibility_config: {
          min_verified_moves: eligibility_config.min_verified_moves ?? 3,
          min_moments_joined: eligibility_config.min_moments_joined ?? 1,
          min_referrals: eligibility_config.min_referrals ?? 1,
          require_subscription: eligibility_config.require_subscription ?? false,
          ...eligibility_config
        },
        weight_config: {
          base_entry: weight_config.base_entry ?? 1,
          move_weight: weight_config.move_weight ?? 1,
          moment_weight: weight_config.moment_weight ?? 2,
          referral_weight: weight_config.referral_weight ?? 3,
          ...weight_config
        },
        distribution_config: {
          buckets: [
            { name: 'top_performers', percent: 40, count: 0 },
            { name: 'weighted_random', percent: 30, count: 0 },
            { name: 'newcomers', percent: 20, count: 0 },
            { name: 'loyalty', percent: 10, count: 0 }
          ],
          min_prize_value: tierConfig.min_win_value,
          max_winners: tierConfig.max_winners
        },
        sponsor_config: {
          advertiser_id: advertiserId,
          brand_message,
          logo_url,
          targeting,
          placements,
          total_paid: pool_amount,
          platform_fee: platformFee,
          prize_pool: actualPrizePool,
          payment_status: 'pending',
          payment_method
        }
      })
      .select()
      .single();

    if (cycleError) throw cycleError;

    // Create pool items for each prize type
    const { error: itemError } = await supabase
      .from('promoshare_pool_items')
      .insert({
        cycle_id: cycle.id,
        reward_type: 'gems',
        amount: actualPrizePool,
        description: brand_message || `${tier} PromoShare Prize Pool`,
        quantity: 1,
        sponsor_id: advertiserId,
        status: 'reserved'
      });

    if (itemError) throw itemError;

    // Create sponsorship record
    const { error: sponsorshipError } = await supabase
      .from('promoshare_sponsorships')
      .insert({
        advertiser_id: advertiserId,
        cycle_id: cycle.id,
        amount: pool_amount,
        reward_type: 'gems',
        description: brand_message || 'Sponsored pool',
        brand_message,
        logo_url,
        payment_status: 'pending',
        payment_amount: pool_amount,
        platform_fee: platformFee,
        net_to_prizes: actualPrizePool
      });

    if (sponsorshipError) throw sponsorshipError;

    // Return payment instructions
    res.json({
      success: true,
      data: {
        cycle,
        payment_required: {
          amount: pool_amount,
          platform_fee: platformFee,
          payment_method,
          stripe_invoice_url: payment_method === 'stripe' ? `/api/payment/create-invoice/${cycle.id}` : null
        },
        next_steps: [
          'Complete payment to activate pool',
          'Pool will go live once payment is confirmed',
          'You will receive analytics dashboard access'
        ]
      }
    });

  } catch (error) {
    console.error('Error creating sponsor pool:', error);
    res.status(500).json({ success: false, error: 'Failed to create pool' });
  }
});

// ============================================
// GET /api/promoshare/sponsors/pools
// List sponsor's pools
// ============================================
router.get('/sponsors/pools', requireAuth, requireSponsor, async (req, res) => {
  try {
    const advertiserId = req.advertiserAccount?.id || req.user.id;

    const { data: pools, error } = await supabase
      .from('promoshare_cycles')
      .select(`
        *,
        promoshare_pool_items(*),
        promoshare_sponsorships(*),
        winner_count:promoshare_winners(count)
      `)
      .filter('sponsor_config->advertiser_id', 'eq', advertiserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate ROI metrics
    const poolsWithMetrics = pools.map(pool => {
      const sponsorship = pool.promoshare_sponsorships?.[0];
      return {
        ...pool,
        metrics: {
          total_spend: sponsorship?.amount || 0,
          platform_fee: sponsorship?.platform_fee || 0,
          qualified_users: 0, // TODO: calculate from entries
          projected_cac: 0, // TODO: calculate
          status: pool.status
        }
      };
    });

    res.json({ success: true, data: poolsWithMetrics });

  } catch (error) {
    console.error('Error fetching sponsor pools:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pools' });
  }
});

// ============================================
// GET /api/promoshare/sponsors/analytics/:cycleId
// Detailed analytics for a specific pool
// ============================================
router.get('/sponsors/analytics/:cycleId', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { cycleId } = req.params;
    const advertiserId = req.advertiserAccount?.id || req.user.id;

    // Verify ownership
    const { data: cycle, error: cycleError } = await supabase
      .from('promoshare_cycles')
      .select('*')
      .eq('id', cycleId)
      .single();

    if (cycleError || cycle.sponsor_config?.advertiser_id !== advertiserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Fetch analytics data
    const [
      { data: qualifiedUsers },
      { data: entries },
      { data: winners },
      { count: totalParticipants }
    ] = await Promise.all([
      supabase
        .from('promoshare_user_stats')
        .select('*, users:user_id(username, email, user_tier)')
        .eq('cycle_id', cycleId)
        .eq('eligible', true),
      supabase
        .from('promoshare_entries')
        .select('source_type, count')
        .eq('cycle_id', cycleId),
      supabase
        .from('promoshare_winners')
        .select('*, users:user_id(username, email)')
        .eq('cycle_id', cycleId),
      supabase
        .from('promoshare_user_stats')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', cycleId)
    ]);

    // Calculate engagement breakdown
    const engagementBySource = entries?.reduce((acc, entry) => {
      acc[entry.source_type] = (acc[entry.source_type] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: {
        cycle_id: cycleId,
        summary: {
          total_participants: totalParticipants || 0,
          qualified_users: qualifiedUsers?.length || 0,
          winners: winners?.length || 0,
          qualification_rate: totalParticipants ? 
            Math.round((qualifiedUsers?.length || 0) / totalParticipants * 100) : 0
        },
        engagement: {
          by_source: engagementBySource,
          total_entries: entries?.reduce((sum, e) => sum + (e.count || 0), 0) || 0
        },
        winners: winners?.map(w => ({
          user_id: w.user_id,
          username: w.users?.username,
          prize_value: w.prize_gem_amount,
          claimed: w.claimed,
          selection_bucket: w.selection_bucket
        })) || [],
        financial: {
          total_spend: cycle.sponsor_config?.total_paid || 0,
          platform_fee: cycle.sponsor_config?.platform_fee || 0,
          prize_pool: cycle.sponsor_config?.prize_pool || 0,
          effective_cac: winners?.length ? 
            Math.round((cycle.sponsor_config?.total_paid || 0) / winners.length) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// ============================================
// POST /api/promoshare/sponsors/pools/:id/checkout
// Create Stripe checkout session for pool payment
// ============================================
router.post('/sponsors/pools/:id/checkout', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { id } = req.params;
    const advertiserId = req.advertiserAccount?.id || req.user.id;

    // Check if Stripe is configured
    if (!stripeService.isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Payment processing not configured',
        message: 'Stripe is not set up. Please contact support.'
      });
    }

    // Verify ownership and get pool details
    const { data: cycle, error: cycleError } = await supabase
      .from('promoshare_cycles')
      .select('*')
      .eq('id', id)
      .single();

    if (cycleError || cycle.sponsor_config?.advertiser_id !== advertiserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if already paid
    if (cycle.sponsor_config?.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Pool already paid for'
      });
    }

    // Calculate total amount
    const totalAmount = (cycle.sponsor_config?.total_paid || 0);

    // Create checkout session
    const checkout = await stripeService.createSponsorCheckoutSession(
      advertiserId,
      id,
      totalAmount,
      {
        tier: cycle.cycle_type,
        pool_amount: cycle.sponsor_config?.prize_pool || 0,
        platform_fee: cycle.sponsor_config?.platform_fee || 0,
        cycle_name: cycle.cycle_name
      }
    );

    res.json({
      success: true,
      data: {
        checkout_url: checkout.url,
        session_id: checkout.sessionId,
        amount: totalAmount,
        pool_id: id
      }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// ============================================
// GET /api/promoshare/sponsors/pools/:id/payment-status
// Check payment status for a pool
// ============================================
router.get('/sponsors/pools/:id/payment-status', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { id } = req.params;
    const advertiserId = req.advertiserAccount?.id || req.user.id;

    // Verify ownership
    const { data: cycle, error: cycleError } = await supabase
      .from('promoshare_cycles')
      .select('sponsor_config, status')
      .eq('id', id)
      .single();

    if (cycleError || cycle.sponsor_config?.advertiser_id !== advertiserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        pool_id: id,
        payment_status: cycle.sponsor_config?.payment_status || 'pending',
        pool_status: cycle.status,
        paid_at: cycle.sponsor_config?.paid_at || null,
        amount: cycle.sponsor_config?.total_paid || 0
      }
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ success: false, error: 'Failed to check status' });
  }
});

// ============================================
// POST /api/promoshare/sponsors/pools/:id/activate
// Manual activation (for admin or alternative payment methods)
// ============================================
router.post('/sponsors/pools/:id/activate', requireAuth, requireSponsor, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_confirmation, manual } = req.body;
    const advertiserId = req.advertiserAccount?.id || req.user.id;

    // Verify ownership
    const { data: cycle, error: cycleError } = await supabase
      .from('promoshare_cycles')
      .select('*')
      .eq('id', id)
      .single();

    if (cycleError || cycle.sponsor_config?.advertiser_id !== advertiserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if already active
    if (cycle.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Pool is already active'
      });
    }

    // Update to active status
    const { data: updated, error } = await supabase
      .from('promoshare_cycles')
      .update({
        status: 'active',
        sponsor_config: {
          ...cycle.sponsor_config,
          payment_status: 'completed',
          payment_method: manual ? 'manual' : 'stripe',
          payment_confirmed_at: new Date().toISOString(),
          payment_confirmation_id: payment_confirmation
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update sponsorship record
    await supabase
      .from('promoshare_sponsorships')
      .update({ payment_status: 'completed' })
      .eq('cycle_id', id);

    res.json({
      success: true,
      data: {
        cycle: updated,
        message: 'Pool activated and now live',
        public_url: `/promoshare/cycles/${id}`
      }
    });

  } catch (error) {
    console.error('Error activating pool:', error);
    res.status(500).json({ success: false, error: 'Activation failed' });
  }
});

// ============================================
// POST /api/promoshare/sponsors/subscribe
// Create subscription checkout for Pro/Power tiers
// ============================================
router.post('/sponsors/subscribe', requireAuth, async (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.user.id;

    // Validate tier
    if (!['pro', 'power'].includes(tier)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tier. Must be "pro" or "power"'
      });
    }

    // Check if Stripe is configured
    if (!stripeService.isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Payment processing not configured'
      });
    }

    // Create subscription checkout
    const checkout = await stripeService.createSubscriptionCheckout(userId, tier);

    res.json({
      success: true,
      data: {
        checkout_url: checkout.url,
        session_id: checkout.sessionId,
        tier
      }
    });

  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription checkout',
      message: error.message
    });
  }
});

module.exports = router;
