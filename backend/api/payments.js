const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { requireAuth } = require('../middleware/auth');
const { getSubscriptionPlan } = require('../config/subscriptionPlans');
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

async function recordRevenueFunnelSafely(payload, context) {
  try {
    const revenueFunnels = require('../services/revenueFunnelService');
    await revenueFunnels.record(payload);
  } catch (error) {
    console.error(`[payments.${context}] non-blocking funnel analytics error`, error);
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
  const plan = getSubscriptionPlan(normalisedPlanId);
  const priceId = plan ? process.env[plan.priceEnv] : null;

  if (!priceId) {
    return res.status(400).json({ status: 'error', message: 'Invalid plan_id' });
  }

  try {
    const checkoutSuccessUrl = success_url
      ? `${success_url}${success_url.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`
      : `${publicOrigin}/billing/result?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: checkoutSuccessUrl,
      cancel_url: cancel_url || `${publicOrigin}/billing/cancel`,
      customer_email: req.user?.email || customer_email || undefined,
      allow_promotion_codes: true,
      metadata: {
        user_id: req.user?.id || null,
        plan_id: normalisedPlanId,
        stakeholder_role: plan.role,
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
          stakeholder_role: plan.role,
          plan_label: plan_id,
          ...metadata,
        },
      },
    });

    try {
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
    } catch (funnelError) {
      console.error('[payments.checkout] non-blocking funnel analytics error', funnelError);
    }

    return res.json({
      status: 'success',
      data: {
        provider: 'stripe',
        url: session.url,
        session_id: session.id,
      },
    });
  } catch (error) {
    console.error('[payments.checkout] stripe error', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
});

router.get('/checkout/session/:sessionId', requireAuth, async (req, res) => {
  if (!stripeClient) {
    return res.status(503).json({ status: 'error', message: 'Stripe provider not configured' });
  }

  try {
    const session = await stripeClient.checkout.sessions.retrieve(req.params.sessionId);
    if (!session.metadata?.user_id || session.metadata.user_id !== req.user?.id) {
      return res.status(404).json({ status: 'error', message: 'Checkout session not found' });
    }

    const paid = session.status === 'complete'
      && ['paid', 'no_payment_required'].includes(session.payment_status);
    return res.json({
      status: 'success',
      data: {
        paid,
        session_id: session.id,
        plan_id: session.metadata?.plan_id || null,
        value: Number(((session.amount_total || 0) / 100).toFixed(2)),
        currency: (session.currency || 'usd').toUpperCase(),
      },
    });
  } catch (error) {
    if (error?.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ status: 'error', message: 'Checkout session not found' });
    }
    console.error('[payments.checkout.session] stripe error', error);
    return res.status(500).json({ status: 'error', message: 'Failed to verify checkout session' });
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
        if (session.metadata?.commerce_flow === 'merchant_direct_order') {
          const marketplaceService = require('../services/marketplaceService');
          const result = await marketplaceService.finalizeConnectedCheckout(session, event.account);
          console.log('[payments.webhook.stripe] Merchant direct checkout completed', {
            session_id: session.id,
            connected_account: event.account,
            receipt_id: result.receipt_id,
            idempotent: Boolean(result.idempotent),
          });
          break;
        }
        const { user_id: metadataUserId, plan_id: metadataPlanId } = session.metadata || {};
        const participantTier = normalizeParticipantTier(metadataPlanId || session.metadata?.plan);
        const funnel = session.metadata?.revenue_funnel || (participantTier ? 'membership' : null);

        if (funnel) {
          await recordRevenueFunnelSafely({
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
          }, 'webhook.checkout_completed');
        }

        console.log('[payments.webhook.stripe] checkout.session.completed', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          plan_id: session.metadata?.plan_id || session.metadata?.plan,
        });

        if (metadataUserId && metadataPlanId && session.subscription) {
          const subscription = await stripeClient.subscriptions.retrieve(session.subscription);
          const subscriptionService = require('../services/subscriptionService');
          await subscriptionService.syncStripeSubscription(subscription, {
            userId: metadataUserId,
            planId: metadataPlanId,
            customerId: session.customer,
            metadata: { checkout_session_id: session.id },
          });
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

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const context = await resolveSubscriptionContext(invoice);
        const subscriptionService = require('../services/subscriptionService');
        await subscriptionService.markInvoicePastDue({
          userId: context.userId,
          planId: context.planId,
          subscriptionId: context.subscriptionId,
          customerId: invoice.customer,
          invoiceId: invoice.id,
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscriptionService = require('../services/subscriptionService');
        await subscriptionService.syncStripeSubscription(event.data.object);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        if (charge.payment_intent && supabaseAdmin) {
          const { data: order, error: orderError } = await supabaseAdmin
            .from('commerce_orders')
            .select('*')
            .eq('stripe_payment_intent_id', charge.payment_intent)
            .maybeSingle();
          if (orderError) throw orderError;
          if (!order) break;

          const refundedAmount = Number(((charge.amount_refunded || 0) / 100).toFixed(2));
          const fullyRefunded = Boolean(charge.refunded) || refundedAmount >= Number(order.total_amount);
          await supabaseAdmin.from('commerce_orders').update({
            payment_status: fullyRefunded ? 'refunded' : 'partially_refunded',
            updated_at: new Date().toISOString(),
          }).eq('id', order.id);

          const { data: receipt } = await supabaseAdmin.from('commerce_receipts')
            .select('id,attribution').eq('sale_id', order.id).maybeSingle();
          if (receipt) {
            await supabaseAdmin.from('commerce_receipts').update({
              status: fullyRefunded ? 'refunded' : 'issued',
              attribution: {
                ...(receipt.attribution || {}),
                stripe_refund_reconciled_at: new Date().toISOString(),
                stripe_charge_id: charge.id,
                refund_amount: refundedAmount,
                refund_source: 'stripe_webhook',
              },
            }).eq('id', receipt.id);
          }

          const settlementService = require('../services/merchantSettlementService');
          await settlementService.reverseOrderSettlement(order.id, refundedAmount);
        }
        break;
      }

      case 'charge.dispute.created':
      case 'charge.dispute.closed': {
        const dispute = event.data.object;
        if (supabaseAdmin && dispute.payment_intent) {
          const disputeLost = event.type === 'charge.dispute.created' || dispute.status === 'lost';
          await supabaseAdmin.from('commerce_orders').update({
            payment_status: disputeLost ? 'disputed' : 'paid',
            metadata: {
              stripe_dispute_id: dispute.id,
              stripe_dispute_status: dispute.status,
              stripe_dispute_reason: dispute.reason,
            },
            updated_at: new Date().toISOString(),
          }).eq('stripe_payment_intent_id', dispute.payment_intent);
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const object = event.data.object;
        if (event.type === 'payment_intent.payment_failed' && object.metadata?.commerce_order_id && supabaseAdmin) {
          await supabaseAdmin.from('commerce_orders').update({
            payment_status: 'failed',
            metadata: {
              payment_failure_code: object.last_payment_error?.code || null,
              payment_failure_message: object.last_payment_error?.message || null,
            },
            updated_at: new Date().toISOString(),
          }).eq('id', object.metadata.commerce_order_id).neq('payment_status', 'paid');
        }
        const funnel = object.metadata?.revenue_funnel;
        if (funnel) {
          await recordRevenueFunnelSafely({
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
          }, 'webhook.payment_failed');
        }
        break;
      }

      case 'payment_intent.canceled': {
        const intent = event.data.object;
        if (intent.metadata?.commerce_order_id) {
          const marketplaceService = require('../services/marketplaceService');
          await marketplaceService.cancelStripeOrder(
            intent.metadata.commerce_order_id,
            intent.cancellation_reason || 'stripe_payment_intent_cancelled',
          );
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
          await recordRevenueFunnelSafely({
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
          }, 'webhook.payment_succeeded');
        }

        try {
          const gemsService = require('../services/gemsService');
          const gemsResult = await gemsService.handleStripeWebhook(event);
          if (gemsResult.handled) {
            console.log('[payments.webhook.stripe] Gems purchase credited', {
              payment_intent: intent.id,
              user_id: gemsResult.user_id,
              gems_credited: gemsResult.gems_credited,
              transaction_id: gemsResult.transaction_id,
            });
          }
        } catch (err) {
          console.error('[payments.webhook.stripe] Failed to fulfill Gems purchase', err);
          throw err;
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

        try {
          const marketplaceService = require('../services/marketplaceService');
          const commerceResult = await marketplaceService.finalizeStripePurchase(intent);
          if (commerceResult.handled) {
            console.log('[payments.webhook.stripe] Commerce payment fulfilled', {
              payment_intent: intent.id,
              receipt_id: commerceResult.receipt_id,
              idempotent: Boolean(commerceResult.idempotent),
            });
          }
        } catch (err) {
          console.error('[payments.webhook.stripe] Failed to fulfill commerce payment', err);
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
