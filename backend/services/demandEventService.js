const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

const EVENT_STAGE = Object.freeze({
  impression: 'discovery', discovered: 'discovery', search_result_opened: 'discovery', map_result_opened: 'discovery', message_delivered: 'discovery',
  qr_scanned: 'interest', campaign_opened: 'interest', saved: 'interest', followed: 'interest', message_consent_granted: 'interest',
  joined: 'participation', rsvp_confirmed: 'participation', checked_in: 'participation', proof_submitted: 'participation',
  purchase_completed: 'conversion', offer_redeemed: 'conversion', booking_completed: 'conversion', proof_verified: 'conversion',
  review_submitted: 'review', review_verified: 'review',
  referral_shared: 'referral', referral_converted: 'referral',
  returned: 'loyalty', repeat_purchase: 'loyalty', loyalty_unlocked: 'loyalty',
  advocated: 'advocacy', creator_content_verified: 'advocacy',
  merchant_goal_reached: 'merchant_growth', community_goal_reached: 'community_growth',
});

function stageFor(eventType) {
  return EVENT_STAGE[eventType] || null;
}

function stableEventKey(input) {
  if (input.idempotencyKey) return input.idempotencyKey;
  const identity = [input.demandPlanId || input.campaignId || 'network', input.sourceSystem, input.sourceReference, input.eventType, input.actorUserId || input.anonymousId || 'system'].join(':');
  return crypto.createHash('sha256').update(identity).digest('hex');
}

function normalizeEvent(input) {
  const stage = input.stage || stageFor(input.eventType);
  if (!input.eventType || !stage) throw new Error(`Unsupported demand event: ${input.eventType || 'missing event type'}`);
  if (!input.sourceSystem) throw new Error('Demand event source system is required');
  if (!input.actorUserId && !input.anonymousId && !input.sourceReference) throw new Error('Demand event needs an actor, anonymous identity, or source reference');
  return {
    idempotency_key: stableEventKey(input),
    demand_plan_id: input.demandPlanId || null,
    campaign_id: input.campaignId || null,
    organization_id: input.organizationId || null,
    actor_user_id: input.actorUserId || null,
    anonymous_id: input.anonymousId || null,
    journey_id: input.journeyId || undefined,
    parent_event_id: input.parentEventId || null,
    event_type: input.eventType,
    stage,
    source_system: input.sourceSystem,
    source_reference: input.sourceReference || null,
    channel: input.channel || null,
    value_amount: input.valueAmount ?? null,
    value_currency: input.valueCurrency || null,
    verified: input.verified === true,
    confidence: input.confidence ?? 1,
    consent_basis: input.consentBasis || null,
    properties: input.properties || {},
    occurred_at: input.occurredAt || new Date().toISOString(),
  };
}

function executionTransitionFor(event) {
  if (event.event_type === 'message_consent_granted' && ['whatsapp', 'email', 'sms'].includes(event.channel)) {
    return { systemName: event.channel, journeyStatus: 'ready', jobStatus: 'completed', waitingFor: null };
  }
  return null;
}

async function applyEventToExecution(event) {
  const transition = executionTransitionFor(event);
  if (!transition || !event.demand_plan_id) return null;
  const now = new Date().toISOString();
  const { error: journeyError } = await supabase.from('promopilot_message_journeys').update({ status: transition.journeyStatus, updated_at: now }).eq('demand_plan_id', event.demand_plan_id).eq('channel', transition.systemName).eq('status', 'awaiting_consent');
  if (journeyError && journeyError.code !== '42P01') throw journeyError;
  const { data: jobs, error: jobError } = await supabase.from('promopilot_execution_jobs').update({ status: transition.jobStatus, result: { consented_audience: true, consent_event_id: event.id }, completed_at: now, updated_at: now }).eq('demand_plan_id', event.demand_plan_id).eq('system_name', transition.systemName).eq('status', 'running').select('id');
  if (jobError && jobError.code !== '42P01') throw jobError;
  return jobs || [];
}

