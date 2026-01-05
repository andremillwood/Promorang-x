import { create } from 'zustand';
import { Campaign } from '@/types';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

interface CampaignState {
  campaigns: Campaign[];
  myCampaigns: Campaign[];
  isLoading: boolean;
  fetchCampaigns: () => Promise<void>;
  fetchMyCampaigns: () => Promise<void>;
  joinCampaign: (campaignId: string) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  myCampaigns: [],
  isLoading: false,
  fetchCampaigns: async () => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        // Map backend campaign format to mobile Campaign type if needed
        // Assuming the backend mock returns format matching mobile types mostly
        const campaigns: Campaign[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          merchant: c.merchant,
          reward: c.reward,
          rewardType: c.rewardType,
          media: c.media,
          category: c.category,
          shares: c.shares,
          conversions: c.conversions,
          status: c.status,
          expiresAt: c.expiresAt,
          createdAt: c.createdAt
        }));
        set({ campaigns: campaigns });
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchMyCampaigns: async () => {
    // Placeholder - similar to myTasks, we might need a dedicated endpoint
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      // fetch filtered list or from explicit endpoint
    } finally {
      set({ isLoading: false });
    }
  },
  joinCampaign: async (campaignId: string) => {
    set({ isLoading: true });

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/api/campaigns/${campaignId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Optimistic update
      const campaign = get().campaigns.find(c => c.id === campaignId);
      if (campaign) {
        set({ myCampaigns: [...get().myCampaigns, campaign] });
      }
    } catch (error) {
      console.error('Join campaign error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));