const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth, requireMasterAdmin } = require('../middleware/auth');
const { getUserProfile } = require('./mockStore');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!supabase) return next();
        
        // Demo Bypass for seeded accounts
        if (req.user?.id?.startsWith('00000000-0000-')) return next();

        const { data: roleRecords } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id);

        const roles = (roleRecords || []).map(r => r.role);
        if (roles.includes('admin') || roles.includes('master_admin')) {
            return next();
        }

        // Fallback for hardcoded emails
        const adminEmails = ['demo@promorang.com', 'admin@promorang.com', 'andremillwood@gmail.com'];
        if (adminEmails.includes(req.user.email)) {
            return next();
        }

        return res.status(403).json({ error: 'Admin access required' });
    } catch (e) {
        return res.status(403).json({ error: 'Admin verification failed' });
    }
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

// ==========================================
// ECONOMY & TREASURY ADMIN ROUTES
// ==========================================

/**
 * GET /api/admin/economy/stats
 * Platform-wide economy aggregates
 */
router.get('/economy/stats', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                total_points: 0, total_gems: 0, total_promokeys: 0, total_gold: 0,
                total_liability_usd: 0, gem_usd_rate: 0.01,
                total_users_with_balance: 0, transactions_24h: 0
            });
        }

        // Aggregate all user balances
        const { data: balances } = await supabase
            .from('user_balances')
            .select('points, gems, promokeys, gold');

        let total_points = 0, total_gems = 0, total_promokeys = 0, total_gold = 0;
        (balances || []).forEach(b => {
            total_points += Number(b.points) || 0;
            total_gems += Number(b.gems) || 0;
            total_promokeys += Number(b.promokeys) || 0;
            total_gold += Number(b.gold) || 0;
        });

        // Get gem USD rate
        let gem_usd_rate = 0.01;
        try {
            const { data: setting } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'GEM_USD_RATE')
                .single();
            if (setting?.value?.rate) gem_usd_rate = setting.value.rate;
        } catch (e) { /* use default */ }

        // 24h transaction count
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: transactions_24h } = await supabase
            .from('transaction_history')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', since24h);

        // Pending withdrawals total
        const { data: pendingWithdrawals } = await supabase
            .from('withdrawal_requests')
            .select('amount')
            .eq('status', 'pending');

        const pending_withdrawal_usd = (pendingWithdrawals || []).reduce((sum, w) => sum + Number(w.amount || 0), 0);

        res.json({
            total_points,
            total_gems,
            total_promokeys,
            total_gold,
            total_liability_usd: (total_gems * gem_usd_rate).toFixed(2),
            gem_usd_rate,
            total_users_with_balance: (balances || []).length,
            transactions_24h: transactions_24h || 0,
            pending_withdrawal_usd
        });
    } catch (error) {
        console.error('Admin Economy Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch economy stats' });
    }
});

/**
 * GET /api/admin/economy/transactions
 * Master ledger with pagination
 */
