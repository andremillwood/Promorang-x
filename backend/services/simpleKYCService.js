/**
 * Simple KYC Service
 * Manual document review workflow - no paid providers needed
 * Perfect for early-stage platforms with low volume
 * 
 * Flow:
 * 1. User submits info + documents
 * 2. Admin reviews in dashboard
 * 3. Approve/Reject with notes
 * 4. User gets trading access
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const {
  sendAdminAlertEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendKycAdditionalInfoEmail,
} = require('./resendService');

const supabase = global.supabase || serviceSupabase || null;

async function getUserEmailContext(userId) {
  if (!supabase || !userId) return null;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, username, display_name')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return user;
}

// =====================================================
// USER SUBMISSION
// =====================================================

/**
 * Submit KYC application
 */
async function submitKYC(userId, submissionData) {
  if (!supabase) {
    return {
      success: true,
      status: 'pending_review',
      message: 'KYC submitted for manual review (demo mode)',
    };
  }

  const {
    firstName,
    lastName,
    dateOfBirth,
    nationality,
    countryOfResidence,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    phoneNumber,
    idDocumentType, // 'passport', 'drivers_license', 'national_id'
    idDocumentFrontUrl,
    idDocumentBackUrl,
    selfieUrl,
    proofOfAddressUrl,
    occupation,
    sourceOfFunds,
  } = submissionData;

  // Validate required fields
  if (!firstName || !lastName || !dateOfBirth || !idDocumentFrontUrl) {
    throw new Error('Required fields missing: name, DOB, and ID document front are required');
  }

  // Check for existing pending application
  const { data: existing } = await supabase
    .from('simple_kyc_submissions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending_review', 'in_review'])
    .single();

  if (existing) {
    throw new Error('You already have a pending KYC submission. Please wait for review.');
  }

  // Create submission
  const { data: submission, error } = await supabase
    .from('simple_kyc_submissions')
    .insert({
      user_id: userId,
      status: 'pending_review',
      
      // Personal info
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      nationality: nationality,
      country_of_residence: countryOfResidence,
      
      // Address
      address_line1: addressLine1,
      address_line2: addressLine2,
      city: city,
      state: state,
      postal_code: postalCode,
      country: countryOfResidence,
      
      // Contact
      phone_number: phoneNumber,
      
      // Documents
      id_document_type: idDocumentType,
      id_document_front_url: idDocumentFrontUrl,
      id_document_back_url: idDocumentBackUrl,
      selfie_url: selfieUrl,
      proof_of_address_url: proofOfAddressUrl,
      
      // Additional info
      occupation: occupation,
      source_of_funds: sourceOfFunds,
      
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Update user status
  await supabase
    .from('users')
    .update({
      kyc_status: 'pending',
      kyc_submitted_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Notify admin (in production, send email/Slack)
  console.log(`[SimpleKYC] New submission from user ${userId}. Review at: /admin/kyc/${submission.id}`);

  try {
    await sendAdminAlertEmail({
      title: 'New KYC submission',
      message: `A new KYC submission is waiting for review.`,
      severity: 'info',
      ctaText: 'Open KYC queue',
      ctaUrl: `${process.env.FRONTEND_URL || 'https://promorang.co'}/admin/kyc`,
      metadata: {
        submission_id: submission.id,
        user_id: userId,
        status: submission.status,
      },
    });
  } catch (error) {
    console.error('[SimpleKYC] Failed to send admin alert for new submission:', error);
  }

  return {
    success: true,
    submission_id: submission.id,
    status: 'pending_review',
    message: 'Your documents have been submitted for review. This usually takes 1-2 business days.',
    estimated_review_time: '1-2 business days',
  };
}

// =====================================================
// ADMIN REVIEW
// =====================================================

/**
 * Get all pending KYC submissions (for admin dashboard)
 */
async function getPendingSubmissions(filters = {}) {
  if (!supabase) return { submissions: [], count: 0 };

  let query = supabase
    .from('simple_kyc_submissions')
    .select(`
      *,
      user:user_id(id, email, created_at)
    `)
    .in('status', ['pending_review', 'in_review', 'additional_info_needed'])
    .order('submitted_at', { ascending: true });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    submissions: data || [],
    count: data?.length || 0,
  };
}

/**
 * Get single submission details (for admin review)
 */
async function getSubmission(submissionId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('simple_kyc_submissions')
    .select(`
      *,
      user:user_id(id, email, profile)
    `)
    .eq('id', submissionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Start review (lock submission to admin)
 */
async function startReview(submissionId, adminId) {
  if (!supabase) return { success: true };

  const { error } = await supabase
    .from('simple_kyc_submissions')
    .update({
      status: 'in_review',
      reviewer_id: adminId,
      review_started_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .eq('status', 'pending_review'); // Only if not being reviewed

  if (error) throw error;

  return { success: true, message: 'Review started' };
}

/**
 * Approve KYC
 */
async function approveKYC(submissionId, adminId, requestedLevelOrNotes = '', maybeNotes = '') {
  if (!supabase) {
    return {
      success: true,
      status: 'approved',
      level: 'intermediate',
    };
  }

  // Get submission
  const { data: submission } = await supabase
    .from('simple_kyc_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (!submission) {
    throw new Error('Submission not found');
  }

  const requestedLevel = ['basic', 'intermediate', 'advanced'].includes(requestedLevelOrNotes)
    ? requestedLevelOrNotes
    : null;
  const notes = requestedLevel ? maybeNotes : requestedLevelOrNotes;

  // Determine level based on documents provided unless admin explicitly overrides it
  let kycLevel = requestedLevel || 'basic';
  if (!requestedLevel) {
    if (submission.proof_of_address_url && submission.occupation) {
      kycLevel = 'intermediate';
    }
    if (submission.source_of_funds) {
      kycLevel = 'advanced';
    }
  }

  // Get limits for this level
  const { data: limits } = await supabase
    .from('kyc_trading_limits')
    .select('*')
    .eq('kyc_level', kycLevel)
    .single();

  // Update submission
  await supabase
    .from('simple_kyc_submissions')
    .update({
      status: 'approved',
      reviewer_id: adminId,
      review_notes: notes,
      approved_at: new Date().toISOString(),
      assigned_level: kycLevel,
    })
    .eq('id', submissionId);

  // Create or update KYC profile
  const { data: existingProfile } = await supabase
    .from('kyc_profiles')
    .select('*')
    .eq('user_id', submission.user_id)
    .single();

  const profileData = {
    user_id: submission.user_id,
    kyc_level: kycLevel,
    kyc_status: 'verified',
    first_name: submission.first_name,
    last_name: submission.last_name,
    date_of_birth: submission.date_of_birth,
    nationality: submission.nationality,
    country_of_residence: submission.country_of_residence,
    address_line1: submission.address_line1,
    city: submission.city,
    state: submission.state,
    postal_code: submission.postal_code,
    country: submission.country,
    phone_number: submission.phone_number,
    id_document_type: submission.id_document_type,
    id_document_verified_at: new Date().toISOString(),
    occupation: submission.occupation,
    source_of_funds: submission.source_of_funds,
    verified_at: new Date().toISOString(),
    last_reviewed_at: new Date().toISOString(),
    last_reviewed_by: adminId,
    daily_deposit_limit: limits?.daily_deposit_limit || 500,
    daily_withdrawal_limit: limits?.daily_withdrawal_limit || 100,
    max_single_trade_amount: limits?.max_single_trade || 500,
    max_portfolio_value: limits?.max_portfolio_value || 5000,
  };

  if (existingProfile) {
    await supabase
      .from('kyc_profiles')
      .update(profileData)
      .eq('id', existingProfile.id);
  } else {
    await supabase.from('kyc_profiles').insert(profileData);
  }

  // Update user
  await supabase
    .from('users')
    .update({
      kyc_status: 'verified',
      kyc_level: kycLevel,
      kyc_verified_at: new Date().toISOString(),
    })
    .eq('id', submission.user_id);

  try {
    const user = await getUserEmailContext(submission.user_id);
    if (user?.email) {
      await sendKycApprovedEmail(
        user.email,
        user.display_name || user.username,
        { level: kycLevel, limits }
      );
    }
  } catch (error) {
    console.error('[SimpleKYC] Failed to send KYC approval email:', error);
  }

  return {
    success: true,
    user_id: submission.user_id,
    status: 'approved',
    level: kycLevel,
    limits: limits,
  };
}

/**
 * Reject KYC
 */
async function rejectKYC(submissionId, adminId, reason, category = 'other') {
  if (!supabase) {
    return {
      success: true,
      status: 'rejected',
    };
  }

  const { data: submission } = await supabase
    .from('simple_kyc_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Update submission
  await supabase
    .from('simple_kyc_submissions')
    .update({
      status: 'rejected',
      reviewer_id: adminId,
      rejection_reason: reason,
      rejection_category: category,
      rejected_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  // Update user
  await supabase
    .from('users')
    .update({
      kyc_status: 'rejected',
      kyc_rejection_reason: reason,
    })
    .eq('id', submission.user_id);

  try {
    const user = await getUserEmailContext(submission.user_id);
    if (user?.email) {
      await sendKycRejectedEmail(
        user.email,
        user.display_name || user.username,
        { reason, category }
      );
    }
  } catch (error) {
    console.error('[SimpleKYC] Failed to send KYC rejection email:', error);
  }

  return {
    success: true,
    user_id: submission.user_id,
    status: 'rejected',
    rejection_reason: reason,
    can_reapply: true,
  };
}

/**
 * Request additional info
 */
async function requestAdditionalInfo(submissionId, adminId, requestedInfo) {
  if (!supabase) return { success: true };

  await supabase
    .from('simple_kyc_submissions')
    .update({
      status: 'additional_info_needed',
      reviewer_id: adminId,
      additional_info_requested: requestedInfo,
      additional_info_requested_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  try {
    const { data: submission } = await supabase
      .from('simple_kyc_submissions')
      .select('user_id')
      .eq('id', submissionId)
      .single();

    if (submission?.user_id) {
      const user = await getUserEmailContext(submission.user_id);
      if (user?.email) {
        await sendKycAdditionalInfoEmail(
          user.email,
          user.display_name || user.username,
          { requestedInfo }
        );
      }
    }
  } catch (error) {
    console.error('[SimpleKYC] Failed to send KYC additional-info email:', error);
  }

  return {
    success: true,
    status: 'additional_info_needed',
    message: 'Additional information requested from user',
  };
}

// =====================================================
// USER QUERIES
// =====================================================

/**
 * Get user's KYC status
 */
async function getUserKYCStatus(userId) {
  if (!supabase) {
    return {
      user_id: userId,
      kyc_status: 'none',
      kyc_level: 'none',
      can_trade: false,
    };
  }

  const [{ data: submission }, { data: profile }] = await Promise.all([
    supabase
      .from('simple_kyc_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('kyc_profiles')
      .select('*')
      .eq('user_id', userId)
      .single(),
  ]);

  return {
    user_id: userId,
    kyc_status: profile?.kyc_status || 'none',
    kyc_level: profile?.kyc_level || 'none',
    can_trade: profile?.kyc_status === 'verified',
    submission_status: submission?.status || null,
    submission_id: submission?.id || null,
    submitted_at: submission?.submitted_at || null,
    limits: profile ? {
      daily_deposit: profile.daily_deposit_limit,
      daily_withdrawal: profile.daily_withdrawal_limit,
      max_single_trade: profile.max_single_trade_amount,
      max_portfolio: profile.max_portfolio_value,
    } : null,
  };
}

/**
 * Check if user can perform action
 */
async function checkUserCanTrade(userId) {
  const status = await getUserKYCStatus(userId);
  return {
    can_trade: status.can_trade,
    kyc_status: status.kyc_status,
    kyc_level: status.kyc_level,
    limits: status.limits,
    needs_kyc: !status.can_trade,
    pending_review: status.submission_status === 'pending_review' || status.submission_status === 'in_review',
  };
}

// =====================================================
// STATISTICS
// =====================================================

/**
 * Get KYC dashboard stats
 */
async function getKYCStats() {
  if (!supabase) {
    return {
      pending_review: 0,
      in_review: 0,
      approved_today: 0,
      rejected_today: 0,
      total_verified: 0,
    };
  }

  const today = new Date().toISOString().split('T')[0];

  const [
    { count: pending },
    { count: inReview },
    { count: approvedToday },
    { count: rejectedToday },
    { count: totalVerified },
  ] = await Promise.all([
    supabase.from('simple_kyc_submissions').select('*', { count: 'exact' }).eq('status', 'pending_review'),
    supabase.from('simple_kyc_submissions').select('*', { count: 'exact' }).eq('status', 'in_review'),
    supabase.from('simple_kyc_submissions').select('*', { count: 'exact' }).eq('status', 'approved').gte('approved_at', today),
    supabase.from('simple_kyc_submissions').select('*', { count: 'exact' }).eq('status', 'rejected').gte('rejected_at', today),
    supabase.from('kyc_profiles').select('*', { count: 'exact' }).eq('kyc_status', 'verified'),
  ]);

  return {
    pending_review: pending || 0,
    in_review: inReview || 0,
    approved_today: approvedToday || 0,
    rejected_today: rejectedToday || 0,
    total_verified: totalVerified || 0,
  };
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // User actions
  submitKYC,
  getUserKYCStatus,
  checkUserCanTrade,
  
  // Admin actions
  getPendingSubmissions,
  getSubmission,
  startReview,
  approveKYC,
  rejectKYC,
  requestAdditionalInfo,
  
  // Stats
  getKYCStats,
};
