const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  getStakingChannels,
  getUserStakingPositions,
  createStakingPosition,
  claimStakingRewards,
  getFundingProjects,
  createFundingProject,
  pledgeToProject,
  getCreatorRewards,
  getUserLedger,
} = require('../services/growthService');
const supabase = global.supabase || require('../lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const { authMiddleware } = require('../lib/auth');

// Apply auth to all routes
router.use(authMiddleware);

// Growth channels
router.get('/channels', async (req, res) => {
  try {
    const channels = await getStakingChannels();
    res.json({ success: true, channels });
  } catch (error) {
    console.error('Error in /channels:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch staking channels' });
  }
});

// Staking positions
router.get('/staking', async (req, res) => {
  try {
    const positions = await getUserStakingPositions(req.user.id);
    res.json({ success: true, positions });
  } catch (error) {
    console.error('Error in /staking:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch staking positions' });
  }
});

router.post('/staking', async (req, res) => {
  try {
    const { channel_id: channelId, amount } = req.body || {};

    if (!channelId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid staking request' });
    }

    const position = await createStakingPosition(req.user.id, channelId, amount);

    // In a real app, you'd fetch the updated user data from the database
    const updatedUser = {
      ...req.user,
      gems_balance: (req.user.gems_balance || 0) - amount
    };

    res.json({
      success: true,
      position,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in POST /staking:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create staking position'
    });
  }
});

router.post('/staking/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await claimStakingRewards(req.user.id, id);

    // In a real app, you'd fetch the updated user data from the database
    const updatedUser = {
      ...req.user,
      gems_balance: (req.user.gems_balance || 0) + result.rewards
    };

    res.json({
      success: true,
      position: result.position,
      user: updatedUser,
      payout: result.rewards
    });
  } catch (error) {
    console.error('Error in POST /staking/:id/claim:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to claim staking rewards'
    });
  }
});

// Funding projects
router.get('/funding/projects', async (req, res) => {
  try {
    const { limit = 10, offset = 0, status = 'active' } = req.query;
    const result = await getFundingProjects({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in GET /funding/projects:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch funding projects' });
  }
});

router.post('/funding/projects', async (req, res) => {
  try {
    const {
      title,
      description,
      target_amount,
      rewards
    } = req.body || {};

    if (!title || !description || !target_amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const project = await createFundingProject(req.user.id, {
      title,
      description,
      target_amount: Number(target_amount),
      rewards
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Error in POST /funding/projects:', error);
    res.status(400).json({ success: false, error: error.message || 'Failed to create funding project' });
  }
});

router.post('/funding/projects/:id/pledge', async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { amount, reward_tier: rewardTier } = req.body || {};

    const pledgeAmount = Number(amount);
    if (!pledgeAmount || pledgeAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid pledge amount' });
    }

    const result = await pledgeToProject(req.user.id, projectId, pledgeAmount, rewardTier);

    // In a real app, you'd fetch the updated user data from the database
    const updatedUser = {
      ...req.user,
      gems_balance: (req.user.gems_balance || 0) - pledgeAmount
    };

    res.json({
      success: true,
      pledge: result.pledge,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in POST /funding/projects/:id/pledge:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create pledge'
    });
  }
});

// Social shield policies
router.get('/shield/policies', async (req, res) => {
  try {
    const { data: policies, error } = await supabase
      .from('shield_policies')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.json({ success: true, policies: policies || [] });
  } catch (error) {
    console.error('Error in GET /shield/policies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch shield policies'
    });
  }
});

// Subscribe to a shield policy
router.post('/shield/subscribe', async (req, res) => {
  try {
    const { policy_id: policyId } = req.body || {};

    if (!policyId) {
      return res.status(400).json({ success: false, error: 'Policy ID is required' });
    }

    // Get the policy
    const { data: policy, error: policyError } = await supabase
      .from('shield_policies')
      .select('*')
      .eq('id', policyId)
      .eq('is_active', true)
      .single();

    if (policyError || !policy) {
      return res.status(404).json({ success: false, error: 'Policy not found or inactive' });
    }

    // Check if user already has an active subscription
    const { data: existingSub, error: subError } = await supabase
      .from('shield_subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .not('expires_at', 'lt', new Date().toISOString())
      .maybeSingle();

    if (subError) throw subError;

    if (existingSub) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active shield subscription'
      });
    }

    // Check user's balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('gems_balance')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;

    if ((user.gems_balance || 0) < policy.premium_amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient gems to subscribe to this policy'
      });
    }

    // Calculate subscription dates
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + policy.duration_days);

    // Start transaction
    const { data: subscription, error: subCreateError } = await supabase
      .from('shield_subscriptions')
      .insert({
        user_id: req.user.id,
        policy_id: policy.id,
        premium_paid: policy.premium_amount,
        coverage_amount: policy.coverage_amount,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (subCreateError) throw subCreateError;

    // Record the transaction in the ledger
    await supabase
      .from('growth_ledger')
      .insert({
        user_id: req.user.id,
        source_type: 'shield_premium',
        source_id: subscription.id,
        amount: -policy.premium_amount, // Negative because it's an outflow
        currency: 'gems',
        status: 'completed',
        metadata: {
          policy_id: policy.id,
          coverage_amount: policy.coverage_amount,
          duration_days: policy.duration_days
        },
      });

    // Update user's gem balance
    await supabase.rpc('decrement_gems', {
      user_id: req.user.id,
      amount: policy.premium_amount,
    });

    // In a real app, you'd fetch the updated user data from the database
    const updatedUser = {
      ...req.user,
      gems_balance: (req.user.gems_balance || 0) - policy.premium_amount
    };

    res.json({
      success: true,
      subscription,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in POST /shield/subscribe:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to subscribe to shield policy'
    });
  }

});

