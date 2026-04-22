const express = require('express');
const router = express.Router();
const promoShareService = require('../services/promoShareService');
const { requireAuth, resolveAdvertiserContext } = require('../middleware/auth');

// ============================================
// ADMIN MIDDLEWARE
// ============================================
const requireAdmin = async (req, res, next) => {
    // Check if user has admin role
    const { supabase } = require('../lib/supabase');
    const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('role', 'admin')
        .maybeSingle();

    if (!role && req.user.user_type !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
};

// Apply auth to all routes
router.use(requireAuth);

// ============================================
// USER-FACING ENDPOINTS
// ============================================

/**
 * GET /api/promoshare/dashboard
 * Get enhanced dashboard data with user stats and cycle info
 */
router.get('/dashboard', async (req, res) => {
    try {
        const data = await promoShareService.getUserDashboardData(req.user.id);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching PromoShare dashboard:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
});

/**
 * GET /api/promoshare/me
 * Get current user's PromoShare status across all active cycles
 */
router.get('/me', async (req, res) => {
    try {
        const data = await promoShareService.getUserDashboardData(req.user.id);
        res.json({
            success: true,
            data: {
                cycles: data.user_stats_by_cycle,
                recent_entries: data.recent_entries,
                history: data.history
            }
        });
    } catch (error) {
        console.error('Error fetching user PromoShare data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user data' });
    }
});

/**
 * GET /api/promoshare/me/history
 * Get user's PromoShare win history
 */
router.get('/me/history', async (req, res) => {
    try {
        const history = await promoShareService.getUserHistory(req.user.id, 20);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching PromoShare history:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
});

/**
 * GET /api/promoshare/me/entries
 * Get user's recent entries
 */
router.get('/me/entries', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const entries = await promoShareService.getRecentEntries(req.user.id, limit);
        res.json({ success: true, data: entries });
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch entries' });
    }
});

/**
 * GET /api/promoshare/cycles/:id/progress
 * Get progress to qualification for a specific cycle
 */
