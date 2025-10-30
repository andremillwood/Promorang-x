const express = require('express');
const router = express.Router();

const buildMockEntries = (period = 'daily', count = 10) => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${period}-user-${index + 1}`,
    position: index + 1,
    user_id: `demo-user-${index + 1}`,
    username: `creator_${index + 1}`,
    display_name: `Creator ${index + 1}`,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=leaderboard-${period}-${index + 1}`,
    metric: period === 'daily' ? 'engagement' : period === 'weekly' ? 'growth' : 'lifetime',
    score: 4500 - index * 250,
    change: index === 0 ? '+2' : index === 1 ? '-1' : index === 2 ? '+5' : '0',
    campaign_count: 12 - index,
    total_rewards: 1200 - index * 40,
    trend: index % 2 === 0 ? 'up' : 'steady'
  }));
};

const createLeaderboardResponse = (period) => buildMockEntries(period).map((entry, index) => ({
  ...entry,
  points_earned: 2500 - index * 120,
  gems_earned: 550 - index * 25,
  keys_used: 12 - index,
  gold_collected: 180 - index * 8,
  composite_score: 86 - index * 3.4,
}));

router.get('/daily', (req, res) => {
  res.json(createLeaderboardResponse('daily'));
});

router.get('/weekly', (req, res) => {
  res.json(createLeaderboardResponse('weekly'));
});

router.get('/monthly', (req, res) => {
  res.json(createLeaderboardResponse('monthly'));
});

router.get('/overall', (req, res) => {
  res.json(createLeaderboardResponse('overall'));
});

module.exports = router;
