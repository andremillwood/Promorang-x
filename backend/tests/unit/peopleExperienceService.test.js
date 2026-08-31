const {
  classifyExperienceRole,
  contributorValueScore,
  happenedBuckets,
} = require('../../services/peopleExperienceService');

describe('people experience role and value rules', () => {
  test('contribution does not require ownership', () => {
    expect(classifyExperienceRole({ operatesHubs: 0, contributorHubs: 2, platformRoles: [] })).toBe('contributor');
    expect(classifyExperienceRole({ operatesHubs: 0, contributorHubs: 0, platformRoles: ['creator'] })).toBe('contributor');
    expect(classifyExperienceRole({ operatesHubs: 1, contributorHubs: 0, platformRoles: [] })).toBe('operator');
    expect(classifyExperienceRole({ operatesHubs: 0, contributorHubs: 0, platformRoles: ['participant'] })).toBe('member');
  });

  test('verified activity outranks empty recruitment', () => {
    const inactiveTree = contributorValueScore({ peopleBrought: 100, activePeople: 0, verifiedActions: 0, attributedValue: 0 });
    const activeTwenty = contributorValueScore({ peopleBrought: 20, activePeople: 18, verifiedActions: 22, attributedValue: 4200 });
    expect(activeTwenty).toBeGreaterThan(inactiveTree);
  });

  test('happened summary stays human and additive', () => {
    const buckets = happenedBuckets([
      { action_type: 'MOMENT_ATTENDANCE' },
      { action_type: 'PURCHASE' },
      { action_type: 'DISCOVERY_RESPONSE' },
      { action_type: 'CONTENT_POST' },
      { action_type: 'FRIEND_INVITE' },
      { action_type: 'PERK_CLAIM' },
    ]);
    expect(buckets).toMatchObject({ went: 1, bought: 1, answered: 1, shared: 1, brought: 1, claimed: 1 });
  });
});
