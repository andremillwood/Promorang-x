const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const offerService = require('../services/offerService');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ success: false, error: error.message || String(error) });

router.get('/public', async (req, res) => {
  try { return ok(res, await offerService.listPublicOffers(req.query)); } catch (error) { return fail(res, error, 500); }
});

router.use(requireAuth);

router.get('/mine', async (req, res) => {
  try { return ok(res, await offerService.listOwnerOffers(req.user.id)); } catch (error) { return fail(res, error, 500); }
});

router.get('/wallet', async (req, res) => {
  try { return ok(res, await offerService.listUserIssuances(req.user.id)); } catch (error) { return fail(res, error, 500); }
});

router.get('/pending', async (req, res) => {
  try { return ok(res, await offerService.listOwnerPendingFulfillments(req.user.id)); } catch (error) { return fail(res, error, 500); }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.title || !req.body.reward_type) throw new Error('Title and reward type are required');
    return ok(res, await offerService.createOffer(req.user.id, req.body), 201);
  } catch (error) { return fail(res, error); }
});

router.patch('/:id', async (req, res) => {
  try { return ok(res, await offerService.updateOffer(req.user.id, req.params.id, req.body)); } catch (error) { return fail(res, error); }
});

router.post('/:id/claim', async (req, res) => {
  try { return ok(res, await offerService.directClaim(req.user.id, req.params.id), 201); } catch (error) { return fail(res, error); }
});

router.post('/issuances/:id/claim', async (req, res) => {
  try { return ok(res, await offerService.claimIssuance(req.user.id, req.params.id, req.body || {})); } catch (error) { return fail(res, error); }
});

router.post('/issuances/:id/address', async (req, res) => {
  try { return ok(res, await offerService.updateShippingAddress(req.user.id, req.params.id, req.body?.shipping_address || req.body)); } catch (error) { return fail(res, error); }
});

router.post('/issuances/:id/fulfill', async (req, res) => {
  try {
    if (!req.body?.action) throw new Error('A fulfillment action is required');
    return ok(res, await offerService.fulfillIssuance(req.user.id, req.params.id, req.body));
  } catch (error) { return fail(res, error); }
});

router.post('/redeem', async (req, res) => {
  try {
    if (!req.body.code) throw new Error('Redemption code is required');
    return ok(res, await offerService.redeemByCode(req.user.id, req.body.code, req.body.venue_id, req.body.notes));
  } catch (error) { return fail(res, error); }
});

router.get('/:id/analytics', async (req, res) => {
  try { return ok(res, await offerService.analytics(req.user.id, req.params.id)); } catch (error) { return fail(res, error); }
});

module.exports = router;
