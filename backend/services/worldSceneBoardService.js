/**
 * Scene board: territory standing and faction contest from verified_actions.
 * No ownership ledger. No attack actions.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const {
  SHOW_UP_ACTION_TYPES,
  KINGSTON_AREAS,
  mapActionToPathDimension,
  resolveAreaKey,
  resolveKingstonTerritories,
  resolveCurrentStatic,
  resolveFactionContest,
} = require('./worldLayer');
const worldCrewService = require('./worldCrewService');

const PRESENCE_TYPES = new Set(SHOW_UP_ACTION_TYPES);

function emptyAreaCounts() {
  return KINGSTON_AREAS.reduce((acc, area) => {
    acc[area.key] = { presenceCount: 0, supportCount: 0 };
    return acc;
  }, {});
}

async function loadSceneActions(db, sceneId) {
  if (!sceneId) return [];
  const { data } = await db
    .from('verified_actions')
    .select('user_id, action_type, moment_id, scene_id, action_metadata, verified_at, created_at')
    .eq('scene_id', sceneId)
    .limit(400);
  return data || [];
}

async function venueHintsFor(db, actions) {
  const momentIds = [...new Set(actions.map((row) => row.moment_id).filter(Boolean))];
  const moments = {};
  if (momentIds.length) {
    const { data } = await db.from('moments').select('id, title, venue_name, location').in('id', momentIds);
    for (const row of data || []) moments[row.id] = row;
  }
  return moments;
}

function placeText(action, moment) {
  const meta = action.action_metadata || {};
  return [
    meta.area_key,
    meta.area,
    meta.venue_name,
    meta.place,
    meta.location,
    moment?.venue_name,
    moment?.location,
    moment?.title,
  ].filter(Boolean).join(' ');
}

async function factionsFor(db, userIds) {
  const map = {};
  if (!userIds.length) return map;
  const { data } = await db.from('world_player_state').select('user_id, faction_key').in('user_id', userIds);
  for (const row of data || []) map[row.user_id] = row.faction_key || null;
  return map;
}

async function mixedCrewFor(userId, db) {
  if (!userId) return false;
  try {
    const crew = await worldCrewService.getMyCrew(userId, db);
    if (!crew?.members?.length) return false;
    const keys = new Set();
    for (const member of crew.members) {
      const state = await db.from('world_player_state').select('faction_key').eq('user_id', member.userId).maybeSingle();
      if (state.data?.faction_key) keys.add(state.data.faction_key);
    }
    return keys.size > 1;
  } catch {
    return false;
  }
}

async function getSceneBoard(sceneId, userId = null, db = serviceSupabase) {
  const empty = {
    territories: resolveKingstonTerritories(),
    contest: resolveFactionContest(),
    polarity: resolveCurrentStatic({ currentCount: 0 }),
  };
  if (!db || !sceneId) return empty;

  const actions = await loadSceneActions(db, sceneId);
  const moments = await venueHintsFor(db, actions);
  const factions = await factionsFor(db, [...new Set(actions.map((row) => row.user_id).filter(Boolean))]);
  const areaCounts = emptyAreaCounts();
  const factionCurrents = {};
  let unalignedCurrent = 0;
  let lastActionAt = null;

  for (const action of actions) {
    const dimension = mapActionToPathDimension(action.action_type || action.actionType);
    if (!dimension) continue;
    const at = action.verified_at || action.created_at || null;
    if (at && (!lastActionAt || new Date(at).getTime() > new Date(lastActionAt).getTime())) {
      lastActionAt = at;
    }
    const areaKey = resolveAreaKey(placeText(action, moments[action.moment_id]), action.action_metadata?.area_key);
    if (areaKey && areaCounts[areaKey]) {
      if (PRESENCE_TYPES.has(action.action_type)) areaCounts[areaKey].presenceCount += 1;
      if (dimension === 'support') areaCounts[areaKey].supportCount += 1;
    }
    const factionKey = factions[action.user_id];
    if (factionKey) factionCurrents[factionKey] = (factionCurrents[factionKey] || 0) + 1;
    else unalignedCurrent += 1;
  }

  const currentCount = Object.values(factionCurrents).reduce((sum, n) => sum + n, 0) + unalignedCurrent;
  const mixedCrew = await mixedCrewFor(userId, db);

  return {
    territories: resolveKingstonTerritories(areaCounts),
    contest: resolveFactionContest({
      factionCurrents,
      unalignedCurrent,
      mixedCrew,
    }),
    polarity: resolveCurrentStatic({ currentCount, lastActionAt }),
  };
}

module.exports = { getSceneBoard };
