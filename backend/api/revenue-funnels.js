const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const revenueFunnels = require('../services/revenueFunnelService');

const router = express.Router();

router.post('/events', requireAuth, async (req, res) => {
  try {
    const event = req.body || {};
    const result = await revenueFunnels.record({
      ...event,
      userId: req.user.id,
      source: event.source || 'web',
    });
    res.status(202).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await revenueFunnels.summary({
      startAt: req.query.start_at,
      endAt: req.query.end_at,
      funnel: req.query.funnel,
    });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
