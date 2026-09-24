const { supabase: serviceSupabase } = require('../lib/supabase');

function db() { return global.supabase || serviceSupabase || null; }

async function consent(userId, kind) {
  const database = db();
  if (!database || !userId) return false;
  const { data, error } = await database.from('commercial_notification_preferences').select('demand_response_enabled,activation_lifecycle_enabled').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (kind === 'demand_response') return data?.demand_response_enabled === true;
  return data?.activation_lifecycle_enabled !== false;
}

async function emit({ userId, kind, type, title, message, relatedId, route, dedupeKey, metadata = {} }) {
  const database = db();
  if (!database || !(await consent(userId, kind))) return { sent: false, reason: 'consent' };
  const { data, error } = await database.from('notifications').upsert({
    user_id: userId,
    notification_type: kind === 'demand_response' ? 'market_watch_changed' : 'order_update',
    type,
    title,
    message,
    related_id: relatedId || null,
    is_read: false,
    dedupe_key: dedupeKey,
    action_url: route,
    route,
    metadata: { ...metadata, consent_kind: kind },
  }, { onConflict: 'dedupe_key', ignoreDuplicates: true }).select('id').maybeSingle();
  if (error) throw error;
  return { sent: Boolean(data), id: data?.id || null };
}

async function notifyDemandResponse({ discoveryId, proposalId, title, route }) {
  const database = db();
  if (!database || !discoveryId || !proposalId) return { sent: 0 };
  const { data: votes, error } = await database.from('discovery_votes').select('user_id').eq('discovery_id', discoveryId);
  if (error) throw error;
  const recipients = [...new Set((votes || []).map((vote) => vote.user_id).filter(Boolean))];
  const results = await Promise.allSettled(recipients.map((userId) => emit({
    userId,
    kind: 'demand_response',
    type: 'demand_response_available',
    title: 'Something you wanted has a response',
    message: title || 'An operator responded to recorded demand. Open it to see what is actually available.',
    relatedId: proposalId,
    route: route || `/dashboard/proposals/${proposalId}`,
    dedupeKey: `demand-response:${discoveryId}:${proposalId}:${userId}`,
    metadata: { discovery_id: discoveryId, proposal_id: proposalId },
  })));
  return { sent: results.filter((result) => result.status === 'fulfilled' && result.value.sent).length, eligible: recipients.length };
}

async function notifyActivationLifecycle({ proposalId, userIds = [], state, title, message }) {
  const recipients = [...new Set(userIds.filter(Boolean))];
  const results = await Promise.allSettled(recipients.map((userId) => emit({
    userId,
    kind: 'activation_lifecycle',
    type: `activation_${state}`,
    title,
    message,
    relatedId: proposalId,
    route: `/dashboard/proposals/${proposalId}`,
    dedupeKey: `activation:${proposalId}:${state}:${userId}`,
    metadata: { proposal_id: proposalId, lifecycle_state: state },
  })));
  return { sent: results.filter((result) => result.status === 'fulfilled' && result.value.sent).length };
}

module.exports = { consent, emit, notifyDemandResponse, notifyActivationLifecycle };
