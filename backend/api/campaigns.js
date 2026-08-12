const express = require('express');
const router = express.Router();
const campaignService = require('../services/campaignService');
const { requireAuth } = require('../middleware/auth');

/**
 * 1. REFERRAL SPRINT ENDPOINTS
 */
router.get('/referral-sprint/status', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await campaignService.getReferralSprintStatus(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch referral sprint status' });
  }
});

/**
 * 2. OPERATOR SEASONS ENDPOINTS
 */
router.get('/operator-seasons', async (req, res) => {
  try {
    const result = await campaignService.getOperatorSeasons();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch operator seasons' });
  }
});

/**
 * 3. MERCHANT PERFORMANCE COUPON ENDPOINTS
 */
router.get('/performance-coupons/analytics', async (req, res) => {
  try {
    const storeId = req.query.store_id || null;
    const result = await campaignService.getMerchantCouponAnalytics(storeId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch coupon analytics' });
  }
});

/**
 * 4. DOPAMINE FLASH VAULT ENDPOINTS
 */
router.get('/flash-sales/vault', async (req, res) => {
  try {
    const result = await campaignService.getFlashVaultItems();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch flash vault items' });
  }
});

router.post('/flash-sales/purchase', requireAuth, async (req, res) => {
  try {
    const { item_id } = req.body;
    if (!item_id) {
      return res.status(400).json({ error: 'item_id is required' });
    }
    const result = await campaignService.purchaseFlashItem(req.user.id, item_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to execute flash purchase' });
  }
});

module.exports = router;
