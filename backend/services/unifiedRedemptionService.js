const { supabase } = require('../lib/supabase');

/**
 * Unified Redemption Service
 * Handles validation of both product redemptions and moment entitlements
 */

/**
 * Validate any redemption code (product or entitlement)
 * @param {string} code - Redemption code
 * @param {string} merchantId - Merchant ID (optional, for validation)
 * @returns {object} Redemption details and validation result
 */
async function validateUnifiedRedemption(code, merchantId = null) {
    try {
        // Query unified redemptions view
        const { data: redemption, error } = await supabase
            .from('unified_redemptions')
            .select('*')
            .eq('redemption_code', code.toUpperCase())
            .single();

        if (error || !redemption) {
            throw new Error('Invalid redemption code');
        }

        // Check if already validated
        if (redemption.status === 'validated') {
            throw new Error('Redemption code already used');
        }

        // Check if expired
        if (redemption.status === 'expired') {
            throw new Error('Redemption code has expired');
        }

        // Verify merchant if provided
        if (merchantId && redemption.merchant_id !== merchantId) {
            throw new Error('This redemption is for a different merchant');
        }

        // Validate based on redemption type
        let validatedRedemption;
        if (redemption.redemption_type === 'product') {
            validatedRedemption = await validateProductRedemption(redemption.sale_id, merchantId);
        } else if (redemption.redemption_type === 'entitlement') {
            validatedRedemption = await validateEntitlementRedemption(code, merchantId);
        }

        return {
            success: true,
            redemption: validatedRedemption,
            type: redemption.redemption_type,
            product_name: redemption.product_name,
            user_id: redemption.user_id,
            validated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error validating unified redemption:', error);
        throw error;
    }
}

/**
 * Validate product sale redemption
 * @param {string} saleId - Product sale ID
 * @param {string} merchantId - Merchant ID
 * @returns {object} Validated sale
 */
async function validateProductRedemption(saleId, merchantId) {
    try {
        const { data, error } = await supabase
            .from('product_sales')
            .update({
                status: 'validated',
                validated_at: new Date().toISOString(),
                validated_by: merchantId
            })
            .eq('id', saleId)
            .select(`
        *,
        merchant_products (
          name,
          description,
          image_url
        )
      `)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error validating product redemption:', error);
        throw error;
    }
}

/**
 * Validate entitlement redemption
 * @param {string} code - Redemption code
 * @param {string} merchantId - Merchant ID
 * @returns {object} Validated redemption
 */
async function validateEntitlementRedemption(code, merchantId) {
    try {
        // Find redemption by code
        const { data: redemption, error: findError } = await supabase
            .from('redemptions')
            .select(`
        *,
        entitlements (
          merchant_product_id,
          merchant_products (
            name,
            description,
            image_url,
            merchant_id
          )
        )
      `)
            .eq('code', code.toUpperCase())
            .single();

        if (findError) throw new Error('Redemption not found');

        // Verify merchant
        if (merchantId && redemption.entitlements.merchant_products.merchant_id !== merchantId) {
            throw new Error('Unauthorized merchant');
        }

        // Update redemption
        const { data, error } = await supabase
            .from('redemptions')
            .update({
                validated_at: new Date().toISOString(),
                validated_by: merchantId
            })
            .eq('id', redemption.id)
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            product: redemption.entitlements.merchant_products
        };
    } catch (error) {
        console.error('Error validating entitlement redemption:', error);
        throw error;
    }
}

/**
 * Get redemption details by code (without validating)
 * @param {string} code - Redemption code
 * @returns {object} Redemption details
 */
async function getRedemptionByCode(code) {
    try {
        const { data, error } = await supabase
            .from('unified_redemptions')
            .select('*')
            .eq('redemption_code', code.toUpperCase())
            .single();

        if (error) throw new Error('Redemption not found');
        return data;
    } catch (error) {
        console.error('Error fetching redemption:', error);
        throw error;
    }
}

/**
 * Get all redemptions for a user
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters
 * @returns {array} User's redemptions
 */
async function getUserRedemptions(userId, filters = {}) {
    const { status, type, limit = 50 } = filters;

    try {
        let query = supabase
            .from('unified_redemptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq('status', status);
        }

        if (type) {
            query = query.eq('redemption_type', type);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching user redemptions:', error);
        throw error;
    }
}

/**
 * Get all redemptions for a merchant
 * @param {string} merchantId - Merchant ID
 * @param {object} filters - Optional filters
 * @returns {array} Merchant's redemptions
 */
async function getMerchantRedemptions(merchantId, filters = {}) {
    const { status, startDate, endDate, limit = 100 } = filters;

    try {
        let query = supabase
            .from('unified_redemptions')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq('status', status);
        }

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching merchant redemptions:', error);
        throw error;
    }
}

/**
 * Get redemption statistics
 * @param {string} merchantId - Merchant ID (optional)
 * @param {object} dateRange - Date range filter
 * @returns {object} Redemption statistics
 */
async function getRedemptionStats(merchantId = null, dateRange = {}) {
    try {
        let query = supabase
            .from('unified_redemptions')
            .select('*');

        if (merchantId) {
            query = query.eq('merchant_id', merchantId);
        }

        if (dateRange.startDate) {
            query = query.gte('created_at', dateRange.startDate);
        }

        if (dateRange.endDate) {
            query = query.lte('created_at', dateRange.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        const stats = {
            total: data.length,
            pending: data.filter(r => r.status === 'pending').length,
            validated: data.filter(r => r.status === 'validated').length,
            expired: data.filter(r => r.status === 'expired').length,
            byType: {
                product: data.filter(r => r.redemption_type === 'product').length,
                entitlement: data.filter(r => r.redemption_type === 'entitlement').length
            },
            validationRate: data.length > 0
                ? (data.filter(r => r.status === 'validated').length / data.length * 100).toFixed(2)
                : 0
        };

        return stats;
    } catch (error) {
        console.error('Error calculating redemption stats:', error);
        throw error;
    }
}

module.exports = {
    validateUnifiedRedemption,
    validateProductRedemption,
    validateEntitlementRedemption,
    getRedemptionByCode,
    getUserRedemptions,
    getMerchantRedemptions,
    getRedemptionStats
};
