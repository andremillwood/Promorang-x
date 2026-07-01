const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const contentDistributionService = require('../services/contentDistributionService');

router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await contentDistributionService.listCampaigns({
      status: req.query.status || 'active',
      limit: req.query.limit
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('[Content Distribution] list campaigns failed:', error);
    res.status(500).json({ success: false, error: 'Failed to list content distribution campaigns' });
  }
});

router.get('/campaigns/:campaignId', async (req, res) => {
  try {
    const campaign = await contentDistributionService.getCampaignDetail(req.params.campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: 'Content drop not found' });

    res.json({ success: true, data: campaign });
  } catch (error) {
    console.error('[Content Distribution] get campaign failed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content distribution campaign' });
  }
});

router.get('/campaigns/:campaignId/leaderboard', async (req, res) => {
  try {
    const leaderboard = await contentDistributionService.getLeaderboard(req.params.campaignId, req.query.limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('[Content Distribution] leaderboard failed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content distribution leaderboard' });
  }
});

router.use(requireAuth);

router.get('/me/campaigns', async (req, res) => {
  try {
    const campaigns = await contentDistributionService.listCampaigns({
      ownerId: req.user.id,
      status: req.query.status || 'all',
      limit: req.query.limit
    });

    res.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('[Content Distribution] list my campaigns failed:', error);
    res.status(500).json({ success: false, error: 'Failed to list your content distribution campaigns' });
  }
});

router.post('/campaigns', async (req, res) => {
  try {
    if (!req.body?.title) {
      return res.status(400).json({ success: false, error: 'title is required' });
    }

    const campaign = await contentDistributionService.createCampaign(req.user.id, req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    console.error('[Content Distribution] create campaign failed:', error);
    res.status(500).json({ success: false, error: 'Failed to create content distribution campaign' });
  }
});

router.post('/campaigns/:campaignId/assets', async (req, res) => {
  try {
    if (!req.body?.title) {
      return res.status(400).json({ success: false, error: 'title is required' });
    }

    const asset = await contentDistributionService.addAsset(req.params.campaignId, req.body, req.user.id);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    console.error('[Content Distribution] add asset failed:', error);
    res.status(500).json({ success: false, error: 'Failed to add content distribution asset' });
  }
});

router.post('/campaigns/:campaignId/actions', async (req, res) => {
  try {
    const action = await contentDistributionService.recordAction(req.user.id, {
      ...req.body,
      campaign_id: req.params.campaignId
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    console.error('[Content Distribution] record action failed:', error);
    const status = error.message === 'Content distribution campaign not found'
      ? 404
      : error.message === 'Not authorized to manage this campaign'
        ? 403
        : 500;
    res.status(status).json({ success: false, error: error.message || 'Failed to record content distribution action' });
  }
});

module.exports = router;
