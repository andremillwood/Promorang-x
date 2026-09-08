/**
 * Scene-level Guilds: a flat federation of 2–6 Crews.
 * Not the /crew referral ladder and not a nested hierarchy.
 */

const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');
const {
  KINGSTON_AFTER_DARK_SLICE,
  resolveGuildReadiness,
  resolveFaction,
  resolveFactionContest,
} = require('./worldLayer');
const worldCrewService = require('./worldCrewService');

const GUILD_CREW_MAX = 6;

function inviteCode() {
  return `GLD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function getScene(db, slug) {
  const { data } = await db.from('scenes').select('id, slug, title, metadata').eq('slug', slug).maybeSingle();
  return data;
}

async function crewIdsForGuild(guildId, db) {
  const seats = await db.from('world_guild_crews').select('crew_id, joined_at').eq('guild_id', guildId);
  return seats.data || [];
}

async function getMyGuild(userId, db = serviceSupabase) {
  if (!db || !userId) return null;
  const crew = await worldCrewService.getMyCrew(userId, db);
  if (!crew) return null;
  const seat = await db.from('world_guild_crews').select('guild_id').eq('crew_id', crew.id).maybeSingle();
  if (seat.error || !seat.data) return null;
  return getGuild(seat.data.guild_id, userId, db);
}

async function getGuild(guildId, viewerId, db = serviceSupabase) {
  const guild = await db.from('world_guilds').select('*').eq('id', guildId).maybeSingle();
  if (guild.error || !guild.data) return null;

  const seats = await crewIdsForGuild(guildId, db);
  const crews = [];
  const factionKeys = new Set();
  for (const seat of seats) {
    const crew = await worldCrewService.getCrew(seat.crew_id, viewerId, db);
    if (!crew) continue;
    crews.push({
      id: crew.id,
      name: crew.name,
      size: crew.size,
      runTitle: crew.run?.title || null,
      runCompleted: crew.run?.completed ?? 0,
      runTotal: crew.run?.total ?? 4,
    });
    for (const member of crew.members || []) {
      const state = await db.from('world_player_state').select('faction_key').eq('user_id', member.userId).maybeSingle();
      const faction = resolveFaction(state.data?.faction_key);
      if (faction) factionKeys.add(faction.key);
    }
  }

  const scene = guild.data.scene_id
    ? await db.from('scenes').select('id, slug, title').eq('id', guild.data.scene_id).maybeSingle().then((row) => row.data)
    : null;

  const viewerCrew = viewerId ? await worldCrewService.getMyCrew(viewerId, db) : null;
  const readiness = resolveGuildReadiness(crews.length);

  return {
    id: guild.data.id,
    name: guild.data.name,
    inviteCode: guild.data.invite_code,
    scene: scene ? { id: scene.id, slug: scene.slug, title: scene.title } : null,
    crews,
    crewCount: crews.length,
    canInvite: crews.length < GUILD_CREW_MAX,
    viewerCrewId: viewerCrew?.id || null,
    viewerIsMember: Boolean(viewerCrew && crews.some((crew) => crew.id === viewerCrew.id)),
    readiness,
    contest: resolveFactionContest({ mixedCrew: factionKeys.size > 1 }),
  };
}

async function createGuild(userId, { name, sceneSlug = KINGSTON_AFTER_DARK_SLICE.sceneSlug } = {}, db = serviceSupabase) {
  if (!userId) throw new Error('Sign in to form a Guild');
  const crew = await worldCrewService.getMyCrew(userId, db);
  if (!crew) throw new Error('Form or join a Crew first. A Guild is Crews, not individuals.');

  const existingSeat = await db.from('world_guild_crews').select('guild_id').eq('crew_id', crew.id).maybeSingle();
  if (existingSeat.data?.guild_id) return getGuild(existingSeat.data.guild_id, userId, db);

  const scene = await getScene(db, sceneSlug);
  const inserted = await db.from('world_guilds').insert({
    name: name || 'Night Watch',
    scene_id: scene?.id || crew.scene?.id || null,
    created_by: userId,
    invite_code: inviteCode(),
  }).select().single();
  if (inserted.error) throw inserted.error;

  const attached = await db.from('world_guild_crews').insert({
    guild_id: inserted.data.id,
    crew_id: crew.id,
  }).select().maybeSingle();
  if (attached.error && !/duplicate/i.test(attached.error.message || '')) throw attached.error;

  return getGuild(inserted.data.id, userId, db);
}

async function joinGuildByCode(userId, code, db = serviceSupabase) {
  if (!userId || !code) throw new Error('Invite code required');
  const crew = await worldCrewService.getMyCrew(userId, db);
  if (!crew) throw new Error('Form or join a Crew first. A Guild is Crews, not individuals.');

  const existingSeat = await db.from('world_guild_crews').select('guild_id').eq('crew_id', crew.id).maybeSingle();
  if (existingSeat.data?.guild_id) return getGuild(existingSeat.data.guild_id, userId, db);

  const guild = await db.from('world_guilds').select('*').eq('invite_code', String(code).trim().toUpperCase()).maybeSingle();
  if (guild.error || !guild.data) throw new Error('That Guild invite is not valid');

  const seats = await crewIdsForGuild(guild.data.id, db);
  if (seats.length >= GUILD_CREW_MAX) throw new Error('This Guild is already full');

  const added = await db.from('world_guild_crews').insert({
    guild_id: guild.data.id,
    crew_id: crew.id,
  }).select().maybeSingle();
  if (added.error && !/duplicate/i.test(added.error.message || '')) throw added.error;
  return getGuild(guild.data.id, userId, db);
}

module.exports = {
  getMyGuild,
  getGuild,
  createGuild,
  joinGuildByCode,
};
