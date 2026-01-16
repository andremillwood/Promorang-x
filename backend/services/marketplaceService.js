/**
 * PROMORANG MARKETPLACE SERVICE
 * Comprehensive e-commerce service for stores, products, orders
 * Handles multi-currency payments and inventory management
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const { trackProductSale, trackAffiliateProductSale } = require('../utils/referralTracker');
const couponService = require('./couponService');

const slugify = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  || 'category';

const demoCategories = [
  {
    id: 'category-featured',
    name: 'Featured Picks',
    slug: 'featured-picks',
    icon: '🌟',
  },
  {
    id: 'category-digital',
    name: 'Digital Products',
    slug: 'digital-products',
    icon: '💾',
  },
  {
    id: 'category-services',
    name: 'Services',
    slug: 'services',
    icon: '🛠️',
  },
  {
    id: 'category-merch',
    name: 'Creator Merch',
    slug: 'creator-merch',
    icon: '🛍️',
  },
];

/**
 * Get product categories with fallback demo data
 */
async function getCategories() {
  if (!supabase) {
    return demoCategories;
  }

  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return demoCategories;
    }

    return data.map((category, index) => ({
      id: category.id || `category-${index}`,
      name: category.name || 'Marketplace Category',
      slug: category.slug || slugify(category.name || `category-${index}`),
      icon: category.icon || category.emoji || '🛒',
    }));
  } catch (error) {
    console.error('[Marketplace Service] Error getting categories:', error);
    return demoCategories;
  }
}

/**
 * Create a merchant store
 */
async function createStore(userId, storeData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const {
    store_name,
    description,
    logo_url,
    banner_url,
    business_type,
    contact_email,
  } = storeData;

  try {
    // Generate unique slug
    const baseSlug = store_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Check for uniqueness
    while (true) {
      const { data: existing } = await supabase
        .from('merchant_stores')
        .select('id')
        .eq('store_slug', slug)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create merchant account first
    const { data: account, error: accountError } = await supabase
      .from('merchant_accounts')
      .insert({
        name: store_name,
        slug,
        description,
        logo_url,
        owner_id: userId,
      })
      .select()
      .single();

    if (accountError) throw accountError;

    // Create store linked to account
    const { data: store, error: storeError } = await supabase
      .from('merchant_stores')
      .insert({
        user_id: userId,
        merchant_account_id: account.id,
        store_name,
        store_slug: slug,
        description,
        logo_url,
        banner_url,
        business_type,
        contact_email,
        status: 'active',
      })
      .select()
      .single();

    if (storeError) throw storeError;

    // Create team membership for owner
    await supabase
      .from('merchant_team_members')
      .insert({
        merchant_account_id: account.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        accepted_at: new Date().toISOString(),
      });

    // Update user's has_store flag
    await supabase
      .from('users')
      .update({ has_store: true, store_id: store.id })
      .eq('id', userId);

    return store;
  } catch (error) {
    console.error('[Marketplace Service] Error creating store:', error);
    throw error;
  }
}

/**
 * Get store by slug or ID
 */
async function getStore(identifier) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const query = supabase
      .from('merchant_stores')
      .select(`
        *,
        users!merchant_stores_user_id_fkey(username, display_name, profile_image)
      `);

    const { data, error } = isUUID
      ? await query.eq('id', identifier).single()
      : await query.eq('store_slug', identifier).single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Marketplace Service] Error getting store:', error);
    return null;
  }
}

/**
 * Create a product
 */
async function createProduct(storeId, productData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const {
    name,
    description,
    short_description,
    price_usd,
    price_gems,
    price_gold,
    category_id,
    images,
    is_digital,
    inventory_count,
    tags,
  } = productData;

  try {
    // Generate slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        merchant_account_id: productData.merchant_account_id,
        name,
        slug,
        description,
        short_description,
        price_usd,
        price_gems,
        price_gold,
        category_id,
        images: images || [],
        is_digital: is_digital || false,
        inventory_count: inventory_count || 0,
        is_unlimited: is_digital || false,
        tags: tags || [],
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return product;
  } catch (error) {
    console.error('[Marketplace Service] Error creating product:', error);
    throw error;
  }
}

/**
 * Get products with filters
 */
