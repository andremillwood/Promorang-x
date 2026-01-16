/**
 * PROMORANG ACHIEVEMENT SERVICE
 * Track and award user milestones
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;
const { sendAchievementUnlockedEmail } = require('./resendService');

const ACHIEVEMENTS = [
    {
        id: 1,
        key: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first drop application',
        icon: 'star',
        category: 'progression',
        criteria_type: 'count',
        criteria_value: 1,
        gold_reward: 5,
        xp_reward: 100,
    },
    {
        id: 2,
        key: 'content_creator',
        name: 'Content Creator',
        description: 'Share your first piece of content',
        icon: 'file-text',
        category: 'creation',
        criteria_type: 'count',
        criteria_value: 1,
        gold_reward: 10,
        xp_reward: 200,
    },
    {
        id: 3,
        key: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Track 100 referral clicks',
        icon: 'users',
        category: 'social',
        criteria_type: 'count',
        criteria_value: 100,
        gold_reward: 25,
        xp_reward: 500,
    },
    {
        id: 4,
        key: 'streak_week',
        name: 'Streak Master',
        description: 'Reach a 7-day login streak',
        icon: 'zap',
        category: 'progression',
        criteria_type: 'count',
        criteria_value: 7,
        gold_reward: 50,
        xp_reward: 1000,
    },
    {
        id: 5,
        key: 'pioneer',
        name: 'Pioneer',
        description: 'Be one of the first members of Promorang',
        icon: 'award',
        category: 'progression',
        criteria_type: 'date',
        criteria_value: 0,
        gold_reward: 100,
        xp_reward: 2000,
    },
    {
        id: 6,
        key: 'top_referrer',
        name: 'Top Referrer',
        description: 'Refer 10 successful new users',
        icon: 'users',
        category: 'social',
        criteria_type: 'count',
        criteria_value: 10,
        gold_reward: 500,
        xp_reward: 5000,
    },
];

/**
 * Get user achievements with progress
 */
async function getUserAchievements(userId) {
    if (!supabase) return ACHIEVEMENTS.map(a => ({ ...a, is_completed: false, progress: 0 }));

    try {
        const { data: earned } = await supabase
            .from('user_badges')
            .select('badge_key, earned_at')
            .eq('user_id', userId);

        const { data: user } = await supabase
            .from('users')
            .select('level, points_balance')
            .eq('id', userId)
            .single();

        const earnedKeys = new Set((earned || []).map(e => e.badge_key));

        return ACHIEVEMENTS.map(a => {
            const isCompleted = earnedKeys.has(a.key);
            let progress = 0;

            // Basic progress logic based on user stats
            if (a.key === 'level_up') progress = user?.level || 0;
            if (isCompleted) progress = a.criteria_value;

            return {
                ...a,
                is_completed: isCompleted,
                progress: progress,
                earned_at: (earned || []).find(e => e.badge_key === a.key)?.earned_at
            };
        });
    } catch (error) {
        console.error('[Achievement Service] Error:', error);
        return ACHIEVEMENTS.map(a => ({ ...a, is_completed: false, progress: 0 }));
    }
}

/**
 * Award an achievement
 */
async function awardAchievement(userId, badgeKey) {
    if (!supabase) return { success: true };

    try {
        const achievement = ACHIEVEMENTS.find(a => a.key === badgeKey);
        if (!achievement) return { success: false, message: 'Invalid achievement key' };

        // Check if already earned
        const { data: existing } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', userId)
            .eq('badge_key', badgeKey)
            .single();

        if (existing) return { success: false, message: 'Already earned' };

        // Record achievement
        await supabase.from('user_badges').insert({
            user_id: userId,
            badge_key: badgeKey,
        });

        // Award rewards
        if (achievement.gold_reward > 0 || achievement.xp_reward > 0) {
            await supabase.rpc('award_achievement_rewards', {
                p_user_id: userId,
                p_gold: achievement.gold_reward,
                p_xp: achievement.xp_reward,
            });
        }

        // Send achievement email (async)
        try {
            const { data: user } = await supabase
                .from('users')
                .select('email, display_name, username')
                .eq('id', userId)
                .single();

            if (user?.email) {
                sendAchievementUnlockedEmail(user.email, user.display_name || user.username, {
                    title: achievement.name,
                    description: achievement.description,
                    rewardGems: achievement.gold_reward,
                    rewardPoints: achievement.xp_reward,
                }).catch(err => console.error('Failed to send achievement email:', err));
            }
        } catch (emailErr) {
            console.error('Error sending achievement email:', emailErr);
        }

        return {
            success: true,
            achievement,
            message: `Achievement Unlocked: ${achievement.name}!`
        };
    } catch (error) {
        console.error('[Achievement Service] Error awarding:', error);
        return { success: false, error };
    }
}

module.exports = {
    getUserAchievements,
    awardAchievement,
    ACHIEVEMENTS,
};
