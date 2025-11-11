/**
 * PROMORANG MARKETPLACE API
 * RESTful endpoints for e-commerce marketplace
 */

const express = require('express');
const router = express.Router();
const marketplaceService = require('../services/marketplaceService');
const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Helper functions
const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

// Auth middleware
router.use((req, res, next) => {
  if (!req.user && process.env.NODE_ENV === 'development') {
    req.user = {
      id: 'demo-user-id',
      email: 'demo@promorang.com',
      username: 'demo_user',
    };
  }

  if (!req.user) {
    return sendError(res, 401, 'Unauthorized', 'UNAUTHENTICATED');
  }

  next();
});

/**
 * GET /api/marketplace/categories
 * Retrieve marketplace categories (with demo fallback)
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await marketplaceService.getCategories();
    return sendSuccess(res, { categories });
  } catch (error) {
    console.error('[Marketplace API] Error getting categories:', error);
    return sendError(res, 500, 'Failed to load categories', 'SERVER_ERROR');
  }
});

/**
 * POST /api/marketplace/stores
 * Create a new merchant store
 */
router.post('/stores', async (req, res) => {
  try {
    const userId = req.user.id;
    const store = await marketplaceService.createStore(userId, req.body);
    return sendSuccess(res, { store }, 'Store created successfully');
  } catch (error) {
    console.error('[Marketplace API] Error creating store:', error);
    return sendError(res, 500, error.message || 'Failed to create store', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/stores/:identifier
 * Get store by slug or ID
 */
router.get('/stores/:identifier', async (req, res) => {
  try {
    const store = await marketplaceService.getStore(req.params.identifier);
    if (!store) {
      return sendError(res, 404, 'Store not found', 'NOT_FOUND');
    }
    return sendSuccess(res, { store });
  } catch (error) {
    console.error('[Marketplace API] Error getting store:', error);
    return sendError(res, 500, 'Failed to get store', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/stores/:storeId/products
 * Get products for a store
 */
router.get('/stores/:storeId/products', async (req, res) => {
  try {
    const result = await marketplaceService.getProducts({
      store_id: req.params.storeId,
      ...req.query,
    });
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Marketplace API] Error getting products:', error);
    return sendError(res, 500, 'Failed to get products', 'SERVER_ERROR');
  }
});

/**
 * POST /api/marketplace/products
 * Create a new product
 */
router.post('/products', async (req, res) => {
  try {
    const { store_id } = req.body;
    
    // Verify user owns the store
    if (!supabase) {
      return sendError(res, 503, 'Database not available', 'SERVICE_UNAVAILABLE');
    }

    const { data: store } = await supabase
      .from('merchant_stores')
      .select('user_id')
      .eq('id', store_id)
      .single();

    if (!store || store.user_id !== req.user.id) {
      return sendError(res, 403, 'Not authorized to add products to this store', 'FORBIDDEN');
    }

    const product = await marketplaceService.createProduct(store_id, req.body);
    return sendSuccess(res, { product }, 'Product created successfully');
  } catch (error) {
    console.error('[Marketplace API] Error creating product:', error);
    return sendError(res, 500, error.message || 'Failed to create product', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/products
 * Browse all products with filters
 */
router.get('/products', async (req, res) => {
  try {
    const result = await marketplaceService.getProducts(req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Marketplace API] Error getting products:', error);
    return sendError(res, 500, 'Failed to get products', 'SERVER_ERROR');
  }
});

/**
 * POST /api/marketplace/cart/items
 * Add item to cart
 */
router.post('/cart/items', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const item = await marketplaceService.addToCart(req.user.id, product_id, quantity);
    return sendSuccess(res, { item }, 'Item added to cart');
  } catch (error) {
    console.error('[Marketplace API] Error adding to cart:', error);
    return sendError(res, 500, error.message || 'Failed to add to cart', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/cart
 * Get user's cart
 */
router.get('/cart', async (req, res) => {
  try {
    const cart = await marketplaceService.getCart(req.user.id);
    return sendSuccess(res, { cart });
  } catch (error) {
    console.error('[Marketplace API] Error getting cart:', error);
    return sendError(res, 500, 'Failed to get cart', 'SERVER_ERROR');
  }
});

/**
 * POST /api/marketplace/orders
 * Create order from cart
 */
router.post('/orders', async (req, res) => {
  try {
    const order = await marketplaceService.createOrder(req.user.id, req.body);
    return sendSuccess(res, { order }, 'Order created successfully');
  } catch (error) {
    console.error('[Marketplace API] Error creating order:', error);
    return sendError(res, 500, error.message || 'Failed to create order', 'SERVER_ERROR');
  }
});

/**
 * POST /api/marketplace/orders/:orderId/pay
 * Process payment for order
 */
router.post('/orders/:orderId/pay', async (req, res) => {
  try {
    const order = await marketplaceService.processPayment(req.params.orderId, req.user.id);
    return sendSuccess(res, { order }, 'Payment processed successfully');
  } catch (error) {
    console.error('[Marketplace API] Error processing payment:', error);
    return sendError(res, 500, error.message || 'Failed to process payment', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/orders
 * Get user's orders
 */
router.get('/orders', async (req, res) => {
  try {
    if (!supabase) {
      return sendSuccess(res, { orders: [] });
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        merchant_stores(store_name, store_slug),
        order_items(*)
      `)
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, { orders: data || [] });
  } catch (error) {
    console.error('[Marketplace API] Error getting orders:', error);
    return sendError(res, 500, 'Failed to get orders', 'SERVER_ERROR');
  }
});

/**
 * POST /api/marketplace/products/:productId/reviews
 * Add product review
 */
router.post('/products/:productId/reviews', async (req, res) => {
  try {
    const review = await marketplaceService.addReview(
      req.user.id,
      req.params.productId,
      req.body
    );
    return sendSuccess(res, { review }, 'Review added successfully');
  } catch (error) {
    console.error('[Marketplace API] Error adding review:', error);
    return sendError(res, 500, error.message || 'Failed to add review', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/products/:productId/reviews
 * Get product reviews
 */
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    if (!supabase) {
      return sendSuccess(res, { reviews: [] });
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        users(username, display_name, profile_image)
      `)
      .eq('product_id', req.params.productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, { reviews: data || [] });
  } catch (error) {
    console.error('[Marketplace API] Error getting reviews:', error);
    return sendError(res, 500, 'Failed to get reviews', 'SERVER_ERROR');
  }
});

module.exports = router;
