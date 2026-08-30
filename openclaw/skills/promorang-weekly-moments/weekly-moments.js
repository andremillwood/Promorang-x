#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function parseArgs(args) {
    const parsed = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].replace('--', '').replace(/-/g, '_');
            parsed[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
            if (parsed[key] !== true) i++;
        }
    }
    return parsed;
}

const args = parseArgs(process.argv.slice(2));

async function run() {
    switch (args.action) {
        case 'run-drop': {
            const { data, error } = await supabase.rpc('run_weekly_moment_drop', {
                p_as_of: args.as_of || new Date().toISOString(),
            });
            return error ? { error: error.message } : data;
        }
        case 'list-horizon': {
            const asOf = new Date();
            const until = new Date(asOf.getTime() + 90 * 86400000).toISOString();
            const { data, error } = await supabase
                .from('cultural_calendar_events')
                .select('event_key, title, city, country, country_code, hub_id, starts_at, status, source_name, schedule_precision')
                .gte('starts_at', asOf.toISOString())
                .lt('starts_at', until)
                .order('starts_at');
            return error ? { error: error.message } : { lead_days: 90, horizon_ends_at: until, events: data };
        }
        case 'current-drop': {
            const { data: drop, error } = await supabase
                .from('weekly_moment_drops')
                .select('*')
                .eq('status', 'published')
                .order('week_start', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (error) return { error: error.message };
            if (!drop) return { drop: null, items: [] };
            const { data: items } = await supabase
                .from('view_public_weekly_moment_drop_items')
                .select('*')
                .eq('drop_id', drop.id)
                .order('starts_at');
            return { drop, items: items || [] };
        }
        case 'add-event': {
            if (!args.event_key || !args.title || !args.starts_at || !args.source_name) {
                return { error: 'event-key, title, starts-at, and source-name are required' };
            }
            const { data, error } = await supabase
                .from('cultural_calendar_events')
                .upsert({
                    event_key: args.event_key,
                    title: args.title,
                    description: args.description || args.title,
                    category: args.category || 'community',
                    city: args.city || null,
                    country: args.country || null,
                    country_code: args.country_code || null,
                    country_slug: args.country_slug || null,
                    city_slug: args.city_slug || null,
                    hub_id: args.hub_id || null,
                    timezone: args.timezone || null,
                    location: args.location || null,
                    venue_name: args.venue_name || null,
                    starts_at: args.starts_at,
                    ends_at: args.ends_at || null,
                    source_name: args.source_name,
                    source_url: args.source_url || null,
                    attribution_text: args.attribution_text || `Source: ${args.source_name}`,
                    schedule_precision: args.schedule_precision || 'exact',
                    image_url: args.image_url || null,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'event_key' })
                .select()
                .single();
            return error ? { error: error.message } : { added: true, event: data };
        }
        default:
            return { error: `Unknown action: ${args.action}` };
    }
}

run()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((err) => {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
    });
