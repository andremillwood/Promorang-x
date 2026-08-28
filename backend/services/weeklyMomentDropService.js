const { supabase } = require('../lib/supabase');

const LEAD_DAYS = 90;

function getClient() {
  return global.supabase || supabase;
}

async function runWeeklyMomentDrop(asOf = new Date()) {
  const client = getClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data, error } = await client.rpc('run_weekly_moment_drop', {
    p_as_of: asOf.toISOString(),
  });
  if (error) throw error;
  return data;
}

async function getCurrentDrop() {
  const client = getClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data: drop, error } = await client
    .from('weekly_moment_drops')
    .select('*')
    .eq('status', 'published')
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!drop) return { drop: null, items: [] };

  const { data: items, error: itemsError } = await client
    .from('view_public_weekly_moment_drop_items')
    .select('*')
    .eq('drop_id', drop.id)
    .order('starts_at', { ascending: true });
  if (itemsError) throw itemsError;

  return { drop, items: items || [] };
}

async function listHorizon({ asOf = new Date(), leadDays = LEAD_DAYS } = {}) {
  const client = getClient();
  if (!client) throw new Error('Supabase is not configured');

  const until = new Date(asOf.getTime() + leadDays * 86400000).toISOString();
  const { data, error } = await client
    .from('cultural_calendar_events')
    .select('event_key, title, city, country, country_code, city_slug, hub_id, starts_at, ends_at, status, source_name, source_url, schedule_precision')
    .gte('starts_at', asOf.toISOString())
    .lt('starts_at', until)
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return { lead_days: leadDays, horizon_ends_at: until, events: data || [] };
}

async function addCalendarEvent(event) {
  const client = getClient();
  if (!client) throw new Error('Supabase is not configured');
  if (!event?.event_key || !event?.title || !event?.starts_at || !event?.source_name) {
    throw new Error('event_key, title, starts_at, and source_name are required');
  }

  const { data, error } = await client
    .from('cultural_calendar_events')
    .upsert({
      event_key: event.event_key,
      title: event.title,
      description: event.description || event.title,
      category: event.category || 'community',
      city: event.city || null,
      country: event.country || null,
      country_code: event.country_code || null,
      country_slug: event.country_slug || null,
      city_slug: event.city_slug || null,
      hub_id: event.hub_id || null,
      ...(event.timezone ? { timezone: event.timezone } : {}),
      location: event.location || null,
      venue_name: event.venue_name || null,
      starts_at: event.starts_at,
      ends_at: event.ends_at || null,
      source_name: event.source_name,
      source_url: event.source_url || null,
      attribution_text: event.attribution_text || `Source: ${event.source_name}`,
      schedule_precision: event.schedule_precision || 'exact',
      image_url: event.image_url || null,
      metadata: event.metadata || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'event_key' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  LEAD_DAYS,
  runWeeklyMomentDrop,
  getCurrentDrop,
  listHorizon,
  addCalendarEvent,
};
