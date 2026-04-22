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
      proofBundle: req.body?.proof_bundle || {},
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
    const isHostOwner = submission?.moment?.host_id === req.user.id;

    if (!isAdmin && !isHostOwner) {
      return res.status(403).json({ success: false, error: 'Host or admin access required' });
    }

    const result = await proofService.reviewProofSubmission({
      submissionId: req.params.id,
      reviewerId: req.user.id,
      action,
      reviewReason: review_reason,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Proof API] review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
