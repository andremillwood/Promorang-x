const {
  CHALLENGE_TEMPLATES,
  HOUSE_SWITCH_LEAD,
  PLACE_INFLUENCE_MIN,
  resolveElementalModifier,
  resolveHouseAssignment,
  resolveInfluence,
  resolvePlaceHouseShare,
  resolveReputation,
  resolveResonance,
  resolveReturnChain,
  resolveSecretReveal,
  resolveTechniquePermission,
  resolveTitles,
  resolveTraits,
  resolveWorldSystemPhases,
  resolveIdentityCard,
  scoreChallenge,
  worldScoreIsNotMoney,
} = require('../../services/worldSystemV2');

const day = (offset) => new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString();

describe('feature flags', () => {
  test('keeps foundation on and later phases off by default', () => {
    const phases = resolveWorldSystemPhases({});
    expect(phases.foundation).toBe(true);
    expect(phases.identity).toBe(true);
    expect(phases.competition).toBe(false);
    expect(phases.livingWorld).toBe(false);
  });

  test('can hide identity and unlock competition only via env', () => {
    expect(resolveWorldSystemPhases({ WORLD_SYSTEM_IDENTITY: '0' }).identity).toBe(false);
    expect(resolveWorldSystemPhases({ WORLD_SYSTEM_COMPETITION: '1' }).competition).toBe(true);
  });
});

describe('resonance', () => {
  test('gives nothing for login, tap, or scroll', () => {
    const state = resolveResonance([
      { id: '1', actionType: 'login' },
      { id: '2', actionType: 'tap' },
      { id: '3', actionType: 'scroll' },
    ]);
    expect(state.stage).toBe(0);
    expect(state.total).toBe(0);
    expect(state.house).toBeNull();
  });

  test('forms Resonance, then reveals a House only at the threshold', () => {
    const forming = resolveResonance([
      { id: 'a', actionType: 'check_in' },
      { id: 'b', actionType: 'check_in' },
      { id: 'c', actionType: 'check_in' },
    ]);
    expect(forming.stage).toBe(1);
    expect(forming.cue).toBe('A Resonance is forming');
    expect(forming.revealEligible).toBe(false);

    const grove = resolveResonance(
      Array.from({ length: 10 }, (_, index) => ({ id: `g${index}`, actionType: 'PERK_REDEMPTION' })),
    );
    expect(grove.stage).toBe(3);
    expect(grove.houseKey).toBe('grove');
    expect(grove.revealEligible).toBe(true);
  });

  test('does not double-count the same action id', () => {
    const once = resolveResonance([
      { id: 'same', actionType: 'referral_activated' },
      { id: 'same', actionType: 'referral_activated' },
    ]);
    expect(once.scores.water).toBe(2);
  });
});

describe('house assignment', () => {
  test('reveals once and refuses oscillation under the switch lead', () => {
    const first = resolveHouseAssignment({
      currentHouse: null,
      candidate: 'ember',
      revealEligible: true,
    });
    expect(first.revealed).toBe(true);
    expect(first.houseKey).toBe('ember');

    const hold = resolveHouseAssignment({
      currentHouse: 'ember',
      candidate: 'tide',
      revealEligible: true,
      scores: { fire: 10, water: 11, air: 0, earth: 0 },
    });
    expect(hold.switched).toBe(false);
    expect(hold.houseKey).toBe('ember');

    const switchHouse = resolveHouseAssignment({
      currentHouse: 'ember',
      candidate: 'tide',
      revealEligible: true,
      scores: { fire: 10, water: 10 + HOUSE_SWITCH_LEAD, air: 0, earth: 0 },
    });
    expect(switchHouse.switched).toBe(true);
    expect(switchHouse.houseKey).toBe('tide');
  });
});

describe('influence and reputation', () => {
  test('counts each verified row once and never treats the score as money', () => {
    const influence = resolveInfluence([
      { id: '1', actionType: 'check_in' },
      { id: '1', actionType: 'check_in' },
      { id: '2', actionType: 'PERK_REDEMPTION' },
    ]);
    expect(influence.counted).toBe(2);
    expect(influence.score).toBe(3);
    expect(worldScoreIsNotMoney(influence.score)).toBe(true);
  });

  test('hides Reputation until three fulfilled moves and ignores inactivity', () => {
    const quiet = resolveReputation([]);
    expect(quiet.visible).toBe(false);
    expect(quiet.score).toBeNull();

    const visible = resolveReputation([
      { id: '1', actionType: 'check_in' },
      { id: '2', actionType: 'check_in' },
      { id: '3', actionType: 'PERK_REDEMPTION' },
    ]);
    expect(visible.visible).toBe(true);
    expect(visible.score).toBe(100);
  });
});

