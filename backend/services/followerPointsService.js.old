/**
 * PROMORANG FOLLOWER POINTS SERVICE
 * 
 * Implements engagement-weighted, diminishing returns follower point calculation
 * with trust tier gating to prevent follower abuse.
 * 
 * Core Formula:
 * Effective Followers = min(Raw Followers, Raw Followers × (Engagement Rate / Platform Median ER))
 * Monthly Points = DiminshedPoints(Effective Followers) × Trust Multiplier
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Default configuration (can be overridden from economy_config table)
const DEFAULT_CONFIG = {
    platformMedianER: 0.035, // 3.5% median engagement rate

    followerTiers: [
        { max: 2000, pointsPerFollower: 10 },
        { max: 10000, pointsPerFollower: 4 },
        { max: Infinity, pointsPerFollower: 1 }
    ],

    trustMultipliers: {
        low: 0.5,
        standard: 1.0,
        high: 1.2
    }
};

let configCache = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minute

/**
 * Get economy configuration from database
 */
async function getConfig() {
    const now = Date.now();
    if (configCache && now - configCacheTime < CONFIG_CACHE_TTL) {
        return configCache;
    }

    if (!supabase) {
        return DEFAULT_CONFIG;
    }

    try {
        const { data: configs } = await supabase
            .from('economy_config')
            .select('key, value')
            .in('key', ['platform_median_engagement_rate', 'follower_tiers', 'trust_multipliers']);

        const config = { ...DEFAULT_CONFIG };

        if (configs) {
            for (const c of configs) {
                switch (c.key) {
                    case 'platform_median_engagement_rate':
                        config.platformMedianER = parseFloat(c.value) || DEFAULT_CONFIG.platformMedianER;
                        break;
                    case 'follower_tiers':
                        config.followerTiers = JSON.parse(c.value).map(t => ({
                            max: t.max === null ? Infinity : t.max,
                            pointsPerFollower: t.points_per_follower
                        }));
                        break;
                    case 'trust_multipliers':
                        config.trustMultipliers = JSON.parse(c.value);
                        break;
                }
            }
        }

        configCache = config;
        configCacheTime = now;
        return config;
    } catch (error) {
        console.error('[Follower Points] Error loading config:', error);
        return DEFAULT_CONFIG;
    }
}

/**
 * Calculate effective followers based on engagement rate
 * 
 * @param {number} rawFollowers - Raw follower count
 * @param {number} engagementRate - Engagement rate (0-1 scale, e.g., 0.035 = 3.5%)
 * @returns {number} Effective follower count
 */
function calculateEffectiveFollowers(rawFollowers, engagementRate, platformMedianER) {
    if (rawFollowers <= 0) return 0;
    if (engagementRate <= 0) return 0;

    const erRatio = engagementRate / platformMedianER;
    // Effective followers cannot exceed raw followers
    return Math.min(rawFollowers, Math.floor(rawFollowers * erRatio));
}

/**
 * Calculate points with diminishing returns curve
 * 
 * Tiers:
 * - 0-2,000 followers: 10 pts/follower
 * - 2,001-10,000 followers: 4 pts/follower  
 * - 10,001+: 1 pt/follower
 * 
 * @param {number} effectiveFollowers - Engagement-weighted follower count
 * @param {Array} tiers - Follower tier configuration
 * @returns {number} Points before trust multiplier
 */
function calculateDiminishedPoints(effectiveFollowers, tiers) {
    if (effectiveFollowers <= 0) return 0;

    let points = 0;
    let remaining = effectiveFollowers;
    let previousMax = 0;

    for (const tier of tiers) {
        const tierMax = tier.max === Infinity ? remaining : tier.max;
        const tierSize = tierMax - previousMax;
        const followersInTier = Math.min(remaining, tierSize);

        if (followersInTier <= 0) break;

        points += followersInTier * tier.pointsPerFollower;
        remaining -= followersInTier;
        previousMax = tierMax;

        if (remaining <= 0) break;
    }

    return Math.floor(points);
}

/**
 * Get user's engagement metrics from database
 */
