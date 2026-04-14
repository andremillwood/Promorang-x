#!/usr/bin/env node

/**
 * Promorang Community Skill
 * Leaderboards, awards, live updates, welcome messages, challenges.
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
const rankNames = ['Newcomer', 'Explorer', 'Regular', 'Creator', 'Influencer', 'Ambassador'];

async function run() {
    switch (args.action) {
        case 'leaderboard': {
            const days = parseInt(args.period) || 7;
            const since = new Date(Date.now() - days * 86400000).toISOString();
            const type = args.type || 'participants';

            if (type === 'participants') {
                const { data } = await supabase
                    .from('moment_participants')
                    .select('user_id, profiles(full_name)')
                    .gte('created_at', since);

                const counts = {};
                (data || []).forEach((p) => {
                    const id = p.user_id;
                    if (!counts[id]) counts[id] = { name: p.profiles?.full_name || 'Anonymous', count: 0 };
                    counts[id].count++;
                });

                const ranked = Object.entries(counts)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 5)
                    .map(([id, info], i) => ({ rank: i + 1, name: info.name, check_ins: info.count }));

                const lines = ranked.map((r) => `${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][r.rank - 1]} ${r.name} — ${r.check_ins} check-ins`);

                return {
                    leaderboard: ranked,
                    message: `🏆 Top Participants This Week\n\n${lines.join('\n')}\n\nKeep checking in to climb the ranks! 🎯`,
                };
            }

            if (type === 'hosts') {
                const { data } = await supabase
                    .from('moments')
                    .select('host_id, profiles(full_name)')
                    .gte('created_at', since);

                const counts = {};
                (data || []).forEach((m) => {
                    if (!counts[m.host_id]) counts[m.host_id] = { name: m.profiles?.full_name || 'Unknown', count: 0 };
                    counts[m.host_id].count++;
                });

                const ranked = Object.entries(counts)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 5)
                    .map(([id, info], i) => ({ rank: i + 1, name: info.name, moments: info.count }));

                const lines = ranked.map((r) => `${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][r.rank - 1]} ${r.name} — ${r.moments} moments`);

                return {
                    leaderboard: ranked,
                    message: `🏆 Top Hosts This Week\n\n${lines.join('\n')}\n\nBig up to our hosts keeping Promorang alive! 🎯`,
                };
            }

            return { error: `Unknown leaderboard type: ${type}` };
        }

        case 'monthly-awards': {
            const month = args.month || new Date().toISOString().slice(0, 7);
            const start = `${month}-01T00:00:00Z`;
            const end = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1)).toISOString();

            const [moments, participants, media] = await Promise.all([
                supabase.from('moments').select('host_id, profiles(full_name)').gte('created_at', start).lt('created_at', end),
                supabase.from('moment_participants').select('user_id, profiles(full_name)').gte('created_at', start).lt('created_at', end),
                supabase.from('moment_media').select('uploaded_by, profiles(full_name)').gte('created_at', start).lt('created_at', end),
            ]);

            const count = (arr, key) => {
                const c = {};
                (arr || []).forEach((i) => {
                    const id = i[key];
                    if (!c[id]) c[id] = { name: i.profiles?.full_name || 'Unknown', count: 0 };
                    c[id].count++;
                });
                return Object.entries(c).sort((a, b) => b[1].count - a[1].count)[0];
            };

            const topHost = count(moments.data, 'host_id');
            const topParticipant = count(participants.data, 'user_id');
            const topCreator = count(media.data, 'uploaded_by');

            const awards = {
                month,
                most_active_host: topHost ? { name: topHost[1].name, moments: topHost[1].count } : null,
                top_participant: topParticipant ? { name: topParticipant[1].name, check_ins: topParticipant[1].count } : null,
                most_ugc: topCreator ? { name: topCreator[1].name, uploads: topCreator[1].count } : null,
            };

            const lines = [
                awards.most_active_host ? `🎤 Most Active Host: ${awards.most_active_host.name} (${awards.most_active_host.moments} moments)` : null,
                awards.top_participant ? `🙋 Top Participant: ${awards.top_participant.name} (${awards.top_participant.check_ins} check-ins)` : null,
                awards.most_ugc ? `📸 Most UGC: ${awards.most_ugc.name} (${awards.most_ugc.uploads} uploads)` : null,
            ].filter(Boolean);

            return {
                awards,
                message: `🏆 ${month} Promorang Awards\n\n${lines.join('\n')}\n\nCongratulations! Keep making moments unforgettable 🎯`,
            };
        }

        case 'live-update': {
            const { data: moment } = await supabase
                .from('moments')
                .select('title, city')
                .eq('id', args['moment-id'])
                .single();

            const { count } = await supabase
                .from('moment_participants')
                .select('id', { count: 'exact' })
                .eq('moment_id', args['moment-id']);

            return {
                message: `🔴 LIVE: ${moment?.title || 'Moment'} in ${moment?.city || 'Jamaica'}\n\n👥 ${count || 0} people checked in!\n\nJoin now on Promorang 🎯`,
            };
        }

        case 'welcome': {
            const { data: user } = await supabase
                .from('profiles')
                .select('full_name, user_type')
                .eq('id', args['user-id'])
                .single();

            return {
                message: `🎉 Welcome to Promorang, ${user?.full_name || 'friend'}!\n\nYou're now part of the crew. Check out what's happening near you and start earning points by checking in to moments 🎯`,
            };
        }

        case 'rank-up': {
            const rank = parseInt(args['new-rank']) || 0;
            const { data: user } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', args['user-id'])
                .single();

            return {
                message: `🎊 Level up! ${user?.full_name || 'You'} just reached ${rankNames[rank] || 'a new rank'}!\n\n${rank === 3 ? '🔓 You can now CREATE your own moments!' : 'Keep going — new features unlock at every rank'} 🎯`,
            };
        }

        case 'daily-challenge': {
            const types = {
                'check-in': '📍 Today\'s Challenge: Check into any moment and earn 25 bonus points! 🎯',
                ugc: '📸 Today\'s Challenge: Upload a photo at a moment for 50 bonus points! 🎯',
                referral: '🤝 Today\'s Challenge: Invite a friend to Promorang — you both get 100 points when they join! 🎯',
            };

            const type = args.type || ['check-in', 'ugc', 'referral'][Math.floor(Math.random() * 3)];

            return {
                type,
                message: types[type] || types['check-in'],
            };
        }

        default:
            return { error: `Unknown action: ${args.action}` };
    }
}

run()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
