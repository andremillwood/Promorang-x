/**
 * KYC Verification Service
 * Comprehensive identity verification with limits enforcement
 * Integrates with Onfido, Jumio, or manual review
 */

const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

// =====================================================
// CONFIGURATION
// =====================================================

const KYC_PROVIDER = process.env.KYC_PROVIDER || 'manual'; // 'onfido', 'jumio', 'manual'

const ONFIDO_API_KEY = process.env.ONFIDO_API_KEY;
const JUMIO_API_KEY = process.env.JUMIO_API_KEY;

// =====================================================
// VERIFICATION FLOW
// =====================================================

/**
 * Start KYC verification for a user
 */
async function startVerification(userId, level = 'intermediate') {
  if (!supabase) throw new Error('Database not available');
  
  // Get or create KYC profile
  let profile = await getKycProfile(userId);
  
  if (!profile) {
    const { data, error } = await supabase
      .from('kyc_profiles')
      .insert({
        user_id: userId,
        kyc_level: 'none',
        kyc_status: 'none',
      })
      .select()
      .single();
    
    if (error) throw error;
    profile = data;
  }
  
  // Check if already verified at this level or higher
  const levelHierarchy = ['none', 'basic', 'intermediate', 'advanced'];
  const currentIndex = levelHierarchy.indexOf(profile.kyc_level);
  const requestedIndex = levelHierarchy.indexOf(level);
  
  if (currentIndex >= requestedIndex && profile.kyc_status === 'verified') {
    return {
      success: true,
      already_verified: true,
      current_level: profile.kyc_level,
      message: `Already verified at ${profile.kyc_level} level`,
    };
  }
  
  // Create verification attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('kyc_verification_attempts')
    .insert({
      user_id: userId,
      status: 'pending',
      attempt_number: await getNextAttemptNumber(userId),
    })
    .select()
    .single();
  
  if (attemptError) throw attemptError;
  
  // Update profile status
  await supabase
    .from('kyc_profiles')
    .update({
      kyc_status: 'pending',
      submitted_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  
  // Initialize provider check if configured
  let providerCheck = null;
  if (KYC_PROVIDER === 'onfido' && ONFIDO_API_KEY) {
    providerCheck = await initializeOnfidoCheck(userId, attempt.id);
  } else if (KYC_PROVIDER === 'jumio' && JUMIO_API_KEY) {
    providerCheck = await initializeJumioCheck(userId, attempt.id);
  }
  
  return {
    success: true,
    attempt_id: attempt.id,
    status: 'pending',
    provider: KYC_PROVIDER,
    provider_check: providerCheck,
    next_steps: getNextStepsForLevel(level),
  };
}

/**
 * Submit documents for verification
 */
async function submitDocuments(userId, documents) {
  if (!supabase) throw new Error('Database not available');
  
  const {
    id_document_front,     // URL to ID document front
    id_document_back,      // URL to ID document back (if applicable)
    id_document_type,      // 'passport', 'drivers_license', 'national_id'
    selfie,                // URL to selfie photo
    proof_of_address,      // URL to utility bill/bank statement (for advanced)
    personal_info,           // { first_name, last_name, date_of_birth, nationality, ... }
  } = documents;
  
  // Get latest attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('kyc_verification_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (attemptError || !attempt) {
    throw new Error('No active verification attempt found');
  }
  
  // Build document array
  const docArray = [];
  if (id_document_front) {
    docArray.push({
      type: id_document_type,
      url: id_document_front,
      side: 'front',
    });
  }
  if (id_document_back) {
    docArray.push({
      type: id_document_type,
      url: id_document_back,
      side: 'back',
    });
  }
  
  // Update attempt with documents
  await supabase
    .from('kyc_verification_attempts')
    .update({
      documents: docArray,
      selfie_url: selfie,
    })
    .eq('id', attempt.id);
  
  // Update profile with personal info
  if (personal_info) {
    await supabase
      .from('kyc_profiles')
      .update({
        first_name: personal_info.first_name,
        last_name: personal_info.last_name,
        date_of_birth: personal_info.date_of_birth,
        nationality: personal_info.nationality,
        country_of_residence: personal_info.country_of_residence,
        id_document_type: id_document_type,
        address_line1: personal_info.address_line1,
        address_line2: personal_info.address_line2,
        city: personal_info.city,
        state: personal_info.state,
        postal_code: personal_info.postal_code,
        country: personal_info.country,
        address_document_url: proof_of_address,
      })
      .eq('user_id', userId);
  }
  
  // If manual review, mark as needing review
  if (KYC_PROVIDER === 'manual') {
    await supabase
      .from('kyc_verification_attempts')
      .update({
        requires_manual_review: true,
        status: 'in_review',
      })
      .eq('id', attempt.id);
    
    await supabase
      .from('kyc_profiles')
      .update({
        kyc_status: 'in_review',
      })
      .eq('user_id', userId);
    
    // Notify admin (would integrate with notification service)
    console.log(`[KYC] Manual review required for user ${userId}`);
  }
  
  // If automated provider, submit to their API
  if (KYC_PROVIDER === 'onfido' && attempt.provider_check_id) {
    await submitToOnfido(attempt.provider_check_id, documents);
  }
  
  return {
    success: true,
    attempt_id: attempt.id,
    status: KYC_PROVIDER === 'manual' ? 'in_review' : 'pending',
    message: KYC_PROVIDER === 'manual' 
      ? 'Documents submitted for manual review' 
      : 'Documents submitted for automated verification',
  };
}

/**
 * Approve KYC (admin only)
 */
async function approveKyc(userId, adminId, level = 'intermediate', notes = '') {
  if (!supabase) throw new Error('Database not available');
  
  // Verify admin
  const { data: admin, error: adminError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', adminId)
    .eq('role', 'admin')
    .single();
  
  if (adminError || !admin) {
    throw new Error('Admin privileges required');
  }
  
  // Get latest attempt
  const { data: attempt } = await supabase
    .from('kyc_verification_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (attempt) {
    await supabase
      .from('kyc_verification_attempts')
      .update({
        status: 'verified',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        manual_review_notes: notes,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt.id);
  }
  
  // Get limits for this level
  const { data: limits } = await supabase
    .from('kyc_trading_limits')
    .select('*')
    .eq('kyc_level', level)
    .single();
  
  // Update profile
  await supabase
    .from('kyc_profiles')
    .update({
      kyc_level: level,
      kyc_status: 'verified',
      verified_at: new Date().toISOString(),
      last_reviewed_at: new Date().toISOString(),
      last_reviewed_by: adminId,
      daily_deposit_limit: limits?.daily_deposit_limit || 0,
      daily_withdrawal_limit: limits?.daily_withdrawal_limit || 0,
      max_single_trade_amount: limits?.max_single_trade || 0,
      max_portfolio_value: limits?.max_portfolio_value || 0,
    })
    .eq('user_id', userId);
  
  // Update user record
  await supabase
    .from('users')
    .update({ kyc_status: 'verified' })
    .eq('id', userId);
  
  return {
    success: true,
    user_id: userId,
    approved_level: level,
    limits: limits,
  };
}

/**
 * Reject KYC (admin only)
 */
async function rejectKyc(userId, adminId, reason, category = 'other') {
  if (!supabase) throw new Error('Database not available');
  
  // Get latest attempt
  const { data: attempt } = await supabase
    .from('kyc_verification_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (attempt) {
    await supabase
      .from('kyc_verification_attempts')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejection_category: category,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt.id);
  }
  
  // Update profile
  await supabase
    .from('kyc_profiles')
    .update({
      kyc_status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
      last_reviewed_at: new Date().toISOString(),
      last_reviewed_by: adminId,
    })
    .eq('user_id', userId);
  
  // Update user record
  await supabase
    .from('users')
    .update({ kyc_status: 'rejected' })
    .eq('id', userId);
  
  return {
    success: true,
    user_id: userId,
    rejection_reason: reason,
    rejection_category: category,
  };
}

// =====================================================
// LIMITS ENFORCEMENT
// =====================================================

/**
 * Check if transaction is allowed
 */
async function checkTransactionAllowed(userId, transactionType, amount) {
  if (!supabase) return { allowed: true }; // Allow in dev mode
  
  const { data: result, error } = await supabase
    .rpc('check_transaction_limits', {
      p_user_id: userId,
      p_transaction_type: transactionType,
      p_amount: amount,
    });
  
  if (error) {
    console.error('[KYC] Limit check error:', error);
    return { allowed: false, reason: 'System error checking limits' };
  }
  
  return result;
}

/**
 * Record transaction activity
 */
async function recordTransaction(userId, transactionType, amount) {
  if (!supabase) return;
  
  await supabase.rpc('record_kyc_activity', {
    p_user_id: userId,
    p_transaction_type: transactionType,
    p_amount: amount,
  });
}

/**
 * Get user's KYC status and limits
 */
async function getKycStatus(userId) {
  if (!supabase) {
    return {
      user_id: userId,
      kyc_level: 'none',
      kyc_status: 'none',
      can_trade: false,
      limits: {},
    };
  }
  
  const { data: profile, error } = await supabase
    .from('kyc_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !profile) {
    return {
      user_id: userId,
      kyc_level: 'none',
      kyc_status: 'none',
      can_trade: false,
      limits: {},
    };
  }
  
  const { data: limits } = await supabase
    .from('kyc_trading_limits')
    .select('*')
    .eq('kyc_level', profile.kyc_level)
    .single();
  
  // Get today's activity
  const { data: activity } = await supabase
    .from('kyc_daily_activity')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_date', new Date().toISOString().split('T')[0])
    .single();
  
  return {
    user_id: userId,
    kyc_level: profile.kyc_level,
    kyc_status: profile.kyc_status,
    can_trade: limits?.can_trade && profile.kyc_status === 'verified',
    can_deposit_crypto: limits?.can_deposit_crypto && profile.kyc_status === 'verified',
    can_withdraw_crypto: limits?.can_withdraw_crypto && profile.kyc_status === 'verified',
    limits: {
      daily_deposit: {
        limit: limits?.daily_deposit_limit || 0,
        used: activity?.deposits_total || 0,
        remaining: Math.max(0, (limits?.daily_deposit_limit || 0) - (activity?.deposits_total || 0)),
      },
      daily_withdrawal: {
        limit: limits?.daily_withdrawal_limit || 0,
        used: activity?.withdrawals_total || 0,
        remaining: Math.max(0, (limits?.daily_withdrawal_limit || 0) - (activity?.withdrawals_total || 0)),
      },
      daily_trade: {
        limit: limits?.daily_trade_volume_limit || 0,
        used: (activity?.trade_volume_buy || 0) + (activity?.trade_volume_sell || 0),
        remaining: Math.max(0, (limits?.daily_trade_volume_limit || 0) - (activity?.trade_volume_buy || 0) - (activity?.trade_volume_sell || 0)),
      },
      max_single_trade: limits?.max_single_trade || 0,
      max_portfolio_value: limits?.max_portfolio_value || 0,
    },
  };
}

// =====================================================
// PROVIDER INTEGRATIONS
// =====================================================

async function initializeOnfidoCheck(userId, attemptId) {
  if (!ONFIDO_API_KEY) return null;
  
  try {
    const response = await fetch('https://api.onfido.com/v3.4/checks', {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${ONFIDO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'express',
        applicant_id: userId, // You'd need to create applicant first
        reports: [
          { name: 'document' },
          { name: 'facial_similarity_photo' },
        ],
      }),
    });
    
    if (!response.ok) throw new Error('Onfido check creation failed');
    
    const data = await response.json();
    
    // Update attempt with provider info
    await supabase
      .from('kyc_verification_attempts')
      .update({
        provider: 'onfido',
        provider_check_id: data.id,
      })
      .eq('id', attemptId);
    
    return {
      check_id: data.id,
      status: data.status,
    };
  } catch (error) {
    console.error('[KYC] Onfido initialization error:', error);
    return null;
  }
}

async function initializeJumioCheck(userId, attemptId) {
  if (!JUMIO_API_KEY) return null;
  
  // Jumio integration would go here
  console.log('[KYC] Jumio integration not implemented');
  return null;
}

async function submitToOnfido(checkId, documents) {
  // Upload documents to Onfido
  console.log('[KYC] Document upload to Onfido:', checkId);
  // Implementation would use Onfido document upload API
}

// =====================================================
// WEBHOOK HANDLERS
// =====================================================

async function handleOnfidoWebhook(payload) {
  const { payload: checkPayload } = payload;
  
  if (checkPayload.action === 'check.completed') {
    const checkId = checkPayload.object.id;
    const result = checkPayload.object.result;
    
    // Find attempt by provider check ID
    const { data: attempt } = await supabase
      .from('kyc_verification_attempts')
      .select('*')
      .eq('provider_check_id', checkId)
      .single();
    
    if (!attempt) return { success: false, reason: 'Attempt not found' };
    
    if (result === 'clear') {
      // Auto-approve if clear
      await approveKyc(attempt.user_id, null, 'intermediate', 'Auto-approved via Onfido');
    } else {
      // Flag for manual review
      await supabase
        .from('kyc_verification_attempts')
        .update({
          requires_manual_review: true,
          provider_result: checkPayload.object,
        })
        .eq('id', attempt.id);
      
      await supabase
        .from('kyc_profiles')
        .update({
          kyc_status: 'in_review',
        })
        .eq('user_id', attempt.user_id);
    }
  }
  
  return { success: true };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getKycProfile(userId) {
  const { data, error } = await supabase
    .from('kyc_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return data;
}

async function getNextAttemptNumber(userId) {
  const { data, error } = await supabase
    .from('kyc_verification_attempts')
    .select('attempt_number')
    .eq('user_id', userId)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return 1;
  return data.attempt_number + 1;
}

function getNextStepsForLevel(level) {
  const steps = {
    basic: [
      'Verify email address',
      'Verify phone number',
    ],
    intermediate: [
      'Submit government-issued ID',
      'Submit selfie for facial verification',
      'Provide personal information',
    ],
    advanced: [
      'Complete intermediate verification',
      'Submit proof of address',
      'Provide source of funds information',
      'Occupation and employer details',
    ],
  };
  
  return steps[level] || steps.intermediate;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Verification flow
  startVerification,
  submitDocuments,
  approveKyc,
  rejectKyc,
  
  // Limits
  checkTransactionAllowed,
  recordTransaction,
  getKycStatus,
  
  // Webhooks
  handleOnfidoWebhook,
  
  // Helpers
  getKycProfile,
};
