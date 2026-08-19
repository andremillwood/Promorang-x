const masterKeyService = require('../../services/masterKeyService');

describe('daily Master Key service', () => {
  test('uses the Jamaica platform day around UTC midnight', () => {
    expect(masterKeyService.getPlatformDay(new Date('2026-07-15T03:00:00.000Z'))).toBe('2026-07-14');
    expect(masterKeyService.getPlatformDay(new Date('2026-07-15T06:00:00.000Z'))).toBe('2026-07-15');
  });

  test('expires at the next Jamaica midnight', () => {
    expect(masterKeyService.getPlatformDayExpiry('2026-07-14')).toBe('2026-07-15T05:00:00.000Z');
  });

  test('only explicitly free contribution Proofs are eligible', () => {
    expect(masterKeyService.isEligibleFreeProof({ master_key_eligible: true })).toBe(true);
    expect(masterKeyService.isEligibleFreeProof({ is_free_proof: true })).toBe(true);
    expect(masterKeyService.isEligibleFreeProof({ proof_economy: 'free_contribution' })).toBe(true);
    expect(masterKeyService.isEligibleFreeProof({ proof_verified: true })).toBe(false);
    expect(masterKeyService.isEligibleFreeProof({ gem_reward: 20 })).toBe(false);
  });
});
