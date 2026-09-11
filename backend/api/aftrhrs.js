const express = require('express');
const router = express.Router();
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');
const service = require('../services/aftrHrsService');
const { localeFromRequest } = require('../services/emailI18n');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, error) => {
  const status = error.status || 400;
  return res.status(status).json({
    success: false,
    error: error.message || 'Request failed',
    code: error.code || 'error',
  });
};

router.get('/public', optionalAuth, async (req, res) => {
  try {
    return ok(res, await service.publicSnapshot(req.user?.id || null));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/track', optionalAuth, async (req, res) => {
  try {
    await service.track(req.body?.name || 'landing_view', {
      userId: req.user?.id,
      sessionId: req.body?.sessionId,
      source: req.body?.source,
      campaign: req.body?.campaign,
      referrer: req.body?.referrer,
      properties: req.body?.properties || {},
    });
    return ok(res, { recorded: true });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/guest-rsvp', async (req, res) => {
  try {
    return ok(res, await service.guestRsvp({ ...(req.body || {}), locale: localeFromRequest(req) }), 201);
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/ticket/:code', async (req, res) => {
  try {
    return ok(res, await service.publicTicket(req.params.code));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/claim', requireAuth, async (req, res) => {
  try {
    return ok(res, await service.claimDigitalPass(req.user, { ...(req.body || {}), locale: localeFromRequest(req) }), 201);
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/join', requireAuth, async (req, res) => {
  try {
    return ok(res, await service.joinMoment(req.user, { ...(req.body || {}), locale: localeFromRequest(req) }));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/ambassador-request', optionalAuth, async (req, res) => {
  try {
    return ok(res, await service.requestAmbassador(req.user, req.body || {}), 201);
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/waitlist', optionalAuth, async (req, res) => {
  try {
    return ok(res, await service.requestAmbassador(req.user, { ...(req.body || {}), waitlist: true }), 201);
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/venue/follow', requireAuth, async (req, res) => {
  try {
    return ok(res, await service.followVenue(req.user, req.body?.follow !== false));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/redeem', requireAuth, async (req, res) => {
  try {
    return ok(res, await service.redeemPass(req.user, req.body || {}));
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/me/pass', requireAuth, async (req, res) => {
  try {
    const snapshot = await service.publicSnapshot(req.user.id);
    return ok(res, { pass: snapshot.pass, participation: snapshot.participation });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/ambassador', requireAuth, async (req, res) => {
  try {
    return ok(res, await service.ambassadorDashboard(req.user));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/ambassador/fulfill', requireAuth, async (req, res) => {
  try {
    return ok(res, await service.fulfillInvitation(req.user, req.body || {}), 201);
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    return ok(res, await service.adminOverview(req.user));
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    return ok(res, await service.adminUpdate(req.user, req.body || {}));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/admin/digital-release', requireAuth, requireAdmin, async (req, res) => {
  try {
    return ok(res, await service.adminDigitalRelease(req.user, req.body || {}));
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/admin/passes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    return ok(res, await service.adminUpdatePass(req.user, req.params.id, req.body || {}));
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/admin/ambassadors', requireAuth, requireAdmin, async (req, res) => {
  try {
    return ok(res, await service.adminSaveAmbassador(req.user, req.body || {}));
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/admin/guest-list.csv', requireAuth, requireAdmin, async (req, res) => {
  try {
    const csv = await service.guestListCsv(req.user);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="aftrhrs-guest-list.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return fail(res, error);
  }
});

module.exports = router;
