const express = require('express');
const router = express.Router();
const merchantProductService = require('../services/merchantProductService');
const merchantSalesService = require('../services/merchantSalesService');
const { authenticateUser } = require('../middleware/auth');

/**
 * Merchant API Routes
 * Handles product management, inventory, sales, and analytics
 */

// ============================================
// PRODUCT MANAGEMENT
// ============================================

/**
 * POST /api/merchant/products
 * Create a new product
 */
router.post('/products', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const productData = req.body;

        const product = await merchantProductService.createProduct(merchantId, productData);
        res.json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/products
 * Get all products for the merchant
 */
router.get('/products', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { category, is_active } = req.query;

        const filters = {};
        if (category) filters.category = category;
        if (is_active !== undefined) filters.is_active = is_active === 'true';

        const products = await merchantProductService.getProductsByMerchant(merchantId, filters);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/products/:id
 * Get single product details
 */
router.get('/products/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await merchantProductService.getProductById(id);
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/merchant/products/:id
 * Update a product
 */
router.patch('/products/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const merchantId = req.user.id;
        const updates = req.body;

        const product = await merchantProductService.updateProduct(id, merchantId, updates);
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/merchant/products/:id
 * Delete (deactivate) a product
 */
router.delete('/products/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const merchantId = req.user.id;

        const product = await merchantProductService.deleteProduct(id, merchantId);
        res.json(product);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// INVENTORY MANAGEMENT
// ============================================

/**
 * PATCH /api/merchant/products/:id/inventory
 * Update product inventory
 */
router.patch('/products/:id/inventory', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const merchantId = req.user.id;
        const { inventory_count, reason } = req.body;

        if (inventory_count === undefined) {
            return res.status(400).json({ error: 'inventory_count is required' });
        }

        const product = await merchantProductService.updateInventory(
            id,
            merchantId,
            inventory_count,
            reason
        );
        res.json(product);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/products/:id/inventory-logs
 * Get inventory change logs for a product
 */
router.get('/products/:id/inventory-logs', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        const logs = await merchantProductService.getInventoryLogs(id, parseInt(limit));
        res.json(logs);
    } catch (error) {
        console.error('Error fetching inventory logs:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/inventory/low-stock
 * Get products with low stock
 */
router.get('/inventory/low-stock', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const products = await merchantProductService.getLowStockProducts(merchantId);
        res.json(products);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SALES & REDEMPTIONS
// ============================================

/**
 * GET /api/merchant/sales
 * Get sales for the merchant
 */
router.get('/sales', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { status, startDate, endDate } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const sales = await merchantProductService.getSalesByMerchant(merchantId, filters);
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/merchant/sales/:code/validate
 * Validate a redemption code
 */
router.post('/sales/:code/validate', authenticateUser, async (req, res) => {
    try {
        const { code } = req.params;
        const merchantId = req.user.id;

        const sale = await merchantProductService.validateRedemption(code, merchantId);
        res.json(sale);
    } catch (error) {
        console.error('Error validating redemption:', error);
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/merchant/analytics/summary
 * Get sales summary and metrics
 */
router.get('/analytics/summary', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate) dateRange.startDate = startDate;
        if (endDate) dateRange.endDate = endDate;

        const summary = await merchantSalesService.getSalesSummary(merchantId, dateRange);
        res.json(summary);
    } catch (error) {
        console.error('Error fetching sales summary:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/analytics/top-products
 * Get top selling products
 */
router.get('/analytics/top-products', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { limit = 10, startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate) dateRange.startDate = startDate;
        if (endDate) dateRange.endDate = endDate;

        const topProducts = await merchantSalesService.getTopProducts(
            merchantId,
            parseInt(limit),
            dateRange
        );
        res.json(topProducts);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/analytics/sales-over-time
 * Get sales data over time for charts
 */
router.get('/analytics/sales-over-time', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { groupBy = 'day', startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate) dateRange.startDate = startDate;
        if (endDate) dateRange.endDate = endDate;

        const salesData = await merchantSalesService.getSalesOverTime(
            merchantId,
            groupBy,
            dateRange
        );
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales over time:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/analytics/customers
 * Get customer insights
 */
router.get('/analytics/customers', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate) dateRange.startDate = startDate;
        if (endDate) dateRange.endDate = endDate;

        const insights = await merchantSalesService.getCustomerInsights(merchantId, dateRange);
        res.json(insights);
    } catch (error) {
        console.error('Error fetching customer insights:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/analytics/redemptions
 * Get redemption analytics
 */
router.get('/analytics/redemptions', authenticateUser, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { startDate, endDate } = req.query;

        const dateRange = {};
        if (startDate) dateRange.startDate = startDate;
        if (endDate) dateRange.endDate = endDate;

        const analytics = await merchantSalesService.getRedemptionAnalytics(merchantId, dateRange);
        res.json(analytics);
    } catch (error) {
        console.error('Error fetching redemption analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
