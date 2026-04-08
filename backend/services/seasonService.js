/**
 * PROMORANG SEASON SERVICE
 * Manages seasonal logic, tier progression, and reward tracks
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Mock configuration for the current season
// This could be moved to a database table ('seasons') later
const CURRENT_SEASON = {
    id: 'season_of_dawn_v1',
    name: 'Season of the Dawn',
    description: 'The first light breaks over the realm. Rise and claim your destiny.',
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-03-31T23:59:59Z',
    banner_url: 'https://images.unsplash.com/photo-1470252649358-96752a78ecae?auto=format&fit=crop&q=80&w=2070',
    color_primary: '#F59E0B', // Amber 500
    tiers: [
        { level: 1, xp_required: 0, rewards: [{ type: 'loot', amount: 500, label: 'Starter Bounty' }] },
        { level: 2, xp_required: 1000, rewards: [{ type: 'keys', amount: 1, label: 'Rusty Key' }] },
        { level: 3, xp_required: 2500, rewards: [{ type: 'gems', amount: 50, label: 'Glimmering Pouch' }] },
        { level: 4, xp_required: 5000, rewards: [{ type: 'loot', amount: 2000, label: 'Explorer Pack' }] },
        { level: 5, xp_required: 10000, rewards: [{ type: 'gold', amount: 1, label: 'Royal Gold Coin' }] },
    ]
};

/**
 * Get the current active season
 */
async function getActiveSeason() {
    return CURRENT_SEASON;
}

/**
 * Get a user's progress in the current season
 * Uses daily_states or user metadata to track seasonal XP
 */
async function getUserSeasonProgress(userId) {
    if (!supabase) {
        return {
            season_id: CURRENT_SEASON.id,
            current_xp: 1250,
            current_tier: 2,
            next_tier_xp: 2500,
            completion_percentage: 50,
            unlocked_rewards: [1, 2]
        };
    }

    try {
        // We'll use the user's total points as the base for seasonal XP for now
        // Or specific seasonal metadata if we add it
        const { data: user } = await supabase
            .from('users')
            .select('points_balance, metadata')
            .eq('id', userId)
            .single();

        if (!user) return null;

        const currentXp = user.points_balance || 0;
        let currentTier = CURRENT_SEASON.tiers[0];
        let nextTier = null;

        for (let i = 0; i < CURRENT_SEASON.tiers.length; i++) {
            if (currentXp >= CURRENT_SEASON.tiers[i].xp_required) {
                currentTier = CURRENT_SEASON.tiers[i];
                nextTier = CURRENT_SEASON.tiers[i + 1] || null;
            } else {
                break;
            }
        }

        const nextTierXp = nextTier ? nextTier.xp_required : currentTier.xp_required;
        const prevTierXp = currentTier.xp_required;
        const progressInTier = nextTier ? ((currentXp - prevTierXp) / (nextTierXp - prevTierXp)) * 100 : 100;

        return {
            season_id: CURRENT_SEASON.id,
            season_name: CURRENT_SEASON.name,
            current_xp: currentXp,
            current_tier: currentTier.level,
            next_tier_xp: nextTierXp,
            completion_percentage: Math.min(100, Math.max(0, progressInTier)),
            unlocked_rewards: CURRENT_SEASON.tiers
                .filter(t => currentXp >= t.xp_required)
                .map(t => t.level)
        };
    } catch (error) {
        console.error('[Season Service] Error fetching progress:', error);
        return null;
    }
}

module.exports = {
    getActiveSeason,
    getUserSeasonProgress
};
