const express = require('express');
const router = express.Router();
const { requireAuth, resolveAdvertiserContext } = require('../middleware/auth');
const { calculateCampaignCost, getMoveCostBreakdown } = require('../config/moveCosts');

// Calculate move cost for a campaign
router.post('/calculate-move-cost', (req, res) => {
  try {
    const {
      campaignType = 'standard',
      duration = 7,
      audienceSize = 1000,
      locations = [],
      interests = [],
      isPremium = false
    } = req.body;

    const costBreakdown = getMoveCostBreakdown(campaignType, {
      duration: parseInt(duration),
      audienceSize: parseInt(audienceSize),
      locations,
      interests,
      isPremium
    });

    res.json(costBreakdown);
  } catch (error) {
    console.error('Error calculating move cost:', error);
    res.status(500).json({ error: 'Failed to calculate move cost' });
  }
});

// Apply auth for creation
router.use(requireAuth);
router.use(resolveAdvertiserContext);

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const {
      campaignType = 'standard',
      ...campaignData
    } = req.body;

    const advertiserId = req.advertiserAccount ? req.advertiserAccount.id : null;

    if (!advertiserId) {
      return res.status(403).json({ error: 'Advertiser account required' });
    }

    const advertiserTeamService = require('../services/advertiserTeamService');
    const hasPermission = await advertiserTeamService.checkPermission(
      req.user.id,
      advertiserId,
      'edit_campaigns'
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to create campaigns for this account' });
    }

    const finalAdvertiserId = advertiserId;

    // Calculate move cost
    const moveCost = calculateCampaignCost(campaignType, {
      duration: campaignData.duration,
      audienceSize: campaignData.audienceSize,
      locations: campaignData.locations || [],
      interests: campaignData.interests || [],
      isPremium: campaignType === 'premium'
    });

    // TODO: Deduct moves from user's balance
    // This would involve checking if the user has enough moves
    // and then updating their balance

    // Create campaign (placeholder - replace with your actual campaign creation logic)
    const newCampaign = {
      id: `campaign_${Date.now()}`,
      advertiser_id: finalAdvertiserId,
      user_id: req.user.id,
      type: campaignType,
      status: 'draft',
      moveCost,
      ...campaignData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Save campaign to database
    // await saveCampaignToDatabase(newCampaign);

    res.status(201).json({
      success: true,
      campaign: newCampaign,
      movesSpent: moveCost,
      remainingMoves: 0 // TODO: Get updated move balance
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

module.exports = router;
