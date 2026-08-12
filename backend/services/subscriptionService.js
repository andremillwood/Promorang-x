const { supabase: serviceSupabase } = require('../lib/supabase');
const { getSubscriptionPlan } = require('../config/subscriptionPlans');

const supabase = global.supabase || serviceSupabase || null;

function toIso(unixSeconds) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

async function syncStripeSubscription(subscription, overrides = {}) {
  if (!supabase || !subscription) return null;
  const metadata = { ...(subscription.metadata || {}), ...(overrides.metadata || {}) };
  const planKey = String(overrides.planId || metadata.plan_id || metadata.plan || '').toUpperCase();
  const plan = getSubscriptionPlan(planKey);
  const userId = overrides.userId || metadata.user_id;
  if (!plan || !userId) return null;

  const status = subscription.status === 'canceled' ? 'cancelled' : subscription.status;
  const row = {
    user_id: userId,
    stakeholder_role: plan.role,
    plan_key: planKey,
    status,
    stripe_customer_id: subscription.customer || overrides.customerId || null,
    stripe_subscription_id: subscription.id,
    current_period_start: toIso(subscription.current_period_start),
    current_period_end: toIso(subscription.current_period_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    metadata,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('stakeholder_subscriptions')
    .upsert(row, { onConflict: 'user_id,stakeholder_role' })
    .select()
    .single();
  if (error) throw error;

  if (plan.role === 'participant') {
    const { error: userError } = await supabase.from('users').update({
      plan_id: status === 'active' || status === 'trialing' ? planKey : 'FREE',
      plan_updated_at: new Date().toISOString(),
    }).eq('id', userId);
    // Older production schemas do not expose the legacy users.plan_id mirror.
    // stakeholder_subscriptions is authoritative, so a missing compatibility
    // column must never reject a valid Stripe webhook.
    if (userError && userError.code !== 'PGRST204' && userError.code !== '42703') {
      throw userError;
    }
  }
  return data;
}

async function markInvoicePastDue({ userId, planId, subscriptionId, customerId, invoiceId }) {
  if (!supabase || !userId) return null;
  const plan = getSubscriptionPlan(planId);
  if (!plan) return null;
  const { data, error } = await supabase.from('stakeholder_subscriptions').upsert({
    user_id: userId,
    stakeholder_role: plan.role,
    plan_key: String(planId).toUpperCase(),
    status: 'past_due',
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    metadata: { latest_failed_invoice_id: invoiceId },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,stakeholder_role' }).select().single();
  if (error) throw error;
  return data;
}

module.exports = { syncStripeSubscription, markInvoicePastDue };
