const { supabase } = require('../lib/supabase');
const rules = require('../lib/stakeholderScout');

function getClient() {
  return global.supabase || supabase;
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function requireClient() {
  const client = getClient();
  if (!client) throw httpError(503, 'Scout service unavailable');
  return client;
}

function toCandidate(row) {
  return {
    candidateKey: row.candidate_key || row.candidateKey,
    kind: row.kind,
    displayName: row.display_name || row.displayName,
    hubId: row.hub_id || row.hubId,
    citySlug: row.city_slug || row.citySlug || null,
    neighborhood: row.neighborhood || null,
    categoryClusters: row.category_clusters || row.categoryClusters || [],
    job: row.job || null,
    sourceKind: row.source_kind || row.sourceKind,
    sourceName: row.source_name || row.sourceName || null,
    sourceUrl: row.source_url || row.sourceUrl || null,
    website: row.website || null,
    publicContactEmail: row.public_contact_email || row.publicContactEmail || null,
    suppressed: row.status === 'suppressed',
    doNotContact: row.doNotContact || false,
    alreadyClaimed: Boolean(row.alreadyClaimed),
  };
}

function momentFromRow(row) {
  if (!row) return null;
  return {
    id: row.id || row.event_key || row.moment_id || null,
    title: row.title || row.moment_title,
    hubId: row.hub_id || row.hubId,
    city: row.city || null,
    startsAt: row.starts_at || row.startsAt || row.moment_starts_at,
    category: row.category || null,
  };
}

async function listSuppressions(client) {
  const { data, error } = await client.from('stakeholder_scout_suppressions').select('match_type, match_key');
  if (error) throw error;
  return data || [];
}

function isSuppressed(candidate, suppressions) {
  const name = String(candidate.displayName || '').trim().toLowerCase();
  const website = String(candidate.website || '').trim().toLowerCase();
  const email = String(candidate.publicContactEmail || '').trim().toLowerCase();
  return suppressions.some((row) => {
    const key = String(row.match_key || '').trim().toLowerCase();
    if (row.match_type === 'candidate_key' && key === candidate.candidateKey) return true;
    if (row.match_type === 'display_name' && key === name) return true;
    if (row.match_type === 'website' && website && key === website) return true;
    if (row.match_type === 'email' && email && key === email) return true;
    return false;
  });
}

async function recordReview(client, candidateId, actorId, action, fromStatus, toStatus, note, metadata = {}) {
  const { error } = await client.from('stakeholder_scout_reviews').insert({
    candidate_id: candidateId,
    actor_id: actorId || null,
    action,
    from_status: fromStatus || null,
    to_status: toStatus || null,
    note: note || null,
    metadata,
  });
  if (error) throw error;
}

async function loadMoments(asOf = new Date()) {
  const client = requireClient();
  const until = new Date(asOf.getTime() + 90 * 86400000).toISOString();
  const { data, error } = await client
    .from('cultural_calendar_events')
    .select('event_key, title, city, category, hub_id, city_slug, starts_at')
    .gte('starts_at', asOf.toISOString())
    .lt('starts_at', until)
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.event_key,
    title: row.title,
    hubId: row.hub_id || row.city_slug,
    city: row.city,
    startsAt: row.starts_at,
    category: row.category,
  }));
}

function payloadFromSelection(row, weekStart) {
  const moment = row.moment;
  const draft = moment ? rules.draftClaimPageInvite(row.candidate, moment) : null;
  return {
    candidate_key: row.candidate.candidateKey,
    kind: row.candidate.kind,
    display_name: row.candidate.displayName,
    hub_id: row.candidate.hubId,
    city_slug: row.candidate.citySlug || row.candidate.hubId,
    neighborhood: row.candidate.neighborhood || null,
    category_clusters: row.candidate.categoryClusters || [],
    job: row.candidate.job || null,
    source_kind: row.candidate.sourceKind,
    source_name: row.candidate.sourceName || null,
    source_url: row.candidate.sourceUrl || null,
    website: row.candidate.website || null,
    public_contact_email: row.candidate.publicContactEmail || null,
    status: row.score.nextStatus,
    recommendation: row.score.recommendation,
    score: row.score.total,
    score_breakdown: row.score.breakdown,
    reasons: row.score.reasons,
    blockers: row.score.blockers,
    preferred_channel: row.score.preferredChannel,
    moment_id: moment?.id || null,
    moment_title: moment?.title || null,
    moment_starts_at: moment?.startsAt || null,
    invite_subject: draft?.subject || null,
    invite_body: draft?.body || null,
    claim_path: draft?.claimPath || rules.claimPathForCandidate(row.candidate),
    auto_send: false,
    send_allowed: false,
    queued_week_start: row.score.nextStatus === 'queued' ? weekStart : null,
    notes: row.candidate.notes || null,
  };
}

