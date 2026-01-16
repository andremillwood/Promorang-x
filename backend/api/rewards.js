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

/**
 * GET /api/rewards/coupons
 * List all coupons available to the current user
 * Includes both unredeemed and recently redeemed coupons
 */
router.get('/coupons', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'all', limit = 50, offset = 0 } = req.query;

    if (!supabase) {
      // Return demo data when Supabase is unavailable
      return res.json({
        coupons: getDemoCoupons(userId, status),
        total: 3,
        has_more: false,
      });
    }

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
      console.error('Error fetching user coupon assignments:', assignmentsError);
    }
    if (marketplaceError) {
      console.error('Error fetching marketplace coupons:', marketplaceError);
    }

    // Get user's usage counts for marketplace coupons to filter out maxed-out ones
    let userCouponUsage = {};
    if (marketplaceCoupons && marketplaceCoupons.length > 0) {
      const couponIds = marketplaceCoupons.map(c => c.id);
      const { data: usageData } = await supabase
        .from('coupon_usage')
        .select('coupon_id')
        .eq('user_id', userId)
        .in('coupon_id', couponIds);

      if (usageData) {
        // Count usage per coupon
        usageData.forEach(u => {
          userCouponUsage[u.coupon_id] = (userCouponUsage[u.coupon_id] || 0) + 1;
        });
      }
    }

    // Format user-assigned coupons
    const assignedCoupons = (assignments || []).map(assignment => ({
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
          is_redeemed: hasMaxedOut,
          redeemed_at: hasMaxedOut ? new Date().toISOString() : null,
          expires_at: coupon.expires_at,
          status: hasMaxedOut ? 'used' : 'available',
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

    if (!supabase) {
      return res.json(getDemoCoupons(userId, 'all')[0] || {});
    }

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
      .single();

    if (error || !assignment) {
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
        redemption_code: assignment.id.slice(0, 8).toUpperCase(),
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
 * Redeem a coupon (mark as claimed by user)
 */
router.post('/coupons/:assignmentId/redeem', async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;

    if (!supabase) {
      return res.json({
        success: true,
        message: 'Coupon redeemed successfully (demo mode)',
        code: 'DEMO-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
    }

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

      // Mark assignment as redeemed
      const { error: updateError } = await supabase
        .from('advertiser_coupon_assignments')
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('Error updating assignment:', updateError);
        return res.status(500).json({ error: 'Failed to redeem coupon' });
      }

      // Decrement coupon quantity
      const { error: decrementError } = await supabase
        .from('advertiser_coupons')
        .update({
          quantity_remaining: assignment.advertiser_coupons.quantity_remaining - 1,
        })
        .eq('id', assignment.coupon_id);

      if (decrementError) {
        console.error('Error decrementing coupon quantity:', decrementError);
      }

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('advertiser_coupon_redemptions')
        .insert({
          coupon_id: assignment.coupon_id,
          user_id: userId,
          reward_value: assignment.advertiser_coupons.value,
          reward_unit: assignment.advertiser_coupons.value_unit,
          status: 'completed',
        });

      if (redemptionError) {
        console.error('Error creating redemption record:', redemptionError);
      }

      // Generate coupon code or apply in-app reward
      const redemptionResult = await processRedemption(
        userId,
        assignment.advertiser_coupons
      );

      return res.json({
        success: true,
        message: 'Coupon redeemed successfully',
        ...redemptionResult,
      });
    }

    // 2. Fallback: Check if it's a marketplace coupon (from 'coupons' table)
    const { data: marketplaceCoupon, error: marketplaceError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', assignmentId)
      .single();

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

      // Increment usage count via couponService
      await couponService.trackCouponUsage(
        marketplaceCoupon.id,
        userId,
        null, // No order ID yet
        {},   // Empty discount (since it's a preview/redemption)
        {},   // Empty original total
        {}    // Empty final total
      );

      return res.json({
        success: true,
        message: 'Marketplace coupon retrieved successfully',
        code: marketplaceCoupon.code,
        instructions: `Use code "${marketplaceCoupon.code}" at checkout to receive your ${marketplaceCoupon.discount_type === 'percentage' ? marketplaceCoupon.discount_value + '%' : '$' + marketplaceCoupon.discount_value} discount.`,
        expires_at: marketplaceCoupon.expires_at,
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

    if (!supabase) {
      return res.json({
        total_earned: 5,
        total_redeemed: 2,
        total_value: 125.50,
        available_count: 3,
      });
    }

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
    coupon: 'Click "Redeem" to generate your unique coupon code. Apply it at checkout on the advertiser\'s website.',
    giveaway: 'Click "Claim" to enter the giveaway. Winners will be notified via email.',
    credit: 'Click "Claim" to instantly add credits to your account balance.',
  };
  return instructions[coupon.reward_type] || 'Click "Redeem" to claim your reward.';
}

async function processRedemption(userId, coupon) {
  // For coupon codes, generate a unique code
  if (coupon.reward_type === 'coupon') {
    const code = generateCouponCode(coupon.title);
    return {
      code,
      instructions: `Use code "${code}" at checkout to receive ${coupon.value}${coupon.value_unit === 'percentage' ? '%' : ' ' + coupon.value_unit} off.`,
    };
  }

  // For in-app credits (gems/keys), credit the user's account
  if (coupon.reward_type === 'credit') {
    if (supabase) {
      try {
        const field = coupon.value_unit === 'gems' ? 'gems_balance' : 'keys_balance';
        await supabase.rpc('increment_user_balance', {
          p_user_id: userId,
          p_field: field,
          p_amount: coupon.value,
        });
      } catch (error) {
        console.error('Error crediting user account:', error);
      }
    }
    return {
      credited: true,
      amount: coupon.value,
      currency: coupon.value_unit,
      instructions: `${coupon.value} ${coupon.value_unit} have been added to your account!`,
    };
  }

  // For giveaways, just confirm entry
  if (coupon.reward_type === 'giveaway') {
    return {
      entered: true,
      instructions: 'You\'ve been entered into the giveaway! Winners will be announced soon.',
    };
  }

  return {
    instructions: 'Reward claimed successfully!',
  };
}

function generateCouponCode(title) {
  const prefix = title.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

function getDemoCoupons(userId, status) {
  const allCoupons = [
    {
      assignment_id: 'demo-assign-1',
      coupon_id: 'demo-coupon-1',
      title: '25% Off Premium Upgrade',
      description: 'Unlock premium features at a discounted rate',
      reward_type: 'coupon',
      value: 25,
      value_unit: 'percentage',
      source: 'user_drop_completion',
      source_label: 'Drop completion reward',
      earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_redeemed: false,
      redeemed_at: null,
      expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      metadata: {},
      conditions: {},
    },
    {
      assignment_id: 'demo-assign-2',
      coupon_id: 'demo-coupon-2',
      title: '100 Bonus Gems',
      description: 'Free gems to boost your progress',
      reward_type: 'credit',
      value: 100,
      value_unit: 'gems',
      source: 'user_leaderboard',
      source_label: 'Leaderboard Rank #5',
      earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_redeemed: false,
      redeemed_at: null,
      expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'available',
      metadata: { rank: 5, period: 'weekly' },
      conditions: {},
    },
    {
      assignment_id: 'demo-assign-3',
      coupon_id: 'demo-coupon-3',
      title: 'Creator Merch Pack',
      description: 'Exclusive merchandise from your favorite creator',
      reward_type: 'giveaway',
      value: 1,
      value_unit: 'item',
      source: 'user_drop_completion',
      source_label: 'Drop completion reward',
      earned_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      is_redeemed: true,
      redeemed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'redeemed',
      metadata: {},
      conditions: {},
    },
  ];

  if (status === 'available') {
    return allCoupons.filter(c => !c.is_redeemed && c.status === 'available');
  } else if (status === 'redeemed') {
    return allCoupons.filter(c => c.is_redeemed);
  }
  return allCoupons;
}

module.exports = router;
