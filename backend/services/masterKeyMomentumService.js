const { supabase: serviceSupabase } = require('../lib/supabase');

const supabase = global.supabase || serviceSupabase || null;
const WINDOW_DAYS = 30;
const ACTIVE_MOMENTUM = 40;
const COOLING_MOMENTUM = 20;
const QUALIFICATION_CREDITS = 100;
const REQUIRED_CATEGORIES = 4;
const REQUIRED_VERIFIED_MOVES = 3;
const REQUIRED_DOWNSTREAM_ACTIONS = 1;

const ACTION_POLICY = {
  DISCOVERY_RESPONSE: { credits: 2, momentum: 2, category: 'discovery' },
  discovery_vote: { credits: 2, momentum: 2, category: 'discovery' },
  CONTENT_POST: { credits: 5, momentum: 5, category: 'content' },
  share_completed: { credits: 3, momentum: 3, category: 'distribution' },
  MOMENT_ATTENDANCE: { credits: 10, momentum: 10, category: 'movement', verified: true },
  moment_join_verified: { credits: 10, momentum: 10, category: 'movement', verified: true },
  proof_verified: { credits: 10, momentum: 10, category: 'proof', verified: true },
  MERCHANT_VISIT: { credits: 10, momentum: 10, category: 'commerce', verified: true },
  PURCHASE: { credits: 15, momentum: 10, category: 'commerce', verified: true },
  order_paid: { credits: 15, momentum: 10, category: 'commerce', verified: true },
  PERK_REDEMPTION: { credits: 10, momentum: 10, category: 'commerce', verified: true },
  coupon_redeemed: { credits: 10, momentum: 10, category: 'commerce', verified: true },
  REFERRAL: { credits: 10, momentum: 10, category: 'referral', verified: true, downstream: true },
  referral_activated: { credits: 10, momentum: 10, category: 'referral', verified: true, downstream: true },
  CONTRIBUTOR_REWARD: { credits: 15, momentum: 8, category: 'distribution', verified: true, downstream: true },
  challenge_completed: { credits: 10, momentum: 10, category: 'challenge', verified: true },
  gig_completed: { credits: 15, momentum: 15, category: 'work', verified: true },
};

function policyFor(actionType) {
  const type = String(actionType || '');
  if (ACTION_POLICY[type]) return ACTION_POLICY[type];
  if (type.startsWith('organic_')) return { credits: 1, momentum: 1, category: 'content' };
  return null;
}

function happenedAt(row) {
  return row.created_at || null;
}

function sourceKey(row) {
  return row.id || [row.action_type, row.source_id, happenedAt(row)].filter(Boolean).join(':');
}

function summarize(rows = [], now = new Date()) {
  const cutoff = now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const seen = new Set();
  const categories = new Set();
  let qualificationCredits = 0;
  let verifiedMoves = 0;
  let downstreamActions = 0;
  let momentum = 0;

  for (const row of rows) {
    const policy = policyFor(row.action_type);
    if (!policy) continue;
    const key = sourceKey(row);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);

    qualificationCredits += policy.credits;
    categories.add(policy.category);
    if (policy.verified) verifiedMoves += 1;
    if (policy.downstream) downstreamActions += 1;

    const at = happenedAt(row);
    const timestamp = at ? Date.parse(at) : NaN;
    if (Number.isFinite(timestamp) && timestamp >= cutoff) momentum += policy.momentum;
  }

  const earned = qualificationCredits >= QUALIFICATION_CREDITS
    && categories.size >= REQUIRED_CATEGORIES
    && verifiedMoves >= REQUIRED_VERIFIED_MOVES
    && downstreamActions >= REQUIRED_DOWNSTREAM_ACTIONS;
  const status = !earned
    ? (qualificationCredits || categories.size || verifiedMoves || downstreamActions ? 'qualifying' : 'locked')
    : momentum >= ACTIVE_MOMENTUM
      ? 'active'
      : momentum >= COOLING_MOMENTUM
        ? 'cooling'
        : 'dormant';

  return {
    earned,
    status,
    qualificationCredits,
    behaviourCategories: categories.size,
    verifiedMoves,
    downstreamActions,
    momentum,
    windowDays: WINDOW_DAYS,
    activeMomentum: ACTIVE_MOMENTUM,
    coolingMomentum: COOLING_MOMENTUM,
  };
}

async function getStatus(userId) {
  if (!supabase) return null;
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('verified_actions')
    .select('id, action_type, source_id, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return summarize(data || []);
}

module.exports = {
  WINDOW_DAYS,
  ACTIVE_MOMENTUM,
  COOLING_MOMENTUM,
  ACTION_POLICY,
  policyFor,
  summarize,
  getStatus,
};
