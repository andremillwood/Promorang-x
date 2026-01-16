/**
 * PROMORANG COUPON SERVICE
 * Comprehensive coupon validation, application, and tracking
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Validate a coupon code
 */
async function validateCoupon(code, userId, cartTotal = {}, context = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Get coupon with advertiser/campaign context
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select(`
        *,
        advertiser_campaigns(id, name, status)
      `)
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return {
        valid: false,
        error: 'Invalid coupon code',
      };
    }

    // Check campaign-specific conditions
    if (coupon.campaign_id && context.campaign_id && coupon.campaign_id !== context.campaign_id) {
      return {
        valid: false,
        error: 'This coupon is only valid for a specific campaign',
      };
    }

    // Check drop-specific conditions
    if (coupon.drop_id && context.drop_id && coupon.drop_id !== context.drop_id) {
      return {
        valid: false,
        error: 'This coupon is only valid for a specific drop',
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
async function trackCouponUsage(couponId, userId, orderId, discount, originalTotal, finalTotal, context = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Record usage with campaign/drop context
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
        campaign_id: context.campaign_id || null,
        drop_id: context.drop_id || null,
        source: context.source || 'marketplace',
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
 * Create a new coupon (merchant/admin/advertiser)
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
    campaign_id,
    drop_id,
    source_type = 'merchant',
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
    advertiser_account_id,
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

    // Verify advertiser account permission if provided
    if (advertiser_account_id) {
      const advertiserTeamService = require('./advertiserTeamService');
      const hasPermission = await advertiserTeamService.checkPermission(
        userId,
        advertiser_account_id,
        'edit_coupons'
      );
      if (!hasPermission) {
        throw new Error('Not authorized to create coupons for this advertiser account');
      }
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        name,
        description,
        store_id,
        campaign_id,
        drop_id,
        source_type,
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
        advertiser_account_id,
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
    // Verify ownership/permission
    const { data: coupon } = await supabase
      .from('coupons')
      .select('created_by, store_id, advertiser_account_id, merchant_stores(user_id)')
      .eq('id', couponId)
      .single();

    if (!coupon) throw new Error('Coupon not found');

    let isAuthorized = coupon.created_by === userId || coupon.merchant_stores?.user_id === userId;

    if (!isAuthorized && coupon.advertiser_account_id) {
      const advertiserTeamService = require('./advertiserTeamService');
      isAuthorized = await advertiserTeamService.checkPermission(
        userId,
        coupon.advertiser_account_id,
        'edit_coupons'
      );
    }

    if (!isAuthorized) {
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
    // Verify ownership/permission
    const { data: coupon } = await supabase
      .from('coupons')
      .select('created_by, store_id, advertiser_account_id, merchant_stores(user_id)')
      .eq('id', couponId)
      .single();

    if (!coupon) throw new Error('Coupon not found');

    let isAuthorized = coupon.created_by === userId || coupon.merchant_stores?.user_id === userId;

    if (!isAuthorized && coupon.advertiser_account_id) {
      const advertiserTeamService = require('./advertiserTeamService');
      isAuthorized = await advertiserTeamService.checkPermission(
        userId,
        coupon.advertiser_account_id,
        'edit_coupons'
      );
    }

    if (!isAuthorized) {
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

/**
 * Get coupons for a campaign
 */
async function getCampaignCoupons(campaignId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*, coupon_usage(count)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Coupon Service] Error getting campaign coupons:', error);
    throw error;
  }
}

/**
 * Get coupons for a drop
 */
async function getDropCoupons(dropId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*, coupon_usage(count)')
      .eq('drop_id', dropId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Coupon Service] Error getting drop coupons:', error);
    throw error;
  }
}

/**
 * Create coupon from advertiser campaign
 */
async function createCampaignCoupon(userId, campaignId, couponData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Verify user has permission for the campaign's account
    const { data: campaign } = await supabase
      .from('advertiser_campaigns')
      .select('advertiser_account_id')
      .eq('id', campaignId)
      .single();

    if (!campaign) throw new Error('Campaign not found');

    const advertiserTeamService = require('./advertiserTeamService');
    const hasPermission = await advertiserTeamService.checkPermission(
      userId,
      campaign.advertiser_account_id,
      'edit_coupons'
    );

    if (!hasPermission) {
      throw new Error('Not authorized to create coupons for this campaign');
    }

    return await createCoupon(userId, {
      ...couponData,
      campaign_id: campaignId,
      advertiser_account_id: campaign.advertiser_account_id,
      source_type: 'advertiser',
    });
  } catch (error) {
    console.error('[Coupon Service] Error creating campaign coupon:', error);
    throw error;
  }
}

/**
 * Create coupon for a drop
 */
async function createDropCoupon(userId, dropId, couponData) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // Verify user has permission for the drop's account
    const { data: drop } = await supabase
      .from('drops')
      .select('advertiser_account_id')
      .eq('id', dropId)
      .single();

    if (!drop) throw new Error('Drop not found');

    const advertiserTeamService = require('./advertiserTeamService');
    const hasPermission = await advertiserTeamService.checkPermission(
      userId,
      drop.advertiser_account_id,
      'edit_coupons'
    );

    if (!hasPermission) {
      throw new Error('Not authorized to create coupons for this drop');
    }

    return await createCoupon(userId, {
      ...couponData,
      drop_id: dropId,
      advertiser_account_id: drop.advertiser_account_id,
      source_type: 'advertiser',
    });
  } catch (error) {
    console.error('[Coupon Service] Error creating drop coupon:', error);
    throw error;
  }
}

/**
 * Get unified coupon analytics (marketplace + advertiser)
 */
