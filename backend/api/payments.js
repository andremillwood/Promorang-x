const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { requireAuth } = require('../middleware/auth');
let commerce = null;

try {
  // Lazy require in case dependency not installed
  const Commerce = require('@coinbase/commerce-node');
  commerce = Commerce;
} catch (error) {
  // Coinbase optional
}

const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  : null;

const router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const publicOrigin = process.env.PUBLIC_WEB_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
const stripeWebhookSecret = process.env.WEBHOOK_SECRET_STRIPE;

const stripeClient = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

let coinbaseClient = null;
let CoinbaseCharge = null;

if (commerce && process.env.COINBASE_COMMERCE_API_KEY) {
  const { Client, resources } = commerce;
  Client.init(process.env.COINBASE_COMMERCE_API_KEY);
  CoinbaseCharge = resources.Charge;
  coinbaseClient = Client;
}

const getStripeConfiguredPrices = () =>
  Object.keys(process.env || {}).filter(
    (key) => key.startsWith('STRIPE_PRICE_') && process.env[key],
  );

const providersSummary = () => ({
  stripe: {
    enabled: Boolean(stripeClient),
    ready: Boolean(stripeClient && getStripeConfiguredPrices().length > 0),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  coinbase: {
    enabled: Boolean(coinbaseClient),
    ready: Boolean(coinbaseClient),
    publishableKey: process.env.COINBASE_COMMERCE_KEY || '',
  },
});

router.get('/providers', (_req, res) => {
  const summary = providersSummary();
  res.json({
    status: 'success',
    data: {
      providers: Object.entries(summary).map(([provider, config]) => ({
        provider,
        enabled: config.enabled,
        ready: config.ready,
        publishableKey: config.publishableKey,
      })),
      defaultProvider: process.env.DEFAULT_PAYMENT_PROVIDER || (summary.stripe.enabled ? 'stripe' : 'mock'),
    },
  });
});

router.post('/checkout', requireAuth, async (req, res) => {
  if (!stripeClient) {
    return res.status(503).json({ status: 'error', message: 'Stripe provider not configured' });
  }

  const {
    provider,
    plan_id,
    success_url,
    cancel_url,
    customer_email,
    metadata = {},
  } = req.body || {};
  if (!provider || !plan_id) {
    return res.status(400).json({ status: 'error', message: 'provider and plan_id required' });
  }

  if (provider !== 'stripe') {
    return res.status(400).json({ status: 'error', message: 'Unsupported payment provider' });
  }

  const normalisedPlanId = String(plan_id).toUpperCase();
  const priceId = process.env[`STRIPE_PRICE_${normalisedPlanId}`];

  if (!priceId) {
    return res.status(400).json({ status: 'error', message: 'Invalid plan_id' });
  }

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${publicOrigin}/billing/success`,
      cancel_url: cancel_url || `${publicOrigin}/billing/cancel`,
      customer_email: req.user?.email || customer_email || undefined,
      allow_promotion_codes: true,
      metadata: {
        user_id: req.user?.id || null,
        plan_id: normalisedPlanId,
        plan_label: plan_id,
        ...metadata,
      },
    });

    return res.json({
      status: 'success',
      data: {
        provider: 'stripe',
        url: session.url,
      },
    });
  } catch (error) {
    console.error('[payments.checkout] stripe error', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
});

router.post('/checkout/coinbase', async (req, res) => {
  if (!coinbaseClient || !CoinbaseCharge) {
    return res.status(503).json({ status: 'error', message: 'Coinbase Commerce not configured' });
  }

  const {
    name = 'Promorang Credit',
    description = 'Promorang subscription',
    pricing_type = 'fixed_price',
    local_price = { amount: '20.00', currency: 'USD' },
  } = req.body || {};

  try {
    const charge = await CoinbaseCharge.create({
      name,
      description,
      pricing_type,
      local_price,
      redirect_url: `${publicOrigin}/billing/success`,
      cancel_url: `${publicOrigin}/billing/cancel`,
    });

    return res.json({
      status: 'success',
      data: {
        provider: 'coinbase',
        url: charge.hosted_url,
      },
    });
  } catch (error) {
    console.error('[payments.checkout.coinbase] error', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create Coinbase charge' });
  }
});

async function stripeWebhook(req, res) {
  if (!stripeClient || !stripeWebhookSecret) {
    return res.status(503).json({ status: 'error', message: 'Stripe webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error('[payments.webhook.stripe] signature verification failed', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[payments.webhook.stripe] checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          plan_id: session.metadata?.plan_id || session.metadata?.plan,
        });

        const { user_id: metadataUserId, plan_id: metadataPlanId } = session.metadata || {};
        if (metadataUserId && metadataPlanId) {
          if (!supabaseAdmin) {
            console.warn('[payments.webhook.stripe] Supabase client not configured, skipping plan update');
          } else {
            const { error } = await supabaseAdmin
              .from('users')
              .update({
                plan_id: metadataPlanId,
                plan_updated_at: new Date().toISOString(),
              })
              .eq('id', metadataUserId);

            if (error) {
              console.error('[payments.webhook.stripe] Supabase plan update error', error);
            } else {
              console.log('[payments.webhook.stripe] Plan updated for user', metadataUserId);
            }
          }
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        console.log('[payments.webhook.stripe] payment_intent.succeeded', {
          id: intent.id,
          amount: intent.amount_received,
          customer: intent.customer,
        });
        // TODO: credit wallet / mark invoice paid

        // Track Revenue for PromoShare (5% allocation)
        try {
          const revenueService = require('../services/revenueService');
          // intent.amount_received is in cents
          const amountUsd = intent.amount_received / 100;
          await revenueService.trackRevenue(amountUsd, intent.id, 'stripe_payment');
        } catch (err) {
          console.error('[payments.webhook.stripe] Failed to track revenue', err);
        }

        break;
      }

      default: {
        console.log('[payments.webhook.stripe] unhandled event', event.type);
      }
    }
  } catch (error) {
    console.error('[payments.webhook.stripe] handler error', error);
    return res.status(500).send('Webhook handler error');
  }

  res.json({ received: true });
}

module.exports = {
  router,
  stripeWebhook,
};
