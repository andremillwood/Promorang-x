/**
 * Monthly Sampling Service
 * 
 * Manages monthly provisions, rollovers, and tier-based sampling allowances
 * replacing the one-time limit with a sustainable monthly model.
 */

const { supabase } = require('../lib/supabase');

// Tier configurations
const TIER_CONFIG = {
  free: {
    baseAllowance: 1,
    maxRollover: 0,
    graduationTrigger: {
      activationsCompleted: 3,
      totalRedemptions: 50
    }
  },
  starter: {
    baseAllowance: 3,
    maxRollover: 3,
    graduationTrigger: {
      activationsCompleted: 10,
      totalRedemptions: 100,
      paidRevenue: 500
    }
  },
  growth: {
    baseAllowance: 10,
    maxRollover: 5,
    graduationTrigger: null // Manual upgrade only
  },
  pro: {
    baseAllowance: null, // Unlimited
    maxRollover: 0,
    graduationTrigger: null
  }
};

/**
 * Get or create monthly allowance for merchant
 */
async function getOrCreateMonthlyAllowance(advertiserId, tier = 'free') {
  if (!supabase) {
    return { allowance: null, isMock: true };
  }

  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  try {
    // Try to get existing allowance
    let { data: allowance, error } = await supabase
      .from('merchant_sampling_allowance')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .eq('month_year', monthYear)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }

    // If no allowance exists, create it (with rollover from previous month)
    if (!allowance) {
      const rollover = await calculateRollover(advertiserId, tier);
      
      const { data: newAllowance, error: createError } = await supabase
        .from('merchant_sampling_allowance')
        .insert({
          advertiser_id: advertiserId,
          month_year: monthYear,
          tier: tier,
          base_allowance: TIER_CONFIG[tier].baseAllowance || 999,
          rollover_from_previous: rollover,
          bonus_allowance: 0,
          used_this_month: 0,
          expires_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      
      // Log the creation
      await logAllowanceHistory(newAllowance.id, advertiserId, 'created', null, null, newAllowance.total_available, 'Monthly allowance created');
      
      allowance = newAllowance;
    }

    return { allowance, isMock: false };
  } catch (err) {
    console.error('[MonthlySampling] Error getting/creating allowance:', err);
    return { allowance: null, isMock: true };
  }
}

/**
 * Calculate rollover from previous month
 */
async function calculateRollover(advertiserId, tier) {
  const config = TIER_CONFIG[tier];
  if (config.maxRollover === 0) return 0;

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthYear = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

  try {
    const { data: prevAllowance } = await supabase
      .from('merchant_sampling_allowance')
      .select('remaining')
      .eq('advertiser_id', advertiserId)
      .eq('month_year', prevMonthYear)
      .single();

    if (!prevAllowance) return 0;

    // Cap at max rollover
    return Math.min(prevAllowance.remaining, config.maxRollover);
  } catch (err) {
    console.error('[MonthlySampling] Error calculating rollover:', err);
    return 0;
  }
}

/**
 * Check if merchant can create activation this month
 */
async function canCreateMonthlyActivation(advertiserId, tier = 'free') {
  const { allowance, isMock } = await getOrCreateMonthlyAllowance(advertiserId, tier);
  
  if (isMock) {
    return { 
      allowed: true, 
      remaining: 999, 
      reason: null,
      tier,
      isMock: true 
    };
  }

  if (!allowance) {
    return { 
      allowed: false, 
      remaining: 0, 
      reason: 'Unable to verify monthly allowance',
      tier,
      isMock: false 
    };
  }

  if (allowance.remaining <= 0) {
    return { 
      allowed: false, 
      remaining: 0, 
      reason: `Monthly limit reached. ${allowance.total_available} activations used.`,
      tier,
      allowance,
      isMock: false 
    };
  }

  return { 
    allowed: true, 
    remaining: allowance.remaining, 
    reason: null,
    tier,
    allowance,
    isMock: false 
  };
}

/**
 * Use one monthly activation
 */
async function useMonthlyActivation(advertiserId, tier = 'free') {
  const { allowance } = await getOrCreateMonthlyAllowance(advertiserId, tier);
  
  if (!allowance) {
    return { success: false, error: 'No allowance found' };
  }

  try {
    const { data: updated, error } = await supabase
      .from('merchant_sampling_allowance')
      .update({
        used_this_month: allowance.used_this_month + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', allowance.id)
      .select()
      .single();

    if (error) throw error;

    // Log the usage
    await logAllowanceHistory(
      allowance.id, 
      advertiserId, 
      'used', 
      1, 
      allowance.remaining, 
      updated.remaining,
      'Activation created'
    );

    return { 
      success: true, 
      remaining: updated.remaining,
      totalUsed: updated.used_this_month 
    };
  } catch (err) {
    console.error('[MonthlySampling] Error using activation:', err);
    return { success: false, error: 'Failed to record activation usage' };
  }
}

/**
 * Add bonus allowance (referrals, founding status, etc.)
 */
async function addBonusAllowance(advertiserId, bonusCount, reason, source) {
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    // Get current allowance
    const { data: allowance } = await supabase
      .from('merchant_sampling_allowance')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .eq('month_year', monthYear)
      .single();

    if (!allowance) {
      return { success: false, error: 'No current month allowance found' };
    }

    const { data: updated, error } = await supabase
      .from('merchant_sampling_allowance')
      .update({
        bonus_allowance: allowance.bonus_allowance + bonusCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', allowance.id)
      .select()
      .single();

    if (error) throw error;

    // Log the bonus
    await logAllowanceHistory(
      allowance.id,
      advertiserId,
      'bonus_added',
      bonusCount,
      allowance.remaining,
      updated.remaining,
      `Bonus: ${reason} (Source: ${source})`
    );

    return { 
      success: true, 
      bonusAdded: bonusCount,
      newTotal: updated.total_available,
      newRemaining: updated.remaining 
    };
  } catch (err) {
    console.error('[MonthlySampling] Error adding bonus:', err);
    return { success: false, error: 'Failed to add bonus allowance' };
  }
}

/**
 * Check if merchant qualifies for tier graduation
 */
async function checkTierGraduation(advertiserId, currentTier) {
  const config = TIER_CONFIG[currentTier];
  if (!config.graduationTrigger) {
    return { canGraduate: false, reason: 'Manual upgrade only' };
  }

  try {
    // Get lifetime metrics
    const { data: metrics } = await supabase
      .from('sampling_activation_metrics')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .single();

    if (!metrics) {
      return { canGraduate: false, reason: 'No activation data found' };
    }

    const checks = {
      activationsCompleted: config.graduationTrigger.activationsCompleted 
        ? metrics.total_activations >= config.graduationTrigger.activationsCompleted
        : true,
      totalRedemptions: config.graduationTrigger.totalRedemptions 
        ? metrics.redemptions >= config.graduationTrigger.totalRedemptions
        : true,
      paidRevenue: config.graduationTrigger.paidRevenue 
        ? (metrics.revenue || 0) >= config.graduationTrigger.paidRevenue
        : true
    };

    const allMet = Object.values(checks).every(Boolean);

    if (allMet) {
      // Determine next tier
      const tierOrder = ['free', 'starter', 'growth', 'pro'];
      const currentIndex = tierOrder.indexOf(currentTier);
      const nextTier = tierOrder[currentIndex + 1];

      return {
        canGraduate: true,
        nextTier,
        currentMetrics: {
          activations: metrics.total_activations,
          redemptions: metrics.redemptions,
          revenue: metrics.revenue || 0
        },
        required: config.graduationTrigger
      };
    }

    return {
      canGraduate: false,
      checks,
      currentMetrics: {
        activations: metrics.total_activations,
        redemptions: metrics.redemptions,
        revenue: metrics.revenue || 0
      },
      required: config.graduationTrigger
    };
  } catch (err) {
    console.error('[MonthlySampling] Error checking graduation:', err);
    return { canGraduate: false, reason: 'Error checking graduation eligibility' };
  }
}

/**
 * Upgrade merchant tier
 */
async function upgradeTier(advertiserId, fromTier, toTier, reason) {
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    // Update current month's allowance with new tier
    const { data: updated } = await supabase
      .from('merchant_sampling_allowance')
      .update({
        tier: toTier,
        base_allowance: TIER_CONFIG[toTier].baseAllowance || 999,
        updated_at: new Date().toISOString()
      })
      .eq('advertiser_id', advertiserId)
      .eq('month_year', monthYear)
      .select()
      .single();

    // Log the tier upgrade
    await logAllowanceHistory(
      updated.id,
      advertiserId,
      'tier_upgrade',
      null,
      null,
      updated.total_available,
      `Tier upgraded from ${fromTier} to ${toTier}: ${reason}`
    );

    return { 
      success: true, 
      newTier: toTier,
      newAllowance: updated.total_available,
      newRemaining: updated.remaining 
    };
  } catch (err) {
    console.error('[MonthlySampling] Error upgrading tier:', err);
    return { success: false, error: 'Failed to upgrade tier' };
  }
}

/**
 * Log allowance history
 */
async function logAllowanceHistory(allowanceId, advertiserId, actionType, activationsCount, previousRemaining, newRemaining, reason) {
  try {
    await supabase
      .from('merchant_sampling_allowance_history')
      .insert({
        allowance_id: allowanceId,
        advertiser_id: advertiserId,
        action_type: actionType,
        activations_count: activationsCount,
        previous_remaining: previousRemaining,
        new_remaining: newRemaining,
        reason: reason
      });
  } catch (err) {
    console.error('[MonthlySampling] Error logging history:', err);
  }
}

/**
 * Get allowance history for analytics
 */
async function getAllowanceHistory(advertiserId, months = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  try {
    const { data: history } = await supabase
      .from('merchant_sampling_allowance_history')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    return { success: true, history };
  } catch (err) {
    console.error('[MonthlySampling] Error getting history:', err);
    return { success: false, error: 'Failed to get history' };
  }
}

/**
 * Get current month's usage stats
 */
async function getCurrentMonthStats(advertiserId) {
  const { allowance } = await getOrCreateMonthlyAllowance(advertiserId);
  
  if (!allowance) {
    return { success: false, error: 'No allowance found' };
  }

  return {
    success: true,
    stats: {
      month: allowance.month_year,
      tier: allowance.tier,
      base: allowance.base_allowance,
      rollover: allowance.rollover_from_previous,
      bonus: allowance.bonus_allowance,
      total: allowance.total_available,
      used: allowance.used_this_month,
      remaining: allowance.remaining,
      expiresAt: allowance.expires_at
    }
  };
}

module.exports = {
  TIER_CONFIG,
  getOrCreateMonthlyAllowance,
  canCreateMonthlyActivation,
  useMonthlyActivation,
  addBonusAllowance,
  checkTierGraduation,
  upgradeTier,
  getAllowanceHistory,
  getCurrentMonthStats,
  calculateRollover
};
