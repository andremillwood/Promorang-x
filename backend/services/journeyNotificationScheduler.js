const { supabase } = require('../lib/supabase');
const notificationService = require('./notificationService');

const iso = (date) => date.toISOString();
const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);
const addDays = (date, days) => addHours(date, days * 24);

async function emit({ userId, type, title, message, relatedId, dedupeKey, pushData = {} }) {
  const { data, error } = await supabase.from('notifications').upsert({
    user_id: userId, type, title, message, related_id: relatedId, is_read: false, dedupe_key: dedupeKey,
  }, { onConflict: 'dedupe_key', ignoreDuplicates: true }).select('id');
  if (error) throw error;
  if (!data?.length) return false;
  await notificationService.sendToUser(userId, { title, body: message, data: { type, related_id: relatedId, ...pushData } });
  return true;
}

async function notifyUpcomingMoments(now) {
  const { data: moments, error } = await supabase.from('moments').select('id,title,starts_at,location').gte('starts_at', iso(now)).lte('starts_at', iso(addHours(now, 30))).in('status', ['scheduled', 'joinable', 'active']);
  if (error) throw error;
  if (!moments?.length) return 0;
  const { data: participants, error: participantError } = await supabase.from('moment_participants').select('user_id,moment_id').in('moment_id', moments.map((moment) => moment.id)).in('status', ['joined', 'confirmed']);
  if (participantError) throw participantError;
  const byId = new Map(moments.map((moment) => [moment.id, moment]));
  const results = await Promise.all((participants || []).map((row) => {
    const moment = byId.get(row.moment_id);
    const when = new Date(moment.starts_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Jamaica' });
    return emit({ userId: row.user_id, type: 'moment_upcoming', title: `${moment.title} is getting close`, message: `${when}${moment.location ? ` · ${moment.location}` : ''}. Everything you need is waiting in the Moment.`, relatedId: moment.id, dedupeKey: `moment-upcoming:${moment.id}:${row.user_id}`, pushData: { moment_id: moment.id } });
  }));
  return results.filter(Boolean).length;
}

async function notifyExpiringAccess(now) {
  const { data: perks, error } = await supabase.from('memory_perks').select('id,benefit_type,benefit_value,expires_at').eq('is_active', true).gte('expires_at', iso(now)).lte('expires_at', iso(addDays(now, 3)));
  if (error) throw error;
  if (!perks?.length) return 0;
  const { data: memories, error: memoryError } = await supabase.from('memories').select('id,user_id,perk_id,title').in('perk_id', perks.map((perk) => perk.id));
  if (memoryError) throw memoryError;
  const perkById = new Map(perks.map((perk) => [perk.id, perk]));
  const results = await Promise.all((memories || []).map((memory) => {
    const perk = perkById.get(memory.perk_id);
    const day = new Date(perk.expires_at).toLocaleDateString('en', { month: 'long', day: 'numeric', timeZone: 'America/Jamaica' });
    return emit({ userId: memory.user_id, type: 'access_expiring', title: 'Something you earned is nearing its last day', message: `${memory.title} carries access available until ${day}. Open it when it is useful—there is no pressure to stay in the app.`, relatedId: memory.id, dedupeKey: `access-expiring:${perk.id}:${memory.user_id}`, pushData: { memory_id: memory.id } });
  }));
  return results.filter(Boolean).length;
}

async function notifySceneReturns(now) {
  const { data: memberships, error } = await supabase.from('scene_memberships').select('user_id,scene_id,last_seen_at').eq('membership_state', 'active').lt('last_seen_at', iso(addDays(now, -21))).limit(1000);
  if (error) throw error;
  if (!memberships?.length) return 0;
  const sceneIds = [...new Set(memberships.map((item) => item.scene_id))];
  const { data: links, error: linkError } = await supabase.from('moment_scene_links').select('scene_id,moments(id,title,starts_at,status)').in('scene_id', sceneIds);
  if (linkError) throw linkError;
  const nextByScene = new Map();
  for (const link of links || []) {
    const moment = link.moments;
    if (!moment || new Date(moment.starts_at) < now || new Date(moment.starts_at) > addDays(now, 14)) continue;
    const current = nextByScene.get(link.scene_id);
    if (!current || new Date(moment.starts_at) < new Date(current.starts_at)) nextByScene.set(link.scene_id, moment);
  }
  const results = await Promise.all(memberships.filter((item) => nextByScene.has(item.scene_id)).map((item) => {
    const moment = nextByScene.get(item.scene_id);
    return emit({ userId: item.user_id, type: 'scene_return', title: 'A Scene you know is gathering again', message: `${moment.title} is coming into view. Return if it still feels like your world.`, relatedId: item.scene_id, dedupeKey: `scene-return:${item.scene_id}:${moment.id}:${item.user_id}`, pushData: { scene_id: item.scene_id } });
  }));
  return results.filter(Boolean).length;
}

async function runDueJourneyNotifications({ now = new Date() } = {}) {
  if (!supabase) throw new Error('Database not available');
  const results = await Promise.allSettled([notifyUpcomingMoments(now), notifyExpiringAccess(now), notifySceneReturns(now)]);
  const names = ['upcomingMoments', 'expiringAccess', 'sceneReturns'];
  return Object.fromEntries(results.map((result, index) => [names[index], result.status === 'fulfilled' ? { success: true, created: result.value } : { success: false, error: result.reason?.message || String(result.reason) }]));
}

module.exports = { runDueJourneyNotifications };
