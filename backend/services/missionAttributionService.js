const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;

async function resolveMissionContext({ missionLinkId = null, contentItemId = null, momentId = null }) {
  if (!supabase) throw new Error('Database not available');

  let link = null;
  if (missionLinkId) {
    const { data, error } = await supabase
      .from('content_moment_links')
      .select('id, content_item_id, moment_id, is_sponsored')
      .eq('id', missionLinkId)
      .maybeSingle();
    if (error) throw error;
    link = data;
  }

  if (!link && contentItemId && momentId) {
    const { data, error } = await supabase
      .from('content_moment_links')
      .select('id, content_item_id, moment_id, is_sponsored')
      .eq('content_item_id', contentItemId)
      .eq('moment_id', momentId)
      .maybeSingle();
    if (error) throw error;
    link = data;
  }

  if (!link && (!contentItemId || !momentId)) {
    return null;
  }

  const resolvedContentId = link?.content_item_id || contentItemId;
  const resolvedMomentId = link?.moment_id || momentId;

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('id, host_id, brand_id')
    .eq('id', resolvedMomentId)
    .maybeSingle();
  if (momentError) throw momentError;

  return {
    missionLinkId: link?.id || missionLinkId || null,
    contentItemId: resolvedContentId,
    momentId: resolvedMomentId,
    hostId: moment?.host_id || null,
    brandId: moment?.brand_id || null,
    isSponsored: !!link?.is_sponsored,
  };
}

async function upsertMissionAttribution({
  userId,
  missionLinkId = null,
  contentItemId = null,
  momentId = null,
  status = 'engaged',
  update = {},
  metadata = {},
}) {
  const context = await resolveMissionContext({ missionLinkId, contentItemId, momentId });
  if (!context?.contentItemId || !context?.momentId) return null;

  const payload = {
    user_id: userId,
    mission_link_id: context.missionLinkId,
    content_item_id: context.contentItemId,
    moment_id: context.momentId,
    host_id: context.hostId,
    brand_id: context.brandId,
    status,
    metadata,
    ...update,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('mission_attributions')
    .upsert(payload, { onConflict: 'user_id,content_item_id,moment_id' })
    .select()
    .single();

  if (error) {
    if (/relation .*mission_attributions.* does not exist/i.test(error.message || '')) {
      return null;
    }
    throw error;
  }

  return data;
}

async function recordMissionEngagement({ userId, contentItemId, missionLinkId = null, momentId = null, eventType, metadata = {} }) {
  const existing = await upsertMissionAttribution({
    userId,
    missionLinkId,
    contentItemId,
    momentId,
    status: 'engaged',
    update: {
      first_engaged_at: new Date().toISOString(),
    },
    metadata,
  });

  if (!existing) return null;

  const nextCount = Number(existing.engagement_events_count || 0) + 1;
  const mergedMetadata = {
    ...(existing.metadata || {}),
    ...metadata,
    last_engagement_type: eventType,
  };

  const { data, error } = await supabase
    .from('mission_attributions')
    .update({
      engagement_events_count: nextCount,
      metadata: mergedMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function recordMissionJoin({ userId, contentItemId = null, missionLinkId = null, momentId, metadata = {} }) {
  const existing = await upsertMissionAttribution({
    userId,
    missionLinkId,
    contentItemId,
    momentId,
    status: 'joined',
    update: {
      joined_at: new Date().toISOString(),
    },
    metadata,
  });

  if (!existing) return null;

  const { data, error } = await supabase
    .from('mission_attributions')
    .update({
      status: 'joined',
      joined_at: existing.joined_at || new Date().toISOString(),
      join_events_count: Number(existing.join_events_count || 0) + 1,
      metadata: {
        ...(existing.metadata || {}),
        ...metadata,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function recordMissionVerification({ userId, contentItemId = null, missionLinkId = null, momentId, metadata = {} }) {
  const existing = await upsertMissionAttribution({
    userId,
    missionLinkId,
    contentItemId,
    momentId,
    status: 'verified',
    update: {
      verified_at: new Date().toISOString(),
    },
    metadata,
  });

  if (!existing) return null;

  const { data, error } = await supabase
    .from('mission_attributions')
    .update({
      status: 'verified',
      verified_at: existing.verified_at || new Date().toISOString(),
      verification_events_count: Number(existing.verification_events_count || 0) + 1,
      metadata: {
        ...(existing.metadata || {}),
        ...metadata,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function attachMemoryToMission({ userId, momentId, memoryId }) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('mission_attributions')
    .update({
      memory_id: memoryId,
      status: 'memorized',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('moment_id', momentId)
    .is('memory_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .select();

  if (error) {
    if (/relation .*mission_attributions.* does not exist/i.test(error.message || '')) {
      return null;
    }
    throw error;
  }

  return data?.[0] || null;
}

module.exports = {
  resolveMissionContext,
  recordMissionEngagement,
  recordMissionJoin,
  recordMissionVerification,
  attachMemoryToMission,
};
