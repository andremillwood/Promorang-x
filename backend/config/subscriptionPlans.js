const SUBSCRIPTION_PLANS = Object.freeze({
  PLUS: { role: 'participant', label: 'Plus', priceEnv: 'STRIPE_PRICE_PLUS' },
  PRO: { role: 'participant', label: 'Pro', priceEnv: 'STRIPE_PRICE_PRO' },
  ELITE: { role: 'participant', label: 'Elite', priceEnv: 'STRIPE_PRICE_ELITE' },
  HOST_PRO: { role: 'host', label: 'Host Pro', priceEnv: 'STRIPE_PRICE_HOST_PRO' },
  MERCHANT_GROWTH: { role: 'merchant', label: 'Merchant Growth', priceEnv: 'STRIPE_PRICE_MERCHANT_GROWTH' },
  BRAND_STUDIO: { role: 'brand', label: 'Brand Studio', priceEnv: 'STRIPE_PRICE_BRAND_STUDIO' },
});

function getSubscriptionPlan(planId) {
  return SUBSCRIPTION_PLANS[String(planId || '').trim().toUpperCase()] || null;
}

module.exports = { SUBSCRIPTION_PLANS, getSubscriptionPlan };
