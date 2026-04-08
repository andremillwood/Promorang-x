/**
 * Payouts API
 * Endpoints for managing payout methods and withdrawal requests
 */

const express = require('express');
const router = express.Router();
const payoutService = require('../services/payoutService');
const roleService = require('../services/roleService');
const { authenticateUser } = require('../middleware/auth');

/**
 * GET /api/payouts/methods
 * Get user's payout methods
 */
router.get('/methods', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const methods = await payoutService.getPayoutMethods(userId);

        res.json({ methods });
    } catch (error) {
        console.error('[PayoutsAPI] Get methods error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payouts/methods
 * Add a new payout method
 */
router.post('/methods', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, details, is_default } = req.body;

        if (!type || !details) {
            return res.status(400).json({ error: 'Type and details are required' });
        }

        const method = await payoutService.addPayoutMethod(userId, type, details, is_default);

        res.json({ success: true, method });
    } catch (error) {
        console.error('[PayoutsAPI] Add method error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/payouts/withdraw
 * Request a withdrawal
 */
router.post('/withdraw', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, payout_method_id } = req.body;

        if (!amount || !payout_method_id) {
            return res.status(400).json({ error: 'Amount and payout method ID are required' });
        }

        const request = await payoutService.requestWithdrawal(userId, parseFloat(amount), payout_method_id);

        res.json({
            success: true,
            request,
            message: 'Withdrawal request submitted for review.'
        });
    } catch (error) {
        console.error('[PayoutsAPI] Withdrawal error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/payouts/history
 * Get withdrawal history
 */
router.get('/history', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await payoutService.getWithdrawalHistory(userId);

        res.json({ history });
    } catch (error) {
        console.error('[PayoutsAPI] History error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * GET /api/payouts/admin/requests
 * Get pending withdrawal requests
 */
router.get('/admin/requests', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Admin Check
        const isAdmin = await roleService.userHasRole(userId, 'admin') ||
            await roleService.userHasRole(userId, 'master_admin');

        if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });

        const requests = await payoutService.getPendingWithdrawals();
        res.json({ requests });
    } catch (error) {
        console.error('[PayoutsAPI] Admin requests error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/payouts/admin/requests/:id
 * Approve/Reject withdrawal request
 */
router.patch('/admin/requests/:id', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const requestId = req.params.id;
        const { status, note } = req.body;

        // Admin Check
        const isAdmin = await roleService.userHasRole(userId, 'admin') ||
            await roleService.userHasRole(userId, 'master_admin');

        if (!isAdmin) return res.status(403).json({ error: 'Admin access required' });

        const updatedRequest = await payoutService.updateWithdrawalStatus(requestId, status, note, userId);

        res.json({ success: true, request: updatedRequest });
    } catch (error) {
        console.error('[PayoutsAPI] Admin update error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
