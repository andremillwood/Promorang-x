#!/usr/bin/env node

/**
 * Promorang Claim Skill
 * Manages unclaimed moments and venues lifecycle.
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
        case 'create-unclaimed': {
            // Check for duplicates
            const { data: existing } = await supabase
                .from('moments')
                .select('id, title')
                .eq('title', args.title)
                .gte('start_date', args['start-date']?.split('T')[0] || '')
                .limit(1);

            if (existing && existing.length > 0) {
                return { skipped: true, reason: 'Duplicate moment', existing_id: existing[0].id };
            }

            const { data, error } = await supabase
                .from('moments')
                .insert({
                    title: args.title,
                    description: args.description || '',
                    start_date: args['start-date'],
                    city: args.city || null,
                    claim_status: 'unclaimed',
                    source: args.source || 'scraped',
                    source_url: args['source-url'] || null,
                    status: 'active',
                })
                .select()
                .single();

            return error ? { error: error.message } : { created: true, moment: data };
        }

        case 'create-unclaimed-venue': {
            // Check for duplicates by name + city
            const { data: existing } = await supabase
                .from('venues')
                .select('id, name')
                .eq('name', args.name)
                .eq('city', args.city)
                .limit(1);

            if (existing && existing.length > 0) {
                return { skipped: true, reason: 'Duplicate venue', existing_id: existing[0].id };
            }

            const { data, error } = await supabase
                .from('venues')
                .insert({
                    name: args.name,
                    address: args.address || '',
                    city: args.city || null,
                    type: args.type || 'other',
                    claim_status: 'unclaimed',
                    source: args.source || 'scraped',
                    source_url: args['source-url'] || null,
                })
                .select()
                .single();

            return error ? { error: error.message } : { created: true, venue: data };
        }

        case 'list-unclaimed': {
            const limit = parseInt(args.limit) || 20;
            let query = supabase
                .from('moments')
                .select('id, title, start_date, city, source, source_url, created_at')
                .eq('claim_status', 'unclaimed')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (args.city) query = query.eq('city', args.city);

            const { data, error } = await query;
            return error ? { error: error.message } : { count: data.length, unclaimed: data };
        }

        case 'claim-stats': {
            const [unclaimed, claimed, total] = await Promise.all([
                supabase.from('moments').select('id', { count: 'exact' }).eq('claim_status', 'unclaimed'),
                supabase.from('moments').select('id', { count: 'exact' }).eq('claim_status', 'claimed'),
                supabase.from('moments').select('source, claim_status', { count: 'exact' }).not('source', 'is', null),
            ]);

            const unclaimedCount = unclaimed.count || 0;
            const claimedCount = claimed.count || 0;
            const totalScraped = unclaimedCount + claimedCount;
            const conversionRate = totalScraped > 0 ? ((claimedCount / totalScraped) * 100).toFixed(1) : '0';

            return {
                unclaimed: unclaimedCount,
                claimed: claimedCount,
                total_scraped: totalScraped,
                conversion_rate: `${conversionRate}%`,
            };
        }

        case 'outreach-draft': {
            const { data: moment } = await supabase
                .from('moments')
                .select('title, description, start_date, city, source, source_url')
                .eq('id', args['moment-id'])
                .single();

            if (!moment) return { error: 'Moment not found' };

            // Gather engagement data
            const { count: interested } = await supabase
                .from('moment_participants')
                .select('id', { count: 'exact' })
                .eq('moment_id', args['moment-id']);

            const draft = {
                subject: `Your event "${moment.title}" already has fans on Promorang`,
                body: [
                    `Hi there,`,
                    ``,
                    `Your event "${moment.title}" (${moment.city}, ${new Date(moment.start_date).toLocaleDateString()}) was discovered on ${moment.source} and listed on Promorang.`,
                    ``,
                    interested > 0
                        ? `${interested} people have already shown interest!`
                        : `People in ${moment.city} are already discovering it.`,
                    ``,
                    `Claim your moment on Promorang to unlock:`,
                    `- UGC photo/video uploads from attendees`,
                    `- Real-time check-in analytics`,
                    `- Brand sponsorship opportunities`,
                    `- Direct participant engagement`,
                    ``,
                    `Claim it free: https://promorang.co/claim/${args['moment-id']}`,
                    ``,
                    `Best,`,
                    `The Promorang Team`,
                ].join('\n'),
                moment_title: moment.title,
                interested_count: interested || 0,
            };

            return { draft, requires_approval: true };
        }

        case 'mark-claimed': {
            const { data, error } = await supabase
                .from('moments')
                .update({
                    claim_status: 'claimed',
                    claimed_by: args['claimed-by'],
                    claimed_at: new Date().toISOString(),
                    host_id: args['claimed-by'],
                })
                .eq('id', args['moment-id'])
                .eq('claim_status', 'unclaimed')
                .select()
                .single();

            return error ? { error: error.message } : { claimed: true, moment: data };
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
