const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const isMissingRelationError = (error) => {
  if (!error) return false;
  return error.code === '42P01' || /relation .* does not exist/i.test(error.message || '');
};

const isMissingColumnError = (error) => {
  if (!error) return false;
  return error.code === '42703' || /column .* does not exist/i.test(error.message || '');
};

const isSchemaCompatibilityError = (error) => isMissingRelationError(error) || isMissingColumnError(error);

const DEMO_O2O_FEED = [
  {
    id: 'demo-o2o-1',
    entry_action_types: ['watch', 'share'],
    physical_unlock_rules: {
      summary: 'Watch the creator story, then check in at Central Cafe to unlock Founder Roast.',
      perk_hint: 'Founder Roast memory grants 10% off future redemptions.',
    },
    o2o_conversion_rate: 8.4,
    is_sponsored: true,
    content: {
      id: 'demo-content-1',
      title: 'Sydney Secret: The Hidden Roast Route',
      description: 'A creator-led café drop that starts with a digital story and finishes with an in-person unlock.',
      platform: 'youtube',
      media_url: '/assets/demo/tiktok-drop.png',
      creator_name: 'Alex Rivera',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex-rivera',
      platform_url: 'https://promorang.co',
    },
    moment: {
      id: 'demo-moment-1',
      title: 'Central Cafe Founder Drop',
      venue_name: 'Central Cafe',
      location: 'Downtown Kingston',
      pulse_state: 'forming',
      reward: 'Co-branded Memory + 10% venue perk',
      starts_at: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
      gathering_threshold: 12,
    },
  },
  {
    id: 'demo-o2o-2',
    entry_action_types: ['watch', 'comment'],
    physical_unlock_rules: {
      summary: 'Unlock the artist codeword, then verify it on site to mint the Plaza Pioneer memory.',
      perk_hint: 'Legendary holders get future early access windows.',
    },
    o2o_conversion_rate: 11.2,
    is_sponsored: false,
    content: {
      id: 'demo-content-2',
      title: 'Plaza Sessions Episode 04',
      description: 'A short-form creator drop designed to drive a synchronized plaza gathering and collectible unlock.',
      platform: 'instagram',
      media_url: '/assets/demo/neon-festival.png',
      creator_name: 'Maya Stone',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya-stone',
      platform_url: 'https://promorang.co',
    },
    moment: {
      id: 'demo-moment-2',
      title: 'Fountain Plaza Session',
      venue_name: 'Fountain Plaza',
      location: 'New Kingston',
      pulse_state: 'live',
      reward: 'Epic Memory + Creator Perk',
      starts_at: new Date(Date.now() + 1000 * 60 * 40).toISOString(),
      gathering_threshold: 20,
    },
  },
];

function buildO2OFeedPayload(linkRows = [], contentRows = [], momentRows = []) {
  return linkRows
    .map((link) => {
      const content = contentRows.find((item) => item.id === link.content_item_id);
      const moment = momentRows.find((item) => item.id === link.moment_id);
      if (!content || !moment) return null;

      return {
        id: link.id,
        entry_action_types: link.entry_action_types || [],
        physical_unlock_rules: link.physical_unlock_rules || null,
        o2o_conversion_rate: Number(link.o2o_conversion_rate || 0),
        is_sponsored: !!link.is_sponsored,
        content: {
          id: content.id,
          title: content.title,
          description: content.description,
          platform: content.platform || 'external',
          media_url: content.media_url || '/assets/demo/tiktok-drop.png',
          creator_name: content.creator_name || content.creator_display_name || 'Promorang Creator',
          creator_avatar: content.creator_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
          platform_url: content.platform_url || content.media_url || 'https://promorang.co',
        },
        moment: {
          id: moment.id,
          title: moment.title,
          venue_name: moment.venue_name,
          location: moment.location,
          pulse_state: moment.pulse_state || 'forming',
          reward: moment.reward,
          starts_at: moment.starts_at,
          gathering_threshold: moment.gathering_threshold || 0,
        },
      };
    })
    .filter(Boolean);
}

