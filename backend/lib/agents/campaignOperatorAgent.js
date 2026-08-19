/**
 * PROMORANG CAMPAIGN OPERATOR AGENT
 * AI Agent for analyzing merchant objectives, inspecting Promorang network inventory,
 * and generating evidence-grounded campaign recommendations.
 */

const { generateText } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { google } = require('@ai-sdk/google');
const { campaignOperatorTools } = require('./agentTools');
const demandPlanCompilerService = require('../../services/demandPlanCompilerService');
const agentTraceService = require('../../services/agentTraceService');

const SYSTEM_PROMPT = `
You are the Promorang Campaign Operator Agent.
Your purpose is to analyze brand and merchant objectives, inspect the Promorang network (users, creators, moments, scenes, communities, rewards), and compile evidence-backed campaign recommendations.

RULES:
1. OPTIMIZE FOR: Measurable action, relevant audience, efficient distribution, creator/community participation, defensible reward economics.
2. Ground all recommendations in platform data retrieved via tools.
3. NEVER fabricate creators, user counts, performance metrics, conversion rates, or community sizes.
4. Distinguish clearly between platforms facts (retrieved from tools) and assumptions.
5. Identify data gaps explicitly when Promorang network data is insufficient.
6. All campaign outputs are recommendations for HUMAN APPROVAL ONLY. Never attempt to publish live or spend money.
`;

/**
 * Execute the Campaign Operator Agent for a given objective
 */
async function runCampaignOperator(params = {}, userContext = {}) {
  const startTime = Date.now();
  const {
    objective,
    targetMarket = 'General',
    audience = '',
    budget = null,
    timeframe = 'Upcoming',
    location = '',
    constraints = [],
    organizationId = null
  } = params;

  if (!objective || objective.trim().length < 5) {
    throw new Error('Objective statement of at least 5 characters is required');
  }

  const statement = objective.trim();
  const toolCallsExecuted = [];

  // Determine model selection if API keys exist in environment
  const openaiKey = process.env.OPENAI_API_KEY;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

  let model = null;
  if (googleKey) {
    model = google('gemini-1.5-flash');
  } else if (openaiKey) {
    model = openai('gpt-4o-mini');
  }

  let finalReport = null;

  // 1. Try Vercel AI SDK LLM Loop if model provider key is present
  if (model) {
    try {
      console.log('🤖 Invoking Vercel AI SDK Campaign Operator Agent...');
      const result = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt: `Analyze the following merchant objective and construct a campaign plan recommendation using available tools:
Objective: "${statement}"
Target Market: ${targetMarket}
Target Audience: ${audience || 'Not specified'}
Budget: ${budget ? budget : 'Flexible'}
Location: ${location || 'Not specified'}
Timeframe: ${timeframe}
Constraints: ${constraints.join(', ') || 'None'}
Organization ID: ${organizationId || 'None'}
`,
        tools: campaignOperatorTools,
        maxSteps: 5
      });

      // Capture tool calls made during LLM execution
      if (result.steps) {
        for (const step of result.steps) {
          if (step.toolCalls) {
            for (const tc of step.toolCalls) {
              toolCallsExecuted.push({
                toolName: tc.toolName,
                args: tc.args,
                result: step.toolResults?.find(tr => tr.toolCallId === tc.toolCallId)?.result
              });
            }
          }
        }
      }

      finalReport = {
        agentOutputText: result.text,
        agentGenerated: true,
        provider: 'Vercel AI SDK'
      };
    } catch (llmErr) {
      console.warn('⚠️ Vercel AI SDK execution warning (falling back to deterministic compilation):', llmErr.message);
    }
  }

  // 2. Guaranteed Platform Graph Orchestration & Fallback Engine
  // Runs tool inspection and demand plan compilation to produce ground-truth report
  const [merchantData, creatorsData, momentsData, communitiesData, audienceSignals, rewardCost] = await Promise.all([
    organizationId ? campaignOperatorTools.inspectMerchant.execute({ organizationId }) : Promise.resolve(null),
    campaignOperatorTools.findCreators.execute({ categories: [targetMarket.toLowerCase()], limit: 6 }),
    campaignOperatorTools.findMoments.execute({ location, limit: 6 }),
    campaignOperatorTools.findCommunities.execute({ search: targetMarket, limit: 5 }),
    campaignOperatorTools.getAudienceSignals.execute({ targetAudience: audience || statement, location }),
    campaignOperatorTools.estimateRewardCost.execute({
      goal: 'bring_people',
      targetCount: params.targetCount || 50,
      rewardAmountPerAction: 50
    })
  ]);

  toolCallsExecuted.push(
    { toolName: 'findCreators', args: { categories: [targetMarket.toLowerCase()] }, result: creatorsData },
    { toolName: 'findMoments', args: { location }, result: momentsData },
    { toolName: 'findCommunities', args: { search: targetMarket }, result: communitiesData },
    { toolName: 'getAudienceSignals', args: { targetAudience: audience || statement }, result: audienceSignals },
    { toolName: 'estimateRewardCost', args: { targetCount: params.targetCount || 50 }, result: rewardCost }
  );

  const compiledDemandPlan = demandPlanCompilerService.compileDemandPlan({
    statement,
    audience,
    location,
    timeframe,
    targetCount: params.targetCount || 50,
    constraints
  });

  const structuredReport = {
    objectiveSummary: statement,
    classifiedGoal: compiledDemandPlan.intent.goal,
    targetMarket,
    targetAudience: audience || compiledDemandPlan.people.audience,
    timeframe,
    location: location || 'Network Wide',
    networkInventory: {
      creators: creatorsData?.creators || [],
      moments: momentsData?.moments || [],
      communities: communitiesData?.communities || []
    },
    recommendedMissions: compiledDemandPlan.experience.actions.map(act => ({
      id: act.id,
      label: act.label,
      required: act.required,
      proofType: act.proof || 'qr'
    })),
    rewardEconomics: rewardCost,
    demandPlan: compiledDemandPlan,
    dataGapsAndMissing: compiledDemandPlan.readiness.missing,
    assumptions: [
      'Target participant capacity assumes standard conversion baseline',
      'Location check-ins verified via Promorang QR / OCR service'
    ],
    risks: [
      'Budget funding required prior to live activation',
      'Creator participation subject to response rates'
    ],
    recommendedNextAction: 'Review details, edit parameters if needed, and save draft campaign for human approval.'
  };

  const durationMs = Date.now() - startTime;

  // 3. Log trace record
  const trace = await agentTraceService.recordTrace({
    agentName: 'promorang-campaign-operator',
    userId: userContext.userId || null,
    organizationId,
    objectiveInput: params,
    toolCalls: toolCallsExecuted,
    durationMs,
    status: 'success'
  });

  return {
    success: true,
    report: structuredReport,
    llmResponse: finalReport?.agentOutputText || null,
    traceId: trace.id,
    durationMs
  };
}

