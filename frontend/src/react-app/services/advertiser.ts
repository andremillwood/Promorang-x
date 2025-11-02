import { apiFetch } from '../utils/api';
import { CouponType, CouponAssignmentType, CouponRedemptionType } from '@/shared/types';

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

const normalisePlanPayload = (payload: any): SubscriptionPlansPayload => ({
  plans: Array.isArray(payload?.plans) ? payload.plans : [],
  currentTier: payload?.current_tier || payload?.currentTier || 'free',
});

const normaliseCouponPayload = (payload: any): CouponListPayload => ({
  coupons: Array.isArray(payload?.coupons)
    ? payload.coupons.map((coupon: CouponType & { assignments?: CouponAssignmentType[] }) => ({
        ...coupon,
        assignments: Array.isArray(coupon.assignments) ? coupon.assignments : [],
      }))
    : [],
  redemptions: Array.isArray(payload?.redemptions) ? payload.redemptions : [],
});

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

export const advertiserService = {
  async getPlans(forceRefresh = false): Promise<SubscriptionPlansPayload> {
    if (!forceRefresh && plansCache && Date.now() < plansCacheExpiry) {
      return plansCache;
    }

    try {
      const response = await apiFetch('/advertisers/subscription/plans');
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
      const response = await apiFetch('/advertisers/subscription/upgrade', {
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
      const response = await apiFetch('/advertisers/coupons');
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
      const response = await apiFetch('/advertisers/coupons', {
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
      const response = await apiFetch(`/advertisers/coupons/${couponId}/assign`, {
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
      const response = await apiFetch(`/advertisers/coupons/${couponId}/redeem`, {
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
};

export default advertiserService;
