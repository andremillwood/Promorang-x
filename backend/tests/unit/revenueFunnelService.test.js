const service = require('../../services/revenueFunnelService');

describe('revenueFunnelService validation', () => {
  test('accepts a canonical revenue event', () => {
    expect(() => service.validateEvent({
      funnel: 'membership',
      stage: 'checkout_started',
      amount: 9.99,
    })).not.toThrow();
  });

  test('rejects unknown funnels and stages', () => {
    expect(() => service.validateEvent({ funnel: 'mystery', stage: 'captured' })).toThrow();
    expect(() => service.validateEvent({ funnel: 'gems', stage: 'clicked-ish' })).toThrow();
  });

  test('rejects negative revenue amounts', () => {
    expect(() => service.validateEvent({
      funnel: 'marketplace',
      stage: 'payment_succeeded',
      amount: -1,
    })).toThrow('non-negative');
  });
});
