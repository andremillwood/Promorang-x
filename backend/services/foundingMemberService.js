/**
 * Founding Member Service
 * 
 * Manages early adopters with permanent perks, progressive unlocking,
 * and founding member referral rewards.
 */

const { supabase } = require('../lib/supabase');

// Wave configurations
const WAVE_CONFIG = {
  1: { maxMembers: 100, perks: ['reduced_fees_5pct', 'priority_support', 'early_access', 'founding_badge_nft'] },
  2: { maxMembers: 500, perks: ['reduced_fees_3pct', 'early_access', 'founding_badge_nft'] },
  3: { maxMembers: 1000, perks: ['early_access', 'founding_badge_nft'] }
};

/**
 * Enroll user as founding member
 */
async function enrollFoundingMember(userId, memberType, source = 'application') {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Check if already founding member
    const { data: existing } = await supabase
      .from('founding_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return { 
        success: false, 
        error: 'Already a founding member',
        member: existing 
      };
    }

    // Determine wave
    const currentWave = await getCurrentWave();
    const waveConfig = WAVE_CONFIG[currentWave];

    if (!waveConfig) {
      return { 
        success: false, 
        error: 'Founding member program closed' 
      };
    }

    // Check if wave is full
    const { count } = await supabase
      .from('founding_members')
      .select('*', { count: 'exact', head: true })
      .eq('wave', currentWave);

    if (count >= waveConfig.maxMembers) {
      // Move to next wave
      const nextWave = currentWave + 1;
      if (!WAVE_CONFIG[nextWave]) {
        return { success: false, error: 'Founding member program full' };
      }
      return enrollFoundingMember(userId, memberType, source);
    }

    // Create founding member record
    const { data: member, error } = await supabase
      .from('founding_members')
      .insert({
        user_id: userId,
        member_type: memberType,
        wave: currentWave,
        badge_display_name: `Founding Member (Wave ${currentWave})`,
        perks: waveConfig.perks,
        unlocks_achieved: [],
        unlocks_available: await getAvailableUnlocks(currentWave),
        status: 'active',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Generate referral code for founding member
    const referralCode = await generateReferralCode(userId);

    return { 
      success: true, 
      member,
      referralCode,
      perks: waveConfig.perks 
    };

  } catch (err) {
    console.error('[FoundingMemberService] Error enrolling:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get current wave
 */
async function getCurrentWave() {
  if (!supabase) return 1;

  try {
    for (let wave = 1; wave <= 3; wave++) {
      const { count } = await supabase
        .from('founding_members')
        .select('*', { count: 'exact', head: true })
        .eq('wave', wave);

      if (count < WAVE_CONFIG[wave].maxMembers) {
        return wave;
      }
    }
    return 3; // Default to last wave
  } catch (err) {
    console.error('[FoundingMemberService] Error getting current wave:', err);
    return 1;
  }
}

/**
 * Get available unlocks for wave
 */
async function getAvailableUnlocks(wave) {
  if (!supabase) return [];

  try {
    const { data: unlocks } = await supabase
      .from('founding_member_unlocks')
      .select('*')
      .contains('founding_waves_eligible', [wave])
      .eq('is_active', true);

    return (unlocks || []).map(u => u.unlock_code);
  } catch (err) {
    console.error('[FoundingMemberService] Error getting unlocks:', err);
    return [];
  }
}

/**
 * Generate referral code for founding member
 */
async function generateReferralCode(userId) {
  if (!supabase) return null;

  try {
    const code = `FOUNDER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        code: code,
        owner_id: userId,
        code_type: 'founding_member_boost',
        reward_for_referrer: { bonus_allowance: 1, founding_status_boost: true },
        reward_for_referee: { founding_eligibility: true, bonus_perks: ['referred_by_founder'] },
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[FoundingMemberService] Error generating code:', err);
    return null;
  }
}

/**
 * Record founding member referral
 */
async function recordReferral(referrerId, referredId, codeUsed) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Check if already referred
    const { data: existing } = await supabase
      .from('founding_referrals')
      .select('*')
      .eq('referrer_id', referrerId)
      .eq('referred_id', referredId)
      .maybeSingle();

    if (existing) {
      return { 
        success: false, 
        error: 'Already recorded',
        referral: existing 
      };
    }

    // Create referral record
    const { data: referral, error } = await supabase
      .from('founding_referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        referral_code_used: codeUsed,
        referral_source: 'founding_member',
        reward_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Update referrer's referral count
    const { data: referrer } = await supabase
      .from('founding_members')
      .select('referral_count')
      .eq('id', referrerId)
      .single();

    if (referrer) {
      await supabase
        .from('founding_members')
        .update({
          referral_count: referrer.referral_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', referrerId);
    }

    return { success: true, referral };

  } catch (err) {
    console.error('[FoundingMemberService] Error recording referral:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Award referral rewards
 */
async function awardReferralRewards(referralId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get referral
    const { data: referral } = await supabase
      .from('founding_referrals')
      .select('*, founding_members!referrer_id(*)')
      .eq('id', referralId)
      .single();

    if (!referral) {
      return { success: false, error: 'Referral not found' };
    }

    if (referral.reward_status !== 'pending') {
      return { success: false, error: 'Rewards already processed' };
    }

    // Award referrer: +1 bonus activation
    await supabase
      .from('founding_members')
      .update({
        perks: supabase.rpc('array_append', {
          arr: referral.founding_members.perks,
          elem: 'bonus_activation_referral'
        }),
        referral_rewards_earned: referral.founding_members.referral_rewards_earned + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', referral.referrer_id);

    // Mark as awarded
    const { data: updated } = await supabase
      .from('founding_referrals')
      .update({
        reward_status: 'awarded',
        awarded_at: new Date().toISOString(),
        reward_amount: 1
      })
      .eq('id', referralId)
      .select()
      .single();

    return { success: true, referral: updated };

  } catch (err) {
    console.error('[FoundingMemberService] Error awarding rewards:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check and award unlocks
 */
async function checkAndAwardUnlocks(memberId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get member
    const { data: member } = await supabase
      .from('founding_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Get unlock definitions
    const { data: unlocks } = await supabase
      .from('founding_member_unlocks')
      .select('*')
      .contains('founding_waves_eligible', [member.wave])
      .eq('is_active', true);

    const newlyAchieved = [];

    for (const unlock of unlocks || []) {
      // Skip if already achieved
      if (member.unlocks_achieved.includes(unlock.unlock_code)) {
        continue;
      }

      // Check requirement
      const achieved = await checkUnlockRequirement(member, unlock);

      if (achieved) {
        newlyAchieved.push(unlock);

        // Award reward
        await awardUnlockReward(memberId, unlock);
      }
    }

    return {
      success: true,
      newlyAchieved,
      totalAchieved: (member.unlocks_achieved || []).length + newlyAchieved.length
    };

  } catch (err) {
    console.error('[FoundingMemberService] Error checking unlocks:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if member meets unlock requirement
 */
async function checkUnlockRequirement(member, unlock) {
  const requirementType = unlock.requirement_type;
  const threshold = unlock.requirement_threshold;

  switch (requirementType) {
    case 'referral_count':
      return member.referral_count >= threshold;

    case 'time_since_joining':
      const daysSinceJoining = Math.floor(
        (Date.now() - new Date(member.joined_at)) / (1000 * 60 * 60 * 24)
      );
      return daysSinceJoining >= threshold;

    case 'participation_count':
      // Get participation count from sampling_participations
      const { count: participationCount } = await supabase
        .from('sampling_participations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', member.user_id);
      return (participationCount || 0) >= threshold;

    case 'redemption_count':
      // Get redemption count
      const { count: redemptionCount } = await supabase
        .from('sampling_participations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', member.user_id)
        .eq('redeemed', true);
      return (redemptionCount || 0) >= threshold;

    case 'merchant_activation_count':
      // For merchant-type founding members
      if (member.member_type !== 'merchant') return false;
      const { count: activationCount } = await supabase
        .from('sampling_activations')
        .select('*', { count: 'exact', head: true })
        .eq('advertiser_id', member.user_id);
      return (activationCount || 0) >= threshold;

    default:
      return false;
  }
}

/**
 * Award unlock reward
 */
async function awardUnlockReward(memberId, unlock) {
  if (!supabase) return;

  try {
    // Get current member
    const { data: member } = await supabase
      .from('founding_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (!member) return;

    // Add to achieved unlocks
    const newAchieved = [...(member.unlocks_achieved || []), unlock.unlock_code];

    // Process reward based on type
    let rewardApplied = false;

    switch (unlock.reward_type) {
      case 'feature_access':
        // Add feature flag to perks
        const featurePerk = `feature_${unlock.reward_value.feature}`;
        if (!member.perks.includes(featurePerk)) {
          member.perks.push(featurePerk);
        }
        rewardApplied = true;
        break;

      case 'fee_reduction':
        // Add fee reduction perk
        const reductionPerk = `fee_reduction_${unlock.reward_value.reduction_pct}pct`;
        if (!member.perks.includes(reductionPerk)) {
          member.perks.push(reductionPerk);
        }
        rewardApplied = true;
        break;

      case 'bonus_allowance':
        // Add bonus activations perk
        const bonusPerk = `bonus_activations_${unlock.reward_value.bonus_activations}`;
        if (!member.perks.includes(bonusPerk)) {
          member.perks.push(bonusPerk);
        }
        rewardApplied = true;
        break;

      case 'commission_boost':
        // For representatives
        if (member.member_type === 'representative') {
          const boostPerk = `commission_boost_${unlock.reward_value.boost_pct}pct`;
          if (!member.perks.includes(boostPerk)) {
            member.perks.push(boostPerk);
          }
          rewardApplied = true;
        }
        break;

      case 'exclusive_badge':
        // Add badge to perks
        if (!member.perks.includes(unlock.reward_value.badge)) {
          member.perks.push(unlock.reward_value.badge);
        }
        rewardApplied = true;
        break;

      case 'priority_support':
        if (!member.perks.includes('priority_support_plus')) {
          member.perks.push('priority_support_plus');
        }
        rewardApplied = true;
        break;
    }

    if (rewardApplied) {
      await supabase
        .from('founding_members')
        .update({
          unlocks_achieved: newAchieved,
          perks: member.perks,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);
    }

  } catch (err) {
    console.error('[FoundingMemberService] Error awarding unlock:', err);
  }
}

/**
 * Get founding member profile
 */
async function getFoundingMemberProfile(userId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data: member, error } = await supabase
      .from('founding_members')
      .select('*, founding_referrals!referrer_id(count)')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Not a founding member' };
      }
      throw error;
    }

    // Get available unlocks
    const { data: availableUnlocks } = await supabase
      .from('founding_member_unlocks')
      .select('*')
      .contains('founding_waves_eligible', [member.wave])
      .eq('is_active', true)
      .not('unlock_code', 'in', `(${member.unlocks_achieved.join(',')})`);

    return {
      success: true,
      profile: {
        ...member,
        referralCount: member.referral_count,
        perks: member.perks,
        unlocksAchieved: member.unlocks_achieved,
        unlocksAvailable: (availableUnlocks || []).map(u => ({
          code: u.unlock_code,
          name: u.unlock_name,
          description: u.description,
          requirement: {
            type: u.requirement_type,
            threshold: u.requirement_threshold
          },
          reward: {
            type: u.reward_type,
            value: u.reward_value
          }
        }))
      }
    };

  } catch (err) {
    console.error('[FoundingMemberService] Error getting profile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all founding members (admin view)
 */
async function getAllFoundingMembers(filters = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    let query = supabase
      .from('founding_members')
      .select('*, users!user_id(email, display_name)')
      .order('joined_at', { ascending: true });

    if (filters.wave) {
      query = query.eq('wave', filters.wave);
    }

    if (filters.type) {
      query = query.eq('member_type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data: members, error } = await query;

    if (error) throw error;

    // Get stats
    const { data: stats } = await supabase
      .from('founding_members')
      .select('wave, count')
      .group('wave');

    return {
      success: true,
      members: members || [],
      stats: stats || []
    };

  } catch (err) {
    console.error('[FoundingMemberService] Error getting members:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update founding member status
 */
async function updateMemberStatus(userId, newStatus) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data, error } = await supabase
      .from('founding_members')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, member: data };

  } catch (err) {
    console.error('[FoundingMemberService] Error updating status:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if user qualifies for founding member program
 */
async function checkQualification(userId) {
  if (!supabase) {
    return { success: true, qualifies: true }; // Allow all in mock mode
  }

  try {
    // Check current wave
    const currentWave = await getCurrentWave();
    if (!WAVE_CONFIG[currentWave]) {
      return { success: true, qualifies: false, reason: 'Program closed' };
    }

    // Check if already member
    const { data: existing } = await supabase
      .from('founding_members')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return { success: true, qualifies: false, reason: 'Already a founding member' };
    }

    return { success: true, qualifies: true, wave: currentWave };

  } catch (err) {
    console.error('[FoundingMemberService] Error checking qualification:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  enrollFoundingMember,
  recordReferral,
  awardReferralRewards,
  checkAndAwardUnlocks,
  getFoundingMemberProfile,
  getAllFoundingMembers,
  updateMemberStatus,
  checkQualification,
  getCurrentWave,
  WAVE_CONFIG
};