router.get('/cycles/:id/progress', async (req, res) => {
    try {
        const stats = await promoShareService.getOrCreateUserStats(req.params.id, req.user.id);
        const { data: cycle } = await require('../lib/supabase').supabase
            .from('promoshare_cycles')
            .select('eligibility_config')
            .eq('id', req.params.id)
            .single();

        const progress = promoShareService.calculateProgressToQualify(stats, cycle?.eligibility_config);

        res.json({
            success: true,
            data: {
                cycle_id: req.params.id,
                eligible: stats?.eligible || false,
                status: stats?.status || 'not_qualified',
                current_weight: stats?.final_weight || 0,
                progress: progress,
                actions_needed: Object.values(progress).filter(p => !p.complete).length
            }
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch progress' });
    }
});

/**
 * GET /api/promoshare/cycles/current
 * Get all currently active cycles
 */
router.get('/cycles/current', async (req, res) => {
    try {
        const cycles = await promoShareService.getActiveCycles();
        res.json({ success: true, data: cycles });
    } catch (error) {
        console.error('Error fetching active cycles:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cycles' });
    }
});

/**
 * GET /api/promoshare/cycles/:id
 * Get specific cycle details
 */
router.get('/cycles/:id', async (req, res) => {
    try {
        const { supabase } = require('../lib/supabase');
        const { data: cycle, error } = await supabase
            .from('promoshare_cycles')
            .select('*, promoshare_pool_items(*)')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        // Get user's stats for this cycle
        const userStats = await promoShareService.getOrCreateUserStats(req.params.id, req.user.id);

        res.json({
            success: true,
            data: {
                cycle,
                user_stats: {
                    eligible: userStats?.eligible || false,
                    status: userStats?.status || 'not_qualified',
                    weight: userStats?.final_weight || 0,
                    total_entries: userStats?.total_entries || 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching cycle:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cycle' });
    }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * POST /api/promoshare/admin/cycles
 * Create a new cycle with configuration
 */
router.post('/admin/cycles', requireAdmin, async (req, res) => {
    try {
        const { cycle_type, cycle_name, start_at, end_at, eligibility_config, weight_config, rewards } = req.body;

        const cycle = await promoShareService.createCycle({
            cycle_type,
            cycle_name,
            start_at,
            end_at,
            config: {
                eligibility_config,
                weight_config
            },
            rewards
        });

        // Audit log
        await promoShareService.auditLog(cycle.id, null, 'cycle_created', 'admin', req.user.id, {
            cycle_type,
            cycle_name
        });

        res.json({ success: true, data: cycle });
    } catch (error) {
        console.error('Error creating cycle:', error);
        res.status(500).json({ success: false, error: 'Failed to create cycle' });
    }
});

/**
 * GET /api/promoshare/admin/cycles/:id/qualified
 * Get all qualified users for a cycle (admin view)
 */
router.get('/admin/cycles/:id/qualified', requireAdmin, async (req, res) => {
    try {
        const options = {
            status: req.query.status,
            min_weight: req.query.min_weight ? parseInt(req.query.min_weight) : undefined
        };

        const users = await promoShareService.getQualifiedUsers(req.params.id, options);
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching qualified users:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch qualified users' });
    }
});

/**
 * POST /api/promoshare/admin/cycles/:id/simulate
 * Simulate a draw without executing it
 */
router.post('/admin/cycles/:id/simulate', requireAdmin, async (req, res) => {
    try {
        const distributionConfig = req.body.distribution_config;
        const result = await promoShareService.simulateDraw(req.params.id, distributionConfig);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error simulating draw:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/promoshare/admin/cycles/:id/execute
 * Execute legacy lottery draw
 */
router.post('/admin/cycles/:id/execute', requireAdmin, async (req, res) => {
    try {
        const result = await promoShareService.executeDraw(req.params.id);

        await promoShareService.auditLog(req.params.id, null, 'draw_executed_legacy', 'admin', req.user.id, {
            result: result.success,
            winners_count: result.winners?.length || 0
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error executing draw:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/promoshare/admin/cycles/:id/execute-tiered
 * Execute tiered draw with multiple buckets
 */
router.post('/admin/cycles/:id/execute-tiered', requireAdmin, async (req, res) => {
    try {
        const distributionConfig = req.body.distribution_config;
        const result = await promoShareService.executeTieredDraw(req.params.id, distributionConfig);

        await promoShareService.auditLog(req.params.id, null, 'draw_executed_tiered', 'admin', req.user.id, {
            result: result.success,
            winners_count: result.total_winners,
            eligible_count: result.total_eligible
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error executing tiered draw:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/promoshare/admin/cycles/:id/recalculate
 * Recalculate all user stats for a cycle
 */
router.post('/admin/cycles/:id/recalculate', requireAdmin, async (req, res) => {
    try {
        const result = await promoShareService.recalculateAllStats(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error recalculating stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/promoshare/admin/cycles/:id/users/:userId/override
 * Override user eligibility or status
 */
router.post('/admin/cycles/:id/users/:userId/override', requireAdmin, async (req, res) => {
    try {
        const { eligible, status, reason } = req.body;
        const result = await promoShareService.overrideUserStatus(
            req.params.id,
            req.params.userId,
            { eligible, status, reason },
            req.user.id
        );
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error overriding user status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/promoshare/admin/cycles/:id/audit
 * Get audit log for a cycle
 */
router.get('/admin/cycles/:id/audit', requireAdmin, async (req, res) => {
    try {
        const options = {
            limit: req.query.limit ? parseInt(req.query.limit) : 100,
            action_type: req.query.action_type
        };

        const logs = await promoShareService.getAuditLog(req.params.id, options);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
    }
});

// ============================================
// PRIZE CLAIM ENDPOINTS
// ============================================

/**
 * GET /api/promoshare/me/prizes
 * Get user's unclaimed prizes
 */
router.get('/me/prizes', async (req, res) => {
    try {
        const prizes = await promoShareService.getUnclaimedPrizes(req.user.id);
        res.json({ success: true, data: prizes });
    } catch (error) {
        console.error('Error fetching unclaimed prizes:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch prizes' });
    }
});

/**
 * POST /api/promoshare/me/prizes/:winnerId/claim
 * Claim a prize
 */
router.post('/me/prizes/:winnerId/claim', async (req, res) => {
    try {
        const result = await promoShareService.claimPrize(req.user.id, req.params.winnerId);

        if (!result.success) {
            return res.status(400).json({ success: false, error: result.error });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error claiming prize:', error);
        res.status(500).json({ success: false, error: 'Failed to claim prize' });
    }
});

// ============================================
// SPONSORSHIP ENDPOINTS
// ============================================

/**
 * POST /api/promoshare/sponsorship
 * Advertisers sponsor a cycle
 */
router.post('/sponsorship', resolveAdvertiserContext, async (req, res) => {
    try {
        const { cycle_id, reward_type, amount, description } = req.body;

        if (!req.advertiserAccount && req.user.user_type !== 'advertiser') {
            return res.status(403).json({ success: false, error: 'Only advertisers can sponsor' });
        }

        const advertiserId = req.advertiserAccount ? req.advertiserAccount.id : req.user.id;

        const sponsorship = await promoShareService.sponsorCycle(advertiserId, {
            cycle_id, reward_type, amount, description
        });

        res.json({ success: true, data: sponsorship });
    } catch (error) {
        console.error('Error creating sponsorship:', error);
        res.status(500).json({ success: false, error: 'Failed to create sponsorship' });
    }
});

// ============================================
// ADMIN CLAIM MANAGEMENT
// ============================================

/**
 * GET /api/promoshare/admin/claims/stats
 * Get claim statistics
 */
router.get('/admin/claims/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await promoShareService.getClaimStats(req.query.cycle_id);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching claim stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch claim stats' });
    }
});

/**
 * POST /api/promoshare/admin/process-expired
 * Manually trigger processing of expired prizes
 */
router.post('/admin/process-expired', requireAdmin, async (req, res) => {
    try {
        const result = await promoShareService.processExpiredPrizes();
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error processing expired prizes:', error);
        res.status(500).json({ success: false, error: 'Failed to process expired prizes' });
    }
});

module.exports = router;
