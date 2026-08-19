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

async function createStripeCommerceIntent({ userId, productId, quantity = 1, items = null, currency = 'USD' }) {
    if (!supabase) throw new Error('Database not available');
    const stripeService = require('./stripeService');
    if (!stripeService.isStripeConfigured()) throw new Error('Stripe is not configured');

    const requestedItems = Array.isArray(items) && items.length
        ? items
        : [{ product_id: productId, quantity: Math.max(1, Number(quantity || 1)) }];
    if (!requestedItems[0]?.product_id) throw new Error('At least one product is required');

    const { data: order, error: reserveError } = await supabase.rpc('reserve_commerce_order', {
        p_buyer_id: userId,
        p_items: requestedItems,
        p_currency: String(currency || 'USD').toUpperCase(),
        p_hold_minutes: 30,
    });
    if (reserveError || !order) throw reserveError || new Error('Could not reserve inventory');

    try {
        const intent = await stripeService.createPaymentIntent(
            userId,
            Number(order.total_amount),
            order.currency,
            {
                commerce_flow: 'merchant_order',
                commerce_order_id: order.id,
                merchant_id: order.merchant_id,
                item_count: String(requestedItems.length),
                revenue_funnel: 'marketplace',
                entity_type: 'commerce_order',
                entity_id: order.id,
            },
            { idempotencyKey: `commerce-order:${order.id}` },
        );
        await supabase.from('commerce_orders').update({
            stripe_payment_intent_id: intent.paymentIntentId,
            payment_status: 'processing',
            updated_at: new Date().toISOString(),
        }).eq('id', order.id);
        return { ...intent, orderId: order.id, reservationExpiresAt: order.reservation_expires_at };
    } catch (error) {
        await supabase.rpc('release_commerce_order', {
            p_order_id: order.id,
            p_reason: 'payment_intent_creation_failed',
        }).catch(() => undefined);
        throw error;
    }
}

