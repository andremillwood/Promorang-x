/**
 * PROMORANG AGENT OPERATING LAYER API ROUTER
 * Routes for Campaign Operator Agent execution, draft saving, and trace auditing.
 */

const express = require('express');
const router = express.Router();
const { runCampaignOperator, runCampaignDiagnostics } = require('../lib/agents/campaignOperatorAgent');
const { 
  createCampaignDraftTool, 
  approveAndPublishCampaignTool, 
  mobilizeCreatorsTool, 
  getCampaignTelemetryTool 
} = require('../lib/agents/agentTools');
const agentTraceService = require('../services/agentTraceService');

const sendSuccess = (res, data = {}, message) => {
  return res.json({ success: true, data, message });
};

const sendError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ success: false, error: message, code });
};

// All agent routes require authenticated user context
router.use(requireAuth);

/**
 * POST /api/agent/campaign-operator/plan
 * Run the Promorang Campaign Operator Agent to analyze objective and build structured recommendation.
 */
router.post('/campaign-operator/plan', async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      objective,
      targetMarket,
      audience,
      budget,
      campaignDates,
      constraints,
      organizationId,
      targetCount
    } = req.body || {};

    if (!objective || typeof objective !== 'string' || objective.trim().length < 5) {
      return sendError(res, 400, 'Objective statement of at least 5 characters is required', 'INVALID_OBJECTIVE');
    }

    const result = await runCampaignOperator(
      {
        objective: objective.trim(),
        targetMarket: targetMarket || 'General',
        audience,
        budget,
        timeframe: campaignDates || 'Upcoming',
        constraints: Array.isArray(constraints) ? constraints : [],
        organizationId,
        targetCount: targetCount ? Number(targetCount) : 50
      },
      { userId }
    );

    return sendSuccess(res, result, 'Campaign plan generated successfully');
  } catch (err) {
    console.error('Error running Campaign Operator Agent:', err);
    return sendError(res, 500, err.message || 'Failed to execute Campaign Operator Agent', 'AGENT_EXECUTION_FAILED');
  }
});

/**
 * POST /api/agent/campaign-operator/draft
 * Create an official DRAFT campaign in Promorang based on approved recommendation.
 */
router.post('/campaign-operator/draft', async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      organizationId,
      statement,
      goal,
      targetCount,
      budgetUsd,
      audience,
      recommendedCreators,
      recommendedMoments,
      rationale
    } = req.body || {};

    if (!statement) {
      return sendError(res, 400, 'Campaign statement is required', 'MISSING_STATEMENT');
    }

    const draftResult = await createCampaignDraftTool.execute({
      organizationId,
      statement,
      goal: goal || 'bring_people',
      targetCount: targetCount ? Number(targetCount) : 50,
      budgetUsd: budgetUsd ? Number(budgetUsd) : 0,
      audience,
      recommendedCreators: Array.isArray(recommendedCreators) ? recommendedCreators : [],
      recommendedMoments: Array.isArray(recommendedMoments) ? recommendedMoments : [],
      rationale
    });

    if (draftResult.error) {
      return sendError(res, 400, draftResult.error, 'DRAFT_CREATION_FAILED');
    }

    return sendSuccess(res, draftResult, 'Campaign draft created successfully');
  } catch (err) {
    console.error('Error creating campaign draft:', err);
    return sendError(res, 500, err.message || 'Failed to create campaign draft', 'DRAFT_CREATION_FAILED');
  }
});

/**
 * POST /api/agent/campaign-operator/activate
 * Approve and publish a campaign draft after verifying budget lock confirmation.
 */
router.post('/campaign-operator/activate', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { campaignId, organizationId, confirmBudgetLock } = req.body || {};

    if (!campaignId || !organizationId) {
      return sendError(res, 400, 'campaignId and organizationId are required', 'MISSING_PARAMETERS');
    }

    const activationResult = await approveAndPublishCampaignTool.execute({
      campaignId,
      organizationId,
      confirmBudgetLock: !!confirmBudgetLock
    });

    if (activationResult.error) {
      return sendError(res, 400, activationResult.error, 'ACTIVATION_FAILED');
    }

    return sendSuccess(res, activationResult, 'Campaign published and activated successfully');
  } catch (err) {
    console.error('Error activating campaign:', err);
    return sendError(res, 500, err.message || 'Failed to activate campaign', 'ACTIVATION_FAILED');
  }
});

/**
 * POST /api/agent/campaign-operator/mobilize
 * Issue targeted invitations to network creators for an active campaign.
 */
router.post('/campaign-operator/mobilize', async (req, res) => {
  try {
    const { campaignId, creatorIds, invitationMessage } = req.body || {};

    if (!campaignId || !Array.isArray(creatorIds)) {
      return sendError(res, 400, 'campaignId and creatorIds array are required', 'INVALID_PARAMETERS');
    }

    const mobilizeResult = await mobilizeCreatorsTool.execute({
      campaignId,
      creatorIds,
      invitationMessage
    });

    return sendSuccess(res, mobilizeResult, 'Creator mobilization invitations issued');
  } catch (err) {
    console.error('Error mobilizing creators:', err);
    return sendError(res, 500, err.message || 'Failed to mobilize creators', 'MOBILIZATION_FAILED');
  }
});

/**
 * GET /api/agent/campaign-operator/telemetry/:campaignId
 * Fetch real-time participation velocity, check-ins, and Gem burn.
 */
router.get('/campaign-operator/telemetry/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const telemetry = await getCampaignTelemetryTool.execute({ campaignId });
    return sendSuccess(res, telemetry);
  } catch (err) {
    console.error('Error fetching campaign telemetry:', err);
    return sendError(res, 500, 'Failed to fetch campaign telemetry', 'TELEMETRY_FAILED');
  }
});

/**
 * POST /api/agent/campaign-operator/diagnose
 * Run AI diagnostics and optimization proposal engine for an active campaign.
 */
router.post('/campaign-operator/diagnose', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { campaignId } = req.body || {};

    if (!campaignId) {
      return sendError(res, 400, 'campaignId is required', 'MISSING_CAMPAIGN_ID');
    }

    const diagnostics = await runCampaignDiagnostics(campaignId, { userId });
    return sendSuccess(res, diagnostics, 'Campaign performance diagnostics generated');
  } catch (err) {
    console.error('Error running campaign diagnostics:', err);
    return sendError(res, 500, err.message || 'Failed to run campaign diagnostics', 'DIAGNOSTICS_FAILED');
  }
});

/**
 * GET /api/agent/traces
 * Retrieve recent agent execution traces for auditing and observability.
 */
router.get('/traces', async (req, res) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.query.organizationId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const traces = await agentTraceService.getTraces({ userId, organizationId, limit });
    return sendSuccess(res, { traces });
  } catch (err) {
    console.error('Error fetching agent traces:', err);
    return sendError(res, 500, 'Failed to fetch agent traces', 'TRACES_FETCH_FAILED');
  }
});

module.exports = router;
