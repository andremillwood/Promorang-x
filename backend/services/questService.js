/**
 * PROMORANG QUEST SERVICE
 * Daily and weekly quests with gem rewards
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Quest definitions
const QUEST_DEFINITIONS = {
    // Daily quests
    daily_share: {
        key: 'daily_share',
        name: 'Share Something',
        description: 'Share any content once today',
        type: 'daily',
        target: 1,
        reward: 10,
        icon: '📤',
    },
    daily_drop: {
        key: 'daily_drop',
        name: 'Complete a Drop',
        description: 'Complete any drop task',
        type: 'daily',
        target: 1,
        reward: 15,
        icon: '🎯',
    },
    daily_engage: {
        key: 'daily_engage',
        name: 'Be Active',
        description: 'Like, comment, or interact 3 times',
        type: 'daily',
        target: 3,
        reward: 10,
        icon: '💬',
    },
    daily_forecast: {
        key: 'daily_forecast',
        name: 'Make a Prediction',
        description: 'Make any forecast prediction',
        type: 'daily',
        target: 1,
        reward: 20,
        icon: '🔮',
    },

    // Weekly quests
    weekly_referral: {
        key: 'weekly_referral',
        name: 'Invite a Friend',
        description: 'Get someone to sign up with your code',
        type: 'weekly',
        target: 1,
        reward: 100,
        icon: '👥',
    },
    weekly_drops: {
        key: 'weekly_drops',
        name: 'Drop Master',
        description: 'Complete 5 drops this week',
        type: 'weekly',
        target: 5,
        reward: 75,
        icon: '🏆',
    },
    weekly_streak: {
        key: 'weekly_streak',
        name: 'Consistency',
        description: 'Login 7 days in a row',
        type: 'weekly',
        target: 7,
        reward: 100,
        icon: '🔥',
    },
};

/**
 * Get active quests for a user
 */
async function getActiveQuests(userId) {
    if (!supabase) {
        // Demo data
        return {
            daily: [
                { ...QUEST_DEFINITIONS.daily_share, current: 1, completed: true },
                { ...QUEST_DEFINITIONS.daily_drop, current: 0, completed: false },
                { ...QUEST_DEFINITIONS.daily_engage, current: 2, completed: false },
            ],
            weekly: [
                { ...QUEST_DEFINITIONS.weekly_referral, current: 0, completed: false },
                { ...QUEST_DEFINITIONS.weekly_drops, current: 3, completed: false },
            ],
        };
    }

    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Get start of week (Sunday)
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Get user's quests
        const { data: userQuests, error } = await supabase
            .from('user_quests')
            .select('*')
            .eq('user_id', userId)
            .gte('expires_at', new Date().toISOString());

        if (error) throw error;

        // Build quest lists, creating missing ones
        const daily = [];
        const weekly = [];

        for (const def of Object.values(QUEST_DEFINITIONS)) {
            const existing = (userQuests || []).find(q => q.quest_key === def.key);

            if (existing) {
                daily.push(def.type === 'daily' ? {
                    ...def,
                    id: existing.id,
                    current: existing.current_count,
                    completed: !!existing.completed_at,
                    claimed: !!existing.claimed_at,
                } : null);
                weekly.push(def.type === 'weekly' ? {
                    ...def,
                    id: existing.id,
                    current: existing.current_count,
                    completed: !!existing.completed_at,
                    claimed: !!existing.claimed_at,
                } : null);
            } else {
                // Create new quest for user
                const expiresAt = def.type === 'daily'
                    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    : new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

                const { data: newQuest } = await supabase
                    .from('user_quests')
                    .insert({
                        user_id: userId,
                        quest_type: def.type,
                        quest_key: def.key,
                        target_count: def.target,
                        current_count: 0,
                        gems_reward: def.reward,
                        expires_at: expiresAt,
                    })
                    .select()
                    .single();

                const questData = {
                    ...def,
                    id: newQuest?.id,
                    current: 0,
                    completed: false,
                    claimed: false,
                };

                if (def.type === 'daily') daily.push(questData);
                else weekly.push(questData);
            }
        }

        return {
            daily: daily.filter(Boolean),
            weekly: weekly.filter(Boolean),
        };
    } catch (error) {
        console.error('[Quest Service] Error getting quests:', error);
        throw error;
    }
}

/**
 * Update quest progress
 */
async function updateProgress(userId, questKey, increment = 1) {
    if (!supabase) return null;

    try {
        // Find active quest
        const { data: quest, error: findError } = await supabase
            .from('user_quests')
            .select('*')
            .eq('user_id', userId)
            .eq('quest_key', questKey)
            .is('completed_at', null)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (findError || !quest) return null;

        const newCount = quest.current_count + increment;
        const isCompleted = newCount >= quest.target_count;

        const { data: updated, error: updateError } = await supabase
            .from('user_quests')
            .update({
                current_count: newCount,
                completed_at: isCompleted ? new Date().toISOString() : null,
            })
            .eq('id', quest.id)
            .select()
            .single();

        if (updateError) throw updateError;

        return {
            updated: true,
            quest_key: questKey,
            current: newCount,
            completed: isCompleted,
        };
    } catch (error) {
        console.error('[Quest Service] Error updating progress:', error);
        return null;
    }
}

/**
 * Claim quest reward
 */
async function claimReward(userId, questId) {
    if (!supabase) {
        return { success: true, reward: 50, message: 'Demo: Quest claimed!' };
    }

    try {
        // Get quest
        const { data: quest } = await supabase
            .from('user_quests')
            .select('*')
            .eq('id', questId)
            .eq('user_id', userId)
            .single();

        if (!quest) throw new Error('Quest not found');
        if (!quest.completed_at) throw new Error('Quest not completed');
        if (quest.claimed_at) throw new Error('Quest already claimed');

        // Mark as claimed
        await supabase
            .from('user_quests')
            .update({ claimed_at: new Date().toISOString() })
            .eq('id', questId);

        // Award gems
        try {
            await supabase.rpc('add_gems', {
                p_user_id: userId,
                p_amount: quest.gems_reward,
                p_reason: `Quest completed: ${quest.quest_key}`,
            });
        } catch (rpcError) {
            console.error('[Quest Service] RPC error, falling back:', rpcError);
        }

        return {
            success: true,
            reward: quest.gems_reward,
            message: `Claimed ${quest.gems_reward} gems!`,
        };
    } catch (error) {
        console.error('[Quest Service] Error claiming reward:', error);
        throw error;
    }
}

module.exports = {
    getActiveQuests,
    updateProgress,
    claimReward,
    QUEST_DEFINITIONS,
};
