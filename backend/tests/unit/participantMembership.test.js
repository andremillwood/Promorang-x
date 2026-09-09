const { getCreatorTier } = require('../../constants/pricing');
const {
  WITHDRAWAL_LOCKED_MESSAGE,
  applyMonthlyGemCeiling,
  assertWithdrawalsEnabled,
} = require('../../lib/participantMembership');

describe('participant membership gates', () => {
  test('blocks starter withdrawals and allows Professional', () => {
    expect(() => assertWithdrawalsEnabled(getCreatorTier('starter'))).toThrow(WITHDRAWAL_LOCKED_MESSAGE);
    expect(() => assertWithdrawalsEnabled(getCreatorTier('professional'))).not.toThrow();
    expect(() => assertWithdrawalsEnabled(getCreatorTier('plus'))).not.toThrow();
  });

  test('caps unfunded Gem credits on Starter', async () => {
    const supabase = {
      rpc: () => ({
        maybeSingle: async () => ({ data: { tier_key: 'starter' } }),
      }),
      from: () => ({
        select: () => ({
          eq: () => ({
            gte: () => ({
              gt: async () => ({ data: [{ amount: 290, transaction_type: 'bonus' }] }),
            }),
          }),
        }),
      }),
    };

    await expect(applyMonthlyGemCeiling(supabase, 'user-1', 20, 'bonus')).resolves.toBe(10);
    await expect(applyMonthlyGemCeiling(supabase, 'user-1', 20, 'purchase')).resolves.toBe(20);
  });
});
