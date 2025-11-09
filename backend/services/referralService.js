/**
 * PROMORANG REFERRAL SERVICE
 * Comprehensive referral tracking and commission calculation engine
 * Handles multi-level referrals, commission processing, and tier management
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Commission rates by earning type
const COMMISSION_RATES = {
  drop_completion: 0.05, // 5% of drop reward
  campaign_spend: 0.05, // 5% of campaign spend
  product_sale: 0.05, // 5% of product sale
  subscription: 0.10, // 10% of subscription fee
  content_monetization: 0.05, // 5% of content earnings
  default: 0.05, // 5% default rate
};

// Activation requirements for referrals to become "active"
const ACTIVATION_REQUIREMENTS = {
  min_drops_completed: 1,
  min_points_earned: 100,
  min_days_active: 0,
};

/**
 * Generate a unique referral code for a user
 */
async function generateReferralCode(userId, prefix = 'PROMO', displayName = null) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Check if user already has a primary code
    const { data: existingCodes } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (existingCodes && existingCodes.length > 0) {
      return existingCodes[0].code;
    }

    // Generate new code using database function
    const { data, error } = await supabase.rpc('generate_referral_code', {
      p_user_id: userId,
      p_prefix: prefix,
    });

    if (error) throw error;

    const code = data;

    // Insert the code
    const { error: insertError } = await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code,
        display_name: displayName,
        is_active: true,
      });

    if (insertError) throw insertError;

    // Update user's primary referral code
    await supabase
      .from('users')
      .update({ primary_referral_code: code })
      .eq('id', userId);

    return code;
  } catch (error) {
    console.error('[Referral Service] Error generating code:', error);
    throw error;
  }
}

/**
 * Track a new referral when a user signs up with a referral code
 */
async function trackReferral(referredUserId, referralCode, signupMetadata = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Find the referral code
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('id, user_id, is_active, max_uses, uses_count, expires_at')
      .eq('code', referralCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      throw new Error('Invalid referral code');
    }

    // Validate code
    if (!codeData.is_active) {
      throw new Error('Referral code is inactive');
    }

    if (codeData.max_uses && codeData.uses_count >= codeData.max_uses) {
      throw new Error('Referral code has reached maximum uses');
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      throw new Error('Referral code has expired');
    }

    // Prevent self-referral
    if (codeData.user_id === referredUserId) {
      throw new Error('Cannot refer yourself');
    }

    // Check if user is already referred
    const { data: existingReferral } = await supabase
      .from('user_referrals')
      .select('id')
      .eq('referred_id', referredUserId)
      .single();

    if (existingReferral) {
      throw new Error('User already has a referrer');
    }

    // Create referral relationship
    const { data: referral, error: referralError } = await supabase
      .from('user_referrals')
      .insert({
        referrer_id: codeData.user_id,
        referred_id: referredUserId,
        referral_code_id: codeData.id,
        referral_code: referralCode.toUpperCase(),
        status: 'pending',
        signup_metadata: signupMetadata,
      })
      .select()
      .single();

    if (referralError) throw referralError;

    // Update user's referred_by_id
    await supabase
      .from('users')
      .update({ referred_by_id: codeData.user_id })
      .eq('id', referredUserId);

    return referral;
  } catch (error) {
    console.error('[Referral Service] Error tracking referral:', error);
    throw error;
  }
}

/**
 * Check if a referred user meets activation requirements
 */
async function checkActivationRequirements(userId) {
  if (!supabase) return false;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('points_balance, created_at')
      .eq('id', userId)
      .single();

    if (!user) return false;

    // Check points requirement
    if (user.points_balance < ACTIVATION_REQUIREMENTS.min_points_earned) {
      return false;
    }

    // Check days active requirement
    const daysSinceSignup = Math.floor(
      (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceSignup < ACTIVATION_REQUIREMENTS.min_days_active) {
      return false;
    }

    // Check drops completed (if applicable)
    // This would query a drops/tasks completion table
    // For now, we'll assume it's met if points are earned

    return true;
  } catch (error) {
    console.error('[Referral Service] Error checking activation:', error);
    return false;
  }
}

/**
 * Activate a referral once requirements are met
 */
async function activateReferral(referredUserId) {
  if (!supabase) return null;

  try {
    // Check if requirements are met
    const meetsRequirements = await checkActivationRequirements(referredUserId);
    if (!meetsRequirements) {
      return null;
    }

    // Update referral status
    const { data, error } = await supabase
      .from('user_referrals')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
      })
      .eq('referred_id', referredUserId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    // Award activation bonus to referrer (optional)
    if (data) {
      await awardActivationBonus(data.referrer_id, referredUserId);
    }

    return data;
  } catch (error) {
    console.error('[Referral Service] Error activating referral:', error);
    return null;
  }
}

/**
 * Award activation bonus when a referral becomes active
 */
async function awardActivationBonus(referrerId, referredUserId) {
  const ACTIVATION_BONUS = {
    gems: 100,
    points: 500,
  };

  try {
    // Award gems and points to referrer
    await supabase
      .from('users')
      .update({
        gems_balance: supabase.raw(`gems_balance + ${ACTIVATION_BONUS.gems}`),
        points_balance: supabase.raw(`points_balance + ${ACTIVATION_BONUS.points}`),
      })
      .eq('id', referrerId);

    console.log(`[Referral Service] Activation bonus awarded to ${referrerId}`);
  } catch (error) {
    console.error('[Referral Service] Error awarding activation bonus:', error);
  }
}

/**
 * Calculate and record commission for a referral earning
 */
