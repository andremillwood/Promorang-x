import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = 'https://api.promorang.co';

export interface AdvertiserDrop {
    id: string;
    title: string;
    description?: string;
    drop_type: string;
    difficulty: string;
    total_applications: number;
    gem_reward_base?: number;
    gems_paid: number;
    total_spend: number;
    created_at: string;
    status: string;
}

export interface AdvertiserAnalytics {
    id?: string;
    period_start: string;
    period_end?: string;
    drops_created: number;
    total_participants: number;
    gems_spent: number;
    impressions: number;
    engagement_rate: number;
}

export interface SuggestedContent {
    id: string;
    title: string;
    description?: string;
    creator_name: string;
    platform: string;
    platform_url: string;
    impressions_last_7_days: number;
    total_engagement?: number;
    engagement_rate: number;
    roi_potential?: number;
    thumbnail_url: string;
    category: string;
    is_trending?: boolean;
    suggested_package?: string;
}

// Campaign content item (URLs, images, videos to promote)
export interface CampaignContentItem {
    id: string;
    type: 'image' | 'video' | 'link' | 'text';
    title: string;
    url?: string;
    description?: string;
}

// Campaign drop (creator task)
export interface CampaignDrop {
    id: string;
    title: string;
    description: string;
    type: 'share' | 'create' | 'engage' | 'review';
    gem_reward: number;
    keys_cost: number;
    max_participants: number;
    current_participants?: number;
    requirements?: string;
    status?: 'active' | 'completed' | 'paused';
}

// Campaign coupon
export interface CampaignCoupon {
    id: string;
    title: string;
    description?: string;
    discount_type: 'percent' | 'fixed' | 'freebie';
    discount_value: number;
    quantity: number;
    quantity_claimed?: number;
}

export interface Campaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'draft' | 'completed';
    start_date: string;
    end_date?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    // New Promorang model fields
    total_gem_budget?: number;
    gems_spent?: number;
    promoshare_contribution?: number;
    content_items?: CampaignContentItem[];
    drops?: CampaignDrop[];
    coupons?: CampaignCoupon[];
    // Legacy fields for backward compatibility
    total_budget: number;
    budget_spent: number;
    daily_budget?: number;
    objective?: string;
    bid_strategy?: 'lowest_cost' | 'cost_cap' | 'bid_cap';
    bid_amount?: number;
    target_ctr?: number;
    target_cpc?: number;
    campaign_type?: 'proof' | 'standard' | 'premium';
    audience_size?: number;
    performance?: {
        impressions: number;
        clicks: number;
        conversions: number;
        ctr?: number;
        cpc?: number;
        spend?: number;
    };
    drops_count?: number;
    participants_count?: number;
}

export interface CampaignContent {
    id: string;
    campaign_id: string;
    title: string;
    platform: string;
    creator: string;
    status: 'pending' | 'approved' | 'rejected' | 'live' | 'completed';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    start_date: string;
    end_date?: string;
}

// New Promorang-style campaign input
export interface CreateCampaignInput {
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    // New Promorang model
    content_items?: CampaignContentItem[];
    drops?: Array<{
        id: string;
        title: string;
        description: string;
        type: 'share' | 'create' | 'engage' | 'review';
        gemReward: number;
        keysCost: number;
        maxParticipants: number;
        requirements?: string;
    }>;
    coupons?: Array<{
        id: string;
        title: string;
        description?: string;
        discountType: 'percent' | 'fixed' | 'freebie';
        discountValue: number;
        quantity: number;
    }>;
    budget_gems?: number;
    promoshare_contribution?: number;
    // Legacy fields
    objective?: string;
    total_budget?: number;
    daily_budget?: number;
    bid_strategy?: string;
    bid_amount?: number;
    target_ctr?: number;
    target_cpc?: number;
    campaign_type?: string;
    audience_size?: number;
}

export type RedemptionType = 'marketplace' | 'standalone' | 'hybrid';
export type ValidationMethod = 'qr_scan' | 'code_entry' | 'auto' | 'external';

