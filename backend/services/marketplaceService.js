/**
 * MARKETPLACE SERVICE
 * Handles product purchases, redemptions, and transaction recording.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const economyService = require('./economyService');

/**
 * Process a purchase
 * @param {string} userId - UUID of the buyer
 * @param {string} productId - UUID of the product
 * @param {string} method - 'points' or 'cash'
 * @param {string} quantity - Quantity to buy (default 1)
 */
async function processPurchase(userId, productId, method, quantity = 1) {
    if (!supabase) throw new Error('Database not available');

    try {
        // 1. Fetch Product
        const { data: product, error: prodError } = await supabase
            .from('merchant_products')
            .select('*')
            .eq('id', productId)
            .single();

        if (prodError || !product) throw new Error('Product not found');
        if (!product.is_active) throw new Error('Product is not active');

        // 2. Validate Payment
        let amount = 0;
        let currency = 'USD';
        let transactionType = 'purchase';

        if (method === 'points') {
            if (!product.is_redeemable_with_points) {
                throw new Error('Product cannot be redeemed with points');
            }
            amount = product.points_cost * quantity;
            currency = 'points';

            // Check Balance & Deduct
            // economyService.spendCurrency throws if insufficient balance
            await economyService.spendCurrency(
                userId,
                'points',
                amount,
                'marketplace_redemption',
                productId,
                `Redeemed ${product.name} x${quantity}`
            );

        } else if (method === 'cash') {
            amount = product.price * quantity;
            currency = 'USD';

            // MOCK STRIPE CHARGE
            // In a real implementation, we would verify the PaymentIntent here
            // For now, we assume frontend passed a mock success signal or we auto-approve
            console.log(`[MockPayment] Charged User ${userId} $${amount} for ${product.name}`);
        } else {
            throw new Error('Invalid payment method');
        }

        // 3. Create Transaction Record
        const { data: transaction, error: txError } = await supabase
            .from('marketplace_transactions')
            .insert({
                user_id: userId,
                product_id: productId,
                merchant_id: product.merchant_id,
                amount: amount,
                currency: currency,
                quantity: quantity,
                status: 'completed',
                payment_method: method,
                metadata: {
                    product_name: product.name,
                    timestamp: new Date().toISOString()
                }
            })
            .select()
            .single();

        if (txError) {
            // Need to handle table missing error gracefully if migration failed
            console.warn('marketplace_transactions table might be missing, skipping record', txError);
        }

        // 4. Generate Redemption Code (Ticket)
        // Store this in a 'user_tickets' table or similar for QR scanning
        const redemptionCode = `RD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Return success
        return {
            success: true,
            transaction_id: transaction?.id,
            redemption_code: redemptionCode,
            message: method === 'points' ? 'Redemption successful!' : 'Purchase successful!'
        };

    } catch (error) {
        console.error('[MarketplaceService] Purchase error:', error);
        throw error;
    }
}

/**
 * Get user's purchase history
 */
async function getPurchaseHistory(userId) {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('marketplace_transactions')
        .select(`
            *,
            product:product_id (name, images)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data;
}

module.exports = {
    processPurchase,
    getPurchaseHistory
};
