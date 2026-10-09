const express = require('express');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const funnels = require('../services/platformFunnelService');

const router = express.Router();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (res, error) => res.status(error.status || 503).json({ success: false, error: error.status ? error.message : 'Funnel data is temporarily unavailable. Please try again.' });
router.param('id', (req, res, next, id) => UUID.test(id) ? next() : res.status(400).json({ success: false, error: 'A valid record ID is required' }));

router.get('/invitations/:id', optionalAuth, async (req, res) => {
  const kind = req.query.kind || 'moment';
  if (!['moment', 'offer'].includes(kind)) return res.status(400).json({ success: false, error: 'Choose a Moment or perk' });
  try { res.json({ success: true, data: await funnels.invitations(req.params.id, req.user?.id, kind) }); }
  catch (error) { fail(res, error); }
});

router.use(requireAuth);
router.get('/brief', async (req, res) => {
  try { res.json({ success: true, data: await funnels.latestBrief(req.user) }); }
  catch (error) { fail(res, error); }
});
router.get('/me', async (req, res) => {
  try { await funnels.linkLeads(req.user); res.json({ success: true, data: await funnels.mine(req.user.id) }); }
  catch (error) { fail(res, error); }
});
router.get('/campaigns/:id/report', async (req, res) => {
  try { res.json({ success: true, data: await funnels.campaignReport(req.params.id, req.user.id) }); }
  catch (error) { fail(res, error); }
});
router.post('/campaigns/:id/review', async (req, res) => {
  try { res.json({ success: true, data: await funnels.acknowledgeReport(req.params.id, req.user.id) }); }
  catch (error) { fail(res, error); }
});
router.get('/summary', requireAdmin, async (_req, res) => {
  try { res.json({ success: true, data: await funnels.summary() }); }
  catch (error) { fail(res, error); }
});

module.exports = router;