// Creator rewards
router.get('/creator/rewards', async (req, res) => {
  try {
    const { status } = req.query;
    const rewards = await getCreatorRewards(req.user.id, { status });
    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Error in GET /creator/rewards:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch creator rewards'
    });
  }
});

// User's growth ledger (transaction history)
router.get('/ledger', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await getUserLedger(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in GET /ledger:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ledger entries'
    });
  }
});

// Check creator rewards based on milestones
const checkCreatorRewards = async (creatorId) => {
  if (!supabase) {
    console.log(`[checkCreatorRewards] Demo mode - skipping for creator ${creatorId}`);
    return { checked: true, rewards: [] };
  }

  try {
    // Get creator's stats
    const { data: creator, error: creatorError } = await supabase
      .from('users')
      .select('id, follower_count, gems_balance, points_balance, gold_collected')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      throw new Error('Creator not found');
    }

    // Check for unclaimed milestone rewards
    const { data: claimedRewards, error: claimedError } = await supabase
      .from('creator_rewards')
      .select('milestone_type, milestone_value')
      .eq('user_id', creatorId)
      .eq('status', 'claimed');

    if (claimedError) {
      console.error('Error fetching claimed rewards:', claimedError);
    }

    const claimedMilestones = new Set(
      (claimedRewards || []).map(r => `${r.milestone_type}:${r.milestone_value}`)
    );

    // Define milestones and rewards
    const milestones = [
      { type: 'followers', thresholds: [100, 500, 1000, 5000, 10000, 50000, 100000], gems_per: [10, 25, 50, 100, 250, 500, 1000] },
      { type: 'gold', thresholds: [10, 50, 100, 500, 1000], gems_per: [5, 15, 30, 75, 150] },
    ];

    const newRewards = [];

    for (const milestone of milestones) {
      const currentValue = milestone.type === 'followers' ? creator.follower_count : creator.gold_collected;

      for (let i = 0; i < milestone.thresholds.length; i++) {
        const threshold = milestone.thresholds[i];
        const gemReward = milestone.gems_per[i];
        const key = `${milestone.type}:${threshold}`;

        if (currentValue >= threshold && !claimedMilestones.has(key)) {
          // Award this milestone
          const { data: reward, error: rewardError } = await supabase
            .from('creator_rewards')
            .insert({
              user_id: creatorId,
              milestone_type: milestone.type,
              milestone_value: threshold,
              gem_amount: gemReward,
              status: 'pending',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!rewardError && reward) {
            newRewards.push(reward);
          }
        }
      }
    }

    return { checked: true, rewards: newRewards };
  } catch (error) {
    console.error('Error in checkCreatorRewards:', error);
    throw error;
  }
};

// Check and award creator rewards (admin endpoint)
router.post('/creator/check-rewards', async (req, res) => {
  try {
    // In a real app, you'd add admin authentication here
    const { creatorId } = req.body;

    if (!creatorId) {
      return res.status(400).json({ success: false, error: 'Creator ID is required' });
    }

    // This would be a background job in production
    const result = await checkCreatorRewards(creatorId);

    res.json({
      success: true,
      message: 'Reward check completed',
      rewards_found: result.rewards.length,
      rewards: result.rewards
    });
  } catch (error) {
    console.error('Error in POST /creator/check-rewards:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to check creator rewards'
    });
  }
});

// Get user's active shield subscription
router.get('/shield/active', async (req, res) => {
  try {
    const { data: subscription, error } = await supabase
      .from('shield_subscriptions')
      .select('*, shield_policies(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .not('expires_at', 'lt', new Date().toISOString())
      .order('expires_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error in GET /shield/active:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch active shield subscription'
    });
  }
});

// Cancel shield subscription
router.post('/shield/cancel', async (req, res) => {
  try {
    const { subscription_id: subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ success: false, error: 'Subscription ID is required' });
    }

    // Verify the subscription belongs to the user
    const { data: subscription, error: subError } = await supabase
      .from('shield_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', req.user.id)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Only active subscriptions can be canceled'
      });
    }

    // Calculate refund (pro-rated for the remaining days)
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const totalDays = Math.ceil((expiresAt - new Date(subscription.started_at)) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    const dailyRate = subscription.premium_paid / totalDays;
    const refundAmount = Math.max(0, Math.floor(dailyRate * remainingDays * 0.8)); // 80% refund policy

    // Update subscription status
    const { error: updateError } = await supabase
      .from('shield_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (updateError) throw updateError;

    // Refund the user if applicable
    if (refundAmount > 0) {
      await supabase.rpc('increment_gems', {
        user_id: req.user.id,
        amount: refundAmount,
      });

      // Record the refund in the ledger
      await supabase
        .from('growth_ledger')
        .insert({
          user_id: req.user.id,
          source_type: 'shield_refund',
          source_id: subscriptionId,
          amount: refundAmount,
          currency: 'gems',
          status: 'completed',
          metadata: {
            original_subscription_id: subscriptionId,
            original_amount: subscription.premium_paid,
            refund_percentage: (refundAmount / subscription.premium_paid * 100).toFixed(2)
          },
        });
    }

    res.json({
      success: true,
      refund_amount: refundAmount,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('Error in POST /shield/cancel:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel shield subscription'
    });
  }
});

// Export the router
module.exports = router;