async function getEngagementMetrics(userId) {
    if (!supabase) {
        return {
            raw_followers: 0,
            engagement_rate: 0,
            effective_followers: 0
        };
    }

    try {
        const { data, error } = await supabase
            .from('user_engagement_metrics')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Record doesn't exist, create it
            const { data: newData } = await supabase
                .from('user_engagement_metrics')
                .insert({ user_id: userId })
                .select()
                .single();
            return newData || { raw_followers: 0, engagement_rate: 0, effective_followers: 0 };
        }

        return data || { raw_followers: 0, engagement_rate: 0, effective_followers: 0 };
    } catch (error) {
        console.error('[Follower Points] Error getting engagement metrics:', error);
        return { raw_followers: 0, engagement_rate: 0, effective_followers: 0 };
    }
}

/**
 * Get user's trust tier and multiplier
 */
async function getTrustTier(userId) {
    if (!supabase) {
        return { trust_level: 'standard', multiplier: 1.0 };
    }

    try {
        const config = await getConfig();

        const { data, error } = await supabase
            .from('user_trust_tiers')
            .select('trust_level, custom_multiplier')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return { trust_level: 'standard', multiplier: 1.0 };
        }

        // Use custom multiplier if set, otherwise use config
        const multiplier = data.custom_multiplier ||
            config.trustMultipliers[data.trust_level] ||
            1.0;

        return {
            trust_level: data.trust_level,
            multiplier
        };
    } catch (error) {
        console.error('[Follower Points] Error getting trust tier:', error);
        return { trust_level: 'standard', multiplier: 1.0 };
    }
}

/**
 * Update engagement metrics for a user
 * 
 * @param {string} userId - User ID
 * @param {object} metrics - New metrics { raw_followers, engagement_rate, ... }
 */
async function updateEngagementMetrics(userId, metrics) {
    if (!supabase) throw new Error('Database not available');

    const config = await getConfig();

    // Calculate effective followers
    const effectiveFollowers = calculateEffectiveFollowers(
        metrics.raw_followers || 0,
        metrics.engagement_rate || 0,
        config.platformMedianER
    );

    try {
        const { error } = await supabase
            .from('user_engagement_metrics')
            .upsert({
                user_id: userId,
                raw_followers: metrics.raw_followers || 0,
                engagement_rate: metrics.engagement_rate || 0,
                avg_likes_per_post: metrics.avg_likes_per_post || 0,
                avg_comments_per_post: metrics.avg_comments_per_post || 0,
                total_posts_analyzed: metrics.total_posts_analyzed || 0,
                effective_followers: effectiveFollowers,
                last_synced_at: new Date().toISOString(),
                last_calculated_at: new Date().toISOString()
            });

        if (error) throw error;

        return { success: true, effective_followers: effectiveFollowers };
    } catch (error) {
        console.error('[Follower Points] Error updating metrics:', error);
        throw error;
    }
}

/**
 * Calculate monthly follower points for a user
 * 
 * @param {string} userId - User ID
 * @returns {object} Calculation breakdown and final points
 */
async function calculateMonthlyFollowerPoints(userId) {
    const config = await getConfig();
    const metrics = await getEngagementMetrics(userId);
    const trust = await getTrustTier(userId);

    // Step 1: Calculate effective followers (engagement-weighted)
    const effectiveFollowers = calculateEffectiveFollowers(
        metrics.raw_followers || 0,
        metrics.engagement_rate || 0,
        config.platformMedianER
    );

    // Step 2: Apply diminishing returns
    const diminishedPoints = calculateDiminishedPoints(effectiveFollowers, config.followerTiers);

    // Step 3: Apply trust multiplier
    const finalPoints = Math.floor(diminishedPoints * trust.multiplier);

    return {
        raw_followers: metrics.raw_followers || 0,
        engagement_rate: metrics.engagement_rate || 0,
        effective_followers: effectiveFollowers,
        trust_level: trust.trust_level,
        trust_multiplier: trust.multiplier,
        base_points: effectiveFollowers * 10, // For reference
        diminished_points: diminishedPoints,
        final_points: finalPoints
    };
}

/**
 * Claim monthly follower points
 * 
 * @param {string} userId - User ID
 * @returns {object} Claim result
 */
