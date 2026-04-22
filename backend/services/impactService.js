const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

const FIRST_MOVER_LIMIT = 5;

function deriveCatalystRank(score = 0) {
  if (score >= 500) return 'legendary_catalyst';
  if (score >= 250) return 'epic_catalyst';
  if (score >= 100) return 'rare_catalyst';
  if (score >= 25) return 'rising_catalyst';
  return 'new_signal';
}

async function ensureImpactProfile(userId) {
  if (!supabase) throw new Error('Database not available');

  const { data: existing, error } = await supabase
    .from('user_impact_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing;

  const { data, error: insertError } = await supabase
    .from('user_impact_profiles')
    .insert({
      user_id: userId,
      catalyst_rank: deriveCatalystRank(0),
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return data;
}

async function updateImpactProfile(userId, updates = {}) {
  const current = await ensureImpactProfile(userId);
  const nextScore = updates.impact_score ?? current.impact_score;

  const payload = {
    ...updates,
    catalyst_rank: deriveCatalystRank(nextScore),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_impact_profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function recordImpactEvent({
  sourceUserId,
  downstreamUserId,
  momentId,
  eventType,
  impactScoreDelta = 0,
  viralShareAmount = null,
  metadata = {},
}) {
  const { data: existing, error: existingError } = await supabase
    .from('impact_events')
    .select('id')
    .eq('source_user_id', sourceUserId)
    .eq('downstream_user_id', downstreamUserId)
    .eq('moment_id', momentId)
    .eq('event_type', eventType)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return { skipped: true, event: existing };

  const { data: event, error } = await supabase
    .from('impact_events')
    .insert({
      source_user_id: sourceUserId,
      downstream_user_id: downstreamUserId,
      moment_id: momentId,
      event_type: eventType,
      impact_score_delta: impactScoreDelta,
      viral_share_amount: viralShareAmount,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;

  const sourceProfile = await ensureImpactProfile(sourceUserId);
  const downstreamIncrement = sourceUserId === downstreamUserId ? 0 : 1;

  await updateImpactProfile(sourceUserId, {
    impact_score: (sourceProfile.impact_score || 0) + impactScoreDelta,
    first_mover_count: (sourceProfile.first_mover_count || 0) + (eventType === 'first_mover_influence' ? 1 : 0),
    downstream_action_count: (sourceProfile.downstream_action_count || 0) + downstreamIncrement,
    downstream_reward_value: Number(sourceProfile.downstream_reward_value || 0) + Number(viralShareAmount || 0),
  });

  return { skipped: false, event };
}

async function processJoinImpact({ momentId, userId }) {
  if (!supabase) throw new Error('Database not available');

  await ensureImpactProfile(userId);

  const { data: participants, error } = await supabase
    .from('moment_participants')
    .select('user_id, joined_at')
    .eq('moment_id', momentId)
    .order('joined_at', { ascending: true });

  if (error) throw error;

  const ordered = participants || [];
  const participantIndex = ordered.findIndex((row) => row.user_id === userId);

  if (participantIndex > -1 && participantIndex < FIRST_MOVER_LIMIT) {
    await recordImpactEvent({
      sourceUserId: userId,
      downstreamUserId: userId,
      momentId,
      eventType: 'first_mover_influence',
      impactScoreDelta: 20,
      metadata: {
        participant_position: participantIndex + 1,
        early_limit: FIRST_MOVER_LIMIT,
      },
    });
  }

  const catalyst = ordered.find((row) => row.user_id !== userId);
  if (catalyst) {
    await ensureImpactProfile(catalyst.user_id);
    await recordImpactEvent({
      sourceUserId: catalyst.user_id,
      downstreamUserId: userId,
      momentId,
      eventType: 'share_conversion',
      impactScoreDelta: 12,
      viralShareAmount: 1,
      metadata: {
        catalyst_user_id: catalyst.user_id,
        converted_user_id: userId,
      },
    });
  }

  return getImpactProfile(userId);
}

async function processGatheringActivationImpact({ momentId }) {
  if (!supabase) throw new Error('Database not available');

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, pulse_state, gathering_threshold')
    .eq('id', momentId)
    .maybeSingle();

  if (momentError) throw momentError;
  if (!moment || moment.pulse_state !== 'live' || !moment.gathering_threshold) {
    return null;
  }

  const { data: participants, error } = await supabase
    .from('moment_participants')
    .select('user_id, joined_at')
    .eq('moment_id', momentId)
    .order('joined_at', { ascending: true })
    .limit(Number(moment.gathering_threshold));

  if (error) throw error;

  for (const participant of participants || []) {
    await ensureImpactProfile(participant.user_id);
    await recordImpactEvent({
      sourceUserId: participant.user_id,
      downstreamUserId: participant.user_id,
      momentId,
      eventType: 'gathering_activation_assist',
      impactScoreDelta: 15,
      metadata: {
        gathering_threshold: moment.gathering_threshold,
      },
    });
  }

  return true;
}

async function getImpactProfile(userId) {
  const profile = await ensureImpactProfile(userId);

  const { data: events, error } = await supabase
    .from('impact_events')
    .select('*')
    .or(`source_user_id.eq.${userId},downstream_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return {
    ...profile,
    catalyst_rank: deriveCatalystRank(profile.impact_score || 0),
    recent_events: events || [],
  };
}

async function getImpactLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('user_impact_profiles')
    .select('user_id, impact_score, catalyst_rank, first_mover_count, downstream_action_count, downstream_reward_value')
    .order('impact_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

module.exports = {
  deriveCatalystRank,
  ensureImpactProfile,
  processJoinImpact,
  processGatheringActivationImpact,
  getImpactProfile,
  getImpactLeaderboard,
};
