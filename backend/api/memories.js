const express = require('express');
const router = express.Router();
const memoryService = require('../services/memoryService');
const { requireAuth } = require('../middleware/auth');

router.get(['/', '/vault'], requireAuth, async (req, res) => {
  try {
    const vault = await memoryService.getVaultSummary(req.user.id);
    res.json({ success: true, vault, ...vault });
  } catch (error) {
    console.error('[Memories API] vault error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const vault = await memoryService.getVaultSummary(req.user.id);
    const assetCounts = {
      nft: vault?.summary?.total_memories || 0,
      coupon: vault?.active_perks?.length || 0,
      token: 0,
      ticket: 0,
      key: 0,
    };
    res.json({
      success: true,
      data: {
        total_value_usd: vault?.summary?.total_legacy_score || 0,
        asset_counts: assetCounts,
        ...(vault?.summary || {}),
      },
      vault,
      ...vault,
    });
  } catch (error) {
    console.error('[Memories API] summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/assets', requireAuth, async (req, res) => {
  try {
    const vault = await memoryService.getVaultSummary(req.user.id);
    const assets = (vault?.memories || []).map((m) => ({
      id: m.id,
      user_id: req.user.id,
      asset_type: 'nft',
      name: m.title,
      description: m.metadata?.moment_title || m.title,
      value_usd: m.legacy_score || 0,
      metadata: m.metadata || {},
      created_at: m.issued_at,
      rarity: m.rarity,
    }));
    res.json({ success: true, data: assets });
  } catch (error) {
    console.error('[Memories API] assets error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const vault = await memoryService.getVaultSummary(req.user.id);
    const txs = (vault?.mission_history || []).map((mh) => ({
      id: mh.id,
      user_id: req.user.id,
      transaction_type: 'issuance',
      description: mh.moment_title || mh.content_title || 'Memory unlocked',
      created_at: mh.verified_at || mh.joined_at || mh.first_engaged_at,
      status: mh.status,
    }));
    res.json({ success: true, data: txs });
  } catch (error) {
    console.error('[Memories API] transactions error:', error);
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
