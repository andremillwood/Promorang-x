const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const cappedDrops = require('../services/cappedDropService');

function fail(res, error) {
  const status = error.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: error.message || 'Could not complete that',
    code: error.code || null,
  });
}

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    if (req.params.slug === 'new') {
      return res.status(404).json({ success: false, error: 'This drop is not open' });
    }
    const drop = await cappedDrops.getPublicDrop(req.params.slug, req.user?.id || null);
    if (!drop) return res.status(404).json({ success: false, error: 'This drop is not open', code: 'DROP_NOT_FOUND' });
    return res.json({ success: true, data: drop });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const drop = await cappedDrops.createDrop(req.user.id, req.body || {});
    return res.status(201).json({ success: true, data: drop });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/next-notice', requireAuth, async (req, res) => {
  try {
    const notice = await cappedDrops.registerNextNotice(req.user.id);
    return res.status(201).json({ success: true, data: notice });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/:slug/claim', requireAuth, async (req, res) => {
  try {
    const claim = await cappedDrops.claimDrop(req.user.id, req.params.slug);
    return res.status(claim.already_claimed ? 200 : 201).json({ success: true, data: claim });
  } catch (error) {
    return fail(res, error);
  }
});

module.exports = router;