async function getUnifiedCouponAnalytics(filters = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    let query = supabase
      .from('coupon_analytics')
      .select('*')
      .order('total_redemptions', { ascending: false });

    if (filters.source_type) {
      query = query.eq('source_type', filters.source_type);
    }

    if (filters.campaign_id) {
      query = query.eq('campaign_id', filters.campaign_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Coupon Service] Error getting unified analytics:', error);
    throw error;
  }
}

/**
 * List public coupons
 */
async function listPublicCoupons({ limit = 20, offset = 0, category } = {}) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    let query = supabase
      .from('coupons')
      .select('id, title, description, value, value_unit, expires_at, store_id, merchant_stores(store_name, logo_url)')
      .eq('is_active', true)
      .eq('is_public', true)
      .gt('quantity_remaining', 0)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      // Assuming category filtering logic if needed, for now just basic list
      // query = query.contains('category_ids', [category]); 
    }

    const { data, error } = await query;

    if (error) throw error;
    return { coupons: data || [] };
  } catch (error) {
    console.error('[Coupon Service] Error listing public coupons:', error);
    throw error;
  }
}

/**
 * Get public coupon details
 */
async function getPublicCoupon(id) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('id, title, description, value, value_unit, expires_at, store_id, merchant_stores(store_name, logo_url, description), conditions, redemption_type, redemption_instructions')
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_public', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Coupon Service] Error getting public coupon:', error);
    throw error;
  }
}

/**
 * Redeem/Claim a coupon for a user
 */
async function redeemCoupon(userId, couponId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // 1. Get coupon and check validity
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single();

    if (couponError || !coupon) throw new Error('Coupon not found');
    if (!coupon.is_active) throw new Error('Coupon is not active');

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      throw new Error('Coupon has expired');
    }

    // Check max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      throw new Error('Coupon has reached its usage limit');
    }

    // Check if user already claimed it (if capped per user)
    if (coupon.max_uses_per_user) {
      const { count } = await supabase
        .from('coupon_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', couponId)
        .eq('user_id', userId)
        .in('status', ['claimed', 'redeemed']);

      if (count >= coupon.max_uses_per_user) {
        throw new Error('You have already claimed this coupon the maximum number of times');
      }
    }

    // 2. Generate unique claim code
    const claimCode = `RED-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // 3. Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('coupon_redemptions')
      .insert({
        coupon_id: couponId,
        user_id: userId,
        claim_code: claimCode,
        status: 'claimed',
        expires_at: coupon.expires_at,
        metadata: {
          claimed_via: 'web_app',
          original_coupon_code: coupon.code
        }
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // 4. Increment coupon usage if it's auto-redeem or just tracking claims
    // For standalone, we usually increment on actual validation, but we can track claims too

    return redemption;
  } catch (error) {
    console.error('[Coupon Service] Error redeeming coupon:', error);
    throw error;
  }
}

/**
 * Validate a redemption (Merchant side)
 */
async function validateRedemption(merchantUserId, claimCodeOrId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    // 1. Find the redemption
    let query = supabase
      .from('coupon_redemptions')
      .select('*, coupons(*, merchant_stores(id, user_id, store_name))');

    if (claimCodeOrId.includes('-')) {
      query = query.eq('claim_code', claimCodeOrId.toUpperCase());
    } else {
      query = query.eq('id', claimCodeOrId);
    }

    const { data: redemption, error } = await query.single();

    if (error || !redemption) throw new Error('Redemption record not found');
    if (redemption.status !== 'claimed') throw new Error(`Coupon is already ${redemption.status}`);

    // Check expiry
    if (redemption.expires_at && new Date(redemption.expires_at) < new Date()) {
      // Auto-expire it
      await supabase.from('coupon_redemptions').update({ status: 'expired' }).eq('id', redemption.id);
      throw new Error('Coupon has expired');
    }

    // 2. Verify merchant authorization
    const store = redemption.coupons?.merchant_stores;
    if (!store || store.user_id !== merchantUserId) {
      throw new Error('You are not authorized to validate coupons for this store');
    }

    // 3. Mark as redeemed
    const { data: updated, error: updateError } = await supabase
      .from('coupon_redemptions')
      .update({
        status: 'redeemed',
        redeemed_at: new Date(),
        validated_by_user_id: merchantUserId,
        validation_method: 'code_entry' // Default, caller can specify QR
      })
      .eq('id', redemption.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Increment parent coupon usage count
    await supabase.rpc('increment_coupon_usage', { coupon_id: redemption.coupon_id });

    return updated;
  } catch (error) {
    console.error('[Coupon Service] Error validating redemption:', error);
    throw error;
  }
}

/**
 * Get redemptions for a user
 */
async function getUserRedemptions(userId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('coupon_redemptions')
      .select(`
        *,
        coupons(id, code, name, description, discount_type, discount_value, expires_at, store_id, merchant_stores(store_name, logo_url))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Coupon Service] Error getting user redemptions:', error);
    throw error;
  }
}

/**
 * Get redemptions for a merchant
 */
async function getMerchantRedemptions(merchantUserId) {
  if (!supabase) {
    throw new Error('Database not available');
  }

  try {
    const { data, error } = await supabase
      .from('coupon_redemptions')
      .select(`
        *,
        users(id, username, display_name, profile_image),
        coupons!inner(id, name, code, store_id, merchant_stores!inner(user_id))
      `)
      .eq('coupons.merchant_stores.user_id', merchantUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Coupon Service] Error getting merchant redemptions:', error);
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
  getCampaignCoupons,
  getDropCoupons,
  createCampaignCoupon,
  createDropCoupon,
  getUnifiedCouponAnalytics,
  listPublicCoupons,
  getPublicCoupon,
  redeemCoupon,
  validateRedemption,
  getUserRedemptions,
  getMerchantRedemptions,
};
