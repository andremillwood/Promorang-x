/**
 * User Maturity State API
 * 
 * Endpoints for managing user maturity state and progressive feature reveal.
 */

const express = require('express');
const router = express.Router();
const maturityService = require('../services/maturityService');
const { optionalAuth } = require('../middleware/auth');

// Apply optionalAuth to all routes in this router
router.use(optionalAuth);

/**
 * GET /api/maturity/state
 * Get current user's maturity state and visibility rules
 * Also triggers recalculation to catch any balance changes (points/keys/gems)
 */
router.get('/state', async (req, res) => {
  try {
    const userId = req.user?.id;

    // Direct check for State 0-3 demo users in case of unconfigured Supabase
    if (userId && String(userId).startsWith('a0000000')) {
      const stateNum = parseInt(String(userId).split('-').pop()) || 0;
      const data = {
        maturity_state: stateNum,
        verified_actions_count: stateNum * 5,
        first_reward_received_at: stateNum > 0 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        last_used_surface: 'today',
        user_type: 'creator'
      };

      const rules = maturityService.getVisibilityRules(stateNum);

      return res.json({
        success: true,
        data: {
          ...data,
          visibility: rules
        },
        demo: true
      });
    }

    // Recalculate state to catch any balance changes
    if (userId) {
      await maturityService.recalculateMaturityState(userId);
    }

    const maturityData = await maturityService.getUserMaturityData(userId);
    const visibilityRules = maturityService.getVisibilityRules(maturityData.maturity_state);

    res.json({
      success: true,
      data: {
        ...maturityData,
        visibility: visibilityRules
      }
    });
  } catch (error) {
    console.error('[MaturityAPI] Error getting state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get maturity state'
    });
  }
});

/**
 * POST /api/maturity/action
 * Record a verified action for the user
 */
router.post('/action', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { action_type, metadata = {}, surface = 'web' } = req.body;

    if (!action_type) {
      return res.status(400).json({
        success: false,
        error: 'action_type is required'
      });
    }

    // Validate action type
    if (!maturityService.VERIFIED_ACTION_TYPES.includes(action_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action_type',
        valid_types: maturityService.VERIFIED_ACTION_TYPES
      });
    }

    const action = await maturityService.recordVerifiedAction(userId, action_type, metadata, surface);
    const maturityData = await maturityService.getUserMaturityData(userId);
    const visibilityRules = maturityService.getVisibilityRules(maturityData.maturity_state);

    res.json({
      success: true,
      data: {
        action,
        maturity: {
          ...maturityData,
          visibility: visibilityRules
        }
      }
    });
  } catch (error) {
    console.error('[MaturityAPI] Error recording action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record action'
    });
  }
});

/**
 * POST /api/maturity/reward-received
 * Mark that user received their first reward
 */
router.post('/reward-received', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const success = await maturityService.markFirstRewardReceived(userId);
    const maturityData = await maturityService.getUserMaturityData(userId);
    const visibilityRules = maturityService.getVisibilityRules(maturityData.maturity_state);

    res.json({
      success,
      data: {
        maturity: {
          ...maturityData,
          visibility: visibilityRules
        }
      }
    });
  } catch (error) {
    console.error('[MaturityAPI] Error marking reward:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark reward received'
    });
  }
});

/**
 * GET /api/maturity/check-access/:feature
 * Check if user can access a specific feature
 */
router.get('/check-access/:feature', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { feature } = req.params;

    const maturityData = await maturityService.getUserMaturityData(userId);
    const access = maturityService.checkFeatureAccess(maturityData.maturity_state, feature);

    res.json({
      success: true,
      data: {
        feature,
        ...access,
        current_state: maturityData.maturity_state,
        actions_completed: maturityData.verified_actions_count
      }
    });
  } catch (error) {
    console.error('[MaturityAPI] Error checking access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature access'
    });
  }
});

/**
 * POST /api/maturity/recalculate
 * Force recalculation of user's maturity state
 */
router.post('/recalculate', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { hasSubscription, accessedAdvancedFeature } = req.body;

    const result = await maturityService.recalculateMaturityState(userId, {
      hasSubscription,
      accessedAdvancedFeature
    });

    const maturityData = await maturityService.getUserMaturityData(userId);
    const visibilityRules = maturityService.getVisibilityRules(maturityData.maturity_state);

    res.json({
      success: true,
      data: {
        ...result,
        maturity: {
          ...maturityData,
          visibility: visibilityRules
        }
      }
    });
  } catch (error) {
    console.error('[MaturityAPI] Error recalculating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to recalculate maturity state'
    });
  }
});

/**
 * POST /api/maturity/override
 * Override maturity state (for demo users and development)
 * This allows demo users to shift between states for testing
 */
router.post('/override', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { maturity_state } = req.body;

    if (maturity_state === undefined || maturity_state < 0 || maturity_state > 4) {
      return res.status(400).json({
        success: false,
        error: 'Invalid maturity_state. Must be 0-4.'
      });
    }

    // Check if user is a demo user or admin
    const isDemoUser = String(userId).startsWith('a0000000-') ||
      String(userId).startsWith('demo-') ||
      req.user?.email?.endsWith('@demo.com');
    const isAdmin = ['admin', 'super_admin', 'master_admin'].includes(req.user?.role || req.user?.user_type);

    if (!isDemoUser && !isAdmin) {
      // For regular users, check if they have Pro subscription to unlock full experience
      // For now, allow if they explicitly want advanced mode (future: check subscription)
      console.log(`[MaturityAPI] User ${userId} requesting maturity override to state ${maturity_state}`);
    }

    // Update the user's maturity state
    const result = await maturityService.setMaturityState(userId, maturity_state);
    const visibilityRules = maturityService.getVisibilityRules(maturity_state);

    res.json({
      success: true,
      data: {
        maturity_state,
        visibility: visibilityRules
      },
      message: `Maturity state set to ${maturity_state}`
    });
  } catch (error) {
    console.error('[MaturityAPI] Error overriding maturity state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to override maturity state'
    });
  }
});

/**
 * GET /api/maturity/visibility
 * Get visibility rules for current user (lightweight endpoint)
 */
router.get('/visibility', async (req, res) => {
  try {
    const userId = req.user?.id;
    const maturityData = await maturityService.getUserMaturityData(userId);
    const visibilityRules = maturityService.getVisibilityRules(maturityData.maturity_state);

    res.json({
      success: true,
      data: visibilityRules
    });
  } catch (error) {
    console.error('[MaturityAPI] Error getting visibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get visibility rules'
    });
  }
});

/**
 * POST /api/maturity/admin/set-operator-pro
 * Admin endpoint to set user as OPERATOR_PRO
 */
router.post('/admin/set-operator-pro', async (req, res) => {
  try {
    const adminId = req.user?.id;
    const adminType = req.user?.user_type;

    // Check admin permissions
    if (!adminId || !['admin', 'super_admin'].includes(adminType)) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const success = await maturityService.setOperatorPro(user_id, adminId);

    res.json({
      success,
      message: success ? 'User set to OPERATOR_PRO' : 'Failed to update user'
    });
  } catch (error) {
    console.error('[MaturityAPI] Error setting operator pro:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set operator pro status'
    });
  }
});

module.exports = router;
