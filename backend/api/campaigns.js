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

// Get all active campaigns
router.get('/', async (req, res) => {
  try {
    const merchantSamplingService = require('../services/merchantSamplingService');

    // Get active sampling activations for deals surface
    let samplingDeals = [];
    try {
      samplingDeals = await merchantSamplingService.getActiveSamplingForSurface('deals');
    } catch (err) {
      console.error('Error fetching sampling activations:', err);
    }

    // Transform sampling activations to campaign format
    const samplingCampaigns = samplingDeals.map(activation => {
      let rewardType = 'gems';
      let reward = 25; // Default base points

      if (activation.value_type === 'coupon' || activation.value_type === 'voucher') {
        rewardType = 'coupon';
        reward = activation.value_amount || 0;
      } else if (activation.value_type === 'cash_prize') {
        rewardType = 'gems'; // Convert cash to gems visual or keep as gems
        reward = activation.value_amount * 100; // rough conversion if needed, or just display 
      }

      return {
        id: `sampling-${activation.id}`,
        title: activation.name,
        description: activation.description || 'Special merchant offer',
        merchant: activation.advertiser_profiles?.company_name || 'Local Business',
        reward: reward,
        rewardType: rewardType,
        status: 'active',
        is_sampling: true,
        difficulty: 'easy',
        tags: ['sampling', activation.value_type],
        expiresAt: activation.expires_at,
        shares: activation.current_redemptions || 0
      };
    });

    if (!supabase || process.env.USE_DEMO_CAMPAIGNS === 'true') {
      const demoCampaigns = [
        {
          id: 'demo-1',
          title: '50% Off Your First Coffee',
          description: 'Get half off any drink at Brew & Co when you share a photo of your visit.',
          merchant: 'Brew & Co',
          reward: 50,
          rewardType: 'percentage',
          status: 'active',
          difficulty: 'easy',
          tags: ['food', 'coffee'],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          shares: 124
        },
        {
          id: 'demo-2',
          title: '300 Gems for Gym Proof',
          description: 'Post a sweaty selfie from Fit-Nation to earn a massive gem bonus!',
          merchant: 'Fit-Nation',
          reward: 300,
          rewardType: 'gems',
          status: 'active',
          difficulty: 'medium',
          tags: ['fitness', 'health'],
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          shares: 45
        }
      ];
      return res.json([...samplingCampaigns, ...demoCampaigns]);
    }

    const { data: campaigns, error } = await supabase
      .from('advertiser_campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json([...samplingCampaigns, ...campaigns]);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get my joined campaigns
router.get('/my', requireAuth, async (req, res) => {
  try {
    if (!supabase) return res.json([]);

    const { data: joined, error } = await supabase
      .from('campaign_participants')
      .select('campaign_id, campaigns(*)')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const myCampaigns = (joined || []).map(j => j.campaigns).filter(Boolean);
    res.json(myCampaigns);
  } catch (error) {
    console.error('Error fetching my campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch joined campaigns' });
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

    // Create campaign using service
    const campaignService = require('../services/campaignService');
    const campaign = await campaignService.createCampaign({
      advertiser_id: finalAdvertiserId,
      user_id: req.user.id,
      title: campaignData.title,
      description: campaignData.description,
      maturity: campaignData.maturity || 'seed',
      metadata: {
        ...campaignData,
        moveCost
      }
    });

    res.status(201).json({
      success: true,
      campaign,
      movesSpent: moveCost,
      remainingMoves: 0 // TODO: Get updated move balance
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

module.exports = router;
