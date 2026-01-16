import { apiFetch } from '../utils/api';

export type DrawType = 'daily' | 'weekly' | 'monthly' | 'grand';

export interface PromoShareCycle {
    id: string;
    cycle_type: DrawType;
    status: 'active' | 'completed' | 'cancelled';
    start_at: string;
    end_at: string;
    config: Record<string, any>;
}

export interface PoolItem {
    id: string;
    reward_type: 'gem' | 'key' | 'point' | 'coupon' | 'product' | 'other';
    amount: number;
    description: string;
    image_url?: string;
    sponsor_id?: string;
}

export interface DrawData {
    id: string | number;
    cycle_type: DrawType;
    status?: string;
    start_at?: string;
    end_at: string;
    jackpot_amount: number;
    is_rollover: boolean;
    userTickets: number;
    totalTickets: number;
    ticketNumbers?: number[];
    poolItems: PoolItem[];
}

export interface PromoShareDashboardData {
    // New multi-draw support
    draws?: DrawData[];
    // Legacy fields for backward compatibility
    activeCycle: PromoShareCycle | null;
    userTickets: number;
    totalTickets: number;
    poolItems: PoolItem[];
    currentJackpot?: number;
    ticketNumbers?: number[];
    isRollover?: boolean;
}

export const promoShareService = {
    async getDashboard(): Promise<PromoShareDashboardData | null> {
        try {
            const response = await apiFetch('/api/promoshare/dashboard');
            const result = await response.json();

            if (result.success) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching PromoShare dashboard:', error);
            return null;
        }
    },

    async getHistory(): Promise<any[]> {
        try {
            const response = await apiFetch('/api/promoshare/history');
            const result = await response.json();

            if (result.success) {
                return result.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching PromoShare history:', error);
            return [];
        }
    },

    async sponsorCycle(data: { cycle_id: number; reward_type: string; amount: number; description: string }) {
        const response = await apiFetch('/api/promoshare/sponsorship', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!json.success) throw new Error(json.error);
        return json.data;
    }
};
