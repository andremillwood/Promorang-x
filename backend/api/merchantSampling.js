/**
 * Merchant Sampling API
 * 
 * Endpoints for the merchant sampling program that allows new merchants to
 * experience real user participation before committing to paid activations.
 */

const express = require('express');
const router = express.Router();
const merchantSamplingService = require('../services/merchantSamplingService');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/merchant-sampling/state
 * Get current merchant's sampling state and visibility rules
 */
router.get('/state', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { state, profile } = await merchantSamplingService.getMerchantState(advertiserId);
    const visibility = merchantSamplingService.getMerchantVisibilityRules(state);

    res.json({
      success: true,
      data: {
        merchant_state: state,
        profile,
        visibility
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error getting state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get merchant state'
    });
  }
});

/**
 * GET /api/merchant-sampling/eligibility
 * Check if merchant can create a sampling activation
 */
router.get('/eligibility', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const eligibility = await merchantSamplingService.canCreateSamplingActivation(advertiserId);
    const limits = await merchantSamplingService.getSamplingConfig('limits');

    res.json({
      success: true,
      data: {
        ...eligibility,
        limits
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check eligibility'
    });
  }
});

/**
 * POST /api/merchant-sampling/activation
 * Create a new sampling activation
 */
router.post('/activation', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const {
      name,
      description,
      value_type,
      value_amount,
      value_unit,
      max_redemptions,
      duration_days,
      include_in_deals,
      include_in_events,
      include_in_post_proof
    } = req.body;

    // Validate required fields
    if (!name || !value_type || !value_amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, value_type, value_amount'
      });
    }

    const result = await merchantSamplingService.createSamplingActivation(advertiserId, {
      name,
      description,
      value_type,
      value_amount,
      value_unit,
      max_redemptions,
      duration_days,
      include_in_deals,
      include_in_events,
      include_in_post_proof
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        activation: result.activation,
        message: 'Sampling activation created successfully. Your promotion is now live!'
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error creating activation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sampling activation'
    });
  }
});

/**
 * GET /api/merchant-sampling/activation
 * Get merchant's current sampling activation
 */
router.get('/activation', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { has_activation, metrics } = await merchantSamplingService.getSamplingMetrics(advertiserId);

    res.json({
      success: true,
      data: {
        has_activation,
        metrics
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error getting activation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activation'
    });
  }
});

/**
 * POST /api/merchant-sampling/participate
 * Record user participation in a sampling activation (called by entry surfaces)
 */
router.post('/participate', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { activation_id, action_type, user_maturity_state, metadata } = req.body;

    if (!activation_id || !action_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: activation_id, action_type'
      });
    }

    const result = await merchantSamplingService.recordParticipation(
      activation_id,
      userId,
      action_type,
      user_maturity_state || 0,
      metadata || {}
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        participation: result.participation
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error recording participation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record participation'
    });
  }
});

/**
 * POST /api/merchant-sampling/verify
 * Verify a participation (Social Shield verification)
 */
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { participation_id, verification_method } = req.body;

    if (!participation_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: participation_id'
      });
    }

    const result = await merchantSamplingService.verifyParticipation(
      participation_id,
      verification_method || 'social_shield'
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        participation: result.participation
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error verifying participation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify participation'
    });
  }
});

/**
 * POST /api/merchant-sampling/redeem
 * Record a redemption
 */
router.post('/redeem', requireAuth, async (req, res) => {
  try {
    const { participation_id, redemption_value } = req.body;

    if (!participation_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: participation_id'
      });
    }

    const result = await merchantSamplingService.recordRedemption(
      participation_id,
      redemption_value || 0
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        participation: result.participation
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error recording redemption:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record redemption'
    });
  }
});

/**
 * POST /api/merchant-sampling/request-graduation
 * Merchant explicitly requests graduation (wants more features)
 */
router.post('/request-graduation', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { request_type } = req.body;

    // Valid request types that trigger graduation
    const validRequestTypes = [
      'another_activation',
      'higher_limits',
      'targeting',
      'scheduling',
      'scaling',
      'analytics',
      'optimization'
    ];

    if (!request_type || !validRequestTypes.includes(request_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request_type',
        valid_types: validRequestTypes
      });
    }

    const result = await merchantSamplingService.requestGraduation(advertiserId, request_type);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        message: 'You have graduated from the sampling program. Choose your next step.',
        next_steps: [
          { id: 'walk_away', label: 'Walk away (no penalty)', description: 'Thank you for trying Promorang!' },
          { id: 'paid_activation', label: 'Run a paid activation', description: 'Same structure, higher limits' },
          { id: 'subscribe', label: 'Subscribe and scale', description: 'Unlock advanced tools' }
        ]
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error requesting graduation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process graduation request'
    });
  }
});

/**
 * POST /api/merchant-sampling/upgrade
 * Upgrade merchant to paid plan
 */
router.post('/upgrade', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { plan_id, plan_details } = req.body;

    const result = await merchantSamplingService.upgradeToPaid(advertiserId, {
      plan_id,
      ...plan_details
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Welcome to Promorang! Your paid features are now unlocked.'
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error upgrading:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade'
    });
  }
});

/**
 * GET /api/merchant-sampling/active-for-surface/:surface
 * Get active sampling activations for a specific entry surface
 * Used by Deals, Events, Post Proof pages to include sampling promotions
 */
router.get('/active-for-surface/:surface', async (req, res) => {
  try {
    const { surface } = req.params;

    const validSurfaces = ['deals', 'events', 'post'];
    if (!validSurfaces.includes(surface)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid surface',
        valid_surfaces: validSurfaces
      });
    }

    const activations = await merchantSamplingService.getActiveSamplingForSurface(surface);

    res.json({
      success: true,
      data: {
        activations
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error getting active sampling:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active sampling'
    });
  }
});

/**
 * GET /api/merchant-sampling/graduation-options
 * Get post-graduation options for merchant
 */
router.get('/graduation-options', requireAuth, async (req, res) => {
  try {
    const advertiserId = req.user?.id;
    
    if (!advertiserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { state } = await merchantSamplingService.getMerchantState(advertiserId);

    if (state !== merchantSamplingService.MerchantState.GRADUATED) {
      return res.status(400).json({
        success: false,
        error: 'Graduation options only available after sampling'
      });
    }

    // Get sampling metrics for context
    const { metrics } = await merchantSamplingService.getSamplingMetrics(advertiserId);

    res.json({
      success: true,
      data: {
        sampling_results: metrics,
        options: [
          {
            id: 'walk_away',
            label: 'Walk Away',
            description: 'No penalty, no pressure. Thank you for trying Promorang!',
            action: null
          },
          {
            id: 'paid_activation',
            label: 'Run a Paid Activation',
            description: 'Same structure as sampling, but with higher limits and guaranteed reach.',
            action: '/advertiser/campaigns/new'
          },
          {
            id: 'subscribe',
            label: 'Subscribe & Scale',
            description: 'Unlock advanced tools: targeting, analytics, optimization, multiple campaigns.',
            action: '/advertiser/subscribe'
          }
        ]
      }
    });
  } catch (error) {
    console.error('[MerchantSamplingAPI] Error getting graduation options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get graduation options'
    });
  }
});

module.exports = router;
