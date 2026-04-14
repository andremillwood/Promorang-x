#!/usr/bin/env node

/**
 * Promorang Supabase Query Skill
 * Queries the Promorang database for moments, venues, products, users, and analytics.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY' }));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseArgs(args) {
    const parsed = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].replace('--', '');
            parsed[key] = args[i + 1] || true;
            i++;
        }
    }
    return parsed;
}

const args = parseArgs(process.argv.slice(2));
const action = args.action;

async function run() {
    switch (action) {
        case 'get-profile': {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', args['user-id'])
                .single();
            return error ? { error: error.message } : data;
        }

        case 'list-moments': {
            let query = supabase
                .from('moments')
                .select('id, title, description, start_date, end_date, status, venue_id, created_at')
                .eq('host_id', args['host-id'])
                .order('start_date', { ascending: false })
                .limit(20);
            if (args.status) query = query.eq('status', args.status);
            const { data, error } = await query;
            return error ? { error: error.message } : { count: data.length, moments: data };
        }

        case 'moment-stats': {
            const [participants, ugc] = await Promise.all([
                supabase
                    .from('moment_participants')
                    .select('id', { count: 'exact' })
                    .eq('moment_id', args['moment-id']),
                supabase
                    .from('moment_media')
                    .select('id', { count: 'exact' })
                    .eq('moment_id', args['moment-id']),
            ]);
            return {
                participants: participants.count || 0,
                ugc_uploads: ugc.count || 0,
            };
        }

        case 'list-venues': {
            const { data, error } = await supabase
                .from('venues')
                .select('id, name, address, city, type, created_at')
                .eq('owner_id', args['merchant-id'])
                .order('name');
            return error ? { error: error.message } : { count: data.length, venues: data };
        }

        case 'merchant-analytics': {
            const period = args.period || '30d';
            const days = parseInt(period);
            const since = new Date(Date.now() - days * 86400000).toISOString();

            const [products, integrations] = await Promise.all([
                supabase
                    .from('merchant_products')
                    .select('id', { count: 'exact' })
                    .eq('merchant_id', args['merchant-id']),
                supabase
                    .from('merchant_integrations')
                    .select('provider, status, products_synced, last_synced_at')
                    .eq('user_id', args['merchant-id']),
            ]);

            return {
                total_products: products.count || 0,
                integrations: integrations.data || [],
                period,
            };
        }

        case 'list-integrations': {
            const { data, error } = await supabase
                .from('merchant_integrations')
                .select('*')
                .eq('user_id', args['user-id']);
            return error ? { error: error.message } : data;
        }

        case 'synced-products': {
            const { data: integration } = await supabase
                .from('merchant_integrations')
                .select('id')
                .eq('user_id', args['user-id'])
                .eq('provider', args.provider)
                .single();

            if (!integration) return { error: 'No integration found' };

            const { data, error } = await supabase
                .from('synced_products')
                .select('*')
                .eq('integration_id', integration.id)
                .limit(50);
            return error ? { error: error.message } : { count: data.length, products: data };
        }

        case 'platform-stats': {
            const now = new Date();
            const weekAgo = new Date(now - 7 * 86400000).toISOString();

            const [users, moments, venues, signups] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact' }),
                supabase.from('moments').select('id', { count: 'exact' }).eq('status', 'active'),
                supabase.from('venues').select('id', { count: 'exact' }),
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', weekAgo),
            ]);

            return {
                total_users: users.count || 0,
                active_moments: moments.count || 0,
                total_venues: venues.count || 0,
                signups_this_week: signups.count || 0,
            };
        }

        case 'search-users': {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, user_type, maturity_state, created_at')
                .or(`full_name.ilike.%${args.query}%,email.ilike.%${args.query}%`)
                .limit(10);
            return error ? { error: error.message } : data;
        }

        default:
            return { error: `Unknown action: ${action}. Use: get-profile, list-moments, moment-stats, list-venues, merchant-analytics, list-integrations, synced-products, platform-stats, search-users` };
    }
}

run()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((err) => {
        console.error(JSON.stringify({ error: err.message }));
        process.exit(1);
    });
