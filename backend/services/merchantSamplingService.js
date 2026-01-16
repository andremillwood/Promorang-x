/**
 * Merchant Sampling Service
 * 
 * Manages the merchant sampling program that allows new merchants to experience
 * real user participation before committing to paid activations.
 * 
 * Merchant States: NEW → SAMPLING → GRADUATED → PAID
 * 
 * Key Principles:
 * - Value before belief, experience before spend
 * - One sampling activation per merchant (per brand/location)
 * - Integrates with existing Deals, Events, Post Proof entry surfaces
 * - Automatic graduation triggers
 * - No parallel or standalone user flows
 */

const supabase = require('../lib/supabase');

// Merchant state enum
const MerchantState = {
  NEW: 'NEW',
  SAMPLING: 'SAMPLING',
  GRADUATED: 'GRADUATED',
  PAID: 'PAID'
};

// Value types for sampling activations
const ValueType = {
  COUPON: 'coupon',
  PRODUCT: 'product',
  VOUCHER: 'voucher',
  EXPERIENCE: 'experience',
  CASH_PRIZE: 'cash_prize'
};

// Default sampling limits
const DEFAULT_LIMITS = {
  max_activations_per_merchant: 1,
  min_duration_days: 7,
  max_duration_days: 14,
  max_product_units: 20,
  max_voucher_redemptions: 20,
  max_cash_prize_usd: 100
};

// Default graduation triggers
const DEFAULT_GRADUATION_TRIGGERS = {
  redemption_rate_threshold: 0.30,      // 30% of contributed value redeemed
  verified_actions_threshold: 25,        // 25 verified user actions
  entry_user_ratio_threshold: 0.60       // 60% from entry users (states 0-2)
};

/**
 * Get sampling configuration from database
 */
async function getSamplingConfig(configKey) {
  if (!supabase) {
    if (configKey === 'limits') return DEFAULT_LIMITS;
    if (configKey === 'graduation_triggers') return DEFAULT_GRADUATION_TRIGGERS;
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('sampling_config')
      .select('config_value')
      .eq('config_key', configKey)
      .single();

    if (error || !data) {
      // Return defaults based on key
      if (configKey === 'limits') return DEFAULT_LIMITS;
      if (configKey === 'graduation_triggers') return DEFAULT_GRADUATION_TRIGGERS;
      return {};
    }

    return data.config_value;
  } catch (err) {
    console.error('[MerchantSampling] Error getting config:', err);
    if (configKey === 'limits') return DEFAULT_LIMITS;
    if (configKey === 'graduation_triggers') return DEFAULT_GRADUATION_TRIGGERS;
    return {};
  }
}

/**
 * Get merchant's current state
 */
async function getMerchantState(advertiserId) {
  if (!advertiserId || !supabase) {
    return { state: MerchantState.NEW, profile: null };
  }

  try {
    const { data: profile, error } = await supabase
      .from('advertiser_profiles')
      .select('user_id, company_name, merchant_state, sampling_started_at, graduated_at, paid_at')
      .eq('user_id', advertiserId)
      .single();

    if (error || !profile) {
      return { state: MerchantState.NEW, profile: null };
    }

    return {
      state: profile.merchant_state || MerchantState.NEW,
      profile
    };
  } catch (err) {
    console.error('[MerchantSampling] Error getting merchant state:', err);
    return { state: MerchantState.NEW, profile: null };
  }
}

/**
 * Check if merchant can create a sampling activation
 */
async function canCreateSamplingActivation(advertiserId) {
  const { state } = await getMerchantState(advertiserId);

  // Only NEW merchants can create sampling activations
  if (state !== MerchantState.NEW) {
    return {
      allowed: false,
      reason: state === MerchantState.SAMPLING
        ? 'You already have an active sampling activation'
        : state === MerchantState.GRADUATED
          ? 'Your sampling period has ended. Choose your next step.'
          : 'You are already on a paid plan'
    };
  }

  // Check if merchant already has a sampling activation (even completed)
  const limits = await getSamplingConfig('limits');

  if (!supabase) return { allowed: true, reason: null };

  try {
    const { count, error } = await supabase
      .from('sampling_activations')
      .select('*', { count: 'exact', head: true })
      .eq('advertiser_id', advertiserId);

    if (error) {
      console.error('[MerchantSampling] Error checking existing activations:', error);
      return { allowed: false, reason: 'Unable to verify eligibility' };
    }

    if (count >= limits.max_activations_per_merchant) {
      return {
        allowed: false,
        reason: 'You have already used your sampling activation. No second sampling is permitted.'
      };
    }

    return { allowed: true, reason: null };
  } catch (err) {
    console.error('[MerchantSampling] canCreateSamplingActivation error:', err);
    return { allowed: false, reason: 'Unable to verify eligibility' };
  }
}

