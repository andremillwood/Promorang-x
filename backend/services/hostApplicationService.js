/**
 * Host Application Service
 * Handles fast-track applications for Host role
 */

const { supabase } = require('../lib/supabase');
const roleService = require('./roleService');

/**
 * Submit a host application
 */
async function submitApplication(userId, motivation, momentIdea) {
    // Check if user already has host role
    const hasHost = await roleService.userHasRole(userId, 'host');
    if (hasHost) {
        throw new Error('User already has Host role');
    }

    // Check if user has pending application
    const { data: existing } = await supabase
        .from('host_applications')
        .select('id, status')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

    if (existing) {
        throw new Error('You already have a pending application');
    }

    // Create application
    const { data, error } = await supabase
        .from('host_applications')
        .insert({
            user_id: userId,
            motivation,
            moment_idea: momentIdea,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to submit application: ${error.message}`);

    console.log(`[HostApplicationService] Application submitted by user ${userId}`);
    return data;
}

/**
 * Get all pending applications (admin only)
 */
async function getPendingApplications() {
    const { data, error } = await supabase
        .from('host_applications')
        .select(`
            *,
            profiles:user_id (
                full_name:display_name,
                avatar_url,
                maturity_state:user_tier
            )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get applications: ${error.message}`);
    return data;
}

/**
 * Get user's application status
 */
async function getUserApplication(userId) {
    const { data, error } = await supabase
        .from('host_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw new Error(`Failed to get application: ${error.message}`);
    }

    return data || null;
}

/**
 * Approve a host application
 */
async function approveApplication(applicationId, reviewedBy) {
    // Get application
    const { data: application, error: appError } = await supabase
        .from('host_applications')
        .select('user_id, status')
        .eq('id', applicationId)
        .single();

    if (appError) throw new Error(`Application not found: ${appError.message}`);
    if (application.status !== 'pending') {
        throw new Error('Application already reviewed');
    }

    // Update application status
    const { error: updateError } = await supabase
        .from('host_applications')
        .update({
            status: 'approved',
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

    if (updateError) throw new Error(`Failed to update application: ${updateError.message}`);

    // Grant host role
    await roleService.grantRole(application.user_id, 'host', reviewedBy);

    // TODO: Send notification to user

    console.log(`[HostApplicationService] Application ${applicationId} approved by ${reviewedBy}`);
    return { success: true };
}

/**
 * Reject a host application
 */
async function rejectApplication(applicationId, reviewedBy, reason) {
    // Get application
    const { data: application, error: appError } = await supabase
        .from('host_applications')
        .select('status')
        .eq('id', applicationId)
        .single();

    if (appError) throw new Error(`Application not found: ${appError.message}`);
    if (application.status !== 'pending') {
        throw new Error('Application already reviewed');
    }

    // Update application status
    const { error: updateError } = await supabase
        .from('host_applications')
        .update({
            status: 'rejected',
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
            rejection_reason: reason
        })
        .eq('id', applicationId);

    if (updateError) throw new Error(`Failed to update application: ${updateError.message}`);

    // TODO: Send notification to user

    console.log(`[HostApplicationService] Application ${applicationId} rejected by ${reviewedBy}`);
    return { success: true };
}

module.exports = {
    submitApplication,
    getPendingApplications,
    getUserApplication,
    approveApplication,
    rejectApplication
};
