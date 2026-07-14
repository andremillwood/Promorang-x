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

const generateRedemptionCode = () => `RD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
            // Cash orders must only be completed by a verified Stripe webhook.
            // The previous implementation logged a payment without charging a card.
            throw new Error('Cash checkout must be completed through Stripe before order fulfillment');
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
        const redemptionCode = generateRedemptionCode();

        await supabase.from('commerce_receipts').insert({
            user_id: userId,
            merchant_id: product.merchant_id,
            listing_id: productId,
            sale_id: transaction?.id || null,
            receipt_type: 'purchase',
            status: 'issued',
            amount,
            currency,
            redemption_code: redemptionCode,
            attribution: { source: 'marketplace', payment_method: method, quantity },
        }).catch(() => undefined);

        // 6. Return success with financial details
        const response = {
            success: true,
            transaction_id: transaction?.id,
            redemption_code: redemptionCode,
            message: method === 'points' ? 'Redemption successful!' : 'Purchase successful!'
        };

        const revenueFunnels = require('./revenueFunnelService');
        await revenueFunnels.record({
            userId,
            funnel: 'marketplace',
            stage: 'fulfilled',
            entityType: 'marketplace_transaction',
            entityId: transaction?.id || productId,
            amount,
            currency,
            idempotencyKey: transaction?.id ? `marketplace:${transaction.id}:fulfilled` : null,
            metadata: { product_id: productId, quantity, payment_method: method },
        });
        
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

async function createStripeCommerceIntent({ userId, productId, quantity = 1 }) {
    if (!supabase) throw new Error('Database not available');
    const stripeService = require('./stripeService');
    if (!stripeService.isStripeConfigured()) throw new Error('Stripe is not configured');

    const qty = Math.max(1, Number(quantity || 1));
    const { data: product, error } = await supabase
        .from('merchant_products')
        .select('*')
        .eq('id', productId)
        .single();

    if (error || !product) throw new Error('Product not found');
    if (!product.is_active) throw new Error('Product is not active');

    const inventoryCount = product.inventory_quantity ?? product.inventory_count;
    if (inventoryCount !== null && inventoryCount !== undefined && inventoryCount < qty) {
        throw new Error('Insufficient inventory');
    }

    const unitPrice = Number(product.price ?? product.price_usd ?? 0);
    if (unitPrice <= 0) throw new Error('This listing does not have a cash price');

    const amount = Number((unitPrice * qty).toFixed(2));
    return stripeService.createPaymentIntent(userId, amount, product.currency || 'usd', {
        commerce_flow: 'merchant_product_purchase',
        product_id: productId,
        merchant_id: product.merchant_id,
        quantity: String(qty),
        unit_price: String(unitPrice),
    });
}

async function finalizeStripePurchase(paymentIntent) {
    if (!supabase) throw new Error('Database not available');
    const metadata = paymentIntent?.metadata || {};
    if (metadata.commerce_flow !== 'merchant_product_purchase') {
        return { handled: false, reason: 'not_commerce_purchase' };
    }

    const productId = metadata.product_id;
    const userId = metadata.user_id;
    const quantity = Math.max(1, Number(metadata.quantity || 1));
    if (!productId || !userId) throw new Error('Commerce payment intent missing product_id or user_id');

    const { data: possibleReceipts } = await supabase
        .from('commerce_receipts')
        .select('id, attribution')
        .eq('user_id', userId)
        .eq('listing_id', productId)
        .eq('receipt_type', 'purchase')
        .order('created_at', { ascending: false })
        .limit(10);
    const existingReceipt = (possibleReceipts || []).find((receipt) => (
        receipt?.attribution?.stripe_payment_intent_id === paymentIntent.id
    ));
    if (existingReceipt?.id) return { handled: true, receipt_id: existingReceipt.id, idempotent: true };

    const { data: product, error: prodError } = await supabase
        .from('merchant_products')
        .select('*')
        .eq('id', productId)
        .single();
    if (prodError || !product) throw new Error('Product not found');

    const amount = Number(((paymentIntent.amount_received || paymentIntent.amount || 0) / 100).toFixed(2));
    const platformFee = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(2));
    const merchantPayout = Number((amount - platformFee).toFixed(2));

    const { data: transaction, error: txError } = await supabase
        .from('marketplace_transactions')
        .insert({
            user_id: userId,
            product_id: productId,
            merchant_id: product.merchant_id,
            amount,
            currency: (paymentIntent.currency || product.currency || 'usd').toUpperCase(),
            quantity,
            status: 'completed',
            payment_method: 'stripe',
            platform_fee: platformFee,
            merchant_payout: merchantPayout,
            metadata: {
                product_name: product.name,
                commission_rate: PLATFORM_COMMISSION_RATE,
                stripe_payment_intent_id: paymentIntent.id,
                payment_status: paymentIntent.status,
                timestamp: new Date().toISOString(),
            },
        })
        .select()
        .single();
    if (txError) throw txError;

    const inventoryCount = product.inventory_quantity ?? product.inventory_count;
    const updates = {
        total_sales: (product.total_sales || 0) + quantity,
        revenue_generated: Number(product.revenue_generated || 0) + amount,
    };
    if (inventoryCount !== null && inventoryCount !== undefined) {
        const newInventory = Math.max(0, inventoryCount - quantity);
        updates.inventory_quantity = newInventory;
        updates.inventory_count = newInventory;
    }
    await supabase.from('merchant_products').update(updates).eq('id', productId);

    const redemptionCode = generateRedemptionCode();
    const { data: receipt, error: receiptError } = await supabase
        .from('commerce_receipts')
        .insert({
            user_id: userId,
            merchant_id: product.merchant_id,
            listing_id: productId,
            sale_id: transaction.id,
            receipt_type: 'purchase',
            status: 'fulfilled',
            amount,
            currency: (paymentIntent.currency || product.currency || 'usd').toUpperCase(),
            redemption_code: redemptionCode,
            attribution: {
                source: 'stripe_commerce',
                quantity,
                stripe_payment_intent_id: paymentIntent.id,
                platform_fee: platformFee,
                merchant_payout: merchantPayout,
            },
        })
        .select()
        .single();
    if (receiptError) throw receiptError;

    const revenueFunnels = require('./revenueFunnelService');
    await revenueFunnels.record({
        userId,
        funnel: 'marketplace',
        stage: 'payment_succeeded',
        entityType: 'marketplace_transaction',
        entityId: transaction.id,
        amount,
        currency: (paymentIntent.currency || 'usd').toUpperCase(),
        provider: 'stripe',
        providerEventId: paymentIntent.id,
        idempotencyKey: `stripe:${paymentIntent.id}:payment_succeeded`,
        metadata: { product_id: productId, quantity, receipt_id: receipt.id },
    });

    return { handled: true, transaction_id: transaction.id, receipt_id: receipt.id, redemption_code: redemptionCode };
}

async function refundCommerceReceipt({ receiptId, actorId = null, reason = 'Admin refund', amount = null }) {
    if (!supabase) throw new Error('Database not available');

    const { data: receipt, error: receiptError } = await supabase
        .from('commerce_receipts')
        .select('*, merchant_products:listing_id(*)')
        .eq('id', receiptId)
        .single();

    if (receiptError || !receipt) throw new Error('Receipt not found');
    if (receipt.status === 'refunded') return { receipt, idempotent: true };

    const attribution = receipt.attribution || {};
    const stripePaymentIntentId = attribution.stripe_payment_intent_id;
    let stripeRefund = null;
    const refundAmount = amount !== null && amount !== undefined
        ? Number(amount)
        : Number(receipt.amount || 0);

    if (stripePaymentIntentId && !attribution.stripe_refund_id && refundAmount > 0) {
        const stripeService = require('./stripeService');
        stripeRefund = await stripeService.createRefund({
            paymentIntentId: stripePaymentIntentId,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
                commerce_receipt_id: receiptId,
                refunded_by: actorId || 'system',
                refund_reason: String(reason || '').slice(0, 450),
            },
        });
    }

    const nextAttribution = {
        ...attribution,
        refund_source: stripePaymentIntentId ? 'stripe' : 'manual_status',
        refund_reason: reason,
        refund_amount: refundAmount,
        refund_at: new Date().toISOString(),
        refund_by: actorId,
        stripe_refund_id: stripeRefund?.id || attribution.stripe_refund_id || null,
        stripe_refund_status: stripeRefund?.status || attribution.stripe_refund_status || null,
    };

    const { data: updatedReceipt, error: updateError } = await supabase
        .from('commerce_receipts')
        .update({
            status: 'refunded',
            attribution: nextAttribution,
        })
        .eq('id', receiptId)
        .select()
        .single();
    if (updateError) throw updateError;

    if (receipt.sale_id) {
        await supabase
            .from('marketplace_transactions')
            .update({
                status: 'refunded',
                metadata: {
                    refund_reason: reason,
                    refund_amount: refundAmount,
                    stripe_refund_id: stripeRefund?.id || null,
                },
            })
            .eq('id', receipt.sale_id)
            .catch(() => undefined);
    }

    if (receipt.listing_id && refundAmount > 0) {
        const product = receipt.merchant_products;
        const currentRevenue = Number(product?.revenue_generated || 0);
        await supabase
            .from('merchant_products')
            .update({ revenue_generated: Math.max(0, currentRevenue - refundAmount) })
            .eq('id', receipt.listing_id)
            .catch(() => undefined);
    }

    return { receipt: updatedReceipt, stripe_refund: stripeRefund };
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
    createStripeCommerceIntent,
    finalizeStripePurchase,
    refundCommerceReceipt,
    getPurchaseHistory
};
