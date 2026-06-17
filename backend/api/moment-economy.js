const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const momentEconomyService = require('../services/momentEconomyService');
const proofService = require('../services/proofService');

router.post('/moments', requireAuth, async (req, res) => {
  try {
    const result = await momentEconomyService.createMomentWithEconomy(req.user.id, req.body || {});
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('[Moment Economy] create moment error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/moments/:id', requireAuth, async (req, res) => {
  try {
    const moment = await momentEconomyService.updateMoment(req.user.id, req.params.id, req.body || {});
    res.json({ success: true, moment });
  } catch (error) {
    console.error('[Moment Economy] update moment error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/moments/:id', async (req, res) => {
  try {
    const result = await momentEconomyService.getMomentEconomy(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Moment Economy] get moment economy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/fund', requireAuth, async (req, res) => {
  try {
    const economics = await momentEconomyService.addFunding({
      momentId: req.params.id,
      userId: req.user.id,
      amountJmd: req.body?.amount_jmd,
      reference: req.body?.payment_reference || req.body?.reference || 'manual_funding',
      metadata: req.body?.metadata || {},
    });

    res.json({ success: true, economics });
  } catch (error) {
    console.error('[Moment Economy] funding error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/payment-intent', requireAuth, async (req, res) => {
  try {
    const intent = await momentEconomyService.createMomentPaymentIntent({
      momentId: req.params.id,
      userId: req.user.id,
      amountJmd: req.body?.amount_jmd,
      paymentType: req.body?.payment_type || 'funding',
    });

    res.json({ success: true, intent });
  } catch (error) {
    console.error('[Moment Economy] payment intent error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/payments/confirm', requireAuth, async (req, res) => {
  try {
    const economics = await momentEconomyService.confirmMomentPayment({
      momentId: req.params.id,
      userId: req.user.id,
      amountJmd: req.body?.amount_jmd,
      paymentReference: req.body?.payment_reference,
      metadata: req.body?.metadata || {},
    });

    res.json({ success: true, economics });
  } catch (error) {
    console.error('[Moment Economy] payment confirmation error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/admin/payouts', requireAuth, async (req, res) => {
  try {
    if (!proofService.isAdminReviewer(req.user)) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const payouts = await momentEconomyService.getManualPayoutQueue();
    res.json({ success: true, payouts });
  } catch (error) {
    console.error('[Moment Economy] payout queue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/admin/payouts/:id/paid', requireAuth, async (req, res) => {
  try {
    if (!proofService.isAdminReviewer(req.user)) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const payout = await momentEconomyService.markManualPayoutPaid({
      queueId: req.params.id,
      adminId: req.user.id,
      paymentReference: req.body?.payment_reference,
      notes: req.body?.notes,
    });

    res.json({ success: true, payout });
  } catch (error) {
    console.error('[Moment Economy] mark payout paid error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/admin/payouts/:id/attempt-automated', requireAuth, async (req, res) => {
  try {
    if (!proofService.isAdminReviewer(req.user)) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const result = await momentEconomyService.attemptAutomatedPayout({
      queueId: req.params.id,
      adminId: req.user.id,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Moment Economy] automated payout error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/admin/moments/:id/settlements', requireAuth, async (req, res) => {
  try {
    if (!proofService.isAdminReviewer(req.user)) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const result = await momentEconomyService.queueManualSettlement({
      momentId: req.params.id,
      userId: req.body?.user_id,
      proofSubmissionId: req.body?.proof_submission_id || null,
      amountJmd: req.body?.amount_jmd,
      reviewerId: req.user.id,
      reason: req.body?.reason || 'manual_judged_or_leaderboard_settlement',
    });

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('[Moment Economy] settlement queue error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/admin/moments/:id/settlements/ranked', requireAuth, async (req, res) => {
  try {
    if (!proofService.isAdminReviewer(req.user)) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const result = await momentEconomyService.settleRankedMoment({
      momentId: req.params.id,
      reviewerId: req.user.id,
      ruleType: req.body?.rule_type || 'leaderboard',
    });

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('[Moment Economy] ranked settlement error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
