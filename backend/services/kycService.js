/**
 * KYC SERVICE
 * Manages user identity verification (Legend Status)
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Submit KYC verification
 * @param {string} userId
 * @param {string} documentType - 'passport', 'id_card', etc.
 * @param {string} documentUrl - URL of the uploaded document image
 */
async function submitVerification(userId, documentType, documentUrl) {
    if (!supabase) {
        return { success: true, status: 'pending', message: 'Demo: KYC submitted' };
    }

    try {
        // 1. Create verification record
        const { data, error } = await supabase
            .from('kyc_verifications')
            .insert({
                user_id: userId,
                document_type: documentType,
                document_url: documentUrl,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Update user status to pending
        await supabase
            .from('users')
            .update({ kyc_status: 'pending' })
            .eq('id', userId);

        return {
            success: true,
            status: 'pending',
            verificationId: data.id
        };
    } catch (error) {
        console.error('[KYC Service] Error submitting verification:', error);
        throw error;
    }
}

/**
 * Get user KYC status
 */
async function getStatus(userId) {
    if (!supabase) {
        return { status: 'unverified' };
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('kyc_status')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return {
            status: data.kyc_status || 'unverified'
        };
    } catch (error) {
        console.error('[KYC Service] Error getting status:', error);
        return { status: 'unverified' };
    }
}

/**
 * Admin: Update verification status
 */
async function updateStatus(verificationId, status, rejectionReason = null, reviewedBy = null) {
    if (!supabase) return { success: true };

    try {
        // 1. Get the verification record to find the user
        const { data: verification } = await supabase
            .from('kyc_verifications')
            .select('user_id')
            .eq('id', verificationId)
            .single();

        if (!verification) throw new Error('Verification record not found');

        // 2. Update verification record
        await supabase
            .from('kyc_verifications')
            .update({
                status,
                rejection_reason: rejectionReason,
                reviewed_by: reviewedBy,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', verificationId);

        // 3. Update user record status
        await supabase
            .from('users')
            .update({ kyc_status: status })
            .eq('id', verification.user_id);

        return { success: true, status };
    } catch (error) {
        console.error('[KYC Service] Error updating status:', error);
        throw error;
    }
}

module.exports = {
    submitVerification,
    getStatus,
    updateStatus
};
