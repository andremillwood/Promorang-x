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
    const totalLegacyScore = Number(vault?.summary?.total_legacy_score || 0);

    res.json({
      success: true,
      data: {
        // Compatibility field retained for older clients. A legacy/history score is
        // not a financial valuation, so it must never be projected into USD here.
        total_value_usd: 0,
        total_legacy_score: totalLegacyScore,
        value_source: 'none_recorded',
        value_note: 'Retained memories are verified history. Legacy score is not USD, cash value, Gems, or a redemption guarantee.',
        asset_counts: assetCounts,
        ...(vault?.summary || {}),
        // Re-assert the canonical semantic fields after spreading the legacy summary.
        total_legacy_score: totalLegacyScore,
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
      // Kept for older clients that group memories under their historical NFT bucket.
      // canonical_type is the authoritative product meaning.
      asset_type: 'nft',
      canonical_type: 'memory',
      name: m.title,
      asset_name: m.title,
      asset_symbol: 'MEMORY',
      description: m.metadata?.moment_title || m.title,
      balance: 1,
      value_usd: null,
      financial_value_recorded: false,
      legacy_score: Number(m.legacy_score || 0),
      value_note: 'Legacy score describes retained history; it is not a financial valuation.',
      metadata: {
        ...(m.metadata || {}),
        canonical_type: 'memory',
        legacy_score: Number(m.legacy_score || 0),
      },
      acquired_at: m.issued_at,
      created_at: m.issued_at,
      expires_at: m.expires_at || null,
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
