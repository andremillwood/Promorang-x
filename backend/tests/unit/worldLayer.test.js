const {
  resolveWorldConsequence,
  resolvePathEvidence,
  resolveCrewRunProgress,
  resolveSceneHealth,
  resolveFaction,
  resolveGuildReadiness,
  resolveTerritoryStanding,
  resolveFactionContest,
  resolveCurrentStatic,
  SHOW_UP_ACTION_TYPES,
  PATH_EVIDENCE_THRESHOLD,
} = require('../../services/worldLayer');

describe('world layer presentation', () => {
  test('pending proof is never celebrated as complete', () => {
    const receipt = resolveWorldConsequence({
      verified: false,
      pending: true,
      momentTitle: 'AftrHrs',
      placeName: 'Sea Deck',
    });
    expect(receipt.counted).toBe(false);
    expect(receipt.heading).toBe('We received it');
    expect(receipt.kept).toBeNull();
  });

  test('verified show-up lists only supplied returns', () => {
    const receipt = resolveWorldConsequence({
      verified: true,
      momentTitle: 'AftrHrs',
      placeName: 'Sea Deck',
      sceneTitle: 'Kingston After Dark',
      promoCardEligible: true,
      promoCardReturnLabel: 'PromoCard · eligible refill',
      memoryKept: true,
      memoryTitle: 'First Current Memory',
    });
    expect(receipt.counted).toBe(true);
    expect(receipt.heading).toBe('You showed up');
    expect(receipt.lines.some((line) => line.label === 'What came back')).toBe(true);
    expect(receipt.kept.title).toBe('First Current Memory');
    expect(receipt.pictures.length).toBeGreaterThan(0);
  });

  test('receipts keep live Moment and Place photos', () => {
    const receipt = resolveWorldConsequence({
      verified: true,
      momentTitle: 'AftrHrs',
      placeName: 'Sea Deck, Barbican',
      momentImageUrl: 'https://cdn.promorang.test/aftrhrs.jpg',
      placeImageUrl: 'https://cdn.promorang.test/seadeck.jpg',
    });
    expect(receipt.pictures.map((picture) => picture.kind)).toEqual(['moment', 'place']);
    expect(receipt.pictures[0].url).toBe('https://cdn.promorang.test/aftrhrs.jpg');
  });

  test('path titles stay hidden until evidence threshold', () => {
    const early = resolvePathEvidence([{ actionType: 'check_in' }, { actionType: 'check_in' }]);
    expect(early.forming).toBe(false);
    expect(early.title).toBeNull();

    const forming = resolvePathEvidence(
      Array.from({ length: PATH_EVIDENCE_THRESHOLD }, () => ({ actionType: 'referral_activated' })),
    );
    expect(forming.forming).toBe(true);
    expect(forming.title).toBe('Connector');
  });

  test('Crew Run counts only matching verified actions', () => {
    const progress = resolveCrewRunProgress([
      { actionType: 'MOMENT_ATTENDANCE', memoryKept: true },
    ]);
    expect(progress.completed).toBe(2);
    expect(progress.objectives.find((item) => item.key === 'bring_newcomer').complete).toBe(false);
  });

  test('show-up types stay explicit so referrals cannot mint a presence receipt', () => {
    expect(SHOW_UP_ACTION_TYPES).toEqual(expect.arrayContaining(['MOMENT_ATTENDANCE', 'check_in']));
    expect(SHOW_UP_ACTION_TYPES).not.toEqual(expect.arrayContaining(['FRIEND_INVITE']));
  });

  test('scene health and factions stay optional and evidence-backed', () => {
    expect(resolveFaction(null)).toBeNull();
    const health = resolveSceneHealth([{ actionType: 'check_in' }, { actionType: 'PURCHASE' }]);
    expect(health.find((item) => item.dimension === 'memory').count).toBe(1);
    expect(health.find((item) => item.dimension === 'sustainability').count).toBe(1);
  });

  test('guilds stay a Crew federation and territory stays earned standing', () => {
    expect(resolveGuildReadiness(1).forming).toBe(true);
    expect(resolveTerritoryStanding({ areaKey: 'barbican' }).state).toBe('unknown');
    expect(resolveTerritoryStanding({ areaKey: 'barbican', presenceCount: 3 }).state).toBe('held');
  });

  test('faction contest is Current versus Static', () => {
    const contest = resolveFactionContest({ factionCurrents: { keepers: 3 } });
    expect(contest.leadingCurrent).toBe('keepers');
    expect(contest.contestLine).toMatch(/Current versus Static/);
    expect(resolveFactionContest().contestLine).not.toMatch(/philosophy|faction/i);
    expect(resolveCurrentStatic({ currentCount: 0 }).polarity).toBe('static');
  });
});
