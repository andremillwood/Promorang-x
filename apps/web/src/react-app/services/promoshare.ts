import { apiFetch } from '../utils/api';

export interface PromoShareCycle {
    id: string;
    cycle_type: 'daily' | 'weekly' | 'monthly';
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

export interface PromoShareDashboardData {
    activeCycle: PromoShareCycle | null;
    userTickets: number;
    totalTickets: number;
    poolItems: PoolItem[];
    // V2 Added Fields
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
