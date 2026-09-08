const { supabase: serviceSupabase } = require('../lib/supabase');
const { resolveFaction, WORLD_FACTIONS } = require('./worldLayer');

async function getPlayerState(userId, db = serviceSupabase) {
  if (!db || !userId) return { faction: null };
  const row = await db.from('world_player_state').select('faction_key, declared_at, house_key, house_revealed_at').eq('user_id', userId).maybeSingle();
  return {
    faction: resolveFaction(row.data?.faction_key),
    declaredAt: row.data?.declared_at || null,
    houseKey: row.data?.house_key || null,
    houseRevealedAt: row.data?.house_revealed_at || null,
  };
}

async function setFaction(userId, factionKey, db = serviceSupabase) {
  if (!userId) throw new Error('Sign in to choose a philosophy');
  if (factionKey && !WORLD_FACTIONS[factionKey]) throw new Error('That philosophy is not available');
  const payload = {
    user_id: userId,
    faction_key: factionKey || null,
    declared_at: factionKey ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const saved = await db.from('world_player_state').upsert(payload, { onConflict: 'user_id' }).select().maybeSingle();
  if (saved.error) throw saved.error;
  return getPlayerState(userId, db);
}

module.exports = { getPlayerState, setFaction };
