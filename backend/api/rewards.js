/**
 * User rewards and coupons API
 * Endpoints for users to view, claim, and redeem their earned coupons
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const couponService = require('../services/couponService');

// All routes require authentication
router.use(requireAuth);
router.use((req, res, next) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Reward source unavailable', code: 'REWARD_SOURCE_UNAVAILABLE' });
  }
  next();
});

/**
 * GET /api/rewards/coupons
 * List all coupons available to the current user
 * Includes both unredeemed and recently redeemed coupons
 */
router.get('/coupons', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'all' } = req.query;
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

    // Fetch BOTH user-assigned coupons AND available marketplace coupons
    const [assignmentsResult, marketplaceCouponsResult] = await Promise.all([
      // 1. User-specific coupon assignments
      supabase
        .from('advertiser_coupon_assignments')
        .select(`
          id,
          coupon_id,
          target_type,
          target_label,
          assigned_at,
          is_redeemed,
          redeemed_at,
          drop_id,
          content_id,
          leaderboard_rank,
          metadata,
          status,
          advertiser_coupons!inner (
            id,
            title,
            description,
            reward_type,
            value,
            value_unit,
            quantity_total,
            quantity_remaining,
            start_date,
            end_date,
            status,
            conditions,
            advertiser_id
          )
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false }),

      // 2. Available marketplace coupons (campaign/advertiser/platform)
      supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .in('source_type', ['advertiser', 'platform'])
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    const { data: assignments, error: assignmentsError } = assignmentsResult;
    const { data: marketplaceCoupons, error: marketplaceError } = marketplaceCouponsResult;

    if (assignmentsError) {
      throw assignmentsError;
    }
    if (marketplaceError) {
      throw marketplaceError;
    }

    // Get user's usage counts for marketplace coupons to filter out maxed-out ones
    let userCouponUsage = {};
    if (marketplaceCoupons && marketplaceCoupons.length > 0) {
      const couponIds = marketplaceCoupons.map(c => c.id);
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_usage')
        .select('coupon_id')
        .eq('user_id', userId)
        .in('coupon_id', couponIds);

      if (usageError) throw usageError;
      if (usageData) {
        // Count usage per coupon
        usageData.forEach(u => {
          userCouponUsage[u.coupon_id] = (userCouponUsage[u.coupon_id] || 0) + 1;
        });
      }
    }

    // Format user-assigned coupons
    const assignedCoupons = (assignments || []).map(assignment => ({
      id: assignment.id,
      assignment_id: assignment.id,
      coupon_id: assignment.coupon_id,
      code: null, // User-assigned coupons don't have codes yet
      title: assignment.advertiser_coupons.title,
      description: assignment.advertiser_coupons.description,
      reward_type: assignment.advertiser_coupons.reward_type,
      value: assignment.advertiser_coupons.value,
      value_unit: assignment.advertiser_coupons.value_unit,
      source: assignment.target_type,
      source_label: assignment.target_label,
      earned_at: assignment.assigned_at,
      is_redeemed: assignment.is_redeemed,
      redeemed_at: assignment.redeemed_at,
      expires_at: assignment.advertiser_coupons.end_date,
      status: getCouponStatus(assignment),
      metadata: assignment.metadata || {},
      conditions: assignment.advertiser_coupons.conditions || {},
      coupon_source: 'assigned'
    }));

    // Format marketplace coupons - mark ones user has maxed out as 'used'
    const availableMarketplaceCoupons = (marketplaceCoupons || [])
      .map(coupon => {
        // Check if user has reached their per-user limit
        const userUsage = userCouponUsage[coupon.id] || 0;
        const hasMaxedOut = coupon.max_uses_per_user && userUsage >= coupon.max_uses_per_user;

        return {
          id: coupon.id,
          assignment_id: coupon.id, // Use coupon ID as assignment ID for marketplace coupons
          coupon_id: coupon.id,
          code: coupon.code,
          title: coupon.name,
          description: coupon.description,
          reward_type: 'coupon',
          value: coupon.discount_value,
          value_unit: coupon.discount_type === 'percentage' ? 'percentage' :
            coupon.discount_type === 'fixed_usd' ? 'usd' :
              coupon.discount_type === 'fixed_gems' ? 'gems' :
                coupon.discount_type === 'fixed_gold' ? 'gold' : 'other',
          source: coupon.source_type,
          source_label: coupon.campaign_id ? 'Campaign Reward' : 'Platform Offer',
          earned_at: coupon.created_at,
          is_redeemed: false,
          redeemed_at: null,
          expires_at: coupon.expires_at,
          status: hasMaxedOut ? 'usage_limit_reached' : 'available',
          metadata: coupon.metadata || {},
          conditions: {},
          coupon_source: 'marketplace',
          max_uses: coupon.max_uses,
          current_uses: coupon.current_uses,
          discount_type: coupon.discount_type,
          user_usage: userUsage,
          max_uses_per_user: coupon.max_uses_per_user
        };
      });

    // Combine both types
    let allCoupons = [...assignedCoupons, ...availableMarketplaceCoupons];

    // Filter by status
    if (status === 'available') {
      allCoupons = allCoupons.filter(c => !c.is_redeemed && c.status === 'available');
    } else if (status === 'redeemed') {
      allCoupons = allCoupons.filter(c => c.is_redeemed);
    }

    // Sort by earned_at/created_at descending
    allCoupons.sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at));

    // Apply pagination
    const paginatedCoupons = allCoupons.slice(offset, offset + limit);

    res.json({
      coupons: paginatedCoupons,
      total: allCoupons.length,
      has_more: (offset + limit) < allCoupons.length,
    });
  } catch (error) {
    console.error('Error in GET /api/rewards/coupons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rewards/coupons/:assignmentId
 * Get details of a specific coupon assignment
 */
router.get('/coupons/:assignmentId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;

    const { data: assignment, error } = await supabase
      .from('advertiser_coupon_assignments')
      .select(`
        *,
        advertiser_coupons!inner (
          id,
          title,
          description,
          reward_type,
          value,
          value_unit,
          quantity_total,
          quantity_remaining,
          start_date,
          end_date,
          status,
          conditions,
          advertiser_id
        )
      `)
      .eq('id', assignmentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!assignment) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({
      coupon: {
        id: assignment.id,
        coupon_id: assignment.coupon_id,
        is_redeemed: assignment.is_redeemed,
        redeemed_at: assignment.redeemed_at,
        assigned_at: assignment.assigned_at,
        target_label: assignment.target_label,
        redemption_code: assignment.redemption_code || null,
        advertiser_coupons: {
          ...assignment.advertiser_coupons,
          redemption_instructions: getRedemptionInstructions(assignment.advertiser_coupons),
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /api/rewards/coupons/:assignmentId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/rewards/coupons/:assignmentId/redeem
 * Validate a coupon redemption request. Assigned-coupon settlement remains disabled
 * until every resulting write can be committed atomically.
 */
router.post('/coupons/:assignmentId/redeem', async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;

    // 1. Try fetching from advertiser_coupon_assignments first
    const { data: assignment, error: fetchError } = await supabase
      .from('advertiser_coupon_assignments')
      .select(`
        *,
        advertiser_coupons!inner (
          id,
          title,
          value,
          value_unit,
          quantity_remaining,
          end_date,
          status
        )
      `)
      .eq('id', assignmentId)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (assignment) {
      // Validate assigned coupon can be redeemed
      if (assignment.is_redeemed) {
        return res.status(400).json({ error: 'Coupon already redeemed' });
      }

      if (assignment.advertiser_coupons.status !== 'active') {
        return res.status(400).json({ error: 'Coupon is no longer active' });
      }

      if (assignment.advertiser_coupons.quantity_remaining <= 0) {
        return res.status(400).json({ error: 'Coupon is no longer available' });
      }

      if (new Date(assignment.advertiser_coupons.end_date) < new Date()) {
        return res.status(400).json({ error: 'Coupon has expired' });
      }

      return res.status(503).json({
        success: false,
        error: 'Coupon redemption is unavailable until assignment, inventory, credential and value delivery settle atomically',
        code: 'REWARD_REDEMPTION_ATOMICITY_PENDING',
      });
    }

    // 2. Fallback: Check if it's a marketplace coupon (from 'coupons' table)
    const { data: marketplaceCoupon, error: marketplaceError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (marketplaceError && marketplaceError.code !== 'PGRST116') throw marketplaceError;

    if (marketplaceCoupon) {
      console.log('[Rewards API] Found marketplace coupon:', {
        id: marketplaceCoupon.id,
        code: marketplaceCoupon.code,
        is_active: marketplaceCoupon.is_active,
        expires_at: marketplaceCoupon.expires_at,
        max_uses: marketplaceCoupon.max_uses,
        current_uses: marketplaceCoupon.current_uses,
      });

      // Use couponService to validate the marketplace coupon
      // Note: We don't verify against cart total here, just basic validation
      const validation = await couponService.validateCoupon(
        marketplaceCoupon.code,
        userId
      );

      if (!validation.valid) {
        console.log('[Rewards API] Marketplace coupon validation failed:', validation.error);
        return res.status(400).json({ error: validation.error || 'Coupon validation failed' });
      }

      return res.status(409).json({
        success: false,
        error: 'Marketplace coupons are redeemed only as part of a recorded checkout; viewing a coupon does not consume it',
        code: 'CHECKOUT_REDEMPTION_REQUIRED',
      });
    }

    // 3. Neither found
    return res.status(404).json({ error: 'Coupon not found or invalid ID' });
  } catch (error) {
    console.error('Error in POST /api/rewards/coupons/:assignmentId/redeem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/rewards/stats
 * Get user's reward statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: assignments, error } = await supabase
      .from('advertiser_coupon_assignments')
      .select(`
        id,
        is_redeemed,
        advertiser_coupons!inner (value, value_unit)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching reward stats:', error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }

    const stats = {
      total_earned: assignments.length,
      total_redeemed: assignments.filter(a => a.is_redeemed).length,
      available_count: assignments.filter(a => !a.is_redeemed).length,
      total_value: assignments.reduce((sum, a) => {
        if (a.advertiser_coupons.value_unit === 'usd') {
          return sum + parseFloat(a.advertiser_coupons.value);
        }
        return sum;
      }, 0),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error in GET /api/rewards/stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions

function getCouponStatus(assignment) {
  if (assignment.is_redeemed) return 'redeemed';
  if (assignment.status !== 'active') return 'inactive';
  if (new Date(assignment.advertiser_coupons.end_date) < new Date()) return 'expired';
  if (assignment.advertiser_coupons.quantity_remaining <= 0) return 'depleted';
  return 'available';
}

function getRedemptionInstructions(coupon) {
  const instructions = {
    coupon: 'A recorded issuer credential is required before this coupon can be used at checkout.',
    giveaway: 'A recorded entry is separate from selection, claim, distribution and fulfillment.',
    credit: 'Claiming records intent; value is available only after a corresponding economy transaction succeeds.',
  };
  return instructions[coupon.reward_type] || 'A recorded claim is required before redemption or fulfillment can proceed.';
}

module.exports = router;
