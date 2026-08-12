const express = require('express');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const growth = require('../services/growthOperatingService');
const referralService = require('../services/referralService');
const { supabase } = require('../lib/supabase');

const router = express.Router();

router.post('/events', optionalAuth, async (req, res) => {
  try {
    const result = await growth.recordEvent({
      ...(req.body || {}),
      userId: req.user?.id || null,
      referrerUrl: req.body?.referrerUrl || req.headers.referer || null,
    }, { publicRequest: !req.user });
    res.status(202).json({ success: true, data: result });
  } catch (error) {
    res.status(error.message.includes('Authentication') ? 401 : 400).json({ success: false, error: error.message });
  }
});

router.post('/referral-click', optionalAuth, async (req, res) => {
  try {
    const referralCode = String(req.body?.referralCode || '').trim().toUpperCase();
    const sessionId = String(req.body?.sessionId || '').trim().slice(0, 120);
    if (!referralCode || !sessionId) {
      return res.status(400).json({ success: false, error: 'referralCode and sessionId are required' });
    }
    if (!supabase) return res.status(202).json({ success: true, data: { skipped: true } });

    const { data: code } = await supabase.from('referral_codes')
      .select('id,user_id,is_active,expires_at').eq('code', referralCode).maybeSingle();
    if (!code?.is_active || (code.expires_at && new Date(code.expires_at) < new Date())) {
      return res.status(202).json({ success: true, data: { tracked: false } });
    }

    const { error } = await supabase.from('referral_link_clicks').upsert({
      referral_code_id: code.id,
      referrer_id: code.user_id,
      session_id: sessionId,
      anonymous_id: req.body?.anonymousId || null,
      landing_path: String(req.body?.landingPath || '').slice(0, 500) || null,
      referrer_url: String(req.body?.referrerUrl || req.headers.referer || '').slice(0, 1000) || null,
      user_agent: String(req.headers['user-agent'] || '').slice(0, 500) || null,
      metadata: req.body?.metadata || {},
    }, { onConflict: 'referral_code_id,session_id', ignoreDuplicates: true });
    if (error) throw error;

    res.status(202).json({ success: true, data: { tracked: true } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/identity', requireAuth, async (req, res) => {
  try {
    const result = await growth.linkIdentity({
      anonymousId: req.body?.anonymousId,
      userId: req.user.id,
      firstTouch: req.body?.firstTouch || {},
      lastTouch: req.body?.lastTouch || {},
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/claim-referral', requireAuth, async (req, res) => {
  try {
    const referralCode = String(req.body?.referralCode || '').trim().toUpperCase();
    if (!referralCode) return res.status(400).json({ success: false, error: 'referralCode is required' });
    if (!supabase) return res.json({ success: true, data: { skipped: true } });

    const { data: existing } = await supabase.from('user_referrals').select('id,status')
      .eq('referred_id', req.user.id).maybeSingle();
    if (existing) return res.json({ success: true, data: { claimed: false, existing: true, referral: existing } });

    const referral = await referralService.trackReferral(req.user.id, referralCode, {
      signup_source: req.body?.source || 'web',
      anonymous_id: req.body?.anonymousId || null,
      attribution: req.body?.attribution || {},
    });
    await growth.recordEvent({
      eventName: 'referral_signup', journey: 'participant', stage: 'captured',
      userId: req.user.id, anonymousId: req.body?.anonymousId || null,
      referralCode, source: req.body?.attribution?.utm_source || 'referral',
      medium: req.body?.attribution?.utm_medium || 'referral',
      campaign: req.body?.attribution?.utm_campaign || null,
      entityType: 'user_referral', entityId: referral.id,
      idempotencyKey: `growth:referral-signup:${req.user.id}`,
    });
    res.json({ success: true, data: { claimed: true, referral } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/experiments/:key/assignment', optionalAuth, async (req, res) => {
  try {
    const result = await growth.assignExperiment({
      experimentKey: req.params.key,
      anonymousId: req.body?.anonymousId,
      userId: req.user?.id || null,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/scorecard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await growth.scorecard({
      startAt: req.query.start_at,
      endAt: req.query.end_at,
      journey: req.query.journey,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/experiments', requireAuth, requireAdmin, async (_req, res) => {
  try {
    if (!supabase) return res.json({ success: true, data: [] });
    const { data, error } = await supabase.from('growth_experiments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/experiments', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, error: 'Database unavailable' });
    const input = req.body || {};
    if (!input.experimentKey || !input.name || !input.hypothesis || !Array.isArray(input.variants) || input.variants.length < 2) {
      return res.status(400).json({ success: false, error: 'experimentKey, name, hypothesis, and at least two variants are required' });
    }
    const { data, error } = await supabase.from('growth_experiments').insert({
      experiment_key: input.experimentKey,
      name: input.name,
      hypothesis: input.hypothesis,
      journey: input.journey || 'participant',
      primary_event: input.primaryEvent || 'verified_outcome',
      guardrail_event: input.guardrailEvent || null,
      variants: input.variants,
      allocation_percent: Number(input.allocationPercent ?? 100),
      status: input.status || 'draft',
      starts_at: input.startsAt || null,
      ends_at: input.endsAt || null,
      created_by: req.user.id,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/experiments/:key', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ success: false, error: 'Database unavailable' });
    const allowed = ['draft', 'running', 'paused', 'completed'];
    if (!allowed.includes(req.body?.status)) return res.status(400).json({ success: false, error: 'Valid status is required' });
    const updates = {
      status: req.body.status,
      decision: req.body.decision || null,
      updated_at: new Date().toISOString(),
      ...(req.body.status === 'running' ? { starts_at: req.body.startsAt || new Date().toISOString() } : {}),
      ...(req.body.status === 'completed' ? { ends_at: req.body.endsAt || new Date().toISOString() } : {}),
    };
    const { data, error } = await supabase.from('growth_experiments').update(updates)
      .eq('experiment_key', req.params.key).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/experiments/:key/results', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.json({ success: true, data: { variants: [] } });
    const { data: experiment, error: experimentError } = await supabase.from('growth_experiments').select('*')
      .eq('experiment_key', req.params.key).single();
    if (experimentError) throw experimentError;
    const [{ data: assignments, error: assignmentError }, { data: events, error: eventError }] = await Promise.all([
      supabase.from('growth_experiment_assignments').select('variant,anonymous_id,user_id')
        .eq('experiment_key', req.params.key),
      supabase.from('growth_events').select('experiment_variant,event_name,anonymous_id,user_id,value')
        .eq('experiment_key', req.params.key),
    ]);
    if (assignmentError) throw assignmentError;
    if (eventError) throw eventError;
    const variants = new Map();
    for (const assignment of assignments || []) {
      const bucket = variants.get(assignment.variant) || { variant: assignment.variant, assigned: 0, conversions: new Set(), guardrails: new Set(), value: 0 };
      bucket.assigned += 1;
      variants.set(assignment.variant, bucket);
    }
    for (const event of events || []) {
      if (!event.experiment_variant) continue;
      const bucket = variants.get(event.experiment_variant) || { variant: event.experiment_variant, assigned: 0, conversions: new Set(), guardrails: new Set(), value: 0 };
      const identity = event.user_id || event.anonymous_id;
      if (event.event_name === experiment.primary_event && identity) bucket.conversions.add(identity);
      if (event.event_name === experiment.guardrail_event && identity) bucket.guardrails.add(identity);
      bucket.value += Number(event.value || 0);
      variants.set(event.experiment_variant, bucket);
    }
    res.json({
      success: true,
      data: {
        experiment,
        variants: Array.from(variants.values()).map((bucket) => ({
          variant: bucket.variant, assigned: bucket.assigned, conversions: bucket.conversions.size,
          conversionRate: bucket.assigned ? Number(((bucket.conversions.size / bucket.assigned) * 100).toFixed(2)) : 0,
          guardrailCount: bucket.guardrails.size, value: bucket.value,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
