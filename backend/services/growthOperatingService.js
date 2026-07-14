const crypto = require('crypto');
const { supabase } = require('../lib/supabase');

const EVENT_NAMES = new Set([
  'page_view', 'cta_clicked', 'signup_started', 'signup_completed',
  'onboarding_completed', 'moment_joined', 'proof_submitted',
  'verified_outcome', 'share_created', 'referral_signup',
  'referral_activated', 'checkout_started', 'payment_succeeded',
  'repeat_outcome',
]);
const JOURNEYS = new Set(['participant', 'commercial', 'shared']);
const STAGES = new Set(['acquired', 'captured', 'activated', 'outcome', 'amplified', 'monetized', 'retained']);
const PUBLIC_EVENTS = new Set(['page_view', 'cta_clicked', 'signup_started']);

function cleanText(value, max = 500) {
  if (value === undefined || value === null || value === '') return null;
  return String(value).trim().slice(0, max) || null;
}

function uuidOrNull(value) {
  const cleaned = cleanText(value, 40);
  return cleaned && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleaned)
    ? cleaned
    : null;
}

function safeProperties(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const serialized = JSON.stringify(value);
  if (serialized.length > 10000) throw new Error('properties payload is too large');
  return value;
}

function validateEvent(event, { publicRequest = false } = {}) {
  if (!EVENT_NAMES.has(event.eventName)) throw new Error('Unsupported growth event');
  if (!JOURNEYS.has(event.journey)) throw new Error('Unsupported growth journey');
  if (!STAGES.has(event.stage)) throw new Error('Unsupported growth stage');
  if (publicRequest && !PUBLIC_EVENTS.has(event.eventName)) throw new Error('Authentication required for this event');
  if (!event.anonymousId && !event.userId) throw new Error('anonymousId or authenticated user is required');
  if (event.value != null && (!Number.isFinite(Number(event.value)) || Number(event.value) < 0)) {
    throw new Error('value must be a non-negative number');
  }
}

async function recordEvent(event, options = {}) {
  validateEvent(event, options);
  if (!supabase) return { skipped: true, reason: 'supabase_unavailable' };

  const row = {
    occurred_at: event.occurredAt || new Date().toISOString(),
    anonymous_id: cleanText(event.anonymousId, 100),
    session_id: cleanText(event.sessionId, 100),
    user_id: event.userId || null,
    event_name: event.eventName,
    journey: event.journey,
    stage: event.stage,
    source: cleanText(event.source, 120),
    medium: cleanText(event.medium, 120),
    campaign: cleanText(event.campaign, 200),
    content: cleanText(event.content, 200),
    term: cleanText(event.term, 200),
    referrer_url: cleanText(event.referrerUrl, 1000),
    referral_code: cleanText(event.referralCode, 40)?.toUpperCase() || null,
    promopush_campaign_id: uuidOrNull(event.promoPushCampaignId),
    promopush_channel_id: uuidOrNull(event.promoPushChannelId),
    moment_id: uuidOrNull(event.momentId),
    entity_type: cleanText(event.entityType, 100),
    entity_id: cleanText(event.entityId, 200),
    experiment_key: cleanText(event.experimentKey, 100),
    experiment_variant: cleanText(event.experimentVariant, 100),
    value: event.value == null ? null : Number(event.value),
    currency: cleanText(event.currency, 10)?.toUpperCase() || null,
    properties: safeProperties(event.properties),
    idempotency_key: cleanText(event.idempotencyKey, 300),
  };

  const query = row.idempotency_key
    ? supabase.from('growth_events').upsert(row, { onConflict: 'idempotency_key', ignoreDuplicates: true })
    : supabase.from('growth_events').insert(row);
  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw error;
  return { id: data?.id || null, duplicate: !data?.id };
}

async function linkIdentity({ anonymousId, userId, firstTouch = {}, lastTouch = {} }) {
  if (!anonymousId || !userId) throw new Error('anonymousId and userId are required');
  if (!supabase) return { skipped: true, reason: 'supabase_unavailable' };

  const { error } = await supabase.from('growth_identity_links').upsert({
    anonymous_id: cleanText(anonymousId, 100),
    user_id: userId,
    linked_at: new Date().toISOString(),
    first_touch: firstTouch,
    last_touch: lastTouch,
  }, { onConflict: 'anonymous_id' });
  if (error) throw error;

  const { error: stitchError } = await supabase
    .from('growth_events')
    .update({ user_id: userId })
    .eq('anonymous_id', anonymousId)
    .is('user_id', null);
  if (stitchError) throw stitchError;
  return { linked: true };
}

function uniqueCount(rows, field, predicate = () => true) {
  return new Set(rows.filter(predicate).map((row) => row[field]).filter(Boolean)).size;
}

function rate(numerator, denominator) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;
}

