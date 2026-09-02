const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const experience = require('../services/peopleExperienceService');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, error, status = 400) => res.status(status).json({
  success: false,
  error: error.message || String(error),
});

router.get('/drops/:slug', optionalAuth, async (req, res) => {
  try {
    const drop = await experience.getDrop(req.params.slug);
    if (!drop) return fail(res, new Error('Drop not found'), 404);
    return ok(res, drop);
  } catch (error) {
    return fail(res, error, 500);
  }
});

router.get('/hubs/:slug', optionalAuth, async (req, res) => {
  try {
    const hub = await experience.getHub(req.params.slug, req.user?.id || null);
    if (!hub) return fail(res, new Error('Community not found'), 404);
    return ok(res, hub);
  } catch (error) {
    return fail(res, error, 500);
  }
});

router.use(requireAuth);

router.get('/home', async (req, res) => {
  try { return ok(res, await experience.getHome(req.user.id)); } catch (error) { return fail(res, error, 500); }
});

router.get('/network', async (req, res) => {
  try { return ok(res, await experience.getNetwork(req.user.id, req.query.sceneId || null)); } catch (error) { return fail(res, error, 500); }
});

router.get('/perks', async (req, res) => {
  try { return ok(res, await experience.getGiveablePerks(req.user.id)); } catch (error) { return fail(res, error, 500); }
});

router.get('/opportunities', async (req, res) => {
  try { return ok(res, await experience.getOpportunities(req.user.id, req.query.sceneId || null)); } catch (error) { return fail(res, error, 500); }
});

router.get('/happened', async (req, res) => {
  try { return ok(res, await experience.getHappened(req.user.id, { sceneId: req.query.sceneId || null })); } catch (error) { return fail(res, error, 500); }
});

router.get('/card', async (req, res) => {
  try { return ok(res, await experience.getCard(req.user.id)); } catch (error) { return fail(res, error, 500); }
});

router.post('/drops', async (req, res) => {
  try { return ok(res, await experience.createDrop(req.user.id, req.body || {}), 201); } catch (error) { return fail(res, error); }
});

router.post('/drops/:slug/claim', async (req, res) => {
  try { return ok(res, await experience.claimDrop(req.user.id, req.params.slug), 201); } catch (error) { return fail(res, error); }
});

router.post('/inventory', async (req, res) => {
  try { return ok(res, await experience.provideInventory(req.user.id, req.body || {}), 201); } catch (error) { return fail(res, error); }
});

router.post('/opportunities/:id/take', async (req, res) => {
  try {
    return ok(res, await experience.takeOpportunity(req.user.id, req.params.id, req.body?.sceneId || req.query.sceneId || null), 201);
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/hubs/:slug/contribute', async (req, res) => {
  try { return ok(res, await experience.contributeToHub(req.user.id, req.params.slug, req.body?.kind || 'contributor')); } catch (error) { return fail(res, error); }
});

router.post('/hubs/:slug/invite', async (req, res) => {
  try { return ok(res, await experience.inviteToHub(req.user.id, req.params.slug)); } catch (error) { return fail(res, error); }
});

router.post('/start', async (req, res) => {
  try { return ok(res, await experience.startCommunity(req.user.id, req.body || {}), 201); } catch (error) { return fail(res, error); }
});

router.post('/ask', async (req, res) => {
  try { return ok(res, await experience.createAsk(req.user.id, req.body || {}), 201); } catch (error) { return fail(res, error); }
});

router.post('/gather', async (req, res) => {
  try { return ok(res, await experience.createGathering(req.user.id, req.body || {}), 201); } catch (error) { return fail(res, error); }
});

module.exports = router;