export interface Coupon {
    id: string;
    title: string;
    description?: string;
    reward_type: 'coupon' | 'giveaway' | 'discount' | 'credit';
    value: number;
    value_unit: 'percentage' | 'fixed' | 'item' | 'usd' | 'gems' | 'keys';
    quantity_total: number;
    quantity_remaining: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'paused' | 'expired' | 'depleted';
    assignments?: CouponAssignment[];
    redemptions?: CouponRedemption[];
    conditions?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
    // IRL Redemption fields
    redemption_type?: RedemptionType;
    merchant_validation_required?: boolean;
    qr_code_url?: string;
    redemption_instructions?: string;
    coupon_code?: string;
}

export interface CouponAssignment {
    id: string;
    coupon_id?: string;
    target_type: 'drop' | 'leaderboard' | 'content';
    target_id: string;
    target_label?: string;
    status?: 'active' | 'inactive';
    assigned_at?: string;
}

export interface CouponRedemption {
    id: string;
    coupon_id: string;
    user_id?: string;
    user_name?: string;
    reward_value?: number;
    reward_unit?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    redeemed_at: string;
}

export interface CreateCouponInput {
    title: string;
    description?: string;
    reward_type: Coupon['reward_type'];
    value: number;
    value_unit: Coupon['value_unit'];
    quantity_total: number;
    start_date: string;
    end_date: string;
    // IRL Redemption options
    redemption_type?: RedemptionType;
    merchant_validation_required?: boolean;
    redemption_instructions?: string;
    coupon_code?: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    billingInterval: 'monthly' | 'quarterly' | 'yearly';
    features: string[];
}

interface AdvertiserState {
    drops: AdvertiserDrop[];
    analytics: AdvertiserAnalytics[];
    suggestedContent: SuggestedContent[];
    campaigns: Campaign[];
    coupons: Coupon[];
    redemptions: CouponRedemption[];
    plans: SubscriptionPlan[];
    userTier: string;
    monthlyInventory: {
        moves_used?: number;
        proof_drops_used?: number;
    };
    weeklyInventory: {
        moves_used?: number;
        proof_drops_used?: number;
    };
    isLoading: boolean;
    isLoadingCoupons: boolean;
    isLoadingCampaigns: boolean;
    isLoadingSuggestions: boolean;

    fetchDashboard: () => Promise<void>;
    fetchSuggestedContent: () => Promise<void>;
    fetchCampaigns: () => Promise<void>;
    fetchCoupons: () => Promise<void>;
    fetchPlans: () => Promise<void>;
    createCoupon: (coupon: CreateCouponInput) => Promise<Coupon | null>;
    getCoupon: (couponId: string) => Promise<Coupon | null>;
    updateCoupon: (couponId: string, updates: Partial<Coupon>) => Promise<Coupon | null>;
    deleteCoupon: (couponId: string) => Promise<boolean>;
    replenishCoupon: (couponId: string, quantity: number) => Promise<Coupon | null>;
    toggleCouponStatus: (couponId: string) => Promise<boolean>;
    assignCoupon: (couponId: string, assignment: { target_type: 'drop' | 'leaderboard'; target_id: string; target_label?: string }) => Promise<boolean>;
    removeAssignment: (couponId: string, assignmentId: string) => Promise<boolean>;
    redeemCoupon: (couponId: string, userName: string) => Promise<boolean>;
    selectedCoupon: Coupon | null;
    setSelectedCoupon: (coupon: Coupon | null) => void;
    createCampaign: (campaign: CreateCampaignInput) => Promise<Campaign | null>;
    getCampaign: (campaignId: string) => Promise<Campaign | null>;
    updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<Campaign | null>;
    deleteCampaign: (campaignId: string) => Promise<boolean>;
    updateCampaignStatus: (campaignId: string, status: Campaign['status']) => Promise<boolean>;
    addCampaignFunds: (campaignId: string, amount: number) => Promise<{ new_total: number; amount_added: number } | null>;
    getCampaignContent: (campaignId: string) => Promise<CampaignContent[]>;
    addCampaignContent: (campaignId: string, content: Partial<CampaignContent>) => Promise<CampaignContent | null>;
    selectedCampaign: Campaign | null;
    campaignContent: CampaignContent[];
    setSelectedCampaign: (campaign: Campaign | null) => void;
}

