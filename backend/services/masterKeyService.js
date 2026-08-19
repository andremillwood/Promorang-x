const { supabase: serviceSupabase } = require('../lib/supabase');
const { getCreatorTier, normalizeCreatorTier } = require('../constants/pricing');

const supabase = global.supabase || serviceSupabase || null;
const PLATFORM_TIMEZONE = process.env.PLATFORM_TIMEZONE || 'America/Jamaica';

function getPlatformDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PLATFORM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function getPlatformDayExpiry(platformDay) {
  // Jamaica is UTC-05:00 year-round. Keep the offset configurable for deployments
  // while the platform timezone remains the product authority.
  const offset = process.env.PLATFORM_UTC_OFFSET || '-05:00';
  const next = new Date(`${platformDay}T00:00:00${offset}`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

function isEligibleFreeProof(metadata = {}) {
  return metadata.master_key_eligible === true
    || metadata.is_free_proof === true
    || metadata.proof_economy === 'free_contribution';
}

async function getUserTier(userId, suppliedTier) {
  if (suppliedTier) return getCreatorTier(suppliedTier);
  if (!supabase) return getCreatorTier('starter');

  const { data, error } = await supabase
    .from('users')
    .select('user_tier')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return getCreatorTier(data?.user_tier);
}

function presentStatus(progress, tier, platformDay) {
  const required = tier.constraints.dailyMasterKeyProofs;
  const completed = Number(progress?.proofs_completed || 0);
  const expiresAt = progress?.expires_at || getPlatformDayExpiry(platformDay);
  const isActivated = completed >= required && new Date(expiresAt) > new Date();

  return {
    is_activated: isActivated,
    has_master_key: isActivated,
    platform_day: platformDay,
    platform_timezone: PLATFORM_TIMEZONE,
    tier_id: tier.id,
    tier_label: tier.name,
    points_multiplier: tier.constraints.pointsMultiplier,
    proof_drops_completed: completed,
    proof_drops_required: required,
    remaining_proofs: Math.max(0, required - completed),
    activated_at: progress?.activated_at || null,
    expires_at: expiresAt,
    activation_source: 'verified_free_proof',
  };
}

async function getStatus(userId, options = {}) {
  const platformDay = options.platformDay || getPlatformDay();
  const tier = await getUserTier(userId, options.userTier);
  if (!supabase) return presentStatus(null, tier, platformDay);

  const { data, error } = await supabase
    .from('daily_master_key_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('platform_day', platformDay)
    .maybeSingle();
  if (error) throw error;
  return presentStatus(data, tier, platformDay);
}

async function recordVerifiedFreeProof({ userId, sourceType, sourceId, metadata = {}, userTier }) {
  if (!isEligibleFreeProof(metadata)) return { credited: false, reason: 'not_master_key_eligible' };
  if (!supabase) throw new Error('Database not available');

  const platformDay = getPlatformDay();
  const tier = await getUserTier(userId, userTier);
  const { data, error } = await supabase.rpc('credit_daily_master_key_proof', {
    p_user_id: userId,
    p_platform_day: platformDay,
    p_tier_id: normalizeCreatorTier(tier.id),
    p_points_multiplier: tier.constraints.pointsMultiplier,
    p_proofs_required: tier.constraints.dailyMasterKeyProofs,
    p_expires_at: getPlatformDayExpiry(platformDay),
    p_source_type: sourceType,
    p_source_id: String(sourceId),
    p_metadata: metadata,
  });
  if (error) throw error;
  const progress = Array.isArray(data) ? data[0] : data;
  return { credited: true, status: presentStatus(progress, tier, platformDay) };
}

module.exports = {
  PLATFORM_TIMEZONE,
  getPlatformDay,
  getPlatformDayExpiry,
  isEligibleFreeProof,
  getStatus,
  recordVerifiedFreeProof,
};
