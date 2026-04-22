const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

function derivePulseState({
  participantCount = 0,
  threshold = 0,
  capacityLimit = null,
  startsAt = null,
}) {
  const safeThreshold = Math.max(Number(threshold || 0), 0);
  const normalizedCapacity = capacityLimit ? Math.max(Number(capacityLimit), 1) : null;
  const ratio = safeThreshold > 0 ? participantCount / safeThreshold : participantCount > 0 ? 1 : 0;
  const capacityRatio = normalizedCapacity ? participantCount / normalizedCapacity : 0;
  const startTime = startsAt ? new Date(startsAt).getTime() : null;
  const now = Date.now();

  let pulseState = 'dormant';
  if (participantCount > 0) pulseState = 'forming';
  if (safeThreshold > 0 && participantCount >= safeThreshold) pulseState = 'live';
  if (startTime && startTime < now && participantCount === 0) pulseState = 'cooling';

  let multiplier = 1;
  if (pulseState === 'forming') {
    multiplier = ratio >= 0.75 ? 1.25 : ratio >= 0.4 ? 1.1 : 1;
  }
  if (pulseState === 'live') {
    multiplier = capacityRatio >= 0.9 ? 1.75 : capacityRatio >= 0.65 ? 1.5 : 1.35;
  }

  let sentimentBand = 'low';
  if (pulseState === 'live') sentimentBand = 'surging';
  else if (ratio >= 0.75) sentimentBand = 'warm';
  else if (ratio >= 0.3) sentimentBand = 'building';

  const saturationRisk = normalizedCapacity
    ? capacityRatio >= 1 ? 'full'
      : capacityRatio >= 0.9 ? 'high'
      : capacityRatio >= 0.7 ? 'medium'
      : 'low'
    : pulseState === 'live' ? 'medium' : 'low';

  return {
    pulse_state: pulseState,
    threshold_progress: participantCount,
    current_bonus_multiplier: Number(multiplier.toFixed(2)),
    crowd_level: participantCount,
    sentiment_band: sentimentBand,
    saturation_risk: saturationRisk,
  };
}

async function getPulseForMoment(momentId) {
  if (!supabase) throw new Error('Database not available');

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, title, pulse_state, gathering_threshold, capacity_limit, cooldown_minutes, is_active, starts_at')
    .eq('id', momentId)
    .maybeSingle();

  if (momentError) throw momentError;
  if (!moment) throw new Error('Moment not found');

  const [{ data: latestSnapshot, error: snapshotError }, { count: participantCount, error: participantError }] = await Promise.all([
    supabase
      .from('moment_pulse_snapshots')
      .select('*')
      .eq('moment_id', momentId)
      .order('captured_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('moment_participants')
      .select('*', { count: 'exact', head: true })
      .eq('moment_id', momentId),
  ]);

  if (snapshotError) throw snapshotError;
  if (participantError) throw participantError;

  const thresholdProgress = latestSnapshot?.threshold_progress ?? participantCount ?? 0;
  const gatheringThreshold = moment.gathering_threshold || 0;

  return {
    moment_id: moment.id,
    title: moment.title,
    pulse_state: latestSnapshot?.pulse_state || moment.pulse_state,
    threshold_progress: thresholdProgress,
    gathering_threshold: gatheringThreshold,
    current_bonus_multiplier: latestSnapshot?.current_bonus_multiplier || 1,
    crowd_level: latestSnapshot?.crowd_level ?? participantCount ?? 0,
    sentiment_band: latestSnapshot?.sentiment_band || null,
    saturation_risk: latestSnapshot?.saturation_risk || null,
    capacity_limit: moment.capacity_limit,
    cooldown_minutes: moment.cooldown_minutes,
    is_active: moment.is_active,
    starts_at: moment.starts_at,
  };
}

async function listLivePulseMoments({ limit = 20 }) {
  if (!supabase) throw new Error('Database not available');

  const { data: moments, error } = await supabase
    .from('moments')
    .select('id, title, pulse_state, gathering_threshold, starts_at, location, venue_name')
    .in('pulse_state', ['forming', 'live'])
    .eq('is_active', true)
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return moments || [];
}

async function recordPulseSnapshot(momentId, input = {}) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('moment_pulse_snapshots')
    .insert({
      moment_id: momentId,
      pulse_state: input.pulse_state || 'forming',
      threshold_progress: input.threshold_progress || 0,
      current_bonus_multiplier: input.current_bonus_multiplier || 1,
      crowd_level: input.crowd_level || 0,
      sentiment_band: input.sentiment_band || null,
      saturation_risk: input.saturation_risk || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function recalculateMomentPulse(momentId) {
  if (!supabase) throw new Error('Database not available');

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, pulse_state, gathering_threshold, capacity_limit, is_active, starts_at')
    .eq('id', momentId)
    .maybeSingle();

  if (momentError) throw momentError;
  if (!moment) throw new Error('Moment not found');

  const { count: participantCount, error: participantError } = await supabase
    .from('moment_participants')
    .select('*', { count: 'exact', head: true })
    .eq('moment_id', momentId);

  if (participantError) throw participantError;

  const derived = derivePulseState({
    participantCount: participantCount || 0,
    threshold: moment.gathering_threshold || 0,
    capacityLimit: moment.capacity_limit || null,
    startsAt: moment.starts_at || null,
  });

  const { error: updateError } = await supabase
    .from('moments')
    .update({
      pulse_state: derived.pulse_state,
      updated_at: new Date().toISOString(),
    })
    .eq('id', momentId);

  if (updateError) throw updateError;

  const snapshot = await recordPulseSnapshot(momentId, derived);
  return {
    ...derived,
    moment_id: momentId,
    snapshot_id: snapshot.id,
  };
}

async function getParticipationEligibility(momentId) {
  if (!supabase) throw new Error('Database not available');

  const pulse = await getPulseForMoment(momentId);

  const now = Date.now();
  const startsAt = pulse.starts_at ? new Date(pulse.starts_at).getTime() : null;
  const cooldownMs = Number(pulse.cooldown_minutes || 0) * 60 * 1000;
  const capacityLimit = pulse.capacity_limit || null;
  const isFull = capacityLimit ? pulse.crowd_level >= capacityLimit : false;
  const cooldownActive =
    pulse.pulse_state === 'cooling' &&
    startsAt &&
    cooldownMs > 0 &&
    startsAt + cooldownMs > now;

  return {
    moment_id: momentId,
    can_join: !isFull && !cooldownActive,
    reasons: {
      is_full: isFull,
      cooldown_active: cooldownActive,
    },
    pulse,
  };
}

module.exports = {
  getPulseForMoment,
  listLivePulseMoments,
  recordPulseSnapshot,
  recalculateMomentPulse,
  getParticipationEligibility,
};
