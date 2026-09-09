const {
  calculatePoints,
  shouldAwardPromoShare,
  isReleaseCampaign,
  releasePaysForAction,
} = require('../../services/contentDistributionService');

const release = {
  objective_type: 'content_launch',
  metadata: { release_kind: 'song' },
  reward_config: {
    base_points: 3,
    points_by_action: { click: 3, share: 9, proof_verified: 9 },
  },
  promoshare_config: {
    enabled: true,
    actions: ['click', 'share', 'proof_verified'],
    entries_per_action: 1,
  },
};

test('content_launch campaigns are Releases', () => {
  expect(isReleaseCampaign(release)).toBe(true);
  expect(isReleaseCampaign({ objective_type: 'engagement' })).toBe(false);
});

test('share, repost, and comment do not pay on a Release', () => {
  expect(releasePaysForAction('share')).toBe(false);
  expect(calculatePoints('share', release)).toBe(0);
  expect(calculatePoints('repost', release)).toBe(0);
  expect(calculatePoints('comment', release)).toBe(0);
  expect(shouldAwardPromoShare('share', release)).toBe(false);
});

test('opening the original and verified proof still pay', () => {
  expect(calculatePoints('click', release)).toBe(3);
  expect(calculatePoints('proof_verified', release)).toBe(9);
  expect(shouldAwardPromoShare('click', release)).toBe(true);
  expect(shouldAwardPromoShare('proof_verified', release)).toBe(true);
});