async function recordEvent(input) {
  if (!supabase) throw new Error('Database not available');
  let resolvedInput = input;
  if (!input.campaignId && input.promoPushCampaignId) {
    const { data: artifact, error: artifactError } = await supabase.from('promopilot_execution_artifacts').select('campaign_id,demand_plan_id').eq('reference_type', 'promopush_campaign').eq('reference_id', String(input.promoPushCampaignId)).maybeSingle();
    if (artifactError && artifactError.code !== '42P01') throw artifactError;
    if (artifact) resolvedInput = { ...resolvedInput, campaignId: artifact.campaign_id, demandPlanId: artifact.demand_plan_id };
  }
  if (!resolvedInput.campaignId && input.momentId) {
    const { data: campaign, error: campaignError } = await supabase.from('campaigns').select('id').eq('moment_id', input.momentId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (campaignError && campaignError.code !== '42703') throw campaignError;
    if (campaign) resolvedInput = { ...resolvedInput, campaignId: campaign.id };
  }
  if (resolvedInput.campaignId && !resolvedInput.demandPlanId) {
    const { data: plan, error: planError } = await supabase.from('demand_plans').select('id,organization_id').eq('campaign_id', resolvedInput.campaignId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (planError) throw planError;
    if (plan) resolvedInput = { ...resolvedInput, demandPlanId: plan.id, organizationId: resolvedInput.organizationId || plan.organization_id };
  }
  const event = normalizeEvent(resolvedInput);
  if (event.journey_id === undefined) delete event.journey_id;
  const { data, error } = await supabase.from('demand_events').upsert(event, { onConflict: 'idempotency_key', ignoreDuplicates: true }).select().maybeSingle();
  if (error) throw error;
  if (data) {
    await applyEventToExecution(data);
    return { event: data, idempotent: false };
  }
  const { data: existing, error: existingError } = await supabase.from('demand_events').select('*').eq('idempotency_key', event.idempotency_key).single();
  if (existingError) throw existingError;
  await applyEventToExecution(existing);
  return { event: existing, idempotent: true };
}

function uniquePeople(events, stage) {
  return new Set(events.filter((event) => event.stage === stage).map((event) => event.actor_user_id || event.anonymous_id).filter(Boolean)).size;
}

function summarize(events) {
  const orderedStages = ['discovery', 'interest', 'participation', 'conversion', 'review', 'referral', 'loyalty', 'advocacy', 'merchant_growth', 'community_growth'];
  const counts = Object.fromEntries(orderedStages.map((stage) => [stage, uniquePeople(events, stage)]));
  const verifiedConversions = events.filter((event) => event.stage === 'conversion' && event.verified);
  const revenue = verifiedConversions.reduce((total, event) => total + Number(event.value_amount || 0), 0);
  const ratio = (from, to) => counts[from] > 0 ? Number(((counts[to] / counts[from]) * 100).toFixed(1)) : 0;
  return {
    counts,
    rates: {
      discovery_to_interest: ratio('discovery', 'interest'),
      interest_to_participation: ratio('interest', 'participation'),
      participation_to_conversion: ratio('participation', 'conversion'),
      conversion_to_review: ratio('conversion', 'review'),
      conversion_to_loyalty: ratio('conversion', 'loyalty'),
    },
    verified_conversions: verifiedConversions.length,
    verified_value: Number(revenue.toFixed(2)),
    total_events: events.length,
    last_event_at: events[0]?.occurred_at || null,
  };
}

function benchmarkAgainst(currentSummary, historicalSummaries) {
  const eligible = historicalSummaries.filter((item) => item.total_events > 0);
  if (eligible.length < 5) return { eligible: false, campaign_count: eligible.length, reason: 'Five completed or active campaigns with demand events are required' };
  const rates = eligible.map((item) => item.rates.participation_to_conversion).sort((a, b) => a - b);
  const midpoint = Math.floor(rates.length / 2);
  const median = rates.length % 2 ? rates[midpoint] : (rates[midpoint - 1] + rates[midpoint]) / 2;
  const current = currentSummary.rates.participation_to_conversion;
  return {
    eligible: true,
    campaign_count: eligible.length,
    metric: 'participation_to_conversion',
    current_rate: current,
    cohort_median: Number(median.toFixed(1)),
    difference_points: Number((current - median).toFixed(1)),
  };
}

async function getCampaignIntelligence(campaignId, ownerUserId) {
  if (!supabase) throw new Error('Database not available');
  const { data: plan, error: planError } = await supabase.from('demand_plans').select('*').eq('campaign_id', campaignId).eq('owner_user_id', ownerUserId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (planError) throw planError;
  if (!plan) throw new Error('PromoPilot plan not found or not owned by this user');
  const { data: events, error } = await supabase.from('demand_events').select('*').eq('demand_plan_id', plan.id).order('occurred_at', { ascending: false }).limit(5000);
  if (error) throw error;
  const summary = summarize(events || []);
  let cohortQuery = supabase.from('demand_plans').select('id').eq('owner_user_id', ownerUserId).neq('id', plan.id);
  const goal = plan.intent?.goal;
  if (goal) cohortQuery = cohortQuery.eq('intent->>goal', goal);
  const { data: cohortPlans, error: cohortPlanError } = await cohortQuery.limit(50);
  if (cohortPlanError) throw cohortPlanError;
  let benchmark = benchmarkAgainst(summary, []);
  if (cohortPlans?.length) {
    const cohortIds = cohortPlans.map((item) => item.id);
    const { data: cohortEvents, error: cohortError } = await supabase.from('demand_events').select('*').in('demand_plan_id', cohortIds).order('occurred_at', { ascending: false }).limit(25000);
    if (cohortError) throw cohortError;
    const grouped = new Map(cohortIds.map((id) => [id, []]));
    for (const event of cohortEvents || []) grouped.get(event.demand_plan_id)?.push(event);
    benchmark = benchmarkAgainst(summary, [...grouped.values()].map(summarize));
  }
  return { plan, events: events || [], summary, benchmark };
}

module.exports = { EVENT_STAGE, stageFor, stableEventKey, normalizeEvent, executionTransitionFor, recordEvent, summarize, benchmarkAgainst, getCampaignIntelligence };
