const express = require('express');
const router = express.Router();
const momentProductService = require('../services/momentProductService');
const unifiedRedemptionService = require('../services/unifiedRedemptionService');
const { authenticateUser } = require('../middleware/auth');

/**
 * Moment-Product Integration API Routes
 */

// ============================================================================
// Product-Moment Linking
// ============================================================================

/**
 * Link a product to a moment
 * POST /api/moments/:momentId/products/link
 */
router.post('/:momentId/products/link', authenticateUser, async (req, res) => {
    try {
        const { momentId } = req.params;
        const { productId, visibility, momentExclusive, autoRedeemOnParticipation } = req.body;

        const product = await momentProductService.linkProductToMoment(
            productId,
            momentId,
            { visibility, momentExclusive, autoRedeemOnParticipation }
        );

        res.json(product);
    } catch (error) {
        console.error('Error linking product to moment:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Unlink a product from a moment
 * DELETE /api/moments/products/:productId/unlink
 */
router.delete('/products/:productId/unlink', authenticateUser, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await momentProductService.unlinkProductFromMoment(productId);
        res.json(product);
    } catch (error) {
        console.error('Error unlinking product:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all products linked to a moment
 * GET /api/moments/:momentId/products
 */
router.get('/:momentId/products', async (req, res) => {
    try {
        const { momentId } = req.params;
        const products = await momentProductService.getMomentProducts(momentId);
        res.json(products);
    } catch (error) {
        console.error('Error fetching moment products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check user access to moment-exclusive product
 * GET /api/moments/products/:productId/access
 */
router.get('/products/:productId/access', authenticateUser, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const access = await momentProductService.checkMomentProductAccess(userId, productId);
        res.json(access);
    } catch (error) {
        console.error('Error checking product access:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Entitlement Redemptions
// ============================================================================

/**
 * Create redemption from entitlement
 * POST /api/entitlements/:entitlementId/redeem
 */
router.post('/entitlements/:entitlementId/redeem', authenticateUser, async (req, res) => {
    try {
        const { entitlementId } = req.params;
        const userId = req.user.id;

        const redemption = await momentProductService.createRedemptionFromEntitlement(
            entitlementId,
            userId
        );

        res.json(redemption);
    } catch (error) {
        console.error('Error creating redemption from entitlement:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Unified Redemption Validation
// ============================================================================

/**
 * Validate any redemption code (unified)
 * POST /api/redemptions/unified/:code/validate
 */
router.post('/unified/:code/validate', authenticateUser, async (req, res) => {
    try {
        const { code } = req.params;
        const merchantId = req.user.id;

        const result = await unifiedRedemptionService.validateUnifiedRedemption(code, merchantId);
        res.json(result);
    } catch (error) {
        console.error('Error validating unified redemption:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * Get redemption details by code
 * GET /api/redemptions/unified/:code
 */
router.get('/unified/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const redemption = await unifiedRedemptionService.getRedemptionByCode(code);
        res.json(redemption);
    } catch (error) {
        console.error('Error fetching redemption:', error);
        res.status(404).json({ error: error.message });
    }
});

/**
 * Get user's redemptions
 * GET /api/redemptions/user/:userId
 */
router.get('/user/:userId', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, type, limit } = req.query;

        // Verify user can only access their own redemptions
        if (userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const redemptions = await unifiedRedemptionService.getUserRedemptions(
            userId,
            { status, type, limit: parseInt(limit) || 50 }
        );

        res.json(redemptions);
    } catch (error) {
        console.error('Error fetching user redemptions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get merchant's redemptions
 * GET /api/redemptions/merchant/:merchantId
 */
router.get('/merchant/:merchantId', authenticateUser, async (req, res) => {
    try {
        const { merchantId } = req.params;
        const { status, startDate, endDate, limit } = req.query;

        // Verify merchant can only access their own redemptions
        if (merchantId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const redemptions = await unifiedRedemptionService.getMerchantRedemptions(
            merchantId,
            { status, startDate, endDate, limit: parseInt(limit) || 100 }
        );

        res.json(redemptions);
    } catch (error) {
        console.error('Error fetching merchant redemptions:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get redemption statistics
 * GET /api/redemptions/stats
 */
router.get('/stats', authenticateUser, async (req, res) => {
    try {
        const { merchantId, startDate, endDate } = req.query;

        const stats = await unifiedRedemptionService.getRedemptionStats(
            merchantId || null,
            { startDate, endDate }
        );

        res.json(stats);
    } catch (error) {
        console.error('Error fetching redemption stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Escrow Distribution
// ============================================================================

/**
 * Distribute escrow as product entitlements
 * POST /api/escrow/:escrowPoolId/distribute-products
 */
router.post('/escrow/:escrowPoolId/distribute-products', authenticateUser, async (req, res) => {
    try {
        const { escrowPoolId } = req.params;
        const { productId, quantityPerUser } = req.body;

        const result = await momentProductService.distributeEscrowAsProducts(
            escrowPoolId,
            productId,
            quantityPerUser || 1
        );

        res.json(result);
    } catch (error) {
        console.error('Error distributing escrow as products:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
