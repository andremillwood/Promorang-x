import { create } from 'zustand';
import { api } from '@/lib/api';

export interface StakingChannel {
    id: string;
    name: string;
    description: string;
    apy: number;
    min_stake: number;
    icon: string;
    total_staked: number;
}

export interface StakingPosition {
    id: string;
    channel_id: string;
    amount: number;
    rewards_earned: number;
    created_at: string;
}

export interface FundingProject {
    id: string;
    title: string;
    description: string;
    target_amount: number;
    current_amount: number;
    status: 'active' | 'completed' | 'cancelled';
    expires_at: string;
}

export interface ShieldPolicy {
    id: string;
    name: string;
    description: string;
    premium_amount: number;
    coverage_amount: number;
    duration_days: number;
}

interface GrowthState {
    channels: StakingChannel[];
    stakingPositions: StakingPosition[];
    fundingProjects: FundingProject[];
    shieldPolicies: ShieldPolicy[];
    activeShield: any | null;
    isLoading: boolean;

    fetchChannels: () => Promise<void>;
    fetchStaking: () => Promise<void>;
    stake: (channelId: string, amount: number) => Promise<void>;
    claimRewards: (positionId: string) => Promise<void>;
    fetchFunding: () => Promise<void>;
    fetchShield: () => Promise<void>;
    subscribeShield: (policyId: string) => Promise<void>;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
    channels: [],
    stakingPositions: [],
    fundingProjects: [],
    shieldPolicies: [],
    activeShield: null,
    isLoading: false,

    fetchChannels: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<{ success: boolean; channels: StakingChannel[] }>('/api/growth/channels');
            if (data.success) set({ channels: data.channels });
        } catch (error) {
            console.error('Fetch channels error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStaking: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<{ success: boolean; positions: StakingPosition[] }>('/api/growth/staking');
            if (data.success) set({ stakingPositions: data.positions });
        } catch (error) {
            console.error('Fetch staking error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    stake: async (channelId, amount) => {
        set({ isLoading: true });
        try {
            const data = await api.post<{ success: boolean; error?: string; user?: any }>('/api/growth/stake', { channelId, amount });
            if (!data.success) throw new Error(data.error);

            // Update auth store user balance if returned
            if (data.user) {
                // useAuthStore.getState().setUser(data.user); 
            }

            await get().fetchStaking();
        } catch (error) {
            console.error('Stake error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    claimRewards: async (positionId) => {
        set({ isLoading: true });
        try {
            const data = await api.post<{ success: boolean; error?: string }>(`/api/growth/staking/${positionId}/claim`, {});
            if (!data.success) throw new Error(data.error);
            await get().fetchStaking();
        } catch (error) {
            console.error('Claim rewards error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFunding: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<{ success: boolean; projects: FundingProject[] }>('/api/growth/funding/projects');
            if (data.success) set({ fundingProjects: data.projects });
        } catch (error) {
            console.error('Fetch funding error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchShield: async () => {
        set({ isLoading: true });
        try {
            const [policiesData, activeData] = await Promise.all([
                api.get<{ success: boolean; policies: ShieldPolicy[] }>('/api/growth/shield/policies'),
                api.get<{ success: boolean; subscription: any }>('/api/growth/shield/active')
            ]);

            if (policiesData.success) set({ shieldPolicies: policiesData.policies });
            if (activeData.success) set({ activeShield: activeData.subscription });
        } catch (error) {
            console.error('Fetch shield error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    subscribeShield: async (policyId) => {
        set({ isLoading: true });
        try {
            const data = await api.post<{ success: boolean; error?: string }>('/api/growth/shield/subscribe', { policy_id: policyId });
            if (!data.success) throw new Error(data.error);
            await get().fetchShield();
        } catch (error) {
            console.error('Subscribe shield error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}));
