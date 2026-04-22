/**
 * Referral Incentive Service
 * 
 * Manages cross-side referral loops and incentives:
 * - Merchant invites merchant
 * - User invites venue
 * - Representative recruits
 * - Cross-side feature unlocking
 */

const { supabase } = require('../lib/supabase');

/**
 * Create referral code
 */
async function createReferralCode(ownerId, codeType, options = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Generate unique code
    const prefix = codeType === 'merchant_invites_merchant' ? 'M2M' :
                   codeType === 'user_invites_venue' ? 'U2V' :
                   codeType === 'representative_recruits' ? 'REP' :
                   codeType === 'founding_member_boost' ? 'FND' : 'REF';
    
    const uniquePart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${prefix}-${uniquePart}`;

    // Define rewards based on type
    let rewardForReferrer = {};
    let rewardForReferee = {};

    switch (codeType) {
      case 'merchant_invites_merchant':
        rewardForReferrer = { bonus_allowance: 1, commission_on_referee: 0.05 };
        rewardForReferee = { fast_track_eligible: true, bonus_value_pool: 50 };
        break;

      case 'user_invites_venue':
        rewardForReferrer = { premium_participation_tier: true, gems: 100 };
        rewardForReferee = { user_acquisition_bonus: true };
        break;

      case 'representative_recruits':
        rewardForReferrer = { commission_boost: 0.20, territory_bonus: true };
        rewardForReferee = { fast_track_eligible: true };
        break;

      case 'founding_member_boost':
        rewardForReferrer = { bonus_allowance: 1, founding_referral_count: 1 };
        rewardForReferee = { founding_eligibility: true };
        break;

      default:
        rewardForReferrer = { points: 100 };
        rewardForReferee = { points: 50 };
    }

    const { data: referralCode, error } = await supabase
      .from('referral_codes')
      .insert({
        code: code,
        owner_id: ownerId,
        code_type: codeType,
        reward_for_referrer: { ...rewardForReferrer, ...options.referrerReward },
        reward_for_referee: { ...rewardForReferee, ...options.refereeReward },
        max_uses: options.maxUses || null,
        is_active: true,
        expires_at: options.expiresAt || null
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, referralCode };

  } catch (err) {
    console.error('[ReferralService] Error creating code:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Track referral action
 */
async function trackReferral(referralCode, actionType, metadata = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get referral code
    const { data: code } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', referralCode)
      .single();

    if (!code) {
      return { success: false, error: 'Invalid referral code' };
    }

    if (!code.is_active) {
      return { success: false, error: 'Referral code inactive' };
    }

    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      return { success: false, error: 'Referral code expired' };
    }

    if (code.max_uses && code.current_uses >= code.max_uses) {
      return { success: false, error: 'Referral code limit reached' };
    }

    // Create tracking record
    const { data: tracking, error } = await supabase
      .from('referral_tracking')
      .insert({
        referral_code_id: code.id,
        referrer_id: code.owner_id,
        referred_user_id: metadata.userId || null,
        referred_merchant_id: metadata.merchantId || null,
        action_type: actionType,
        reward_triggered: false,
        reward_paid: false
      })
      .select()
      .single();

    if (error) throw error;

    // Increment code usage
    await supabase
      .from('referral_codes')
      .update({
        current_uses: code.current_uses + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', code.id);

    // Process immediate rewards if applicable
    if (actionType === 'signup') {
      await processSignupRewards(code, tracking, metadata);
    }

    return { success: true, tracking };

  } catch (err) {
    console.error('[ReferralService] Error tracking referral:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Process signup rewards
 */
async function processSignupRewards(code, tracking, metadata) {
  // Award referee rewards immediately
  const refereeId = metadata.userId || metadata.merchantId;
  if (!refereeId) return;

  try {
    // Apply referee rewards based on code type
    switch (code.code_type) {
      case 'merchant_invites_merchant':
        // Fast-track the new merchant
        await supabase
          .from('fast_track_venues')
          .insert({
            merchant_id: refereeId,
            fast_track_type: 'referral',
            approved_by: code.owner_id,
            approved_at: new Date().toISOString(),
            bonus_value_pool: code.reward_for_referee.bonus_value_pool || 0
          });
        break;

      case 'user_invites_venue':
        // Upgrade user participation tier
        await supabase
          .from('users')
          .update({
            user_tier: 'premium',
            points_balance: supabase.rpc('increment', { val: 100 })
          })
          .eq('id', refereeId);
        break;

      case 'founding_member_boost':
        // Check if referee qualifies for founding member
        const { data: qualifies } = await supabase
          .from('founding_members')
          .select('id')
          .eq('user_id', refereeId)
          .maybeSingle();

        if (!qualifies) {
          // Auto-enroll if space available
          const { enrollFoundingMember } = require('./foundingMemberService');
          await enrollFoundingMember(refereeId, 'user', 'referral');
        }
        break;
    }

    // Mark tracking as reward triggered
    await supabase
      .from('referral_tracking')
      .update({ reward_triggered: true })
      .eq('id', tracking.id);

  } catch (err) {
    console.error('[ReferralService] Error processing signup rewards:', err);
  }
}

/**
 * Process conversion rewards (activation, purchase, etc.)
 */
async function processConversionRewards(trackingId, conversionType, conversionValue) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get tracking record
    const { data: tracking } = await supabase
      .from('referral_tracking')
      .select('*, referral_codes!inner(*), users!referrer_id(*)')
      .eq('id', trackingId)
      .single();

    if (!tracking) {
      return { success: false, error: 'Tracking not found' };
    }

    if (tracking.reward_paid) {
      return { success: false, error: 'Rewards already paid' };
    }

    const code = tracking.referral_codes;
    let rewardAmount = 0;

    // Calculate reward based on code type and conversion
    switch (code.code_type) {
      case 'merchant_invites_merchant':
        if (conversionType === 'first_activation') {
          rewardAmount = 10; // $10 or equivalent
          // Also give bonus allowance
          const { addBonusAllowance } = require('./monthlySamplingService');
          await addBonusAllowance(tracking.referrer_id, 1, 'Referral activation', 'merchant_invites_merchant');
        }
        if (conversionType === 'paid_upgrade') {
          rewardAmount = conversionValue * 0.05; // 5% of upgrade value
        }
        break;

      case 'user_invites_venue':
        if (conversionType === 'first_activation') {
          rewardAmount = 50; // 50 gems
          await supabase
            .from('users')
            .update({
              gems_balance: supabase.rpc('increment', { val: 50 })
            })
            .eq('id', tracking.referrer_id);
        }
        break;

      case 'representative_recruits':
        if (conversionType === 'first_activation') {
          rewardAmount = 25; // Commission boost
          // Queue commission
          const { queueCommission } = require('./representativeService');
          await queueCommission(tracking.referrer_id, tracking.referred_merchant_id, {
            type: 'new_venue',
            baseAmount: conversionValue,
            commissionRate: code.reward_for_referrer.commission_boost || 0.20
          });
        }
        break;
    }

    // Mark as converted and paid
    await supabase
      .from('referral_tracking')
      .update({
        action_type: conversionType,
        reward_triggered: true,
        reward_paid: true,
        reward_amount: rewardAmount,
        converted_at: new Date().toISOString()
      })
      .eq('id', trackingId);

    return { success: true, rewardAmount };

  } catch (err) {
    console.error('[ReferralService] Error processing conversion:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check and trigger cross-side unlocks
 */
async function checkCrossSideUnlocks() {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get current platform stats
    const { data: stats } = await supabase
      .from('cold_start_progress')
      .select('*')
      .single();

    if (!stats) {
      return { success: false, error: 'Could not get platform stats' };
    }

    // Get all pending unlocks
    const { data: pendingUnlocks } = await supabase
      .from('cross_side_unlocks')
      .select('*')
      .eq('is_unlocked', false);

    const newlyUnlocked = [];

    for (const unlock of pendingUnlocks || []) {
      let triggered = false;

      switch (unlock.trigger_type) {
        case 'total_users':
          triggered = (stats.users_last_30d || 0) >= unlock.trigger_threshold;
          break;

        case 'total_merchants':
          const totalMerchants = (stats.new_merchants || 0) + 
                                (stats.sampling_merchants || 0) + 
                                (stats.graduated_merchants || 0);
          triggered = totalMerchants >= unlock.trigger_threshold;
          break;

        case 'total_activations':
          // Count from sampling activations
          const { count: activationCount } = await supabase
            .from('sampling_activations')
            .select('*', { count: 'exact', head: true });
          triggered = (activationCount || 0) >= unlock.trigger_threshold;
          break;

        case 'total_redemptions':
          triggered = (stats.redemptions_last_30d || 0) >= unlock.trigger_threshold;
          break;

        case 'geographic_coverage':
          // Check distinct cities in pre_populated_venues or merchant addresses
          const { data: cities } = await supabase
            .from('pre_populated_venues')
            .select('city')
            .not('claimed_by', 'is', null)
            .group('city');
          triggered = (cities?.length || 0) >= unlock.trigger_threshold;
          break;

        case 'niche_diversity':
          // Check distinct categories
          const { data: niches } = await supabase
            .from('representatives')
            .select('niche')
            .eq('status', 'active')
            .group('niche');
          triggered = (niches?.length || 0) >= unlock.trigger_threshold;
          break;
      }

      if (triggered) {
        // Unlock it
        await supabase
          .from('cross_side_unlocks')
          .update({
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
            unlocked_by_data: {
              stats_snapshot: stats,
              triggered_at: new Date().toISOString()
            }
          })
          .eq('id', unlock.id);

        newlyUnlocked.push(unlock);
      }
    }

    return {
      success: true,
      newlyUnlocked,
      totalUnlocked: (pendingUnlocks?.length || 0) - newlyUnlocked.length
    };

  } catch (err) {
    console.error('[ReferralService] Error checking unlocks:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get referral stats for user
 */
async function getUserReferralStats(userId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get user's referral codes
    const { data: codes } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('owner_id', userId);

    // Get all tracking for these codes
    const codeIds = codes?.map(c => c.id) || [];
    
    const { data: tracking } = await supabase
      .from('referral_tracking')
      .select('*')
      .in('referral_code_id', codeIds);

    // Calculate stats
    const stats = {
      totalCodes: codes?.length || 0,
      totalReferrals: tracking?.length || 0,
      conversions: tracking?.filter(t => t.converted_at)?.length || 0,
      pendingRewards: tracking?.filter(t => t.reward_triggered && !t.reward_paid)?.length || 0,
      totalRewards: tracking?.reduce((sum, t) => sum + (t.reward_amount || 0), 0) || 0
    };

    return {
      success: true,
      stats,
      codes: codes || [],
      tracking: tracking || []
    };

  } catch (err) {
    console.error('[ReferralService] Error getting stats:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get platform-wide unlock status
 */
async function getPlatformUnlockStatus() {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data: unlocks } = await supabase
      .from('cross_side_unlocks')
      .select('*')
      .order('trigger_threshold', { ascending: true });

    return {
      success: true,
      unlocks: unlocks || []
    };

  } catch (err) {
    console.error('[ReferralService] Error getting unlocks:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  createReferralCode,
  trackReferral,
  processConversionRewards,
  checkCrossSideUnlocks,
  getUserReferralStats,
  getPlatformUnlockStatus
};
