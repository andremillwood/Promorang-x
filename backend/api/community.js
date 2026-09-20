const express = require('express');
const { requireAuth } = require('../middleware/auth');
const service = require('../services/communityService');
function createCommunityRouter({ auth = requireAuth, community = service } = {}) {
  const router = express.Router();
  router.use(auth);
  router.use((req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });
  const handle = fn => async (req, res) => {
    try { res.json({ success: true, data: await fn(req) }); }
    catch (error) { res.status(error.status || 500).json({ success: false, error: error.message || 'Community unavailable' }); }
  };
  router.get('/access', handle(req => community.access(req.user)));
  router.get('/workspace', handle(req => community.workspace(req.user)));
  router.post('/actions/:action', handle(req => community.command(req.user, req.params.action, req.body || {})));
  return router;
}
module.exports = createCommunityRouter();
module.exports.createCommunityRouter = createCommunityRouter;