async function ingest({ catalog, moments, asOf = new Date(), actorId = null } = {}) {
  const client = requireClient();
  const source = catalog || rules.FOUNDING_SCOUT_CATALOG;
  const momentList = moments || await loadMoments(asOf);
  const suppressions = await listSuppressions(client);
  const annotated = source.map((candidate) => ({
    ...candidate,
    doNotContact: isSuppressed(candidate, suppressions),
    suppressed: isSuppressed(candidate, suppressions),
  }));
  const selected = rules.selectWeeklyShortlist(annotated, momentList, asOf);
  const weekStart = rules.getIsoWeekStart(asOf);
  const keys = selected.map((row) => row.candidate.candidateKey);
  const existing = keys.length
    ? await client.from('stakeholder_scout_candidates').select('candidate_key, status').in('candidate_key', keys)
    : { data: [], error: null };
  if (existing.error) throw existing.error;
  const locked = new Set(
    (existing.data || [])
      .filter((row) => ['approved', 'invite_ready', 'sent_by_human', 'suppressed'].includes(row.status))
      .map((row) => row.candidate_key),
  );

  const upserted = [];
  for (const row of selected) {
    if (locked.has(row.candidate.candidateKey)) continue;
    const payload = payloadFromSelection(row, weekStart);
    const { data, error } = await client
      .from('stakeholder_scout_candidates')
      .upsert(payload, { onConflict: 'candidate_key' })
      .select()
      .single();
    if (error) throw error;
    await recordReview(client, data.id, actorId, 'scored', 'sourced', data.status, null, {
      score: data.score,
      recommendation: data.recommendation,
    });
    upserted.push(data);
  }

  return {
    autoSend: false,
    sent: 0,
    scored: upserted.length,
    queued: upserted.filter((row) => row.status === 'queued').length,
    watch: upserted.filter((row) => row.status === 'watch').length,
    rejected: upserted.filter((row) => row.status === 'rejected').length,
    suppressed: upserted.filter((row) => row.status === 'suppressed').length,
    moments: momentList.length,
    candidates: upserted,
  };
}

async function listQueue({ hubId, status, limit = 50 } = {}) {
  const client = requireClient();
  let query = client
    .from('stakeholder_scout_candidates')
    .select('*')
    .order('score', { ascending: false })
    .limit(Math.min(100, Math.max(1, Number(limit) || 50)));
  if (hubId && hubId !== 'all') query = query.eq('hub_id', hubId);
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return { autoSend: false, candidates: data || [] };
}

async function getCandidate(id) {
  const client = requireClient();
  const [candidate, reviews] = await Promise.all([
    client.from('stakeholder_scout_candidates').select('*').eq('id', id).single(),
    client.from('stakeholder_scout_reviews').select('*').eq('candidate_id', id).order('created_at', { ascending: false }),
  ]);
  if (candidate.error) throw httpError(404, candidate.error.message);
  if (reviews.error) throw reviews.error;
  return { candidate: candidate.data, reviews: reviews.data || [], autoSend: false };
}

