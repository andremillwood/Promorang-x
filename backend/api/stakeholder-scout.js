const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const service = require('../services/stakeholderScoutService');

const router = express.Router();

function sendError(res, error) {
  res.status(error.status || 500).json({ success: false, error: error.message || 'Scout request failed', autoSend: false });
}

router.use(requireAuth, requireAdmin);

router.get('/queue', async (req, res) => {
  try {
    const data = await service.listQueue({
      hubId: req.query.hub,
      status: req.query.status,
      limit: req.query.limit,
    });
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await service.getCandidate(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/ingest', async (req, res) => {
  try {
    const data = await service.ingest({
      catalog: req.body?.catalog,
      moments: req.body?.moments,
      asOf: req.body?.asOf ? new Date(req.body.asOf) : new Date(),
      actorId: req.user.id,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/nominate', async (req, res) => {
  try {
    const data = await service.nominate(req.body || {}, req.user.id);
    res.status(201).json({ success: true, data: { candidate: data, autoSend: false } });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/:id/approve', async (req, res) => {
  try {
    const data = await service.approve(req.params.id, req.user.id, req.body?.note);
    res.json({ success: true, data: { candidate: data, autoSend: false } });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const data = await service.reject(req.params.id, req.user.id, req.body?.note);
    res.json({ success: true, data: { candidate: data, autoSend: false } });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/:id/draft', async (req, res) => {
  try {
    const data = await service.draftInvite(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/:id/record-send', async (req, res) => {
  try {
    const data = await service.recordHumanSend(
      req.params.id,
      req.user.id,
      req.body?.channel || 'walk_in',
      req.body?.note,
    );
    res.json({ success: true, data: { candidate: data, autoSend: false } });
  } catch (error) {
    sendError(res, error);
  }
});

router.post('/:id/suppress', async (req, res) => {
  try {
    const data = await service.suppress(req.params.id, req.user.id, req.body?.reason);
    res.json({ success: true, data: { candidate: data, autoSend: false } });
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
