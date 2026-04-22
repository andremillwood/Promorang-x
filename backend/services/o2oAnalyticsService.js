const { supabase } = require('../lib/supabase');

async function getContentRows(contentIds = []) {
  if (!contentIds.length) return [];
  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, creator_id')
    .in('id', contentIds);
  if (error) throw error;
  return data || [];
}

async function getMomentRows(momentIds = []) {
  if (!momentIds.length) return [];
  const { data, error } = await supabase
    .from('moments')
    .select('id, title, host_id, venue_name, location')
    .in('id', momentIds);
  if (error) throw error;
  return data || [];
}

function summarizeLinks({ links = [], engagementRows = [], joinRows = [], verifiedRows = [], memoryRows = [], missionAttributionRows = [], contentRows = [], momentRows = [] }) {
  const contentById = new Map(contentRows.map((row) => [row.id, row]));
  const momentById = new Map(momentRows.map((row) => [row.id, row]));

  const linkDetails = links.map((link) => {
    const contentId = link.content_item_id;
    const momentId = link.moment_id;
    const contentEngagements = engagementRows.filter((row) => row.content_id === contentId);
    const missionRows = missionAttributionRows.filter((row) => row.content_item_id === contentId && row.moment_id === momentId);
    const joins = missionRows.length
      ? missionRows.filter((row) => row.joined_at)
      : joinRows.filter((row) => row.metadata?.source_content_id === contentId || row.metadata?.source_mission_id === link.id);
    const verified = missionRows.length
      ? missionRows.filter((row) => row.verified_at)
      : verifiedRows.filter((row) => row.metadata?.source_content_id === contentId || row.metadata?.source_mission_id === link.id);
    const memories = missionRows.length
      ? missionRows.filter((row) => row.memory_id)
      : memoryRows.filter((row) => row.moment_id === momentId);

    return {
      id: link.id,
      content_id: contentId,
      moment_id: momentId,
      content_title: contentById.get(contentId)?.title || 'Untitled Content',
      moment_title: momentById.get(momentId)?.title || 'Untitled Moment',
      venue_name: momentById.get(momentId)?.venue_name || momentById.get(momentId)?.location || null,
      digital_engagements: contentEngagements.length,
      attributed_joins: joins.length,
      attributed_checkins: verified.length,
      memories_issued: memories.length,
      o2o_conversion_rate: contentEngagements.length > 0
        ? Number(((joins.length / contentEngagements.length) * 100).toFixed(2))
        : 0,
      verification_rate: joins.length > 0
        ? Number(((verified.length / joins.length) * 100).toFixed(2))
        : 0,
    };
  });

  const totals = linkDetails.reduce((acc, item) => {
    acc.linked_missions += 1;
    acc.digital_engagements += item.digital_engagements;
    acc.attributed_joins += item.attributed_joins;
    acc.attributed_checkins += item.attributed_checkins;
    acc.memories_issued += item.memories_issued;
    return acc;
  }, {
    linked_missions: 0,
    digital_engagements: 0,
    attributed_joins: 0,
    attributed_checkins: 0,
    memories_issued: 0,
  });

  return {
    summary: {
      ...totals,
      join_conversion_rate: totals.digital_engagements > 0
        ? Number(((totals.attributed_joins / totals.digital_engagements) * 100).toFixed(2))
        : 0,
      verification_rate: totals.attributed_joins > 0
        ? Number(((totals.attributed_checkins / totals.attributed_joins) * 100).toFixed(2))
        : 0,
    },
    mission_breakdown: linkDetails,
  };
}

async function fetchSupportRows(links = []) {
  const contentIds = [...new Set(links.map((link) => link.content_item_id))];
  const momentIds = [...new Set(links.map((link) => link.moment_id))];

  const [
    contentRows,
    momentRows,
    contentEngagements,
    participationEvents,
    memories,
    missionAttributions,
  ] = await Promise.all([
    getContentRows(contentIds),
    getMomentRows(momentIds),
    contentIds.length
      ? supabase.from('content_engagement_events').select('id, content_id, event_type, user_id, created_at').in('content_id', contentIds)
      : Promise.resolve({ data: [], error: null }),
    momentIds.length
      ? supabase.from('participation_events').select('id, moment_id, user_id, event_type, metadata, created_at').in('moment_id', momentIds)
      : Promise.resolve({ data: [], error: null }),
    momentIds.length
      ? supabase.from('memories').select('id, moment_id, user_id, created_at').in('moment_id', momentIds)
      : Promise.resolve({ data: [], error: null }),
    momentIds.length
      ? supabase.from('mission_attributions').select('*').in('moment_id', momentIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (contentEngagements.error) throw contentEngagements.error;
  if (participationEvents.error) throw participationEvents.error;
  if (memories.error) throw memories.error;
  if (missionAttributions.error && !/relation .*mission_attributions.* does not exist/i.test(missionAttributions.error.message || '')) {
    throw missionAttributions.error;
  }

  const joinRows = (participationEvents.data || []).filter((row) => row.event_type === 'join');
  const verifiedRows = (participationEvents.data || []).filter((row) => row.event_type === 'verification');

  return {
    contentRows,
    momentRows,
    engagementRows: contentEngagements.data || [],
    joinRows,
    verifiedRows,
    memoryRows: memories.data || [],
    missionAttributionRows: missionAttributions.data || [],
  };
}

async function getHostO2OAnalytics(hostId) {
  const { data: links, error } = await supabase
    .from('content_moment_links')
    .select('id, content_item_id, moment_id, entry_action_types, is_sponsored')
    .in('moment_id',
      (
        await supabase
          .from('moments')
          .select('id')
          .eq('host_id', hostId)
      ).data?.map((row) => row.id) || []
    );

  if (error) throw error;
  const support = await fetchSupportRows(links || []);
  return summarizeLinks({ links: links || [], ...support });
}

async function getBrandO2OAnalytics(brandId) {
  const { data: sponsorships, error: sponsorshipError } = await supabase
    .from('sponsorship_requests')
    .select('moment_id, brand_id, status')
    .eq('brand_id', brandId)
    .in('status', ['approved', 'active', 'completed']);

  if (sponsorshipError) throw sponsorshipError;

  const sponsoredMomentIds = [...new Set((sponsorships || []).map((row) => row.moment_id).filter(Boolean))];
  if (!sponsoredMomentIds.length) {
    return {
      summary: {
        linked_missions: 0,
        digital_engagements: 0,
        attributed_joins: 0,
        attributed_checkins: 0,
        memories_issued: 0,
        join_conversion_rate: 0,
        verification_rate: 0,
      },
      mission_breakdown: [],
    };
  }

  const { data: links, error } = await supabase
    .from('content_moment_links')
    .select('id, content_item_id, moment_id, entry_action_types, is_sponsored')
    .in('moment_id', sponsoredMomentIds);

  if (error) throw error;

  const support = await fetchSupportRows(links || []);
  return summarizeLinks({ links: links || [], ...support });
}

module.exports = {
  getHostO2OAnalytics,
  getBrandO2OAnalytics,
};
