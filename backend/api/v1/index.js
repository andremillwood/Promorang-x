const express = require('express');
const router = express.Router();

const feedRouter = require('./feed');
const couponsRouter = require('./coupons');
const campaignsRouter = require('./campaigns');
const merchantsRouter = require('./merchants');
const keysRouter = require('./keys');

// Health check for v1 API
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v1',
    description: 'Promorang Developer & Agent API',
    endpoints: {
      feed: '/api/v1/feed',
      coupons: '/api/v1/coupons',
      campaigns: '/api/v1/campaigns',
      merchants: '/api/v1/merchants',
      keys: '/api/v1/keys'
    }
  });
});

router.use('/feed', feedRouter);
router.use('/coupons', couponsRouter);
router.use('/campaigns', campaignsRouter);
router.use('/merchants', merchantsRouter);
router.use('/keys', keysRouter);

module.exports = router;
