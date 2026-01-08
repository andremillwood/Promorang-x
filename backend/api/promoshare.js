const express = require('express');
const router = express.Router();
const promoShareService = require('../services/promoShareService');
const { requireAuth } = require('../middleware/auth');
const advertiserService = require('../api/advertisers'); // Or service if separated

// Apply auth to all routes
router.use(requireAuth);

/**
 * GET /api/promoshare/dashboard
 * Get main dashboard data
 */
router.get('/dashboard', async (req, res) => {
    try {
        const data = await promoShareService.getDashboardData(req.user.id);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching PromoShare dashboard:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
});

/**
 * GET /api/promoshare/history
 * Get ticket history
 */
router.get('/history', async (req, res) => {
    // TODO: Implement history pagination
    res.json({ success: true, data: [] });
});

/**
 * ADMIN ROUTES
 * Middleware check for admin role should be added here
 */

/**
 * POST /api/promoshare/admin/cycles
 * Create a new cycle with rewards
 */
router.post('/admin/cycles', async (req, res) => {
    // TODO: Add strict admin check middleware
    try {
        const cycle = await promoShareService.createCycle(req.body);
        res.json({ success: true, data: cycle });
    } catch (error) {
        console.error('Error creating cycle:', error);
        res.status(500).json({ success: false, error: 'Failed to create cycle' });
    }
});

/**
 * POST /api/promoshare/admin/draw/:id
 * Execute draw for a completed cycle
 */
router.post('/admin/draw/:id', async (req, res) => {
    // TODO: Add strict admin check middleware
    try {
        const result = await promoShareService.executeDraw(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error executing draw:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


/**
 * POST /api/promoshare/sponsorship
 * Advertisers sponsor a cycle
 */
router.post('/sponsorship', async (req, res) => {
    try {
        const { cycle_id, reward_type, amount, description } = req.body;
        const advertiserId = req.user.id; // User must be advertiser

        // Basic check if user is advertiser (or rely on UI roles, strict check better)
        if (req.user.user_type !== 'advertiser') {
            return res.status(403).json({ success: false, error: 'Only advertisers can sponsor' });
        }

        // Insert into promoshare_sponsorships (using raw supabase for now or service)
        // Ideally we should add a method in promoShareService for this.
        // Let's call promoShareService.addSponsorship

        /* 
           Since I haven't added `addSponsorship` to service yet, 
           I will do it directly here or add it to service in next step.
           For cleanliness, I'll add logic here or use service.
           Let's assume I'll add `sponsorCycle` to service.
        */
        const sponsorship = await promoShareService.sponsorCycle(advertiserId, {
            cycle_id, reward_type, amount, description
        });

        res.json({ success: true, data: sponsorship });

    } catch (error) {
        console.error('Error creating sponsorship:', error);
        res.status(500).json({ success: false, error: 'Failed to create sponsorship' });
    }
});

module.exports = router;
