/**
 * User Maturity State Service
 * 
 * Controls progressive feature reveal based on user behavior.
 * States: 0=FIRST_TIME, 1=ACTIVE, 2=REWARDED, 3=POWER_USER, 4=OPERATOR_PRO
 * 
 * Transition Rules (aligned with Points → Keys → Drops → Gems economy):
 * 0 → 1: User has 500+ points OR has purchased first key
 * 1 → 2: User has completed first drop (earned first gems)
 * 2 → 3: User has 5+ gems earned OR 3+ drops completed OR subscription
 * 3 → 4: Manual/role-based approval only
 * 
 * IMPORTANT: This service NEVER downgrades maturity state automatically.
 */

const supabase = require('../lib/supabase');

// Enum for maturity states
const UserMaturityState = {
  FIRST_TIME: 0,
  ACTIVE: 1,
  REWARDED: 2,
  POWER_USER: 3,
  OPERATOR_PRO: 4
};

// Action types that count toward maturity progression
const VERIFIED_ACTION_TYPES = [
  'deal_claimed',
  'event_rsvp',
  'post_submitted',
  'share_completed',
  'content_created',
  'drop_completed',
  'coupon_redeemed',
  'referral_sent',
  'profile_completed',
  'social_connected',
  'page_view'
];

/**
 * Record a verified action for a user
 * @param {string} userId - User ID
 * @param {string} actionType - Type of action (from VERIFIED_ACTION_TYPES)
 * @param {object} metadata - Additional action metadata
 * @param {string} surface - Surface where action occurred (web, mobile, api)
 * @returns {Promise<object>} - The recorded action
 */
async function recordVerifiedAction(userId, actionType, metadata = {}, surface = 'web') {
  if (!userId) {
    console.warn('[MaturityService] recordVerifiedAction called without userId');
    return null;
  }

  // Special handling for demo users or missing database
  if (!supabase || userId.startsWith('a0000000')) {
    console.log(`[MaturityService] Bypassing action recording for demo/non-DB user: ${userId}`);
    await recalculateMaturityState(userId);
    return { id: 'demo-action-id', user_id: userId, action_type: actionType, verified_at: new Date().toISOString() };
  }

  try {
    // Insert the verified action
    const { data: action, error: actionError } = await supabase
      .from('verified_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        action_metadata: metadata,
        surface,
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (actionError) {
      console.error('[MaturityService] Error recording action:', actionError);
      return null;
    }

    // Update user's verified_actions_count (only for non-page-view actions) and last_used_surface
    const updateData = {
      last_used_surface: surface,
      updated_at: new Date().toISOString()
    };

    if (actionType !== 'page_view') {
      updateData.verified_actions_count = supabase.raw('COALESCE(verified_actions_count, 0) + 1');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      // Try simpler update without raw SQL
      await supabase.rpc('increment_verified_actions', { user_id_param: userId });
    }

    // Recalculate maturity state after action
    await recalculateMaturityState(userId);

    return action;
  } catch (err) {
    console.error('[MaturityService] recordVerifiedAction error:', err);
    return null;
  }
}

/**
 * Get user's current maturity state and related data
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User maturity data
 */
async function getUserMaturityData(userId) {
  if (!userId) {
    return {
      maturity_state: UserMaturityState.FIRST_TIME,
      verified_actions_count: 0,
      first_reward_received_at: null,
      last_used_surface: null
    };
  }

  // Special handling for State 0-3 demo users to bypass database lookups
  if (String(userId).startsWith('a0000000')) {
    const stateNum = parseInt(String(userId).split('-').pop()) || 0;
    return {
      maturity_state: stateNum,
      verified_actions_count: stateNum * 5,
      first_reward_received_at: stateNum > 0 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      last_used_surface: 'today',
      user_type: 'creator'
    };
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('maturity_state, verified_actions_count, first_reward_received_at, last_used_surface, user_type')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return {
        maturity_state: UserMaturityState.FIRST_TIME,
        verified_actions_count: 0,
        first_reward_received_at: null,
        last_used_surface: null
      };
    }

    return {
      maturity_state: user.maturity_state ?? UserMaturityState.FIRST_TIME,
      verified_actions_count: user.verified_actions_count ?? 0,
      first_reward_received_at: user.first_reward_received_at,
      last_used_surface: user.last_used_surface,
      user_type: user.user_type
    };
  } catch (err) {
    console.error('[MaturityService] getUserMaturityData error:', err);
    return {
      maturity_state: UserMaturityState.FIRST_TIME,
      verified_actions_count: 0,
      first_reward_received_at: null,
      last_used_surface: null
    };
  }
}