async function calculateCommission(params) {
  const {
    referredUserId,
    earningType,
    earningAmount,
    earningCurrency = 'usd',
    sourceTransactionId = null,
    sourceTable = null,
    metadata = {},
  } = params;

  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Get referral relationship
    const { data: referral, error: referralError } = await supabase
      .from('user_referrals')
      .select('id, referrer_id, status')
      .eq('referred_id', referredUserId)
      .eq('status', 'active')
      .single();

    if (referralError || !referral) {
      // No active referral found
      return null;
    }

    // Get commission rate (check for tier-specific rate)
    const { data: user } = await supabase
      .from('users')
      .select('referral_tier_id, referral_tiers(commission_rate, bonus_rate)')
      .eq('id', referral.referrer_id)
      .single();

    let commissionRate = COMMISSION_RATES[earningType] || COMMISSION_RATES.default;

    if (user?.referral_tiers) {
      commissionRate = parseFloat(user.referral_tiers.commission_rate);
      if (user.referral_tiers.bonus_rate) {
        commissionRate += parseFloat(user.referral_tiers.bonus_rate);
      }
    }

    // Calculate commission amount
    const commissionAmount = parseFloat((earningAmount * commissionRate).toFixed(2));

    // Determine commission currency (default to gems for non-USD earnings)
    let commissionCurrency = earningCurrency;
    if (earningCurrency !== 'usd' && earningCurrency !== 'gems' && earningCurrency !== 'points') {
      commissionCurrency = 'gems';
    }

    // Create commission record
    const { data: commission, error: commissionError } = await supabase
      .from('referral_commissions')
      .insert({
        referral_id: referral.id,
        referrer_id: referral.referrer_id,
        referred_user_id: referredUserId,
        earning_type: earningType,
        earning_amount: earningAmount,
        earning_currency: earningCurrency,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        commission_currency: commissionCurrency,
        status: 'pending',
        source_transaction_id: sourceTransactionId,
        source_table: sourceTable,
        metadata,
      })
      .select()
      .single();

    if (commissionError) throw commissionError;

    // Process commission immediately (or queue for batch processing)
    await processCommission(commission.id);

    return commission;
  } catch (error) {
    console.error('[Referral Service] Error calculating commission:', error);
    throw error;
  }
}

/**
 * Process a pending commission and pay it out
 */
async function processCommission(commissionId) {
  if (!supabase) return null;

  try {
    // Get commission details
    const { data: commission } = await supabase
      .from('referral_commissions')
      .select('*')
      .eq('id', commissionId)
      .single();

    if (!commission || commission.status !== 'pending') {
      return null;
    }

    // Credit the referrer's balance
    const updateField = `${commission.commission_currency}_balance`;
    await supabase
      .from('users')
      .update({
        [updateField]: supabase.raw(`${updateField} + ${commission.commission_amount}`),
      })
      .eq('id', commission.referrer_id);

    // Update commission status
    const { data, error } = await supabase
      .from('referral_commissions')
      .update({
        status: 'paid',
        processed_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) throw error;

    console.log(`[Referral Service] Commission ${commissionId} processed successfully`);
    return data;
  } catch (error) {
    console.error('[Referral Service] Error processing commission:', error);
    
    // Mark as failed
    await supabase
      .from('referral_commissions')
      .update({ status: 'failed' })
      .eq('id', commissionId);

    throw error;
  }
}

/**
 * Get referral statistics for a user
 */
async function getReferralStats(userId) {
  if (!supabase) return null;

  try {
    // Get user's referral data
    const { data: user } = await supabase
      .from('users')
      .select(`
        total_referrals,
        active_referrals,
        referral_earnings_usd,
        referral_earnings_gems,
        referral_earnings_points,
        primary_referral_code,
        referral_tier_id,
        referral_tiers(tier_name, tier_level, commission_rate, badge_icon, badge_color)
      `)
      .eq('id', userId)
      .single();

    if (!user) return null;

    // Get detailed referral list
    const { data: referrals } = await supabase
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
        users!user_referrals_referred_id_fkey(username, display_name, profile_image)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    // Get recent commissions
    const { data: recentCommissions } = await supabase
      .from('referral_commissions')
      .select('earning_type, commission_amount, commission_currency, paid_at, created_at')
      .eq('referrer_id', userId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(10);

    // Calculate conversion rate
    const conversionRate = user.total_referrals > 0
      ? (user.active_referrals / user.total_referrals) * 100
      : 0;

    return {
      summary: {
        total_referrals: user.total_referrals,
        active_referrals: user.active_referrals,
        pending_referrals: user.total_referrals - user.active_referrals,
        conversion_rate: conversionRate.toFixed(1),
        total_earnings: {
          usd: user.referral_earnings_usd,
          gems: user.referral_earnings_gems,
          points: user.referral_earnings_points,
        },
        referral_code: user.primary_referral_code,
        tier: user.referral_tiers,
      },
      referrals: referrals || [],
      recent_commissions: recentCommissions || [],
    };
  } catch (error) {
    console.error('[Referral Service] Error getting stats:', error);
    return null;
  }
}

/**
 * Update user's referral tier based on their performance
 */
async function updateReferralTier(userId) {
  if (!supabase) return null;

  try {
    // Calculate tier using database function
    const { data: tierId } = await supabase.rpc('calculate_referral_tier', {
      p_user_id: userId,
    });

    if (!tierId) return null;

    // Update user's tier
    await supabase
      .from('users')
      .update({ referral_tier_id: tierId })
      .eq('id', userId);

    return tierId;
  } catch (error) {
    console.error('[Referral Service] Error updating tier:', error);
    return null;
  }
}

module.exports = {
  generateReferralCode,
  trackReferral,
  checkActivationRequirements,
  activateReferral,
  calculateCommission,
  processCommission,
  getReferralStats,
  updateReferralTier,
  COMMISSION_RATES,
  ACTIVATION_REQUIREMENTS,
};