async function getCreatorContentRows(user) {
  if (!supabase || !user?.id) return [];

  const primaryResult = await supabase
    .from('content_items')
    .select('id, creator_id, title, description, platform, media_url, posted_at')
    .eq('creator_id', user.id)
    .order('posted_at', { ascending: false });

  if (!primaryResult.error) {
    return (primaryResult.data || []).map((row) => ({
      ...row,
      creator_name: user.display_name || user.email || 'Promorang Creator',
      creator_avatar: user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      platform_url: row.media_url || 'https://promorang.co',
    }));
  }

  if (!isSchemaCompatibilityError(primaryResult.error)) {
    throw primaryResult.error;
  }

  const filters = [];
  if (user.username) filters.push(`creator_username.eq.${user.username}`);
  if (user.display_name) filters.push(`creator_name.eq.${user.display_name}`);
  if (user.email) filters.push(`creator_name.eq.${user.email}`);

  if (filters.length === 0) {
    return [];
  }

  const legacyResult = await supabase
    .from('content_pieces')
    .select('id, creator_id, creator_username, creator_name, creator_avatar, title, description, platform, platform_url, media_url, posted_at')
    .or(filters.join(','))
    .order('posted_at', { ascending: false });

  if (legacyResult.error) {
    if (isSchemaCompatibilityError(legacyResult.error)) {
      return [];
    }
    throw legacyResult.error;
  }

  return legacyResult.data || [];
}

async function getCreatorContentItemIds(user) {
  const rows = await getCreatorContentRows(user);
  return rows
    .map((row) => row.id)
    .filter((id) => typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id));
}

async function getActiveMomentRows() {
  if (!supabase) return [];

  const result = await supabase
    .from('moments')
    .select('id, title, venue_name, location, pulse_state, reward, starts_at, gathering_threshold, is_active, host_id')
    .eq('is_active', true)
    .order('starts_at', { ascending: true })
    .limit(50);

  if (result.error) {
    if (isSchemaCompatibilityError(result.error)) {
      return [];
    }
    throw result.error;
  }

  return result.data || [];
}

router.use(requireAuth);

router.get('/feed', async (req, res) => {
  try {
    if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
      return res.json({ success: true, feed: DEMO_O2O_FEED });
    }

    const { data: links, error: linksError } = await supabase
      .from('content_moment_links')
      .select('id, content_item_id, moment_id, entry_action_types, physical_unlock_rules, o2o_conversion_rate, is_sponsored, created_at')
      .order('created_at', { ascending: false })
      .limit(24);

    if (linksError) throw linksError;
    if (!links || links.length === 0) {
      return res.json({ success: true, feed: [] });
    }

    const contentIds = [...new Set(links.map((link) => link.content_item_id))];
    const momentIds = [...new Set(links.map((link) => link.moment_id))];

    const [{ data: contentItems, error: contentError }, { data: moments, error: momentsError }] = await Promise.all([
      supabase
        .from('content_items')
        .select('id, title, description, platform, media_url')
        .in('id', contentIds),
      supabase
        .from('moments')
        .select('id, title, venue_name, location, pulse_state, reward, starts_at, gathering_threshold, is_active')
        .in('id', momentIds)
        .eq('is_active', true),
    ]);

    if (contentError) throw contentError;
    if (momentsError) throw momentsError;

    const normalizedContentItems = (contentItems || []).map((item) => ({
      ...item,
      creator_name: 'Promorang Creator',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      platform_url: item.media_url || 'https://promorang.co',
    }));

    const feed = buildO2OFeedPayload(links, normalizedContentItems, moments || []);
    res.json({ success: true, feed });
  } catch (error) {
    console.error('[O2O API] feed error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load O2O feed' });
  }
});

router.get('/missions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
      const mission = DEMO_O2O_FEED.find((item) => item.id === id || item.content.id === id || item.moment.id === id) || null;
      if (!mission) {
        return res.status(404).json({ success: false, error: 'Mission not found' });
      }
      return res.json({ success: true, mission });
    }

    const { data: link, error: linkError } = await supabase
      .from('content_moment_links')
      .select('id, content_item_id, moment_id, entry_action_types, physical_unlock_rules, o2o_conversion_rate, is_sponsored')
      .or(`id.eq.${id},content_item_id.eq.${id},moment_id.eq.${id}`)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link) {
      return res.status(404).json({ success: false, error: 'Mission not found' });
    }

    const [{ data: content, error: contentError }, { data: moment, error: momentError }] = await Promise.all([
      supabase
        .from('content_items')
        .select('id, title, description, platform, media_url, thumbnail_url, banner_image_url, gallery_images, video_url, media_metadata')
        .eq('id', link.content_item_id)
        .maybeSingle(),
      supabase
        .from('moments')
        .select('id, title, venue_name, location, pulse_state, reward, starts_at, gathering_threshold, is_active, image_url, banner_image_url')
        .eq('id', link.moment_id)
        .maybeSingle(),
    ]);

    if (contentError) throw contentError;
    if (momentError) throw momentError;
    if (!content || !moment || !moment.is_active) {
      return res.status(404).json({ success: false, error: 'Mission not found' });
    }

    const [mission] = buildO2OFeedPayload([link], [{
      ...content,
      creator_name: 'Promorang Creator',
      creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
      platform_url: content.media_url || 'https://promorang.co',
    }], [moment]);
    res.json({ success: true, mission });
  } catch (error) {
    console.error('[O2O API] mission detail error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load mission' });
  }
});

