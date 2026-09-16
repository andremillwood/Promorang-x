const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;
const TRUTH_CLASSES = new Set(['observed', 'attributed', 'verified', 'incremental', 'administrative']);

function compact(value) {
  if (Array.isArray(value)) return value.map(compact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, compact(item)]));
  }
  return value;
}

function validateBuiltEvent(event = {}) {
  if (!event.event_name) throw new Error('Canonical event name is required');
  if (!event.object_type || !event.object_id) throw new Error('Canonical event object type and id are required');
  if (!event.source) throw new Error('Canonical event source is required');
  if (!event.idempotency_key) throw new Error('Canonical event idempotency key is required');
  if (!TRUTH_CLASSES.has(event.truth_class || 'observed')) throw new Error(`Unsupported canonical truth class: ${event.truth_class}`);
  return compact({ ...event, truth_class: event.truth_class || 'observed' });
}

function buildCanonicalEvent(input = {}) {
  if (!input.eventName) throw new Error('Canonical event name is required');
  if (!input.objectType || !input.objectId) throw new Error('Canonical event object type and id are required');
  if (!input.source) throw new Error('Canonical event source is required');
  if (!input.idempotencyKey) throw new Error('Canonical event idempotency key is required');
  const truthClass = input.truthClass || 'observed';
  if (!TRUTH_CLASSES.has(truthClass)) throw new Error(`Unsupported canonical truth class: ${truthClass}`);

  return compact({
    event_name: input.eventName,
    event_version: input.eventVersion || 1,
    occurred_at: input.occurredAt || new Date().toISOString(),
    actor_user_id: input.actorUserId || null,
    actor_organization_id: input.actorOrganizationId || null,
    actor_role: input.actorRole || null,
    subject_user_id: input.subjectUserId || null,
    object_type: input.objectType,
    object_id: String(input.objectId),
    aggregate_type: input.aggregateType || null,
    aggregate_id: input.aggregateId ? String(input.aggregateId) : null,
    place_id: input.placeId ? String(input.placeId) : null,
    campaign_id: input.campaignId ? String(input.campaignId) : null,
    experience_id: input.experienceId ? String(input.experienceId) : null,
    source: input.source,
    source_event_id: input.sourceEventId || null,
    causation_event_id: input.causationEventId || null,
    correlation_id: input.correlationId || null,
    idempotency_key: input.idempotencyKey,
    truth_class: truthClass,
    reversal_of_event_id: input.reversalOfEventId || null,
    metadata: input.metadata || {},
  });
}

function normalizeForWrite(input = {}) {
  return input.event_name ? validateBuiltEvent(input) : buildCanonicalEvent(input);
}

