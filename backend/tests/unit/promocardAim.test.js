const { inferPromoCardAimFromText, resolvePromoCardAim, sortBenefitsByAim } = require('../../lib/promocardAim');

test('resolves the four customer aims', () => {
  expect(resolvePromoCardAim('Kingston After Dark').id).toBe('kingston-after-dark');
  expect(resolvePromoCardAim('food').label).toBe('Food');
  expect(resolvePromoCardAim('wallet')).toBe(null);
  expect(inferPromoCardAimFromText('aim:tonight cocktails after dark').id).toBe('tonight');
});

test('sorts live benefits toward the aimed scene', () => {
  const night = { id: 'n', title: '20% tab after dark', issuer: { name: 'Tracks' } };
  const food = { id: 'f', title: 'Jerk platter', locationLabel: 'Barbican' };
  const aim = resolvePromoCardAim('kingston-after-dark');
  expect(sortBenefitsByAim([food, night], aim)[0].id).toBe('n');
});
