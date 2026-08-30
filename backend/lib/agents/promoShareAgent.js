/**
 * PromoShare operator agent.
 * Role-scoped intelligence over the deterministic PromoShare engine.
 * Never invents entries, never posts, never spends, never executes draws.
 */

const agentTraceService = require('../../services/agentTraceService');
const {
  ROLES,
  resolvePromoShareRole,
  compileBrief,
  compileHandoffBrief,
  compilePoolDraftFromOutcome,
  buildShareDraft,
} = require('./promoShareBrief');
const {
  createPromoShareTools,
  inspectStanding,
  findEligibleMoments,
  inspectPools,
} = require('./promoShareTools');

const SYSTEM_PROMPT = `
You are the Promorang PromoShare operator for one authenticated person.

PromoShare is a qualified cycle engine: verified action → ticket → daily/weekly/grand pots → capped draws and leaderboards.
You are a coach and clerk. You are not the referee.

RULES:
1. Ground every sentence in tool data. Never invent tickets, weight, winners, creators, Moments, or pool balances.
2. If a tool returns empty or demo data, say so.
3. Never claim a share was posted. Drafts stay drafts.
4. Never promise a payout. Tickets raise odds. They are not income.
5. Clicks, impressions, and RSVPs do not mint tickets. Only verified downstream action does.
6. Language stays human: pot, ticket, check-in, standing. No yield, staking, ROAS, or micro-tasks.
7. Money, publishing, and draws require a human. You recommend. You do not execute.
`;

function resolveModel() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const gatewayKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

  if (gatewayKey) {
    return process.env.PROMOSHARE_AGENT_MODEL || 'google/gemini-2.5-flash';
  }

  if (googleKey) {
    try {
      const { google } = require('@ai-sdk/google');
      return google('gemini-2.0-flash');
    } catch (error) {
      console.warn('[PromoShareAgent] @ai-sdk/google unavailable:', error.message);
    }
  }

  if (openaiKey) {
    try {
      const { openai } = require('@ai-sdk/openai');
      return openai('gpt-4o-mini');
    } catch (error) {
      console.warn('[PromoShareAgent] @ai-sdk/openai unavailable:', error.message);
    }
  }

  return null;
}

async function maybePolishBrief(brief, role, params, tools) {
  const model = resolveModel();
  if (!model) return { text: null, toolCalls: [] };

  let generateText;
  try {
    ({ generateText } = require('ai'));
  } catch (error) {
    return { text: null, toolCalls: [] };
  }

  try {
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `Role: ${role}
Objective: ${params.objective || 'Give me my next PromoShare move'}
Location: ${params.location || 'unspecified'}
Budget Gems: ${params.budgetGems || 'none'}

A deterministic brief is already compiled. Use tools only to confirm facts. Rewrite the next-move headline if needed, but do not change numbers, invent Moments, or claim anything was posted or funded.

Brief JSON:
${JSON.stringify({
  headline: brief.headline,
  summary: brief.summary,
  nextMove: brief.nextMove,
  cycle: brief.cycle || null,
  boundaries: brief.boundaries,
}, null, 2)}
`,
      tools,
      maxSteps: 4,
    });

    const toolCalls = [];
    if (result.steps) {
      for (const step of result.steps) {
        for (const call of step.toolCalls || []) {
          toolCalls.push({
            toolName: call.toolName,
            args: call.args,
          });
        }
      }
    }

    return { text: result.text || null, toolCalls };
  } catch (error) {
    console.warn('[PromoShareAgent] LLM polish skipped:', error.message);
    return { text: null, toolCalls: [] };
  }
}

async function gatherGroundTruth(role, params, userContext) {
  const location = params.location || userContext.location || '';
  const [standing, momentPack, poolPack] = await Promise.all([
    inspectStanding(userContext.userId),
    findEligibleMoments({ location, limit: 6 }),
    [ROLES.PARTICIPANT, ROLES.CREATOR].includes(role)
      ? Promise.resolve({ pools: [] })
      : inspectPools({ role, organizationId: params.organizationId || userContext.organizationId }),
  ]);

  return {
    standing,
    moments: momentPack.moments || [],
    pools: poolPack.pools || [],
    location,
    userName: userContext.userName || userContext.displayName || '',
    outcome: params.objective || params.outcome || '',
    budgetGems: params.budgetGems ? Number(params.budgetGems) : undefined,
    targetCount: params.targetCount ? Number(params.targetCount) : undefined,
  };
}

