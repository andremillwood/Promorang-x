const express = require('express');
const router = express.Router();
const { requireAuth, getUserRoles } = require('../middleware/auth');
const momentEconomyService = require('../services/momentEconomyService');
const proofService = require('../services/proofService');

async function hydrateAdminRole(user) {
  if (proofService.isAdminReviewer(user)) return user;

  const roles = await getUserRoles(user.id);
  const adminRole = roles.find((role) => ['admin', 'master_admin', 'moderator', 'administrator'].includes(role));

  if (!adminRole) return user;

  return {
    ...user,
    roles: Array.from(new Set([...(user.roles || []), ...roles])),
    role: adminRole === 'administrator' ? 'admin' : adminRole,
  };
}

router.post('/moments', requireAuth, async (req, res) => {
  try {
    const result = await momentEconomyService.createMomentWithEconomy(req.user.id, req.body || {});
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('[Moment Economy] create moment error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/moments/:id/submoments', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    const { data: parent, error: parentError } = await db.from('moments').select('host_id,organizer_id').eq('id', req.params.id).single();
    if (parentError) throw parentError;
    const isOwner = parent.host_id === req.user.id || parent.organizer_id === req.user.id;
    let query = db.from('moments').select('id,title,description,starts_at,ends_at,location,venue_name,creative_owner_id,submoment_status,submoment_submitted_by,submoment_submitted_at,submoment_review_note,venue_approval_required,venue_approval_status,is_active').eq('parent_moment_id', req.params.id).order('submoment_submitted_at', { ascending: false });
    if (!isOwner) query = query.or(`submoment_submitted_by.eq.${req.user.id},submoment_status.eq.approved`);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [], permissions: { can_review: isOwner } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:parentId/submoments/:id/review', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    const { decision, note = null } = req.body || {};
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ success: false, error: 'Decision must be approve or reject' });
    const { data: parent, error: parentError } = await db.from('moments').select('host_id,organizer_id').eq('id', req.params.parentId).single();
    if (parentError) throw parentError;
    if (parent.host_id !== req.user.id && parent.organizer_id !== req.user.id) return res.status(403).json({ success: false, error: 'Only the parent Moment host can review this proposal' });
    const { data: child, error: childError } = await db.from('moments').select('venue_approval_required').eq('id', req.params.id).eq('parent_moment_id', req.params.parentId).single();
    if (childError) throw childError;
    const approvedStatus = child.venue_approval_required ? 'venue_review' : 'approved';
    const { data, error } = await db.from('moments').update({ submoment_status: decision === 'approve' ? approvedStatus : 'rejected', submoment_reviewed_by: req.user.id, submoment_reviewed_at: new Date().toISOString(), submoment_review_note: note, is_active: decision === 'approve' && !child.venue_approval_required }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:parentId/submoments/:id/venue-review', requireAuth, async (req, res) => {
  try {
    const db = req.supabase || global.supabase;
    const { decision, note = null } = req.body || {};
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ success: false, error: 'Decision must be approve or reject' });
    const { data: parent, error: parentError } = await db.from('moments').select('venue_id,host_id,organizer_id').eq('id', req.params.parentId).single();
    if (parentError) throw parentError;
    let canReview = parent.host_id === req.user.id || parent.organizer_id === req.user.id;
    if (parent.venue_id && !canReview) {
      const { data: venue } = await db.from('venues').select('owner_id').eq('id', parent.venue_id).maybeSingle();
      canReview = venue?.owner_id === req.user.id;
    }
    if (!canReview) return res.status(403).json({ success: false, error: 'Venue permission is required' });
    const approved = decision === 'approve';
    const { data, error } = await db.from('moments').update({ venue_approval_status: approved ? 'approved' : 'rejected', venue_approved_by: req.user.id, venue_approved_at: new Date().toISOString(), submoment_status: approved ? 'approved' : 'rejected', submoment_review_note: note, is_active: approved }).eq('id', req.params.id).eq('parent_moment_id', req.params.parentId).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/moments/:id', requireAuth, async (req, res) => {
  try {
    const user = await hydrateAdminRole(req.user);
    const moment = await momentEconomyService.updateMoment(user, req.params.id, req.body || {});
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
