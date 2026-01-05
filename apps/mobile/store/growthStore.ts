import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'https://promorang-api.vercel.app';

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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/growth/channels`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/growth/staking`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/growth/stake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ channelId, amount }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            // Update auth store user balance if returned
            if (data.user) {
                // useAuthStore.getState().setUser(data.user); // if we add setUser to authStore
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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/growth/staking/${positionId}/claim`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/growth/funding/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
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
            const token = useAuthStore.getState().token;
            const [policiesRes, activeRes] = await Promise.all([
                fetch(`${API_URL}/api/growth/shield/policies`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/growth/shield/active`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            const policiesData = await policiesRes.json();
            const activeData = await activeRes.json();

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
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/growth/shield/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ policy_id: policyId }),
            });
            const data = await response.json();
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
