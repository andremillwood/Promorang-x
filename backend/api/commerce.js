const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const ADMIN_ROLES = new Set(['admin', 'master_admin', 'moderator']);

function isAdmin(user = {}) {
  return ADMIN_ROLES.has(user.role) || ADMIN_ROLES.has(user.user_type) || ADMIN_ROLES.has(user.token_payload?.role);
}

/**
 * GET /api/commerce/receipts/by-payment-intent/:paymentIntentId
 * Resolve a newly completed native checkout to the customer's durable receipt.
 */
router.get('/receipts/by-payment-intent/:paymentIntentId', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    if (!db) return res.status(503).json({ success: false, error: 'Commerce service unavailable' });

    const { paymentIntentId } = req.params;
    const { data: receipt, error } = await db
      .from('commerce_receipts')
      .select('id, status, receipt_type, occurred_at')
      .eq('user_id', req.user.id)
      .contains('attribution', { stripe_payment_intent_id: paymentIntentId })
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!receipt) return res.status(404).json({ success: false, error: 'Receipt is still processing' });

    return res.json({ success: true, receipt });
  } catch (error) {
    console.error('Commerce payment receipt lookup error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to find receipt' });
  }
});

/**
 * GET /api/commerce/receipts/:id
 * Role-aware commerce receipt detail.
 *
 * Customers can view their own receipts, merchants can view receipts attached to
 * their merchant account, and admins can view any receipt. The UI uses this as
 * the shared receipt-detail source for Vault, merchant ops, and admin support.
 */
router.get('/receipts/:id', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    if (!db) return res.status(503).json({ success: false, error: 'Commerce service unavailable' });

    const { id } = req.params;
    const { data: receipt, error } = await db
      .from('commerce_receipts')
      .select(`
        *,
        merchant_products:listing_id(
          id,
          name,
          description,
          image_url,
          category,
          fulfillment_mode,
          merchant_id,
          price,
          currency,
          visibility
        )
      `)
      .eq('id', id)
      .single();

    if (error || !receipt) return res.status(404).json({ success: false, error: 'Receipt not found' });

    const canView =
      isAdmin(req.user) ||
      receipt.user_id === req.user.id ||
      receipt.merchant_id === req.user.id ||
      receipt.merchant_products?.merchant_id === req.user.id;

    if (!canView) return res.status(403).json({ success: false, error: 'You cannot view this receipt' });

    const timeline = [
      {
        label: 'Receipt issued',
        at: receipt.occurred_at,
        tone: 'complete',
        detail: `${receipt.receipt_type || 'commerce'} receipt created`,
      },
    ];

    if (receipt.attribution?.stripe_payment_intent_id) {
      timeline.push({
        label: 'Stripe payment attached',
        at: receipt.attribution?.paid_at || receipt.attribution?.payment_confirmed_at || receipt.occurred_at,
        tone: receipt.status === 'pending' ? 'pending' : 'complete',
        detail: receipt.attribution.stripe_payment_intent_id,
      });
    }

    if (receipt.status === 'fulfilled') {
      timeline.push({
        label: 'Fulfilled',
        at: receipt.attribution?.merchant_status_at || receipt.attribution?.validated_at || receipt.occurred_at,
        tone: 'complete',
        detail: 'Merchant confirmed the receipt was completed',
      });
    }

    if (receipt.status === 'cancelled') {
      timeline.push({
        label: 'Cancelled',
        at: receipt.attribution?.admin_status_at || receipt.attribution?.merchant_status_at || receipt.occurred_at,
        tone: 'stopped',
        detail: receipt.attribution?.admin_status_reason || receipt.attribution?.merchant_status_note || 'Receipt was cancelled',
      });
    }

    if (receipt.status === 'refunded') {
      timeline.push({
        label: 'Refunded',
        at: receipt.attribution?.refund_at || receipt.attribution?.admin_status_at || receipt.occurred_at,
        tone: 'stopped',
        detail: receipt.attribution?.stripe_refund_id || receipt.attribution?.refund_reason || 'Refund recorded',
      });
    }

    res.json({
      success: true,
      receipt,
      timeline,
      permissions: {
        is_customer: receipt.user_id === req.user.id,
        is_merchant: receipt.merchant_id === req.user.id || receipt.merchant_products?.merchant_id === req.user.id,
        is_admin: isAdmin(req.user),
      },
    });
  } catch (error) {
    console.error('Commerce receipt detail error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to load receipt' });
  }
});

module.exports = router;
