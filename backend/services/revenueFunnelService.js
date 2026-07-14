const { supabase } = require('../lib/supabase');

const FUNNELS = new Set(['campaign', 'membership', 'marketplace', 'gems', 'sponsorship', 'featured']);
const STAGES = new Set([
  'captured', 'qualified', 'checkout_started', 'payment_succeeded', 'payment_failed',
  'fulfilled', 'outcome_measured', 'follow_up_sent', 'repeat_conversion',
]);

function validateEvent(event) {
  if (!FUNNELS.has(event.funnel)) throw new Error(`Unsupported revenue funnel: ${event.funnel}`);
  if (!STAGES.has(event.stage)) throw new Error(`Unsupported revenue stage: ${event.stage}`);
  if (event.amount != null && (!Number.isFinite(Number(event.amount)) || Number(event.amount) < 0)) {
    throw new Error('amount must be a non-negative number');
  }
}

async function record(event) {
  validateEvent(event);
  if (!supabase) return { skipped: true, reason: 'supabase_unavailable' };

  const row = {
    occurred_at: event.occurredAt || new Date().toISOString(),
    user_id: event.userId || null,
    session_id: event.sessionId || null,
    funnel: event.funnel,
    stage: event.stage,
    entity_type: event.entityType || null,
    entity_id: event.entityId ? String(event.entityId) : null,
    source: event.source || 'server',
    provider: event.provider || null,
    provider_event_id: event.providerEventId || null,
    amount: event.amount == null ? null : Number(event.amount),
    currency: event.currency ? String(event.currency).toUpperCase() : null,
    metadata: event.metadata || {},
    idempotency_key: event.idempotencyKey || null,
  };

  const query = event.idempotencyKey
    ? supabase.from('revenue_funnel_events').upsert(row, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    : supabase.from('revenue_funnel_events').insert(row);
  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw error;
  if (event.userId && ['checkout_started', 'payment_succeeded'].includes(event.stage)) {
    try {
      const growth = require('./growthOperatingService');
      await growth.recordEvent({
        eventName: event.stage,
        journey: ['campaign', 'sponsorship', 'featured'].includes(event.funnel) ? 'commercial' : 'participant',
        stage: event.stage === 'payment_succeeded' ? 'monetized' : 'captured',
        userId: event.userId,
        source: event.source || event.provider || 'server',
        medium: event.provider || null,
        campaign: event.funnel,
        entityType: event.entityType || null,
        entityId: event.entityId || null,
        value: event.amount,
        currency: event.currency,
        properties: { funnel: event.funnel, provider_event_id: event.providerEventId || null },
        idempotencyKey: event.idempotencyKey ? `growth:${event.idempotencyKey}` : null,
      });
    } catch (growthError) {
      console.warn('[Revenue Funnel] growth mirror skipped:', growthError.message);
    }
  }
  return { id: data?.id || null, duplicate: !data?.id };
}

async function summary({ startAt, endAt, funnel } = {}) {
  if (!supabase) return { rows: [], skipped: true };
  let query = supabase
    .from('revenue_funnel_events')
    .select('funnel,stage,amount,currency,user_id,session_id,occurred_at');
  if (startAt) query = query.gte('occurred_at', startAt);
  if (endAt) query = query.lte('occurred_at', endAt);
  if (funnel) query = query.eq('funnel', funnel);
  const { data, error } = await query.order('occurred_at', { ascending: true });
  if (error) throw error;

  const grouped = {};
  for (const event of data || []) {
    const bucket = grouped[event.funnel] ||= { funnel: event.funnel, stages: {}, revenue: 0 };
    bucket.stages[event.stage] = (bucket.stages[event.stage] || 0) + 1;
    if (event.stage === 'payment_succeeded') bucket.revenue += Number(event.amount || 0);
  }
  return { rows: Object.values(grouped) };
}

module.exports = { record, summary, validateEvent };
