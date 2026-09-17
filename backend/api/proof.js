const express = require('express');
const router = express.Router();
const proofService = require('../services/proofService');
const peopleExperience = require('../services/peopleExperienceService');
const promoCardReturnService = require('../services/promoCardReturnService');
const promoShareService = require('../services/promoShareService');
const { requireAuth } = require('../middleware/auth');

router.get('/submissions/pending', requireAuth, async (req, res) => {
  try {
    const submissions = await proofService.getPendingProofSubmissions(req.user);
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('[Proof API] pending submissions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/submissions/history', requireAuth, async (req, res) => {
  try {
    const submissions = await proofService.getProofSubmissionHistory(
      req.user,
      Number(req.query.limit || 50)
    );
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('[Proof API] submission history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/moments/:id/requirements', requireAuth, async (req, res) => {
  try {
    const requirements = await proofService.getProofRequirements(req.params.id);
    res.json({ success: true, requirements });
  } catch (error) {
    console.error('[Proof API] requirements error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/moments/:id/submissions', requireAuth, async (req, res) => {
  try {
    const submission = await proofService.submitProofSubmission({
      momentId: req.params.id,
      userId: req.user.id,
      proofBundle: {
        ...(req.body?.proof_bundle || {}),
        source_content_id: req.body?.source_content_id || req.body?.proof_bundle?.source_content_id || null,
        source_mission_id: req.body?.source_mission_id || req.body?.proof_bundle?.source_mission_id || null,
      },
      momentMoveId: req.body?.moment_move_id || null,
    });
    res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error('[Proof API] submission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/submissions/:id/review', requireAuth, async (req, res) => {
  try {
    const { action, review_reason } = req.body || {};

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be approve or reject' });
    }

    const submission = await proofService.getProofSubmissionById(req.params.id);
    const isAdmin = proofService.isAdminReviewer(req.user);
    const isHostOwner = submission?.moment?.host_id === req.user.id || submission?.moment?.organizer_id === req.user.id;

    if (!isAdmin && !isHostOwner) {
      return res.status(403).json({ success: false, error: 'Host or admin access required' });
    }

    const result = await proofService.reviewProofSubmission({
      submissionId: req.params.id,
      reviewerId: req.user.id,
      reviewer: req.user,
      action,
      reviewReason: review_reason,
    });

    let promoCardReturn = null;
    if (action === 'approve' && result?.submission) {
      const verified = result.submission;
      const proofBundle = verified.proof_bundle || {};

      // Approval is the first point at which the participation can become a
      // canonical verified action for People/Today/return-state surfaces.
      try {
        await peopleExperience.recordVerifiedAction({
          userId: verified.user_id,
          actionType: 'MOMENT_ATTENDANCE',
          momentId: verified.moment_id,
          contributorId: proofBundle.contributor_id || proofBundle.invited_by_user_id || null,
          referrerId: proofBundle.referrer_id || proofBundle.invited_by_user_id || null,
          campaignId: proofBundle.campaign_id || null,
          verificationMethod: 'proof_review',
          metadata: {
            ...proofBundle,
            moment_id: verified.moment_id,
            proof_submission_id: verified.id,
            reviewer_id: req.user.id,
          },
        });
      } catch (experienceError) {
        console.warn('[Proof API] verified experience recording skipped:', experienceError.message);
      }

      // PromoCard return eligibility is idempotent by user/action/reference.
      try {
        promoCardReturn = await promoCardReturnService.recordEligibleReturn({
          userId: verified.user_id,
          actionType: 'check_in',
          referenceEntityId: verified.moment_id,
        });
      } catch (promoCardError) {
        console.warn('[Proof API] PromoCard return recording skipped:', promoCardError.message);
      }

      // PromoShare entries are source-backed and upserted by proof submission id.
      try {
        await promoShareService.recordVerifiedAction(verified.user_id, 'proof_verified', {
          source_type: 'proof',
          source_id: verified.id,
          weight_value: 3,
          moment_id: verified.moment_id,
          reward_id: result.reward?.id || null,
          proof_submission_id: verified.id,
        });
      } catch (promoShareError) {
        console.warn('[Proof API] verified proof PromoShare recording skipped:', promoShareError.message);
      }
    }

    res.json({ success: true, ...result, promo_card_return: promoCardReturn });
  } catch (error) {
    console.error('[Proof API] review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/submissions/:id/audit', requireAuth, async (req, res) => {
  try {
    const submission = await proofService.getProofSubmissionById(req.params.id);
    const isAdmin = proofService.isAdminReviewer(req.user);
    const isHostOwner = submission?.moment?.host_id === req.user.id || submission?.moment?.organizer_id === req.user.id;

    if (!isAdmin && !isHostOwner) {
      return res.status(403).json({ success: false, error: 'Host or admin access required' });
    }

    const audit = await proofService.getProofSubmissionAudit(req.params.id);
    res.json({ success: true, audit });
  } catch (error) {
    console.error('[Proof API] audit error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;