/**
 * MOMENT CONTENT DISTRIBUTION API
 * 
 * Endpoints for serving contextual content during moment interactions:
 * - Pre-check-in sponsor content
 * - Post-check-in rewards + upsells
 * - In-moment brand messaging
 * - Contextual recommendations
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const contentDistributionService = require('../services/momentContentDistributionService');

/**
 * GET /api/moment-content/:momentId/:interactionType
 * Get contextual content for a specific moment interaction point
 * 
 * interactionType can be:
 * - pre_checkin: Before user checks in
 * - post_checkin: After successful check-in
 * - reward_claim: During reward redemption
 * - moment_join: When user joins moment
 * - moment_exit: When user leaves moment page
 */
router.get('/:momentId/:interactionType', requireAuth, async (req, res) => {
  try {
    const { momentId, interactionType } = req.params;
    const userId = req.user.id;
    const { category, location } = req.query;

    // Validate interaction type
    const validTypes = ['pre_checkin', 'post_checkin', 'reward_claim', 'moment_join', 'moment_exit'];
    if (!validTypes.includes(interactionType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid interaction type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const result = await contentDistributionService.getContentForMomentInteraction(
      momentId,
      userId,
      interactionType,
      { category, location }
    );

    res.json({
      success: true,
      ...result,
      interaction_type: interactionType,
      served_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Moment Content API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get content'
    });
  }
});

/**
 * POST /api/moment-content/interaction
 * Track user interaction with distributed content
 */
router.post('/interaction', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      content_id, 
      moment_id, 
      interaction_type, 
      action 
    } = req.body;

    if (!content_id || !moment_id || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: content_id, moment_id, action'
      });
    }

    await contentDistributionService.trackContentInteraction(
      content_id,
      userId,
      moment_id,
      interaction_type,
      action
    );

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('[Moment Content API] Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track interaction'
    });
  }
});

/**
 * GET /api/moment-content/sponsor-analytics/:momentId
 * Get sponsor analytics for a specific moment (sponsor only)
 */
router.get('/sponsor-analytics/:momentId', requireAuth, async (req, res) => {
  try {
    const { momentId } = req.params;
    const userId = req.user.id;

    // Verify user is the sponsor of this moment
    const { data: moment, error: momentError } = await require('../lib/supabase').supabase
      .from('moments')
      .select('sponsor_id, advertiser_id, brand_id')
      .eq('id', momentId)
      .single();

    if (momentError) {
      return res.status(404).json({
        success: false,
        error: 'Moment not found'
      });
    }

    // Check if user is authorized
    const isAuthorized = moment.sponsor_id === userId || 
                        moment.advertiser_id === userId || 
                        moment.brand_id === userId ||
                        req.user.is_admin;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these analytics'
      });
    }

    const analytics = await contentDistributionService.getSponsorAnalytics(momentId, userId);

    res.json({
      success: true,
      analytics: analytics || {
        total_distributions: 0,
        total_views: 0,
        total_clicks: 0,
        ctr: '0.00'
      }
    });

  } catch (error) {
    console.error('[Moment Content API] Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get analytics'
    });
  }
});

module.exports = router;