router.get('/creator-summary', async (req, res) => {
  try {
    if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
      return res.json({
        success: true,
        summary: {
          linked_content_count: 2,
          linked_moment_count: 2,
          avg_o2o_conversion_rate: 9.8,
          sponsored_links: 1,
          attributed_joins: 19,
          verified_unlocks: 11,
          memories_issued: 7,
          creator_momentum_value: 19,
          creator_impact_score: 84,
          catalyst_conversions: 5,
          top_missions: [
            {
              id: 'demo-o2o-2',
              content_title: 'Plaza Sessions Episode 04',
              moment_title: 'Fountain Plaza Session',
              o2o_conversion_rate: 11.2,
              attributed_joins: 12,
              verified_unlocks: 8,
              memories_issued: 5,
            },
            {
              id: 'demo-o2o-1',
              content_title: 'Sydney Secret: The Hidden Roast Route',
              moment_title: 'Central Cafe Founder Drop',
              o2o_conversion_rate: 8.4,
              attributed_joins: 7,
              verified_unlocks: 3,
              memories_issued: 2,
            },
          ],
        },
      });
    }

    const contentIds = await getCreatorContentItemIds(req.user);

    if (contentIds.length === 0) {
      return res.json({
        success: true,
        summary: {
          linked_content_count: 0,
          linked_moment_count: 0,
          avg_o2o_conversion_rate: 0,
          sponsored_links: 0,
          attributed_joins: 0,
          verified_unlocks: 0,
          memories_issued: 0,
          creator_momentum_value: 0,
          creator_impact_score: 0,
          catalyst_rank: 'new_signal',
          catalyst_conversions: 0,
          downstream_action_count: 0,
          downstream_reward_value: 0,
          top_missions: [],
        },
      });
    }

    const { data: links, error: linksError } = await supabase
      .from('content_moment_links')
      .select('id, content_item_id, moment_id, o2o_conversion_rate, is_sponsored')
      .in('content_item_id', contentIds);

    if (linksError) {
      if (isSchemaCompatibilityError(linksError)) {
        return res.json({
          success: true,
          summary: {
            linked_content_count: contentIds.length,
            linked_moment_count: 0,
            avg_o2o_conversion_rate: 0,
            sponsored_links: 0,
            attributed_joins: 0,
            verified_unlocks: 0,
            memories_issued: 0,
            creator_momentum_value: 0,
            creator_impact_score: 0,
            catalyst_rank: 'new_signal',
            catalyst_conversions: 0,
            downstream_action_count: 0,
            downstream_reward_value: 0,
            top_missions: [],
          },
        });
      }
      throw linksError;
    }

    const linkedMomentIds = new Set((links || []).map((link) => link.moment_id));
    const avgRate = links && links.length > 0
      ? Number((links.reduce((sum, link) => sum + Number(link.o2o_conversion_rate || 0), 0) / links.length).toFixed(2))
      : 0;

    const momentIds = [...linkedMomentIds].filter(Boolean);

    const [{ data: missionAttributions, error: missionError }, impactProfileResult, impactEventsResult] = await Promise.all([
      momentIds.length
        ? supabase
          .from('mission_attributions')
          .select('id, mission_link_id, content_item_id, moment_id, joined_at, verified_at, memory_id')
          .in('content_item_id', contentIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('user_impact_profiles')
        .select('impact_score, catalyst_rank, downstream_action_count, downstream_reward_value')
        .eq('user_id', req.user.id)
        .maybeSingle(),
      momentIds.length
        ? supabase
          .from('impact_events')
          .select('id, event_type, impact_score_delta, viral_share_amount, moment_id')
          .eq('source_user_id', req.user.id)
          .in('moment_id', momentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (missionError && !/relation .*mission_attributions.* does not exist/i.test(missionError.message || '')) {
      throw missionError;
    }
    if (impactProfileResult.error) throw impactProfileResult.error;
    if (impactEventsResult.error) throw impactEventsResult.error;

    const missionRows = missionAttributions || [];
    const impactProfile = impactProfileResult.data || null;
    const impactEvents = impactEventsResult.data || [];

    const attributedJoins = missionRows.filter((row) => row.joined_at).length;
    const verifiedUnlocks = missionRows.filter((row) => row.verified_at).length;
    const memoriesIssued = missionRows.filter((row) => row.memory_id).length;
    const creatorMomentumValue = Number(
      impactEvents.reduce((sum, event) => sum + Number(event.viral_share_amount || 0), 0).toFixed(2)
    );
    const catalystConversions = impactEvents.filter((event) => event.event_type === 'share_conversion').length;

    const topMissionMap = new Map();
    for (const link of links || []) {
      const rows = missionRows.filter((row) => row.mission_link_id === link.id || (row.content_item_id === link.content_item_id && row.moment_id === link.moment_id));
      topMissionMap.set(link.id, {
        id: link.id,
        content_title: null,
        moment_title: null,
        o2o_conversion_rate: Number(link.o2o_conversion_rate || 0),
        attributed_joins: rows.filter((row) => row.joined_at).length,
        verified_unlocks: rows.filter((row) => row.verified_at).length,
        memories_issued: rows.filter((row) => row.memory_id).length,
      });
    }

    const { data: contentRows } = contentIds.length
      ? await supabase.from('content_items').select('id, title').in('id', contentIds)
      : { data: [] };
    const { data: momentRows } = momentIds.length
      ? await supabase.from('moments').select('id, title').in('id', momentIds)
      : { data: [] };

    const contentMap = new Map((contentRows || []).map((item) => [item.id, item.title]));
    const momentMap = new Map((momentRows || []).map((item) => [item.id, item.title]));

    for (const link of links || []) {
      const item = topMissionMap.get(link.id);
      if (!item) continue;
      item.content_title = contentMap.get(link.content_item_id) || 'Untitled Content';
      item.moment_title = momentMap.get(link.moment_id) || 'Untitled Moment';
    }

    const topMissions = [...topMissionMap.values()]
      .sort((a, b) => (b.memories_issued * 3 + b.verified_unlocks * 2 + b.attributed_joins) - (a.memories_issued * 3 + a.verified_unlocks * 2 + a.attributed_joins))
      .slice(0, 3);

    res.json({
      success: true,
      summary: {
        linked_content_count: contentIds.length,
        linked_moment_count: linkedMomentIds.size,
        avg_o2o_conversion_rate: avgRate,
        sponsored_links: (links || []).filter((link) => link.is_sponsored).length,
        attributed_joins: attributedJoins,
        verified_unlocks: verifiedUnlocks,
        memories_issued: memoriesIssued,
        creator_momentum_value: creatorMomentumValue,
        creator_impact_score: impactProfile?.impact_score || 0,
        catalyst_rank: impactProfile?.catalyst_rank || 'new_signal',
        catalyst_conversions: catalystConversions,
        downstream_action_count: impactProfile?.downstream_action_count || 0,
        downstream_reward_value: Number(impactProfile?.downstream_reward_value || 0),
        top_missions: topMissions,
      },
    });
  } catch (error) {
    console.error('[O2O API] creator summary error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load creator summary' });
  }
});

router.get('/links/mine', async (req, res) => {
  try {
    if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
      return res.json({ success: true, links: DEMO_O2O_FEED });
    }

    const creatorContentRows = await getCreatorContentRows(req.user);
    const contentIds = creatorContentRows
      .map((item) => item.id)
      .filter((id) => typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id));

    if (contentIds.length === 0) {
      return res.json({ success: true, links: [] });
    }

    const { data: links, error: linksError } = await supabase
      .from('content_moment_links')
      .select('id, content_item_id, moment_id, entry_action_types, physical_unlock_rules, o2o_conversion_rate, is_sponsored, created_at')
      .in('content_item_id', contentIds)
      .order('created_at', { ascending: false });

    if (linksError) {
      if (isSchemaCompatibilityError(linksError)) {
        return res.json({ success: true, links: [] });
      }
      throw linksError;
    }

    const momentIds = [...new Set((links || []).map((link) => link.moment_id))];
    const [{ data: normalizedContentRows, error: contentRowsError }, { data: momentRows, error: momentRowsError }] = await Promise.all([
      supabase
        .from('content_items')
        .select('id, title, description, platform, media_url')
        .in('id', contentIds),
      momentIds.length > 0
        ? supabase
            .from('moments')
            .select('id, title, venue_name, location, pulse_state, reward, starts_at, gathering_threshold, is_active')
            .in('id', momentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (contentRowsError) {
      if (isSchemaCompatibilityError(contentRowsError)) {
        return res.json({ success: true, links: [] });
      }
      throw contentRowsError;
    }
    if (momentRowsError) throw momentRowsError;

    const contentMap = new Map(creatorContentRows.map((item) => [item.id, item]));
    const payload = buildO2OFeedPayload(
      links || [],
      (normalizedContentRows || []).map((item) => ({
        ...item,
        creator_name: contentMap.get(item.id)?.creator_name || req.user.display_name || req.user.email || 'Promorang Creator',
        creator_avatar: contentMap.get(item.id)?.creator_avatar || req.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
        platform_url: contentMap.get(item.id)?.platform_url || item.media_url || 'https://promorang.co',
      })),
      (momentRows || []).filter((moment) => moment.is_active)
    );
    res.json({ success: true, links: payload });
  } catch (error) {
    console.error('[O2O API] my links error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load O2O links' });
  }
});

router.get('/manage/options', async (req, res) => {
  try {
    if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
      return res.json({
        success: true,
        options: {
          content_items: DEMO_O2O_FEED.map((item) => item.content),
          moments: DEMO_O2O_FEED.map((item) => item.moment),
        },
      });
    }

    const [contentItems, moments] = await Promise.all([
      getCreatorContentRows(req.user),
      getActiveMomentRows(),
    ]);

    res.json({
      success: true,
      options: {
        content_items: (contentItems || []).map((item) => ({
          id: item.id,
          title: item.title || 'Untitled Content',
          platform: item.platform || 'external',
          creator_name: item.creator_name || req.user.display_name || req.user.email || 'Promorang Creator',
          media_url: item.media_url || null,
        })),
        moments: moments || [],
      },
    });
  } catch (error) {
    console.error('[O2O API] manage options error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load O2O options' });
  }
});

