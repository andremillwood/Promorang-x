/**
 * Controlled PromoShare tools.
 * Agents never query the database directly. userId always comes from auth context,
 * never from model-supplied arguments.
 */

const { z } = require('zod');
const { supabase } = require('../../lib/supabase');
const promoShareService = require('../../services/promoShareService');
const {
  resolvePromoShareRole,
  compilePoolDraftFromOutcome,
  estimateLiability,
  buildShareDraft,
  ROLES,
} = require('./promoShareBrief');

let tool;
try {
  ({ tool } = require('ai'));
} catch (error) {
  tool = (definition) => ({
    description: definition.description,
    inputSchema: definition.inputSchema || definition.parameters,
    parameters: definition.parameters || definition.inputSchema,
    execute: definition.execute,
  });
}

const DEMO_MOMENTS = [
  {
    id: 'm-kingston-tasting',
    name: 'Thursday New Kingston tasting',
    location: 'New Kingston',
    category: 'dining',
    starts_at: null,
    why: 'A real room tonight. Check-in mints a ticket.',
  },
  {
    id: 'm-harbour-set',
    name: 'Harbour View late set',
    location: 'Kingston',
    category: 'music',
    starts_at: null,
    why: 'Repeat nights raise weight more honestly than a one-off share.',
  },
];

function demoStanding() {
  return {
    source: 'demo',
    cycles: [
      {
        cycle_id: 'demo-weekly',
        cycle_type: 'weekly',
        cycle_name: 'This week’s community pot',
        eligible: false,
        status: 'not_qualified',
        weight: 6,
        total_entries: 2,
        verified_moves: 2,
        moments_joined: 1,
        referrals: 0,
        progress_to_qualify: {
          moves: { current: 2, required: 3, complete: false },
          moments: { current: 1, required: 1, complete: true },
          referrals: { current: 0, required: 1, complete: false },
        },
      },
    ],
    recent_entries: [
      { id: 'e1', source_type: 'moment', source_action: 'check_in', entry_count: 1 },
      { id: 'e2', source_type: 'move', source_action: 'verified_visit', entry_count: 1 },
    ],
  };
}

async function inspectStanding(userId) {
  if (!userId || !supabase) {
    return demoStanding();
  }

  try {
    const dashboard = await promoShareService.getUserDashboardData(userId);
    const cycles = dashboard.user_stats_by_cycle || [];
    if (!cycles.length && Array.isArray(dashboard.draws)) {
      return {
        source: 'draws',
        cycles: dashboard.draws.map((draw) => ({
          cycle_id: draw.id,
          cycle_type: draw.cycle_type,
          cycle_name: `${draw.cycle_type} pot`,
          eligible: (draw.userTickets || 0) > 0,
          status: (draw.userTickets || 0) > 0 ? 'qualified' : 'not_qualified',
          weight: draw.userTickets || 0,
          total_entries: draw.userTickets || 0,
          verified_moves: draw.userTickets || 0,
          moments_joined: 0,
          referrals: 0,
          progress_to_qualify: {
            moves: { current: draw.userTickets || 0, required: 3, complete: (draw.userTickets || 0) >= 3 },
            moments: { current: 0, required: 1, complete: false },
            referrals: { current: 0, required: 1, complete: false },
          },
        })),
        recent_entries: dashboard.recent_entries || [],
      };
    }

    return {
      source: 'live',
      cycles,
      recent_entries: dashboard.recent_entries || [],
      history: dashboard.history || [],
    };
  } catch (error) {
    return { ...demoStanding(), error: error.message };
  }
}

