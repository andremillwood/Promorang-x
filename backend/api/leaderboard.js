const express = require('express');
const router = express.Router();

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

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

const fetchLeaderboard = async (period) => {
  if (!supabase) {
    return createLeaderboardResponse(period);
  }

  try {
    const { data: entries, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        id,
        user_id,
        rank,
        points_earned,
        gems_earned,
        keys_used,
        gold_collected,
        composite_score,
        trend,
        users!inner(username, display_name, avatar_url)
      `)
      .eq('period_type', period)
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.error(`Error fetching ${period} leaderboard:`, error);
      return createLeaderboardResponse(period);
    }

    if (!entries || entries.length === 0) {
      return createLeaderboardResponse(period);
    }

    return entries.map((entry) => ({
      id: entry.id,
      position: entry.rank,
      user_id: entry.user_id,
      username: entry.users?.username || 'unknown',
      display_name: entry.users?.display_name || 'Unknown User',
      avatar_url: entry.users?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user_id}`,
      metric: period,
      score: entry.composite_score || 0,
      change: entry.trend === 'up' ? '+2' : entry.trend === 'down' ? '-1' : '0',
      campaign_count: 0,
      total_rewards: entry.gems_earned || 0,
      trend: entry.trend || 'steady',
      points_earned: entry.points_earned || 0,
      gems_earned: entry.gems_earned || 0,
      keys_used: entry.keys_used || 0,
      gold_collected: entry.gold_collected || 0,
      composite_score: entry.composite_score || 0
    }));
  } catch (error) {
    console.error(`Leaderboard fetch error (${period}):`, error);
    return createLeaderboardResponse(period);
  }
};

router.get('/daily', async (req, res) => {
  const entries = await fetchLeaderboard('daily');
  res.json(entries);
});

router.get('/weekly', async (req, res) => {
  const entries = await fetchLeaderboard('weekly');
  res.json(entries);
});

router.get('/monthly', async (req, res) => {
  const entries = await fetchLeaderboard('monthly');
  res.json(entries);
});

router.get('/overall', async (req, res) => {
  const entries = await fetchLeaderboard('overall');
  res.json(entries);
});

module.exports = router;