async function getProducts(filters = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const {
    store_id,
    category_id,
    status = 'active',
    is_featured,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    limit = 50,
    offset = 0,
  } = filters;

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        merchant_stores!products_store_id_fkey(id, store_name, store_slug, logo_url, rating),
        product_categories(id, name, slug)
      `, { count: 'exact' });

    if (store_id) query = query.eq('store_id', store_id);
    if (category_id) query = query.eq('category_id', category_id);
    if (status) query = query.eq('status', status);
    if (is_featured !== undefined) query = query.eq('is_featured', is_featured);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const productsWithImages = (data || []).map((product, index) => ({
      ...product,
      images: (product.images && product.images.length > 0)
        ? product.images
        : [index % 2 === 0 ? '/assets/demo/streetwear-hoodie.png' : '/assets/demo/headphones.png']
    }));

    return {
      products: productsWithImages,
      total: count || 0,
      limit,
      offset,
    };
  } catch (error) {
    console.error('[Marketplace Service] Error getting products:', error);
    throw error;
  }
}

/**
 * Add item to cart
 */
async function addToCart(userId, productId, quantity = 1) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Get or create cart
    let { data: cart } = await supabase
      .from('shopping_carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('shopping_carts')
        .insert({ user_id: userId })
        .select()
        .single();

      if (cartError) throw cartError;
      cart = newCart;
    }

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity,
          price_usd: product.price_usd,
          price_gems: product.price_gems,
          price_gold: product.price_gold,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('[Marketplace Service] Error adding to cart:', error);
    throw error;
  }
}

/**
 * Get user's cart
 */
async function getCart(userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data: cart } = await supabase
      .from('shopping_carts')
      .select(`
        *,
        cart_items(
          *,
          products(*)
        )
      `)
      .eq('user_id', userId)
      .single();

    return cart;
  } catch (error) {
    console.error('[Marketplace Service] Error getting cart:', error);
    return null;
  }
}

/**
 * Create order from cart
 */
async function createOrder(userId, orderData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const {
    store_id,
    payment_method,
    shipping_address,
    customer_notes,
    coupon_code,
    affiliate_referral_code, // Affiliate/referrer code for commission tracking
    affiliate_product_id, // Product that was linked to via affiliate link
  } = orderData;

  try {
    // Get cart items for this store
    const cart = await getCart(userId);
    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Filter items for this store
    const storeItems = cart.cart_items.filter(
      item => item.products.store_id === store_id
    );

    if (storeItems.length === 0) {
      throw new Error('No items from this store in cart');
    }

    // Calculate totals
    let subtotal_usd = 0;
    let subtotal_gems = 0;
    let subtotal_gold = 0;

    storeItems.forEach(item => {
      if (item.price_usd) subtotal_usd += item.price_usd * item.quantity;
      if (item.price_gems) subtotal_gems += item.price_gems * item.quantity;
      if (item.price_gold) subtotal_gold += item.price_gold * item.quantity;
    });

    // Apply coupon if provided
    let discount_amount_usd = 0;
    let discount_amount_gems = 0;
    let discount_amount_gold = 0;
    let couponData = null;

    if (coupon_code) {
      try {
        couponData = await couponService.applyCoupon(coupon_code, userId, {
          subtotal_usd,
          subtotal_gems,
          subtotal_gold,
        });

        discount_amount_usd = couponData.discount.usd || 0;
        discount_amount_gems = couponData.discount.gems || 0;
        discount_amount_gold = couponData.discount.gold || 0;
      } catch (couponError) {
        console.error('[Marketplace Service] Coupon error:', couponError);
        throw new Error(`Coupon error: ${couponError.message}`);
      }
    }

    // Calculate final totals after discount
    const total_usd = Math.max(0, subtotal_usd - discount_amount_usd);
    const total_gems = Math.max(0, subtotal_gems - discount_amount_gems);
    const total_gold = Math.max(0, subtotal_gold - discount_amount_gold);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: userId,
        store_id,
        merchant_account_id: storeItems[0]?.products?.merchant_account_id || null,
        payment_method,
        payment_status: 'pending',
        subtotal_usd,
        subtotal_gems,
        subtotal_gold,
        coupon_code: coupon_code || null,
        discount_amount_usd,
        discount_amount_gems,
        discount_amount_gold,
        total_usd,
        total_gems,
        total_gold,
        shipping_address,
        customer_notes,
        status: 'pending',
        relay_id: orderData.relay_id || null,
        affiliate_referral_code: affiliate_referral_code || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = storeItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      product_image: item.products.images?.[0],
      product_sku: item.products.sku,
      quantity: item.quantity,
      unit_price_usd: item.price_usd,
      unit_price_gems: item.price_gems,
      unit_price_gold: item.price_gold,
      total_price_usd: item.price_usd ? item.price_usd * item.quantity : null,
      total_price_gems: item.price_gems ? item.price_gems * item.quantity : null,
      total_price_gold: item.price_gold ? item.price_gold * item.quantity : null,
      is_digital: item.products.is_digital,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Track coupon usage if applied
    if (couponData && couponData.coupon) {
      await couponService.trackCouponUsage(
        couponData.coupon.id,
        userId,
        order.id,
        couponData.discount,
        couponData.original_total,
        couponData.final_total
      );
    }

    // Remove items from cart
    const itemIds = storeItems.map(item => item.id);
    await supabase
      .from('cart_items')
      .delete()
      .in('id', itemIds);

    return order;
  } catch (error) {
    console.error('[Marketplace Service] Error creating order:', error);
    throw error;
  }
}

/**
 * Process order payment
 */
async function processPayment(orderId, userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', userId)
      .single();

    if (!order) {
      throw new Error('Order not found');
    }

    // Process based on payment method
    if (order.payment_method === 'gems' || order.payment_method === 'gold') {
      // Deduct from user balance
      const currency = order.payment_method === 'gems' ? 'gems_balance' : 'gold_balance';
      const amount = order.payment_method === 'gems' ? order.total_gems : order.total_gold;

      const { data: user } = await supabase
        .from('users')
        .select(currency)
        .eq('id', userId)
        .single();

      if (user[currency] < amount) {
        throw new Error('Insufficient balance');
      }

      await supabase
        .from('users')
        .update({ [currency]: user[currency] - amount })
        .eq('id', userId);
    }

    // Update order status
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'paid',
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Track commissions
    if (order.total_usd > 0) {
      // Track standard referral commission (if buyer was referred by someone)
      await trackProductSale(userId, order.total_usd, orderId);

      // Track affiliate commission (if order came from an affiliate link)
      // This is separate from the user's referrer - it rewards whoever shared the product link
      if (order.affiliate_referral_code) {
        await trackAffiliateProductSale(
          order.affiliate_referral_code,
          order.total_usd,
          orderId
        );
        console.log(`[Marketplace Service] Affiliate commission triggered for code: ${order.affiliate_referral_code}`);
      }
    }

    // Award Market Shares (Early Supporter & Performance)
    try {
      await awardMarketShares(orderId, userId);
    } catch (shareError) {
      console.error('[Marketplace Service] Error awarding market shares:', shareError);
    }

    return updatedOrder;
  } catch (error) {
    console.error('[Marketplace Service] Error processing payment:', error);
    throw error;
  }
}

/**
 * Get a single product by ID
 */
async function getProduct(productId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(
        `*,
        merchant_stores!products_store_id_fkey(id, store_name, store_slug, logo_url, rating),
        product_categories(id, name, slug)
        `
      )
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (error) {
      // PostgREST not-found error code
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Marketplace Service] Error getting product:', error);
    throw error;
  }
}

/**
 * Add product review
 */
async function addReview(userId, productId, reviewData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const { rating, title, review_text, order_id } = reviewData;

  try {
    // Check if user purchased the product
    let is_verified_purchase = false;
    if (order_id) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('id, orders!inner(buyer_id)')
        .eq('product_id', productId)
        .eq('orders.id', order_id)
        .eq('orders.buyer_id', userId)
        .single();

      is_verified_purchase = !!orderItem;
    }

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        order_id,
        rating,
        title,
        review_text,
        is_verified_purchase,
        status: 'approved', // Auto-approve for now
      })
      .select()
      .single();

    if (error) throw error;
    return review;
  } catch (error) {
    console.error('[Marketplace Service] Error adding review:', error);
    throw error;
  }
}

/**
 * Award Market Shares to early buyers or through relay chains
 */
async function awardMarketShares(orderId, userId) {
  if (!supabase) return;

  try {
    // 1. Get order items
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (!items || items.length === 0) return;

    for (const item of items) {
      // 3. Early Buyer Reward (First 10 distinct buyers)
      const { count } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', item.product_id);

      if ((count || 0) <= 10) {
        await supabase.rpc('grant_shares', {
          p_user_id: userId,
          p_object_type: 'product',
          p_object_id: item.product_id,
          p_amount: 100,
          p_price: 0
        });
      }

      // 4. Relay/Promoter Reward
      if (order && order.relay_id) {
        // Find the relayer
        const { data: relay } = await supabase
          .from('relays')
          .select('relayer_user_id')
          .eq('id', order.relay_id)
          .single();

        if (relay && relay.relayer_user_id) {
          // Grant shares to the promoter
          await supabase.rpc('grant_shares', {
            p_user_id: relay.relayer_user_id,
            p_object_type: 'product',
            p_object_id: item.product_id,
            p_amount: 50, // 50 shares for driving a sale
            p_price: 0
          });

          // Also track engagement completion on the relay
          await supabase
            .from('relays')
            .update({
              downstream_completion_count: supabase.raw('downstream_completion_count + 1')
            })
            .eq('id', order.relay_id);
        }
      }
    }
  } catch (err) {
    console.error('[Marketplace Service] awardMarketShares failed:', err);
  }
}

module.exports = {
  createStore,
  getStore,
  createProduct,
  getProducts,
  getCategories,
  getProduct,
  addToCart,
  getCart,
  createOrder,
  processPayment,
  addReview,
};
