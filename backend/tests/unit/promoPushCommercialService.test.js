const {
  normalizePromoPushCommercialInput,
  validatePromoPushCommercialInput,
  isPaidPushMode,
} = require('../../services/promoPushCommercialService');

test('a truthful organic awareness push can launch without promised inventory', () => {
  const input = normalizePromoPushCommercialInput({
    objective_type: 'awareness',
    push_mode: 'organic',
    reward_type: 'none',
    fulfillment_kit: { cta: 'See the experience', landing_url: 'https://promorang.co/moments/one' },
  });
  expect(validatePromoPushCommercialInput(input)).toEqual([]);
  expect(isPaidPushMode(input.push_mode)).toBe(false);
});

test('a reward cannot be advertised without connected inventory', () => {
  const input = normalizePromoPushCommercialInput({
    objective_type: 'ticket_sales',
    push_mode: 'people',
    reward_type: 'ticket',
    fulfillment_kit: { cta: 'Get my pass', landing_url: '/moments/one' },
  });
  expect(validatePromoPushCommercialInput(input)).toContain('Connect reward inventory before launch');
});

test('paid distribution modes are distinguished from organic distribution', () => {
  expect(isPaidPushMode('geo')).toBe(true);
  expect(isPaidPushMode('people')).toBe(true);
  expect(isPaidPushMode('live')).toBe(true);
  expect(isPaidPushMode('full')).toBe(true);
});
