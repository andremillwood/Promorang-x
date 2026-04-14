#!/usr/bin/env node

/**
 * Promorang Email Skill (Resend)
 * Transactional emails: outreach, surveys, digests, NPS.
 */

const { createClient } = require('@supabase/supabase-js');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!RESEND_API_KEY) {
    console.error(JSON.stringify({ error: 'Missing RESEND_API_KEY' }));
    process.exit(1);
}

const supabase = SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

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

async function sendEmail({ to, subject, html, text, from }) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: from || 'Promorang <hello@promorang.co>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html: html || undefined,
            text: text || undefined,
        }),
    });

    const data = await res.json();
    if (!res.ok) return { error: data.message || 'Send failed', status: res.status };
    return { sent: true, id: data.id, to };
}

async function run() {
    switch (args.action) {
        case 'send': {
            return sendEmail({
                to: args.to,
                subject: args.subject,
                text: args.body,
                from: args.from,
            });
        }

        case 'claim-outreach': {
            if (!supabase) return { error: 'Supabase not configured' };

            const { data: moment } = await supabase
                .from('moments')
                .select('title, city, start_date, source')
                .eq('id', args['moment-id'])
                .single();

            if (!moment) return { error: 'Moment not found' };

            const { count } = await supabase
                .from('moment_participants')
                .select('id', { count: 'exact' })
                .eq('moment_id', args['moment-id']);

            const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Your event already has fans on Promorang 🎯</h2>
          <p>Hi there,</p>
          <p>Your event <strong>"${moment.title}"</strong> in ${moment.city} was discovered on ${moment.source} and listed on Promorang.</p>
          ${count > 0 ? `<p><strong>${count} people</strong> have already shown interest!</p>` : `<p>People in ${moment.city} are already discovering it.</p>`}
          <p>Claim your moment to unlock:</p>
          <ul>
            <li>📸 UGC photo/video uploads from attendees</li>
            <li>📊 Real-time check-in analytics</li>
            <li>🤝 Brand sponsorship opportunities</li>
            <li>💬 Direct participant engagement</li>
          </ul>
          <p style="text-align: center; margin: 32px 0;">
            <a href="https://promorang.co/claim/${args['moment-id']}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Claim Your Moment</a>
          </p>
          <p>Best,<br/>The Promorang Team</p>
        </div>
      `;

            return sendEmail({
                to: args.to,
                subject: `Your event "${moment.title}" already has fans on Promorang`,
                html,
            });
        }

        case 'survey': {
            if (!supabase) return { error: 'Supabase not configured' };

            const { data: moment } = await supabase
                .from('moments')
                .select('title')
                .eq('id', args['moment-id'])
                .single();

            const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #6366f1;">How was ${moment?.title || 'the moment'}? 🎯</h2>
          <p>We'd love your quick feedback — takes 30 seconds.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="https://promorang.co/feedback/${args['moment-id']}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Rate This Moment</a>
          </p>
          <p>Your feedback helps hosts create even better experiences.</p>
          <p>— The Promorang Team</p>
        </div>
      `;

            return sendEmail({
                to: args.to,
                subject: `How was ${moment?.title || 'the moment'}?`,
                html,
            });
        }

        case 'digest': {
            if (!supabase) return { error: 'Supabase not configured' };

            const { data: user } = await supabase
                .from('profiles')
                .select('full_name, email, user_type')
                .eq('id', args['user-id'])
                .single();

            if (!user) return { error: 'User not found' };

            const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
            const [moments, signups] = await Promise.all([
                supabase.from('moments').select('id', { count: 'exact' }).gte('created_at', weekAgo),
                supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', weekAgo),
            ]);

            const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Your Weekly Promorang Digest 🎯</h2>
          <p>Hey ${user.full_name || 'there'},</p>
          <p>Here's what happened on Promorang this week:</p>
          <ul>
            <li>🎯 <strong>${moments.count || 0}</strong> new moments</li>
            <li>👥 <strong>${signups.count || 0}</strong> new signups</li>
          </ul>
          <p style="text-align: center; margin: 32px 0;">
            <a href="https://promorang.co/dashboard" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Dashboard</a>
          </p>
          <p>— The Promorang Team</p>
        </div>
      `;

            return sendEmail({
                to: args.to || user.email,
                subject: `Your Weekly Promorang Digest`,
                html,
            });
        }

        case 'nps': {
            const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; text-align: center;">
          <h2 style="color: #6366f1;">Quick question 🎯</h2>
          <p>How likely are you to recommend Promorang to a friend?</p>
          <p style="margin: 24px 0;">
            ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n =>
                `<a href="https://promorang.co/nps/${args['user-id']}/${n}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; margin: 4px; border-radius: 8px; background: ${n <= 6 ? '#ef4444' : n <= 8 ? '#f59e0b' : '#22c55e'}; color: white; text-decoration: none; font-weight: 600;">${n}</a>`
            ).join('')}
          </p>
          <p style="color: #888; font-size: 13px;">0 = Not likely &nbsp;&nbsp; 10 = Extremely likely</p>
        </div>
      `;

            return sendEmail({
                to: args.to,
                subject: `Quick question from Promorang`,
                html,
            });
        }

        default:
            return { error: `Unknown action: ${args.action}` };
    }
}

run()
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
