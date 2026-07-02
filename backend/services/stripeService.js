const Stripe = require('stripe');
const { supabase } = require('../lib/supabase');

// Initialize Stripe with secret key from environment
// Will be null if STRIPE_SECRET_KEY is not set
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
    })
    : null;

/**
 * Stripe Service
 * Handles all Stripe-related operations including:
 * - Payment Intents (marketplace purchases)
 * - Stripe Connect (host payouts)
 * - Webhook event processing
 */

// ============================================
// PAYMENT INTENTS (Marketplace Purchases)
// ============================================

/**
 * Create a payment intent for marketplace purchase
 * @param {string} userId - User making the purchase
 * @param {number} amount - Amount in dollars (will be converted to cents)
 * @param {string} currency - Currency code (default: 'usd')
 * @param {object} metadata - Additional metadata (productId, etc.)
 * @returns {Promise<object>} Payment intent with client secret
 */
async function createPaymentIntent(userId, amount, currency = 'usd', metadata = {}) {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    try {
        // Convert dollars to cents
        const amountInCents = Math.round(amount * 100);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency.toLowerCase(),
            metadata: {
                user_id: userId,
                ...metadata,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Store in database for tracking
        await supabase
            .from('stripe_payment_intents')
            .insert({
                user_id: userId,
                stripe_payment_intent_id: paymentIntent.id,
                amount,
                currency,
                status: paymentIntent.status,
                metadata,
            });

        return {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount,
            currency,
            status: paymentIntent.status,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
}

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<object>} Payment intent details
 */
async function getPaymentIntent(paymentIntentId) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
}

/**
 * Update payment intent status in database
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} status - New status
 * @param {object} error - Error details if payment failed
 */
async function updatePaymentIntentStatus(paymentIntentId, status, error = null) {
    try {
        const updateData = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (error) {
            updateData.last_payment_error = error;
        }

        await supabase
            .from('stripe_payment_intents')
            .update(updateData)
            .eq('stripe_payment_intent_id', paymentIntentId);
    } catch (err) {
        console.error('Error updating payment intent status:', err);
    }
}

// ============================================
// STRIPE CONNECT (Host Payouts)
// ============================================

/**
 * Create a Stripe Connect Express account for a host
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Stripe account details
 */
async function createConnectAccount(userId, email, metadata = {}) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        // Create Express account
        const account = await stripe.accounts.create({
            type: 'express',
            email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            metadata: {
                user_id: userId,
                ...metadata,
            },
        });

        // Store account ID in payout methods
        await supabase
            .from('user_payout_methods')
            .insert({
                user_id: userId,
                method_type: 'stripe_connect',
                stripe_account_id: account.id,
                stripe_account_status: 'pending',
                stripe_capabilities: account.capabilities,
                is_default: false,
            });

        return {
            accountId: account.id,
            status: 'pending',
            onboardingRequired: true,
        };
    } catch (error) {
        console.error('Error creating Connect account:', error);
        throw new Error(`Failed to create Connect account: ${error.message}`);
    }
}

/**
 * Create an account link for Stripe Connect onboarding
 * @param {string} accountId - Stripe account ID
 * @param {string} returnUrl - URL to return to after onboarding
 * @param {string} refreshUrl - URL to return to if link expires
 * @returns {Promise<object>} Account link with URL
 */
async function createAccountLink(accountId, returnUrl, refreshUrl) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });

        return {
            url: accountLink.url,
            expiresAt: accountLink.expires_at,
        };
    } catch (error) {
        console.error('Error creating account link:', error);
        throw new Error(`Failed to create account link: ${error.message}`);
    }
}

/**
 * Get Stripe Connect account details
 * @param {string} accountId - Stripe account ID
 * @returns {Promise<object>} Account details
 */
async function getConnectAccount(accountId) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        const account = await stripe.accounts.retrieve(accountId);

        return {
            id: account.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            capabilities: account.capabilities,
            requirements: account.requirements,
        };
    } catch (error) {
        console.error('Error retrieving Connect account:', error);
        throw new Error(`Failed to retrieve Connect account: ${error.message}`);
    }
}

/**
 * Update Connect account status in database
 * @param {string} accountId - Stripe account ID
 * @param {object} accountData - Account data from Stripe
 */
async function updateConnectAccountStatus(accountId, accountData) {
    try {
        const status = accountData.charges_enabled && accountData.payouts_enabled
            ? 'active'
            : accountData.details_submitted
                ? 'restricted'
                : 'pending';

        await supabase
            .from('user_payout_methods')
            .update({
                stripe_account_status: status,
                stripe_capabilities: accountData.capabilities,
                stripe_charges_enabled: accountData.charges_enabled,
                stripe_payouts_enabled: accountData.payouts_enabled,
                stripe_onboarding_completed: accountData.details_submitted,
            })
            .eq('stripe_account_id', accountId);
    } catch (error) {
        console.error('Error updating Connect account status:', error);
    }
}

