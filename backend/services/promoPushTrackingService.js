const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

const VALID_EVENTS = new Set([
  'impression',
  'click',
  'scan',
  'join',
  'move_completed',
  'proof_submitted',
  'proof_verified',
  'reward_issued',
  'geo_interaction',
]);

function getAttribution(input = {}) {
  const metadata = input.metadata || {};
  return {
    campaignId:
      input.promopush_campaign_id ||
      input.campaign_id ||
      metadata.promopush_campaign_id ||
      metadata.campaign_id ||
      null,
    channelId:
      input.promopush_channel_id ||
      input.channel_id ||
      metadata.promopush_channel_id ||
      metadata.channel_id ||
      null,
    trackingCode:
      input.promopush_tracking_code ||
      input.tracking_code ||
      metadata.promopush_tracking_code ||
      metadata.tracking_code ||
      metadata.channel ||
      null,
  };
}

async function resolveChannel(attribution = {}) {
  if (!supabase) return null;

  if (attribution.channelId) {
    const { data, error } = await supabase
      .from('promopush_channels')
      .select('*, campaign:promopush_campaigns(*)')
      .eq('id', attribution.channelId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  if (attribution.trackingCode) {
    const { data, error } = await supabase
      .from('promopush_channels')
      .select('*, campaign:promopush_campaigns(*)')
      .eq('tracking_code', attribution.trackingCode)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  return null;
}

function isDuplicateError(error) {
  return error?.code === '23505' || /duplicate key/i.test(error?.message || '');
}

function nullableEq(query, column, value) {
  return value ? query.eq(column, value) : query.is(column, null);
}

async function findExistingEvent({ campaignId, channelId, eventType, userId, moveId, proofSubmissionId, rewardId }) {
  let query = supabase
    .from('promopush_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('event_type', eventType)
    .order('created_at', { ascending: false })
    .limit(1);

  query = nullableEq(query, 'channel_id', channelId || null);

  if (eventType === 'move_completed' && userId && moveId) {
    query = query.eq('user_id', userId).eq('move_id', moveId);
  } else if (['proof_submitted', 'proof_verified'].includes(eventType) && proofSubmissionId) {
    query = query.eq('proof_submission_id', proofSubmissionId);
  } else if (eventType === 'reward_issued' && rewardId) {
    query = query.eq('reward_id', rewardId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data || null;
}

async function createCreatorEarning({ campaignId, channel, event }) {
  if (event.event_type !== 'proof_verified' || !channel?.owner_user_id || Number(channel.reward_per_verified_action) <= 0) {
    return;
  }

  const { error } = await supabase.from('promopush_creator_earnings').insert({
    campaign_id: campaignId,
    channel_id: channel.id,
    creator_id: channel.owner_user_id,
    event_id: event.id,
    amount: channel.reward_per_verified_action,
  });

  if (error && !isDuplicateError(error)) throw error;
}

async function trackPromoPushEvent({
  eventType,
  momentId = null,
  userId = null,
  moveId = null,
  proofSubmissionId = null,
  rewardId = null,
  metadata = {},
  latitude = null,
  longitude = null,
  request = null,
  attribution = {},
}) {
  if (!supabase || !VALID_EVENTS.has(eventType)) return null;

  try {
    const resolvedAttribution = {
      ...getAttribution({ metadata }),
      ...attribution,
    };
    const channel = await resolveChannel(resolvedAttribution);
    const campaign = channel?.campaign || null;
    const campaignId = resolvedAttribution.campaignId || channel?.campaign_id || campaign?.id || null;

    if (!campaignId) return null;

    let distance = null;
    let withinRadius = null;
    if (campaign && latitude !== null && longitude !== null) {
      const { data: distanceData } = await supabase.rpc('promopush_distance_meters', {
        lat1: Number(latitude),
        lng1: Number(longitude),
        lat2: Number(campaign.geo_center_lat),
        lng2: Number(campaign.geo_center_lng),
      });
      if (distanceData !== null && distanceData !== undefined) {
        distance = Number(distanceData);
        withinRadius = distance <= Number(campaign.geo_radius_meters);
      }
    }

    const eventPayload = {
      campaign_id: campaignId,
      channel_id: channel?.id || resolvedAttribution.channelId || null,
      user_id: userId,
      event_type: eventType,
      moment_id: momentId || campaign?.linked_moment_id || null,
      move_id: moveId,
      proof_submission_id: proofSubmissionId,
      reward_id: rewardId,
      latitude,
      longitude,
      within_radius: withinRadius,
      distance_meters: distance,
      user_agent: request?.headers?.['user-agent'] || null,
      referrer: request?.headers?.referer || null,
      metadata: {
        ...metadata,
        promopush_tracking_code: channel?.tracking_code || resolvedAttribution.trackingCode || null,
      },
    };

    let { data, error } = await supabase
      .from('promopush_events')
      .insert(eventPayload)
      .select()
      .single();

    if (error && isDuplicateError(error)) {
      data = await findExistingEvent({
        campaignId,
        channelId: eventPayload.channel_id,
        eventType,
        userId,
        moveId,
        proofSubmissionId,
        rewardId,
      });
    }
    if (error && !data) throw error;

    await createCreatorEarning({ campaignId, channel, event: data });

    return data;
  } catch (error) {
    console.warn('[PromoPushTracking] event skipped:', error.message);
    return null;
  }
}

module.exports = {
  getAttribution,
  trackPromoPushEvent,
};