async function runPromoShareOperator(params = {}, userContext = {}) {
  const startTime = Date.now();
  const role = resolvePromoShareRole(params.role || userContext.activeRole, userContext.userType);
  const tools = createPromoShareTools({
    ...userContext,
    activeRole: role,
    location: params.location || userContext.location,
  });

  const ground = await gatherGroundTruth(role, params, userContext);
  const brief = compileBrief(role, ground);
  const polish = await maybePolishBrief(brief, role, params, tools);

  if (polish.text) {
    brief.operatorNote = polish.text;
  }

  const durationMs = Date.now() - startTime;
  const toolCalls = [
    { toolName: 'inspectMyStanding', args: { userId: userContext.userId }, result: { cycleCount: ground.standing?.cycles?.length || 0 } },
    { toolName: 'findEligibleMoments', args: { location: ground.location }, result: { count: ground.moments.length } },
    ...polish.toolCalls,
  ];

  const trace = await agentTraceService.recordTrace({
    agentName: `promorang-promoshare-${role}`,
    userId: userContext.userId || null,
    organizationId: params.organizationId || userContext.organizationId || null,
    objectiveInput: { role, objective: params.objective || null, location: ground.location },
    toolCalls,
    durationMs,
    status: 'success',
  });

  return {
    success: true,
    role,
    brief,
    llmResponse: polish.text,
    traceId: trace.id,
    durationMs,
    boundaries: brief.boundaries,
  };
}

async function runPromoShareShareDraft(params = {}, userContext = {}) {
  const { moments } = await findEligibleMoments({
    location: params.location || userContext.location,
    limit: 6,
  });
  const moment = moments.find((item) => item.id === params.momentId || item.slug === params.momentId)
    || moments[0]
    || { name: params.momentName, title: params.momentName, location: params.location };

  const draft = buildShareDraft({
    moment,
    userName: userContext.userName || userContext.displayName,
    location: params.location || userContext.location,
    cycleName: params.cycleName,
  });

  await agentTraceService.recordTrace({
    agentName: 'promorang-promoshare-share-draft',
    userId: userContext.userId || null,
    objectiveInput: { momentId: moment?.id || null },
    toolCalls: [{ toolName: 'draftShare', args: { momentId: moment?.id }, result: { posted: false } }],
    status: 'success',
  });

  return { success: true, draft };
}

async function runPromoSharePoolDraft(params = {}, userContext = {}) {
  const role = resolvePromoShareRole(params.role || userContext.activeRole, userContext.userType);
  if (![ROLES.SPONSOR, ROLES.ADMIN, ROLES.STEWARD].includes(role)) {
    const error = new Error('Only sponsors, stewards, and admins can draft pots.');
    error.code = 'FORBIDDEN_ROLE';
    throw error;
  }

  if (!params.outcome || String(params.outcome).trim().length < 5) {
    const error = new Error('Outcome statement of at least 5 characters is required.');
    error.code = 'INVALID_OUTCOME';
    throw error;
  }

  const draft = compilePoolDraftFromOutcome(params.outcome, {
    location: params.location,
    budgetGems: params.budgetGems ? Number(params.budgetGems) : undefined,
    targetCount: params.targetCount ? Number(params.targetCount) : undefined,
  });

  await agentTraceService.recordTrace({
    agentName: 'promorang-promoshare-pool-draft',
    userId: userContext.userId || null,
    organizationId: params.organizationId || userContext.organizationId || null,
    objectiveInput: { outcome: params.outcome, role },
    toolCalls: [{ toolName: 'draftPoolFromOutcome', args: { outcome: params.outcome }, result: { status: 'draft', funded: false } }],
    resultingDraftId: null,
    status: 'success',
  });

  return { success: true, role, draft };
}

async function runPromoShareHandoff(params = {}, userContext = {}) {
  const startTime = Date.now();
  const role = resolvePromoShareRole(params.role || userContext.activeRole, userContext.userType);
  const tools = createPromoShareTools({
    ...userContext,
    activeRole: role,
    location: params.location || userContext.location,
  });

  const ground = await gatherGroundTruth(role, params, userContext);
  const brief = role === ROLES.PARTICIPANT
    ? compileHandoffBrief({
        ...ground,
        lastAction: params.lastAction,
        momentId: params.momentId,
        momentName: params.momentName,
      })
    : compileBrief(role, ground);

  const polish = await maybePolishBrief(brief, role, params, tools);
  if (polish.text) {
    brief.operatorNote = polish.text;
  }

  const durationMs = Date.now() - startTime;
  const toolCalls = [
    { toolName: 'inspectMyStanding', args: { userId: userContext.userId }, result: { cycleCount: ground.standing?.cycles?.length || 0 } },
    { toolName: 'findEligibleMoments', args: { location: ground.location }, result: { count: ground.moments.length } },
    ...polish.toolCalls,
  ];

  const trace = await agentTraceService.recordTrace({
    agentName: 'promorang-promoshare-handoff',
    userId: userContext.userId || null,
    organizationId: params.organizationId || userContext.organizationId || null,
    objectiveInput: {
      role,
      lastAction: params.lastAction || null,
      momentId: params.momentId || null,
    },
    toolCalls,
    durationMs,
    status: 'success',
  });

  return {
    success: true,
    role,
    brief,
    llmResponse: polish.text,
    traceId: trace.id,
    durationMs,
    boundaries: brief.boundaries,
  };
}

module.exports = {
  SYSTEM_PROMPT,
  runPromoShareOperator,
  runPromoShareShareDraft,
  runPromoSharePoolDraft,
  runPromoShareHandoff,
};
