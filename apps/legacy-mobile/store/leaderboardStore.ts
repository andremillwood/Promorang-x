import { create } from 'zustand';
import { api } from '@/lib/api';

export interface LeaderboardEntry {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    profile_image?: string;
    points_earned: number;
    gems_earned: number;
    keys_used: number;
    gold_collected: number;
    composite_score: number;
}

export type Period = 'daily' | 'weekly' | 'monthly';

interface LeaderboardState {
    leaderboard: LeaderboardEntry[];
    isLoading: boolean;
    fetchLeaderboard: (period: Period) => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
    leaderboard: [],
    isLoading: false,

    fetchLeaderboard: async (period: Period) => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>(`/api/leaderboard/${period}`);
            const entries = Array.isArray(data) ? data : (data.data?.entries || []);
            set({ leaderboard: entries });
        } catch (error) {
            console.error('[LeaderboardStore] Fetch error:', error);
            set({ leaderboard: [] });
        } finally {
            set({ isLoading: false });
        }
    },
}));
