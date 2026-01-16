/**
 * PROMORANG ACTIVITY SERVICE
 * Fetch recent site-wide activities for social proof
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

/**
 * Get recent high-value activities
 */
async function getRecentActivity(limit = 10) {
    if (!supabase) {
        // Return mock data for demo
        return [
            { id: '1', type: 'purchase', user_name: 'Alex', amount: 45, time: new Date().toISOString() },
            { id: '2', type: 'referral', user_name: 'Sam', time: new Date(Date.now() - 300000).toISOString() },
            { id: '3', type: 'quest', user_name: 'Jordan', quest_name: 'Weekly Referral', time: new Date(Date.now() - 600000).toISOString() },
            { id: '4', type: 'streak', user_name: 'Charlie', streak_days: 7, time: new Date(Date.now() - 900000).toISOString() },
        ];
    }

    try {
        // Collect from multiple sources
        const [orders, referrals, quests, streaks] = await Promise.all([
            // Recent purchases
            supabase
                .from('orders')
                .select('id, total_usd, created_at, users!buyer_id(display_name, username)')
                .eq('payment_status', 'completed')
                .order('created_at', { ascending: false })
                .limit(5),

            // Recent referrals
            supabase
                .from('user_referrals')
                .select('id, created_at, referrer:users!referrer_id(display_name, username)')
                .order('created_at', { ascending: false })
                .limit(5),

            // Recent quest completions
            supabase
                .from('user_quests')
                .select('id, quest_key, completed_at, users!user_id(display_name, username)')
                .not('completed_at', 'is', null)
                .order('completed_at', { ascending: false })
                .limit(5),

            // Recent streaks (check-ins)
            supabase
                .from('user_streaks')
                .select('user_id, current_streak, last_login_date, users!user_id(display_name, username)')
                .order('last_login_date', { ascending: false })
                .limit(5)
        ]);

        const allActivity = [];

        // Format orders
        (orders.data || []).forEach(o => {
            allActivity.push({
                id: `order-${o.id}`,
                type: 'purchase',
                user_name: o.users?.display_name || o.users?.username || 'Someone',
                amount: o.total_usd,
                time: o.created_at,
            });
        });

        // Format referrals
        (referrals.data || []).forEach(r => {
            allActivity.push({
                id: `ref-${r.id}`,
                type: 'referral',
                user_name: r.referrer?.display_name || r.referrer?.username || 'Someone',
                time: r.created_at,
            });
        });

        // Format quests
        (quests.data || []).forEach(q => {
            allActivity.push({
                id: `quest-${q.id}`,
                type: 'quest',
                user_name: q.users?.display_name || q.users?.username || 'Someone',
                quest_key: q.quest_key,
                time: q.completed_at,
            });
        });

        // Format streaks
        (streaks.data || []).forEach(s => {
            allActivity.push({
                id: `streak-${s.user_id}`,
                type: 'streak',
                user_name: s.users?.display_name || s.users?.username || 'Someone',
                streak_days: s.current_streak,
                time: s.last_login_date,
            });
        });

        // Sort by time and limit
        return allActivity
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, limit);

    } catch (error) {
        console.error('[Activity Service] Error getting activity:', error);
        return [];
    }
}

module.exports = {
    getRecentActivity,
};
