const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const ADMIN_ROLES = new Set(['admin', 'master_admin', 'moderator']);

function isAdmin(user = {}) {
  return ADMIN_ROLES.has(user.role) || ADMIN_ROLES.has(user.user_type) || ADMIN_ROLES.has(user.token_payload?.role);
}

router.get('/merchant-payment-options/:productId', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    const { data: product, error } = await db.from('merchant_products')
      .select('merchant_id').eq('id', req.params.productId).eq('is_active', true).single();
    if (error || !product) return res.status(404).json({ error: 'Product not found' });
    const { data: methods, error: methodError } = await db.from('merchant_direct_payment_methods')
      .select('id,method_type,display_name,instructions,payment_link')
      .eq('merchant_id', product.merchant_id).eq('active', true).order('display_name');
    if (methodError) throw methodError;
    res.json({ success: true, methods: methods || [], disclaimer: 'Payment is collected directly by the merchant. Promorang does not receive or guarantee this payment.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/merchant-payment-orders', requireAuth, async (req, res) => {
  try {
    const marketplaceService = require('../services/marketplaceService');
    const result = await marketplaceService.createMerchantPaymentReservation({
      userId: req.user.id,
      productId: req.body?.product_id,
      quantity: req.body?.quantity || 1,
      paymentMethodId: req.body?.payment_method_id,
    });
    res.status(201).json({
      success: true, ...result,
      disclaimer: 'Payment is collected directly by the merchant. Promorang does not receive or guarantee this payment.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/merchant-payment-orders/:orderId/cancel', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    const { data: order } = await db.from('commerce_orders').select('id,buyer_id,payment_status')
      .eq('id', req.params.orderId).eq('buyer_id', req.user.id).single();
    if (!order) return res.status(404).json({ error: 'Reservation not found' });
    if (order.payment_status === 'paid') return res.status(409).json({ error: 'A paid order cannot be cancelled here' });
    const marketplaceService = require('../services/marketplaceService');
    const released = await marketplaceService.cancelStripeOrder(order.id, 'buyer_cancelled_merchant_payment');
    res.json({ success: true, order: released });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/gem-orders', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    const marketplaceService = require('../services/marketplaceService');
    const productId = req.body?.product_id;
    const quantity = Math.max(1, Number(req.body?.quantity || 1));
    if (!productId) return res.status(422).json({ error: 'product_id is required' });

    const { data: order, error: reserveError } = await db.rpc('reserve_commerce_order', {
      p_buyer_id: req.user.id,
      p_items: [{ product_id: productId, quantity }],
      p_currency: 'USD',
      p_hold_minutes: 30,
    });
    if (reserveError || !order) throw reserveError || new Error('Could not reserve inventory');

    try {
      const { data: payment, error: paymentError } = await db.rpc('pay_commerce_order_with_gems', {
        p_order_id: order.id,
        p_buyer_id: req.user.id,
        p_idempotency_key: `gem-commerce:${order.id}`,
      });
      if (paymentError) throw paymentError;
      const { data: item } = await db.from('commerce_order_items')
        .select('product_id').eq('order_id', order.id).limit(1).maybeSingle();
      const { data: receipt, error: receiptError } = await db.from('commerce_receipts').insert({
        user_id: req.user.id,
        merchant_id: order.merchant_id,
        listing_id: item?.product_id || productId,
        sale_id: order.id,
        receipt_type: 'purchase',
        status: 'issued',
        amount: order.total_amount,
        currency: 'GEMS',
        redemption_code: `GC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        attribution: {
          source: 'merchant_gem_card',
          payment_method: 'purchased_gems',
          gem_card_id: payment.card_id,
          gems_paid: payment.gems_paid,
          fulfillment_status: 'unfulfilled',
          fulfillment_responsibility: 'merchant',
          settlement_status: 'pending_fulfillment',
        },
      }).select('id').single();
      if (receiptError) throw receiptError;
      return res.status(201).json({
        success: true,
        order_id: order.id,
        receipt_id: receipt.id,
        gem_card_id: payment.card_id,
        card_number: payment.card_number,
        gems_paid: payment.gems_paid,
        notice: 'Sold and fulfilled by the merchant. Merchant payout remains blocked until fulfillment is confirmed.',
      });
    } catch (error) {
      await marketplaceService.cancelStripeOrder(order.id, 'gem_payment_failed').catch(() => undefined);
      throw error;
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/commerce/moments/:momentId/context
 * One cross-platform payload for the participant's live, in-Moment experience.
 */
router.get('/moments/:momentId/context', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    if (!db) return res.status(503).json({ success: false, error: 'Commerce service unavailable' });

    const { momentId } = req.params;
    const userId = req.user.id;
    const [participationResult, commerceResult, movesResult, pieceResult, positionResult, cyclesResult, ticketsResult] = await Promise.all([
      db.from('moment_participants').select('status,joined_at,checked_in_at').eq('moment_id', momentId).eq('user_id', userId).maybeSingle().catch(() => ({ data: null })),
      db.from('view_public_commerce_directory').select('*').eq('linked_moment_id', momentId).eq('is_active', true).order('created_at', { ascending: false }).limit(24).catch(() => ({ data: [] })),
      db.from('moment_moves').select('id,title,description,proof_type,reward_amount_jmd,sort_order').eq('moment_id', momentId).order('sort_order', { ascending: true }).catch(() => ({ data: [] })),
      db.from('moment_piece_stats').select('current_price,change_24h,volume_24h').eq('moment_id', momentId).maybeSingle().catch(() => ({ data: null })),
      db.from('moment_piece_positions').select('pieces_owned').eq('moment_id', momentId).eq('holder_id', userId).maybeSingle().catch(() => ({ data: null })),
      db.from('promoshare_cycles').select('id,end_at').eq('status', 'active').order('end_at', { ascending: true }).limit(4).catch(() => ({ data: [] })),
      db.from('promoshare_tickets').select('id,cycle_id').eq('user_id', userId).eq('source_id', momentId).catch(() => ({ data: [] })),
    ]);

    const participation = participationResult.data;
    const participationState = participation?.status === 'completed'
        ? 'completed'
        : participation?.checked_in_at
          ? 'checked_in'
        : participation
          ? 'joined'
          : 'not_joined';

    const commerce = (commerceResult.data || []).map((item) => ({
      listing_id: item.listing_id,
      source_id: item.source_id,
      kind: item.discount_value ? 'offer' : item.listing_kind === 'service' ? 'service' : 'product',
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      price: item.price == null ? null : Number(item.price),
      currency: item.currency,
      discount_label: item.discount_value ? `${item.discount_value}${item.discount_type === 'percentage' ? '%' : ''} off` : null,
      merchant_name: item.merchant_name,
      venue_name: item.venue_name,
      inventory_quantity: item.inventory_quantity,
      fulfillment_mode: item.fulfillment_mode,
      available_now: item.is_unlimited || Number(item.inventory_quantity || 0) > 0,
    }));

    const cycles = cyclesResult.data || [];
    return res.json({
      success: true,
      data: {
        moment_id: momentId,
        participation: { state: participationState, joined_at: participation?.joined_at || null, checked_in_at: participation?.checked_in_at || null },
        commerce,
        moves: (movesResult.data || []).map((move) => ({ ...move, reward_label: Number(move.reward_amount_jmd || 0) > 0 ? `J$${Number(move.reward_amount_jmd).toLocaleString()}` : null })),
        piece: pieceResult.data ? { ...pieceResult.data, user_quantity: Number(positionResult.data?.pieces_owned || 0) } : null,
        promoshare: { ticket_count: (ticketsResult.data || []).length, active_draw_count: cycles.length, next_draw_at: cycles[0]?.end_at || null },
      },
    });
  } catch (error) {
    console.error('Moment live context error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to load Moment context' });
  }
});

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
