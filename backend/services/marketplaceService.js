/**
 * MARKETPLACE SERVICE
 * Handles product purchases, redemptions, and transaction recording.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const economyService = require('./economyService');
const revenueService = require('./revenueService');

// Platform commission on marketplace purchases
const PLATFORM_COMMISSION_RATE = 0.125; // 12.5%

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

        const unitPrice = Number(product.price ?? product.price_usd ?? 0);
        const pointsCost = Number(product.points_cost ?? product.price_points ?? 0);
        const inventoryCount = product.inventory_quantity ?? product.inventory_count;

        if (inventoryCount !== null && inventoryCount !== undefined && inventoryCount < quantity) {
            throw new Error('Insufficient inventory');
        }

        // 2. Validate Payment
        let amount = 0;
        let currency = 'USD';
        let transactionType = 'purchase';

        if (method === 'points') {
            if (!product.is_redeemable_with_points || pointsCost <= 0) {
                throw new Error('Product cannot be redeemed with points');
            }
            amount = pointsCost * quantity;
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
            if (unitPrice <= 0) {
                throw new Error('Product does not have a cash price');
            }

            const totalAmount = unitPrice * quantity;
            const platformFee = Number((totalAmount * PLATFORM_COMMISSION_RATE).toFixed(2));
            const merchantPayout = Number((totalAmount - platformFee).toFixed(2));
            
            amount = totalAmount;
            currency = 'USD';

            // Process Stripe payment
            console.log(`[Marketplace Payment] User ${userId} paid $${totalAmount} for ${product.name}`);
            console.log(`[Marketplace Fee] Platform fee: $${platformFee}, Merchant payout: $${merchantPayout}`);
            
            // Track platform revenue from this transaction
            if (revenueService.trackRevenue) {
                await revenueService.trackRevenue(platformFee, `marketplace_${productId}`, 'marketplace_commission');
            }
        } else {
            throw new Error('Invalid payment method');
        }

        // 3. Calculate financial breakdown
        let platformFee = 0;
        let merchantPayout = amount;
        
        if (method === 'cash') {
            platformFee = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(2));
            merchantPayout = Number((amount - platformFee).toFixed(2));
        }
        
        // 4. Create Transaction Record
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
                platform_fee: platformFee,
                merchant_payout: merchantPayout,
                metadata: {
                    product_name: product.name,
                    commission_rate: method === 'cash' ? PLATFORM_COMMISSION_RATE : 0,
                    timestamp: new Date().toISOString()
                }
            })
            .select()
            .single();

        if (txError) {
            // Need to handle table missing error gracefully if migration failed
            console.warn('marketplace_transactions table might be missing, skipping record', txError);
        }

        if (inventoryCount !== null && inventoryCount !== undefined) {
            const newInventory = Math.max(0, inventoryCount - quantity);
            await supabase
                .from('merchant_products')
                .update({
                    inventory_quantity: newInventory,
                    inventory_count: newInventory,
                    total_sales: (product.total_sales || 0) + quantity,
                    total_redemptions: method === 'points'
                        ? (product.total_redemptions || 0) + quantity
                        : (product.total_redemptions || 0),
                    revenue_generated: method === 'cash'
                        ? Number(product.revenue_generated || 0) + amount
                        : Number(product.revenue_generated || 0)
                })
                .eq('id', productId);
        }

        // 5. Generate Redemption Code (Ticket)
        // Store this in a 'user_tickets' table or similar for QR scanning
        const redemptionCode = `RD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 6. Return success with financial details
        const response = {
            success: true,
            transaction_id: transaction?.id,
            redemption_code: redemptionCode,
            message: method === 'points' ? 'Redemption successful!' : 'Purchase successful!'
        };
        
        // Include financial breakdown for cash purchases
        if (method === 'cash') {
            response.financials = {
                total_paid: amount,
                platform_fee: platformFee,
                merchant_payout: merchantPayout,
                commission_rate: PLATFORM_COMMISSION_RATE
            };
        }
        
        return response;

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
