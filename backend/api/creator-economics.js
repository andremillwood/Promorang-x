const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const creatorEconomicsService = require('../services/creatorEconomicsService');

router.use(requireAuth);

router.get('/me', async (req, res) => {
  try {
    const economics = await creatorEconomicsService.getCreatorEconomicsSummary(req.user.id);
    res.json({ success: true, economics });
  } catch (error) {
    console.error('[Creator Economics API] summary error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load creator economics' });
  }
});

module.exports = router;