/**
 * Create a sampling activation for a merchant
 */
async function createSamplingActivation(advertiserId, activationData) {
  // Verify merchant can create activation
  const eligibility = await canCreateSamplingActivation(advertiserId);
  if (!eligibility.allowed) {
    return { success: false, error: eligibility.reason };
  }

  const limits = await getSamplingConfig('limits');

  // Validate duration
  const durationDays = activationData.duration_days || 7;
  if (durationDays < limits.min_duration_days || durationDays > limits.max_duration_days) {
    return {
      success: false,
      error: `Duration must be between ${limits.min_duration_days} and ${limits.max_duration_days} days`
    };
  }

  // Validate value limits based on type
  const valueType = activationData.value_type;
  const maxRedemptions = activationData.max_redemptions || 20;

  if (valueType === ValueType.PRODUCT && maxRedemptions > limits.max_product_units) {
    return {
      success: false,
      error: `Maximum ${limits.max_product_units} product units allowed for sampling`
    };
  }

  if (valueType === ValueType.VOUCHER && maxRedemptions > limits.max_voucher_redemptions) {
    return {
      success: false,
      error: `Maximum ${limits.max_voucher_redemptions} voucher redemptions allowed for sampling`
    };
  }

  if (valueType === ValueType.CASH_PRIZE && activationData.value_amount > limits.max_cash_prize_usd) {
    return {
      success: false,
      error: `Maximum cash prize of $${limits.max_cash_prize_usd} allowed for sampling`
    };
  }

  try {
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Create the sampling activation
    const { data: activation, error: activationError } = await supabase
      .from('sampling_activations')
      .insert({
        advertiser_id: advertiserId,
        name: activationData.name,
        description: activationData.description,
        value_type: valueType,
        value_amount: activationData.value_amount,
        value_unit: activationData.value_unit || 'usd',
        max_redemptions: maxRedemptions,
        current_redemptions: 0,
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        duration_days: durationDays,
        status: 'active',
        include_in_deals: activationData.include_in_deals !== false,
        include_in_events: activationData.include_in_events || false,
        include_in_post_proof: activationData.include_in_post_proof || false,
        promoshare_enabled: true,  // Mandatory
        social_shield_required: true  // Mandatory
      })
      .select()
      .single();

    if (activationError) {
      console.error('[MerchantSampling] Error creating activation:', activationError);
      return { success: false, error: 'Failed to create sampling activation' };
    }

    // Transition merchant to SAMPLING state
    await transitionMerchantState(advertiserId, MerchantState.NEW, MerchantState.SAMPLING, 'sampling_activation_created', {
      activation_id: activation.id
    });

    return { success: true, activation };
  } catch (err) {
    console.error('[MerchantSampling] createSamplingActivation error:', err);
    return { success: false, error: 'Failed to create sampling activation' };
  }
}

/**
 * Transition merchant to a new state
 */
