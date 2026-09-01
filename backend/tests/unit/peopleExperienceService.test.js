const {
  classifyExperienceRole,
  contributorValueScore,
  happenedBuckets,
  classifyHappenedBucket,
  attributionFromMetadata,
  accountStakeholderOutcomes,
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

  test('reads existing live action types without new columns', () => {
    expect(classifyHappenedBucket('moment_join_verified')).toBe('went');
    expect(classifyHappenedBucket('proof_verified')).toBe('went');
    expect(classifyHappenedBucket('deal_claimed')).toBe('claimed');
    expect(classifyHappenedBucket('referral_activated')).toBe('brought');
    expect(classifyHappenedBucket('organic_repost')).toBe('shared');
    expect(happenedBuckets([
      { action_type: 'moment_join_verified' },
      { action_type: 'deal_claimed' },
      { action_type: 'referral_activated' },
      { action_type: 'PERK_REDEMPTION' },
    ])).toMatchObject({ went: 1, claimed: 1, brought: 1, used: 1 });
  });

  test('slices one ledger by stakeholder instead of inventing new economies', () => {
    const member = accountStakeholderOutcomes({
      role: 'member',
      cardPerks: 2,
      memberships: 1,
      buckets: { claimed: 2, used: 1 },
    });
    expect(member.cards.map((card) => card.key)).toEqual(['cardPerks', 'memberships']);
    expect(member.ledger.used).toBe(1);

    const merchant = accountStakeholderOutcomes({
      role: 'contributor',
      platformRoles: ['merchant'],
      people: 12,
      perksGiven: 3,
      perksClaimed: 8,
      perksUsed: 2,
    });
    expect(merchant.suppliesInventory).toBe(true);
    expect(merchant.cards.some((card) => card.key === 'perksUsed')).toBe(true);
    expect(merchant.cards.some((card) => card.key === 'people')).toBe(true);
  });

  test('inventory for others is an opportunity, not a personal drop', () => {
    expect(typeof require('../../services/peopleExperienceService').provideInventory).toBe('function');
  });

  test('copies attribution from existing metadata keys', () => {
    expect(attributionFromMetadata({
      sceneId: 'scene-1',
      invited_by_user_id: 'host-9',
      referrer_id: 'ref-3',
      moment_id: 'moment-4',
      amount: '12',
    })).toMatchObject({
      scene_id: 'scene-1',
      contributor_id: 'host-9',
      referrer_id: 'ref-3',
      moment_id: 'moment-4',
      amount: 12,
    });
  });
});
