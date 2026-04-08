import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import {
    Gift, Calendar, Camera, Instagram, Trophy, Ticket,
    TrendingUp, Users, Sparkles, Eye, Target
} from 'lucide-react-native';

// Action definitions with priority and requirements
interface ActionDefinition {
    id: string;
    label: string;
    description: string;
    path: string;
    icon: any;
    color: string;
    bgColor: string;
    priority: number;
    minRank?: number;
    maxRank?: number;
    checkCompleted: () => Promise<boolean>;
    isAvailable?: () => Promise<boolean>;
}

export interface WhatsNextSuggestion {
    id: string;
    label: string;
    description: string;
    path: string;
    icon: any;
    color: string;
    bgColor: string;
    isFirstTime: boolean;
}

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

const hasCompleted = async (key: string): Promise<boolean> => {
    try {
        const val = await AsyncStorage.getItem(key);
        return val === 'true';
    } catch {
        return false;
    }
};

export const markStepCompleted = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, 'true');
    } catch (e) {
        console.error('Error marking step completed', e);
    }
};

export function useWhatsNext() {
    const { user } = useAuthStore();
    const { maturityState } = useMaturityStore();
    const [suggestion, setSuggestion] = useState<WhatsNextSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const calculateSuggestion = useCallback(async () => {
        const actions: ActionDefinition[] = [
            {
                id: 'view_headline',
                label: "View Today's Headline",
                description: "See what's featured today and start earning",
                path: '/today',
                icon: Eye,
                color: '#F59E0B',
                bgColor: '#F59E0B20',
                priority: 1,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedHeadline),
            },
            {
                id: 'claim_deal',
                label: 'Claim Your First Deal',
                description: 'Quick brand actions with guaranteed rewards',
                path: '/deals',
                icon: Gift,
                color: '#10B981',
                bgColor: '#10B98120',
                priority: 2,
                maxRank: UserMaturityState.FIRST_TIME,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.claimedDeal),
            },
            {
                id: 'submit_proof',
                label: 'Submit Your Proof',
                description: 'Complete your deal and rank up',
                path: '/post',
                icon: Camera,
                color: '#8B5CF6',
                bgColor: '#8B5CF620',
                priority: 3,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.submittedProof),
                isAvailable: () => hasCompleted(STORAGE_KEYS.claimedDeal),
            },
            {
                id: 'rsvp_event',
                label: 'RSVP to an Event',
                description: 'Meet the community and earn keys',
                path: '/events',
                icon: Calendar,
                color: '#3B82F6',
                bgColor: '#3B82F620',
                priority: 4,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.rsvpedEvent),
            },
            {
                id: 'connect_instagram',
                label: 'Verify Your Presence',
                description: 'Connect Instagram for bonus points',
                path: '/start',
                icon: Instagram,
                color: '#EC4899',
                bgColor: '#EC489920',
                priority: 5,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.connectedInstagram),
            },
            {
                id: 'view_leaderboard',
                label: 'Check the Leaderboard',
                description: 'See where you stand vs other users',
                path: '/leaderboard',
                icon: Trophy,
                color: '#F59E0B',
                bgColor: '#F59E0B20',
                priority: 7,
                minRank: UserMaturityState.REWARDED,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedLeaderboard),
            },
            {
                id: 'view_growth_hub',
                label: 'Explore Growth Hub',
                description: 'Multiply your earnings with advanced features',
                path: '/marketplace',
                icon: Sparkles,
                color: '#8B5CF6',
                bgColor: '#8B5CF620',
                priority: 9,
                minRank: UserMaturityState.OPERATOR_PRO,
                checkCompleted: () => hasCompleted(STORAGE_KEYS.viewedGrowthHub),
            },
        ];

        // Process availability
        const filtered: ActionDefinition[] = [];
        for (const action of actions) {
            if (action.minRank !== undefined && maturityState < action.minRank) continue;
            if (action.maxRank !== undefined && maturityState > action.maxRank) continue;
            if (action.isAvailable && !(await action.isAvailable())) continue;
            if (await action.checkCompleted()) continue;
            filtered.push(action);
        }

        filtered.sort((a, b) => a.priority - b.priority);

        if (filtered.length > 0) {
            const top = filtered[0];
            const seenKey = `promorang_seen_${top.id}`;
            const alreadySeen = await hasCompleted(seenKey);
            return {
                id: top.id,
                label: top.label,
                description: top.description,
                path: top.path,
                icon: top.icon,
                color: top.color,
                bgColor: top.bgColor,
                isFirstTime: !alreadySeen,
            };
        }

        return {
            id: 'daily_checkin',
            label: 'Check In Tomorrow',
            description: 'Come back daily to maintain your streak and rank up',
            path: '/today',
            icon: Target,
            color: '#10B981',
            bgColor: '#10B98120',
            isFirstTime: false,
        };
    }, [maturityState]);

    useEffect(() => {
        let isMounted = true;
        calculateSuggestion().then(res => {
            if (isMounted) {
                setSuggestion(res);
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [calculateSuggestion, user]);

    return { suggestion, isLoading };
}
