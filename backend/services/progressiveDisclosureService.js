/**
 * PROMORANG PROGRESSIVE DISCLOSURE SERVICE
 * 
 * Controls feature visibility based on user onboarding stage.
 * New users see a simplified UI that gradually reveals complexity.
 * 
 * Week 1: Points, Daily Unlock, Gems Earned
 * Week 2+: PromoKeys, Conversion Rates, Master Key
 * Week 3+: Leaderboard Math, Advanced Analytics
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Feature visibility configuration
const FEATURE_TIERS = {
    week_1: [
        'points',
        'daily_unlock',
        'gems_earned',
        'drops_basic',
        'profile_basic'
    ],
    week_2: [
        'promokeys',
        'conversion_rates',
        'master_key',
        'drops_advanced',
        'sponsorships_basic'
    ],
    week_3: [
        'leaderboard_math',
        'advanced_analytics',
        'content_shares',
        'predictions',
        'relay_system'
    ]
};

// All features flattened
const ALL_FEATURES = [
    ...FEATURE_TIERS.week_1,
    ...FEATURE_TIERS.week_2,
    ...FEATURE_TIERS.week_3
];

/**
 * Get user's onboarding progress
 */
async function getOnboardingProgress(userId) {
    if (!supabase) {
        return {
            user_id: userId,
            onboarding_week: 3,
            revealed_features: ALL_FEATURES,
            show_all_features: true,
            has_completed_tour: true
        };
    }

    try {
        const { data, error } = await supabase
            .from('user_onboarding_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Create record for user
            const { data: newData } = await supabase
                .from('user_onboarding_progress')
                .insert({ user_id: userId })
                .select()
                .single();
            return newData;
        }

        return data;
    } catch (error) {
        console.error('[Progressive Disclosure] Error getting progress:', error);
        return null;
    }
}

/**
 * Calculate weeks since user signup
 */
function calculateWeeksSinceSignup(firstLoginAt) {
    if (!firstLoginAt) return 1;

    const firstLogin = new Date(firstLoginAt);
    const now = new Date();
    const diffMs = now - firstLogin;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return Math.max(1, Math.ceil(diffDays / 7));
}

/**
 * Get features visible to user based on their onboarding stage
 */
async function getVisibleFeatures(userId) {
    const progress = await getOnboardingProgress(userId);

    if (!progress) {
        // Default to showing all for safety
        return ALL_FEATURES;
    }

    // If manually set to show all, return everything
    if (progress.show_all_features) {
        return ALL_FEATURES;
    }

    // Calculate based on signup date
    const weeksSinceSignup = calculateWeeksSinceSignup(progress.first_login_at);

    let visibleFeatures = [...FEATURE_TIERS.week_1];

    if (weeksSinceSignup >= 2) {
        visibleFeatures = [...visibleFeatures, ...FEATURE_TIERS.week_2];
    }

    if (weeksSinceSignup >= 3) {
        visibleFeatures = [...visibleFeatures, ...FEATURE_TIERS.week_3];
    }

    // Also include any manually revealed features
    if (progress.revealed_features && Array.isArray(progress.revealed_features)) {
        for (const feature of progress.revealed_features) {
            if (!visibleFeatures.includes(feature)) {
                visibleFeatures.push(feature);
            }
        }
    }

    return visibleFeatures;
}

/**
 * Check if a specific feature is visible to user
 */
async function isFeatureVisible(userId, featureKey) {
    const visibleFeatures = await getVisibleFeatures(userId);
    return visibleFeatures.includes(featureKey);
}

/**
 * Manually reveal a feature to user
 */
async function revealFeature(userId, featureKey) {
    if (!supabase) return;

    try {
        const progress = await getOnboardingProgress(userId);
        if (!progress) return;

        const currentFeatures = progress.revealed_features || [];

        if (!currentFeatures.includes(featureKey)) {
            currentFeatures.push(featureKey);

            await supabase
                .from('user_onboarding_progress')
                .update({
                    revealed_features: currentFeatures,
                    last_feature_revealed_at: new Date().toISOString()
                })
                .eq('user_id', userId);
        }
    } catch (error) {
        console.error('[Progressive Disclosure] Error revealing feature:', error);
    }
}

/**
 * Set show_all_features for power users or after onboarding
 */
async function unlockAllFeatures(userId) {
    if (!supabase) return;

    try {
        await supabase
            .from('user_onboarding_progress')
            .update({
                show_all_features: true,
                revealed_features: ALL_FEATURES
            })
            .eq('user_id', userId);
    } catch (error) {
        console.error('[Progressive Disclosure] Error unlocking all features:', error);
    }
}

/**
 * Get onboarding tour status
 */
async function getTourStatus(userId) {
    const progress = await getOnboardingProgress(userId);

    return {
        has_completed_tour: progress?.has_completed_tour || false,
        current_step: progress?.tour_step || 0,
        should_show_tour: !progress?.has_completed_tour
    };
}

/**
 * Update tour progress
 */
async function updateTourProgress(userId, step, completed = false) {
    if (!supabase) return;

    try {
        const updates = { tour_step: step };
        if (completed) {
            updates.has_completed_tour = true;
        }

        await supabase
            .from('user_onboarding_progress')
            .update(updates)
            .eq('user_id', userId);
    } catch (error) {
        console.error('[Progressive Disclosure] Error updating tour:', error);
    }
}

/**
 * Get disclosure summary for frontend
 */
async function getDisclosureSummary(userId) {
    const progress = await getOnboardingProgress(userId);
    const visibleFeatures = await getVisibleFeatures(userId);
    const weeksSinceSignup = calculateWeeksSinceSignup(progress?.first_login_at);

    return {
        onboarding_week: weeksSinceSignup,
        show_all_features: progress?.show_all_features || false,
        visible_features: visibleFeatures,
        hidden_features: ALL_FEATURES.filter(f => !visibleFeatures.includes(f)),
        tour_completed: progress?.has_completed_tour || false,
        next_features_unlock_week: weeksSinceSignup < 3 ? weeksSinceSignup + 1 : null,
        features_by_tier: FEATURE_TIERS
    };
}

module.exports = {
    getOnboardingProgress,
    getVisibleFeatures,
    isFeatureVisible,
    revealFeature,
    unlockAllFeatures,
    getTourStatus,
    updateTourProgress,
    getDisclosureSummary,
    FEATURE_TIERS,
    ALL_FEATURES
};
