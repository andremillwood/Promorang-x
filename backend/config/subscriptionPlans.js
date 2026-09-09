const { normalizeCreatorTier } = require('../constants/pricing');

const SUBSCRIPTION_PLANS = Object.freeze({
  PROFESSIONAL: {
    role: 'participant',
    label: 'Professional',
    economyTier: 'professional',
    priceEnv: 'STRIPE_PRICE_PROFESSIONAL',
    priceEnvFallbacks: ['STRIPE_PRICE_PRO', 'STRIPE_PRICE_PLUS'],
  },
  POWER_USER: {
    role: 'participant',
    label: 'Power User',
    economyTier: 'power_user',
    priceEnv: 'STRIPE_PRICE_POWER_USER',
    priceEnvFallbacks: ['STRIPE_PRICE_ELITE'],
  },
  PLUS: {
    role: 'participant',
    label: 'Professional',
    economyTier: 'professional',
    priceEnv: 'STRIPE_PRICE_PLUS',
    priceEnvFallbacks: ['STRIPE_PRICE_PROFESSIONAL', 'STRIPE_PRICE_PRO'],
  },
  PRO: {
    role: 'participant',
    label: 'Professional',
    economyTier: 'professional',
    priceEnv: 'STRIPE_PRICE_PRO',
    priceEnvFallbacks: ['STRIPE_PRICE_PROFESSIONAL', 'STRIPE_PRICE_PLUS'],
  },
  ELITE: {
    role: 'participant',
    label: 'Power User',
    economyTier: 'power_user',
    priceEnv: 'STRIPE_PRICE_ELITE',
    priceEnvFallbacks: ['STRIPE_PRICE_POWER_USER'],
  },
  HOST_PRO: { role: 'host', label: 'Host Pro', priceEnv: 'STRIPE_PRICE_HOST_PRO' },
  MERCHANT_GROWTH: { role: 'merchant', label: 'Merchant Growth', priceEnv: 'STRIPE_PRICE_MERCHANT_GROWTH' },
  BRAND_STUDIO: { role: 'brand', label: 'Brand Studio', priceEnv: 'STRIPE_PRICE_BRAND_STUDIO' },
});

const PLAN_ALIASES = Object.freeze({
  STARTER: null,
  FREE: null,
  PROFESSIONAL: 'PROFESSIONAL',
  POWER_USER: 'POWER_USER',
  POWER: 'POWER_USER',
  PLUS: 'PLUS',
  PRO: 'PRO',
  ELITE: 'ELITE',
  HOST_PRO: 'HOST_PRO',
  MERCHANT_GROWTH: 'MERCHANT_GROWTH',
  BRAND_STUDIO: 'BRAND_STUDIO',
});

function normalizePlanKey(planId) {
  return String(planId || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function getSubscriptionPlan(planId) {
  const key = PLAN_ALIASES[normalizePlanKey(planId)] || normalizePlanKey(planId);
  return SUBSCRIPTION_PLANS[key] || null;
}

function getSubscriptionPriceId(planId, env = process.env) {
  const plan = typeof planId === 'object' && planId ? planId : getSubscriptionPlan(planId);
  if (!plan) return null;
  const candidates = [plan.priceEnv, ...(plan.priceEnvFallbacks || [])];
  for (const name of candidates) {
    if (name && env[name]) return env[name];
  }
  return null;
}

function getParticipantEconomyTierForPlan(planId) {
  const plan = getSubscriptionPlan(planId);
  if (plan?.economyTier) return plan.economyTier;
  return normalizeCreatorTier(planId);
}

module.exports = {
  SUBSCRIPTION_PLANS,
  getParticipantEconomyTierForPlan,
  getSubscriptionPlan,
  getSubscriptionPriceId,
};
