/**
 * useWhatsNext Hook
 * 
 * Determines the single best next action for a user based on:
 * - Completed actions (from localStorage + API)
 * - User state (maturity level, streak, balances)
 * - Time-sensitive opportunities
 * 
 * Returns a prioritized suggestion with CTA.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useMaturity } from '../context/MaturityContext';
import {
    Gift, Calendar, Camera, Instagram, Trophy, Ticket,
    TrendingUp, Users, Sparkles, Eye, Target
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Action definitions with priority and requirements
interface ActionDefinition {
    id: string;
    label: string;
    description: string;
    path: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    priority: number; // Lower = higher priority
    minRank?: number;
    maxRank?: number;
    checkCompleted: () => boolean;
    isAvailable?: () => boolean;
}

export interface WhatsNextSuggestion {
    id: string;
    label: string;
    description: string;
    path: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    isFirstTime: boolean;
}

// LocalStorage keys for tracking
const STORAGE_KEYS = {
    viewedHeadline: 'promorang_viewed_headline',
    claimedDeal: 'promorang_claimed_deal',
    rsvpedEvent: 'promorang_rsvped_event',
    submittedProof: 'promorang_submitted_proof',
    viewedLeaderboard: 'promorang_viewed_leaderboard',
    viewedAccessRank: 'promorang_viewed_access_rank',
    connectedInstagram: 'promorang_connected_instagram',
    enteredDraw: 'promorang_entered_draw',
    invitedFriend: 'promorang_invited_friend',
    viewedGrowthHub: 'promorang_viewed_growth_hub',
};

// Helper to check localStorage
const hasCompleted = (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(key) === 'true';
};

// Helper to mark as completed
export const markCompleted = (key: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, 'true');
    }
};

// Export storage keys for use elsewhere
export { STORAGE_KEYS };

export function useWhatsNext() {
    const { user } = useAuth();
    const { maturityState } = useMaturity();
    const [suggestion, setSuggestion] = useState<WhatsNextSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const calculateSuggestion = useCallback(() => {
        // Define all possible actions ordered by priority
        const actions: ActionDefinition[] = [
            // Priority 1: View today's headline (if not viewed)
            {
                id: 'view_headline',
                label: "View Today's Headline",
                description: "See what's featured today and start earning",
                path: '/today',
                icon: Eye,
                color: 'text-amber-500',
                bgColor: 'bg-amber-500/10',
                priority: 1,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedHeadline),
            },
            // Priority 2: Claim first deal (high impact for new users)
            {
                id: 'claim_deal',
                label: 'Claim Your First Deal',
                description: 'Quick brand actions with guaranteed rewards',
                path: '/deals',
                icon: Gift,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10',
                priority: 2,
                maxRank: 1,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.claimedDeal),
            },
            // Priority 3: Submit proof (if deal claimed but no proof)
            {
                id: 'submit_proof',
                label: 'Submit Your Proof',
                description: 'Complete your deal and rank up',
                path: '/post',
                icon: Camera,
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
                priority: 3,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.submittedProof),
                isAvailable: () => hasCompleted(STORAGE_KEYS.claimedDeal),
            },
            // Priority 4: RSVP to event
            {
                id: 'rsvp_event',
                label: 'RSVP to an Event',
                description: 'Meet the community and earn keys',
                path: '/events-entry',
                icon: Calendar,
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
                priority: 4,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.rsvpedEvent),
            },
            // Priority 5: Connect Instagram (powerful for points)
            {
                id: 'connect_instagram',
                label: 'Verify Your Presence',
                description: 'Connect Instagram for bonus points',
                path: '/start',
                icon: Instagram,
                color: 'text-pink-500',
                bgColor: 'bg-pink-500/10',
                priority: 5,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.connectedInstagram),
            },
            // Priority 6: View Access Rank (educational)
            {
                id: 'view_access_rank',
                label: 'Check Your Progress',
                description: 'See how you rank and what unlocks next',
                path: '/access-rank',
                icon: TrendingUp,
                color: 'text-indigo-500',
                bgColor: 'bg-indigo-500/10',
                priority: 6,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedAccessRank),
            },
            // Priority 7: View Leaderboard (rank 2+)
            {
                id: 'view_leaderboard',
                label: 'Check the Leaderboard',
                description: 'See where you stand vs other users',
                path: '/leaderboard',
                icon: Trophy,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10',
                priority: 7,
                minRank: 2,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedLeaderboard),
            },
            // Priority 8: Invite a friend (rank 2+)
            {
                id: 'invite_friend',
                label: 'Invite a Friend',
                description: 'Earn referral rewards when they join',
                path: '/referrals',
                icon: Users,
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
                priority: 8,
                minRank: 2,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.invitedFriend),
            },
            // Priority 9: Explore Growth Hub (rank 3+)
            {
                id: 'view_growth_hub',
                label: 'Explore Growth Hub',
                description: 'Multiply your earnings with advanced features',
                path: '/growth-hub',
                icon: Sparkles,
                color: 'text-purple-500',
                bgColor: 'bg-purple-500/10',
                priority: 9,
                minRank: 3,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedGrowthHub),
            },
            // Priority 10: Enter daily draw (fallback for active users)
            {
                id: 'enter_draw',
                label: 'Enter Today\'s Draw',
                description: 'Complete actions to earn tickets',
                path: '/today',
                icon: Ticket,
                color: 'text-violet-500',
                bgColor: 'bg-violet-500/10',
                priority: 10,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.enteredDraw),
            },
        ];

        // Filter actions based on rank requirements and availability
        const availableActions = actions.filter(action => {
            // Check rank requirements
            if (action.minRank !== undefined && maturityState < action.minRank) return false;
            if (action.maxRank !== undefined && maturityState > action.maxRank) return false;

            // Check if action is available (dependency check)
            if (action.isAvailable && !action.isAvailable()) return false;

            // Check if not completed
            if (action.checkCompleted()) return false;

            return true;
        });

        // Sort by priority and pick the first one
        availableActions.sort((a, b) => a.priority - b.priority);

        if (availableActions.length > 0) {
            const topAction = availableActions[0];
            return {
                id: topAction.id,
                label: topAction.label,
                description: topAction.description,
                path: topAction.path,
                icon: topAction.icon,
                color: topAction.color,
                bgColor: topAction.bgColor,
                isFirstTime: !hasCompleted(`promorang_seen_${topAction.id}`),
            };
        }

        // Fallback: Encourage daily check-in
        return {
            id: 'daily_checkin',
            label: 'Check In Tomorrow',
            description: 'Come back daily to maintain your streak and rank up',
            path: '/today',
            icon: Target,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            isFirstTime: false,
        };
    }, [maturityState]);

    useEffect(() => {
        setIsLoading(true);
        const result = calculateSuggestion();
        setSuggestion(result);
        setIsLoading(false);
    }, [calculateSuggestion, user]);

    // Function to refresh suggestion (call after completing an action)
    const refreshSuggestion = useCallback(() => {
        const result = calculateSuggestion();
        setSuggestion(result);
    }, [calculateSuggestion]);

    return {
        suggestion,
        isLoading,
        refreshSuggestion,
        markCompleted,
        STORAGE_KEYS,
    };
}

export default useWhatsNext;