describe('return chains', () => {
  test('does not label a lone share as a returned Throw', () => {
    const chain = resolveReturnChain({
      origin: { id: 't1', userId: 'andre', actionType: 'share_completed' },
      downstream: [],
    });
    expect(chain.counted).toBe(false);
  });

  test('attributes downstream verified movement to the origin actor', () => {
    const chain = resolveReturnChain({
      origin: { id: 't1', userId: 'andre', actionType: 'share_completed' },
      downstream: [
        { id: 'd1', actionType: 'check_in', referrerId: 'andre', verifiedAt: day(1) },
        { id: 'd2', actionType: 'PERK_REDEMPTION', referrerId: 'andre', verifiedAt: day(1) },
      ],
    });
    expect(chain.counted).toBe(true);
    expect(chain.heading).toBe('Your Throw returned');
    expect(chain.movements).toBe(2);
    expect(chain.moving).toBe(true);
  });
});

describe('traits and titles', () => {
  test('earns Reliable and Explorer from real history only', () => {
    const traits = resolveTraits([
      { id: '1', actionType: 'check_in', placeId: 'a', verifiedAt: day(1) },
      { id: '2', actionType: 'check_in', placeId: 'b', verifiedAt: day(1) },
      { id: '3', actionType: 'check_in', placeId: 'c', verifiedAt: day(1) },
    ]);
    expect(traits.map((trait) => trait.key)).toEqual(expect.arrayContaining(['reliable', 'explorer']));
  });

  test('does not invent titles without criteria', () => {
    expect(resolveTitles({}).length).toBe(0);
    expect(resolveTitles({ pathTitle: 'Patron' }).map((title) => title.key)).toContain('merchant_ally');
  });
});

describe('techniques, challenges, place influence, secrets', () => {
  test('blocks Techniques until the phase and House match', () => {
    const blocked = resolveTechniquePermission({
      technique: 'ignite',
      houseKey: 'ember',
      runObjectivesComplete: 1,
      phases: resolveWorldSystemPhases({}),
    });
    expect(blocked.allowed).toBe(false);

    const allowed = resolveTechniquePermission({
      technique: 'ignite',
      houseKey: 'ember',
      runObjectivesComplete: 1,
      phases: resolveWorldSystemPhases({ WORLD_SYSTEM_COMPETITION: '1' }),
    });
    expect(allowed.allowed).toBe(true);
  });

  test('does not score Challenges while competition is flagged off', () => {
    const quiet = scoreChallenge({
      template: 'merchant_rally',
      actions: [{ id: '1', actionType: 'PERK_REDEMPTION' }],
      phases: resolveWorldSystemPhases({}),
    });
    expect(quiet.eligible).toBe(false);
    expect(quiet.score).toBe(0);
    expect(CHALLENGE_TEMPLATES.merchant_rally.proof).toContain('redemption');
  });

  test('hides Place House share until enough real evidence and applies decay', () => {
    const hidden = resolvePlaceHouseShare(
      Array.from({ length: PLACE_INFLUENCE_MIN - 1 }, (_, index) => ({
        id: `p${index}`,
        houseKey: 'grove',
        verifiedAt: day(1),
      })),
    );
    expect(hidden.visible).toBe(false);

    const visible = resolvePlaceHouseShare([
      ...Array.from({ length: 4 }, (_, index) => ({ id: `g${index}`, houseKey: 'grove', verifiedAt: day(1) })),
      { id: 'e1', houseKey: 'ember', verifiedAt: day(1) },
      { id: 'old', houseKey: 'tide', verifiedAt: day(50) },
    ]);
    expect(visible.visible).toBe(true);
    expect(visible.shares[0].house).toBe('grove');
    expect(visible.shares.some((row) => row.house === 'tide')).toBe(false);
  });

  test('never hides a Secret after money or Gems were committed', () => {
    const secret = resolveSecretReveal({
      committedMoneyOrGems: true,
      qualified: false,
      hiddenLabel: 'Something is happening Thursday.',
      revealedLabel: 'Location revealed.',
    });
    expect(secret.revealed).toBe(true);
    expect(secret.label).toBe('Location revealed.');
  });

  test('keeps elemental modifiers small', () => {
    expect(resolveElementalModifier('fire', 'water')).toBe(0.05);
    expect(resolveElementalModifier('fire', 'fire')).toBe(0);
  });
});

describe('identity card', () => {
  test('does not put House on the card before reveal when identity is on', () => {
    const resonance = resolveResonance([
      { id: '1', actionType: 'check_in' },
      { id: '2', actionType: 'check_in' },
      { id: '3', actionType: 'check_in' },
    ]);
    const card = resolveIdentityCard({
      resonance,
      pathTitle: null,
      phases: { foundation: true, identity: true, competition: false, livingWorld: false, distribution: false, endgame: false },
    });
    expect(card.house).toBeNull();
    expect(card.line).toBe('A Resonance is forming');
  });
});
