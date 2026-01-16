/**
 * User State Utility
 * 
 * Calculates user progression state for state-aware routing and UX.
 * 
 * States:
 * - 0: Brand new, needs onboarding
 * - 1: Active, no rewards yet
 * - 2: First reward earned
 * - 3+: Power user
 */

export type UserState = 0 | 1 | 2 | 3;

export interface UserStateData {
    state: UserState;
    label: string;
    canAccessFullMenu: boolean;
    showCompetitiveUI: boolean;
}

/**
 * Calculate user's progression state
 * @param user - User object from auth context
 */
export function getUserState(user: any): UserStateData {
    if (!user) {
        return {
            state: 0,
            label: 'new',
            canAccessFullMenu: false,
            showCompetitiveUI: false,
        };
    }

    // Check onboarding completion
    const hasCompletedOnboarding = user.has_completed_onboarding ??
        user.onboarding_completed ??
        (user.guide_progress?.['create-account'] === true);

    // Count rewards earned (gems, keys, or any value received)
    const totalRewardsEarned = user.total_rewards_earned ??
        user.rewards_count ??
        (user.gems || 0) + (user.promo_keys || 0);

    // Count verified proofs (content created)
    const verifiedProofs = user.verified_proofs_count ??
        user.proofs_count ??
        0;

    // State 0: Brand new user
    if (!hasCompletedOnboarding) {
        return {
            state: 0,
            label: 'new',
            canAccessFullMenu: false,
            showCompetitiveUI: false,
        };
    }

    // State 1: Active but no rewards
    if (totalRewardsEarned === 0 && verifiedProofs === 0) {
        return {
            state: 1,
            label: 'exploring',
            canAccessFullMenu: false,
            showCompetitiveUI: false,
        };
    }

    // State 2: First reward earned
    if (totalRewardsEarned < 5 || verifiedProofs < 3) {
        return {
            state: 2,
            label: 'engaged',
            canAccessFullMenu: true,
            showCompetitiveUI: false,
        };
    }

    // State 3+: Power user
    return {
        state: 3,
        label: 'power',
        canAccessFullMenu: true,
        showCompetitiveUI: true,
    };
}

/**
 * Get state-based copy for Today page
 */
export function getStateBasedCopy(state: UserState) {
    const copy = {
        headline: {
            0: { title: "Your first opportunity is ready", subtitle: "Complete one simple action today to get started" },
            1: { title: "You're close — one action unlocks more", subtitle: "Today's action moves you forward" },
            2: { title: "Today's opportunity is live", subtitle: "Your activity today affects rewards and rank" },
            3: { title: "Today is a high-impact day", subtitle: "Your actions today compound rewards" },
        },
        multiplier: {
            0: "Welcome boost active today",
            1: "Catch-up boost active",
            2: "Optimize today's actions",
            3: "Multiplier details",
        },
        draw: {
            0: "Participate today to earn your first ticket",
            1: "Every action today earns entries",
            2: "Today's draw closes at reset",
            3: "Competitive draw — maximize entries",
        },
        rank: {
            0: "Rank unlocks after your first day",
            1: "Keep going to see your rank",
            2: "Your rank from yesterday",
            3: "Yesterday's Final Rank",
        },
    };

    return {
        headline: copy.headline[state],
        multiplier: copy.multiplier[state],
        draw: copy.draw[state],
        rank: copy.rank[state],
    };
}

/**
 * Get menu items visible for this state
 */
export function getVisibleMenuItems(state: UserState): string[] {
    const baseItems = ['today', 'earn', 'wallet', 'profile'];

    if (state >= 2) {
        return [
            'today',
            'feed',
            'earn',
            'leaderboard',
            'wallet',
            'promoshare',
            'grow',
            'profile',
        ];
    }

    return baseItems;
}