async function pioneerScorecard({ start, end }) {
  if (!supabase) return { season: null, verifiedContributions: 0, verifiedPoints: 0, contributors: 0, pendingReviews: 0, fraudFlags: 0, byRole: [] };
  try {
    const { data: season, error: seasonError } = await supabase.from('pioneer_seasons')
      .select('id,name,slug,status,starts_at,ends_at,snapshot_at,reward_pool_amount,reward_pool_currency')
      .in('status', ['active', 'frozen', 'reviewing', 'completed'])
      .order('starts_at', { ascending: false }).limit(1).maybeSingle();
    if (seasonError) throw seasonError;
    if (!season) return { season: null, verifiedContributions: 0, verifiedPoints: 0, contributors: 0, pendingReviews: 0, fraudFlags: 0, byRole: [] };

    const [{ data: events, error: eventError }, { count: fraudFlags, error: fraudError }] = await Promise.all([
      supabase.from('pioneer_point_events')
        .select('beneficiary_type,beneficiary_id,contributor_type,status,points,occurred_at')
        .eq('season_id', season.id).gte('occurred_at', start).lte('occurred_at', end).limit(10000),
      supabase.from('pioneer_fraud_flags').select('id', { count: 'exact', head: true })
        .eq('status', 'open'),
    ]);
    if (eventError) throw eventError;
    if (fraudError) throw fraudError;
    const rows = events || [];
    const verified = rows.filter((row) => row.status === 'verified');
    const roleMap = new Map();
    for (const row of rows) {
      const bucket = roleMap.get(row.contributor_type) || { contributorType: row.contributor_type, verifiedContributions: 0, verifiedPoints: 0, pendingReviews: 0, contributors: new Set() };
      if (row.status === 'verified') {
        bucket.verifiedContributions += 1;
        bucket.verifiedPoints += Number(row.points || 0);
        bucket.contributors.add(`${row.beneficiary_type}:${row.beneficiary_id}`);
      }
      if (row.status === 'pending') bucket.pendingReviews += 1;
      roleMap.set(row.contributor_type, bucket);
    }
    return {
      season,
      verifiedContributions: verified.length,
      verifiedPoints: verified.reduce((sum, row) => sum + Number(row.points || 0), 0),
      contributors: new Set(verified.map((row) => `${row.beneficiary_type}:${row.beneficiary_id}`)).size,
      pendingReviews: rows.filter((row) => row.status === 'pending').length,
      fraudFlags: fraudFlags || 0,
      byRole: Array.from(roleMap.values()).map((bucket) => ({
        contributorType: bucket.contributorType,
        verifiedContributions: bucket.verifiedContributions,
        verifiedPoints: bucket.verifiedPoints,
        pendingReviews: bucket.pendingReviews,
        contributors: bucket.contributors.size,
      })).sort((a, b) => b.verifiedPoints - a.verifiedPoints),
    };
  } catch (error) {
    console.warn('[Growth Scorecard] Pioneer overlay unavailable:', error.message);
    return { season: null, verifiedContributions: 0, verifiedPoints: 0, contributors: 0, pendingReviews: 0, fraudFlags: 0, byRole: [], unavailable: true };
  }
}