async function createStripeCommerceCheckout({ userId, productId, quantity = 1, items = null, successUrl, cancelUrl }) {
    if (!supabase) throw new Error('Database not available');
    const stripeService = require('./stripeService');
    if (!stripeService.isStripeConfigured()) throw new Error('Stripe is not configured');

    const requestedItems = Array.isArray(items) && items.length
        ? items.map((item) => ({ product_id: item.product_id, quantity: Math.max(1, Number(item.quantity || 1)) }))
        : [{ product_id: productId, quantity: Math.max(1, Number(quantity || 1)) }];
    if (!requestedItems[0]?.product_id) throw new Error('At least one product is required');

    const { data: order, error: reserveError } = await supabase.rpc('reserve_commerce_order', {
        p_buyer_id: userId,
        p_items: requestedItems,
        p_currency: 'USD',
        p_hold_minutes: 30,
    });
    if (reserveError || !order) throw reserveError || new Error('Could not reserve inventory');

    try {
        const [{ data: payoutMethod }, { data: orderItems }, { data: products }, { data: profile }, { data: shippingRates }] = await Promise.all([
            supabase.from('user_payout_methods')
                .select('stripe_account_id,stripe_account_status,stripe_charges_enabled')
                .eq('user_id', order.merchant_id)
                .eq('method_type', 'stripe_connect')
                .eq('stripe_account_status', 'active')
                .eq('stripe_charges_enabled', true)
                .order('is_default', { ascending: false })
                .limit(1)
                .maybeSingle(),
            supabase.from('commerce_order_items').select('*').eq('order_id', order.id),
            supabase.from('merchant_products')
                .select('id,requires_shipping,tax_code')
                .in('id', requestedItems.map((item) => item.product_id)),
            supabase.from('merchant_commerce_profiles').select('*').eq('merchant_id', order.merchant_id).maybeSingle(),
            supabase.from('merchant_shipping_rates').select('*')
                .eq('merchant_id', order.merchant_id).eq('active', true)
                .order('sort_order', { ascending: true }),
        ]);
        if (!payoutMethod?.stripe_account_id) {
            throw new Error('This merchant must finish Stripe seller onboarding before accepting card payments');
        }

        const productById = new Map((products || []).map((product) => [product.id, product]));
        const checkoutItems = (orderItems || []).map((item) => ({
            ...item,
            requires_shipping: Boolean(productById.get(item.product_id)?.requires_shipping),
            tax_code: productById.get(item.product_id)?.tax_code || undefined,
        }));
        const requiresShipping = checkoutItems.some((item) => item.requires_shipping);
        if (requiresShipping && !(shippingRates || []).some((rate) => rate.fulfillment_type === 'shipping')) {
            throw new Error('This merchant has not configured a shipping rate for this product');
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://www.promorang.co';
        const safeSuccessUrl = successUrl?.startsWith(frontendUrl) ? successUrl : `${frontendUrl}/shop/order/success?session_id={CHECKOUT_SESSION_ID}`;
        const safeCancelUrl = cancelUrl?.startsWith(frontendUrl) ? cancelUrl : `${frontendUrl}/shop/${productId || requestedItems[0].product_id}?checkout=cancelled`;
        const session = await stripeService.createConnectedCheckoutSession({
            connectedAccountId: payoutMethod.stripe_account_id,
            order,
            items: checkoutItems,
            shippingRates: (shippingRates || []).filter((rate) => rate.currency.toUpperCase() === order.currency),
            allowedCountries: profile?.allowed_countries?.length ? profile.allowed_countries : ['US'],
            successUrl: safeSuccessUrl,
            cancelUrl: safeCancelUrl,
        });
        await supabase.from('commerce_orders').update({
            stripe_checkout_session_id: session.id,
            stripe_connected_account_id: payoutMethod.stripe_account_id,
            payment_status: 'processing',
            updated_at: new Date().toISOString(),
        }).eq('id', order.id);
        return { checkoutUrl: session.url, sessionId: session.id, orderId: order.id };
    } catch (error) {
        await supabase.rpc('release_commerce_order', {
            p_order_id: order.id,
            p_reason: 'connected_checkout_creation_failed',
        }).catch(() => undefined);
        throw error;
    }
}

async function createMerchantPaymentReservation({ userId, productId, quantity = 1, paymentMethodId }) {
    if (!supabase) throw new Error('Database not available');
    const { data: product, error: productError } = await supabase
        .from('merchant_products').select('id,merchant_id,name,currency')
        .eq('id', productId).eq('is_active', true).single();
    if (productError || !product) throw new Error('Product is unavailable');
    const { data: method, error: methodError } = await supabase
        .from('merchant_direct_payment_methods').select('*')
        .eq('id', paymentMethodId).eq('merchant_id', product.merchant_id).eq('active', true).single();
    if (methodError || !method) throw new Error('That merchant payment option is unavailable');

    const { data: order, error } = await supabase.rpc('reserve_commerce_order', {
        p_buyer_id: userId,
        p_items: [{ product_id: productId, quantity: Math.max(1, Number(quantity || 1)) }],
        p_currency: String(product.currency || 'USD').toUpperCase(),
        p_hold_minutes: 30,
    });
    if (error || !order) throw error || new Error('Could not reserve inventory');
    const { data: updated, error: updateError } = await supabase.from('commerce_orders').update({
        payment_collection: 'merchant',
        merchant_payment_method_id: method.id,
        payment_status: 'requires_payment',
        metadata: {
            ...(order.metadata || {}),
            merchant_payment_method: method.method_type,
            merchant_payment_display_name: method.display_name,
            merchant_payment_instructions: method.instructions || null,
            merchant_payment_link: method.payment_link || null,
            platform_payment_disclaimer: 'Payment is collected directly by the merchant. Promorang does not receive or guarantee this payment.',
        },
        updated_at: new Date().toISOString(),
    }).eq('id', order.id).select().single();
    if (updateError) {
        await supabase.rpc('release_commerce_order', { p_order_id: order.id, p_reason: 'merchant_payment_setup_failed' }).catch(() => undefined);
        throw updateError;
    }
    return { order: updated, payment_method: method };
}

async function confirmMerchantPayment({ orderId, merchantId, reference }) {
    if (!supabase) throw new Error('Database not available');
    const { data: order, error } = await supabase.rpc('confirm_merchant_collected_payment', {
        p_order_id: orderId, p_merchant_id: merchantId, p_reference: reference,
    });
    if (error || !order) throw error || new Error('Could not confirm merchant payment');
    const { data: existing } = await supabase.from('commerce_receipts').select('id').eq('sale_id', order.id).maybeSingle();
    if (existing) return { order, receipt_id: existing.id, idempotent: true };
    const { data: item } = await supabase.from('commerce_order_items').select('product_id,product_name,quantity').eq('order_id', order.id).limit(1).maybeSingle();
    const { data: receipt, error: receiptError } = await supabase.from('commerce_receipts').insert({
        user_id: order.buyer_id,
        merchant_id: order.merchant_id,
        listing_id: item?.product_id || null,
        sale_id: order.id,
        receipt_type: 'purchase',
        status: 'issued',
        amount: order.total_amount,
        currency: order.currency,
        redemption_code: generateRedemptionCode(),
        attribution: {
            source: 'merchant_collected_payment',
            payment_method: order.metadata?.merchant_payment_method,
            merchant_payment_reference: order.merchant_payment_reference,
            payment_confirmed_by_merchant: true,
            fulfillment_status: 'unfulfilled',
            rewards_awarded: false,
            disclaimer: 'Payment is collected directly by the merchant. Promorang does not receive or guarantee this payment.',
        },
    }).select().single();
    if (receiptError) throw receiptError;
    return { order, receipt_id: receipt.id };
}

async function finalizeStripePurchase(paymentIntent) {
    if (!supabase) throw new Error('Database not available');
    const metadata = paymentIntent?.metadata || {};
    if (metadata.commerce_flow === 'merchant_order' && metadata.commerce_order_id) {
        const { data: order, error: captureError } = await supabase.rpc('capture_commerce_order', {
            p_order_id: metadata.commerce_order_id,
            p_payment_intent_id: paymentIntent.id,
            p_charge_id: paymentIntent.latest_charge || null,
        });
        if (captureError) throw captureError;

        const { data: existingReceipt } = await supabase
            .from('commerce_receipts')
            .select('id,redemption_code')
            .eq('sale_id', order.id)
            .maybeSingle();
        if (existingReceipt) {
            return { handled: true, order_id: order.id, receipt_id: existingReceipt.id, idempotent: true };
        }

        const { data: firstItem } = await supabase
            .from('commerce_order_items')
            .select('product_id')
            .eq('order_id', order.id)
            .limit(1)
            .maybeSingle();
        const redemptionCode = generateRedemptionCode();
        const { data: receipt, error: receiptError } = await supabase
            .from('commerce_receipts')
            .insert({
                user_id: order.buyer_id,
                merchant_id: order.merchant_id,
                listing_id: firstItem?.product_id || null,
                sale_id: order.id,
                receipt_type: 'purchase',
                status: 'issued',
                amount: order.total_amount,
                currency: order.currency,
                redemption_code: redemptionCode,
                attribution: {
                    source: 'stripe_commerce_order',
                    commerce_order_id: order.id,
                    stripe_payment_intent_id: paymentIntent.id,
                    stripe_charge_id: paymentIntent.latest_charge || null,
                    payment_status: 'paid',
                    fulfillment_status: 'unfulfilled',
                    platform_fee: order.platform_fee,
                    merchant_payout: order.merchant_net,
                    stripe_connected_account_id: paymentIntent.metadata?.stripe_connected_account_id || order.stripe_connected_account_id || null,
                },
            })
            .select()
            .single();
        if (receiptError) throw receiptError;
        return {
            handled: true,
            order_id: order.id,
            receipt_id: receipt.id,
            redemption_code: redemptionCode,
        };
    }

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
            status: 'issued',
            amount,
            currency: (paymentIntent.currency || product.currency || 'usd').toUpperCase(),
            redemption_code: redemptionCode,
            moment_id: product.linked_moment_id || paymentIntent.metadata?.moment_id || null,
            attribution: {
                source: 'stripe_commerce',
                quantity,
                stripe_payment_intent_id: paymentIntent.id,
                platform_fee: platformFee,
                merchant_payout: merchantPayout,
                moment_id: product.linked_moment_id || paymentIntent.metadata?.moment_id || null,
                content_id: paymentIntent.metadata?.content_id || paymentIntent.metadata?.source_content_id || null,
            },
        })
        .select()
        .single();
    if (receiptError) throw receiptError;

    const commerceOutcomeService = require('./commerceOutcomeService');
    await commerceOutcomeService.processReceipt(receipt).catch((outcomeError) => console.warn('[Marketplace] Commerce outcomes skipped:', outcomeError.message));

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

