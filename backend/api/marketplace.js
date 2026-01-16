/**
 * PROMORANG MARKETPLACE API
 * RESTful endpoints for e-commerce marketplace
 */

const express = require('express');
const router = express.Router();
const marketplaceService = require('../services/marketplaceService');
const ecommerceService = require('../services/ecommerceService');
const { supabase: serviceSupabase } = require('../lib/supabase');
const { requireAuth, resolveMerchantContext } = require('../middleware/auth');
const maturityService = require('../services/maturityService');
const supabase = global.supabase || serviceSupabase || null;

// Helper functions
const sendSuccess = (res, data = {}, message) => {
  return res.json({ status: 'success', data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ status: 'error', message, code });
};

// =====================================================
// PUBLIC ENDPOINTS - No auth required (for SEO/browsing)
// =====================================================

/**
 * GET /api/marketplace/products/public
 * Browse all products without auth
 */
router.get('/products/public', async (req, res) => {
  try {
    const result = await marketplaceService.getProducts(req.query);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('[Marketplace API] Error getting public products:', error);
    return sendError(res, 500, 'Failed to get products', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/products/:productId/public
 * Get single product detail without auth
 */
router.get('/products/:productId/public', async (req, res) => {
  try {
    const product = await marketplaceService.getProduct(req.params.productId);

    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND');
    }

    // Return public-safe product data
    return sendSuccess(res, {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        currency: product.currency,
        images: product.images,
        category: product.category,
        stock_quantity: product.stock_quantity,
        rating: product.rating,
        review_count: product.review_count,
        store: product.store ? {
          id: product.store.id,
          store_name: product.store.store_name,
          store_slug: product.store.store_slug,
          rating: product.store.rating
        } : null,
        created_at: product.created_at
      }
    });
  } catch (error) {
    console.error('[Marketplace API] Error getting public product:', error);
    return sendError(res, 500, 'Failed to get product', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/categories/public
 * Get categories without auth
 */
router.get('/categories/public', async (req, res) => {
  try {
    const categories = await marketplaceService.getCategories();
    return sendSuccess(res, { categories });
  } catch (error) {
    console.error('[Marketplace API] Error getting public categories:', error);
    return sendError(res, 500, 'Failed to load categories', 'SERVER_ERROR');
  }
});

/**
 * GET /api/marketplace/stores/:identifier/public
 * Get store info without auth
 */
router.get('/stores/:identifier/public', async (req, res) => {
  try {
    const store = await marketplaceService.getStore(req.params.identifier);
    if (!store) {
      return sendError(res, 404, 'Store not found', 'NOT_FOUND');
    }
    // Return public-safe store data
    return sendSuccess(res, {
      store: {
        id: store.id,
        store_name: store.store_name,
        store_slug: store.store_slug,
        description: store.description,
        logo_url: store.logo_url,
        banner_url: store.banner_url,
        rating: store.rating,
        product_count: store.product_count,
        created_at: store.created_at
      }
    });
  } catch (error) {
    console.error('[Marketplace API] Error getting public store:', error);
    return sendError(res, 500, 'Failed to get store', 'SERVER_ERROR');
  }
});

// =====================================================
// PROTECTED ROUTES - Auth required below this line
// =====================================================
// Auth middleware
router.use(requireAuth);
router.use(resolveMerchantContext);

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
 * GET /api/marketplace/my-store
 * Get current user's merchant store
 */
router.get('/my-store', async (req, res) => {
  try {
    if (!req.merchantAccount) {
      return sendSuccess(res, { store: null });
    }

    const { data: store, error } = await supabase
      .from('merchant_stores')
      .select('*')
      .eq('merchant_account_id', req.merchantAccount.id)
      .maybeSingle();

    if (error) throw error;
    return sendSuccess(res, { store });
  } catch (error) {
    console.error('[Marketplace API] Error getting my-store:', error);
    return sendError(res, 500, 'Failed to get store info', 'SERVER_ERROR');
  }
});

// =====================================================
// MULTI-PLATFORM E-COMMERCE INTEGRATIONS
// =====================================================

/**
 * GET /api/marketplace/integrations/:platform/authorize
 * Redirect to external auth (Shopify, Etsy, BigCommerce)
 */
router.get('/integrations/:platform/authorize', async (req, res) => {
  try {
    const { platform } = req.params;
    const { shop } = req.query;
    if (!shop) return sendError(res, 400, 'Shop URL required');

    // In production, use real environment URL
    const redirectUri = `${req.protocol}://${req.get('host')}/api/marketplace/integrations/${platform}/callback`;
    const authUrl = await ecommerceService.getAuthUrl(platform, shop, redirectUri);

    if (!authUrl) return sendError(res, 400, `Platform ${platform} does not use OAuth or is not supported`);

    return sendSuccess(res, { authUrl });
  } catch (error) {
    return sendError(res, 500, 'Failed to generate auth URL');
  }
});

/**
 * GET /api/marketplace/integrations/:platform/status
 */
router.get('/integrations/:platform/status', async (req, res) => {
  try {
    const { platform } = req.params;
    const { data: store } = await supabase
      .from('merchant_stores')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!store) return sendError(res, 404, 'Store not found');

    const { data: integration } = await supabase
      .from('merchant_external_stores')
      .select('*')
      .eq('store_id', store.id)
      .eq('platform', platform)
      .maybeSingle();

    return sendSuccess(res, { integration });
  } catch (error) {
    return sendError(res, 500, 'Failed to get integration status');
  }
});

/**
 * GET /api/marketplace/integrations/:platform/callback
 * OAuth callback for external platforms
 */
router.get('/integrations/:platform/callback', async (req, res) => {
  try {
    const { platform } = req.params;
    const { shop, code } = req.query;
    if (!shop || !code) return sendError(res, 400, 'Missing shop or code');

    // 1. Get user's store
    const { data: store } = await supabase
      .from('merchant_stores')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!store) return sendError(res, 404, 'Merchant store not found');

    // 2. Exchange code for token (using platform-specific logic in adapter)
    const adapter = ecommerceService.adapters[platform];
    if (!adapter || !adapter.exchangeCode) return sendError(res, 400, 'OAuth not supported for this platform');

    const tokenData = await adapter.exchangeCode(shop, code);

    // 3. Save integration
    await ecommerceService.saveIntegration(store.id, platform, {
      shop,
      accessToken: tokenData.access_token,
      scopes: tokenData.scope
    });

    return res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center;">
            <h1 style="color: #10b981;">${platform.charAt(0).toUpperCase() + platform.slice(1)} Connected!</h1>
            <p>You can now close this window and return to your dashboard.</p>
            <script>window.close();</script>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(`[${req.params.platform} Callback Error]`, error);
    return sendError(res, 500, 'OAuth implementation failed');
  }
});

/**
 * POST /api/marketplace/integrations/woocommerce/connect
 * Direct connection for WooCommerce (API Keys)
 */
router.post('/integrations/woocommerce/connect', async (req, res) => {
  try {
    const { shopUrl, apiKey, apiSecret } = req.body;
    if (!shopUrl || !apiKey || !apiSecret) return sendError(res, 400, 'Missing credentials');

    const { data: store } = await supabase.from('merchant_stores').select('id').eq('user_id', req.user.id).single();
    if (!store) return sendError(res, 404, 'Store not found');

    const integration = await ecommerceService.saveIntegration(store.id, 'woocommerce', {
      shopUrl, apiKey, apiSecret
    });

    return sendSuccess(res, { integration }, 'WooCommerce connected');
  } catch (error) {
    return sendError(res, 500, 'Failed to connect WooCommerce');
  }
});

/**
 * GET /api/marketplace/integrations/:platform/products
 * List products from external platform
 */
router.get('/integrations/:platform/products', async (req, res) => {
  try {
    const { platform } = req.params;
    const { data: store } = await supabase.from('merchant_stores').select('id').eq('user_id', req.user.id).single();
    if (!store) return sendError(res, 404, 'Merchant store not found');

    const products = await ecommerceService.fetchExternalProducts(store.id, platform);
    return sendSuccess(res, { products });
  } catch (error) {
    console.error(`[${req.params.platform}] Products fetch error:`, error);
    return sendError(res, 500, 'Failed to fetch external products');
  }
});

/**
 * POST /api/marketplace/integrations/:platform/import
 * Import selected products
 */
router.post('/integrations/:platform/import', async (req, res) => {
  try {
    const { platform } = req.params;
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) return sendError(res, 400, 'Invalid product IDs');

    const { data: store } = await supabase.from('merchant_stores').select('id').eq('user_id', req.user.id).single();
    if (!store) return sendError(res, 404, 'Store not found');

    const imported = await ecommerceService.importProducts(store.id, platform, productIds);
    return sendSuccess(res, { imported }, `${imported.length} products imported from ${platform}`);
  } catch (error) {
    return sendError(res, 500, 'Import failed');
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

    if (!req.merchantAccount) {
      return sendError(res, 403, 'Merchant account required', 'FORBIDDEN');
    }

    // Verify store belongs to the active merchant account
    const { data: store } = await supabase
      .from('merchant_stores')
      .select('merchant_account_id')
      .eq('id', store_id)
      .single();

    if (!store || store.merchant_account_id !== req.merchantAccount.id) {
      return sendError(res, 403, 'Not authorized for this merchant account', 'FORBIDDEN');
    }

    const product = await marketplaceService.createProduct(store_id, {
      ...req.body,
      merchant_account_id: req.merchantAccount.id
    });
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
 * GET /api/marketplace/products/:productId
 * Get a single product by ID
 */
router.get('/products/:productId', async (req, res) => {
  try {
    const product = await marketplaceService.getProduct(req.params.productId);

    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND');
    }

    return sendSuccess(res, { product });
  } catch (error) {
    console.error('[Marketplace API] Error getting product:', error);
    return sendError(res, 500, 'Failed to get product', 'SERVER_ERROR');
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

// Product shares status
router.get('/products/:id/shares-status', async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!supabase) {
    return res.json({ status: 'success', data: { supporter_count: 5, available_shares: 500 } });
  }

  // Enforce Rank 2 for performance data
  if (userId) {
    try {
      const maturityData = await maturityService.getUserMaturityData(userId);
      const maturityState = maturityData?.maturity_state || 0;

      if (maturityState < 2) {
        return res.status(403).json({
          status: 'error',
          message: 'Reach Rank 2 to unlock product performance data.',
          code: 'INSUFFICIENT_RANK'
        });
      }
    } catch (maturityError) {
      console.warn('[Marketplace API] Maturity check failed:', maturityError);
    }
  }

  try {
    const { count: supporterCount } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);

    return res.json({
      status: 'success',
      data: {
        supporter_count: supporterCount || 0,
        available_shares: Math.max(0, 1000 - (supporterCount || 0) * 10) // 1000 total shares, 10 per early buyer
      }
    });
  } catch (error) {
    console.error('[Marketplace API] Error fetching shares status:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

module.exports = router;
