import { apiFetch } from '../utils/api';
import type {
  CouponType,
  CouponAssignmentType,
  CouponRedemptionType,
  DropType
} from '../../shared/types';

export interface AdvertiserPlan {
  id: string;
  name: string;
  price: number;
  billingInterval: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
}

export interface SubscriptionPlansPayload {
  plans: AdvertiserPlan[];
  currentTier: string;
}

export interface CouponListPayload {
  coupons: (CouponType & { assignments: CouponAssignmentType[] })[];
  redemptions: CouponRedemptionType[];
}

type ApiSuccess<T> = {
  status: 'success';
  data: T;
  message?: string;
};

type ApiError = {
  status: 'error';
  message: string;
  code?: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

const PLAN_CACHE_TTL = 60_000;
const COUPON_CACHE_TTL = 30_000;

let plansCache: SubscriptionPlansPayload | null = null;
let plansCacheExpiry = 0;

let couponCache: CouponListPayload | null = null;
let couponCacheExpiry = 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalisePlanPayload = (payload: unknown): SubscriptionPlansPayload => {
  if (!isRecord(payload)) {
    return { plans: [], currentTier: 'free' };
  }

  const rawPlans = Array.isArray(payload.plans)
    ? (payload.plans as AdvertiserPlan[])
    : [];

  const currentTier =
    typeof payload.current_tier === 'string'
      ? payload.current_tier
      : typeof payload.currentTier === 'string'
        ? payload.currentTier
        : 'free';

  return {
    plans: rawPlans,
    currentTier,
  };
};

const normaliseCouponPayload = (payload: unknown): CouponListPayload => {
  if (!isRecord(payload)) {
    return { coupons: [], redemptions: [] };
  }

  const coupons = Array.isArray(payload.coupons)
    ? (payload.coupons as Array<CouponType & { assignments?: CouponAssignmentType[] }>)
        .map(coupon => ({
          ...coupon,
          assignments: Array.isArray(coupon.assignments) ? coupon.assignments : [],
        }))
    : [];

  const redemptions = Array.isArray(payload.redemptions)
    ? (payload.redemptions as CouponRedemptionType[])
    : [];

  return { coupons, redemptions };
};

const invalidatePlanCache = () => {
  plansCache = null;
  plansCacheExpiry = 0;
};

const invalidateCouponCache = () => {
  couponCache = null;
  couponCacheExpiry = 0;
};

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch (error) {
    console.warn('[Advertiser API] failed to parse JSON response', error);
    return null;
  }
};

type CampaignMetric = Record<string, unknown>;

export type CampaignTargetAudience = Record<string, unknown>;

export interface CampaignSummary {
  id: string;
  advertiser_id: string;
  name: string;
  objective?: string;
  status: string;
  start_date: string;
  end_date?: string;
  total_budget: number;
  budget_spent: number;
  target_audience?: CampaignTargetAudience;
  created_at: string;
  updated_at: string;
  metrics?: CampaignMetric[];
  latest_metrics?: CampaignMetric | null;
  performance?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  };
  coupons?: CampaignMetric[];
}

export interface CampaignDetail {
  campaign: CampaignSummary;
  metrics: CampaignMetric[];
  content: CampaignMetric[];
  coupons: CampaignMetric[];
}

export interface CouponDetail {
  coupon: CouponType & {
    assignments: CouponAssignmentType[];
    redemptions: CouponRedemptionType[];
  };
}

