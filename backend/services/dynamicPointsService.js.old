/**
 * PROMORANG DYNAMIC POINTS SERVICE
 * 
 * Handles the static vs dynamic points split for Keys conversion.
 * 
 * Key principles:
 * - Static points (IG followers, signup bonus) = identity/weight (NOT convertible)
 * - Dynamic points (daily activity in Promorang) = convertible to Keys
 * - Small accounts can compete daily; big accounts cannot win purely from followers
 */


const supabaseModule = require('../lib/supabase');
// Handle both export styles: module.exports = supabase AND module.exports.supabase = supabase
const supabase = supabaseModule?.supabase || supabaseModule || null;

// =============================================
// CONFIGURATION
// =============================================

const CONVERSION_CONFIG = {
    pointsPerKey: 100,        // 100 dynamic points = 1 Key
    dailyCap: 5,              // Max 5 Keys per day from conversion
    weeklyCap: 20,            // Max 20 Keys per week from conversion
};

// Valid DYNAMIC point sources (these CAN be converted to Keys)
const DYNAMIC_SOURCES = [
    'drop_engagement',        // Engaging with drops
    'proof_verified',         // Submitting verified proof
    'streak_bonus',           // Streak milestone bonuses
    'quest_complete',         // Completing quests
    'social_action',          // Social engagement (like, comment, share)
    'daily_visit',            // Opening the app / Today Screen
    'draw_ticket',            // Earning draw tickets
    'headline_view',          // Viewing daily headline
    'headline_engage',        // Engaging with daily headline
];

// STATIC sources (NOT convertible - identity/starting weight)
const STATIC_SOURCES = [
    'ig_followers',           // Instagram follower count
    'signup_bonus',           // Initial signup bonus
    'referral_bonus',         // Referral rewards
    'manual_adjustment',      // Admin adjustments
];

// Point values for activities
const POINT_VALUES = {
    daily_visit: 10,
    headline_view: 5,
    headline_engage: 25,
    drop_engagement: 25,
    proof_verified: 100,
    quest_complete: 50,
    social_action: 5,
    streak_bonus: 10, // per streak day
};

// =============================================
// CORE FUNCTIONS
// =============================================

/**
 * Award dynamic points (these CAN be converted to Keys)
 * @param {number} userId - User ID
 * @param {string} source - Source type (must be in DYNAMIC_SOURCES)
 * @param {number} amount - Points amount
 * @param {number|null} referenceId - Optional reference to source object
 * @param {string|null} description - Human-readable description
 */
async function awardDynamicPoints(userId, source, amount, referenceId = null, description = null) {
    // Validate source is dynamic
    if (!DYNAMIC_SOURCES.includes(source)) {
        console.error(`[DynamicPoints] Invalid source: ${source}. Must be one of: ${DYNAMIC_SOURCES.join(', ')}`);
        throw new Error(`Source "${source}" is not a valid dynamic source`);
    }

    if (!supabase) {
        console.log(`[DynamicPoints] Demo mode - would award ${amount} points from ${source}`);
        return { success: true, amount };
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('dynamic_points_ledger')
            .insert({
                user_id: userId,
                source_type: source,
                points_amount: amount,
                reference_id: referenceId,
                description: description || `Earned from ${source}`,
                earned_date: today,
                converted_to_keys: false,
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`[DynamicPoints] Awarded ${amount} points to user ${userId} from ${source}`);
        return { success: true, amount, entry: data };
    } catch (error) {
        console.error('[DynamicPoints] Error awarding points:', error);
        throw error;
    }
}

/**
 * Get unconverted dynamic points balance
 * @param {number} userId - User ID
 * @returns {number} Total unconverted points
 */
async function getConvertibleBalance(userId) {
    if (!supabase) return 250; // Demo value

    try {
        const { data, error } = await supabase
            .from('dynamic_points_ledger')
            .select('points_amount')
            .eq('user_id', userId)
            .eq('converted_to_keys', false);

        if (error) throw error;

        const total = (data || []).reduce((sum, row) => sum + row.points_amount, 0);
        return total;
    } catch (error) {
        console.error('[DynamicPoints] Error getting balance:', error);
        return 0;
    }
}

/**
 * Get today's conversion count
 * @param {number} userId - User ID
 * @returns {number} Keys converted today
 */
async function getTodayConversions(userId) {
    if (!supabase) return 0;

    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('dynamic_points_ledger')
            .select('points_amount')
            .eq('user_id', userId)
            .eq('converted_to_keys', true)
            .gte('converted_at', `${today}T00:00:00Z`)
            .lt('converted_at', `${today}T23:59:59Z`);

        if (error) throw error;

        const totalPoints = (data || []).reduce((sum, row) => sum + row.points_amount, 0);
        return Math.floor(totalPoints / CONVERSION_CONFIG.pointsPerKey);
    } catch (error) {
        console.error('[DynamicPoints] Error getting today conversions:', error);
        return 0;
    }
}

