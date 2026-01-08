/**
 * PROMORANG USER JOURNEY SERVICE
 * 
 * Implements "One Action Path" - answers the question:
 * "What is the one best thing I should do right now?"
 * 
 * Provides contextual CTAs based on user state to reduce cognitive load.
 */

const { supabase: serviceSupabase } = require('../lib/supabase');
const supabase = global.supabase || serviceSupabase || null;

// Action priorities (higher = more important)
const ACTION_PRIORITIES = {
    COMPLETE_PROOF_DROPS: 100,      // Highest - unlock daily earnings
    CLAIM_DAILY_UNLOCK: 95,         // Almost unlocked
    CONVERT_POINTS_CLOSE: 90,       // Close to a key
    JOIN_HIGH_REWARD_DROP: 80,      // Good opportunity
    CLAIM_FOLLOWER_POINTS: 75,      // Monthly reward available
    VERIFY_SOCIAL_ACCOUNT: 70,      // Onboarding
    COMPLETE_PROFILE: 60,           // Onboarding
    EXPLORE_DROPS: 50,              // General action
    CONVERT_POINTS: 40,             // Has enough points
    CHECK_LEADERBOARD: 30           // Engagement
};

/**
 * Get the recommended next action for a user
 * 
 * @param {string} userId - User ID
 * @returns {object} Next action recommendation
 */
async function getNextAction(userId) {
    const context = await gatherUserContext(userId);
    const actions = [];

    // Priority 1: Complete proof drops for daily unlock
    if (context.proofDropsToday < 3) {
        actions.push({
            priority: ACTION_PRIORITIES.COMPLETE_PROOF_DROPS,
            action: 'COMPLETE_PROOF_DROPS',
            message: `Complete ${3 - context.proofDropsToday} Proof Drops to unlock today's earnings`,
            cta: 'Find Proof Drops',
            route: '/earn?filter=proof',
            icon: 'target',
            color: 'purple'
        });
    }

    // Priority 2: Claim daily unlock if ready
    if (context.proofDropsToday >= 3 && !context.dailyUnlockClaimed) {
        actions.push({
            priority: ACTION_PRIORITIES.CLAIM_DAILY_UNLOCK,
            action: 'CLAIM_DAILY_UNLOCK',
            message: 'Your daily unlock is ready! Claim your earnings now.',
            cta: 'Claim Earnings',
            route: '/wallet',
            icon: 'gift',
            color: 'green'
        });
    }

    // Priority 3: Close to earning a PromoKey
    const pointsToKey = 500 - (context.points % 500);
    if (pointsToKey <= 100 && pointsToKey > 0) {
        actions.push({
            priority: ACTION_PRIORITIES.CONVERT_POINTS_CLOSE,
            action: 'CONVERT_POINTS_CLOSE',
            message: `You're just ${pointsToKey} Points away from a PromoKey!`,
            cta: 'Earn Points',
            route: '/earn',
            icon: 'key',
            color: 'yellow',
            progress: {
                current: context.points % 500,
                target: 500
            }
        });
    }

    // Priority 4: High-reward drop available
    if (context.highRewardDrop) {
        actions.push({
            priority: ACTION_PRIORITIES.JOIN_HIGH_REWARD_DROP,
            action: 'JOIN_HIGH_REWARD_DROP',
            message: `High-reward drop available: ${context.highRewardDrop.title}`,
            cta: `Earn ${context.highRewardDrop.gem_reward_base} Gems`,
            route: `/earn/drop/${context.highRewardDrop.id}`,
            icon: 'gem',
            color: 'blue'
        });
    }

    // Priority 5: Monthly follower points available
    if (context.canClaimFollowerPoints) {
        actions.push({
            priority: ACTION_PRIORITIES.CLAIM_FOLLOWER_POINTS,
            action: 'CLAIM_FOLLOWER_POINTS',
            message: `Claim your monthly Influence Reward: ${context.followerPointsAvailable} Points`,
            cta: 'Claim Reward',
            route: '/profile?openInfluenceRewards=true',
            icon: 'users',
            color: 'pink'
        });
    }

    // Priority 6: Verify social account (onboarding)
    if (!context.hasVerifiedSocial) {
        actions.push({
            priority: ACTION_PRIORITIES.VERIFY_SOCIAL_ACCOUNT,
            action: 'VERIFY_SOCIAL_ACCOUNT',
            message: 'Verify your Instagram to unlock Influence Rewards',
            cta: 'Connect Instagram',
            route: '/profile',
            icon: 'instagram',
            color: 'pink'
        });
    }

    // Priority 7: Complete profile
    if (!context.profileComplete) {
        actions.push({
            priority: ACTION_PRIORITIES.COMPLETE_PROFILE,
            action: 'COMPLETE_PROFILE',
            message: 'Complete your profile to unlock more features',
            cta: 'Edit Profile',
            route: '/profile/edit',
            icon: 'user',
            color: 'gray'
        });
    }

    // Priority 8: Can convert points to keys
    if (context.points >= 500 && context.dailyConversions < 3) {
        actions.push({
            priority: ACTION_PRIORITIES.CONVERT_POINTS,
            action: 'CONVERT_POINTS',
            message: `Convert ${Math.floor(context.points / 500)} Points to PromoKeys`,
            cta: 'Convert Now',
            route: '/wallet',
            icon: 'refresh',
            color: 'purple'
        });
    }

    // Fallback: Explore drops
    if (actions.length === 0) {
        actions.push({
            priority: ACTION_PRIORITIES.EXPLORE_DROPS,
            action: 'EXPLORE_DROPS',
            message: 'Explore available drops and start earning',
            cta: 'Browse Drops',
            route: '/earn',
            icon: 'search',
            color: 'blue'
        });
    }

    // Sort by priority and return top action
    actions.sort((a, b) => b.priority - a.priority);

    return {
        primary: actions[0],
        secondary: actions.slice(1, 3), // Up to 2 secondary actions
        all: actions
    };
}

