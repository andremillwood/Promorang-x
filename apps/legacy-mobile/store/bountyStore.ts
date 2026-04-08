import { create } from 'zustand';
import { api } from '@/lib/api';

export interface BountyItem {
    id: string;
    thumbnail: string;
    title: string;
    platform: 'tiktok' | 'instagram' | 'youtube' | 'other';
    views: number;
    growthRate: number;
    estimatedValue: string;
    postedAgo: string;
    url: string;
    claimed?: boolean;
}

interface BountyState {
    trendingItems: BountyItem[];
    isLoading: boolean;
    claimBounty: (item: BountyItem) => Promise<void>;
    fetchTrending: () => Promise<void>;
}

export const useBountyStore = create<BountyState>((set, get) => ({
    trendingItems: [],
    isLoading: false,

    fetchTrending: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get<{ success: boolean; data: BountyItem[] }>('/api/bounty/trending');
            if (response.success && Array.isArray(response.data)) {
                set({ trendingItems: response.data });
            }
        } catch (error) {
            console.error('[BountyStore] Error fetching trending:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    claimBounty: async (item: BountyItem) => {
        // Optimistic update
        set((state) => ({
            trendingItems: state.trendingItems.map((i) =>
                i.id === item.id ? { ...i, claimed: true } : i
            ),
        }));

        try {
            const response = await api.post<{ success: boolean; error?: string }>(
                '/api/bounty/scout',
                {
                    url: item.url,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    platform: item.platform
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Failed to claim bounty');
            }
        } catch (error) {
            console.error('[BountyStore] Error claiming bounty:', error);
            // Revert optimistic update on failure
            set((state) => ({
                trendingItems: state.trendingItems.map((i) =>
                    i.id === item.id ? { ...i, claimed: false } : i
                ),
            }));
            throw error; // Re-throw so UI can show toast
        }
    },
}));
