const {
  CREATOR_TIERS,
  getCreatorTier,
  normalizeCreatorTier,
} = require('../../constants/pricing');

describe('participant economy authority', () => {
  test('preserves subscription earning boosts and daily Master Key work', () => {
    expect(CREATOR_TIERS.starter.constraints).toMatchObject({
      pointsMultiplier: 1,
      dailyMasterKeyProofs: 5,
      withdrawalsEnabled: false,
      monthlyGemCeiling: 300,
    });
    expect(CREATOR_TIERS.professional).toMatchObject({ price: 10 });
    expect(CREATOR_TIERS.professional.constraints).toMatchObject({
      pointsMultiplier: 1.5,
      dailyMasterKeyProofs: 2,
      withdrawalsEnabled: true,
      monthlyGemCeiling: null,
    });
    expect(CREATOR_TIERS.power_user).toMatchObject({ price: 30 });
    expect(CREATOR_TIERS.power_user.constraints).toMatchObject({
      pointsMultiplier: 2,
      dailyMasterKeyProofs: 1,
      withdrawalsEnabled: true,
    });
  });

  test.each([
    ['free', 'starter'],
    ['premium', 'professional'],
    ['pro', 'professional'],
    ['super', 'power_user'],
    ['elite', 'power_user'],
    ['PLUS', 'professional'],
    ['power-user', 'power_user'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeCreatorTier(input)).toBe(expected);
    expect(getCreatorTier(input).id).toBe(expected);
  });
});
