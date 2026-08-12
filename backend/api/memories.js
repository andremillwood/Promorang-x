const express = require('express');
const router = express.Router();
const memoryService = require('../services/memoryService');
const { requireAuth } = require('../middleware/auth');

router.get(['/', '/vault'], requireAuth, async (req, res) => {
  try {
    const vault = await memoryService.getVaultSummary(req.user.id);
    res.json({ success: true, vault });
  } catch (error) {
    console.error('[Memories API] vault error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const memory = await memoryService.getMemoryById(req.params.id, req.user.id);
    res.json({ success: true, memory });
  } catch (error) {
    console.error('[Memories API] detail error:', error);
    res.status(error.message === 'Memory not found' ? 404 : 500).json({ success: false, error: error.message });
  }
});

module.exports = router;
