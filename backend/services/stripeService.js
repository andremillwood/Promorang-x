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

    // Webhooks
    verifyWebhookSignature,
    logWebhookEvent,
    markWebhookEventProcessed,
    processWebhookEvent,

    // Utilities
    isStripeConfigured,
    getPublishableKey,
};