router.get('/economy/transactions', async (req, res) => {
    try {
        if (!supabase) return res.json({ transactions: [], total: 0 });

        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;
        const currency = req.query.currency;
        const userId = req.query.user_id;

        let query = supabase
            .from('transaction_history')
            .select('*, profiles:user_id(full_name, email)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (currency) query = query.eq('currency', currency);
        if (userId) query = query.eq('user_id', userId);

        const { data, count, error } = await query;
        if (error) throw error;

        res.json({ transactions: data || [], total: count || 0 });
    } catch (error) {
        console.error('Admin Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * POST /api/admin/economy/adjust-balance
 * Manual balance adjustment (grant/deduct)
 */
router.post('/economy/adjust-balance', async (req, res) => {
    try {
        const { user_id, currency, amount, reason } = req.body;

        if (!user_id || !currency || amount === undefined || !reason) {
            return res.status(400).json({ error: 'user_id, currency, amount, and reason are required' });
        }

        const validCurrencies = ['points', 'promokeys', 'gems', 'gold'];
        if (!validCurrencies.includes(currency)) {
            return res.status(400).json({ error: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` });
        }

        if (!supabase) return res.json({ success: true, message: 'Mock adjustment' });

        // Get current balance
        const { data: balance, error: balErr } = await supabase
            .from('user_balances')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (balErr && balErr.code === 'PGRST116') {
            // Create balance record if missing
            await supabase.from('user_balances').insert({ user_id });
        }

        const currentAmount = balance ? Number(balance[currency]) || 0 : 0;
        const newAmount = currentAmount + Number(amount);

        if (newAmount < 0) {
            return res.status(400).json({ error: `Resulting balance would be negative (${newAmount}). Current: ${currentAmount}` });
        }

        // Update balance
        const { error: updateErr } = await supabase
            .from('user_balances')
            .update({ [currency]: newAmount, updated_at: new Date().toISOString() })
            .eq('user_id', user_id);

        if (updateErr) throw updateErr;

        // Record transaction
        await supabase.from('transaction_history').insert({
            user_id,
            currency,
            amount: Number(amount),
            transaction_type: 'admin_adjustment',
            source: 'admin_manual',
            description: `[Admin: ${req.user.email || req.user.id}] ${reason}`,
        });

        res.json({ success: true, previous_balance: currentAmount, new_balance: newAmount });
    } catch (error) {
        console.error('Admin Adjust Balance Error:', error);
        res.status(500).json({ error: 'Failed to adjust balance' });
    }
});

/**
 * GET /api/admin/economy/config
 * Get system configuration settings
 */
router.get('/economy/config', async (req, res) => {
    try {
        if (!supabase) {
            return res.json({
                payout_threshold_usd: 250,
                gem_usd_rate: 0.01,
                point_multiplier: 1,
                maintenance_mode: false,
                maintenance_message: ''
            });
        }

        const keys = ['PAYOUT_THRESHOLD_USD', 'GEM_USD_RATE', 'POINT_MULTIPLIER', 'MAINTENANCE_MODE', 'MAINTENANCE_MESSAGE'];
        const { data: settings } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', keys);

        const config = {};
        (settings || []).forEach(s => { config[s.key] = s.value; });

        res.json({
            payout_threshold_usd: config.PAYOUT_THRESHOLD_USD?.amount || 250,
            gem_usd_rate: config.GEM_USD_RATE?.rate || 0.01,
            point_multiplier: config.POINT_MULTIPLIER?.multiplier || 1,
            maintenance_mode: config.MAINTENANCE_MODE?.enabled || false,
            maintenance_message: config.MAINTENANCE_MESSAGE?.message || ''
        });
    } catch (error) {
        console.error('Admin Config Error:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

/**
 * POST /api/admin/economy/config
 * Update system configuration
 */
router.post('/economy/config', async (req, res) => {
    try {
        const updates = req.body;
        if (!supabase) return res.json({ success: true });

        const mapping = {
            payout_threshold_usd: { key: 'PAYOUT_THRESHOLD_USD', transform: v => ({ amount: v }) },
            gem_usd_rate: { key: 'GEM_USD_RATE', transform: v => ({ rate: v }) },
            point_multiplier: { key: 'POINT_MULTIPLIER', transform: v => ({ multiplier: v }) },
            maintenance_mode: { key: 'MAINTENANCE_MODE', transform: v => ({ enabled: v }) },
            maintenance_message: { key: 'MAINTENANCE_MESSAGE', transform: v => ({ message: v }) },
        };

        for (const [field, value] of Object.entries(updates)) {
            if (mapping[field]) {
                const { key, transform } = mapping[field];
                await supabase
                    .from('system_settings')
                    .upsert({ key, value: transform(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
            }
        }

        res.json({ success: true, message: 'Configuration updated' });
    } catch (error) {
        console.error('Admin Config Update Error:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

/**
 * POST /api/admin/users/:id/suspend
 * Suspend/unsuspend a user
 */
router.post('/users/:id/suspend', async (req, res) => {
    try {
        const { id } = req.params;
        const { suspended, reason } = req.body;

        if (!supabase) return res.json({ success: true });

        const { error } = await supabase
            .from('profiles')
            .update({
                suspended: !!suspended,
                suspension_reason: reason || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: suspended ? 'User suspended' : 'User unsuspended' });
    } catch (error) {
        console.error('Admin Suspend Error:', error);
        res.status(500).json({ error: 'Failed to update suspension status' });
    }
});

/**
 * POST /api/admin/campaigns/compiler-launch
 * Launch a campaign compiled by the deterministic rule engine
 */
router.post('/campaigns/compiler-launch', async (req, res) => {
    try {
        const compilerService = require('../services/campaignCompilerService');
        const { goal, businessName, context } = req.body;

        // Use service to compile
        const compiled = compilerService.compile(goal, businessName, context);
        const { moment, proof, compiler_metadata } = compiled;

        if (!supabase) {
            return res.json({ success: true, message: 'Mock launch successful (No DB)', compiled });
        }

        const adminId = req.user.id;

        // 2. Create the Campaign Record
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert({
                advertiser_id: adminId,
                name: moment.name,
                description: moment.description,
                campaign_type: 'activation',
                status: 'active',
                compiler_metadata: compiler_metadata,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (campaignError) throw campaignError;

        // 3. Create the Moment Record
        const proofMapping = {
            'Link': 'API',
            'OCR': 'Photo',
            'Upload': 'Photo'
        };

        const { data: newMoment, error: momentError } = await supabase
            .from('moments')
            .insert({
                organizer_id: adminId,
                title: moment.name,
                description: moment.description,
                type: 'digital_drop',
                status: 'live',
                sku_type: moment.tier || 'A3',
                proof_type: proofMapping[proof] || 'Photo',
                expected_action_unit: 'Submission',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (momentError) throw momentError;

        // 4. Link Campaign to Moment
        try {
            await supabase.from('campaign_sponsorships').insert({
                campaign_id: campaign.id,
                moment_id: newMoment.id,
                status: 'active',
                sponsorship_amount: 0
            });
        } catch (e) {
            console.warn('Optional sponsorship link failed:', e.message);
        }

        res.json({
            success: true,
            campaign_id: campaign.id,
            moment_id: newMoment.id,
            message: 'Campaign compiled and launched successfully.',
            compiled
        });

    } catch (error) {
        console.error('Compiler Launch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