export const advertiserService = {
  async getPlans(forceRefresh = false): Promise<SubscriptionPlansPayload> {
    if (!forceRefresh && plansCache && Date.now() < plansCacheExpiry) {
      return plansCache;
    }

    try {
      const response = await apiFetch('/api/advertisers/subscription/plans');
      const result = await parseJson<ApiResponse<SubscriptionPlansPayload & { current_tier?: string }>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to load plans (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to load plans');
      }

      const payload = normalisePlanPayload(result.data);
      plansCache = payload;
      plansCacheExpiry = Date.now() + PLAN_CACHE_TTL;
      return payload;
    } catch (error) {
      console.error('[Advertiser API] getPlans', error);
      invalidatePlanCache();
      return { plans: [], currentTier: 'free' };
    }
  },

  async upgrade(planId: string): Promise<{ plan?: AdvertiserPlan & { activated_at?: string; renews_at?: string }; message?: string }> {
    try {
      const response = await apiFetch('/api/advertisers/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const result = await parseJson<ApiResponse<{ message?: string; plan?: AdvertiserPlan & { activated_at?: string; renews_at?: string } }>>(response);

      if (!response.ok) {
        const message = result?.message || `HTTP ${response.status}`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to upgrade plan');
      }

      invalidatePlanCache();
      return { ...result.data, message: result.message };
    } catch (error) {
      console.error('[Advertiser API] upgrade', error);
      throw error;
    }
  },

  async listCoupons(forceRefresh = false): Promise<CouponListPayload> {
    if (!forceRefresh && couponCache && Date.now() < couponCacheExpiry) {
      return couponCache;
    }

    try {
      const response = await apiFetch('/api/advertisers/coupons');
       const result = await parseJson<ApiResponse<CouponListPayload>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to load coupons (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to load coupons');
      }

      const payload = normaliseCouponPayload(result.data);
      couponCache = payload;
      couponCacheExpiry = Date.now() + COUPON_CACHE_TTL;
      return payload;
    } catch (error) {
      console.error('[Advertiser API] listCoupons', error);
      invalidateCouponCache();
      return { coupons: [], redemptions: [] };
    }
  },

  async createCoupon(payload: Partial<CouponType>) {
    try {
      const response = await apiFetch('/api/advertisers/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await parseJson<ApiResponse<{ coupon: CouponType }>>(response);

      if (!response.ok) {
        const message = result?.message || 'Failed to create coupon';
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to create coupon');
      }

      invalidateCouponCache();
      return result.data.coupon;
    } catch (error) {
      console.error('[Advertiser API] createCoupon', error);
      throw error;
    }
  },

  async assignCoupon(couponId: string, assignment: { target_type: 'drop' | 'leaderboard'; target_id: string; target_label?: string }) {
    try {
      const response = await apiFetch(`/api/advertisers/coupons/${couponId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      const result = await parseJson<ApiResponse<{ assignment: CouponAssignmentType }>>(response);

      if (!response.ok) {
        const message = result?.message || 'Failed to assign coupon';
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to assign coupon');
      }

      invalidateCouponCache();
      return result.data.assignment;
    } catch (error) {
      console.error('[Advertiser API] assignCoupon', error);
      throw error;
    }
  },

  async redeemCoupon(couponId: string, redemption: { user_id?: string; user_name?: string }) {
    try {
      const response = await apiFetch(`/api/advertisers/coupons/${couponId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(redemption),
      });

      const result = await parseJson<ApiResponse<{ redemption: CouponRedemptionType; coupon: CouponType }>>(response);

      if (!response.ok) {
        const message = result?.message || 'Failed to redeem coupon';
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to redeem coupon');
      }

      invalidateCouponCache();
      return result.data;
    } catch (error) {
      console.error('[Advertiser API] redeemCoupon', error);
      throw error;
    }
  },

  async listCampaigns(): Promise<CampaignSummary[]> {
    try {
      const response = await apiFetch('/api/advertisers/campaigns');
      const result = await parseJson<ApiResponse<{ campaigns: CampaignSummary[] }>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to load campaigns (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to load campaigns');
      }

      return Array.isArray(result.data.campaigns) ? result.data.campaigns : [];
    } catch (error) {
      console.error('[Advertiser API] listCampaigns', error);
      return [];
    }
  },

  async getCampaign(campaignId: string): Promise<CampaignDetail | null> {
    try {
      const response = await apiFetch(`/api/advertisers/campaigns/${campaignId}`);
      const result = await parseJson<ApiResponse<CampaignDetail>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to load campaign (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to load campaign');
      }

      return result.data;
    } catch (error) {
      console.error('[Advertiser API] getCampaign', error);
      return null;
    }
  },

  async getCoupon(couponId: string): Promise<CouponDetail | null> {
    try {
      const response = await apiFetch(`/api/advertisers/coupons/${couponId}`);
      const result = await parseJson<ApiResponse<CouponDetail>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to load coupon (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to load coupon');
      }

      return result.data;
    } catch (error) {
      console.error('[Advertiser API] getCoupon', error);
      return null;
    }
  },

  async updateCampaign(campaignId: string, updates: Partial<CampaignSummary>): Promise<CampaignSummary | null> {
    try {
      const response = await apiFetch(`/api/advertisers/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await parseJson<ApiResponse<{ campaign: CampaignSummary }>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to update campaign (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to update campaign');
      }

      return result.data.campaign;
    } catch (error) {
      console.error('[Advertiser API] updateCampaign', error);
      throw error;
    }
  },

  async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/advertisers/campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      const result = await parseJson<ApiResponse<Record<string, unknown>>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to delete campaign (${response.status})`;
        throw new Error(message);
      }

      return true;
    } catch (error) {
      console.error('[Advertiser API] deleteCampaign', error);
      throw error;
    }
  },

  async addCampaignFunds(
    campaignId: string,
    amount: number,
    provider = 'mock'
  ): Promise<Record<string, unknown>> {
    try {
      const response = await apiFetch(`/api/advertisers/campaigns/${campaignId}/funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, provider }),
      });
      const result = await parseJson<ApiResponse<Record<string, unknown>>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to add funds (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to add funds');
      }

      return result.data;
    } catch (error) {
      console.error('[Advertiser API] addCampaignFunds', error);
      throw error;
    }
  },

  async addCampaignContent(
    campaignId: string,
    content: {
      title: string;
      description?: string;
      platform: string;
      media_url?: string;
      status?: string;
    }
  ): Promise<Record<string, unknown>> {
    try {
      const response = await apiFetch(`/api/advertisers/campaigns/${campaignId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const result = await parseJson<ApiResponse<{ content: Record<string, unknown> }>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to add content (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to add content');
      }

      return result.data.content;
    } catch (error) {
      console.error('[Advertiser API] addCampaignContent', error);
      throw error;
    }
  },

  async getCampaignDrops(campaignId: string): Promise<DropType[]> {
    try {
      const response = await apiFetch(`/api/advertisers/campaigns/${campaignId}/drops`);
      const result = await parseJson<ApiResponse<{ drops: DropType[] }>>(response);

      if (!response.ok) {
        const message = result?.message || `Failed to load drops (${response.status})`;
        throw new Error(message);
      }

      if (!result || result.status !== 'success') {
        throw new Error(result?.message || 'Failed to load drops');
      }

      return result.data.drops;
    } catch (error) {
      console.error('[Advertiser API] getCampaignDrops', error);
      return [];
    }
  },
};

export default advertiserService;