async function recordEvent(input) {
  if (!supabase) throw new Error('Database not available');
  const event = normalizeForWrite(input);
  const { data, error } = await supabase
    .from('canonical_events')
    .upsert(event, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    .select()
    .maybeSingle();
  if (error) throw error;
  if (data) return { event: data, idempotent: false };

  const { data: existing, error: existingError } = await supabase
    .from('canonical_events')
    .select('*')
    .eq('idempotency_key', event.idempotency_key)
    .maybeSingle();
  if (existingError) throw existingError;
  return { event: existing || event, idempotent: true };
}

async function recordBestEffort(input) {
  const event = normalizeForWrite(input);
  try {
    return await recordEvent(event);
  } catch (error) {
    if (['42P01', 'PGRST205'].includes(error?.code) || /canonical_events/i.test(error?.message || '')) {
      console.warn('[Canonical Event] journal unavailable:', error.message);
      return { event, idempotent: false, recorded: false };
    }
    console.error('[Canonical Event] write failed:', error);
    return { event, idempotent: false, recorded: false, error: error.message };
  }
}

async function getObjectEvents({ objectType, objectId, aggregateType = null, aggregateId = null, limit = 100 }) {
  if (!supabase) throw new Error('Database not available');
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 250);
  let query = supabase
    .from('canonical_events')
    .select('*')
    .order('occurred_at', { ascending: true })
    .limit(safeLimit);

  if (objectType && objectId) query = query.eq('object_type', objectType).eq('object_id', String(objectId));
  else if (aggregateType && aggregateId) query = query.eq('aggregate_type', aggregateType).eq('aggregate_id', String(aggregateId));
  else throw new Error('Canonical lineage query needs an object or aggregate identity');

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getObjectEventsBestEffort(input) {
  try {
    return await getObjectEvents(input);
  } catch (error) {
    if (['42P01', 'PGRST205'].includes(error?.code) || /canonical_events/i.test(error?.message || '')) return [];
    console.warn('[Canonical Event] lineage read failed:', error.message);
    return [];
  }
}

function correctionEvent({ priorEvent, actorUserId, reason, eventName = 'truth.correction.recorded', resultingTruthClass = 'administrative' }) {
  if (!priorEvent?.id) throw new Error('Canonical correction requires the prior event id');
  if (!reason) throw new Error('Canonical correction requires a reason');
  return buildCanonicalEvent({
    eventName,
    actorUserId,
    actorRole: 'admin_correction_operator',
    subjectUserId: priorEvent.subject_user_id || null,
    objectType: priorEvent.object_type,
    objectId: priorEvent.object_id,
    aggregateType: priorEvent.aggregate_type || null,
    aggregateId: priorEvent.aggregate_id || null,
    placeId: priorEvent.place_id || null,
    campaignId: priorEvent.campaign_id || null,
    experienceId: priorEvent.experience_id || null,
    source: 'canonical.correction',
    sourceEventId: `correction:${priorEvent.id}`,
    causationEventId: priorEvent.id,
    correlationId: priorEvent.correlation_id || null,
    idempotencyKey: `canonical:correction:${priorEvent.id}:${eventName}`,
    truthClass: resultingTruthClass,
    reversalOfEventId: priorEvent.id,
    metadata: {
      reason,
      prior_event_name: priorEvent.event_name,
      prior_truth_class: priorEvent.truth_class,
    },
  });
}

function offerRedemptionEvent({ actorUserId, issuance, venueId }) {
  const offer = issuance?.offers || issuance?.offer || {};
  return buildCanonicalEvent({
    eventName: 'offer.redemption.verified',
    actorUserId,
    actorRole: 'merchant_operator',
    subjectUserId: issuance?.user_id || null,
    objectType: 'offer_issuance',
    objectId: issuance?.id,
    aggregateType: 'offer',
    aggregateId: issuance?.offer_id,
    placeId: venueId || offer.venue_id || null,
    source: 'api.offers.redeem',
    sourceEventId: `offer_redemption:${issuance?.id}:redeemed`,
    correlationId: `offer:${issuance?.offer_id}:issuance:${issuance?.id}`,
    idempotencyKey: `canonical:offer-redemption:${issuance?.id}`,
    truthClass: 'verified',
    occurredAt: issuance?.redeemed_at || new Date().toISOString(),
    metadata: {
      offer_id: issuance?.offer_id || null,
      fulfillment_type: offer.fulfillment_type || null,
      reward_type: offer.reward_type || null,
      domain_record: 'offer_redemption_events',
    },
  });
}

function proofSubmissionEvent({ submission, momentId, userId }) {
  return buildCanonicalEvent({
    eventName: 'proof.submission.observed',
    actorUserId: userId,
    actorRole: 'participant',
    subjectUserId: userId,
    objectType: 'proof_submission',
    objectId: submission?.id,
    aggregateType: 'experience',
    aggregateId: momentId,
    experienceId: momentId,
    source: 'api.proof.submit',
    sourceEventId: `proof_submission:${submission?.id}`,
    correlationId: `experience:${momentId}:participant:${userId}`,
    idempotencyKey: `canonical:proof-submission:${submission?.id}`,
    truthClass: 'observed',
    occurredAt: submission?.created_at || new Date().toISOString(),
    metadata: { domain_record: 'proof_submissions' },
  });
}

function proofReviewEvent({ submission, reviewerId, action, result }) {
  const approved = action === 'approve';
  return buildCanonicalEvent({
    eventName: approved ? 'proof.review.verified' : 'proof.review.rejected',
    actorUserId: reviewerId,
    actorRole: 'host_or_admin_reviewer',
    subjectUserId: submission?.user_id || null,
    objectType: 'proof_submission',
    objectId: submission?.id,
    aggregateType: 'experience',
    aggregateId: submission?.moment_id,
    experienceId: submission?.moment_id,
    source: 'api.proof.review',
    sourceEventId: `proof_review:${submission?.id}:${action}`,
    correlationId: `experience:${submission?.moment_id}:participant:${submission?.user_id}`,
    idempotencyKey: `canonical:proof-review:${submission?.id}:${action}`,
    truthClass: approved ? 'verified' : 'administrative',
    occurredAt: result?.submission?.reviewed_at || new Date().toISOString(),
    metadata: {
      action,
      resulting_state: result?.submission?.submission_state || (approved ? 'verified' : 'rejected'),
      source_mission_id: submission?.proof_bundle?.source_mission_id || submission?.proof_bundle?.mission_id || null,
      domain_record: 'proof_submissions',
    },
  });
}

function settlementQueuedEvent({ queueItem, ledger, proofSubmission, actorUserId = null }) {
  const proofSubmissionId = queueItem?.proof_submission_id || proofSubmission?.id || null;
  const momentId = queueItem?.moment_id || proofSubmission?.moment_id || ledger?.moment_id || null;
  const subjectUserId = queueItem?.user_id || proofSubmission?.user_id || ledger?.user_id || null;
  return buildCanonicalEvent({
    eventName: 'settlement.payout.queued',
    actorUserId,
    actorRole: actorUserId ? 'host_or_admin_reviewer' : 'system',
    subjectUserId,
    objectType: 'manual_payout_queue',
    objectId: queueItem?.id,
    aggregateType: 'proof_submission',
    aggregateId: proofSubmissionId,
    experienceId: momentId,
    source: 'momentEconomy.executePayoutForProof',
    sourceEventId: `manual_payout_queue:${queueItem?.id}:queued`,
    correlationId: proofSubmissionId ? `proof:${proofSubmissionId}:settlement` : `payout:${queueItem?.id}`,
    idempotencyKey: `canonical:settlement-queued:${queueItem?.id}`,
    truthClass: 'administrative',
    occurredAt: queueItem?.created_at || ledger?.created_at || new Date().toISOString(),
    metadata: {
      proof_submission_id: proofSubmissionId,
      ledger_id: queueItem?.ledger_id || ledger?.id || null,
      amount_jmd: queueItem?.amount_jmd ?? ledger?.amount_jmd ?? null,
      status: queueItem?.status || 'queued',
      domain_record: 'manual_payout_queue',
    },
  });
}

function settlementPaidEvent({ queueItem, adminId }) {
  return buildCanonicalEvent({
    eventName: 'settlement.payout.paid',
    actorUserId: adminId || queueItem?.paid_by || null,
    actorRole: 'admin_settlement_operator',
    subjectUserId: queueItem?.user_id || null,
    objectType: 'manual_payout_queue',
    objectId: queueItem?.id,
    aggregateType: 'proof_submission',
    aggregateId: queueItem?.proof_submission_id || null,
    experienceId: queueItem?.moment_id || null,
    source: 'momentEconomy.markManualPayoutPaid',
    sourceEventId: `manual_payout_queue:${queueItem?.id}:paid`,
    correlationId: queueItem?.proof_submission_id ? `proof:${queueItem.proof_submission_id}:settlement` : `payout:${queueItem?.id}`,
    idempotencyKey: `canonical:settlement-paid:${queueItem?.id}`,
    truthClass: 'verified',
    occurredAt: queueItem?.paid_at || new Date().toISOString(),
    metadata: {
      proof_submission_id: queueItem?.proof_submission_id || null,
      ledger_id: queueItem?.ledger_id || null,
      amount_jmd: queueItem?.amount_jmd ?? null,
      status: queueItem?.status || 'paid',
      payment_reference_present: Boolean(queueItem?.payment_reference),
      domain_record: 'manual_payout_queue',
    },
  });
}

module.exports = {
  TRUTH_CLASSES,
  buildCanonicalEvent,
  normalizeForWrite,
  recordEvent,
  recordBestEffort,
  getObjectEvents,
  getObjectEventsBestEffort,
  correctionEvent,
  offerRedemptionEvent,
  proofSubmissionEvent,
  proofReviewEvent,
  settlementQueuedEvent,
  settlementPaidEvent,
};