/**
 * Recalculate and update user's maturity state based on their activity
 * IMPORTANT: Never downgrades automatically
 * 
 * Transition Rules (aligned with Points → Keys → Drops → Gems economy):
 * 0 → 1: User has 500+ points OR has purchased first key
 * 1 → 2: User has completed first drop (earned first gems)
 * 2 → 3: User has 5+ gems earned OR 3+ drops completed OR subscription
 * 3 → 4: Manual/role-based approval only
 * 
 * @param {string} userId - User ID
 * @param {object} options - Additional options for state calculation
 * @returns {Promise<object>} - Updated maturity state info
 */
async function recalculateMaturityState(userId, options = {}) {
  if (!userId) return null;

  // Special handling for demo users or missing database - no-op but returns something
  if (!supabase || userId.startsWith('a0000000')) {
    return { changed: false, current_state: parseInt(String(userId).split('-').pop()) || 0 };
  }

  try {
    // Get current user data including economy balances
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('maturity_state, verified_actions_count, first_reward_received_at, user_type, points_balance, keys_balance, gems_balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('[MaturityService] User not found:', userId);
      return { state: UserMaturityState.FIRST_TIME, changed: false };
    }

    const currentState = user.maturity_state ?? UserMaturityState.FIRST_TIME;
    const pointsBalance = user.points_balance ?? 0;
    const keysBalance = user.keys_balance ?? 0;
    const gemsBalance = user.gems_balance ?? 0;
    const hasReceivedReward = !!user.first_reward_received_at;

    let newState = currentState;
    let triggerReason = null;

    // Thresholds for state transitions
    const POINTS_FOR_ACTIVE = 500;  // Points needed for first key
    const GEMS_FOR_POWER_USER = 5;  // Gems earned to become power user
    const DROPS_FOR_POWER_USER = 3; // Drops completed to become power user

    // State 0 → 1: 500+ points OR has purchased first key
    if (currentState === UserMaturityState.FIRST_TIME) {
      if (pointsBalance >= POINTS_FOR_ACTIVE) {
        newState = UserMaturityState.ACTIVE;
        triggerReason = 'reached_500_points';
      } else if (keysBalance >= 1) {
        newState = UserMaturityState.ACTIVE;
        triggerReason = 'purchased_first_key';
      }
    }

    // State 1 → 2: First gems earned (first drop completed)
    if (currentState === UserMaturityState.ACTIVE) {
      if (gemsBalance >= 1 || hasReceivedReward) {
        newState = UserMaturityState.REWARDED;
        triggerReason = 'earned_first_gems';
      }
    }

    // State 2 → 3: Power user criteria
    if (currentState === UserMaturityState.REWARDED) {
      // Check for 5+ gems earned
      if (gemsBalance >= GEMS_FOR_POWER_USER) {
        newState = UserMaturityState.POWER_USER;
        triggerReason = 'earned_5_gems';
      }

      // Check for 3+ drops completed
      const { count: dropsCompleted } = await supabase
        .from('verified_actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', 'drop_completed');

      if (dropsCompleted >= DROPS_FOR_POWER_USER) {
        newState = UserMaturityState.POWER_USER;
        triggerReason = 'completed_3_drops';
      }

      // Check for subscription
      if (options.hasSubscription) {
        newState = UserMaturityState.POWER_USER;
        triggerReason = 'subscribed';
      }

      // Check for advanced feature access attempt
      if (options.accessedAdvancedFeature) {
        newState = UserMaturityState.POWER_USER;
        triggerReason = 'accessed_advanced_feature';
      }
    }

    // State 3 → 4: Manual only (handled by setOperatorPro)
    // Never auto-upgrade to OPERATOR_PRO

    // Only update if state increased (never downgrade)
    if (newState > currentState) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          maturity_state: newState,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[MaturityService] Error updating maturity state:', updateError);
        return { state: currentState, changed: false };
      }

      // Record the transition
      await supabase
        .from('user_maturity_transitions')
        .insert({
          user_id: userId,
          from_state: currentState,
          to_state: newState,
          trigger_reason: triggerReason,
          trigger_metadata: { ...options, pointsBalance, keysBalance, gemsBalance }
        });

      console.log(`[MaturityService] User ${userId} transitioned from state ${currentState} to ${newState} (${triggerReason})`);
      return { state: newState, changed: true, reason: triggerReason };
    }

    return { state: currentState, changed: false };
  } catch (err) {
    console.error('[MaturityService] recalculateMaturityState error:', err);
    return { state: UserMaturityState.FIRST_TIME, changed: false };
  }
}

