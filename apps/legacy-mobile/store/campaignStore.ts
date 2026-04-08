import { create } from 'zustand';
import { Campaign } from '@/types';
import { api } from '@/lib/api';

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
      const response = await api.get<any>('/api/campaigns');

      // Handle both array response and { success, data } format
      const data = Array.isArray(response) ? response : (response.data || []);

      if (Array.isArray(data)) {
        const campaigns: Campaign[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          merchant: c.merchant || c.brand_name || 'Promorang',
          reward: c.reward || c.gem_reward || 0,
          rewardType: c.rewardType || 'gems',
          media: c.media || c.thumbnail_url || '',
          category: c.category || '',
          shares: c.shares || 0,
          conversions: c.conversions || 0,
          status: c.status || 'active',
          expiresAt: c.expiresAt || c.end_date,
          createdAt: c.createdAt || c.created_at
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
    set({ isLoading: true });
    try {
      const response = await api.get<any>('/api/campaigns/my');
      const data = Array.isArray(response) ? response : (response.data || []);

      if (Array.isArray(data)) {
        // Mapping logic similar to fetchCampaigns
        set({ myCampaigns: data });
      }
    } catch (error) {
      console.error('Fetch my campaigns error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  joinCampaign: async (campaignId: string) => {
    set({ isLoading: true });

    try {
      const data = await api.post<{ success: boolean; error?: string }>(`/api/campaigns/${campaignId}/join`, {});
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