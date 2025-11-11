/**
 * PROMORANG MARKETPLACE SERVICE
 * Comprehensive e-commerce service for stores, products, orders
 * Handles multi-currency payments and inventory management
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const { trackProductSale } = require('../utils/referralTracker');

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

    // Create store
    const { data: store, error } = await supabase
      .from('merchant_stores')
      .insert({
        user_id: userId,
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

    if (error) throw error;

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
        merchant_stores!products_store_id_fkey(store_name, store_slug, logo_url),
        product_categories(name, slug)
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

    return {
      products: data || [],
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

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: userId,
        store_id,
        payment_method,
        payment_status: 'pending',
        subtotal_usd,
        subtotal_gems,
        subtotal_gold,
        total_usd: subtotal_usd,
        total_gems: subtotal_gems,
        total_gold: subtotal_gold,
        shipping_address,
        customer_notes,
        status: 'pending',
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

    // Track referral commission
    if (order.total_usd > 0) {
      await trackProductSale(userId, order.total_usd, orderId);
    }

    return updatedOrder;
  } catch (error) {
    console.error('[Marketplace Service] Error processing payment:', error);
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

module.exports = {
  createStore,
  getStore,
  createProduct,
  getProducts,
  getCategories,
  addToCart,
  getCart,
  createOrder,
  processPayment,
  addReview,
};
