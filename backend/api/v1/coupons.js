const express = require('express');
const router = express.Router();
const { requireApiKeyOrAuth } = require('../../middleware/apiKeyAuth');
const { supabase } = require('../../lib/supabase');

/**
 * POST /api/v1/coupons/claim
 * Headless claim of a coupon or promotion opportunity for an agent or client.
 */
router.post('/claim', requireApiKeyOrAuth(['coupons:claim']), async (req, res) => {
  try {
    const { opportunityId, couponId, recipientUserId } = req.body || {};
    const targetId = opportunityId || couponId;
    const userId = recipientUserId || req.user?.id;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'opportunityId or couponId is required',
        code: 'MISSING_TARGET_ID'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'A recipient user is required',
        code: 'MISSING_RECIPIENT_USER'
      });
    }

    return res.status(503).json({
      success: false,
      error: 'Headless coupon claims are unavailable until eligibility, inventory, credential issuance and value delivery share an atomic contract',
      code: 'HEADLESS_COUPON_ATOMICITY_PENDING'
    });
  } catch (err) {
    console.error('[API v1 /coupons/claim] Error:', err);
    return res.status(500).json({ success: false, error: err.message, code: 'COUPON_CLAIM_FAILED' });
  }
});

/**
 * GET /api/v1/coupons/:id
 * Retrieve coupon details
 */
router.get('/:id', requireApiKeyOrAuth(['feed:read']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Coupon source unavailable',
        code: 'COUPON_SOURCE_UNAVAILABLE'
      });
    }

    const { data: coupon, error } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found', code: 'COUPON_NOT_FOUND' });
    }

    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'FETCH_COUPON_FAILED' });
  }
});

module.exports = router;
