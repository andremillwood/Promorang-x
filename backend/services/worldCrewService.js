/**
 * Small-group Crews and one Scene-scoped Run.
 * Progress is derived from verified_actions — not a second activity ledger.
 */

const crypto = require('crypto');
const { supabase: serviceSupabase } = require('../lib/supabase');
const { KINGSTON_AFTER_DARK_SLICE, resolveCrewRunProgress, resolvePathEvidence } = require('./worldLayer');

const CREW_MIN = 3;
const CREW_MAX = 8;

function inviteCode() {
  return `CRW-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function displayName(row) {
  return row?.display_name || row?.full_name || row?.username || row?.name || 'Member';
}

async function profileFor(db, userId) {
  if (!userId) return null;
  const { data } = await db.from('users').select('id, display_name, full_name, username, name').eq('id', userId).maybeSingle();
  return data;
}

async function getScene(db, slug) {
  const { data } = await db.from('scenes').select('id, slug, title, metadata').eq('slug', slug).maybeSingle();
  return data;
}

async function memberActions(db, userIds, sceneId) {
  if (!userIds.length) return [];
  let query = db.from('verified_actions').select('user_id, action_type, moment_id, scene_id').in('user_id', userIds).limit(400);
  if (sceneId) query = query.eq('scene_id', sceneId);
  const { data } = await query;
  return data || [];
}

async function memoriesFor(db, userIds) {
  if (!userIds.length) return [];
  const { data } = await db.from('memories').select('id, user_id, moment_id').in('user_id', userIds);
  return data || [];
}

function progressForCrew(actions, memories, userIds) {
  const memoryUsers = new Set((memories || []).map((row) => row.user_id));
  const crewActions = (actions || []).filter((row) => userIds.includes(row.user_id)).map((row) => ({
    actionType: row.action_type,
    memoryKept: memoryUsers.has(row.user_id),
  }));
  return resolveCrewRunProgress(crewActions);
}

async function getMyCrew(userId, db = serviceSupabase) {
  if (!db || !userId) return null;
  const membership = await db.from('world_crew_members').select('crew_id').eq('user_id', userId).maybeSingle();
  if (membership.error || !membership.data) return null;
  return getCrew(membership.data.crew_id, userId, db);
}

async function getCrew(crewId, viewerId, db = serviceSupabase) {
  const crew = await db.from('world_crews').select('*').eq('id', crewId).maybeSingle();
  if (crew.error || !crew.data) return null;

  const members = await db.from('world_crew_members').select('user_id, joined_at').eq('crew_id', crewId);
  const memberIds = (members.data || []).map((row) => row.user_id);
  const [actions, memories, scene] = await Promise.all([
    memberActions(db, memberIds, crew.data.scene_id),
    memoriesFor(db, memberIds),
    crew.data.scene_id
      ? db.from('scenes').select('id, slug, title, metadata').eq('id', crew.data.scene_id).maybeSingle().then((row) => row.data)
      : Promise.resolve(null),
  ]);

  const run = await db
    .from('world_runs')
    .select('*')
    .eq('crew_id', crewId)
    .in('status', ['open', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const profiles = [];
  for (const member of members.data || []) {
    const person = await profileFor(db, member.user_id);
    const theirActions = (actions || []).filter((row) => row.user_id === member.user_id);
    const path = resolvePathEvidence(theirActions.map((row) => ({ actionType: row.action_type })));
    profiles.push({
      userId: member.user_id,
      name: displayName(person),
      joinedAt: member.joined_at,
      pathCue: path.cue,
      pathTitle: path.title,
    });
  }

  const progress = progressForCrew(actions, memories, memberIds);
  return {
    id: crew.data.id,
    name: crew.data.name,
    inviteCode: crew.data.invite_code,
    scene: scene ? { id: scene.id, slug: scene.slug, title: scene.title } : null,
    members: profiles,
    size: profiles.length,
    canInvite: profiles.length < CREW_MAX,
    needsPeople: Math.max(0, CREW_MIN - profiles.length),
    viewerIsMember: memberIds.includes(viewerId),
    run: run.data
      ? {
          id: run.data.id,
          slug: run.data.slug,
          title: run.data.title,
          status: run.data.status,
          ...progress,
        }
      : {
          id: null,
          slug: KINGSTON_AFTER_DARK_SLICE.runSlug,
          title: KINGSTON_AFTER_DARK_SLICE.runTitle,
          status: profiles.length >= CREW_MIN ? 'ready' : 'forming',
          ...progress,
        },
  };
}

async function createCrew(userId, { name, sceneSlug = KINGSTON_AFTER_DARK_SLICE.sceneSlug } = {}, db = serviceSupabase) {
  if (!userId) throw new Error('Sign in to form a Crew');
  const existing = await getMyCrew(userId, db);
  if (existing) return existing;

  const scene = await getScene(db, sceneSlug);
  const inserted = await db.from('world_crews').insert({
    name: name || 'Night Owls',
    scene_id: scene?.id || null,
    created_by: userId,
    invite_code: inviteCode(),
  }).select().single();
  if (inserted.error) throw inserted.error;

  await db.from('world_crew_members').insert({ crew_id: inserted.data.id, user_id: userId });
  await db.from('world_runs').insert({
    crew_id: inserted.data.id,
    scene_id: scene?.id || null,
    slug: KINGSTON_AFTER_DARK_SLICE.runSlug,
    title: KINGSTON_AFTER_DARK_SLICE.runTitle,
    season_key: KINGSTON_AFTER_DARK_SLICE.seasonKey,
    status: 'open',
    metadata: { area: KINGSTON_AFTER_DARK_SLICE.area },
  });

  return getCrew(inserted.data.id, userId, db);
}

async function joinCrewByCode(userId, code, db = serviceSupabase) {
  if (!userId || !code) throw new Error('Invite code required');
  const existing = await getMyCrew(userId, db);
  if (existing) return existing;

  const crew = await db.from('world_crews').select('*').eq('invite_code', String(code).trim().toUpperCase()).maybeSingle();
  if (crew.error || !crew.data) throw new Error('That Crew invite is not valid');

  const members = await db.from('world_crew_members').select('user_id').eq('crew_id', crew.data.id);
  if ((members.data || []).length >= CREW_MAX) throw new Error('This Crew is already full');

  const added = await db.from('world_crew_members').insert({ crew_id: crew.data.id, user_id: userId }).select().maybeSingle();
  if (added.error && !/duplicate/i.test(added.error.message || '')) throw added.error;
  return getCrew(crew.data.id, userId, db);
}

module.exports = {
  CREW_MIN,
  CREW_MAX,
  getMyCrew,
  getCrew,
  createCrew,
  joinCrewByCode,
};