async function transitionMerchantState(advertiserId, fromState, toState, triggerReason, metadata = {}) {
  if (!supabase) {
    console.log(`[MerchantSampling] Mock transition: ${fromState} -> ${toState}`);
    return true;
  }

  try {
    // Update advertiser profile
    const updateData = {
      merchant_state: toState,
      updated_at: new Date().toISOString()
    };

    if (toState === MerchantState.SAMPLING) {
      updateData.sampling_started_at = new Date().toISOString();
    } else if (toState === MerchantState.GRADUATED) {
      updateData.graduated_at = new Date().toISOString();
    } else if (toState === MerchantState.PAID) {
      updateData.paid_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('advertiser_profiles')
      .update(updateData)
      .eq('user_id', advertiserId);

    if (updateError) {
      console.error('[MerchantSampling] Error updating merchant state:', updateError);
      return false;
    }

    // Record the transition
    await supabase
      .from('merchant_state_transitions')
      .insert({
        advertiser_id: advertiserId,
        from_state: fromState,
        to_state: toState,
        trigger_reason: triggerReason,
        trigger_metadata: metadata
      });

    console.log(`[MerchantSampling] Merchant ${advertiserId} transitioned from ${fromState} to ${toState} (${triggerReason})`);
    return true;
  } catch (err) {
    console.error('[MerchantSampling] transitionMerchantState error:', err);
    return false;
  }
}

/**
 * Record user participation in a sampling activation
 */
async function recordParticipation(activationId, userId, actionType, userMaturityState, metadata = {}) {
  try {
    // Check if activation is active
    const { data: activation, error: activationError } = await supabase
      .from('sampling_activations')
      .select('*')
      .eq('id', activationId)
      .eq('status', 'active')
      .single();

    if (activationError || !activation) {
      return { success: false, error: 'Activation not found or not active' };
    }

    // Check if activation has expired
    if (new Date(activation.expires_at) < new Date()) {
      // Mark as expired and trigger graduation check
      await supabase
        .from('sampling_activations')
        .update({ status: 'expired' })
        .eq('id', activationId);

      await checkGraduationTriggers(activation.advertiser_id, activationId);
      return { success: false, error: 'Activation has expired' };
    }

    // Record participation (upsert to handle duplicates)
    const { data: participation, error: participationError } = await supabase
      .from('sampling_participations')
      .upsert({
        activation_id: activationId,
        user_id: userId,
        action_type: actionType,
        user_maturity_state: userMaturityState,
        action_metadata: metadata
      }, {
        onConflict: 'activation_id,user_id,action_type'
      })
      .select()
      .single();

    if (participationError) {
      console.error('[MerchantSampling] Error recording participation:', participationError);
      return { success: false, error: 'Failed to record participation' };
    }

    // Check graduation triggers after each participation
    await checkGraduationTriggers(activation.advertiser_id, activationId);

    return { success: true, participation };
  } catch (err) {
    console.error('[MerchantSampling] recordParticipation error:', err);
    return { success: false, error: 'Failed to record participation' };
  }
}

/**
 * Verify a participation (Social Shield verification)
 */
async function verifyParticipation(participationId, verificationMethod = 'social_shield') {
  try {
    const { data: participation, error } = await supabase
      .from('sampling_participations')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        verification_method: verificationMethod
      })
      .eq('id', participationId)
      .select('*, sampling_activations!inner(advertiser_id)')
      .single();

    if (error) {
      console.error('[MerchantSampling] Error verifying participation:', error);
      return { success: false, error: 'Failed to verify participation' };
    }

    // Check graduation triggers after verification
    await checkGraduationTriggers(
      participation.sampling_activations.advertiser_id,
      participation.activation_id
    );

    return { success: true, participation };
  } catch (err) {
    console.error('[MerchantSampling] verifyParticipation error:', err);
    return { success: false, error: 'Failed to verify participation' };
  }
}

/**
 * Record a redemption
 */
async function recordRedemption(participationId, redemptionValue) {
  try {
    // Update participation
    const { data: participation, error: participationError } = await supabase
      .from('sampling_participations')
      .update({
        redeemed: true,
        redeemed_at: new Date().toISOString(),
        redemption_value: redemptionValue
      })
      .eq('id', participationId)
      .select('*, sampling_activations!inner(*)')
      .single();

    if (participationError) {
      console.error('[MerchantSampling] Error recording redemption:', participationError);
      return { success: false, error: 'Failed to record redemption' };
    }

    const activation = participation.sampling_activations;

    // Increment redemption count on activation
    const { error: updateError } = await supabase
      .from('sampling_activations')
      .update({
        current_redemptions: activation.current_redemptions + 1
      })
      .eq('id', activation.id);

    if (updateError) {
      console.error('[MerchantSampling] Error updating redemption count:', updateError);
    }

    // Check if all redemptions used
    if (activation.current_redemptions + 1 >= activation.max_redemptions) {
      await supabase
        .from('sampling_activations')
        .update({ status: 'completed' })
        .eq('id', activation.id);
    }

    // Check graduation triggers
    await checkGraduationTriggers(activation.advertiser_id, activation.id);

    return { success: true, participation };
  } catch (err) {
    console.error('[MerchantSampling] recordRedemption error:', err);
    return { success: false, error: 'Failed to record redemption' };
  }
}

