const {
  getParticipantEconomyTierForPlan,
  getSubscriptionPlan,
  getSubscriptionPriceId,
} = require('../../config/subscriptionPlans');

describe('subscription plan aliases', () => {
  test('maps historical participant SKUs onto the paid ladder', () => {
    expect(getSubscriptionPlan('plus').economyTier).toBe('professional');
    expect(getSubscriptionPlan('PRO').economyTier).toBe('professional');
    expect(getSubscriptionPlan('professional').label).toBe('Professional');
    expect(getSubscriptionPlan('elite').economyTier).toBe('power_user');
    expect(getSubscriptionPlan('power_user').label).toBe('Power User');
    expect(getParticipantEconomyTierForPlan('plus')).toBe('professional');
  });

  test('resolves Stripe price env fallbacks for the canonical plans', () => {
    expect(getSubscriptionPriceId('professional', { STRIPE_PRICE_PRO: 'price_pro' })).toBe('price_pro');
    expect(getSubscriptionPriceId('power_user', { STRIPE_PRICE_ELITE: 'price_elite' })).toBe('price_elite');
    expect(getSubscriptionPriceId('professional', { STRIPE_PRICE_PROFESSIONAL: 'price_canonical' })).toBe('price_canonical');
  });
});
