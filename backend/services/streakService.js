/**
 * PROMORANG STREAK SERVICE
 * Track daily login streaks with escalating rewards
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const { sendStreakMilestoneEmail } = require('./resendService');

// Streak reward tiers (gems per day of streak)
const STREAK_REWARDS = {
    1: 5,      // Day 1: 5 gems
    2: 10,     // Day 2: 10 gems
    3: 15,     // Day 3: 15 gems
    4: 20,     // Day 4: 20 gems
    5: 25,     // Day 5: 25 gems
    6: 30,     // Day 6: 30 gems
    7: 50,     // Day 7 (week milestone): 50 gems
    14: 75,   // Day 14 (2 weeks): 75 gems
    21: 100,  // Day 21 (3 weeks): 100 gems
    30: 150,  // Day 30 (month): 150 gems
};

// Email milestone days (only send emails for major milestones)
const EMAIL_MILESTONES = [7, 14, 30, 60, 100, 365];

/**
 * Get reward for current streak day
 */
function getStreakReward(streakDay) {
    // Check for exact milestone match first
    if (STREAK_REWARDS[streakDay]) {
        return STREAK_REWARDS[streakDay];
    }
    // Base reward scales: 5 gems + 1 gem per streak day (capped at 30)
    return Math.min(30, 5 + Math.floor(streakDay / 2));
}

/**
 * Get user's streak status
 */
async function getStreakStatus(userId) {
    if (!supabase) {
        return {
            current_streak: 3,
            longest_streak: 7,
            last_login_date: new Date().toISOString().split('T')[0],
            checked_in_today: true,
            next_reward: 20,
            total_streak_gems: 45,
        };
    }

    try {
        const { data: streak, error } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        const today = new Date().toISOString().split('T')[0];

        if (!streak) {
            return {
                current_streak: 0,
                longest_streak: 0,
                last_login_date: null,
                checked_in_today: false,
                next_reward: getStreakReward(1),
                total_streak_gems: 0,
            };
        }

        const checkedInToday = streak.last_login_date === today;
        const nextStreak = checkedInToday ? streak.current_streak + 1 : streak.current_streak + 1;

        return {
            ...streak,
            checked_in_today: checkedInToday,
            next_reward: getStreakReward(nextStreak),
        };
    } catch (error) {
        console.error('[Streak Service] Error getting status:', error);
        throw error;
    }
}

/**
 * Process daily check-in
 */
async function checkIn(userId) {
    if (!supabase) {
        return {
            success: true,
            streak: 4,
            reward: 20,
            is_milestone: false,
            message: 'Demo mode - streak updated!',
        };
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Get current streak
        const { data: existing } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (existing?.last_login_date === today) {
            return {
                success: false,
                already_checked_in: true,
                streak: existing.current_streak,
                message: 'Already checked in today!',
            };
        }

        let newStreak = 1;
        let longestStreak = existing?.longest_streak || 0;

        // Continue streak if logged in yesterday
        if (existing?.last_login_date === yesterday) {
            newStreak = existing.current_streak + 1;
        }

        // Update longest streak
        if (newStreak > longestStreak) {
            longestStreak = newStreak;
        }

        const reward = getStreakReward(newStreak);
        const isMilestone = !!STREAK_REWARDS[newStreak];
        const totalGems = (existing?.total_streak_gems || 0) + reward;

        // Upsert streak record
        const { error: upsertError } = await supabase
            .from('user_streaks')
            .upsert({
                user_id: userId,
                current_streak: newStreak,
                longest_streak: longestStreak,
                last_login_date: today,
                total_streak_gems: totalGems,
            }, { onConflict: 'user_id' });

        if (upsertError) throw upsertError;

        // Award gems to user
        const { error: balanceError } = await supabase.rpc('add_gems', {
            p_user_id: userId,
            p_amount: reward,
            p_reason: `Day ${newStreak} streak bonus`,
        });

        if (balanceError) {
            console.error('[Streak Service] Error awarding gems:', balanceError);
            // Fallback: direct update
            await supabase
                .from('user_balances')
                .update({ gems: supabase.raw(`gems + ${reward}`) })
                .eq('user_id', userId);
        }

        // Send milestone email for major milestones (async)
        if (EMAIL_MILESTONES.includes(newStreak)) {
            try {
                const { data: user } = await supabase
                    .from('users')
                    .select('email, display_name, username')
                    .eq('id', userId)
                    .single();

                if (user?.email) {
                    sendStreakMilestoneEmail(user.email, user.display_name || user.username, {
                        days: newStreak,
                        bonusGems: reward,
                    }).catch(err => console.error('Failed to send streak email:', err));
                }
            } catch (emailErr) {
                console.error('Error sending streak milestone email:', emailErr);
            }
        }

        return {
            success: true,
            streak: newStreak,
            reward,
            is_milestone: isMilestone,
            longest_streak: longestStreak,
            total_streak_gems: totalGems,
            message: isMilestone
                ? `🎉 Milestone! Day ${newStreak} streak - ${reward} gems!`
                : `Day ${newStreak} streak! +${reward} gems`,
        };
    } catch (error) {
        console.error('[Streak Service] Error checking in:', error);
        throw error;
    }
}

/**
 * Get streak leaderboard
 */
async function getStreakLeaderboard(limit = 20) {
    if (!supabase) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('user_streaks')
            .select(`
        current_streak,
        longest_streak,
        total_streak_gems,
        users!user_streaks_user_id_fkey(id, username, display_name, profile_image)
      `)
            .order('current_streak', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[Streak Service] Error getting leaderboard:', error);
        return [];
    }
}

module.exports = {
    getStreakStatus,
    checkIn,
    getStreakLeaderboard,
    getStreakReward,
    STREAK_REWARDS,
};
