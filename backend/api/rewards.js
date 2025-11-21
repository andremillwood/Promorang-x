/**
 * User rewards and coupons API
 * Endpoints for users to view, claim, and redeem their earned coupons
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

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

    // Build query for user-specific coupon assignments
    let query = supabase
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
      .order('assigned_at', { ascending: false });

    // Filter by redemption status
    if (status === 'available') {
      query = query.eq('is_redeemed', false).eq('status', 'active');
    } else if (status === 'redeemed') {
      query = query.eq('is_redeemed', true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: assignments, error, count } = await query;

    if (error) {
      console.error('Error fetching user coupons:', error);
      return res.status(500).json({ error: 'Failed to fetch coupons' });
    }

    // Format response
    const coupons = (assignments || []).map(assignment => ({
      assignment_id: assignment.id,
      coupon_id: assignment.coupon_id,
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
      metadata: assignment.metadata,
      conditions: assignment.advertiser_coupons.conditions,
    }));

    res.json({
      coupons,
      total: count || coupons.length,
      has_more: (offset + limit) < (count || 0),
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
      assignment_id: assignment.id,
      coupon_id: assignment.coupon_id,
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
      metadata: assignment.metadata,
      conditions: assignment.advertiser_coupons.conditions,
      instructions: getRedemptionInstructions(assignment.advertiser_coupons),
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

    // Fetch the assignment
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

    if (fetchError || !assignment) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Validate coupon can be redeemed
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

    res.json({
      success: true,
      message: 'Coupon redeemed successfully',
      ...redemptionResult,
    });
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