/**
 * Convert dynamic points to Keys (automatic threshold conversion)
 * Called after user earns points to check if they've hit conversion threshold
 * @param {number} userId - User ID
 * @returns {object} Conversion result
 */
async function autoConvertToKeys(userId) {
    if (!supabase) {
        return { converted: false, points: 0, keys: 0, reason: 'Demo mode' };
    }

    try {
        // Get current balance
        const balance = await getConvertibleBalance(userId);
        const potentialKeys = Math.floor(balance / CONVERSION_CONFIG.pointsPerKey);

        if (potentialKeys <= 0) {
            return { converted: false, points: balance, keys: 0, reason: 'Insufficient points' };
        }

        // Check daily cap
        const todayConversions = await getTodayConversions(userId);
        const remainingToday = CONVERSION_CONFIG.dailyCap - todayConversions;

        if (remainingToday <= 0) {
            return {
                converted: false,
                points: balance,
                keys: 0,
                reason: 'Daily cap reached',
                capped: true
            };
        }

        // Calculate how many keys to convert
        const keysToConvert = Math.min(potentialKeys, remainingToday);
        const pointsToConvert = keysToConvert * CONVERSION_CONFIG.pointsPerKey;

        // Mark points as converted (oldest first)
        const { data: unconverted } = await supabase
            .from('dynamic_points_ledger')
            .select('id, points_amount')
            .eq('user_id', userId)
            .eq('converted_to_keys', false)
            .order('created_at', { ascending: true });

        let pointsRemaining = pointsToConvert;
        const idsToConvert = [];

        for (const row of unconverted || []) {
            if (pointsRemaining <= 0) break;
            idsToConvert.push(row.id);
            pointsRemaining -= row.points_amount;
        }

        if (idsToConvert.length > 0) {
            const now = new Date().toISOString();
            await supabase
                .from('dynamic_points_ledger')
                .update({ converted_to_keys: true, converted_at: now })
                .in('id', idsToConvert);
        }

        // Award Keys via economy service
        try {
            const economyService = require('./economyService');
            await economyService.addCurrency(
                userId,
                'promokeys',
                keysToConvert,
                'points_conversion',
                null,
                `Converted ${pointsToConvert} dynamic points`
            );
        } catch (economyError) {
            console.error('[DynamicPoints] Error adding keys via economy service:', economyError);
            // Fallback: direct key addition via RPC
            await supabase.rpc('add_keys', {
                p_user_id: userId,
                p_amount: keysToConvert,
            });
        }

        console.log(`[DynamicPoints] Converted ${pointsToConvert} points to ${keysToConvert} keys for user ${userId}`);

        return {
            converted: true,
            points: pointsToConvert,
            keys: keysToConvert,
            remaining_balance: balance - pointsToConvert,
            daily_remaining: remainingToday - keysToConvert,
        };
    } catch (error) {
        console.error('[DynamicPoints] Error converting to keys:', error);
        throw error;
    }
}

/**
 * Get conversion status for a user (for UI display)
 * @param {number} userId - User ID
 */
async function getConversionStatus(userId) {
    try {
        const balance = await getConvertibleBalance(userId);
        const todayConversions = await getTodayConversions(userId);

        return {
            balance,
            potentialKeys: Math.floor(balance / CONVERSION_CONFIG.pointsPerKey),
            pointsPerKey: CONVERSION_CONFIG.pointsPerKey,
            todayConversions,
            dailyCap: CONVERSION_CONFIG.dailyCap,
            dailyRemaining: Math.max(0, CONVERSION_CONFIG.dailyCap - todayConversions),
            canConvert: balance >= CONVERSION_CONFIG.pointsPerKey && todayConversions < CONVERSION_CONFIG.dailyCap,
        };
    } catch (error) {
        console.error('[DynamicPoints] Error getting conversion status:', error);
        return {
            balance: 0,
            potentialKeys: 0,
            pointsPerKey: CONVERSION_CONFIG.pointsPerKey,
            todayConversions: 0,
            dailyCap: CONVERSION_CONFIG.dailyCap,
            dailyRemaining: CONVERSION_CONFIG.dailyCap,
            canConvert: false,
        };
    }
}

/**
 * Get points history for a user
 * @param {number} userId - User ID
 * @param {number} limit - Max records to return
 */
async function getPointsHistory(userId, limit = 50) {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('dynamic_points_ledger')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('[DynamicPoints] Error getting history:', error);
        return [];
    }
}

// =============================================
// EXPORTS
// =============================================

module.exports = {
    // Configuration
    CONVERSION_CONFIG,
    DYNAMIC_SOURCES,
    STATIC_SOURCES,
    POINT_VALUES,

    // Core functions
    awardDynamicPoints,
    getConvertibleBalance,
    autoConvertToKeys,
    getConversionStatus,
    getPointsHistory,
    getTodayConversions,
};