async function claimMonthlyFollowerPoints(userId) {
    if (!supabase) throw new Error('Database not available');

    // Check if already claimed this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const claimMonth = currentMonth.toISOString().split('T')[0];

    try {
        const { data: existingClaim } = await supabase
            .from('follower_points_claims')
            .select('id')
            .eq('user_id', userId)
            .eq('claim_month', claimMonth)
            .single();

        if (existingClaim) {
            throw new Error('You have already claimed follower points this month');
        }

        // Calculate points
        const calculation = await calculateMonthlyFollowerPoints(userId);

        if (calculation.final_points <= 0) {
            throw new Error('No follower points to claim. Verify your account and grow your engagement.');
        }

        // Record the claim
        const { error: claimError } = await supabase
            .from('follower_points_claims')
            .insert({
                user_id: userId,
                claim_month: claimMonth,
                raw_followers: calculation.raw_followers,
                engagement_rate: calculation.engagement_rate,
                effective_followers: calculation.effective_followers,
                trust_level: calculation.trust_level,
                trust_multiplier: calculation.trust_multiplier,
                base_points: calculation.base_points,
                diminished_points: calculation.diminished_points,
                final_points: calculation.final_points
            });

        if (claimError) throw claimError;

        // Add points to user balance
        const economyService = require('./economyService');
        await economyService.addCurrency(
            userId,
            'points',
            calculation.final_points,
            'monthly_follower_reward',
            null,
            `Monthly follower reward: ${calculation.effective_followers} effective followers`
        );

        return {
            success: true,
            points_earned: calculation.final_points,
            breakdown: calculation
        };
    } catch (error) {
        console.error('[Follower Points] Error claiming points:', error);
        throw error;
    }
}

/**
 * Update user's trust tier based on proof quality
 * 
 * @param {string} userId - User ID
 * @param {string} action - 'proof_approved' | 'proof_rejected' | 'flagged'
 */
async function updateTrustTier(userId, action) {
    if (!supabase) return;

    try {
        // Get current tier data
        const { data: current } = await supabase
            .from('user_trust_tiers')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!current) {
            await supabase.from('user_trust_tiers').insert({ user_id: userId });
            return;
        }

        const updates = { last_evaluated_at: new Date().toISOString() };

        switch (action) {
            case 'proof_approved':
                updates.completed_proofs = (current.completed_proofs || 0) + 1;
                updates.approved_proofs = (current.approved_proofs || 0) + 1;
                updates.proof_quality_score = Math.min(100, (current.proof_quality_score || 50) + 2);
                break;
            case 'proof_rejected':
                updates.completed_proofs = (current.completed_proofs || 0) + 1;
                updates.rejected_proofs = (current.rejected_proofs || 0) + 1;
                updates.proof_quality_score = Math.max(0, (current.proof_quality_score || 50) - 5);
                break;
            case 'flagged':
                updates.flagged_count = (current.flagged_count || 0) + 1;
                updates.proof_quality_score = Math.max(0, (current.proof_quality_score || 50) - 15);
                break;
        }

        // Determine new trust level
        const score = updates.proof_quality_score !== undefined
            ? updates.proof_quality_score
            : current.proof_quality_score;
        const flagged = updates.flagged_count !== undefined
            ? updates.flagged_count
            : current.flagged_count;

        if (flagged >= 3 || score < 30) {
            updates.trust_level = 'low';
        } else if (score >= 75 && (current.approved_proofs || 0) >= 10) {
            updates.trust_level = 'high';
        } else {
            updates.trust_level = 'standard';
        }

        await supabase
            .from('user_trust_tiers')
            .update(updates)
            .eq('user_id', userId);

    } catch (error) {
        console.error('[Follower Points] Error updating trust tier:', error);
    }
}

/**
 * Get follower points preview (without claiming)
 */
async function getFollowerPointsPreview(userId) {
    const calculation = await calculateMonthlyFollowerPoints(userId);

    // Check claim status
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const claimMonth = currentMonth.toISOString().split('T')[0];

    let alreadyClaimed = false;
    if (supabase) {
        const { data } = await supabase
            .from('follower_points_claims')
            .select('id')
            .eq('user_id', userId)
            .eq('claim_month', claimMonth)
            .single();
        alreadyClaimed = !!data;
    }

    return {
        ...calculation,
        can_claim: !alreadyClaimed && calculation.final_points > 0,
        already_claimed_this_month: alreadyClaimed
    };
}

module.exports = {
    calculateEffectiveFollowers,
    calculateDiminishedPoints,
    calculateMonthlyFollowerPoints,
    claimMonthlyFollowerPoints,
    getEngagementMetrics,
    updateEngagementMetrics,
    getTrustTier,
    updateTrustTier,
    getFollowerPointsPreview,
    getConfig
};