async function scorecard({ startAt, endAt, journey } = {}) {
  if (!supabase) return { northStar: {}, funnel: {}, sources: [], weekly: [], skipped: true };
  const start = startAt || new Date(Date.now() - 28 * 86400000).toISOString();
  const end = endAt || new Date().toISOString();
  let query = supabase.from('growth_events').select(
    'occurred_at,anonymous_id,user_id,event_name,journey,stage,source,medium,campaign,moment_id,value,currency'
  ).gte('occurred_at', start).lte('occurred_at', end).order('occurred_at', { ascending: true }).limit(10000);
  if (journey) query = query.eq('journey', journey);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data || [];

  const visitors = uniqueCount(rows, 'anonymous_id');
  const signups = uniqueCount(rows, 'user_id', (row) => row.event_name === 'signup_completed');
  const activated = uniqueCount(rows, 'user_id', (row) => row.stage === 'activated');
  const outcomes = rows.filter((row) => row.event_name === 'verified_outcome').length;
  const activeMoments = uniqueCount(rows, 'moment_id', (row) => row.event_name === 'verified_outcome');
  const amplified = uniqueCount(rows, 'user_id', (row) => row.stage === 'amplified');
  const retained = uniqueCount(rows, 'user_id', (row) => row.stage === 'retained');
  const referralActivations = rows.filter((row) => row.event_name === 'referral_activated').length;
  const attributableRevenue = rows
    .filter((row) => row.event_name === 'payment_succeeded')
    .reduce((sum, row) => sum + Number(row.value || 0), 0);

  const sourceMap = new Map();
  const weeklyMap = new Map();
  for (const row of rows) {
    const sourceKey = [row.source || 'direct', row.medium || 'none', row.campaign || 'none'].join('|');
    const source = sourceMap.get(sourceKey) || {
      source: row.source || 'direct', medium: row.medium || 'none', campaign: row.campaign || 'none',
      visitors: new Set(), signups: new Set(), activations: new Set(), outcomes: 0, revenue: 0,
    };
    if (row.anonymous_id) source.visitors.add(row.anonymous_id);
    if (row.event_name === 'signup_completed' && row.user_id) source.signups.add(row.user_id);
    if (row.stage === 'activated' && row.user_id) source.activations.add(row.user_id);
    if (row.event_name === 'verified_outcome') source.outcomes += 1;
    if (row.event_name === 'payment_succeeded') source.revenue += Number(row.value || 0);
    sourceMap.set(sourceKey, source);

    const date = new Date(row.occurred_at);
    const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    const week = day.toISOString().slice(0, 10);
    const bucket = weeklyMap.get(week) || { week, outcomes: 0, activeMoments: new Set(), signups: new Set(), revenue: 0 };
    if (row.event_name === 'verified_outcome') {
      bucket.outcomes += 1;
      if (row.moment_id) bucket.activeMoments.add(row.moment_id);
    }
    if (row.event_name === 'signup_completed' && row.user_id) bucket.signups.add(row.user_id);
    if (row.event_name === 'payment_succeeded') bucket.revenue += Number(row.value || 0);
    weeklyMap.set(week, bucket);
  }

  const pioneer = await pioneerScorecard({ start, end });
  return {
    period: { startAt: start, endAt: end, journey: journey || 'all' },
    northStar: {
      verifiedOutcomes: outcomes,
      activeMoments,
      outcomesPerActiveMoment: activeMoments ? Number((outcomes / activeMoments).toFixed(2)) : 0,
      attributableRevenue,
    },
    funnel: {
      visitors, signups, activated, amplified, retained, referralActivations,
      visitorToSignupRate: rate(signups, visitors),
      signupToActivationRate: rate(activated, signups),
      activationToAmplificationRate: rate(amplified, activated),
      repeatOutcomeRate: rate(retained, activated),
    },
    sources: Array.from(sourceMap.values()).map((item) => ({
      source: item.source, medium: item.medium, campaign: item.campaign,
      visitors: item.visitors.size, signups: item.signups.size, activations: item.activations.size,
      outcomes: item.outcomes, revenue: item.revenue,
    })).sort((a, b) => b.outcomes - a.outcomes || b.signups - a.signups),
    weekly: Array.from(weeklyMap.values()).map((item) => ({
      week: item.week, outcomes: item.outcomes, activeMoments: item.activeMoments.size,
      signups: item.signups.size, revenue: item.revenue,
    })),
    pioneer,
  };
}

function normalizedVariants(variants) {
  return (Array.isArray(variants) ? variants : []).map((variant) =>
    typeof variant === 'string' ? { key: variant, weight: 1 } : { key: variant.key, weight: Number(variant.weight || 1) }
  ).filter((variant) => variant.key && variant.weight > 0);
}

function chooseVariant(identifier, experiment) {
  const variants = normalizedVariants(experiment.variants);
  if (!variants.length) return null;
  const hash = crypto.createHash('sha256').update(`${experiment.experiment_key}:${identifier}`).digest();
  const percentile = hash.readUInt32BE(0) / 0xffffffff * 100;
  if (percentile >= Number(experiment.allocation_percent || 0)) return null;
  const total = variants.reduce((sum, variant) => sum + variant.weight, 0);
  let cursor = (hash.readUInt32BE(4) / 0xffffffff) * total;
  for (const variant of variants) {
    cursor -= variant.weight;
    if (cursor <= 0) return variant.key;
  }
  return variants[variants.length - 1].key;
}

async function assignExperiment({ experimentKey, anonymousId, userId }) {
  const identifier = userId || anonymousId;
  if (!identifier) throw new Error('anonymousId or authenticated user is required');
  if (!supabase) return { assigned: false, skipped: true };

  let existingQuery = supabase.from('growth_experiment_assignments').select('variant')
    .eq('experiment_key', experimentKey);
  existingQuery = userId ? existingQuery.eq('user_id', userId) : existingQuery.eq('anonymous_id', anonymousId);
  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) throw existingError;
  if (existing) return { assigned: true, variant: existing.variant, existing: true };

  const { data: experiment, error } = await supabase.from('growth_experiments').select('*')
    .eq('experiment_key', experimentKey).eq('status', 'running').maybeSingle();
  if (error) throw error;
  if (!experiment) return { assigned: false, reason: 'not_running' };
  const variant = chooseVariant(identifier, experiment);
  if (!variant) return { assigned: false, reason: 'outside_allocation' };

  const { error: insertError } = await supabase.from('growth_experiment_assignments').insert({
    experiment_key: experimentKey, anonymous_id: anonymousId || null, user_id: userId || null, variant,
  });
  if (insertError && insertError.code !== '23505') throw insertError;
  return { assigned: true, variant };
}

module.exports = {
  EVENT_NAMES, PUBLIC_EVENTS, validateEvent, recordEvent, linkIdentity, scorecard,
  chooseVariant, assignExperiment,
};
