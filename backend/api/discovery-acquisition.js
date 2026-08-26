const express = require('express');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const service = require('../services/discoveryAcquisitionService');

const router = express.Router();

const voteWindows = new Map();
function voteRateLimit(req, res, next) {
  const key = String(req.headers['x-forwarded-for'] || req.ip || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const window = voteWindows.get(key);
  if (!window || now - window.startedAt > 60 * 1000) {
    voteWindows.set(key, { startedAt: now, count: 1 });
  } else {
    window.count += 1;
    if (window.count > 30) {
      return res.status(429).json({ error: 'Too many votes from this network. Try again shortly.' });
    }
  }
  next();
}

function attributionFrom(req) {
  const body = req.body || {};
  const query = req.query || {};
  return {
    anonymousId: body.anonymousId || query.anonymousId,
    userId: req.user?.id || body.userId || null,
    source: body.source || query.src || query.source || null,
    campaign: body.campaign || query.campaign || query.utm_campaign || null,
    referrerUrl: body.referrerUrl || req.get('referer') || null,
    ref: body.ref || query.ref || null,
    refAnon: body.refAnon || query.ref_anon || null,
    browserFingerprint: body.browserFingerprint || null,
    utm: body.utm || {
      utm_source: query.utm_source || body.utm_source,
      utm_medium: query.utm_medium || body.utm_medium,
      utm_campaign: query.utm_campaign || body.utm_campaign,
      utm_content: query.utm_content || body.utm_content,
      utm_term: query.utm_term || body.utm_term,
    },
  };
}

/* ---- Admin (must be before /:slug) ---- */
router.get('/admin/list', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await service.listDiscoveriesAdmin();
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not list Discoveries' });
  }
});

router.get('/admin/:id/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await service.getAnalytics(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not load analytics' });
  }
});

router.post('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await service.upsertDiscoveryAdmin(req.body || {}, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not create Discovery' });
  }
});

router.put('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await service.upsertDiscoveryAdmin({ ...(req.body || {}), id: req.params.id }, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not update Discovery' });
  }
});

router.get('/admin/:idOrSlug', requireAuth, requireAdmin, async (req, res) => {
  try {
    let discovery;
    try {
      discovery = await service.getDiscoveryBySlug(req.params.idOrSlug, { includeDraft: true });
    } catch {
      const { supabase } = require('../lib/supabase');
      const { data, error } = await supabase
        .from('acquisition_discoveries')
        .select('*')
        .eq('id', req.params.idOrSlug)
        .maybeSingle();
      if (error || !data) throw Object.assign(new Error('Discovery not found'), { status: 404 });
      discovery = data;
    }
    const choices = await service.getChoices(discovery.id);
    res.json({ success: true, data: { discovery, choices } });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not load Discovery' });
  }
});

/* ---- Public acquisition loop ---- */
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const attr = attributionFrom(req);
    if (!attr.anonymousId) {
      return res.status(422).json({ error: 'anonymousId query param is required' });
    }
    const data = await service.viewDiscovery({
      slug: req.params.slug,
      ...attr,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not load Discovery' });
  }
});

router.get('/:slug/results', optionalAuth, async (req, res) => {
  try {
    const data = await service.getResults(req.params.slug, {
      anonymousId: req.query.anonymousId,
      userId: req.user?.id || null,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not load results' });
  }
});

router.post('/:slug/vote', optionalAuth, voteRateLimit, async (req, res) => {
  try {
    const attr = attributionFrom(req);
    if (!attr.anonymousId) return res.status(422).json({ error: 'anonymousId is required' });
    const data = await service.castVote({
      slug: req.params.slug,
      choiceIds: req.body?.choiceIds || (req.body?.choiceId ? [req.body.choiceId] : []),
      ranking: req.body?.ranking,
      nominationText: req.body?.nominationText,
      ...attr,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not record vote' });
  }
});

router.post('/:slug/capture', optionalAuth, voteRateLimit, async (req, res) => {
  try {
    const attr = attributionFrom(req);
    if (!attr.anonymousId) return res.status(422).json({ error: 'anonymousId is required' });
    const data = await service.captureIdentity({
      slug: req.params.slug,
      phone: req.body?.phone,
      email: req.body?.email,
      displayName: req.body?.displayName || req.body?.name,
      ...attr,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not save your details' });
  }
});

router.post('/:slug/share', optionalAuth, async (req, res) => {
  try {
    const attr = attributionFrom(req);
    if (!attr.anonymousId) return res.status(422).json({ error: 'anonymousId is required' });
    const share = await service.recordShare({
      slug: req.params.slug,
      channel: req.body?.channel || 'whatsapp',
      ...attr,
    });
    res.json({ success: true, data: share });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not create share link' });
  }
});

router.post('/:slug/action', optionalAuth, async (req, res) => {
  try {
    const attr = attributionFrom(req);
    if (!attr.anonymousId) return res.status(422).json({ error: 'anonymousId is required' });
    const data = await service.recordNextAction({
      slug: req.params.slug,
      actionType: req.body?.actionType,
      actionValue: req.body?.actionValue,
      destination: req.body?.destination,
      momentId: req.body?.momentId,
      metadata: req.body?.metadata,
      ...attr,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Could not record action' });
  }
});

module.exports = router;
