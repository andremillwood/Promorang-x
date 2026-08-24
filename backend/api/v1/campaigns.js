const express = require('express');
const router = express.Router();
const { requireApiKeyOrAuth } = require('../../middleware/apiKeyAuth');
const { runCampaignOperator } = require('../../lib/agents/campaignOperatorAgent');
const { supabase } = require('../../lib/supabase');

/**
 * POST /api/v1/campaigns/generate-plan
 * Headless AI agent trigger: analyzes objective and generates full structured campaign strategy.
 */
router.post('/generate-plan', requireApiKeyOrAuth(['campaigns:write']), async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      objective,
      targetMarket = 'General',
      audience,
      budget,
      timeframe = 'Upcoming',
      constraints = [],
      organizationId,
      targetCount = 50
    } = req.body || {};

    if (!objective || typeof objective !== 'string' || objective.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Objective statement of at least 5 characters is required',
        code: 'INVALID_OBJECTIVE'
      });
    }

    const result = await runCampaignOperator(
      {
        objective: objective.trim(),
        targetMarket,
        audience,
        budget,
        timeframe,
        constraints,
        organizationId: organizationId || req.user?.organizationId,
        targetCount: Number(targetCount)
      },
      { userId }
    );

    return res.json({
      success: true,
      data: result,
      message: 'Campaign strategy and draft generated successfully'
    });
  } catch (err) {
    console.error('[API v1 /campaigns/generate-plan] Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate campaign plan',
      code: 'CAMPAIGN_PLAN_FAILED'
    });
  }
});

/**
 * GET /api/v1/campaigns/:id
 * Retrieve campaign telemetry and details.
 */
router.get('/:id', requireApiKeyOrAuth(['campaigns:read']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.json({
        success: true,
        data: {
          id,
          name: 'Demo Headless Campaign',
          status: 'active',
          participations: 58,
          conversions: 24,
          budgetSpent: 2400
        }
      });
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found', code: 'CAMPAIGN_NOT_FOUND' });
    }

    return res.json({ success: true, data: campaign });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, code: 'CAMPAIGN_FETCH_FAILED' });
  }
});

module.exports = router;