/**
 * Check and apply graduation triggers
 * 
 * Graduation occurs if ANY of these conditions are met:
 * - ≥30% of contributed value is redeemed
 * - ≥25 verified user actions tied to the merchant
 * - Sampling window expires naturally
 * - Merchant explicitly requests another activation/higher limits/advanced features
 */
async function checkGraduationTriggers(advertiserId, activationId) {
  try {
    // Get current merchant state
    const { state } = await getMerchantState(advertiserId);

    // Only check if in SAMPLING state
    if (state !== MerchantState.SAMPLING) {
      return { graduated: false, reason: null };
    }

    // Get activation with metrics
    const { data: activation, error: activationError } = await supabase
      .from('sampling_activations')
      .select('*')
      .eq('id', activationId)
      .single();

    if (activationError || !activation) {
      return { graduated: false, reason: null };
    }

    // Already graduated
    if (activation.graduation_triggered) {
      return { graduated: true, reason: activation.graduation_reason };
    }

    const triggers = await getSamplingConfig('graduation_triggers');

    // Get participation metrics
    const { data: participations, error: participationsError } = await supabase
      .from('sampling_participations')
      .select('*')
      .eq('activation_id', activationId);

    if (participationsError) {
      console.error('[MerchantSampling] Error getting participations:', participationsError);
      return { graduated: false, reason: null };
    }

    const verifiedActions = participations.filter(p => p.verified).length;
    const entryUserParticipants = participations.filter(p => p.user_maturity_state <= 2).length;
    const redemptionRate = activation.max_redemptions > 0
      ? activation.current_redemptions / activation.max_redemptions
      : 0;

    let graduationReason = null;

    // Check trigger 1: Redemption rate threshold
    if (redemptionRate >= triggers.redemption_rate_threshold) {
      graduationReason = 'redemption_rate_threshold';
    }

    // Check trigger 2: Verified actions threshold
    if (verifiedActions >= triggers.verified_actions_threshold) {
      graduationReason = 'verified_actions_threshold';
    }

    // Check trigger 3: Window expired
    if (new Date(activation.expires_at) < new Date()) {
      graduationReason = 'window_expired';
    }

    // If any trigger met, graduate the merchant
    if (graduationReason) {
      // Mark activation as graduated
      await supabase
        .from('sampling_activations')
        .update({
          graduation_triggered: true,
          graduation_reason: graduationReason,
          graduation_triggered_at: new Date().toISOString(),
          status: activation.status === 'active' ? 'completed' : activation.status
        })
        .eq('id', activationId);

      // Transition merchant state
      await transitionMerchantState(
        advertiserId,
        MerchantState.SAMPLING,
        MerchantState.GRADUATED,
        graduationReason,
        {
          activation_id: activationId,
          redemption_rate: redemptionRate,
          verified_actions: verifiedActions,
          entry_user_participants: entryUserParticipants
        }
      );

      return { graduated: true, reason: graduationReason };
    }

    return { graduated: false, reason: null };
  } catch (err) {
    console.error('[MerchantSampling] checkGraduationTriggers error:', err);
    return { graduated: false, reason: null };
  }
}

/**
 * Manually trigger graduation (merchant requests advanced features)
 */