async function finalizeConnectedCheckout(session, connectedAccountId) {
    if (!supabase) throw new Error('Database not available');
    const metadata = session?.metadata || {};
    if (metadata.commerce_flow !== 'merchant_direct_order' || !metadata.commerce_order_id) {
        return { handled: false, reason: 'not_connected_commerce' };
    }
    if (session.payment_status !== 'paid') return { handled: false, reason: 'not_paid' };

    const shipping = Number(((session.total_details?.amount_shipping || 0) / 100).toFixed(2));
    const tax = Number(((session.total_details?.amount_tax || 0) / 100).toFixed(2));
    const shippingAddress = session.shipping_details?.address || session.customer_details?.address || null;
    const { data: order, error } = await supabase.rpc('capture_direct_commerce_order', {
        p_order_id: metadata.commerce_order_id,
        p_payment_intent_id: session.payment_intent,
        p_charge_id: null,
        p_checkout_session_id: session.id,
        p_connected_account_id: connectedAccountId || metadata.stripe_connected_account_id,
        p_tax_amount: tax,
        p_shipping_amount: shipping,
        p_shipping_address: shippingAddress,
    });
    if (error) throw error;

    const syntheticIntent = {
        id: session.payment_intent,
        latest_charge: null,
        amount: session.amount_total,
        amount_received: session.amount_total,
        currency: session.currency,
        status: 'succeeded',
        metadata: {
            commerce_flow: 'merchant_order',
            commerce_order_id: order.id,
            stripe_connected_account_id: connectedAccountId || metadata.stripe_connected_account_id,
        },
    };
    return finalizeStripePurchase(syntheticIntent);
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
                stripe_connected_account_id: attribution.stripe_connected_account_id || undefined,
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

    if (attribution.commerce_order_id) {
        if (!attribution.stripe_connected_account_id) {
            const settlementService = require('./merchantSettlementService');
            await settlementService.reverseOrderSettlement(
                attribution.commerce_order_id,
                Math.min(refundAmount, Number(attribution.merchant_payout || refundAmount)),
            );
        }
        await supabase.from('commerce_orders').update({
            payment_status: refundAmount >= Number(receipt.amount || 0) ? 'refunded' : 'partially_refunded',
            updated_at: new Date().toISOString(),
        }).eq('id', attribution.commerce_order_id);
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

async function releaseExpiredReservations() {
    if (!supabase) return 0;
    const { data, error } = await supabase.rpc('release_expired_commerce_reservations');
    if (error) throw error;
    return Number(data || 0);
}

async function cancelStripeOrder(orderId, reason = 'payment_cancelled') {
    if (!supabase || !orderId) return null;
    const { data, error } = await supabase.rpc('release_commerce_order', {
        p_order_id: orderId,
        p_reason: reason,
    });
    if (error) throw error;
    return data;
}

module.exports = {
    processPurchase,
    createStripeCommerceIntent,
    createStripeCommerceCheckout,
    createMerchantPaymentReservation,
    confirmMerchantPayment,
    finalizeStripePurchase,
    finalizeConnectedCheckout,
    refundCommerceReceipt,
    releaseExpiredReservations,
    cancelStripeOrder,
    getPurchaseHistory
};
