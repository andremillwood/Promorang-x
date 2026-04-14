#!/usr/bin/env node

/**
 * Promorang Feedback Intelligence Skill
 * Surveys, NPS tracking, and sentiment analysis.
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
        case 'survey-questions': {
            const { data: moment } = await supabase
                .from('moments')
                .select('title, description, city')
                .eq('id', args['moment-id'])
                .single();

            if (!moment) return { error: 'Moment not found' };

            return {
                moment: moment.title,
                questions: [
                    { id: 'rating', text: `How was "${moment.title}"? Rate 1-5 ⭐`, type: 'rating' },
                    { id: 'best', text: 'What was the best part?', type: 'text' },
                    { id: 'improve', text: 'What would make it even better next time?', type: 'text' },
                ],
                whatsapp_message: `Hey! How was ${moment.title}? 🎯\n\n⭐ Rate it 1-5\n💬 What was the best part?\n🔧 What could be better?\n\nJust reply with your answers!`,
            };
        }

        case 'record-response': {
            const { data, error } = await supabase
                .from('moment_feedback')
                .upsert({
                    moment_id: args['moment-id'],
                    user_id: args['user-id'],
                    rating: parseInt(args.rating) || null,
                    feedback: args.feedback || null,
                    created_at: new Date().toISOString(),
                }, { onConflict: 'moment_id,user_id' })
                .select()
                .single();

            return error ? { error: error.message } : { recorded: true, data };
        }

        case 'host-report': {
            const { data: feedback } = await supabase
                .from('moment_feedback')
                .select('rating, feedback')
                .eq('moment_id', args['moment-id']);

            if (!feedback || feedback.length === 0) return { error: 'No feedback yet' };

            const { data: moment } = await supabase
                .from('moments')
                .select('title')
                .eq('id', args['moment-id'])
                .single();

            const ratings = feedback.filter((f) => f.rating).map((f) => f.rating);
            const avgRating = ratings.length > 0
                ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                : 'N/A';
            const comments = feedback.filter((f) => f.feedback).map((f) => f.feedback);

            return {
                report: {
                    moment: moment?.title,
                    responses: feedback.length,
                    average_rating: avgRating,
                    rating_distribution: {
                        5: ratings.filter((r) => r === 5).length,
                        4: ratings.filter((r) => r === 4).length,
                        3: ratings.filter((r) => r === 3).length,
                        2: ratings.filter((r) => r === 2).length,
                        1: ratings.filter((r) => r === 1).length,
                    },
                    comments,
                },
                message: `📊 Feedback Report: ${moment?.title}\n\n⭐ Average: ${avgRating}/5 (${feedback.length} responses)\n${comments.length > 0 ? `\n💬 Comments:\n${comments.slice(0, 5).map((c) => `• "${c}"`).join('\n')}` : ''}`,
            };
        }

        case 'record-nps': {
            const { data, error } = await supabase
                .from('nps_responses')
                .insert({
                    user_id: args['user-id'],
                    score: parseInt(args.score),
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();

            return error ? { error: error.message } : { recorded: true, score: parseInt(args.score) };
        }

        case 'nps-dashboard': {
            const days = parseInt(args.period) || 30;
            const since = new Date(Date.now() - days * 86400000).toISOString();

            const { data } = await supabase
                .from('nps_responses')
                .select('score')
                .gte('created_at', since);

            if (!data || data.length === 0) return { error: 'No NPS data' };

            const promoters = data.filter((d) => d.score >= 9).length;
            const passives = data.filter((d) => d.score >= 7 && d.score <= 8).length;
            const detractors = data.filter((d) => d.score <= 6).length;
            const total = data.length;
            const nps = Math.round(((promoters - detractors) / total) * 100);

            return {
                nps_score: nps,
                total_responses: total,
                breakdown: { promoters, passives, detractors },
                period: `${days} days`,
                message: `📊 NPS Score: ${nps}\n\n✅ Promoters (9-10): ${promoters}\n😐 Passives (7-8): ${passives}\n❌ Detractors (0-6): ${detractors}\n\nTotal: ${total} responses`,
            };
        }

        case 'sentiment-summary': {
            const days = parseInt(args.period) || 7;
            const since = new Date(Date.now() - days * 86400000).toISOString();

            const { data } = await supabase
                .from('moment_feedback')
                .select('feedback, rating')
                .gte('created_at', since)
                .not('feedback', 'is', null);

            const positive = (data || []).filter((d) => d.rating >= 4);
            const negative = (data || []).filter((d) => d.rating <= 2);
            const neutral = (data || []).filter((d) => d.rating === 3);

            return {
                period: `${days} days`,
                total_feedback: (data || []).length,
                positive: { count: positive.length, samples: positive.slice(0, 3).map((p) => p.feedback) },
                negative: { count: negative.length, samples: negative.slice(0, 3).map((n) => n.feedback), alert: negative.length > 3 },
                neutral: { count: neutral.length },
            };
        }

        default:
            return { error: `Unknown action: ${args.action}` };
    }
}

run()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
