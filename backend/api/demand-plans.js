const express = require('express');
const { compileDemandPlan } = require('../services/demandPlanCompilerService');
const { requireAuth } = require('../middleware/auth');
const executionService = require('../services/promoPilotExecutionService');
const workerService = require('../services/promoPilotWorkerService');
const demandEventService = require('../services/demandEventService');
const campaignLearningService = require('../services/campaignLearningService');
const crypto = require('crypto');
const { supabase } = require('../lib/supabase');

const router = express.Router();

router.post('/compile', (req, res) => {
  try {
    const plan = compileDemandPlan(req.body || {});
    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Could not shape this campaign plan' });
  }
});

router.get('/go/:token', async (req, res) => {
  try {
    if (!supabase) return res.status(503).send('Link service unavailable');
    const token = String(req.params.token || '');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: link, error } = await supabase.from('promopilot_signed_links').select('*').eq('token_hash', tokenHash).eq('status', 'active').maybeSingle();
    if (error) throw error;
    if (!link) return res.status(404).send('This PromoPilot link is not active');
    if (link.expires_at && new Date(link.expires_at) <= new Date()) return res.status(410).send('This PromoPilot link has expired');
    const privacySecret = process.env.PROMOPILOT_SIGNING_SECRET || process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'promopilot-anonymous';
    const day = new Date().toISOString().slice(0, 10);
    const anonymousId = crypto.createHmac('sha256', privacySecret).update(`${req.ip || ''}:${req.get('user-agent') || ''}:${day}`).digest('hex').slice(0, 32);
    try {
      await demandEventService.recordEvent({
        demandPlanId: link.demand_plan_id,
        campaignId: link.campaign_id,
        anonymousId,
        eventType: 'qr_scanned',
        sourceSystem: 'promopilot_qr',
        sourceReference: link.id,
        channel: 'qr',
        consentBasis: 'legitimate_interest_aggregate_attribution',
        properties: { action_type: link.action_type },
      });
    } catch (eventError) {
      console.warn('[PromoPilot] QR scan attribution skipped:', eventError.message);
    }
    const frontend = (process.env.FRONTEND_URL || 'https://promorang.co').split(',')[0].replace(/\/$/, '');
    const target = new URL(link.target_path, frontend);
    target.searchParams.set('promo_source', 'qr');
    target.searchParams.set('promo_campaign', link.campaign_id);
    return res.redirect(302, target.toString());
  } catch (error) {
    console.error('[PromoPilot] signed link resolution failed:', error);
    return res.status(500).send('This PromoPilot link could not be opened');
  }
});

router.get('/campaign/:campaignId/intelligence', requireAuth, async (req, res) => {
  try {
    const intelligence = await demandEventService.getCampaignIntelligence(req.params.campaignId, req.user.id);
    res.json({ success: true, ...intelligence });
  } catch (error) {
    const status = /not found|not owned/i.test(error.message || '') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message || 'Could not read campaign demand' });
  }
});

router.get('/campaign/:campaignId/learning', requireAuth, async (req, res) => {
  try {
    const learning = await campaignLearningService.getLearning(req.params.campaignId, req.user.id);
    res.json({ success: true, ...learning });
  } catch (error) {
    const status = /not found|not owned/i.test(error.message || '') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message || 'Could not load campaign learning' });
  }
});

router.post('/campaign/:campaignId/learning/refresh', requireAuth, async (req, res) => {
  try {
    const learning = await campaignLearningService.refreshLearning(req.params.campaignId, req.user.id);
    res.json({ success: true, ...learning });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Could not refresh campaign learning' });
  }
});

router.post('/campaign/:campaignId/template', requireAuth, async (req, res) => {
  try {
    const template = await campaignLearningService.saveTemplate(req.params.campaignId, req.user.id, req.body || {});
    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Could not save this campaign pattern' });
  }
});

router.get('/templates', requireAuth, async (req, res) => {
  try {
    const templates = await campaignLearningService.listTemplates(req.user.id);
    res.json({ success: true, templates });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Could not load campaign patterns' });
  }
});

router.post('/campaign/:campaignId/events', requireAuth, async (req, res) => {
  try {
    const participantEvents = new Set(['campaign_opened', 'saved', 'followed', 'referral_shared']);
    if (!participantEvents.has(req.body?.eventType)) return res.status(400).json({ success: false, error: 'This event must come from its authoritative Promorang system' });
    const result = await demandEventService.recordEvent({
      campaignId: req.params.campaignId,
      actorUserId: req.user.id,
      eventType: req.body.eventType,
      sourceSystem: 'promorang_web',
      sourceReference: req.body.sourceReference || null,
      channel: req.body.channel || null,
      journeyId: req.body.journeyId || null,
      parentEventId: req.body.parentEventId || null,
      consentBasis: 'user_requested_action',
      properties: req.body.properties || {},
      verified: false,
    });
    res.status(result.idempotent ? 200 : 201).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Could not record demand event' });
  }
});

router.get('/campaign/:campaignId/execution', requireAuth, async (req, res) => {
  try {
    const manifest = await executionService.getManifest(req.params.campaignId, req.user.id);
    res.json({ success: true, ...manifest });
  } catch (error) {
    const status = /not found|not owned/i.test(error.message || '') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message || 'Could not load PromoPilot execution' });
  }
});

router.post('/campaign/:campaignId/prepare', requireAuth, async (req, res) => {
  try {
    const manifest = await executionService.prepare(req.params.campaignId, req.user.id);
    res.json({ success: true, ...manifest });
  } catch (error) {
    const status = /not found|not owned/i.test(error.message || '') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message || 'Could not prepare PromoPilot execution' });
  }
});

router.post('/campaign/:campaignId/launch', requireAuth, async (req, res) => {
  try {
    await executionService.queueLaunch(req.params.campaignId, req.user.id, req.body?.confirm === true);
    const processed = await workerService.processCampaign(req.params.campaignId, req.user.id);
    const manifest = await executionService.getManifest(req.params.campaignId, req.user.id);
    res.json({ success: true, processed: processed.length, ...manifest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Could not queue PromoPilot launch' });
  }
});

router.post('/campaign/:campaignId/process', requireAuth, async (req, res) => {
  try {
    const jobs = await workerService.processCampaign(req.params.campaignId, req.user.id);
    const manifest = await executionService.getManifest(req.params.campaignId, req.user.id);
    res.json({ success: true, processed: jobs.length, ...manifest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'PromoPilot could not process queued work' });
  }
});

router.post('/jobs/:jobId/retry', requireAuth, async (req, res) => {
  try {
    const job = await workerService.processJob(req.params.jobId, req.user.id);
    res.json({ success: true, job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'PromoPilot could not retry this job' });
  }
});

module.exports = router;
