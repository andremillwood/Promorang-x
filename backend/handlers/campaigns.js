const express = require('express');
const router = express.Router();
const { calculateCampaignCost, getMoveCostBreakdown } = require('../config/moveCosts');

const { authMiddleware } = require('../lib/auth');

// Apply auth to all routes
router.use(authMiddleware);

// Calculate move cost for a campaign
// Calculate move cost for a campaign
router.post('/calculate-move-cost', (req, res) => {
  // ... existing implementation
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

// Get all campaigns (Marketplace)
router.get('/', async (req, res) => {
  try {
    // Return mock campaigns for now
    const campaigns = [
      {
        id: '1',
        title: 'Summer Sale Promotion',
        description: 'Promote our summer collection and earn 10% commission on sales.',
        merchant: {
          id: 'm1',
          name: 'Fashion Nova',
          avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80'
        },
        reward: 10,
        rewardType: 'percentage',
        media: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1760&q=80',
        category: 'Fashion',
        shares: 120,
        conversions: 45,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Tech Gadget Launch',
        description: 'Review our new wireless earbuds and get $50 per video.',
        merchant: {
          id: 'm2',
          name: 'TechGear',
          avatar: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80'
        },
        reward: 50,
        rewardType: 'fixed',
        media: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1760&q=80',
        category: 'Tech',
        shares: 85,
        conversions: 12,
        status: 'active',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Join a campaign
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    // Mock join logic
    res.json({
      success: true,
      message: 'Successfully joined campaign',
      campaign_id: id
    });
  } catch (error) {
    console.error('Error joining campaign:', error);
    res.status(500).json({ error: 'Failed to join campaign' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const {
      campaignType = 'standard',
      ...campaignData
    } = req.body;

    const userId = req.user.id;

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
      userId,
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
