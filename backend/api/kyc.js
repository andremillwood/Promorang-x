const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { updateUserProfile, getUserProfile } = require('./mockStore');

router.use(requireAuth);

/**
 * GET /api/kyc/status
 * Get current user's KYC status
 */
router.get('/status', async (req, res) => {
    try {
        const userId = req.user.id;

        if (!supabase) {
            const profile = getUserProfile(userId);
            return res.json({
                success: true,
                status: profile?.kyc_status || 'none',
                rejection_reason: null
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('kyc_status')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching KYC status:', error);
            return res.status(500).json({ error: 'Failed to fetch status' });
        }

        // Also fetch rejection reason if rejected
        let rejectionReason = null;
        if (user.kyc_status === 'rejected') {
            const { data: verification } = await supabase
                .from('kyc_verifications')
                .select('rejection_reason')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (verification) {
                rejectionReason = verification.rejection_reason;
            }
        }

        res.json({
            success: true,
            status: user.kyc_status || 'none',
            rejection_reason: rejectionReason
        });

    } catch (error) {
        console.error('KYC Status API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/kyc/submit
 * Submit KYC documents
 */
router.post('/submit', async (req, res) => {
    try {
        const userId = req.user.id;
        const { document_type, document_url } = req.body;

        if (!document_type || !document_url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!supabase) {
            // Mock Submission
            updateUserProfile(userId, { kyc_status: 'pending' });
            return res.json({ success: true, status: 'pending', message: 'KYC submitted (Mock)' });
        }

        // 1. Insert verification record
        const { error: insertError } = await supabase
            .from('kyc_verifications')
            .insert({
                user_id: userId,
                document_type,
                document_url,
                status: 'pending'
            });

        if (insertError) {
            console.error('Error inserting KYC record:', insertError);
            return res.status(500).json({ error: 'Failed to submit verification' });
        }

        // 2. Update user status to pending
        const { error: updateError } = await supabase
            .from('users')
            .update({ kyc_status: 'pending' })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating user status:', updateError);
            // Ideally rollback insertion or retry, but simple log for now
        }

        res.json({ success: true, status: 'pending', message: 'Verification submitted successfully' });

    } catch (error) {
        console.error('KYC Submit API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DEV ONLY: Helper to manually verify a user (since we don't have an admin panel yet)
if (process.env.NODE_ENV === 'development') {
    router.post('/dev/verify', async (req, res) => {
        const userId = req.user.id;
        if (!supabase) {
            updateUserProfile(userId, { kyc_status: 'verified' });
            return res.json({ success: true, status: 'verified' });
        }

        await supabase.from('users').update({ kyc_status: 'verified' }).eq('id', userId);
        res.json({ success: true, status: 'verified', message: 'Dev verified' });
    });
}

module.exports = router;
