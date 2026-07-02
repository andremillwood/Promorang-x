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
const stripeWebhookSecret = process.env.WEBHOOK_SECRET_STRIPE || process.env.STRIPE_WEBHOOK_SECRET;

const stripeClient = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' }) : null;

function normalizeParticipantTier(planId) {
  if (!planId) return null;
  try {
    const revenueService = require('../services/revenueService');
    return revenueService.normalizeParticipantTier
      ? revenueService.normalizeParticipantTier(planId)
      : null;
  } catch (error) {
    return null;
  }
}

let coinbaseClient = null;
let CoinbaseCharge = null;

if (commerce && process.env.COINBASE_COMMERCE_API_KEY) {
  const { Client, resources } = commerce;
  Client.init(process.env.COINBASE_COMMERCE_API_KEY);
  CoinbaseCharge = resources.Charge;
  coinbaseClient = Client;
}

async function resolveUserIdForPaymentIntent(intent) {
  const metadataUserId = intent?.metadata?.user_id;
  if (metadataUserId) {
    return metadataUserId;
  }

  if (!supabaseAdmin || !intent?.customer) {
    return null;
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', intent.customer)
    .maybeSingle();

  if (error) {
    console.error('[payments.webhook.stripe] Failed to resolve user from Stripe customer', error);
    return null;
  }

  return user?.id || null;
}

async function resolveUserIdForStripeCustomer(customerId) {
  if (!supabaseAdmin || !customerId) {
    return null;
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error) {
    console.error('[payments.webhook.stripe] Failed to resolve user from Stripe customer', error);
    return null;
  }

  return user?.id || null;
}

async function resolveSubscriptionContext(invoice) {
  let subscription = null;
  if (invoice?.subscription && stripeClient) {
    try {
      subscription = await stripeClient.subscriptions.retrieve(invoice.subscription);
    } catch (error) {
      console.error('[payments.webhook.stripe] Failed to retrieve subscription', error);
    }
  }

  const metadata = {
    ...(subscription?.metadata || {}),
    ...(invoice?.metadata || {}),
  };

  const userId = metadata.user_id || await resolveUserIdForStripeCustomer(invoice?.customer);
  const planId = metadata.plan_id || metadata.plan;

  return {
    userId,
    planId,
    subscriptionId: subscription?.id || invoice?.subscription || null,
    metadata,
  };
}

async function ensureSubscriptionPaymentTransaction(intent) {
  if (!supabaseAdmin) {
    return null;
  }

  const existingQuery = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('provider', 'stripe')
    .eq('external_payment_id', intent.id)
    .maybeSingle();

  if (existingQuery.error) {
    throw existingQuery.error;
  }

  if (existingQuery.data?.id) {
    return existingQuery.data.id;
  }

  const userId = await resolveUserIdForPaymentIntent(intent);
  const amountUsd = Number(((intent.amount_received || intent.amount || 0) / 100).toFixed(2));
  const paymentMetadata = {
    stripe_customer_id: intent.customer || null,
    stripe_invoice_id: intent.invoice || null,
    stripe_subscription_id: intent.subscription || null,
    payment_method_types: intent.payment_method_types || [],
    livemode: Boolean(intent.livemode),
    raw_metadata: intent.metadata || {},
  };

  const insertResult = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: userId,
      transaction_type: 'subscription_payment',
      amount: amountUsd,
      currency_type: (intent.currency || 'usd').toUpperCase(),
      status: 'completed',
      description: `Stripe payment ${intent.id}`,
      provider: 'stripe',
      external_payment_id: intent.id,
      metadata: paymentMetadata,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertResult.error) {
    // Unique index races are expected under webhook retries. Re-read and continue.
    if (insertResult.error.code === '23505') {
      const retryQuery = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('provider', 'stripe')
        .eq('external_payment_id', intent.id)
        .maybeSingle();

      if (retryQuery.error) {
        throw retryQuery.error;
      }

      return retryQuery.data?.id || null;
    }

    throw insertResult.error;
  }

  return insertResult.data?.id || null;
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
        revenue_funnel: 'membership',
        entity_type: 'membership_plan',
        entity_id: normalisedPlanId,
        ...metadata,
      },
      subscription_data: {
        metadata: {
          user_id: req.user?.id || null,
          plan_id: normalisedPlanId,
          plan_label: plan_id,
          ...metadata,
        },
      },
    });

    const revenueFunnels = require('../services/revenueFunnelService');
    await revenueFunnels.record({
      userId: req.user?.id,
      sessionId: req.body?.session_id,
      funnel: 'membership',
      stage: 'checkout_started',
      entityType: 'membership_plan',
      entityId: normalisedPlanId,
      provider: 'stripe',
      providerEventId: session.id,
      idempotencyKey: `stripe:${session.id}:checkout_started`,
      metadata: { checkout_session_id: session.id },
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
    const webhookBody = req.rawBody ? Buffer.from(req.rawBody) : req.body;
    event = Stripe.webhooks.constructEvent(webhookBody, signature, stripeWebhookSecret);
  } catch (error) {
    console.error('[payments.webhook.stripe] signature verification failed', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { user_id: metadataUserId, plan_id: metadataPlanId } = session.metadata || {};
        const participantTier = normalizeParticipantTier(metadataPlanId || session.metadata?.plan);
        const funnel = session.metadata?.revenue_funnel || (participantTier ? 'membership' : null);

        if (funnel) {
          const revenueFunnels = require('../services/revenueFunnelService');
          await revenueFunnels.record({
            userId: metadataUserId,
            funnel,
            stage: 'payment_succeeded',
            entityType: session.metadata?.entity_type || 'checkout_session',
            entityId: session.metadata?.entity_id || session.id,
            provider: 'stripe',
            providerEventId: event.id,
            amount: Number(((session.amount_total || 0) / 100).toFixed(2)),
            currency: session.currency || 'usd',
            idempotencyKey: `stripe:${event.id}:payment_succeeded`,
            metadata: { checkout_session_id: session.id, plan_id: metadataPlanId || null },
          });
        }

        console.log('[payments.webhook.stripe] checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          plan_id: session.metadata?.plan_id || session.metadata?.plan,
        });

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

        if (metadataUserId && participantTier && session.amount_total) {
          try {
            const revenueService = require('../services/revenueService');
            await revenueService.trackParticipantSubscriptionRevenue({
              userId: metadataUserId,
              tierKey: participantTier,
              amount: Number((session.amount_total / 100).toFixed(2)),
              currency: session.currency || 'usd',
              provider: 'stripe',
              providerPaymentId: session.payment_intent || session.id,
              providerSubscriptionId: session.subscription || null,
              metadata: {
                checkout_session_id: session.id,
                stripe_customer_id: session.customer || null,
                raw_plan_id: metadataPlanId || session.metadata?.plan || null,
              },
            });
          } catch (err) {
            console.error('[payments.webhook.stripe] Failed to allocate participant subscription', err);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const context = await resolveSubscriptionContext(invoice);
        const participantTier = normalizeParticipantTier(context.planId);

        if (context.userId && participantTier && invoice.amount_paid) {
          try {
            const revenueService = require('../services/revenueService');
            await revenueService.trackParticipantSubscriptionRevenue({
              userId: context.userId,
              tierKey: participantTier,
              amount: Number((invoice.amount_paid / 100).toFixed(2)),
              currency: invoice.currency || 'usd',
              provider: 'stripe',
              providerPaymentId: invoice.payment_intent || invoice.id,
              providerSubscriptionId: context.subscriptionId,
              metadata: {
                stripe_invoice_id: invoice.id,
                stripe_customer_id: invoice.customer || null,
                raw_plan_id: context.planId || null,
                billing_reason: invoice.billing_reason || null,
              },
            });
          } catch (err) {
            console.error('[payments.webhook.stripe] Failed to allocate invoice participant subscription', err);
          }
        }

        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const object = event.data.object;
        const funnel = object.metadata?.revenue_funnel;
        if (funnel) {
          const revenueFunnels = require('../services/revenueFunnelService');
          await revenueFunnels.record({
            userId: object.metadata?.user_id || null,
            funnel,
            stage: 'payment_failed',
            entityType: object.metadata?.entity_type || object.object,
            entityId: object.metadata?.entity_id || object.id,
            provider: 'stripe',
            providerEventId: event.id,
            amount: Number((((object.amount || object.amount_total) || 0) / 100).toFixed(2)),
            currency: object.currency || 'usd',
            idempotencyKey: `stripe:${event.id}:payment_failed`,
            metadata: { reason: event.type },
          });
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

        const revenueFunnel = intent.metadata?.revenue_funnel;
        if (revenueFunnel) {
          const revenueFunnels = require('../services/revenueFunnelService');
          await revenueFunnels.record({
            userId: await resolveUserIdForPaymentIntent(intent),
            funnel: revenueFunnel,
            stage: 'payment_succeeded',
            entityType: intent.metadata?.entity_type || 'payment_intent',
            entityId: intent.metadata?.entity_id || intent.id,
            provider: 'stripe',
            providerEventId: event.id,
            amount: Number(((intent.amount_received || intent.amount || 0) / 100).toFixed(2)),
            currency: intent.currency || 'usd',
            idempotencyKey: `stripe:${event.id}:payment_succeeded`,
            metadata: { payment_intent_id: intent.id },
          });
        }

        try {
          const momentEconomyService = require('../services/momentEconomyService');
          const momentResult = await momentEconomyService.confirmStripeMomentPaymentIntent(intent);
          if (momentResult.handled) {
            console.log('[payments.webhook.stripe] Moment Economy payment confirmed', {
              payment_intent: intent.id,
              moment_id: intent.metadata?.moment_id,
            });
          }
        } catch (err) {
          console.error('[payments.webhook.stripe] Failed to confirm Moment Economy payment', err);
          throw err;
        }

        let transactionId = null;
        try {
          transactionId = await ensureSubscriptionPaymentTransaction(intent);
        } catch (err) {
          console.error('[payments.webhook.stripe] Failed to persist local transaction', err);
        }

        const isLikelySubscriptionIntent = Boolean(
          intent.invoice ||
          intent.subscription ||
          normalizeParticipantTier(intent.metadata?.plan_id || intent.metadata?.plan)
        );

        if (!isLikelySubscriptionIntent) {
          // Track non-subscription Stripe revenue for PromoShare (5% allocation).
          try {
            const revenueService = require('../services/revenueService');
            const amountUsd = intent.amount_received / 100;
            await revenueService.trackRevenue(amountUsd, transactionId || intent.id, 'stripe_payment');
          } catch (err) {
            console.error('[payments.webhook.stripe] Failed to track revenue', err);
          }
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

router.post('/webhook/stripe', stripeWebhook);

module.exports = {
  router,
  stripeWebhook,
};
