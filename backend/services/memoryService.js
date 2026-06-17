const { supabase: serviceSupabase } = require('../lib/supabase');
const missionAttributionService = require('./missionAttributionService');
const creatorEconomicsService = require('./creatorEconomicsService');
const supabase = global.supabase || serviceSupabase || null;

const DEFAULT_LEGACY_SCORES = {
  common: 25,
  rare: 75,
  epic: 175,
  legendary: 400,
};

async function getPerksByIds(perkIds) {
  if (!supabase || perkIds.length === 0) return [];

  const { data, error } = await supabase
    .from('memory_perks')
    .select('*')
    .in('id', perkIds);

  if (error) throw error;
  return data || [];
}

async function getVaultSummary(userId) {
  if (!supabase) throw new Error('Database not available');

  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('id, title, rarity, collection_key, legacy_score, issued_at, perk_id, moment_id, metadata')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (memoriesError) throw memoriesError;

  const perkIds = (memories || []).map((memory) => memory.perk_id).filter(Boolean);
  const perks = await getPerksByIds(perkIds);
  const activePerks = perks.filter((perk) => perk.is_active);
  const perkMap = new Map(perks.map((perk) => [perk.id, perk]));

  const hydratedMemories = (memories || []).map((memory) => ({
    ...memory,
    perk: memory.perk_id ? perkMap.get(memory.perk_id) || null : null,
  }));

  let missionHistory = [];
  try {
    const { data: attributions, error: attributionsError } = await supabase
      .from('mission_attributions')
      .select('id, content_item_id, moment_id, status, first_engaged_at, joined_at, verified_at, digital_event_count, join_event_count, verification_event_count, memory_id')
      .eq('user_id', userId)
      .order('first_engaged_at', { ascending: false });

    if (attributionsError && !/relation .*mission_attributions.* does not exist/i.test(attributionsError.message || '')) {
      throw attributionsError;
    }

    const contentIds = [...new Set((attributions || []).map((item) => item.content_item_id).filter(Boolean))];
    const momentIds = [...new Set((attributions || []).map((item) => item.moment_id).filter(Boolean))];

    const [{ data: contentItems }, { data: moments }] = await Promise.all([
      contentIds.length
        ? supabase.from('content_items').select('id, title').in('id', contentIds)
        : Promise.resolve({ data: [] }),
      momentIds.length
        ? supabase.from('moments').select('id, title').in('id', momentIds)
        : Promise.resolve({ data: [] }),
    ]);

    const contentMap = new Map((contentItems || []).map((item) => [item.id, item]));
    const momentMap = new Map((moments || []).map((item) => [item.id, item]));

    missionHistory = (attributions || []).map((item) => ({
      ...item,
      content_title: item.content_item_id ? contentMap.get(item.content_item_id)?.title || null : null,
      moment_title: item.moment_id ? momentMap.get(item.moment_id)?.title || null : null,
    }));
  } catch (error) {
    console.warn('[Memory Service] mission history skipped:', error.message);
  }

  return {
    memories: hydratedMemories,
    active_perks: activePerks,
    mission_history: missionHistory,
    summary: {
      total_memories: memories?.length || 0,
      legendary_count: memories?.filter((memory) => memory.rarity === 'legendary').length || 0,
      total_legacy_score: memories?.reduce((sum, memory) => sum + (memory.legacy_score || 0), 0) || 0,
    },
  };
}

async function getMemoryById(memoryId, userId) {
  if (!supabase) throw new Error('Database not available');

  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('id', memoryId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Memory not found');

  let perk = null;
  if (data.perk_id) {
    const perks = await getPerksByIds([data.perk_id]);
    perk = perks[0] || null;
  }

  let missionAttribution = null;
  try {
    const { data: attribution, error: attributionError } = await supabase
      .from('mission_attributions')
      .select('*')
      .eq('memory_id', memoryId)
      .eq('user_id', userId)
      .maybeSingle();

    if (attributionError && !/relation .*mission_attributions.* does not exist/i.test(attributionError.message || '')) {
      throw attributionError;
    }

    missionAttribution = attribution || null;
  } catch (error) {
    console.warn('[Memory Service] mission attribution detail skipped:', error.message);
  }

  return {
    ...data,
    perk,
    mission_attribution: missionAttribution,
  };
}

function buildCollectionKey(moment) {
  if (moment?.category) return String(moment.category).toLowerCase();
  if (moment?.venue_name) {
    return String(moment.venue_name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  return 'independent';
}

async function issueMemoryForMoment({
  userId,
  momentId,
  proofSubmissionId = null,
  reviewerId = null,
  source = 'proof_verification',
  metadata = {},
}) {
  if (!supabase) throw new Error('Database not available');

  const { data: existing, error: existingError } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .eq('moment_id', momentId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: moment, error: momentError } = await supabase
    .from('moments')
    .select('*')
    .eq('id', momentId)
    .maybeSingle();

  if (momentError) throw momentError;
  if (!moment) throw new Error('Moment not found for memory issuance');

  const rarity = moment.memory_rarity || 'common';
  const legacyScore = DEFAULT_LEGACY_SCORES[rarity] || DEFAULT_LEGACY_SCORES.common;

  const payload = {
    user_id: userId,
    moment_id: momentId,
    venue_id: moment.venue_id || null,
    creator_id: moment.host_id || null,
    brand_id: moment.brand_id || null,
    rarity,
    title: source === 'moment_checkin'
      ? `I was there: ${moment.title}`
      : `${moment.title} Memory`,
    collection_key: buildCollectionKey(moment),
    legacy_score: legacyScore,
    perk_id: moment.perk_template_id || null,
    metadata: {
      ...metadata,
      source,
      proof_submission_id: proofSubmissionId,
      reviewed_by: reviewerId,
      artifact_type: metadata.artifact_type || 'moment_memory',
      moment_title: moment.title || null,
      moment_mode: moment.moment_mode || null,
      pulse_state: moment.pulse_state || null,
    },
  };

  const { data: inserted, error: insertError } = await supabase
    .from('memories')
    .insert(payload)
    .select()
    .single();

  if (insertError) throw insertError;

  try {
    const attribution = await missionAttributionService.attachMemoryToMission({
      userId,
      momentId,
      memoryId: inserted.id,
    });
    if (attribution?.host_id) {
      await creatorEconomicsService.recordCreatorLedgerEntry({
        creatorId: attribution.host_id,
        missionAttributionId: attribution.id,
        missionLinkId: attribution.mission_link_id || null,
        contentItemId: attribution.content_item_id || null,
        momentId,
        brandId: attribution.brand_id || null,
        sourceType: 'memory_issuance',
        metadata: {
          attribution_source: 'memory_issuance',
          participant_user_id: userId,
          memory_id: inserted.id,
        },
      });
    }
  } catch (attributionError) {
    console.warn('[Memory Service] mission attribution memory attach skipped:', attributionError.message);
  }

  return inserted;
}

module.exports = {
  getVaultSummary,
  getMemoryById,
  issueMemoryForMoment,
};
