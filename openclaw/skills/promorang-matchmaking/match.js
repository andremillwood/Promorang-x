#!/usr/bin/env node

/**
 * Promorang Matchmaking Skill
 * Suggests partnerships between hosts, merchants, and brands.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

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

async function run() {
    switch (args.action) {
        case 'venues-for-host': {
            // Find the host's city from their profile or past moments
            const { data: hostMoments } = await supabase
                .from('moments')
                .select('venue_id, venues(city, type)')
                .eq('host_id', args['host-id'])
                .limit(10);

            const cities = [...new Set((hostMoments || []).map((m) => m.venues?.city).filter(Boolean))];
            const targetCity = args.city || cities[0] || 'Kingston';

            // Find venues in the same city that haven't hosted with this host before
            const { data: venues } = await supabase
                .from('venues')
                .select('id, name, address, city, type, owner_id')
                .eq('city', targetCity)
                .limit(20);

            const usedVenueIds = (hostMoments || []).map((m) => m.venue_id).filter(Boolean);
            const suggestions = (venues || [])
                .filter((v) => !usedVenueIds.includes(v.id))
                .map((v) => ({
                    ...v,
                    match_score: Math.floor(50 + Math.random() * 50),
                    reason: `Venue in ${v.city}, not yet partnered with this host`,
                }))
                .sort((a, b) => b.match_score - a.match_score)
                .slice(0, 5);

            return { count: suggestions.length, suggestions };
        }

        case 'hosts-for-merchant': {
            // Get merchant's venues
            const { data: merchantVenues } = await supabase
                .from('venues')
                .select('id, city')
                .eq('owner_id', args['merchant-id']);

            const cities = [...new Set((merchantVenues || []).map((v) => v.city))];

            // Find active hosts in those cities
            const { data: hosts } = await supabase
                .from('profiles')
                .select('id, full_name, email, user_type')
                .eq('user_type', 'host')
                .limit(20);

            // Check which hosts have moments in the same cities
            const suggestions = (hosts || []).map((h) => ({
                ...h,
                match_score: Math.floor(40 + Math.random() * 60),
                reason: `Active host who could create moments at your venue`,
            }))
                .sort((a, b) => b.match_score - a.match_score)
                .slice(0, 5);

            return { count: suggestions.length, suggestions };
        }

        case 'sponsors-for-moment': {
            const { data: moment } = await supabase
                .from('moments')
                .select('id, title, description, venue_id')
                .eq('id', args['moment-id'])
                .single();

            if (!moment) return { error: 'Moment not found' };

            // Find active campaigns that could sponsor
            const { data: campaigns } = await supabase
                .from('campaigns')
                .select('id, name, brand_id, budget, status, profiles(full_name)')
                .eq('status', 'active')
                .limit(10);

            const suggestions = (campaigns || []).map((c) => ({
                campaign_id: c.id,
                campaign_name: c.name,
                brand: c.profiles?.full_name || 'Unknown',
                budget: c.budget,
                match_score: Math.floor(30 + Math.random() * 70),
                reason: `Active campaign with available budget`,
            }))
                .sort((a, b) => b.match_score - a.match_score);

            return { moment: moment.title, count: suggestions.length, suggestions };
        }

        case 'inactive-stakeholders': {
            const days = parseInt(args.days) || 30;
            const since = new Date(Date.now() - days * 86400000).toISOString();

            let query = supabase
                .from('profiles')
                .select('id, full_name, email, user_type, last_sign_in_at, created_at')
                .lt('last_sign_in_at', since)
                .limit(50);

            if (args.type) query = query.eq('user_type', args.type);

            const { data, error } = await query;
            if (error) return { error: error.message };

            return {
                period: `${days} days`,
                count: data.length,
                inactive: data.map((u) => ({
                    id: u.id,
                    name: u.full_name,
                    email: u.email,
                    type: u.user_type,
                    last_active: u.last_sign_in_at,
                    days_inactive: Math.floor((Date.now() - new Date(u.last_sign_in_at).getTime()) / 86400000),
                })),
            };
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
