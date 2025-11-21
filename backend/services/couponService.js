/**
 * PROMORANG COUPON SERVICE
 * Comprehensive coupon validation, application, and tracking
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Validate a coupon code
 */
async function validateCoupon(code, userId, cartTotal = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Get coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return {
        valid: false,
        error: 'Invalid coupon code',
      };
    }

    // Check if active
    if (!coupon.is_active) {
      return {
        valid: false,
        error: 'This coupon is no longer active',
      };
    }

    // Check expiry
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return {
        valid: false,
        error: 'This coupon is not yet valid',
      };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return {
        valid: false,
        error: 'This coupon has expired',
      };
    }

    // Check max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return {
        valid: false,
        error: 'This coupon has reached its usage limit',
      };
    }

    // Check user usage
    if (coupon.max_uses_per_user) {
      const { count } = await supabase
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId);

      if (count >= coupon.max_uses_per_user) {
        return {
          valid: false,
          error: 'You have already used this coupon the maximum number of times',
        };
      }
    }

    // Check minimum purchase
    if (coupon.min_purchase_usd && cartTotal.usd < coupon.min_purchase_usd) {
      return {
        valid: false,
        error: `Minimum purchase of $${coupon.min_purchase_usd.toFixed(2)} required`,
      };
    }

    if (coupon.min_purchase_gems && cartTotal.gems < coupon.min_purchase_gems) {
      return {
        valid: false,
        error: `Minimum purchase of ${coupon.min_purchase_gems} gems required`,
      };
    }

    return {
      valid: true,
      coupon,
    };
  } catch (error) {
    console.error('[Coupon Service] Error validating coupon:', error);
    throw error;
  }
}

/**
 * Calculate discount amount based on coupon
 */
function calculateDiscount(coupon, cartTotal) {
  const discount = {
    usd: 0,
    gems: 0,
    gold: 0,
  };

  switch (coupon.discount_type) {
    case 'percentage':
      if (cartTotal.usd > 0) {
        discount.usd = (cartTotal.usd * coupon.discount_value) / 100;
        // Apply max discount cap if set
        if (coupon.max_discount_usd && discount.usd > coupon.max_discount_usd) {
          discount.usd = coupon.max_discount_usd;
        }
      }
      if (cartTotal.gems > 0) {
        discount.gems = Math.floor((cartTotal.gems * coupon.discount_value) / 100);
      }
      if (cartTotal.gold > 0) {
        discount.gold = Math.floor((cartTotal.gold * coupon.discount_value) / 100);
      }
      break;

    case 'fixed_usd':
      discount.usd = Math.min(coupon.discount_value, cartTotal.usd);
      break;

    case 'fixed_gems':
      discount.gems = Math.min(coupon.discount_value, cartTotal.gems);
      break;

    case 'fixed_gold':
      discount.gold = Math.min(coupon.discount_value, cartTotal.gold);
      break;

    case 'free_shipping':
      // Handled separately in order processing
      discount.shipping = true;
      break;

    default:
      break;
  }

  return discount;
}

/**
 * Apply coupon to order
 */
async function applyCoupon(code, userId, orderData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Calculate cart total
    const cartTotal = {
      usd: orderData.subtotal_usd || 0,
      gems: orderData.subtotal_gems || 0,
      gold: orderData.subtotal_gold || 0,
    };

    // Validate coupon
    const validation = await validateCoupon(code, userId, cartTotal);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const { coupon } = validation;

    // Calculate discount
    const discount = calculateDiscount(coupon, cartTotal);

    // Apply discount to totals
    const discountedTotal = {
      usd: Math.max(0, cartTotal.usd - discount.usd),
      gems: Math.max(0, cartTotal.gems - discount.gems),
      gold: Math.max(0, cartTotal.gold - discount.gold),
    };

    return {
      coupon,
      discount,
      original_total: cartTotal,
      final_total: discountedTotal,
    };
  } catch (error) {
    console.error('[Coupon Service] Error applying coupon:', error);
    throw error;
  }
}

/**
 * Track coupon usage
 */
async function trackCouponUsage(couponId, userId, orderId, discount, originalTotal, finalTotal) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Record usage
    await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId,
        discount_amount_usd: discount.usd || 0,
        discount_amount_gems: discount.gems || 0,
        discount_amount_gold: discount.gold || 0,
        original_total_usd: originalTotal.usd || 0,
        final_total_usd: finalTotal.usd || 0,
      });

    // Increment coupon usage count
    await supabase.rpc('increment_coupon_usage', { coupon_id: couponId });

    // If RPC doesn't exist, do it manually
    const { data: coupon } = await supabase
      .from('coupons')
      .select('current_uses')
      .eq('id', couponId)
      .single();

    if (coupon) {
      await supabase
        .from('coupons')
        .update({ current_uses: (coupon.current_uses || 0) + 1 })
        .eq('id', couponId);
    }
  } catch (error) {
    console.error('[Coupon Service] Error tracking coupon usage:', error);
    // Don't throw - usage tracking failure shouldn't block order
  }
}

