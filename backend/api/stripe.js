const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const { requireAuth } = require('../middleware/auth');

/**
 * Stripe API Routes
 * Handles payment intents, Stripe Connect onboarding, and webhooks
 */

// ============================================
// PAYMENT INTENT ROUTES
// ============================================

/**
 * POST /api/stripe/payment-intent
 * Create a payment intent for marketplace purchase
 */
router.post('/payment-intent', requireAuth, async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!stripeService.isStripeConfigured()) {
            return res.status(503).json({
                error: 'Payment processing is not configured. Please contact support.'
            });
        }

        const paymentIntent = await stripeService.createPaymentIntent(
            userId,
            amount,
            currency,
            metadata
        );

        res.json(paymentIntent);
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stripe/payment-intent/:id
 * Get payment intent details
 */
router.get('/payment-intent/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!stripeService.isStripeConfigured()) {
            return res.status(503).json({
                error: 'Payment processing is not configured.'
            });
        }

        const paymentIntent = await stripeService.getPaymentIntent(id);
        res.json(paymentIntent);
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stripe/config
 * Get Stripe publishable key for frontend
 */
router.get('/config', (req, res) => {
    const publishableKey = stripeService.getPublishableKey();

    if (!publishableKey) {
        return res.status(503).json({
            error: 'Stripe is not configured',
            configured: false,
        });
    }

    res.json({
        publishableKey,
        configured: true,
    });
});

// ============================================
// STRIPE CONNECT ROUTES (Host Payouts)
// ============================================

/**
 * POST /api/stripe/connect/account
 * Create a Stripe Connect account for host payouts
 */
router.post('/connect/account', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;

        if (!stripeService.isStripeConfigured()) {
            return res.status(503).json({
                error: 'Stripe Connect is not configured.'
            });
        }

        const account = await stripeService.createConnectAccount(userId, email);
        res.json(account);
    } catch (error) {
        console.error('Error creating Connect account:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/stripe/connect/account-link
 * Create an account link for Stripe Connect onboarding
 */
router.post('/connect/account-link', requireAuth, async (req, res) => {
    try {
        const { accountId } = req.body;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (!accountId) {
            return res.status(400).json({ error: 'Account ID is required' });
        }

        if (!stripeService.isStripeConfigured()) {
            return res.status(503).json({
                error: 'Stripe Connect is not configured.'
            });
        }

        const returnUrl = `${frontendUrl}/dashboard/settings?stripe_onboarding=success`;
        const refreshUrl = `${frontendUrl}/dashboard/settings?stripe_onboarding=refresh`;

        const accountLink = await stripeService.createAccountLink(
            accountId,
            returnUrl,
            refreshUrl
        );

        res.json(accountLink);
    } catch (error) {
        console.error('Error creating account link:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stripe/connect/account/:accountId
 * Get Stripe Connect account details
 */
router.get('/connect/account/:accountId', requireAuth, async (req, res) => {
    try {
        const { accountId } = req.params;

        if (!stripeService.isStripeConfigured()) {
            return res.status(503).json({
                error: 'Stripe Connect is not configured.'
            });
        }

        const account = await stripeService.getConnectAccount(accountId);
        res.json(account);
    } catch (error) {
        console.error('Error retrieving Connect account:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// WEBHOOK ROUTE
// ============================================

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * NOTE: This route should NOT use authenticateUser middleware
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
        return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    try {
        // Verify webhook signature
        const event = stripeService.verifyWebhookSignature(req.body, signature);

        // Log event
        await stripeService.logWebhookEvent(event);

        // Process event asynchronously
        stripeService.processWebhookEvent(event).catch(error => {
            console.error('Error processing webhook event:', error);
        });

        // Respond immediately to Stripe
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
