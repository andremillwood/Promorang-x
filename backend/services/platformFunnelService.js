const { supabase } = require('../lib/supabase');

const FUNNELS = Object.freeze({
  participant: ['reserved', 'verified', 'account', 'invited', 'returned'],
  operator: ['brief_captured', 'published', 'first_customer', 'repeat_activation'],
  brand: ['brief_captured', 'pilot_scoped', 'funded', 'outcome_report', 'renewed'],
});

function progress(funnel, events = []) {
  if (!FUNNELS[funnel]) throw new Error('Unknown funnel');
  const matching = events.filter(event => event.funnel === funnel);
  const stages = FUNNELS[funnel].map(stage => ({
    stage,
    complete: matching.some(event => event.stage === stage),
    evidence: matching.find(event => event.stage === stage) || null,
  }));
  return { funnel, stages, nextStage: stages.find(stage => !stage.complete)?.stage || null };
}

async function readEvents(userId) {
  if (!supabase) throw new Error('Funnel service unavailable');
  // One latest receipt per checkpoint is enough for progress. Do not fetch a
  // limited activity feed and accidentally forget a user's older achievements.
  const queries = Object.entries(FUNNELS).flatMap(([funnel, stages]) => stages.map(async stage => {
    const { data, error } = await supabase.from('platform_funnel_events')
      .select('funnel,stage,entity_type,entity_id,occurred_at,metadata')
      .eq('user_id', userId).eq('funnel', funnel).eq('stage', stage)
      .order('occurred_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }));
  return (await Promise.all(queries)).filter(Boolean);
}

async function mine(userId) {
  const events = await readEvents(userId);
  return Object.fromEntries(Object.keys(FUNNELS).map(funnel => [funnel, progress(funnel, events)]));
}

async function linkLeads(user) {
  // The email must come from verified Supabase Auth, never the browser payload.
  if (!supabase || !user?.is_verified || !user.email) return { linked: 0 };
  const { data, error } = await supabase.from('crm_leads').update({ user_id: user.id })
    .eq('email', user.email.trim().toLowerCase()).is('user_id', null).select('id');
  if (error) throw error;
  return { linked: data?.length || 0 };
}

async function ownedCampaign(campaignId, userId) {
  const { data, error } = await supabase.from('campaigns').select('*')
    .eq('id', campaignId).eq('brand_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) throw Object.assign(new Error('Campaign not found in your workspace'), { status: 404 });
  return data;
}

function reportMetrics(events) {
  const verified = events.filter(event => event.verified === true);
  const people = types => new Set(verified.filter(event => types.includes(event.event_type))
    .map(event => event.actor_user_id || event.anonymous_id).filter(Boolean)).size;
  return {
    reservations: people(['rsvp_confirmed', 'joined']),
    attendance: people(['checked_in']),
    redemptions: people(['offer_redeemed']),
    purchases: people(['purchase_completed']),
    acceptedProofs: people(['proof_verified', 'creator_content_verified']),
    returningPeople: people(['returned', 'repeat_purchase']),
    lastOutcomeAt: verified.find(event => ['checked_in', 'offer_redeemed', 'purchase_completed', 'proof_verified', 'creator_content_verified'].includes(event.event_type))?.occurred_at || null,
  };
}

async function campaignReport(campaignId, userId) {
  const campaign = await ownedCampaign(campaignId, userId);
  // Page through the entire record: a report must not silently truncate outcomes.
  const events = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('demand_events')
      .select('event_type,verified,actor_user_id,anonymous_id,occurred_at')
      .eq('campaign_id', campaignId).order('occurred_at', { ascending: false })
      .order('id', { ascending: false }).range(offset, offset + 999);
    if (error) throw error;
    events.push(...(data || []));
    if ((data || []).length < 1000) break;
  }
  let reserve = null;
  if (campaign.activation_proposal_id) {
    const result = await supabase.from('activation_gem_reserves')
      .select('secured_gems,released_gems,refunded_gems')
      .eq('proposal_id', campaign.activation_proposal_id).maybeSingle();
    if (result.error) throw result.error;
    reserve = result.data;
  }
  const metrics = reportMetrics(events);
  const funded = Boolean(reserve && Number(reserve.secured_gems) > Number(reserve.refunded_gems));
  return {
    campaign: { id: campaign.id, title: campaign.title, description: campaign.description, isActive: campaign.is_active },
    metrics,
    funding: { funded, securedGems: Number(reserve?.secured_gems || 0), releasedGems: Number(reserve?.released_gems || 0), refundedGems: Number(reserve?.refunded_gems || 0) },
    canRenew: funded && Boolean(metrics.lastOutcomeAt),
    evidence: 'Verified demand events and the activation Gem reserve',
  };
}

async function acknowledgeReport(campaignId, userId) {
  const report = await campaignReport(campaignId, userId);
  if (!report.canRenew) throw Object.assign(new Error('A funded campaign with verified outcomes is required before reviewing its renewal'), { status: 409 });
  const { error } = await supabase.from('platform_funnel_events').upsert({
    event_key: `brand:outcome_report:campaign:${campaignId}:${userId}`,
    funnel: 'brand', stage: 'outcome_report', user_id: userId,
    entity_type: 'campaign', entity_id: campaignId,
    metadata: { metrics: report.metrics },
  }, { onConflict: 'event_key', ignoreDuplicates: true });
  if (error) throw error;
  return report;
}

function chooseInvitations(source, candidates, now = Date.now()) {
  return candidates.filter(moment => moment.id !== source.id && moment.is_active !== false
    && ['active', 'live', 'scheduled', 'joinable', 'funded'].includes(moment.status)
    && new Date(moment.starts_at).getTime() > now
    && ((source.city && moment.city === source.city) || (source.category && moment.category === source.category)))
    .map(moment => ({ ...moment, relevance: Number(Boolean(source.city && moment.city === source.city)) * 2 + Number(Boolean(source.category && moment.category === source.category)) }))
    .sort((a, b) => b.relevance - a.relevance || new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 3).map(({ id, title, starts_at, location, city, category }) => ({ id, title, kind: 'moment', startsAt: starts_at, location, city, category, href: `/moments/${id}` }));
}

async function invitations(sourceId, userId, sourceKind = 'moment') {
  let source;
  if (sourceKind === 'offer') {
    if (!userId) throw Object.assign(new Error('Sign in to see invitations after your redemption'), { status: 401 });
    const { data: redeemed, error } = await supabase.from('offer_issuances').select('id')
      .eq('user_id', userId).eq('offer_id', sourceId).eq('status', 'redeemed').limit(1).maybeSingle();
    if (error) throw error;
    if (!redeemed) throw Object.assign(new Error('Redeemed perk not found in your account'), { status: 404 });
    const offer = await supabase.from('offers').select('id,metadata').eq('id', sourceId).single();
    if (offer.error) throw offer.error;
    source = { id: sourceId, city: offer.data.metadata?.city, category: offer.data.metadata?.category };
  } else {
    const result = await supabase.from('moments').select('id,city,category,status,is_active').eq('id', sourceId).maybeSingle();
    if (result.error) throw result.error;
    source = result.data;
    if (!source || !['active', 'scheduled', 'joinable', 'funded', 'closed', 'archived', 'processing'].includes(source.status)) {
      throw Object.assign(new Error('Public Moment not found'), { status: 404 });
    }
  }
  const { data: candidates, error: candidateError } = await supabase.from('moments')
    .select('id,title,starts_at,location,city,category,status,is_active')
    .in('status', ['active', 'scheduled', 'joinable', 'funded'])
    .gte('starts_at', new Date().toISOString()).order('starts_at').limit(200);
  if (candidateError) throw candidateError;
  const matches = chooseInvitations(source, candidates || []);
  if (source.city && matches.length < 3) {
    const offers = await require('./offerService').listPublicOffers({ cityName: source.city, limit: 100 });
    matches.push(...offers.filter(offer => offer.id !== sourceId
      && (offer.quantity_total == null || Number(offer.quantity_reserved || 0) + Number(offer.quantity_redeemed || 0) < Number(offer.quantity_total)))
      .slice(0, 3 - matches.length).map(offer => ({ id: offer.id, title: offer.title, kind: 'offer', startsAt: null, location: offer.metadata?.city || '', city: offer.metadata?.city || '', href: `/offers/${offer.id}` })));
  }
  if (matches.length && userId) {
    const { data: verified, error: evidenceError } = await supabase.from('platform_funnel_events').select('id')
      .eq('user_id', userId).eq('funnel', 'participant').eq('stage', 'verified')
      .eq('entity_type', sourceKind).eq('entity_id', sourceId).limit(1).maybeSingle();
    if (evidenceError) throw evidenceError;
    if (verified) {
      const { error: invitationError } = await supabase.from('platform_funnel_events').upsert({
        event_key: `participant:invited:${sourceKind}:${sourceId}:${userId}`,
        funnel: 'participant', stage: 'invited', user_id: userId,
        entity_type: sourceKind, entity_id: sourceId,
        metadata: { invitations: matches.map(moment => moment.id) },
      }, { onConflict: 'event_key', ignoreDuplicates: true });
      if (invitationError) throw invitationError;
    }
  }
  return matches;
}

async function latestBrief(user) {
  await linkLeads(user);
  const { data, error } = await supabase.from('crm_leads').select('id,answers')
    .eq('user_id', user.id).in('funnel_key', ['demand','moment','sponsor'])
    .order('last_captured_at', { ascending: false }).limit(20);
  if (error) throw error;
  const row = (data || []).find(lead => lead.answers?.business_outcome_brief);
  return row ? { ...row.answers.business_outcome_brief, leadId: row.id } : null;
}

function summarize(events) {
  const identities = new Map();
  for (const event of events) {
    const key = event.user_id || event.anonymous_id;
    if (!key || !FUNNELS[event.funnel]) continue;
    const bucket = identities.get(`${event.funnel}:${key}`) || new Set();
    bucket.add(event.stage);
    identities.set(`${event.funnel}:${key}`, bucket);
  }
  return Object.entries(FUNNELS).map(([funnel, stages]) => {
    const cohorts = [...identities.entries()].filter(([key]) => key.startsWith(`${funnel}:`)).map(([, stages]) => stages);
    const checkpoints = stages.map(stage => ({ stage, people: cohorts.filter(cohort => cohort.has(stage)).length }));
    return { funnel, entered: cohorts.length, checkpoints, completed: cohorts.filter(cohort => stages.every(stage => cohort.has(stage))).length };
  });
}

async function summary() {
  const events = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from('platform_funnel_events')
      .select('funnel,stage,user_id,anonymous_id').order('id').range(offset, offset + 999);
    if (error) throw error;
    events.push(...(data || []));
    if ((data || []).length < 1000) break;
  }
  return summarize(events);
}

module.exports = { FUNNELS, progress, mine, linkLeads, latestBrief, campaignReport, acknowledgeReport, reportMetrics, chooseInvitations, invitations, summarize, summary };
