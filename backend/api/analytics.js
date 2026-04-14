const express = require('express');
const router = express.Router();
const merchantAnalyticsService = require('../services/merchantAnalyticsService');
const brandAnalyticsService = require('../services/brandAnalyticsService');
const hostAnalyticsService = require('../services/hostAnalyticsService');
const { requireAuth } = require('../middleware/auth');

/**
 * Analytics API Routes
 * Provides analytics endpoints for merchants, brands, and hosts
 */

// ============================================================================
// Merchant Analytics
// ============================================================================

/**
 * Get merchant sales summary
 * GET /api/analytics/merchant/sales/summary
 */
router.get('/merchant/sales/summary', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate } = req.query;

        const summary = await merchantAnalyticsService.getMerchantSalesSummary(
            merchantId,
            { startDate, endDate }
        );

        res.json(summary);
    } catch (error) {
        console.error('Error fetching sales summary:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get sales analytics
 * GET /api/analytics/merchant/sales
 */
router.get('/merchant/sales', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate, category } = req.query;

        const analytics = await merchantAnalyticsService.getSalesAnalytics(
            merchantId,
            { startDate, endDate, category }
        );

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching sales analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get product performance
 * GET /api/analytics/merchant/products
 */
router.get('/merchant/products', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const performance = await merchantAnalyticsService.getProductPerformance(merchantId);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching product performance:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get customer segmentation
 * GET /api/analytics/merchant/customers
 */
router.get('/merchant/customers', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const segmentation = await merchantAnalyticsService.getCustomerSegmentation(merchantId);
        res.json(segmentation);
    } catch (error) {
        console.error('Error fetching customer segmentation:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get cross-sell recommendations
 * GET /api/analytics/merchant/cross-sell
 */
router.get('/merchant/cross-sell', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { limit = 10 } = req.query;

        const matrix = await merchantAnalyticsService.getCrossSellMatrix(
            merchantId,
            parseInt(limit)
        );

        res.json(matrix);
    } catch (error) {
        console.error('Error fetching cross-sell matrix:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get redemption analytics
 * GET /api/analytics/merchant/redemptions
 */
router.get('/merchant/redemptions', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate } = req.query;

        const analytics = await merchantAnalyticsService.getRedemptionAnalytics(
            merchantId,
            { startDate, endDate }
        );

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching redemption analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get low stock products
 * GET /api/analytics/merchant/low-stock
 */
router.get('/merchant/low-stock', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const products = await merchantAnalyticsService.getLowStockProducts(merchantId);
        res.json(products);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Export sales report
 * GET /api/analytics/merchant/export
 */
router.get('/merchant/export', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate } = req.query;

        const csvData = await merchantAnalyticsService.exportSalesReport(
            merchantId,
            { startDate, endDate }
        );

        res.json(csvData);
    } catch (error) {
        console.error('Error exporting sales report:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Brand Analytics
// ============================================================================

/**
 * Get campaign performance
 * GET /api/analytics/brand/campaigns/:id/performance
 */
router.get('/brand/campaigns/:id/performance', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const performance = await brandAnalyticsService.getCampaignPerformance(id);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching campaign performance:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get campaign ROI
 * GET /api/analytics/brand/campaigns/:id/roi
 */
router.get('/brand/campaigns/:id/roi', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const roi = await brandAnalyticsService.getCampaignROI(id);
        res.json(roi);
    } catch (error) {
        console.error('Error fetching campaign ROI:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all campaigns analytics for a brand
 * GET /api/analytics/brand/campaigns
 */
router.get('/brand/campaigns', requireAuth, async (req, res) => {
    try {
        const brandId = req.user.id;
        const campaigns = await brandAnalyticsService.getBrandCampaignsAnalytics(brandId);
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching brand campaigns analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get engagement funnel
 * GET /api/analytics/brand/campaigns/:id/funnel
 */
router.get('/brand/campaigns/:id/funnel', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const funnel = await brandAnalyticsService.getEngagementFunnel(id);
        res.json(funnel);
    } catch (error) {
        console.error('Error fetching engagement funnel:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get top moments for a campaign
 * GET /api/analytics/brand/campaigns/:id/top-moments
 */
router.get('/brand/campaigns/:id/top-moments', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;

        const moments = await brandAnalyticsService.getTopMoments(id, parseInt(limit));
        res.json(moments);
    } catch (error) {
        console.error('Error fetching top moments:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get spending timeline
 * GET /api/analytics/brand/campaigns/:id/spending
 */
router.get('/brand/campaigns/:id/spending', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const timeline = await brandAnalyticsService.getSpendingTimeline(id);
        res.json(timeline);
    } catch (error) {
        console.error('Error fetching spending timeline:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Export campaign report
 * GET /api/analytics/brand/campaigns/:id/export
 */
router.get('/brand/campaigns/:id/export', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const report = await brandAnalyticsService.exportCampaignReport(id);
        res.json(report);
    } catch (error) {
        console.error('Error exporting campaign report:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// Host Analytics
// ============================================================================

/**
 * Get host earnings summary
 * GET /api/analytics/host/earnings
 */
router.get('/host/earnings', requireAuth, async (req, res) => {
    try {
        const hostId = req.user.id;
        const { startDate, endDate } = req.query;

        const summary = await hostAnalyticsService.getHostEarningsSummary(
            hostId,
            { startDate, endDate }
        );

        res.json(summary);
    } catch (error) {
        console.error('Error fetching host earnings:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get moment performance
 * GET /api/analytics/host/moments
 */
router.get('/host/moments', requireAuth, async (req, res) => {
    try {
        const hostId = req.user.id;
        const performance = await hostAnalyticsService.getMomentPerformance(hostId);
        res.json(performance);
    } catch (error) {
        console.error('Error fetching moment performance:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get earnings breakdown
 * GET /api/analytics/host/earnings/breakdown
 */
router.get('/host/earnings/breakdown', requireAuth, async (req, res) => {
    try {
        const hostId = req.user.id;
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const breakdown = await hostAnalyticsService.getEarningsBreakdown(
            hostId,
            { startDate, endDate, groupBy }
        );

        res.json(breakdown);
    } catch (error) {
        console.error('Error fetching earnings breakdown:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get engagement metrics
 * GET /api/analytics/host/engagement
 */
router.get('/host/engagement', requireAuth, async (req, res) => {
    try {
        const hostId = req.user.id;
        const metrics = await hostAnalyticsService.getEngagementMetrics(hostId);
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching engagement metrics:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get payout history
 * GET /api/analytics/host/payouts
 */
router.get('/host/payouts', requireAuth, async (req, res) => {
    try {
        const hostId = req.user.id;
        const history = await hostAnalyticsService.getPayoutHistory(hostId);
        res.json(history);
    } catch (error) {
        console.error('Error fetching payout history:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Export earnings report
 * GET /api/analytics/host/export
 */
router.get('/host/export', requireAuth, async (req, res) => {
    try {
        const hostId = req.user.id;
        const report = await hostAnalyticsService.exportEarningsReport(hostId);
        res.json(report);
    } catch (error) {
        console.error('Error exporting earnings report:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
