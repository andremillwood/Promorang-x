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
    const { opportunityId, couponId, recipientUserId, metadata } = req.body || {};
    const targetId = opportunityId || couponId;
    const userId = recipientUserId || req.user?.id;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'opportunityId or couponId is required',
        code: 'MISSING_TARGET_ID'
      });
    }

    if (!supabase) {
      // Demo mock response
      return res.json({
        success: true,
        data: {
          receiptId: `rcpt_${Date.now()}`,
          claimCode: `PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          opportunityId: targetId,
          userId: userId || 'agent-invoked',
          status: 'claimed',
          claimedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          rewardGems: 75,
          qrPayload: `promorang://redeem/rcpt_${Date.now()}`
        },
        message: 'Coupon claimed successfully via Headless API'
      });
    }

    // Call Supabase RPC or table insert for claim
    const { data: claimRecord, error } = await supabase
      .from('participations')
      .insert({
        user_id: userId,
        drop_id: targetId,
        status: 'claimed',
        metadata: metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data: claimRecord,
      message: 'Promotion claimed successfully'
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
      return res.json({
        success: true,
        data: {
          id,
          title: 'Special Nitro Cold Brew',
          discount: '20% OFF',
          merchant: 'Devon House Cafe',
          status: 'active'
        }
      });
    }

    const { data: coupon, error } = await supabase
      .from('drops')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found', code: 'COUPON_NOT_FOUND' });
    }

    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'FETCH_COUPON_FAILED' });
  }
});

module.exports = router;
