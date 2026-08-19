const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');
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

router.get('/campaigns/:campaignId/context', optionalAuth, async (req, res) => {
  try {
    const campaign = await contentDistributionService.getCampaignDetail(req.params.campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: 'Content drop not found' });
    const primary = campaign.content_distribution_assets?.[0] || null;
    const contentId = primary?.content_item_id || null;
    const userId = req.user?.id || null;
    const [momentResult, ownerResult, sponsorResult, productsResult, statsResult, positionResult] = await Promise.all([
      campaign.linked_moment_id ? supabase.from('moments').select('id,title,location,image_url,starts_at,host_id').eq('id', campaign.linked_moment_id).maybeSingle() : Promise.resolve({ data: null }),
      campaign.owner_id ? supabase.from('profiles').select('id,display_name,username,avatar_url').eq('id', campaign.owner_id).maybeSingle() : Promise.resolve({ data: null }),
      campaign.sponsor_id ? supabase.from('brand_profiles').select('id,company_name,logo_url').eq('id', campaign.sponsor_id).maybeSingle() : Promise.resolve({ data: null }),
      campaign.linked_moment_id ? supabase.from('merchant_products').select('id,name,image_url,price,currency').eq('linked_moment_id', campaign.linked_moment_id).eq('is_active', true).limit(8) : Promise.resolve({ data: [] }),
      contentId ? supabase.from('content_piece_stats').select('current_price,change_24h,volume_24h').eq('content_id', contentId).maybeSingle() : Promise.resolve({ data: null }),
      contentId && userId ? supabase.from('content_piece_positions').select('pieces_owned').eq('content_id', contentId).eq('holder_id', userId).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    const stakeholders = [];
    if (ownerResult.data) stakeholders.push({ id: ownerResult.data.id, role: 'creator', name: ownerResult.data.display_name || ownerResult.data.username || 'Creator', image_url: ownerResult.data.avatar_url });
    if (sponsorResult.data) stakeholders.push({ id: sponsorResult.data.id, role: 'brand', name: sponsorResult.data.company_name || 'Brand partner', image_url: sponsorResult.data.logo_url });
    res.json({ success: true, data: {
      campaign_id: campaign.id,
      content_id: contentId,
      original_url: primary?.target_url || null,
      moment: momentResult.data || null,
      stakeholders,
      commerce: productsResult.data || [],
      piece: statsResult.data ? { ...statsResult.data, user_quantity: Number(positionResult.data?.pieces_owned || 0) } : null,
      promoshare: { enabled: campaign.promoshare_config?.enabled !== false, entries_per_action: Number(campaign.promoshare_config?.entries_per_action || 1) },
    } });
  } catch (error) {
    console.error('[Content Distribution] context failed:', error);
    res.status(500).json({ success: false, error: 'Failed to load content context' });
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
