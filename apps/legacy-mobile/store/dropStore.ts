import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Drop {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    applications_count: number;
    gem_reward_base: number;
    created_at: string;
}

export interface DropApplication {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    drop: {
        id: string;
        title: string;
    };
}

interface DropState {
    drops: Drop[];
    myDrops: Drop[];
    myApplications: DropApplication[];
    isLoading: boolean;
    fetchDrops: () => Promise<void>;
    fetchMyDrops: (userId: string) => Promise<void>;
    fetchMyApplications: () => Promise<void>;
}

export const useDropStore = create<DropState>((set, get) => ({
    drops: [],
    myDrops: [],
    myApplications: [],
    isLoading: false,

    fetchDrops: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>('/api/drops?limit=20');
            set({ drops: Array.isArray(data) ? data : (data.data?.drops || data.drops || []) });
        } catch (error) {
            console.error('[DropStore] Fetch drops error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMyDrops: async (userId: string) => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>(`/api/users/${userId}/drops`);
            set({ myDrops: Array.isArray(data) ? data : (data.drops || []) });
        } catch (error) {
            console.error('[DropStore] Fetch my drops error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMyApplications: async () => {
        set({ isLoading: true });
        try {
            const data = await api.get<any>('/api/users/drop-applications');
            set({ myApplications: Array.isArray(data) ? data : (data.applications || []) });
        } catch (error) {
            console.error('[DropStore] Fetch applications error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
