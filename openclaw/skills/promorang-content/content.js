#!/usr/bin/env node

/**
 * Promorang Content Engine Skill
 * Generates data-driven content: recaps, social posts, blog articles, spotlights.
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
        case 'moment-recap': {
            const { data: moment } = await supabase
                .from('moments')
                .select('id, title, description, start_date, end_date, host_id, venue_id, city, profiles(full_name), venues(name)')
                .eq('id', args['moment-id'])
                .single();

            if (!moment) return { error: 'Moment not found' };

            const [participants, media] = await Promise.all([
                supabase.from('moment_participants').select('id', { count: 'exact' }).eq('moment_id', args['moment-id']),
                supabase.from('moment_media').select('id, media_type', { count: 'exact' }).eq('moment_id', args['moment-id']),
            ]);

            const photos = (media.data || []).filter((m) => m.media_type === 'photo').length;
            const videos = (media.data || []).filter((m) => m.media_type === 'video').length;

            return {
                recap: {
                    title: moment.title,
                    host: moment.profiles?.full_name || 'Unknown',
                    venue: moment.venues?.name || 'TBD',
                    city: moment.city,
                    date: new Date(moment.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    stats: {
                        check_ins: participants.count || 0,
                        photos,
                        videos,
                        total_ugc: photos + videos,
                    },
                    suggested_caption: `${moment.title} was 🔥! ${participants.count || 0} people checked in, ${photos + videos} photos & videos uploaded. Big up ${moment.profiles?.full_name || 'the host'}! 🎯 #Promorang #${(moment.city || 'Jamaica').replace(/\s/g, '')}`,
                    suggested_hashtags: ['#Promorang', `#${(moment.city || 'Jamaica').replace(/\s/g, '')}`, '#Moments', '#LiveExperiences'],
                },
            };
        }

        case 'social-post': {
            const { data: moment } = await supabase
                .from('moments')
                .select('title, start_date, city, profiles(full_name)')
                .eq('id', args['moment-id'])
                .single();

            if (!moment) return { error: 'Moment not found' };

            const { count } = await supabase
                .from('moment_participants')
                .select('id', { count: 'exact' })
                .eq('moment_id', args['moment-id']);

            const platform = args.platform || 'instagram';
            const templates = {
                instagram: `🎯 ${moment.title}\n📍 ${moment.city}\n👥 ${count || 0} people experienced it\n\nHosted by ${moment.profiles?.full_name || 'a Promorang creator'}\n\n#Promorang #${(moment.city || 'Jamaica').replace(/\s/g, '')} #Moments #LiveExperiences`,
                twitter: `${moment.title} in ${moment.city} — ${count || 0} people, pure vibes 🔥\n\nHosted on @Promorang 🎯`,
                facebook: `${moment.title} just wrapped in ${moment.city}! ${count || 0} people checked in and shared their experience. See what you missed on Promorang.`,
            };

            return {
                platform,
                post: templates[platform] || templates.instagram,
                requires_approval: true,
            };
        }

        case 'weekly-roundup': {
            const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

            const [newMoments, newUsers, newVenues, topMoment] = await Promise.all([
                supabase.from('moments').select('id', { count: 'exact' }).gte('created_at', weekAgo),
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', weekAgo),
                supabase.from('venues').select('id', { count: 'exact' }).gte('created_at', weekAgo),
                supabase.from('moments')
                    .select('id, title, city, profiles(full_name)')
                    .gte('start_date', weekAgo)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single(),
            ]);

            return {
                roundup: {
                    period: `${new Date(weekAgo).toLocaleDateString()} — ${new Date().toLocaleDateString()}`,
                    new_moments: newMoments.count || 0,
                    new_signups: newUsers.count || 0,
                    new_venues: newVenues.count || 0,
                    featured_moment: topMoment.data ? {
                        title: topMoment.data.title,
                        host: topMoment.data.profiles?.full_name,
                        city: topMoment.data.city,
                    } : null,
                    draft: `📊 This Week on Promorang\n\n🎯 ${newMoments.count || 0} new moments\n👥 ${newUsers.count || 0} new signups\n📍 ${newVenues.count || 0} new venues\n\n${topMoment.data ? `Featured: "${topMoment.data.title}" by ${topMoment.data.profiles?.full_name} in ${topMoment.data.city}` : ''}`,
                },
                requires_approval: true,
            };
        }

        case 'host-spotlight': {
            const days = parseInt(args.period) || 30;
            const since = new Date(Date.now() - days * 86400000).toISOString();

            // Find host with most moments in the period
            const { data: moments } = await supabase
                .from('moments')
                .select('host_id, profiles(full_name)')
                .gte('created_at', since);

            if (!moments || moments.length === 0) return { error: 'No moments in period' };

            const hostCounts = {};
            moments.forEach((m) => {
                if (!hostCounts[m.host_id]) hostCounts[m.host_id] = { count: 0, name: m.profiles?.full_name };
                hostCounts[m.host_id].count++;
            });

            const topHost = Object.entries(hostCounts).sort((a, b) => b[1].count - a[1].count)[0];

            return {
                spotlight: {
                    host_id: topHost[0],
                    name: topHost[1].name,
                    moments_count: topHost[1].count,
                    period: `${days} days`,
                    draft: `🌟 Host Spotlight: ${topHost[1].name}\n\n${topHost[1].count} moments created in the last ${days} days. Thank you for making Promorang come alive! 🎯`,
                },
                requires_approval: true,
            };
        }

        case 'upcoming-hype': {
            const days = parseInt(args.days) || 7;
            const until = new Date(Date.now() + days * 86400000).toISOString();

            let query = supabase
                .from('moments')
                .select('id, title, start_date, city, profiles(full_name)')
                .gte('start_date', new Date().toISOString())
                .lte('start_date', until)
                .eq('status', 'active')
                .order('start_date')
                .limit(5);

            if (args.city) query = query.eq('city', args.city);

            const { data: upcoming } = await query;

            const lines = (upcoming || []).map((m, i) =>
                `${i + 1}. ${m.title} — ${new Date(m.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} in ${m.city}`
            );

            return {
                hype: {
                    count: (upcoming || []).length,
                    moments: upcoming,
                    draft: `🔥 Coming Up on Promorang\n\n${lines.join('\n')}\n\nDon't miss out — RSVP on Promorang 🎯`,
                },
                requires_approval: true,
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
