/**
 * Representative/Ambassador Service
 * 
 * Manages territory-based representatives who onboard venues
 * and earn commissions on their success.
 */

const { supabase } = require('../lib/supabase');

/**
 * Submit application to become a representative
 */
async function submitApplication(userId, applicationData) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Check if already applied
    const { data: existing } = await supabase
      .from('representative_applications')
      .select('*')
      .eq('applicant_id', userId)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      return { 
        success: false, 
        error: 'Application already exists',
        application: existing 
      };
    }

    const { data: application, error } = await supabase
      .from('representative_applications')
      .insert({
        applicant_id: userId,
        niche: applicationData.niche,
        territory: applicationData.territory,
        experience_description: applicationData.experience,
        network_size_estimate: applicationData.networkSize,
        marketing_plan: applicationData.marketingPlan
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, application };

  } catch (err) {
    console.error('[RepresentativeService] Error submitting application:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Review and approve/reject application
 */
async function reviewApplication(applicationId, reviewData) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data: application, error } = await supabase
      .from('representative_applications')
      .update({
        status: reviewData.status,
        reviewed_by: reviewData.reviewerId,
        review_notes: reviewData.notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;

    // If approved, create representative record
    if (reviewData.status === 'approved') {
      const repResult = await createRepresentative(application.applicant_id, {
        niche: application.niche,
        territory: application.territory,
        startedAt: new Date().toISOString(),
        commissionRateNew: reviewData.commissionRateNew || 0.10,
        commissionRateRecurring: reviewData.commissionRateRecurring || 0.02
      });

      if (!repResult.success) {
        return { 
          success: false, 
          error: 'Application approved but failed to create representative',
          application 
        };
      }

      return { 
        success: true, 
        application,
        representative: repResult.representative 
      };
    }

    return { success: true, application };

  } catch (err) {
    console.error('[RepresentativeService] Error reviewing application:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create representative record
 */
async function createRepresentative(userId, repData) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data: representative, error } = await supabase
      .from('representatives')
      .insert({
        user_id: userId,
        niche: repData.niche,
        territory: repData.territory,
        status: 'active',
        commission_rate_new_venue: repData.commissionRateNew || 0.10,
        commission_rate_recurring: repData.commissionRateRecurring || 0.02,
        started_at: repData.startedAt || new Date().toISOString(),
        contract_expires_at: repData.contractExpiresAt || null
      })
      .select()
      .single();

    if (error) throw error;

    // Log territory assignment
    await supabase
      .from('territory_assignments')
      .insert({
        representative_id: representative.id,
        territory: repData.territory,
        assigned_by: repData.assignedBy || userId
      });

    return { success: true, representative };

  } catch (err) {
    console.error('[RepresentativeService] Error creating representative:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Record venue onboarding by representative
 */
async function recordOnboarding(representativeId, venueId, metadata = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get representative
    const { data: rep } = await supabase
      .from('representatives')
      .select('*')
      .eq('id', representativeId)
      .single();

    if (!rep) {
      return { success: false, error: 'Representative not found' };
    }

    // Update representative stats
    const { data: updated, error } = await supabase
      .from('representatives')
      .update({
        venues_onboarded: rep.venues_onboarded + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', representativeId)
      .select()
      .single();

    if (error) throw error;

    // Queue commission for first activation
    await queueCommission(representativeId, venueId, {
      type: 'new_venue',
      baseAmount: 0, // Will be calculated on first activation
      commissionRate: rep.commission_rate_new_venue,
      status: 'pending_activation'
    });

    return { 
      success: true, 
      representative: updated,
      totalVenuesOnboarded: updated.venues_onboarded 
    };

  } catch (err) {
    console.error('[RepresentativeService] Error recording onboarding:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Record activation launch by representative's venue
 */
async function recordActivationLaunch(representativeId, venueId, activationId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get representative
    const { data: rep } = await supabase
      .from('representatives')
      .select('*')
      .eq('id', representativeId)
      .single();

    if (!rep) {
      return { success: false, error: 'Representative not found' };
    }

    // Update stats
    const { data: updated, error } = await supabase
      .from('representatives')
      .update({
        activations_launched: rep.activations_launched + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', representativeId)
      .select()
      .single();

    if (error) throw error;

    // Update pending commission with activation ID
    await supabase
      .from('representative_commissions')
      .update({
        activation_id: activationId,
        status: 'pending_redemption'
      })
      .eq('representative_id', representativeId)
      .eq('venue_id', venueId)
      .eq('status', 'pending_activation');

    return { 
      success: true, 
      representative: updated,
      totalActivations: updated.activations_launched 
    };

  } catch (err) {
    console.error('[RepresentativeService] Error recording activation:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Queue commission for representative
 */
async function queueCommission(representativeId, venueId, commissionData) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data, error } = await supabase
      .from('representative_commissions')
      .insert({
        representative_id: representativeId,
        venue_id: venueId,
        commission_type: commissionData.type,
        base_amount: commissionData.baseAmount,
        commission_rate: commissionData.commissionRate,
        activation_id: commissionData.activationId || null,
        status: commissionData.status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, commission: data };

  } catch (err) {
    console.error('[RepresentativeService] Error queuing commission:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Pay out commission
 */
async function payoutCommission(commissionId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get commission
    const { data: commission } = await supabase
      .from('representative_commissions')
      .select('*, representatives!inner(*)')
      .eq('id', commissionId)
      .single();

    if (!commission) {
      return { success: false, error: 'Commission not found' };
    }

    if (commission.status !== 'pending') {
      return { success: false, error: 'Commission not in payable status' };
    }

    // Mark as paid
    const { data: updated, error } = await supabase
      .from('representative_commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) throw error;

    // Update representative total earnings
    await supabase
      .from('representatives')
      .update({
        commission_earned_total: commission.representatives.commission_earned_total + commission.commission_amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', commission.representative_id);

    return { success: true, commission: updated };

  } catch (err) {
    console.error('[RepresentativeService] Error paying commission:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get representative dashboard data
 */
async function getRepresentativeDashboard(representativeId) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get representative
    const { data: rep } = await supabase
      .from('representatives')
      .select('*')
      .eq('id', representativeId)
      .single();

    if (!rep) {
      return { success: false, error: 'Representative not found' };
    }

    // Get assigned venues
    const { data: venues } = await supabase
      .from('fast_track_venues')
      .select('*, advertiser_profiles!inner(company_name, company_address)')
      .eq('approved_by', rep.user_id)
      .order('created_at', { ascending: false });

    // Get commissions
    const { data: commissions } = await supabase
      .from('representative_commissions')
      .select('*')
      .eq('representative_id', representativeId)
      .order('created_at', { ascending: false });

    // Calculate metrics
    const pendingCommissions = commissions
      ?.filter(c => c.status === 'pending')
      ?.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0) || 0;

    const paidCommissions = commissions
      ?.filter(c => c.status === 'paid')
      ?.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0) || 0;

    return {
      success: true,
      dashboard: {
        representative: rep,
        venues: venues || [],
        commissions: commissions || [],
        metrics: {
          totalVenuesOnboarded: rep.venues_onboarded,
          totalActivationsLaunched: rep.activations_launched,
          totalRedemptionsGenerated: rep.total_redemptions_generated,
          totalCommissionEarned: parseFloat(rep.commission_earned_total),
          pendingCommissions,
          paidCommissions,
          averageRedemptionsPerActivation: rep.activations_launched > 0 
            ? Math.round(rep.total_redemptions_generated / rep.activations_launched) 
            : 0
        }
      }
    };

  } catch (err) {
    console.error('[RepresentativeService] Error getting dashboard:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get representative performance (for admin view)
 */
async function getRepresentativePerformance(filters = {}) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    let query = supabase
      .from('representative_performance')
      .select('*');

    if (filters.territory) {
      query = query.eq('territory', filters.territory);
    }

    if (filters.niche) {
      query = query.eq('niche', filters.niche);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data: performance, error } = await query;

    if (error) throw error;

    return { success: true, performance: performance || [] };

  } catch (err) {
    console.error('[RepresentativeService] Error getting performance:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all applications (for admin review)
 */
async function getApplications(status = null) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    let query = supabase
      .from('representative_applications')
      .select('*, users!applicant_id(email, display_name)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) throw error;

    return { success: true, applications: applications || [] };

  } catch (err) {
    console.error('[RepresentativeService] Error getting applications:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Terminate representative
 */
async function terminateRepresentative(representativeId, reason, endedBy) {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    const { data: rep, error } = await supabase
      .from('representatives')
      .update({
        status: 'terminated',
        updated_at: new Date().toISOString()
      })
      .eq('id', representativeId)
      .select()
      .single();

    if (error) throw error;

    // End territory assignment
    await supabase
      .from('territory_assignments')
      .update({
        ended_at: new Date().toISOString(),
        ended_reason: reason
      })
      .eq('representative_id', representativeId)
      .is('ended_at', null);

    return { success: true, representative: rep };

  } catch (err) {
    console.error('[RepresentativeService] Error terminating:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get territories overview
 */
async function getTerritoriesOverview() {
  if (!supabase) {
    return { success: false, error: 'Database not available' };
  }

  try {
    // Get all active territory assignments
    const { data: assignments } = await supabase
      .from('territory_assignments')
      .select('*, representatives!inner(user_id, status, venues_onboarded)')
      .is('ended_at', null);

    // Group by territory
    const territoryMap = {};
    for (const assignment of assignments || []) {
      const territory = assignment.territory;
      if (!territoryMap[territory]) {
        territoryMap[territory] = {
          territory,
          activeRepresentatives: 0,
          totalVenuesOnboarded: 0
        };
      }
      if (assignment.representatives.status === 'active') {
        territoryMap[territory].activeRepresentatives++;
      }
      territoryMap[territory].totalVenuesOnboarded += assignment.representatives.venues_onboarded || 0;
    }

    return {
      success: true,
      territories: Object.values(territoryMap)
    };

  } catch (err) {
    console.error('[RepresentativeService] Error getting territories:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  submitApplication,
  reviewApplication,
  createRepresentative,
  recordOnboarding,
  recordActivationLaunch,
  queueCommission,
  payoutCommission,
  getRepresentativeDashboard,
  getRepresentativePerformance,
  getApplications,
  terminateRepresentative,
  getTerritoriesOverview
};
