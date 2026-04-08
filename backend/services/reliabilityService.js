/**
 * PROMORANG RELIABILITY INDEX (PRI) SERVICE
 * 
 * Manages the user's "Reliability Score" (0-100).
 * - Starts at 100.
 * - Decays over time if inactive (optional, defined by rules).
 * - Penalized heavily for "Flaking" (claiming -> not redeeming).
 * - Boosted by "Verified" attendance.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

const PRI_CONFIG = {
    DEFAULT_START: 100,
    MIN_SCORE: 0,
    MAX_SCORE: 100,
    PENALTIES: {
        FLAKE_NO_SHOW: 20,       // Heavy penalty for missing a reserved spot
        LATE_CANCELLATION: 5,   // Penalty for cancelling < 24h before
    },
    REWARDS: {
        VERIFIED_ATTENDANCE: 2, // Small boost for consistency
        STREAK_BONUS: 5,        // Bonus for 3+ consecutive moments
    },
    DECAY: {
        ENABLED: true,
        RATE_PER_WEEK: 1,       // Lose 1 point per week of total inactivity
    }
};

/**
 * Initialize PRI for a new user
 */
async function initializeReliability(userId) {
    if (!supabase) return { success: true, score: PRI_CONFIG.DEFAULT_START };

    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                reliability_score: PRI_CONFIG.DEFAULT_START,
                last_reliability_update: new Date().toISOString()
            })
            .eq('id', userId)
            .select('reliability_score')
            .single();

        if (error) throw error;
        return { success: true, score: data.reliability_score };
    } catch (error) {
        console.error('[PRI] Error initializing:', error);
        throw error;
    }
}

/**
 * updateReliability
 * Adjusts the user's score based on an action.
 * 
 * @param {string} userId 
 * @param {string} actionType - 'FLAKE', 'ATTENDED', 'CANCEL_LATE'
 * @param {object} context - { momentId, reason }
 */
async function updateReliability(userId, actionType, context = {}) {
    if (!supabase) {
        console.log(`[PRI] Mock update for ${userId}: ${actionType}`);
        return { newScore: 95, delta: -5 };
    }

    try {
        // 1. Get current score
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('reliability_score, last_reliability_update')
            .eq('id', userId)
            .single();

        if (fetchError || !user) throw new Error('User not found');

        let currentScore = user.reliability_score ?? PRI_CONFIG.DEFAULT_START;
        let delta = 0;

        // 2. Calculate Delta
        switch (actionType) {
            case 'FLAKE':
                delta = -PRI_CONFIG.PENALTIES.FLAKE_NO_SHOW;
                break;
            case 'CANCEL_LATE':
                delta = -PRI_CONFIG.PENALTIES.LATE_CANCELLATION;
                break;
            case 'ATTENDED':
                delta = PRI_CONFIG.REWARDS.VERIFIED_ATTENDANCE;
                break;
            default:
                console.warn(`[PRI] Unknown action type: ${actionType}`);
                return { newScore: currentScore, delta: 0 };
        }

        // 3. Apply limits (0-100)
        let newScore = Math.max(PRI_CONFIG.MIN_SCORE, Math.min(PRI_CONFIG.MAX_SCORE, currentScore + delta));

        // 4. Update Database
        const { error: updateError } = await supabase
            .from('users')
            .update({
                reliability_score: newScore,
                last_reliability_update: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        console.log(`[PRI] User ${userId} | ${actionType} | ${currentScore} -> ${newScore} (Delta: ${delta})`);

        return { success: true, newScore, delta, previousScore: currentScore };

    } catch (error) {
        console.error('[PRI] Update failed:', error);
        throw error;
    }
}

/**
 * getReliabilityProfile
 * Returns the score and a status label (e.g., "Highly Reliable", "At Risk").
 */
async function getReliabilityProfile(userId) {
    if (!supabase) {
        return {
            score: 98,
            label: 'Elite Patron',
            color: 'green'
        };
    }

    const { data: user } = await supabase
        .from('users')
        .select('reliability_score')
        .eq('id', userId)
        .single();

    const score = user?.reliability_score ?? PRI_CONFIG.DEFAULT_START;

    let label = 'Reliable';
    let color = 'green';

    if (score >= 95) { label = 'Elite Patron'; color = 'purple'; }
    else if (score >= 80) { label = 'Verified'; color = 'blue'; }
    else if (score >= 50) { label = 'Standard'; color = 'gray'; }
    else { label = 'At Risk'; color = 'red'; }

    return { score, label, color };
}

module.exports = {
    initializeReliability,
    updateReliability,
    getReliabilityProfile,
    PRI_CONFIG
};