/**
 * Create a transfer to a Connect account (payout)
 * @param {string} accountId - Stripe Connect account ID
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Transfer details
 */
async function createPayout(accountId, amount, currency = 'usd', metadata = {}) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        // Convert dollars to cents
        const amountInCents = Math.round(amount * 100);

        // Create transfer
        const transfer = await stripe.transfers.create({
            amount: amountInCents,
            currency: currency.toLowerCase(),
            destination: accountId,
            metadata,
        });

        return {
            transferId: transfer.id,
            amount,
            currency,
            status: transfer.status || 'pending',
            created: transfer.created,
        };
    } catch (error) {
        console.error('Error creating payout:', error);
        throw new Error(`Failed to create payout: ${error.message}`);
    }
}

// ============================================
// WEBHOOK HANDLING
// ============================================

/**
 * Verify Stripe webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {object} Verified event
 */
function verifyWebhookSignature(payload, signature) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
    }

    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
        );
        return event;
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
}

/**
 * Log webhook event to database
 * @param {object} event - Stripe event
 */
async function logWebhookEvent(event) {
    try {
        await supabase
            .from('stripe_webhook_events')
            .insert({
                stripe_event_id: event.id,
                event_type: event.type,
                event_data: event,
                processed: false,
            });
    } catch (error) {
        console.error('Error logging webhook event:', error);
    }
}

/**
 * Mark webhook event as processed
 * @param {string} eventId - Stripe event ID
 * @param {boolean} success - Whether processing succeeded
 * @param {string} error - Error message if failed
 */
async function markWebhookEventProcessed(eventId, success = true, error = null) {
    try {
        await supabase
            .from('stripe_webhook_events')
            .update({
                processed: success,
                processing_error: error,
                processed_at: new Date().toISOString(),
            })
            .eq('stripe_event_id', eventId);
    } catch (err) {
        console.error('Error marking webhook event as processed:', err);
    }
}

/**
 * Process webhook event based on type
 * @param {object} event - Stripe event
 */