router.post('/links', async (req, res) => {
  try {
    const {
      content_item_id,
      moment_id,
      entry_action_types = [],
      physical_unlock_rules = null,
      is_sponsored = false,
    } = req.body || {};

    if (!content_item_id || !moment_id) {
      return res.status(400).json({ success: false, error: 'content_item_id and moment_id are required' });
    }

    if (!supabase || process.env.USE_DEMO_CONTENT === 'true') {
      return res.status(201).json({
        success: true,
        link: {
          id: `demo-link-${Date.now()}`,
          content_item_id,
          moment_id,
          entry_action_types,
          physical_unlock_rules,
          is_sponsored,
          o2o_conversion_rate: 0,
        },
      });
    }

    const [{ data: content, error: contentError }, { data: moment, error: momentError }] = await Promise.all([
      supabase
        .from('content_items')
        .select('id, creator_id')
        .eq('id', content_item_id)
        .maybeSingle(),
      supabase
        .from('moments')
        .select('id, host_id, is_active')
        .eq('id', moment_id)
        .maybeSingle(),
    ]);

    if (contentError) throw contentError;
    if (momentError) throw momentError;
    if (!content || !moment) {
      return res.status(404).json({ success: false, error: 'Content or moment not found' });
    }

    if (content.creator_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only link your own content' });
    }

    if (moment.is_active === false) {
      return res.status(403).json({ success: false, error: 'That moment is not available for linking' });
    }

    const { data: link, error: linkError } = await supabase
      .from('content_moment_links')
      .upsert({
        content_item_id,
        moment_id,
        entry_action_types,
        physical_unlock_rules,
        is_sponsored,
      }, { onConflict: 'content_item_id,moment_id' })
      .select()
      .single();

    if (linkError) throw linkError;
    res.status(201).json({ success: true, link });
  } catch (error) {
    console.error('[O2O API] create link error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create O2O link' });
  }
});

module.exports = router;