async function findEligibleMoments({ location, limit = 6 } = {}) {
  const fetchLimit = Math.min(limit, 12);

  if (!supabase) {
    return {
      moments: DEMO_MOMENTS.filter((moment) =>
        !location || String(moment.location).toLowerCase().includes(String(location).toLowerCase())
      ).slice(0, fetchLimit),
    };
  }

  try {
    let query = supabase
      .from('moments')
      .select('id, name, title, description, category, location, city, capacity, starts_at, is_active')
      .eq('is_active', true)
      .limit(fetchLimit);

    if (location) {
      query = query.or(`location.ilike.%${location}%,city.ilike.%${location}%,name.ilike.%${location}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const moments = (data || []).map((moment) => ({
      id: moment.id,
      name: moment.name || moment.title,
      title: moment.title || moment.name,
      location: moment.location || moment.city,
      category: moment.category,
      starts_at: moment.starts_at,
      why: 'Verified check-in can mint a PromoShare ticket for matching pots.',
    }));

    return { moments: moments.length ? moments : DEMO_MOMENTS.slice(0, fetchLimit) };
  } catch (error) {
    return { moments: DEMO_MOMENTS.slice(0, fetchLimit), error: error.message };
  }
}

async function inspectPools({ role, organizationId } = {}) {
  if (!supabase) {
    return {
      pools: [
        {
          id: 'pool-kingston-week',
          cycle_name: 'Kingston weekend pot',
          status: 'active',
          cycle_type: 'weekly',
          sponsor_config: { prize_pool: 800 },
          metrics: { qualified_users: 4 },
        },
      ],
    };
  }

  try {
    let query = supabase
      .from('promoshare_cycles')
      .select('id, cycle_name, cycle_type, status, start_at, end_at, sponsor_config, jackpot_amount')
      .eq('status', 'active')
      .limit(20);

    if (organizationId && [ROLES.SPONSOR, ROLES.HOST].includes(role)) {
      query = query.contains('sponsor_config', { organization_id: organizationId });
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      pools: (data || []).map((cycle) => ({
        id: cycle.id,
        cycle_name: cycle.cycle_name,
        cycle_type: cycle.cycle_type,
        status: cycle.status,
        start_at: cycle.start_at,
        end_at: cycle.end_at,
        sponsor_config: cycle.sponsor_config || { prize_pool: cycle.jackpot_amount || 0 },
        metrics: { qualified_users: cycle.sponsor_config?.qualified_users || 0 },
      })),
    };
  } catch (error) {
    return { pools: [], error: error.message };
  }
}

function createPromoShareTools(userContext = {}) {
  const userId = userContext.userId || null;
  const role = resolvePromoShareRole(userContext.activeRole, userContext.userType);
  const location = userContext.location || '';
  const userName = userContext.userName || userContext.displayName || '';

  const inspectMyStandingTool = tool({
    description: 'Read this authenticated person\'s PromoShare standing, tickets, and qualification gaps. Never accepts a different user id.',
    parameters: z.object({}),
    execute: async () => inspectStanding(userId),
  });

  const explainQualificationTool = tool({
    description: 'Explain why this person is or is not in the current pot, in human language. Grounded in standing only.',
    parameters: z.object({}),
    execute: async () => {
      const standing = await inspectStanding(userId);
      return {
        standing,
        rule: 'Eligibility is computed by PromoShare. This tool only explains the existing numbers.',
      };
    },
  });

  const findEligibleMomentsTool = tool({
    description: 'Find live Moments whose verified check-in can mint a PromoShare ticket for this person.',
    parameters: z.object({
      location: z.string().optional().describe('City or hub, e.g. Kingston'),
      limit: z.number().optional().default(6),
    }),
    execute: async ({ location: loc, limit } = {}) =>
      findEligibleMoments({ location: loc || location, limit }),
  });

  const draftShareTool = tool({
    description: 'Draft one attributable share. Does NOT post, notify, or mint tickets.',
    parameters: z.object({
      momentId: z.string().optional(),
      momentName: z.string().optional(),
      momentLocation: z.string().optional(),
    }),
    execute: async ({ momentId, momentName, momentLocation } = {}) => {
      const { moments } = await findEligibleMoments({ location: momentLocation || location, limit: 6 });
      const moment = moments.find((item) => item.id === momentId) || {
        id: momentId || moments[0]?.id,
        name: momentName || moments[0]?.name,
        location: momentLocation || moments[0]?.location,
      };
      return buildShareDraft({
        moment,
        userName,
        location: momentLocation || location,
      });
    },
  });

  const promptCheckInTool = tool({
    description: 'Return the next check-in prompt for a Moment. Does not submit proof.',
    parameters: z.object({
      momentId: z.string().optional(),
    }),
    execute: async ({ momentId } = {}) => {
      const { moments } = await findEligibleMoments({ location, limit: 6 });
      const moment = moments.find((item) => item.id === momentId) || moments[0] || null;
      return {
        submitted: false,
        momentId: moment?.id || null,
        href: moment?.id ? `/moments/${moment.id}/checkin` : '/discover',
        copy: moment
          ? `If you go to ${moment.name}, check in so the ticket counts for today, this week, and the grand pot.`
          : 'When you go, check in. That is what turns a night out into a ticket.',
      };
    },
  });

  const inspectPoolTool = tool({
    description: 'Read live PromoShare pots visible to this role. Sponsors see their own. Stewards and admins see the hub.',
    parameters: z.object({
      organizationId: z.string().optional(),
    }),
    execute: async ({ organizationId } = {}) => {
      if (role === ROLES.PARTICIPANT) {
        return { error: 'Participants see their own standing, not pool operations.' };
      }
      return inspectPools({ role, organizationId: organizationId || userContext.organizationId });
    },
  });

  const estimateLiabilityTool = tool({
    description: 'Estimate capped Gem liability for a funded outcome. Does not charge or lock funds.',
    parameters: z.object({
      budgetGems: z.number().describe('Requested Gem cap'),
      targetCount: z.number().describe('Verified actions the sponsor wants'),
    }),
    execute: async ({ budgetGems, targetCount }) => {
      if (![ROLES.SPONSOR, ROLES.ADMIN, ROLES.STEWARD].includes(role)) {
        return { error: 'Liability estimates are for sponsors, stewards, and admins.' };
      }
      return estimateLiability(budgetGems, targetCount);
    },
  });

  const draftPoolFromOutcomeTool = tool({
    description: 'Compile DRAFT pool rules from an outcome statement. Does not fund, publish, or execute a draw.',
    parameters: z.object({
      outcome: z.string().describe('What the sponsor wants people to do'),
      location: z.string().optional(),
      budgetGems: z.number().optional(),
      targetCount: z.number().optional(),
    }),
    execute: async ({ outcome, location: loc, budgetGems, targetCount }) => {
      if (![ROLES.SPONSOR, ROLES.ADMIN, ROLES.STEWARD].includes(role)) {
        return { error: 'Only sponsors, stewards, and admins can draft pots.' };
      }
      return compilePoolDraftFromOutcome(outcome, {
        location: loc || location,
        budgetGems,
        targetCount,
      });
    },
  });

  const reportCycleFillTool = tool({
    description: 'Report which live pots are thin or unfunded. Steward and admin only.',
    parameters: z.object({
      location: z.string().optional(),
    }),
    execute: async ({ location: loc } = {}) => {
      if (![ROLES.STEWARD, ROLES.ADMIN].includes(role)) {
        return { error: 'Fill reports are for stewards and admins.' };
      }
      const { pools } = await inspectPools({ role });
      const thin = pools.filter((pool) => (pool.metrics?.qualified_users || 0) < 5);
      return {
        location: loc || location || 'network',
        live: pools.length,
        thin: thin.length,
        pools: thin,
        recommendation: thin.length
          ? 'Pitch a merchant a capped pot on a dated night. Do not invent a platform boost first.'
          : 'Pots are filling. Keep platform boosts rare.',
      };
    },
  });

  return {
    inspectMyStanding: inspectMyStandingTool,
    explainQualification: explainQualificationTool,
    findEligibleMoments: findEligibleMomentsTool,
    draftShare: draftShareTool,
    promptCheckIn: promptCheckInTool,
    inspectPool: inspectPoolTool,
    estimateLiability: estimateLiabilityTool,
    draftPoolFromOutcome: draftPoolFromOutcomeTool,
    reportCycleFill: reportCycleFillTool,
  };
}

module.exports = {
  createPromoShareTools,
  inspectStanding,
  findEligibleMoments,
  inspectPools,
  DEMO_MOMENTS,
};
