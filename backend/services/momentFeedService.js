const DEFAULT_DURATION_MS = 4 * 60 * 60 * 1000;
const STARTING_SOON_MS = 3 * 60 * 60 * 1000;
const RECENT_WINDOW_MS = 36 * 60 * 60 * 1000;
const UPCOMING_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

const HIDDEN_ORIGINS = new Set(['demo', 'platform_seed']);
const HIDDEN_STATUSES = new Set(['cancelled', 'canceled', 'archived', 'rejected']);

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inferEnd(start, end) {
  if (end && end.getTime() >= start.getTime()) return { date: end, inferred: false };
  return { date: new Date(start.getTime() + DEFAULT_DURATION_MS), inferred: true };
}

function classifyMomentLifecycle(moment, referenceDate = new Date()) {
  const now = referenceDate.getTime();
  const start = asDate(moment.starts_at);
  const suppliedEnd = asDate(moment.ends_at);
  const issues = [];

  if (!start) {
    return { lifecycle: 'needs_verification', publicEligible: false, issues: ['missing_or_invalid_start'] };
  }
  if (suppliedEnd && suppliedEnd.getTime() < start.getTime()) issues.push('end_before_start');
  if (!suppliedEnd) issues.push('missing_end');
  if (!moment.venue_name && !moment.location) issues.push('missing_location');
  if (!moment.image_url) issues.push('missing_image');
  if (!moment.host_id && !moment.organizer_id) issues.push('missing_owner');

  const { date: effectiveEnd, inferred } = inferEnd(start, suppliedEnd);
  const startMs = start.getTime();
  const endMs = effectiveEnd.getTime();
  let lifecycle;

  if (startMs <= now && endMs > now) lifecycle = 'live';
  else if (startMs > now && startMs - now <= STARTING_SOON_MS) lifecycle = 'starting_soon';
  else if (startMs > now && startMs - now <= UPCOMING_WINDOW_MS) lifecycle = 'upcoming';
  else if (endMs <= now && now - endMs <= RECENT_WINDOW_MS) lifecycle = 'recently_ended';
  else lifecycle = endMs <= now ? 'completed' : 'scheduled_later';

  const origin = String(moment.content_origin || 'stakeholder_created').toLowerCase();
  const status = String(moment.status || '').toLowerCase();
  const visibility = String(moment.visibility || 'open').toLowerCase();
  const publicEligible = moment.is_active !== false
    && !HIDDEN_ORIGINS.has(origin)
    && !HIDDEN_STATUSES.has(status)
    && !['private', 'hidden'].includes(visibility)
    && !issues.includes('end_before_start')
    && ['live', 'starting_soon', 'upcoming', 'recently_ended'].includes(lifecycle);

  return {
    lifecycle,
    publicEligible,
    issues,
    effectiveStartsAt: start.toISOString(),
    effectiveEndsAt: effectiveEnd.toISOString(),
    endTimeInferred: inferred,
  };
}

function normalizeMoment(moment, brands = [], referenceDate = new Date(), offers = []) {
  const state = classifyMomentLifecycle(moment, referenceDate);
  const associatedBrands = brands.map((brand) => typeof brand === 'string'
    ? { id: null, name: brand, slug: null }
    : { id: brand.id || null, name: brand.name, slug: brand.slug || null })
    .filter((brand) => Boolean(brand.name));
  return {
    ...moment,
    starts_at: state.effectiveStartsAt || moment.starts_at,
    effective_ends_at: state.effectiveEndsAt || moment.ends_at,
    lifecycle: state.lifecycle,
    data_quality_issues: state.issues,
    end_time_inferred: Boolean(state.endTimeInferred),
    associated_brands: associatedBrands,
    associated_brand_names: associatedBrands.map((brand) => brand.name),
    associated_offers: offers.filter((offer) => Boolean(offer?.id && offer?.title)),
    participant_count: Number(moment.participant_count || 0),
    sponsorship_ready: ['upcoming', 'starting_soon'].includes(state.lifecycle)
      && Boolean(moment.host_id || moment.organizer_id)
      && Boolean(moment.venue_name || moment.location),
  };
}

function buildMomentFeed(moments, brandNamesByMoment = {}, referenceDate = new Date(), offersByMoment = {}) {
  const assessed = (moments || []).map((moment) => ({
    source: moment,
    state: classifyMomentLifecycle(moment, referenceDate),
  }));
  const normalized = assessed
    .filter(({ state }) => state.publicEligible)
    .map(({ source }) => normalizeMoment(source, brandNamesByMoment[source.id] || [], referenceDate, offersByMoment[source.id] || []))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const buckets = { live: [], starting_soon: [], upcoming: [], recently_ended: [] };
  normalized.forEach((moment) => buckets[moment.lifecycle].push(moment));
  return {
    moments: normalized,
    buckets,
    counts: Object.fromEntries(Object.entries(buckets).map(([key, value]) => [key, value.length])),
    generated_at: referenceDate.toISOString(),
    timezone: 'America/Jamaica',
    health: {
      assessed: assessed.length,
      surfaced: normalized.length,
      needs_attention: assessed.filter(({ state }) => state.issues.length > 0).length,
    },
  };
}

module.exports = {
  DEFAULT_DURATION_MS,
  buildMomentFeed,
  classifyMomentLifecycle,
  normalizeMoment,
};
