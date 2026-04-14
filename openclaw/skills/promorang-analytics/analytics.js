#!/usr/bin/env node

/**
 * Promorang Analytics Skill
 * Platform intelligence: health, trends, financials, churn, growth, geo.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function parseArgs(args) {
    const parsed = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            parsed[args[i].replace('--', '')] = args[i + 1] || true;
            i++;
        }
    }
    return parsed;
}

const args = parseArgs(process.argv.slice(2));

async function run() {
    switch (args.action) {
        case 'health-check': {
            const today = new Date().toISOString().split('T')[0];
            const [activeMoments, todaySignups, totalUsers, totalVenues] = await Promise.all([
                supabase.from('moments').select('id', { count: 'exact' }).eq('status', 'active'),
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', `${today}T00:00:00Z`),
                supabase.from('profiles').select('id', { count: 'exact' }),
                supabase.from('venues').select('id', { count: 'exact' }),
            ]);

            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                metrics: {
                    active_moments: activeMoments.count || 0,
                    signups_today: todaySignups.count || 0,
                    total_users: totalUsers.count || 0,
                    total_venues: totalVenues.count || 0,
                },
                message: `⚡ Daily Health Check\n\n✅ Platform healthy\n📊 ${activeMoments.count || 0} active moments\n👥 ${todaySignups.count || 0} signups today\n📍 ${totalVenues.count || 0} venues\n👤 ${totalUsers.count || 0} total users`,
            };
        }

        case 'weekly-trends': {
            const thisWeek = new Date(Date.now() - 7 * 86400000).toISOString();
            const lastWeek = new Date(Date.now() - 14 * 86400000).toISOString();

            const [thisSignups, lastSignups, thisMoments, lastMoments, thisCheckins, lastCheckins] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', thisWeek),
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', lastWeek).lt('created_at', thisWeek),
                supabase.from('moments').select('id', { count: 'exact' }).gte('created_at', thisWeek),
                supabase.from('moments').select('id', { count: 'exact' }).gte('created_at', lastWeek).lt('created_at', thisWeek),
                supabase.from('moment_participants').select('id', { count: 'exact' }).gte('created_at', thisWeek),
                supabase.from('moment_participants').select('id', { count: 'exact' }).gte('created_at', lastWeek).lt('created_at', thisWeek),
            ]);

            const pct = (curr, prev) => {
                if (!prev || prev === 0) return curr > 0 ? '+100%' : '0%';
                const change = ((curr - prev) / prev * 100).toFixed(0);
                return change > 0 ? `+${change}%` : `${change}%`;
            };

            const tw = { signups: thisSignups.count || 0, moments: thisMoments.count || 0, checkins: thisCheckins.count || 0 };
            const lw = { signups: lastSignups.count || 0, moments: lastMoments.count || 0, checkins: lastCheckins.count || 0 };

            return {
                this_week: tw,
                last_week: lw,
                trends: {
                    signups: pct(tw.signups, lw.signups),
                    moments: pct(tw.moments, lw.moments),
                    checkins: pct(tw.checkins, lw.checkins),
                },
                message: `⚡ Weekly Trends\n\n👥 Signups: ${tw.signups} (${pct(tw.signups, lw.signups)} vs last week)\n🎯 Moments: ${tw.moments} (${pct(tw.moments, lw.moments)})\n📍 Check-ins: ${tw.checkins} (${pct(tw.checkins, lw.checkins)})`,
                alerts: [
                    tw.signups < lw.signups * 0.7 ? '⚠️ Signups dropped significantly' : null,
                    tw.checkins < lw.checkins * 0.7 ? '⚠️ Check-ins declining — consider featuring moments' : null,
                ].filter(Boolean),
            };
        }

        case 'churn-alert': {
            const threshold = parseInt(args.threshold) || 14;
            const cutoff = new Date(Date.now() - threshold * 86400000).toISOString();

            const { data, count } = await supabase
                .from('profiles')
                .select('id, full_name, user_type, last_sign_in_at', { count: 'exact' })
                .lt('last_sign_in_at', cutoff)
                .not('user_type', 'is', null)
                .order('last_sign_in_at', { ascending: true })
                .limit(20);

            const byType = {};
            (data || []).forEach((u) => {
                byType[u.user_type] = (byType[u.user_type] || 0) + 1;
            });

            return {
                at_risk: count || 0,
                threshold_days: threshold,
                by_type: byType,
                top_at_risk: (data || []).slice(0, 10).map((u) => ({
                    name: u.full_name,
                    type: u.user_type,
                    days_inactive: Math.floor((Date.now() - new Date(u.last_sign_in_at).getTime()) / 86400000),
                })),
                message: `⚡ Churn Alert: ${count || 0} users inactive ${threshold}+ days\n\n${Object.entries(byType).map(([t, c]) => `${t}: ${c}`).join('\n')}\n\n${count > 5 ? '⚠️ Consider re-engagement campaign' : '✅ Churn within normal range'}`,
            };
        }

        case 'growth-metrics': {
            const days = parseInt(args.period) || 30;
            const since = new Date(Date.now() - days * 86400000).toISOString();
            const prevStart = new Date(Date.now() - days * 2 * 86400000).toISOString();

            const [currUsers, prevUsers, currMoments, prevMoments, currVenues, prevVenues] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', since),
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', prevStart).lt('created_at', since),
                supabase.from('moments').select('id', { count: 'exact' }).gte('created_at', since),
                supabase.from('moments').select('id', { count: 'exact' }).gte('created_at', prevStart).lt('created_at', since),
                supabase.from('venues').select('id', { count: 'exact' }).gte('created_at', since),
                supabase.from('venues').select('id', { count: 'exact' }).gte('created_at', prevStart).lt('created_at', since),
            ]);

            return {
                period: `${days} days`,
                current: {
                    new_users: currUsers.count || 0,
                    new_moments: currMoments.count || 0,
                    new_venues: currVenues.count || 0,
                },
                previous: {
                    new_users: prevUsers.count || 0,
                    new_moments: prevMoments.count || 0,
                    new_venues: prevVenues.count || 0,
                },
                message: `⚡ Growth Report (${days}d)\n\n👥 New users: ${currUsers.count || 0} (prev: ${prevUsers.count || 0})\n🎯 New moments: ${currMoments.count || 0} (prev: ${prevMoments.count || 0})\n📍 New venues: ${currVenues.count || 0} (prev: ${prevVenues.count || 0})`,
            };
        }

        case 'geo-insights': {
            const { data: moments } = await supabase
                .from('moments')
                .select('city')
                .not('city', 'is', null);

            const { data: venues } = await supabase
                .from('venues')
                .select('city')
                .not('city', 'is', null);

            const cities = {};
            (moments || []).forEach((m) => {
                if (!cities[m.city]) cities[m.city] = { moments: 0, venues: 0 };
                cities[m.city].moments++;
            });
            (venues || []).forEach((v) => {
                if (!cities[v.city]) cities[v.city] = { moments: 0, venues: 0 };
                cities[v.city].venues++;
            });

            const ranked = Object.entries(cities)
                .map(([city, data]) => ({ city, ...data, total: data.moments + data.venues }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);

            const lines = ranked.map((c) => `📍 ${c.city}: ${c.moments} moments, ${c.venues} venues`);

            return {
                cities: ranked,
                message: `⚡ Geographic Insights\n\n${lines.join('\n')}`,
            };
        }

        default:
            return { error: `Unknown action: ${args.action}` };
    }
}

run()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
