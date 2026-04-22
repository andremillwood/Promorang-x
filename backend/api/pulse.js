const express = require('express');
const router = express.Router();
const pulseService = require('../services/pulseService');
const { requireAuth } = require('../middleware/auth');

router.get('/live', requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 20);
    const data = await pulseService.listLivePulseMoments({ limit });
    res.json({ success: true, moments: data });
  } catch (error) {
    console.error('[Pulse API] live error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/moments/:id', requireAuth, async (req, res) => {
  try {
    const data = await pulseService.getPulseForMoment(req.params.id);
    res.json({ success: true, pulse: data });
  } catch (error) {
    console.error('[Pulse API] moment error:', error);
    res.status(error.message === 'Moment not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

router.get('/moments/:id/eligibility', requireAuth, async (req, res) => {
  try {
    const data = await pulseService.getParticipationEligibility(req.params.id);
    res.json({ success: true, eligibility: data });
  } catch (error) {
    console.error('[Pulse API] eligibility error:', error);
    res.status(error.message === 'Moment not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/snapshots', requireAuth, async (req, res) => {
  try {
    const snapshot = await pulseService.recordPulseSnapshot(req.params.id, req.body || {});
    res.status(201).json({ success: true, snapshot });
  } catch (error) {
    console.error('[Pulse API] snapshot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/recalculate', requireAuth, async (req, res) => {
  try {
    const pulse = await pulseService.recalculateMomentPulse(req.params.id);
    res.json({ success: true, pulse });
  } catch (error) {
    console.error('[Pulse API] recalculate error:', error);
    res.status(error.message === 'Moment not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

module.exports = router;