async function processWebhookEvent(event) {
    try {
        switch (event.type) {
            // Payment Intent events
            case 'payment_intent.succeeded':
                await updatePaymentIntentStatus(event.data.object.id, 'succeeded');
                await handleMomentEconomyPaymentSucceeded(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await updatePaymentIntentStatus(
                    event.data.object.id,
                    'failed',
                    event.data.object.last_payment_error
                );
                break;

            case 'payment_intent.canceled':
                await updatePaymentIntentStatus(event.data.object.id, 'canceled');
                break;

            // Checkout Session events (for sponsor payments)
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;

            case 'checkout.session.expired':
                await handleCheckoutSessionExpired(event.data.object);
                break;

            // Subscription events
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionEvent(event.data.object, event.type);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionCancelled(event.data.object);
                break;

            // Connect Account events
            case 'account.updated':
                await updateConnectAccountStatus(event.data.object.id, event.data.object);
                break;

            case 'account.application.authorized':
            case 'account.application.deauthorized':
                // Handle Connect account authorization changes
                console.log(`Account ${event.type}:`, event.data.object.id);
                break;

            // Transfer events (payouts)
            case 'transfer.created':
            case 'transfer.updated':
            case 'transfer.reversed':
                console.log(`Transfer ${event.type}:`, event.data.object.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        await markWebhookEventProcessed(event.id, true);
    } catch (error) {
        console.error(`Error processing webhook event ${event.type}:`, error);
        await markWebhookEventProcessed(event.id, false, error.message);
        throw error;
    }
}

async function handleMomentEconomyPaymentSucceeded(paymentIntent) {
    try {
        const metadata = paymentIntent?.metadata || {};
        if (metadata.economy_flow !== 'moment_economy_v1') return;

        const momentEconomyService = require('./momentEconomyService');
        await momentEconomyService.confirmStripeMomentPaymentIntent(paymentIntent);
    } catch (error) {
        console.error('Error handling Moment Economy payment:', error);
        throw error;
    }
}

/**
 * Handle checkout session completion
 * @param {object} session - Stripe checkout session
 */
async function handleCheckoutSessionCompleted(session) {
    try {
        const { type, pool_id, user_id, tier } = session.metadata || {};

        if (type === 'promoshare_sponsor_pool' && pool_id) {
            // Update pool payment status
            await updatePoolPaymentStatus(session.id, 'complete');
            console.log(`[Webhook] Sponsor pool ${pool_id} payment completed`);
        } else if (type === 'promoshare_subscription' && user_id && tier) {
            // Update user subscription
            await supabase
                .from('users')
                .update({
                    subscription_status: 'active',
                    user_tier: tier,
                    subscription_type: 'promoshare',
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user_id);

            // Update checkout session
            await supabase
                .from('stripe_checkout_sessions')
                .update({
                    status: 'complete',
                    stripe_subscription_id: session.subscription,
                    updated_at: new Date().toISOString(),
                })
                .eq('stripe_session_id', session.id);

            console.log(`[Webhook] User ${user_id} subscribed to ${tier} tier`);
        }
    } catch (error) {
        console.error('Error handling checkout session completion:', error);
        throw error;
    }
}

/**
 * Handle checkout session expiration
 * @param {object} session - Stripe checkout session
 */
async function handleCheckoutSessionExpired(session) {
    try {
        await supabase
            .from('stripe_checkout_sessions')
            .update({
                status: 'expired',
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_session_id', session.id);

        console.log(`[Webhook] Checkout session ${session.id} expired`);
    } catch (error) {
        console.error('Error handling checkout session expiration:', error);
    }
}

/**
 * Handle subscription events
 * @param {object} subscription - Stripe subscription
 * @param {string} eventType - Event type
 */
async function handleSubscriptionEvent(subscription, eventType) {
    try {
        const { user_id, tier } = subscription.metadata || {};

        if (!user_id) {
            console.log('[Webhook] No user_id in subscription metadata');
            return;
        }

        const status = subscription.status;
        const isActive = ['active', 'trialing'].includes(status);

        await supabase
            .from('users')
            .update({
                subscription_status: isActive ? 'active' : status,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer,
                subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', user_id);

        console.log(`[Webhook] Subscription ${subscription.id} ${eventType}: ${status}`);
    } catch (error) {
        console.error('Error handling subscription event:', error);
    }
}

/**
 * Handle subscription cancellation
 * @param {object} subscription - Stripe subscription
 */
async function handleSubscriptionCancelled(subscription) {
    try {
        const { user_id } = subscription.metadata || {};

        if (!user_id) return;

        await supabase
            .from('users')
            .update({
                subscription_status: 'cancelled',
                user_tier: 'free',
                updated_at: new Date().toISOString(),
            })
            .eq('id', user_id);

        console.log(`[Webhook] Subscription cancelled for user ${user_id}`);
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if Stripe is configured
 * @returns {boolean} True if Stripe is configured
 */
function isStripeConfigured() {
    return !!stripe && !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Get Stripe publishable key
 * @returns {string} Publishable key
 */
function getPublishableKey() {
    return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

// ============================================
// PROMOSHARE SPONSOR PAYMENTS
// ============================================

/**
 * Create a checkout session for sponsor pool payment
 * @param {string} sponsorId - Sponsor user ID
 * @param {string} poolId - PromoShare cycle/pool ID
 * @param {number} amount - Total amount in dollars (pool + fees)
 * @param {object} poolDetails - Pool configuration details
 * @returns {Promise<object>} Checkout session with URL
 */
async function createSponsorCheckoutSession(sponsorId, poolId, amount, poolDetails = {}) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        const amountInCents = Math.round(amount * 100);
        const { tier, pool_amount, platform_fee, cycle_name } = poolDetails;

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `PromoShare ${tier} Pool: ${cycle_name}`,
                            description: `Prize pool: $${pool_amount} + Platform fee: $${platform_fee}`,
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'https://www.promorang.co'}/sponsor?payment=success&pool_id=${poolId}`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://www.promorang.co'}/sponsor?payment=cancel&pool_id=${poolId}`,
            metadata: {
                sponsor_id: sponsorId,
                user_id: sponsorId,
                pool_id: poolId,
                revenue_funnel: 'sponsorship',
                entity_type: 'promoshare_pool',
                entity_id: poolId,
                tier: tier || 'weekly',
                pool_amount: pool_amount?.toString() || '',
                platform_fee: platform_fee?.toString() || '',
                type: 'promoshare_sponsor_pool',
            },
            client_reference_id: poolId,
        });

        // Store session in database
        await supabase
            .from('stripe_checkout_sessions')
            .insert({
                user_id: sponsorId,
                stripe_session_id: session.id,
                pool_id: poolId,
                amount,
                status: session.status,
                metadata: {
                    tier,
                    pool_amount,
                    platform_fee,
                    type: 'promoshare_sponsor_pool',
                },
            });

        const revenueFunnels = require('./revenueFunnelService');
        await revenueFunnels.record({
            userId: sponsorId,
            funnel: 'sponsorship',
            stage: 'checkout_started',
            entityType: 'promoshare_pool',
            entityId: poolId,
            provider: 'stripe',
            providerEventId: session.id,
            amount,
            currency: 'USD',
            idempotencyKey: `stripe:${session.id}:checkout_started`,
        });

        return {
            sessionId: session.id,
            url: session.url,
            amount,
            status: session.status,
        };
    } catch (error) {
        console.error('Error creating sponsor checkout session:', error);
        throw new Error(`Failed to create checkout session: ${error.message}`);
    }
}

/**
 * Retrieve a checkout session
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<object>} Session details
 */
async function getCheckoutSession(sessionId) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return session;
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        throw new Error(`Failed to retrieve session: ${error.message}`);
    }
}

/**
 * Update pool payment status after successful checkout
 * @param {string} sessionId - Stripe checkout session ID
 * @param {string} paymentStatus - Payment status
 */
async function updatePoolPaymentStatus(sessionId, paymentStatus) {
    try {
        // Get session from database
        const { data: session } = await supabase
            .from('stripe_checkout_sessions')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

        if (!session) {
            console.error('Checkout session not found:', sessionId);
            return;
        }

        // Update checkout session status
        await supabase
            .from('stripe_checkout_sessions')
            .update({
                status: paymentStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_session_id', sessionId);

        // If payment succeeded, activate the pool
        if (paymentStatus === 'complete') {
            await supabase
                .from('promoshare_cycles')
                .update({
                    'sponsor_config.payment_status': 'paid',
                    'sponsor_config.paid_at': new Date().toISOString(),
                    status: 'active',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', session.pool_id);

            // Create audit log
            await supabase
                .from('promoshare_audit_log')
                .insert({
                    cycle_id: session.pool_id,
                    action_type: 'sponsor_payment_completed',
                    actor_type: 'sponsor',
                    actor_id: session.user_id,
                    payload: {
                        amount: session.amount,
                        stripe_session_id: sessionId,
                    },
                });
        }
    } catch (error) {
        console.error('Error updating pool payment status:', error);
    }
}

/**
 * Create a subscription checkout session for Pro/Power tiers
 * @param {string} userId - User ID
 * @param {string} tier - Subscription tier (pro, power)
 * @returns {Promise<object>} Checkout session
 */
async function createSubscriptionCheckout(userId, tier) {
    if (!stripe) {
        throw new Error('Stripe is not configured.');
    }

    const tierPrices = {
        pro: process.env.STRIPE_PRICE_PRO || 'price_placeholder_pro',
        power: process.env.STRIPE_PRICE_POWER || 'price_placeholder_power',
    };

    const priceId = tierPrices[tier.toLowerCase()];

    if (!priceId || priceId.includes('placeholder')) {
        throw new Error(`Stripe price ID not configured for tier: ${tier}`);
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL || 'https://www.promorang.co'}/settings/subscription?success=true&tier=${tier}`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://www.promorang.co'}/settings/subscription?canceled=true`,
            metadata: {
                user_id: userId,
                tier: tier,
                type: 'promoshare_subscription',
                revenue_funnel: 'membership',
                entity_type: 'membership_plan',
                entity_id: tier,
            },
            subscription_data: {
                metadata: {
                    user_id: userId,
                    tier: tier,
                },
            },
        });

        // Store session
        await supabase
            .from('stripe_checkout_sessions')
            .insert({
                user_id: userId,
                stripe_session_id: session.id,
                amount: tier === 'pro' ? 9.99 : 29.99,
                status: session.status,
                metadata: {
                    tier,
                    type: 'promoshare_subscription',
                },
            });

        const revenueFunnels = require('./revenueFunnelService');
        await revenueFunnels.record({
            userId,
            funnel: 'membership',
            stage: 'checkout_started',
            entityType: 'membership_plan',
            entityId: tier,
            provider: 'stripe',
            providerEventId: session.id,
            amount: tier === 'pro' ? 9.99 : 29.99,
            currency: 'USD',
            idempotencyKey: `stripe:${session.id}:checkout_started`,
        });

        return {
            sessionId: session.id,
            url: session.url,
            tier,
        };
    } catch (error) {
        console.error('Error creating subscription checkout:', error);
        throw new Error(`Failed to create subscription checkout: ${error.message}`);
    }
}

module.exports = {
    // Payment Intents
    createPaymentIntent,
    getPaymentIntent,
    updatePaymentIntentStatus,

    // Stripe Connect
    createConnectAccount,
    createAccountLink,
    getConnectAccount,
    updateConnectAccountStatus,
    createPayout,

    // Sponsor Payments
    createSponsorCheckoutSession,
    getCheckoutSession,
    updatePoolPaymentStatus,
    createSubscriptionCheckout,

    // Webhooks
    verifyWebhookSignature,
    logWebhookEvent,
    markWebhookEventProcessed,
    processWebhookEvent,

    // Utilities
    isStripeConfigured,
    getPublishableKey,
};