/**
 * Gather user context for action recommendation
 */
async function gatherUserContext(userId) {
    const context = {
        points: 0,
        promokeys: 0,
        gems: 0,
        proofDropsToday: 0,
        dailyUnlockClaimed: false,
        dailyConversions: 0,
        hasVerifiedSocial: false,
        profileComplete: false,
        canClaimFollowerPoints: false,
        followerPointsAvailable: 0,
        highRewardDrop: null
    };

    if (!supabase) {
        // Demo context
        return {
            ...context,
            points: 420,
            promokeys: 2,
            gems: 15,
            proofDropsToday: 1,
            highRewardDrop: {
                id: 'demo-drop-1',
                title: 'Double Gems Weekend',
                gem_reward_base: 50
            }
        };
    }

    try {
        // Get user balances
        const { data: balances } = await supabase
            .from('user_balances')
            .select('points, promokeys, gems, daily_conversions_count')
            .eq('user_id', userId)
            .single();

        if (balances) {
            context.points = balances.points || 0;
            context.promokeys = balances.promokeys || 0;
            context.gems = balances.gems || 0;
            context.dailyConversions = balances.daily_conversions_count || 0;
        }

        // Get proof drops completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: proofDropCount } = await supabase
            .from('drop_applications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')
            .gte('completed_at', today.toISOString());

        context.proofDropsToday = proofDropCount || 0;

        // Check if verified social
        const { data: user } = await supabase
            .from('users')
            .select('instagram_handle, display_name, bio, avatar_url')
            .eq('id', userId)
            .single();

        if (user) {
            context.hasVerifiedSocial = !!user.instagram_handle;
            context.profileComplete = !!(
                user.display_name &&
                user.bio &&
                user.avatar_url
            );
        }

        // Check follower points availability
        const followerPointsService = require('./followerPointsService');
        const preview = await followerPointsService.getFollowerPointsPreview(userId);
        context.canClaimFollowerPoints = preview.can_claim;
        context.followerPointsAvailable = preview.final_points;

        // Find high-reward drop
        const { data: drops } = await supabase
            .from('drops')
            .select('id, title, gem_reward_base')
            .eq('status', 'active')
            .gt('gem_reward_base', 20)
            .order('gem_reward_base', { ascending: false })
            .limit(1);

        if (drops && drops.length > 0) {
            context.highRewardDrop = drops[0];
        }

    } catch (error) {
        console.error('[User Journey] Error gathering context:', error);
    }

    return context;
}

/**
 * Track action completion for analytics
 */
async function trackActionCompletion(userId, action) {
    if (!supabase) return;

    try {
        // Update onboarding progress
        await supabase.rpc('increment_action_count', {
            p_user_id: userId,
            p_action_type: action
        });
    } catch (error) {
        // Non-critical, just log
        console.log('[User Journey] Action tracked:', action);
    }
}

/**
 * Get journey progress summary
 */
async function getJourneyProgress(userId) {
    const context = await gatherUserContext(userId);

    // Calculate overall progress percentage
    const milestones = [
        { key: 'profile_complete', done: context.profileComplete, label: 'Complete Profile' },
        { key: 'social_verified', done: context.hasVerifiedSocial, label: 'Verify Social Account' },
        { key: 'first_drop', done: context.proofDropsToday > 0, label: 'Complete First Drop' },
        { key: 'first_key', done: context.promokeys > 0, label: 'Earn First PromoKey' },
        { key: 'first_gem', done: context.gems > 0, label: 'Earn First Gem' }
    ];

    const completedMilestones = milestones.filter(m => m.done).length;
    const progressPercent = Math.round((completedMilestones / milestones.length) * 100);

    return {
        progress_percent: progressPercent,
        milestones,
        completed_count: completedMilestones,
        total_count: milestones.length,
        next_milestone: milestones.find(m => !m.done) || null
    };
}

module.exports = {
    getNextAction,
    gatherUserContext,
    trackActionCompletion,
    getJourneyProgress,
    ACTION_PRIORITIES
};
