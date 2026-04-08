const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, requireMasterAdmin } = require('../middleware/auth');
const { getUserProfile } = require('./mockStore');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    const adminEmails = ['demo@promorang.com', 'admin@promorang.com'];
    if (adminEmails.includes(req.user.email)) {
        return next();
    }

    return res.status(403).json({ error: 'Admin access required' });
};

router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Get high-level platform statistics
 */
router.get('/stats', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                total_users: 15420,
                pending_kyc: 3,
                total_withdrawals: 125000,
                active_campaigns: 45
            });
        }

        const [
            { count: totalUsers },
            { count: pendingKyc }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        res.json({
            total_users: totalUsers || 0,
            pending_kyc: pendingKyc || 0,
            total_withdrawals: 0,
            active_campaigns: 0
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/admin/kyc/pending
 * Get list of pending KYC verifications
 */
router.get('/kyc/pending', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'mock-verif-1',
                    user_id: 'mock-user-1',
                    document_type: 'passport',
                    document_url: 'https://via.placeholder.com/400x300?text=Passport',
                    created_at: new Date().toISOString(),
                    user: {
                        display_name: 'John Doe',
                        email: 'john@example.com',
                        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
                    }
                }
            ]);
        }

        const { data, error } = await supabase
            .from('kyc_verifications')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    email,
                    avatar_url
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Admin KYC List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/admin/kyc/action
 * Approve or Reject a KYC verification
 */
router.post('/kyc/action', async (req, res) => {
    try {
        const { verificationId, action, reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!supabase) {
            return res.json({ success: true, message: `Mock ${action} successful` });
        }

        const { data: verification } = await supabase
            .from('kyc_verifications')
            .select('user_id')
            .eq('id', verificationId)
            .single();

        if (!verification) {
            return res.status(404).json({ error: 'Verification not found' });
        }

        const newStatus = action === 'approve' ? 'verified' : 'rejected';

        const { error: updateVerifError } = await supabase
            .from('kyc_verifications')
            .update({
                status: newStatus,
                rejection_reason: reason || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', verificationId);

        if (updateVerifError) throw updateVerifError;

        const { error: updateUserError } = await supabase
            .from('users')
            .update({ kyc_status: newStatus })
            .eq('id', verification.user_id);

        if (updateUserError) throw updateUserError;

        res.json({ success: true, message: `KYC ${action} successful` });
    } catch (error) {
        console.error('Admin KYC Action Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/admin/support
 * List support tickets for admins
 */
router.get('/support', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([]);
        }

        const { data: tickets, error } = await supabase
            .from('support_tickets')
            .select('*, user:users(display_name, email)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(tickets);
    } catch (error) {
        console.error('Admin Support Error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

/**
 * POST /api/admin/support/:id/reply
 * Reply/Status update
 */
router.post('/support/:id/reply', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        if (!supabase) {
            return res.json({ success: true });
        }

        const { error } = await supabase
            .from('support_tickets')
            .update({
                status: status,
                admin_notes: admin_notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Admin Reply Error:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

/**
 * GET /api/admin/users
 * List users and roles
 */
router.get('/users', async (req, res) => {
    try {
        if (!supabase) return res.json([]);

        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, display_name, role, user_type')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * POST /api/admin/users/role
 * Update user role (Protected: Master Admin only)
 */
router.post('/users/role', requireMasterAdmin, async (req, res) => {
    try {
        const { userId, newRole } = req.body;

        if (!supabase) return res.json({ success: true, message: 'Mock role updated' });

        const { data: targetUser } = await supabase
            .from('users')
            .select('role, email')
            .eq('id', userId)
            .single();

        if (targetUser?.email === 'andremillwood@gmail.com') {
            return res.status(403).json({ error: 'Cannot modify Master Admin' });
        }

        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Role Update Error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * GET /api/admin/proofs/pending
 * Get list of pending mission proof submissions
 */
router.get('/proofs/pending', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'mock-proof-1',
                    drop_id: '1',
                    user_id: 'mock-user-1',
                    status: 'pending',
                    proof_url: 'https://via.placeholder.com/400x600?text=Receipt+Sample',
                    submission_text: 'Order #12345',
                    applied_at: new Date().toISOString(),
                    user: {
                        display_name: 'John Doe',
                        email: 'john@example.com'
                    },
                    drop: {
                        title: 'Summer Fashion Drop',
                        gem_reward_base: 50
                    }
                }
            ]);
        }

        const { data, error } = await supabase
            .from('drop_applications')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    email,
                    avatar_url
                ),
                drop:drops (
                    id,
                    title,
                    gem_reward_base,
                    drop_role
                )
            `)
            .eq('status', 'pending')
            .not('proof_url', 'is', null) // Only interested in proofs
            .order('applied_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Admin Proof List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/admin/proofs/:id/review
 * Approve or Reject a mission proof
 */
router.post('/proofs/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!supabase) {
            return res.json({ success: true, message: `Mock ${action} successful` });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        const { data: application, error: fetchError } = await supabase
            .from('drop_applications')
            .select('*, drop:drops(*)')
            .eq('id', id)
            .single();

        if (fetchError || !application) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const { error: updateError } = await supabase
            .from('drop_applications')
            .update({
                status: newStatus,
                submission_notes: reason || application.submission_notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // If approved, you might want to trigger additional rewards or maturity checks here
        if (action === 'approve') {
            // Check if maturityService or campaignService needs to be notified
            try {
                const campaignService = require('../services/campaignService');
                if (application.drop.campaign_id) {
                    await campaignService.checkMaturityTransition(application.drop.campaign_id);
                }
            } catch (serviceErr) {
                console.warn('Maturity transition check failed (service might be missing):', serviceErr.message);
            }
        }

        res.json({ success: true, message: `Proof ${action} successful` });
    } catch (error) {
        console.error('Admin Proof Action Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/admin/withdrawals/pending
 * Get list of pending withdrawal requests
 */
router.get('/withdrawals/pending', async (req, res) => {
    try {
        if (!supabase) {
            return res.json([
                {
                    id: 'mock-withdrawal-1',
                    user_id: 'mock-user-1',
                    gems_amount: 5000,
                    usd_value: 50.00,
                    payment_method: 'paypal',
                    payment_details: { email: 'john@example.com' },
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    user: {
                        display_name: 'John Doe',
                        email: 'john@example.com'
                    }
                }
            ]);
        }

        const { data, error } = await supabase
            .from('withdrawal_requests')
            .select(`
                *,
                user:users (
                    id,
                    display_name,
                    email,
                    avatar_url
                )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Admin Withdrawal List Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/admin/withdrawals/:id/review
 * Approve or Reject a withdrawal request
 */
router.post('/withdrawals/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!supabase) {
            return res.json({ success: true, message: `Mock withdrawal ${action} successful` });
        }

        const newStatus = action === 'approve' ? 'completed' : 'rejected';

        const { error } = await supabase
            .from('withdrawal_requests')
            .update({
                status: newStatus,
                notes: notes || null,
                processed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: `Withdrawal ${action === 'approve' ? 'completed' : 'rejected'} successfully` });
    } catch (error) {
        console.error('Admin Withdrawal Action Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
