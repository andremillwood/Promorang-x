const express = require('express');
const router = express.Router();
const proofService = require('../services/proofService');
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

    res.json({ success: true, ...result });
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
