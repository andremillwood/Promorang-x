import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

export interface AdvertiserDrop {
    id: string;
    title: string;
    drop_type: string;
    difficulty: string;
    total_applications: number;
    gems_paid: number;
    total_spend: number;
    created_at: string;
    status: string;
}

export interface AdvertiserAnalytics {
    period_start: string;
    drops_created: number;
    total_participants: number;
    gems_spent: number;
    impressions: number;
    engagement_rate: number;
}

export interface SuggestedContent {
    id: string;
    title: string;
    creator_name: string;
    platform: string;
    platform_url: string;
    impressions_last_7_days: number;
    engagement_rate: number;
    thumbnail_url: string;
    category: string;
}

interface AdvertiserState {
    drops: AdvertiserDrop[];
    analytics: AdvertiserAnalytics[];
    suggestedContent: SuggestedContent[];
    userTier: string;
    monthlyInventory: any;
    isLoading: boolean;

    fetchDashboard: () => Promise<void>;
    fetchSuggestedContent: () => Promise<void>;
}

export const useAdvertiserStore = create<AdvertiserState>((set) => ({
    drops: [],
    analytics: [],
    suggestedContent: [],
    userTier: 'free',
    monthlyInventory: {},
    isLoading: false,

    fetchDashboard: async () => {
        set({ isLoading: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.drops) {
                set({
                    drops: data.drops,
                    analytics: data.analytics,
                    userTier: data.user_tier,
                    monthlyInventory: data.monthly_inventory || data.weekly_inventory || {}
                });
            }
        } catch (error) {
            console.error('Fetch advertiser dashboard error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSuggestedContent: async () => {
        set({ isLoading: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/suggested-content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                set({ suggestedContent: data });
            }
        } catch (error) {
            console.error('Fetch suggested content error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