export const useAdvertiserStore = create<AdvertiserState>((set, get) => ({
    drops: [],
    analytics: [],
    suggestedContent: [],
    campaigns: [],
    coupons: [],
    redemptions: [],
    plans: [],
    userTier: 'free',
    monthlyInventory: {},
    weeklyInventory: {},
    isLoading: false,
    isLoadingCoupons: false,
    isLoadingCampaigns: false,
    isLoadingSuggestions: false,
    selectedCampaign: null,
    campaignContent: [],
    selectedCoupon: null,

    fetchDashboard: async () => {
        set({ isLoading: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                const dashData = data.data;
                set({
                    drops: dashData.drops || [],
                    analytics: dashData.analytics || [],
                    userTier: dashData.user_tier || 'free',
                    monthlyInventory: dashData.monthly_inventory || {},
                    weeklyInventory: dashData.weekly_inventory || {}
                });
            } else if (data.drops) {
                // Fallback for old format
                set({
                    drops: data.drops,
                    analytics: data.analytics || [],
                    userTier: data.user_tier || 'free',
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
        set({ isLoadingSuggestions: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/suggested-content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.data)) {
                set({ suggestedContent: data.data });
            } else if (Array.isArray(data)) {
                set({ suggestedContent: data });
            }
        } catch (error) {
            console.error('Fetch suggested content error:', error);
        } finally {
            set({ isLoadingSuggestions: false });
        }
    },

    fetchCampaigns: async () => {
        set({ isLoadingCampaigns: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.campaigns) {
                set({ campaigns: data.data.campaigns });
            }
        } catch (error) {
            console.error('Fetch campaigns error:', error);
        } finally {
            set({ isLoadingCampaigns: false });
        }
    },

    fetchCoupons: async () => {
        set({ isLoadingCoupons: true });
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                set({
                    coupons: data.data.coupons || [],
                    redemptions: data.data.redemptions || []
                });
            }
        } catch (error) {
            console.error('Fetch coupons error:', error);
        } finally {
            set({ isLoadingCoupons: false });
        }
    },

    fetchPlans: async () => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/subscription/plans`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.plans) {
                set({
                    plans: data.data.plans,
                    userTier: data.data.current_tier || data.data.currentTier || get().userTier
                });
            }
        } catch (error) {
            console.error('Fetch plans error:', error);
        }
    },

    createCoupon: async (coupon) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(coupon)
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.coupon) {
                get().fetchCoupons();
                return data.data.coupon;
            }
            return null;
        } catch (error) {
            console.error('Create coupon error:', error);
            return null;
        }
    },

    assignCoupon: async (couponId, assignment) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(assignment)
            });
            const data = await response.json();
            if (data.status === 'success') {
                get().fetchCoupons();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Assign coupon error:', error);
            return false;
        }
    },

    redeemCoupon: async (couponId, userName) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}/redeem`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_name: userName })
            });
            const data = await response.json();
            if (data.status === 'success') {
                get().fetchCoupons();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Redeem coupon error:', error);
            return false;
        }
    },

    getCoupon: async (couponId) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.coupon) {
                const coupon = data.data.coupon;
                set({ selectedCoupon: coupon });
                return coupon;
            }
            return null;
        } catch (error) {
            console.error('Get coupon error:', error);
            return null;
        }
    },

    updateCoupon: async (couponId, updates) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.coupon) {
                const updatedCoupon = data.data.coupon;
                set((state) => ({
                    coupons: state.coupons.map(c => c.id === couponId ? updatedCoupon : c),
                    selectedCoupon: state.selectedCoupon?.id === couponId ? updatedCoupon : state.selectedCoupon
                }));
                return updatedCoupon;
            }
            return null;
        } catch (error) {
            console.error('Update coupon error:', error);
            return null;
        }
    },

    deleteCoupon: async (couponId) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                set((state) => ({
                    coupons: state.coupons.filter(c => c.id !== couponId),
                    selectedCoupon: state.selectedCoupon?.id === couponId ? null : state.selectedCoupon
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Delete coupon error:', error);
            return false;
        }
    },

    replenishCoupon: async (couponId, quantity) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}/replenish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.coupon) {
                const updatedCoupon = data.data.coupon;
                set((state) => ({
                    coupons: state.coupons.map(c => c.id === couponId ? updatedCoupon : c),
                    selectedCoupon: state.selectedCoupon?.id === couponId ? updatedCoupon : state.selectedCoupon
                }));
                return updatedCoupon;
            }
            return null;
        } catch (error) {
            console.error('Replenish coupon error:', error);
            return null;
        }
    },

    toggleCouponStatus: async (couponId) => {
        try {
            const token = useAuthStore.getState().token;
            const currentCoupon = get().coupons.find(c => c.id === couponId) || get().selectedCoupon;
            const newStatus = currentCoupon?.status === 'active' ? 'paused' : 'active';
            
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.status === 'success') {
                set((state) => ({
                    coupons: state.coupons.map(c => c.id === couponId ? { ...c, status: newStatus } : c),
                    selectedCoupon: state.selectedCoupon?.id === couponId 
                        ? { ...state.selectedCoupon, status: newStatus } 
                        : state.selectedCoupon
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Toggle coupon status error:', error);
            return false;
        }
    },

    removeAssignment: async (couponId, assignmentId) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/coupons/${couponId}/assignments/${assignmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                get().fetchCoupons();
                if (get().selectedCoupon?.id === couponId) {
                    get().getCoupon(couponId);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Remove assignment error:', error);
            return false;
        }
    },

    setSelectedCoupon: (coupon) => {
        set({ selectedCoupon: coupon });
    },

    createCampaign: async (campaign) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campaign)
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.campaign) {
                get().fetchCampaigns();
                return data.data.campaign;
            }
            return null;
        } catch (error) {
            console.error('Create campaign error:', error);
            return null;
        }
    },

    getCampaign: async (campaignId) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.campaign) {
                const campaign = data.data.campaign;
                set({ selectedCampaign: campaign, campaignContent: data.data.content || [] });
                return campaign;
            }
            return null;
        } catch (error) {
            console.error('Get campaign error:', error);
            return null;
        }
    },

    updateCampaign: async (campaignId, updates) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.campaign) {
                const updatedCampaign = data.data.campaign;
                set((state) => ({
                    campaigns: state.campaigns.map(c => c.id === campaignId ? updatedCampaign : c),
                    selectedCampaign: state.selectedCampaign?.id === campaignId ? updatedCampaign : state.selectedCampaign
                }));
                return updatedCampaign;
            }
            return null;
        } catch (error) {
            console.error('Update campaign error:', error);
            return null;
        }
    },

    deleteCampaign: async (campaignId) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                set((state) => ({
                    campaigns: state.campaigns.filter(c => c.id !== campaignId),
                    selectedCampaign: state.selectedCampaign?.id === campaignId ? null : state.selectedCampaign
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Delete campaign error:', error);
            return false;
        }
    },

    updateCampaignStatus: async (campaignId, status) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (data.status === 'success') {
                set((state) => ({
                    campaigns: state.campaigns.map(c => c.id === campaignId ? { ...c, status } : c),
                    selectedCampaign: state.selectedCampaign?.id === campaignId 
                        ? { ...state.selectedCampaign, status } 
                        : state.selectedCampaign
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update campaign status error:', error);
            return false;
        }
    },

    addCampaignFunds: async (campaignId, amount) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}/funds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount })
            });
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                const { new_total, amount_added } = data.data;
                set((state) => ({
                    campaigns: state.campaigns.map(c => 
                        c.id === campaignId ? { ...c, total_budget: new_total } : c
                    ),
                    selectedCampaign: state.selectedCampaign?.id === campaignId 
                        ? { ...state.selectedCampaign, total_budget: new_total } 
                        : state.selectedCampaign
                }));
                return { new_total, amount_added };
            }
            return null;
        } catch (error) {
            console.error('Add campaign funds error:', error);
            return null;
        }
    },

    getCampaignContent: async (campaignId) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}/content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.content) {
                set({ campaignContent: data.data.content });
                return data.data.content;
            }
            return [];
        } catch (error) {
            console.error('Get campaign content error:', error);
            return [];
        }
    },

    addCampaignContent: async (campaignId, content) => {
        try {
            const token = useAuthStore.getState().token;
            const response = await fetch(`${API_URL}/api/advertisers/campaigns/${campaignId}/content`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(content)
            });
            const data = await response.json();
            if (data.status === 'success' && data.data?.content) {
                set((state) => ({
                    campaignContent: [...state.campaignContent, data.data.content]
                }));
                return data.data.content;
            }
            return null;
        } catch (error) {
            console.error('Add campaign content error:', error);
            return null;
        }
    },

    setSelectedCampaign: (campaign) => {
        set({ selectedCampaign: campaign });
    },
}));