async function applyStatus(id, toStatus, actorId, note, extra = {}) {
  const client = requireClient();
  const current = await client.from('stakeholder_scout_candidates').select('*').eq('id', id).single();
  if (current.error || !current.data) throw httpError(404, 'Scout candidate not found');
  const from = current.data.status;
  rules.transitionScoutStatus(from, toStatus);
  const { data, error } = await client
    .from('stakeholder_scout_candidates')
    .update({
      status: toStatus,
      reviewed_by: actorId || null,
      reviewed_at: new Date().toISOString(),
      review_note: note || current.data.review_note,
      auto_send: false,
      send_allowed: false,
      ...extra,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  await recordReview(client, id, actorId, toStatus, from, toStatus, note, extra);
  return data;
}

async function approve(id, actorId, note) {
  return applyStatus(id, 'approved', actorId, note);
}

async function reject(id, actorId, note) {
  return applyStatus(id, 'rejected', actorId, note || 'Steward rejected this invite');
}

async function draftInvite(id, actorId) {
  const client = requireClient();
  const current = await getCandidate(id);
  const row = current.candidate;
  if (!['approved', 'invite_ready'].includes(row.status)) {
    throw httpError(400, 'Approve the candidate before drafting an invite');
  }
  if (!row.moment_title || !row.moment_starts_at) {
    throw httpError(400, 'Attach a dated Moment before drafting an invite');
  }
  const draft = rules.draftClaimPageInvite(toCandidate(row), momentFromRow(row));
  if (draft.autoSend || draft.sendAllowed) {
    throw httpError(500, 'Scout drafts are not allowed to send');
  }
  const updated = await applyStatus(id, 'invite_ready', actorId, null, {
    invite_subject: draft.subject,
    invite_body: draft.body,
    claim_path: draft.claimPath,
    preferred_channel: draft.preferredChannel,
  });
  return { candidate: updated, draft, autoSend: false };
}

async function recordHumanSend(id, actorId, channel, note) {
  if (!actorId) throw httpError(400, 'A person must record the send');
  const allowed = new Set(['walk_in', 'steward_intro', 'claim_page', 'email']);
  if (!allowed.has(channel)) throw httpError(400, 'Choose walk-in, steward intro, claim page, or email');
  return applyStatus(id, 'sent_by_human', actorId, note, {
    sent_by: actorId,
    sent_at: new Date().toISOString(),
    sent_channel: channel,
  });
}

async function suppress(id, actorId, reason) {
  const client = requireClient();
  const current = await getCandidate(id);
  const row = current.candidate;
  const { error } = await client.from('stakeholder_scout_suppressions').upsert({
    match_key: row.candidate_key,
    match_type: 'candidate_key',
    reason: reason || 'Steward marked do not contact',
    created_by: actorId || null,
  }, { onConflict: 'match_type,match_key' });
  if (error) throw error;
  return applyStatus(id, 'suppressed', actorId, reason || 'Do not contact');
}

async function nominate(input, actorId) {
  const client = requireClient();
  const candidate = {
    candidateKey: String(input.candidateKey || '').trim() || `nomination-${Date.now()}`,
    kind: input.kind,
    displayName: String(input.displayName || '').trim(),
    hubId: input.hubId,
    citySlug: input.citySlug || input.hubId,
    neighborhood: input.neighborhood || null,
    categoryClusters: Array.isArray(input.categoryClusters) ? input.categoryClusters : [],
    job: input.job || null,
    sourceKind: 'steward_nomination',
    sourceName: input.sourceName || 'Steward nomination',
    sourceUrl: input.sourceUrl || null,
    website: input.website || null,
    publicContactEmail: input.publicContactEmail || null,
    notes: input.notes || null,
  };
  if (!['venue', 'merchant', 'brand', 'product'].includes(candidate.kind)) {
    throw httpError(400, 'Nominate a venue, merchant, brand, or product');
  }
  if (!candidate.displayName) throw httpError(400, 'A name is required');
  if (!rules.isLiveOrPilotHub(candidate.hubId)) {
    throw httpError(400, 'Nominate only inside a live or pilot hub');
  }

  const moments = input.moment ? [input.moment] : await loadMoments();
  const moment = input.moment || rules.matchMomentForCandidate(candidate, moments);
  const score = rules.scoreStakeholderCandidate(candidate, moment);
  const payload = payloadFromSelection({ candidate, moment, score }, rules.getIsoWeekStart(new Date()));
  payload.nominated_by = actorId || null;
  payload.notes = candidate.notes;
  if (score.nextStatus === 'queued') payload.status = 'watch';

  const { data, error } = await client
    .from('stakeholder_scout_candidates')
    .upsert(payload, { onConflict: 'candidate_key' })
    .select()
    .single();
  if (error) throw error;
  await recordReview(client, data.id, actorId, 'nominated', null, data.status, candidate.notes);
  return data;
}

async function runWeeklyScout(asOf = new Date()) {
  const result = await ingest({ asOf });
  return {
    job: 'stakeholder-scout',
    autoSend: false,
    sent: 0,
    ...result,
  };
}

module.exports = {
  ingest,
  listQueue,
  getCandidate,
  approve,
  reject,
  draftInvite,
  recordHumanSend,
  suppress,
  nominate,
  runWeeklyScout,
  canAutoSendScoutInvite: rules.canAutoSendScoutInvite,
};
