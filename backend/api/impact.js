const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const impactService = require('../services/impactService');

router.get('/me', requireAuth, async (req, res) => {
  try {
    const profile = await impactService.getImpactProfile(req.user.id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('[Impact API] me error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const leaderboard = await impactService.getImpactLeaderboard(limit);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('[Impact API] leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/public-leaderboard', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const leaderboard = await impactService.getImpactLeaderboard(limit);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('[Impact API] public leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
