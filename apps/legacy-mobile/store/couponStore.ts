import { create } from 'zustand';
import { api } from '@/lib/api';

export interface UserCoupon {
    id: string;
    coupon_id: string;
    is_redeemed: boolean;
    redeemed_at: string | null;
    redemption_code: string | null;
    assigned_at: string;
    advertiser_coupons: {
        title: string;
        description: string;
        value: number;
        reward_type: 'percentage' | 'fixed' | 'free_item' | 'bogo';
        start_date: string;
        end_date: string;
        redemption_instructions?: string;
        conditions?: {
            min_purchase?: number;
        };
    };
}

interface CouponState {
    coupons: UserCoupon[];
    isLoading: boolean;
    error: string | null;
    fetchCoupons: () => Promise<void>;
    redeemCoupon: (id: string) => Promise<boolean>;
    getCoupon: (id: string | string[] | undefined) => Promise<UserCoupon | undefined>;
}

export const useCouponStore = create<CouponState>((set, get) => ({
    coupons: [],
    isLoading: false,
    error: null,

    fetchCoupons: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<any>('/api/rewards/coupons');
            const data = Array.isArray(response) ? response : (response.data?.coupons || response.coupons || []);
            set({ coupons: data });
        } catch (error: any) {
            console.error('Fetch coupons error:', error);
            set({ error: error.message || 'Failed to fetch coupons' });
        } finally {
            set({ isLoading: false });
        }
    },

    redeemCoupon: async (id: string) => {
        set({ isLoading: true });
        try {
            const response = await api.post<{ success: boolean }>(`/api/rewards/coupons/${id}/redeem`, {});
            if (response.success) {
                set({
                    coupons: get().coupons.map(c =>
                        c.id === id ? { ...c, is_redeemed: true, redeemed_at: new Date().toISOString() } : c
                    )
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Redeem coupon error:', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    getCoupon: async (id) => {
        if (!id) return undefined;
        const stringId = Array.isArray(id) ? id[0] : id;

        // First check local state
        const local = get().coupons.find(c => c.id === stringId);
        if (local) return local;

        // Otherwise fetch specifically
        try {
            const response = await api.get<any>(`/api/rewards/coupons/${stringId}`);
            // The backend returns { coupon: { ... } }
            return response.coupon || (response.success ? response.data : undefined);
        } catch (error) {
            console.error('Fetch single coupon error:', error);
            return undefined;
        }
    }
}));
