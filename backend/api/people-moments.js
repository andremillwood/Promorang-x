const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const peopleMomentsService = require('../services/peopleMomentsService');

function handleError(res, error, fallback) {
  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: error.message || fallback,
  });
}

router.get('/happening-now', optionalAuth, async (req, res) => {
  try {
    const moments = await peopleMomentsService.listHappeningNow({
      limit: Number(req.query.limit || 12),
    });
    res.json({ success: true, moments });
  } catch (error) {
    handleError(res, error, 'Unable to load happening now');
  }
});

router.get('/plans/me', requireAuth, async (req, res) => {
  try {
    const plans = await peopleMomentsService.listMyPlans(req.user.id);
    res.json({ success: true, plans });
  } catch (error) {
    handleError(res, error, 'Unable to load plans');
  }
});

router.post('/moments', requireAuth, async (req, res) => {
  try {
    const moment = await peopleMomentsService.createMoment(req.user.id, req.body || {});
    res.status(201).json({ success: true, moment });
  } catch (error) {
    handleError(res, error, 'Unable to create moment');
  }
});

router.post('/moments/:id/join', requireAuth, async (req, res) => {
  try {
    const result = await peopleMomentsService.joinMoment(req.user.id, req.params.id, req.body || {});
    res.json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, 'Unable to join moment');
  }
});

router.get('/moments/:id/participants', optionalAuth, async (req, res) => {
  try {
    const participants = await peopleMomentsService.listParticipants(req.params.id);
    res.json({ success: true, participants });
  } catch (error) {
    handleError(res, error, 'Unable to load participants');
  }
});

router.get('/moments/:id/demand', optionalAuth, async (req, res) => {
  try {
    const snapshot = await peopleMomentsService.getDemandSnapshot(req.params.id);
    res.json({ success: true, snapshot });
  } catch (error) {
    handleError(res, error, 'Unable to load demand snapshot');
  }
});

router.post('/moments/:id/content', requireAuth, async (req, res) => {
  try {
    const media = await peopleMomentsService.submitContent(req.user.id, req.params.id, req.body || {});
    res.status(201).json({ success: true, media });
  } catch (error) {
    handleError(res, error, 'Unable to submit content');
  }
});

router.post('/moments/:id/claim', requireAuth, async (req, res) => {
  try {
    const claim = await peopleMomentsService.requestClaim(req.user.id, req.params.id, req.body || {});
    res.status(201).json({ success: true, claim });
  } catch (error) {
    handleError(res, error, 'Unable to request claim');
  }
});

router.post('/claims/:id/verify', requireAuth, async (req, res) => {
  try {
    const claim = await peopleMomentsService.verifyClaim(req.user.id, req.params.id);
    res.json({ success: true, claim });
  } catch (error) {
    handleError(res, error, 'Unable to verify claim');
  }
});

router.post('/moments/:id/perks', requireAuth, async (req, res) => {
  try {
    const perk = await peopleMomentsService.attachPerk(req.user.id, req.params.id, req.body || {});
    res.status(201).json({ success: true, perk });
  } catch (error) {
    handleError(res, error, 'Unable to attach perk');
  }
});

router.post('/perks/:id/claim', requireAuth, async (req, res) => {
  try {
    const result = await peopleMomentsService.claimPerk(req.user.id, req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, 'Unable to claim perk');
  }
});

router.post('/invites', requireAuth, async (req, res) => {
  try {
    const invite = await peopleMomentsService.invite({
      userId: req.user.id,
      targetType: req.body.target_type,
      momentId: req.body.moment_id,
      planId: req.body.plan_id,
      missionId: req.body.mission_id,
      invitedUserId: req.body.invited_user_id,
      inviteeContact: req.body.invitee_contact,
      referralCode: req.body.referral_code,
      source: req.body.source,
      campaign: req.body.campaign,
    });
    res.status(201).json({ success: true, invite });
  } catch (error) {
    handleError(res, error, 'Unable to send invite');
  }
});

router.post('/invites/:token/open', optionalAuth, async (req, res) => {
  try {
    const invite = await peopleMomentsService.markInviteOpened(req.params.token);
    res.json({ success: true, invite });
  } catch (error) {
    handleError(res, error, 'Unable to record invite open');
  }
});

router.post('/plans', requireAuth, async (req, res) => {
  try {
    const plan = await peopleMomentsService.createPlan(req.user.id, req.body || {});
    res.status(201).json({ success: true, plan });
  } catch (error) {
    handleError(res, error, 'Unable to create plan');
  }
});

router.get('/plans/:id', optionalAuth, async (req, res) => {
  try {
    const plan = await peopleMomentsService.getPlan(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (error) {
    handleError(res, error, 'Unable to load plan');
  }
});

router.post('/plans/:id/options', requireAuth, async (req, res) => {
  try {
    const option = await peopleMomentsService.addPlanOption(req.user.id, req.params.id, req.body || {});
    res.status(201).json({ success: true, option });
  } catch (error) {
    handleError(res, error, 'Unable to add option');
  }
});

router.post('/plans/:id/votes', requireAuth, async (req, res) => {
  try {
    const vote = await peopleMomentsService.votePlanOption(req.user.id, req.params.id, req.body.option_id);
    res.json({ success: true, vote });
  } catch (error) {
    handleError(res, error, 'Unable to vote');
  }
});

router.post('/plans/:id/convert', requireAuth, async (req, res) => {
  try {
    const result = await peopleMomentsService.convertPlanToMoment(req.user.id, req.params.id, req.body || {});
    res.json({ success: true, ...result });
  } catch (error) {
    handleError(res, error, 'Unable to convert plan');
  }
});

module.exports = router;
