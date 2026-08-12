const express = require('express');
const router = express.Router();
const merchantProductService = require('../services/merchantProductService');
const merchantSalesService = require('../services/merchantSalesService');
const { requireAuth } = require('../middleware/auth');

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
router.post('/products', requireAuth, async (req, res) => {
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
router.get('/products', requireAuth, async (req, res) => {
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
router.get('/products/:id', requireAuth, async (req, res) => {
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
router.patch('/products/:id', requireAuth, async (req, res) => {
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
router.delete('/products/:id', requireAuth, async (req, res) => {
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
router.patch('/products/:id/inventory', requireAuth, async (req, res) => {
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
router.get('/products/:id/inventory-logs', requireAuth, async (req, res) => {
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
router.get('/inventory/low-stock', requireAuth, async (req, res) => {
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

/** POST /api/merchant/sales - Buy or reserve a merchant listing. */
router.post('/sales', requireAuth, async (req, res) => {
    try {
        const { product_id, sale_type, amount_paid = 0, points_paid = 0, metadata = {} } = req.body;
        if (!product_id) return res.status(422).json({ error: 'product_id is required' });
        if (sale_type !== 'reservation') return res.status(422).json({ error: 'This endpoint only issues unpaid reservations; use verified marketplace or payment checkout for purchases' });
        const sale = await merchantProductService.createSale(product_id, req.user.id, { sale_type, amount_paid, points_paid, metadata });
        res.status(201).json({ success: true, sale, redemption_code: sale.redemption_code });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/merchant/sales
 * Get sales for the merchant
 */
router.get('/sales', requireAuth, async (req, res) => {
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
 * GET /api/merchant/receipts
 * Get commerce receipts for this merchant across Stripe purchases, reservations, and redemptions.
 */
router.get('/receipts', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { status, receipt_type, limit = 40 } = req.query;

        let query = req.supabase || global.supabase;
        query = query
            .from('commerce_receipts')
            .select('*, merchant_products:listing_id(name, image_url, category, fulfillment_mode)')
            .eq('merchant_id', merchantId)
            .order('occurred_at', { ascending: false })
            .limit(Math.min(parseInt(limit, 10) || 40, 100));

        if (status) query = query.eq('status', status);
        if (receipt_type) query = query.eq('receipt_type', receipt_type);

        const { data, error } = await query;
        if (error) throw error;
        res.json({ receipts: data || [] });
    } catch (error) {
        console.error('Error fetching merchant receipts:', error);
        res.status(500).json({ error: error.message });
    }
});

/** GET /api/merchant/live-ops — one Moment-aware counter payload for web and mobile. */
router.get('/live-ops', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const db = req.supabase || global.supabase;
        const [productsResult, receiptsResult] = await Promise.all([
            db.from('merchant_products')
                .select('id,name,image_url,linked_moment_id,inventory_quantity,inventory_count,is_active,price,currency,fulfillment_mode,updated_at')
                .eq('merchant_id', merchantId)
                .eq('is_active', true)
                .order('updated_at', { ascending: false })
                .limit(100),
            db.from('commerce_receipts')
                .select('*, merchant_products:listing_id(name,image_url,category,fulfillment_mode,linked_moment_id)')
                .eq('merchant_id', merchantId)
                .order('occurred_at', { ascending: false })
                .limit(100),
        ]);
        if (productsResult.error) throw productsResult.error;
        if (receiptsResult.error) throw receiptsResult.error;

        const listings = (productsResult.data || []).map((item) => ({
            ...item,
            inventory_quantity: item.inventory_count ?? item.inventory_quantity,
        }));
        const momentIds = [...new Set(listings.map((item) => item.linked_moment_id).filter(Boolean))];
        let moments = [];
        if (momentIds.length) {
            const { data } = await db.from('moments').select('id,title,starts_at,ends_at,status,venue_id').in('id', momentIds);
            moments = data || [];
        }
        const now = Date.now();
        const liveMomentIds = new Set(moments.filter((moment) => {
            const starts = moment.starts_at ? new Date(moment.starts_at).getTime() : 0;
            const ends = moment.ends_at ? new Date(moment.ends_at).getTime() : starts + 12 * 60 * 60 * 1000;
            return moment.status === 'live' || (starts <= now && ends >= now);
        }).map((moment) => moment.id));

        res.json({
            generated_at: new Date().toISOString(),
            moments,
            listings,
            receipts: receiptsResult.data || [],
            live_moment_ids: [...liveMomentIds],
        });
    } catch (error) {
        console.error('Error loading merchant live ops:', error);
        res.status(500).json({ error: error.message || 'Failed to load live operations' });
    }
});

/**
 * PATCH /api/merchant/receipts/:id/status
 * Update a merchant-owned receipt lifecycle state.
 */
router.patch('/receipts/:id/status', requireAuth, async (req, res) => {
    try {
        const merchantId = req.user.id;
        const { id } = req.params;
        const { status, note } = req.body || {};
        const allowedStatuses = ['fulfilled', 'cancelled', 'refunded'];

        if (!allowedStatuses.includes(status)) {
            return res.status(422).json({ error: 'status must be fulfilled, cancelled, or refunded' });
        }

        const db = req.supabase || global.supabase;
        const { data: existing, error: fetchError } = await db
            .from('commerce_receipts')
            .select('id, merchant_id, sale_id, attribution, status')
            .eq('id', id)
            .eq('merchant_id', merchantId)
            .single();

        if (fetchError || !existing) return res.status(404).json({ error: 'Receipt not found' });
        if (['cancelled', 'refunded'].includes(existing.status)) {
            return res.status(409).json({ error: `Receipt is already ${existing.status}` });
        }

        const { data: receipt, error } = await db
            .from('commerce_receipts')
            .update({
                status,
                attribution: {
                    ...(existing.attribution || {}),
                    merchant_status_action: status,
                    merchant_status_note: note || null,
                    merchant_status_at: new Date().toISOString(),
                    merchant_status_by: merchantId,
                },
            })
            .eq('id', id)
            .eq('merchant_id', merchantId)
            .select('*, merchant_products:listing_id(name, image_url, category, fulfillment_mode)')
            .single();

        if (error) throw error;

        if (existing.sale_id && status === 'fulfilled') {
            if (existing.attribution?.commerce_order_id) {
                await db.from('commerce_orders').update({
                    fulfillment_status: 'delivered',
                    updated_at: new Date().toISOString(),
                }).eq('id', existing.attribution.commerce_order_id);
                const settlementService = require('../services/merchantSettlementService');
                await settlementService.releaseOrderSettlement(existing.attribution.commerce_order_id);
            }
            await db
                .from('product_sales')
                .update({ status: 'validated', validated_at: new Date().toISOString(), validated_by: merchantId })
                .eq('id', existing.sale_id)
                .eq('merchant_id', merchantId);
        } else if (existing.sale_id && status === 'cancelled') {
            await db
                .from('product_sales')
                .update({ status: 'cancelled' })
                .eq('id', existing.sale_id)
                .eq('merchant_id', merchantId);
        }

        res.json({ receipt });
    } catch (error) {
        console.error('Error updating merchant receipt status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/merchant/sales/:code/validate
 * Validate a redemption code
 */
router.post('/sales/:code/validate', requireAuth, async (req, res) => {
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
router.get('/analytics/summary', requireAuth, async (req, res) => {
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
router.get('/analytics/top-products', requireAuth, async (req, res) => {
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
router.get('/analytics/sales-over-time', requireAuth, async (req, res) => {
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
router.get('/analytics/customers', requireAuth, async (req, res) => {
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
router.get('/analytics/redemptions', requireAuth, async (req, res) => {
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

router.get('/commerce/profile', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const merchantId = req.user.id;
        const [{ data: profile, error: profileError }, { data: shippingRates, error: ratesError }] = await Promise.all([
            db.from('merchant_commerce_profiles').select('*').eq('merchant_id', merchantId).maybeSingle(),
            db.from('merchant_shipping_rates').select('*').eq('merchant_id', merchantId).order('sort_order'),
        ]);
        if (profileError) throw profileError;
        if (ratesError) throw ratesError;
        res.json({ success: true, profile, shipping_rates: shippingRates || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/commerce/profile', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const allowed = [
            'legal_business_name', 'support_email', 'shipping_origin', 'return_policy',
            'fulfillment_terms', 'tax_enabled', 'allowed_countries', 'default_currency',
            'processing_days',
        ];
        const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
        updates.merchant_id = req.user.id;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await db.from('merchant_commerce_profiles')
            .upsert(updates, { onConflict: 'merchant_id' }).select().single();
        if (error) throw error;
        res.json({ success: true, profile: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/commerce/shipping-rates', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const { display_name, fulfillment_type, amount = 0, currency = 'USD', min_delivery_days, max_delivery_days, countries = ['US'], active = true } = req.body || {};
        if (!display_name || !['shipping', 'local_delivery', 'pickup'].includes(fulfillment_type)) {
            return res.status(422).json({ error: 'A valid name and fulfillment type are required' });
        }
        const { data, error } = await db.from('merchant_shipping_rates').insert({
            merchant_id: req.user.id, display_name, fulfillment_type, amount,
            currency: String(currency).toUpperCase(), min_delivery_days, max_delivery_days,
            countries, active,
        }).select().single();
        if (error) throw error;
        res.status(201).json({ success: true, shipping_rate: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/commerce/direct-payment-methods', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const { data, error } = await db.from('merchant_direct_payment_methods')
            .select('*').eq('merchant_id', req.user.id).order('display_name');
        if (error) {
            console.warn('[Merchant API] merchant_direct_payment_methods fetch warning:', error.message);
            return res.json({ success: true, methods: [] });
        }
        res.json({ success: true, methods: data || [] });
    } catch (error) {
        console.warn('[Merchant API] direct payment methods error:', error.message);
        res.json({ success: true, methods: [] });
    }
});

router.put('/commerce/direct-payment-methods/:methodType', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const valid = ['cash_on_pickup','card_terminal_pickup','lynk_at_venue','bank_transfer','merchant_payment_link','cash_on_delivery'];
        if (!valid.includes(req.params.methodType)) return res.status(422).json({ error: 'Invalid payment method' });
        const { display_name, instructions, payment_link, active = true } = req.body || {};
        const { data, error } = await db.from('merchant_direct_payment_methods').upsert({
            merchant_id: req.user.id,
            method_type: req.params.methodType,
            display_name: display_name || req.params.methodType.replaceAll('_', ' '),
            instructions: instructions || null,
            payment_link: payment_link || null,
            active: Boolean(active),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'merchant_id,method_type' }).select().single();
        if (error) throw error;
        res.json({ success: true, method: data });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/commerce/merchant-payment-orders', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const { data, error } = await db.from('commerce_orders')
            .select('*,commerce_order_items(*)')
            .eq('merchant_id', req.user.id).eq('payment_collection', 'merchant')
            .order('created_at', { ascending: false }).limit(100);
        if (error) {
            console.warn('[Merchant API] commerce_orders fetch warning:', error.message);
            return res.json({ success: true, orders: [] });
        }
        res.json({ success: true, orders: data || [] });
    } catch (error) {
        console.warn('[Merchant API] merchant payment orders error:', error.message);
        res.json({ success: true, orders: [] });
    }
});

router.post('/commerce/merchant-payment-orders/:orderId/confirm', requireAuth, async (req, res) => {
    try {
        const reference = String(req.body?.reference || '').trim();
        if (!reference) return res.status(422).json({ error: 'Payment reference is required' });
        const marketplaceService = require('../services/marketplaceService');
        const result = await marketplaceService.confirmMerchantPayment({
            orderId: req.params.orderId, merchantId: req.user.id, reference,
        });
        res.json({ success: true, ...result });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.patch('/commerce/orders/:orderId/fulfillment', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const allowedStatuses = ['unfulfilled', 'preparing', 'ready', 'shipped', 'delivered', 'redeemed', 'cancelled'];
        const { status, tracking_number, tracking_url, carrier } = req.body || {};
        if (!allowedStatuses.includes(status)) return res.status(422).json({ error: 'Invalid fulfillment status' });
        const { data: order, error: findError } = await db.from('commerce_orders')
            .select('id,merchant_id,payment_status,fulfillment_status')
            .eq('id', req.params.orderId).eq('merchant_id', req.user.id).single();
        if (findError || !order) return res.status(404).json({ error: 'Order not found' });
        if (order.payment_status !== 'paid' && status !== 'cancelled') {
            return res.status(409).json({ error: 'Only paid orders can enter fulfillment' });
        }
        const { data, error } = await db.from('commerce_orders').update({
            fulfillment_status: status,
            tracking_number: tracking_number || null,
            tracking_url: tracking_url || null,
            carrier: carrier || null,
            fulfilled_at: ['delivered', 'redeemed'].includes(status) ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
        }).eq('id', order.id).select().single();
        if (error) throw error;
        await db.from('commerce_receipts').update({
            status: ['delivered', 'redeemed'].includes(status) ? 'fulfilled' : 'issued',
        }).eq('sale_id', order.id);
        if (['delivered', 'redeemed'].includes(status)) {
            const { error: releaseError } = await db.rpc('release_gem_settlement_after_fulfillment', {
                p_order_id: order.id,
                p_merchant_id: req.user.id,
            });
            if (releaseError && !String(releaseError.message || '').includes('Completed merchant fulfillment')) throw releaseError;
        }
        res.json({ success: true, order: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/commerce/gem-settlements', requireAuth, async (req, res) => {
    try {
        const db = req.supabase || global.supabase;
        const { data, error } = await db.from('merchant_gem_settlement_ledger')
            .select('*,commerce_orders(id,payment_status,fulfillment_status,paid_at)')
            .eq('merchant_id', req.user.id).order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        res.json({ success: true, settlements: data || [] });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