/**
 * Execute real-time performance diagnostics and optimization compiler for active campaign
 */
async function runCampaignDiagnostics(campaignId, userContext = {}) {
  const startTime = Date.now();

  const telemetry = await campaignOperatorTools.getCampaignTelemetry.execute({ campaignId });
  const diagnosis = await campaignOperatorTools.diagnoseCampaignPerformance.execute({
    campaignId,
    telemetryData: {
      targetCount: telemetry.targetCount || 50,
      verifiedParticipations: telemetry.verifiedParticipations || 0,
      rejectionRate: telemetry.rejectionRate
    }
  });

  const optimization = await campaignOperatorTools.recommendOptimization.execute({
    campaignId,
    bottlenecks: diagnosis.identifiedBottlenecks || []
  });

  const durationMs = Date.now() - startTime;

  const trace = await agentTraceService.recordTrace({
    agentName: 'promorang-campaign-operator-diagnostics',
    userId: userContext.userId || null,
    objectiveInput: { campaignId },
    toolCalls: [
      { toolName: 'getCampaignTelemetry', args: { campaignId }, result: telemetry },
      { toolName: 'diagnoseCampaignPerformance', args: { campaignId }, result: diagnosis },
      { toolName: 'recommendOptimization', args: { campaignId }, result: optimization }
    ],
    durationMs,
    status: 'success'
  });

  return {
    success: true,
    campaignId,
    telemetry,
    diagnosis,
    optimization,
    traceId: trace.id,
    durationMs
  };
}

module.exports = {
  runCampaignOperator,
  runCampaignDiagnostics,
  SYSTEM_PROMPT
};