/**
 * Mark that user received their first reward
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
async function markFirstRewardReceived(userId) {
  if (!userId) return false;

  // Special handling for demo users or missing database
  if (!supabase || userId.startsWith('a0000000')) {
    console.log(`[MaturityService] Bypassing markFirstRewardReceived for demo/non-DB user: ${userId}`);
    await recalculateMaturityState(userId); // Still trigger recalculation for demo user
    return true;
  }

  try {
    // Only update if not already set
    const { data: user } = await supabase
      .from('users')
      .select('first_reward_received_at')
      .eq('id', userId)
      .single();

    if (user?.first_reward_received_at) {
      // Already received first reward
      return true;
    }

    const { error } = await supabase
      .from('users')
      .update({
        first_reward_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('[MaturityService] Error marking first reward:', error);
      return false;
    }

    // Recalculate state after reward
    await recalculateMaturityState(userId);
    return true;
  } catch (err) {
    console.error('[MaturityService] markFirstRewardReceived error:', err);
    return false;
  }
}

/**
 * Manually set user to OPERATOR_PRO state (admin only)
 * @param {string} userId - User ID
 * @param {string} adminId - Admin user ID performing the action
 * @returns {Promise<boolean>} - Success status
 */
async function setOperatorPro(userId, adminId) {
  if (!userId || !adminId) return false;

  // Special handling for demo users or missing database
  if (!supabase || (userId && String(userId).startsWith('a0000000'))) {
    const stateNum = userId ? (parseInt(String(userId).split('-').pop()) || 0) : 0;
    console.log(`[MaturityService] Bypassing setOperatorPro for demo/non-DB user: ${userId}`);
    // For demo users, we simulate the state change for subsequent calls
    return {
      user_id: userId || 'anonymous',
      maturity_state: UserMaturityState.OPERATOR_PRO, // Always set to OPERATOR_PRO for demo
      verified_actions_count: stateNum * 5,
      first_reward_received_at: stateNum > 0 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      last_used_surface: 'today',
      updated_at: new Date().toISOString()
    };
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('maturity_state')
      .eq('id', userId)
      .single();

    if (!user) return false;

    const currentState = user.maturity_state ?? UserMaturityState.FIRST_TIME;

    const { error } = await supabase
      .from('users')
      .update({
        maturity_state: UserMaturityState.OPERATOR_PRO,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('[MaturityService] Error setting operator pro:', error);
      return false;
    }

    // Record the transition
    await supabase
      .from('user_maturity_transitions')
      .insert({
        user_id: userId,
        from_state: currentState,
        to_state: UserMaturityState.OPERATOR_PRO,
        trigger_reason: 'manual_operator_pro_approval',
        trigger_metadata: { approved_by: adminId }
      });

    return true;
  } catch (err) {
    console.error('[MaturityService] setOperatorPro error:', err);
    return false;
  }
}

/**
 * Get visibility rules for a given maturity state
 * @param {number} state - Maturity state
 * @returns {object} - Visibility configuration
 */
function getVisibilityRules(state) {
  const rules = {
    // Features visible at each state
    deals: state >= UserMaturityState.FIRST_TIME,
    events: state >= UserMaturityState.FIRST_TIME,
    post: state >= UserMaturityState.FIRST_TIME,
    history: state >= UserMaturityState.ACTIVE,
    balance_minimal: state >= UserMaturityState.REWARDED,
    balance_full: state >= UserMaturityState.POWER_USER,
    promoshare_explainer: state >= UserMaturityState.REWARDED,
    promoshare_badge: true, // Always visible as badge
    social_shield_explainer: state >= UserMaturityState.ACTIVE,
    social_shield_badge: true, // Always visible as badge
    wallet_full: state >= UserMaturityState.POWER_USER,
    growth_hub: state >= UserMaturityState.POWER_USER,
    forecasts: state >= UserMaturityState.POWER_USER,
    staking: state >= UserMaturityState.POWER_USER,
    matrix: state >= UserMaturityState.POWER_USER,
    referrals: state >= UserMaturityState.POWER_USER,

    // Copy variations
    useEarlyTerminology: state < UserMaturityState.POWER_USER,

    // Labels based on state
    labels: {
      rewards: state < UserMaturityState.POWER_USER ? 'Rewards' : 'Balance',
      activity: state < UserMaturityState.POWER_USER ? 'Activity' : 'Earnings',
      deals: state < UserMaturityState.POWER_USER ? 'Deals' : 'Drops',
      verified: state < UserMaturityState.POWER_USER ? 'Verified' : 'Social Shield',
      weeklyWins: state < UserMaturityState.POWER_USER ? 'Weekly Wins' : 'PromoShare'
    }
  };

  return rules;
}

/**
 * Check if user can access a specific feature
 * @param {number} userState - User's maturity state
 * @param {string} feature - Feature to check
 * @returns {object} - Access info { allowed, readOnly, redirectTo }
 */
function checkFeatureAccess(userState, feature) {
  const state = userState ?? UserMaturityState.FIRST_TIME;

  const featureRequirements = {
    deals: { minState: 0, readOnly: false },
    events: { minState: 0, readOnly: false },
    post: { minState: 0, readOnly: false },
    history: { minState: 1, readOnly: false },
    balance: { minState: 2, readOnly: false },
    promoshare: { minState: 2, readOnly: state < 2 },
    social_shield: { minState: 1, readOnly: state < 2 },
    wallet: { minState: 3, readOnly: false },
    growth_hub: { minState: 3, readOnly: state < 3 },
    forecasts: { minState: 3, readOnly: false },
    staking: { minState: 3, readOnly: false },
    matrix: { minState: 3, readOnly: false },
    referrals: { minState: 3, readOnly: false },
    operator_tools: { minState: 4, readOnly: false }
  };

  const requirement = featureRequirements[feature];
  if (!requirement) {
    return { allowed: true, readOnly: false, redirectTo: null };
  }

  const allowed = state >= requirement.minState;
  const readOnly = requirement.readOnly;

  // Determine redirect based on user's state
  let redirectTo = null;
  if (!allowed) {
    if (state === UserMaturityState.FIRST_TIME) {
      redirectTo = '/deals';
    } else if (state === UserMaturityState.ACTIVE) {
      redirectTo = '/deals';
    } else {
      redirectTo = '/deals';
    }
  }

  return { allowed, readOnly, redirectTo };
}

/**
 * Manually set user's maturity state (for demo users and testing)
 * @param {string} userId - User ID
 * @param {number} newState - New maturity state (0-4)
 * @returns {Promise<object>} - Updated user data
 */
async function setMaturityState(userId, newState) {
  if (!userId) return null;

  // Validate state is within range
  if (newState < 0 || newState > 4) {
    throw new Error('Invalid maturity state. Must be 0-4.');
  }

  // Special handling for demo users or missing database
  if (!supabase || (userId && String(userId).startsWith('a0000000'))) {
    console.log(`[MaturityService] Setting maturity state for demo user: ${userId} -> ${newState}`);
    return {
      user_id: userId || 'anonymous',
      maturity_state: newState,
      verified_actions_count: newState * 5,
      first_reward_received_at: newState > 0 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      last_used_surface: 'today',
      updated_at: new Date().toISOString()
    };
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('maturity_state')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const currentState = user.maturity_state ?? UserMaturityState.FIRST_TIME;

    const { data, error } = await supabase
      .from('users')
      .update({
        maturity_state: newState,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[MaturityService] Error setting maturity state:', error);
      throw error;
    }

    // Record the transition
    await supabase
      .from('user_maturity_transitions')
      .insert({
        user_id: userId,
        from_state: currentState,
        to_state: newState,
        trigger_reason: 'manual_override',
        trigger_metadata: { previous_state: currentState }
      }).catch(e => console.warn('[MaturityService] Could not record transition:', e));

    return data;
  } catch (err) {
    console.error('[MaturityService] setMaturityState error:', err);
    throw err;
  }
}

module.exports = {
  UserMaturityState,
  VERIFIED_ACTION_TYPES,
  recordVerifiedAction,
  getUserMaturityData,
  recalculateMaturityState,
  markFirstRewardReceived,
  setOperatorPro,
  setMaturityState,
  getVisibilityRules,
  checkFeatureAccess
};