/**
 * Create a new coupon (merchant/admin only)
 */
async function createCoupon(userId, couponData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  const {
    code,
    name,
    description,
    store_id,
    discount_type,
    discount_value,
    max_discount_usd,
    applies_to,
    product_ids,
    category_ids,
    min_purchase_usd,
    min_purchase_gems,
    max_uses,
    max_uses_per_user,
    starts_at,
    expires_at,
  } = couponData;

  try {
    // Verify user owns the store if store_id provided
    if (store_id) {
      const { data: store } = await supabase
        .from('merchant_stores')
        .select('user_id')
        .eq('id', store_id)
        .single();

      if (!store || store.user_id !== userId) {
        throw new Error('Not authorized to create coupons for this store');
      }
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        name,
        description,
        store_id,
        created_by: userId,
        discount_type,
        discount_value,
        max_discount_usd,
        applies_to: applies_to || 'all',
        product_ids,
        category_ids,
        min_purchase_usd,
        min_purchase_gems,
        max_uses,
        max_uses_per_user: max_uses_per_user || 1,
        starts_at: starts_at || new Date(),
        expires_at,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return coupon;
  } catch (error) {
    console.error('[Coupon Service] Error creating coupon:', error);
    throw error;
  }
}

/**
 * Get coupons for a store
 */
async function getStoreCoupons(storeId, filters = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    let query = supabase
      .from('coupons')
      .select('*, coupon_usage(count)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Coupon Service] Error getting store coupons:', error);
    throw error;
  }
}

/**
 * Update coupon
 */
async function updateCoupon(couponId, userId, updates) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Verify ownership
    const { data: coupon } = await supabase
      .from('coupons')
      .select('created_by, store_id, merchant_stores(user_id)')
      .eq('id', couponId)
      .single();

    if (!coupon || (coupon.created_by !== userId && coupon.merchant_stores?.user_id !== userId)) {
      throw new Error('Not authorized to update this coupon');
    }

    const { data: updated, error } = await supabase
      .from('coupons')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', couponId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } catch (error) {
    console.error('[Coupon Service] Error updating coupon:', error);
    throw error;
  }
}

/**
 * Delete/deactivate coupon
 */
async function deleteCoupon(couponId, userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Verify ownership
    const { data: coupon } = await supabase
      .from('coupons')
      .select('created_by, store_id, merchant_stores(user_id)')
      .eq('id', couponId)
      .single();

    if (!coupon || (coupon.created_by !== userId && coupon.merchant_stores?.user_id !== userId)) {
      throw new Error('Not authorized to delete this coupon');
    }

    // Soft delete by deactivating
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: false, updated_at: new Date() })
      .eq('id', couponId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[Coupon Service] Error deleting coupon:', error);
    throw error;
  }
}

/**
 * Get coupon analytics
 */
async function getCouponAnalytics(couponId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data: coupon } = await supabase
      .from('coupons')
      .select(`
        *,
        coupon_usage(
          discount_amount_usd,
          discount_amount_gems,
          discount_amount_gold,
          used_at
        )
      `)
      .eq('id', couponId)
      .single();

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Calculate analytics
    const usage = coupon.coupon_usage || [];
    const analytics = {
      total_uses: usage.length,
      total_discount_usd: usage.reduce((sum, u) => sum + (u.discount_amount_usd || 0), 0),
      total_discount_gems: usage.reduce((sum, u) => sum + (u.discount_amount_gems || 0), 0),
      total_discount_gold: usage.reduce((sum, u) => sum + (u.discount_amount_gold || 0), 0),
      avg_discount_usd: usage.length > 0 ? usage.reduce((sum, u) => sum + (u.discount_amount_usd || 0), 0) / usage.length : 0,
      usage_by_day: {},
    };

    // Group by day
    usage.forEach(u => {
      const day = new Date(u.used_at).toISOString().split('T')[0];
      analytics.usage_by_day[day] = (analytics.usage_by_day[day] || 0) + 1;
    });

    return {
      coupon,
      analytics,
    };
  } catch (error) {
    console.error('[Coupon Service] Error getting coupon analytics:', error);
    throw error;
  }
}

module.exports = {
  validateCoupon,
  calculateDiscount,
  applyCoupon,
  trackCouponUsage,
  createCoupon,
  getStoreCoupons,
  updateCoupon,
  deleteCoupon,
  getCouponAnalytics,
};
