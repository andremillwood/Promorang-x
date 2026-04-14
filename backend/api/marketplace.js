/**
 * Marketplace API
 * Endpoints for product purchases and transaction history
 */

const express = require('express');
const router = express.Router();
const marketplaceService = require('../services/marketplaceService');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/marketplace/purchase
 * Buy a product with cash or points
 */
router.post('/purchase', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, method, quantity } = req.body;

        if (!product_id || !method) {
            return res.status(400).json({ error: 'Product ID and payment method are required' });
        }

        const result = await marketplaceService.processPurchase(
            userId,
            product_id,
            method, // 'points' or 'cash' 
            quantity || 1
        );

        res.json(result);
    } catch (error) {
        console.error('[MarketplaceAPI] Purchase error:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/marketplace/transactions
 * Get user's purchase history
 */
router.get('/transactions', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await marketplaceService.getPurchaseHistory(userId);

        res.json({ transactions: history });
    } catch (error) {
        console.error('[MarketplaceAPI] History error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
