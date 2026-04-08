const { supabase } = require('../config/supabase');

/**
 * Moment-Product Integration Service
 * Handles linking merchant products to Moments and managing moment-exclusive products
 */

/**
 * Link a product to a moment
 * @param {string} productId - Product ID
 * @param {string} momentId - Moment ID
 * @param {object} options - Linking options
 * @returns {object} Updated product
 */
async function linkProductToMoment(productId, momentId, options = {}) {
    const {
        visibility = 'moment_participants',
        momentExclusive = true,
        autoRedeemOnParticipation = false
    } = options;

    try {
        // Verify moment exists
        const { data: moment, error: momentError } = await supabase
            .from('moments')
            .select('id, organizer_id')
            .eq('id', momentId)
            .single();

        if (momentError) throw new Error('Moment not found');

        // Verify product exists and get merchant
        const { data: product, error: productError } = await supabase
            .from('merchant_products')
            .select('id, merchant_id')
            .eq('id', productId)
            .single();

        if (productError) throw new Error('Product not found');

        // Update product with moment link
        const { data, error } = await supabase
            .from('merchant_products')
            .update({
                linked_moment_id: momentId,
                visibility,
                moment_exclusive: momentExclusive,
                auto_redeem_on_participation: autoRedeemOnParticipation,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error linking product to moment:', error);
        throw error;
    }
}

/**
 * Unlink a product from a moment
 * @param {string} productId - Product ID
 * @returns {object} Updated product
 */
async function unlinkProductFromMoment(productId) {
    try {
        const { data, error } = await supabase
            .from('merchant_products')
            .update({
                linked_moment_id: null,
                visibility: 'public',
                moment_exclusive: false,
                auto_redeem_on_participation: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error unlinking product from moment:', error);
        throw error;
    }
}

/**
 * Get all products linked to a moment
 * @param {string} momentId - Moment ID
 * @returns {array} Products linked to moment
 */
async function getMomentProducts(momentId) {
    try {
        const { data, error } = await supabase
            .from('merchant_products')
            .select(`
        *,
        venues (
          name,
          address,
          city,
          state
        )
      `)
            .eq('linked_moment_id', momentId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching moment products:', error);
        throw error;
    }
}

/**
 * Check if a user has access to a moment-exclusive product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {object} Access status and reason
 */
async function checkMomentProductAccess(userId, productId) {
    try {
        // Get product details
        const { data: product, error: productError } = await supabase
            .from('merchant_products')
            .select('id, visibility, moment_exclusive, linked_moment_id')
            .eq('id', productId)
            .single();

        if (productError) throw new Error('Product not found');

        // Public products are always accessible
        if (product.visibility === 'public' && !product.moment_exclusive) {
            return { hasAccess: true, reason: 'public' };
        }

        // Check if user participated in linked moment
        if (product.linked_moment_id) {
            const { data: redemption, error: redemptionError } = await supabase
                .from('redemptions')
                .select('id, validated_at')
                .eq('user_id', userId)
                .eq('moment_id', product.linked_moment_id)
                .not('validated_at', 'is', null)
                .single();

            if (!redemptionError && redemption) {
                return { hasAccess: true, reason: 'moment_participant' };
            }
        }

        // No access
        return {
            hasAccess: false,
            reason: 'not_participant',
            message: 'This product is exclusive to moment participants'
        };
    } catch (error) {
        console.error('Error checking product access:', error);
        throw error;
    }
}

/**
 * Auto-create redemption from entitlement
 * @param {string} entitlementId - Entitlement ID
 * @param {string} userId - User ID
 * @returns {object} Created sale with redemption code
 */
async function createRedemptionFromEntitlement(entitlementId, userId) {
    try {
        // Get entitlement details
        const { data: entitlement, error: entitlementError } = await supabase
            .from('entitlements')
            .select(`
        id,
        merchant_product_id,
        redemption_sale_id,
        merchant_products (
          id,
          name,
          merchant_id
        )
      `)
            .eq('id', entitlementId)
            .eq('user_id', userId)
            .single();

        if (entitlementError) throw new Error('Entitlement not found');
        if (!entitlement.merchant_product_id) throw new Error('Entitlement not linked to product');
        if (entitlement.redemption_sale_id) throw new Error('Redemption already created');

        // Generate redemption code
        const redemptionCode = generateRedemptionCode();

        // Create product sale
        const { data: sale, error: saleError } = await supabase
            .from('product_sales')
            .insert({
                product_id: entitlement.merchant_product_id,
                user_id: userId,
                merchant_id: entitlement.merchant_products.merchant_id,
                sale_type: 'redemption',
                amount_paid: 0,
                points_paid: 0,
                redemption_code: redemptionCode,
                status: 'pending'
            })
            .select()
            .single();

        if (saleError) throw saleError;

        // Update entitlement with sale reference
        await supabase
            .from('entitlements')
            .update({
                redemption_created_at: new Date().toISOString(),
                redemption_sale_id: sale.id
            })
            .eq('id', entitlementId);

        return {
            ...sale,
            product_name: entitlement.merchant_products.name
        };
    } catch (error) {
        console.error('Error creating redemption from entitlement:', error);
        throw error;
    }
}

/**
 * Distribute escrow to users as product entitlements
 * @param {string} escrowPoolId - Escrow pool ID
 * @param {string} productId - Product ID to distribute
 * @param {number} quantityPerUser - Number of products per user
 * @returns {object} Distribution results
 */
async function distributeEscrowAsProducts(escrowPoolId, productId, quantityPerUser = 1) {
    try {
        // Call database function
        const { data, error } = await supabase
            .rpc('distribute_escrow_to_products', {
                p_escrow_pool_id: escrowPoolId,
                p_product_id: productId,
                p_quantity_per_user: quantityPerUser
            });

        if (error) throw error;

        return {
            success: true,
            distributions: data,
            totalUsers: data.length,
            totalEntitlements: data.reduce((sum, d) => sum + d.entitlements_created, 0),
            totalValue: data.reduce((sum, d) => sum + parseFloat(d.total_value), 0)
        };
    } catch (error) {
        console.error('Error distributing escrow as products:', error);
        throw error;
    }
}

/**
 * Generate unique redemption code (8 chars: 3 letters + 5 numbers)
 * @returns {string} Redemption code
 */
function generateRedemptionCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let code = '';
    for (let i = 0; i < 3; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 5; i++) {
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return code;
}

module.exports = {
    linkProductToMoment,
    unlinkProductFromMoment,
    getMomentProducts,
    checkMomentProductAccess,
    createRedemptionFromEntitlement,
    distributeEscrowAsProducts
};