async function requestGraduation(advertiserId, requestType) {
  const { state } = await getMerchantState(advertiserId);

  if (state !== MerchantState.SAMPLING) {
    return { success: false, error: 'Not in sampling state' };
  }

  // Get active activation
  const { data: activation, error } = await supabase
    .from('sampling_activations')
    .select('*')
    .eq('advertiser_id', advertiserId)
    .eq('status', 'active')
    .single();

  if (error || !activation) {
    return { success: false, error: 'No active sampling activation found' };
  }

  // Mark activation as graduated
  await supabase
    .from('sampling_activations')
    .update({
      graduation_triggered: true,
      graduation_reason: `merchant_request_${requestType}`,
      graduation_triggered_at: new Date().toISOString(),
      status: 'completed'
    })
    .eq('id', activation.id);

  // Transition merchant state
  await transitionMerchantState(
    advertiserId,
    MerchantState.SAMPLING,
    MerchantState.GRADUATED,
    `merchant_request_${requestType}`,
    { activation_id: activation.id, request_type: requestType }
  );

  return { success: true };
}

/**
 * Upgrade merchant to PAID state
 */
async function upgradeToPaid(advertiserId, planDetails = {}) {
  const { state } = await getMerchantState(advertiserId);

  if (state !== MerchantState.GRADUATED) {
    return { success: false, error: 'Must be in GRADUATED state to upgrade' };
  }

  await transitionMerchantState(
    advertiserId,
    MerchantState.GRADUATED,
    MerchantState.PAID,
    'upgraded_to_paid',
    planDetails
  );

  return { success: true };
}

/**
 * Get sampling activation metrics for merchant dashboard
 */
async function getSamplingMetrics(advertiserId) {
  try {
    const { data: metrics, error } = await supabase
      .from('sampling_activation_metrics')
      .select('*')
      .eq('advertiser_id', advertiserId)
      .single();

    if (error) {
      // Return empty metrics if no activation
      return {
        has_activation: false,
        metrics: null
      };
    }

    return {
      has_activation: true,
      metrics
    };
  } catch (err) {
    console.error('[MerchantSampling] getSamplingMetrics error:', err);
    return { has_activation: false, metrics: null };
  }
}

/**
 * Get visibility rules for merchant based on state
 */
function getMerchantVisibilityRules(merchantState) {
  const isSampling = merchantState === MerchantState.SAMPLING;
  const isNew = merchantState === MerchantState.NEW;

  return {
    // Basic features always visible
    create_activation: isNew,
    view_participations: !isNew,
    view_redemptions: !isNew,
    view_basic_metrics: !isNew,

    // Advanced features hidden during sampling
    show_analytics: !isSampling && !isNew,
    show_forecasting: !isSampling && !isNew,
    show_optimization: !isSampling && !isNew,
    show_targeting: !isSampling && !isNew,
    show_scaling: !isSampling && !isNew,
    show_multiple_campaigns: !isSampling && !isNew,

    // Post-graduation options
    show_upgrade_options: merchantState === MerchantState.GRADUATED,
    show_paid_features: merchantState === MerchantState.PAID
  };
}

/**
 * Get active sampling activations for entry surfaces (Deals, Events, Post Proof)
 * These are shown to users alongside regular promotions
 */
async function getActiveSamplingForSurface(surface) {
  const surfaceColumn = {
    deals: 'include_in_deals',
    events: 'include_in_events',
    post: 'include_in_post_proof'
  }[surface];

  if (!surfaceColumn) {
    return [];
  }

  try {
    const { data: activations, error } = await supabase
      .from('sampling_activations')
      .select(`
        *,
        advertiser_profiles!inner(company_name, company_website)
      `)
      .eq('status', 'active')
      .eq(surfaceColumn, true)
      .lt('current_redemptions', supabase.raw('max_redemptions'))
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('[MerchantSampling] Error getting active sampling:', error);
      return [];
    }

    return activations || [];
  } catch (err) {
    console.error('[MerchantSampling] getActiveSamplingForSurface error:', err);
    return [];
  }
}

module.exports = {
  MerchantState,
  ValueType,
  getMerchantState,
  canCreateSamplingActivation,
  createSamplingActivation,
  transitionMerchantState,
  recordParticipation,
  verifyParticipation,
  recordRedemption,
  checkGraduationTriggers,
  requestGraduation,
  upgradeToPaid,
  getSamplingMetrics,
  getMerchantVisibilityRules,
  getActiveSamplingForSurface,
  getSamplingConfig
};
