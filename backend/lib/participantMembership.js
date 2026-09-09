const { getCreatorTier } = require('../constants/pricing');

const WITHDRAWAL_LOCKED_MESSAGE = 'Professional membership is required to withdraw earnings.';
const SKIP_GEM_CEILING_SOURCES = new Set([
  'purchase',
  'trade',
  'withdrawal',
  'withdrawal_refund',
  'refund',
]);

function asSingleRow(data) {
  if (!data) return null;
  return Array.isArray(data) ? data[0] || null : data;
}

async function resolveUserParticipantTier(supabase, userId) {
  if (supabase && userId) {
    try {
      const { data } = await supabase
        .rpc('get_effective_participant_tier', { p_user_id: userId })
        .maybeSingle();
      const row = asSingleRow(data);
      if (row?.tier_key) {
        return getCreatorTier(row.tier_key);
      }
    } catch (_error) {
      // Fall through to user row / starter.
    }

    try {
      const { data: user } = await supabase
        .from('users')
        .select('user_tier, plan_id')
        .eq('id', userId)
        .maybeSingle();
      if (user?.user_tier || user?.plan_id) {
        return getCreatorTier(user.user_tier || user.plan_id);
      }
    } catch (_error) {
      // Fall through to starter.
    }
  }

  return getCreatorTier('starter');
}

function assertWithdrawalsEnabled(tier) {
  if (!tier?.constraints?.withdrawalsEnabled) {
    const error = new Error(WITHDRAWAL_LOCKED_MESSAGE);
    error.code = 'WITHDRAWALS_LOCKED';
    throw error;
  }
}

async function applyMonthlyGemCeiling(supabase, userId, amount, source) {
  const requested = Number(amount) || 0;
  if (requested <= 0) return 0;
  if (SKIP_GEM_CEILING_SOURCES.has(source)) return requested;

  const tier = await resolveUserParticipantTier(supabase, userId);
  const ceiling = tier.constraints.monthlyGemCeiling;
  if (ceiling == null) return requested;
  if (!supabase) return requested;

  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('gems_transactions')
    .select('amount, transaction_type')
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .gt('amount', 0);

  if (error) throw error;

  const earned = (data || [])
    .filter((row) => !SKIP_GEM_CEILING_SOURCES.has(row.transaction_type))
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const remaining = Math.max(0, Number(ceiling) - earned);
  if (remaining <= 0) {
    const ceilingError = new Error(
      `Starter monthly Gem ceiling of ${ceiling} reached. Upgrade to Professional to keep earning past the cap.`
    );
    ceilingError.code = 'GEM_CEILING_REACHED';
    throw ceilingError;
  }

  return Math.min(requested, remaining);
}

function serializeParticipantMembership(tier, extras = {}) {
  return {
    id: tier.id,
    name: tier.name,
    price: tier.price,
    pointsMultiplier: tier.constraints.pointsMultiplier,
    dailyMasterKeyProofs: tier.constraints.dailyMasterKeyProofs,
    monthlyGemCeiling: tier.constraints.monthlyGemCeiling,
    withdrawalsEnabled: Boolean(tier.constraints.withdrawalsEnabled),
    gemAllowance: tier.constraints.gemAllowance || 0,
    checkoutPlanId: tier.price > 0 ? tier.id : null,
    ...extras,
  };
}

module.exports = {
  WITHDRAWAL_LOCKED_MESSAGE,
  applyMonthlyGemCeiling,
  assertWithdrawalsEnabled,
  resolveUserParticipantTier,
  serializeParticipantMembership,
};
