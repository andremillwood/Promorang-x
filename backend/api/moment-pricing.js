const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const momentPricingService = require('../services/momentPricingService');

/**
 * GET /api/moments/pricing/calculator
 * Calculate Moment cost based on SKU and parameters
 */
router.get('/pricing/calculator', async (req, res) => {
    try {
        const {
            sku_type = 'A1',
            participants = 50,
            reward_per_participant = 0,
            location = 'single',
            duration_days = 1,
            priority = false,
            bundle_quantity = 1
        } = req.query;

        // Calculate pricing
        const pricing = momentPricingService.calculateMomentCost(sku_type, {
            participants: parseInt(participants),
            rewardPerParticipant: parseFloat(reward_per_participant),
            location,
            duration_days: parseInt(duration_days),
            priority: priority === 'true',
            bundle_quantity: parseInt(bundle_quantity)
        });

        // Get SKU details
        const skuDetails = momentPricingService.getSKUPricing(sku_type);

        res.json({
            success: true,
            sku: {
                type: sku_type,
                name: skuDetails.name,
                description: skuDetails.description,
                marketing_copy: skuDetails.marketing_copy
            },
            pricing,
            parameters: {
                participants: parseInt(participants),
                reward_per_participant: parseFloat(reward_per_participant),
                location,
                duration_days: parseInt(duration_days),
                priority: priority === 'true'
            }
        });
    } catch (error) {
        console.error('[Pricing Calculator] Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/moments/pricing/skus
 * Get all available SKUs for the authenticated brand
 */
router.get('/pricing/skus', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const skus = await momentPricingService.getAvailableSKUs(userId);

        res.json({
            success: true,
            skus
        });
    } catch (error) {
        console.error('[SKU List] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available SKUs'
        });
    }
});

/**
 * GET /api/moments/pricing/roi
 * Estimate ROI for a Moment
 */
router.get('/pricing/roi', async (req, res) => {
    try {
        const {
            sku_type = 'A2',
            participants = 50,
            reward_per_participant = 5,
            estimated_conversion_rate = 0.10
        } = req.query;

        const roi = momentPricingService.estimateMomentROI(sku_type, {
            participants: parseInt(participants),
            rewardPerParticipant: parseFloat(reward_per_participant),
            estimated_conversion_rate: parseFloat(estimated_conversion_rate)
        });

        res.json({
            success: true,
            roi
        });
    } catch (error) {
        console.error('[ROI Calculator] Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/moments/pricing/validate
 * Validate if brand can access a specific SKU
 */
router.post('/pricing/validate', requireAuth, async (req, res) => {
    try {
        const { sku_type } = req.body;
        const userId = req.user.id;

        if (!sku_type) {
            return res.status(400).json({
                success: false,
                error: 'sku_type is required'
            });
        }

        const eligibility = await momentPricingService.validateSKUEligibility(userId, sku_type);

        res.json({
            success: true,
            sku_type,
            ...eligibility
        });
    } catch (error) {
        console.error('[SKU Validation] Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/moments/pricing/catalog
 * Get the full SKU catalog (public)
 */
router.get('/pricing/catalog', (req, res) => {
    try {
        const catalog = momentPricingService.SKU_CATALOG;

        // Transform for public consumption
        const publicCatalog = Object.entries(catalog).map(([key, sku]) => ({
            id: key,
            sku_type: sku.id,
            name: sku.name,
            description: sku.description,
            marketing_copy: sku.marketing_copy,
            use_cases: sku.use_cases,
            pricing_range: sku.brandCostRange || sku.monthlyCostRange || null,
            requires_unlock: !!sku.unlockConditions
        }));

        res.json({
            success: true,
            catalog: publicCatalog
        });
    } catch (error) {
        console.error('[SKU Catalog] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch SKU catalog'
        });
    }
});

module.exports = router;
