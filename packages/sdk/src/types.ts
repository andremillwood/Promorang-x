/**
 * Promorang SDK Types & DTOs
 */

export interface PromorangClientConfig {
  apiKey?: string;
  authToken?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface FeedSearchParams {
  category?: string;
  limit?: number;
  offset?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface PromotionItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  merchant?: {
    id: string;
    name: string;
  };
  rewardGems?: number;
  remaining?: number;
  expiresAt?: string;
  [key: string]: any;
}

export interface ClaimCouponParams {
  opportunityId?: string;
  couponId?: string;
  recipientUserId?: string;
  metadata?: Record<string, any>;
}

export interface CouponClaimReceipt {
  receiptId: string;
  claimCode: string;
  opportunityId: string;
  userId: string;
  status: string;
  claimedAt: string;
  expiresAt: string;
  rewardGems?: number;
  qrPayload?: string;
  [key: string]: any;
}

export interface CampaignPlanParams {
  objective: string;
  targetMarket?: string;
  audience?: string;
  budget?: number;
  timeframe?: string;
  constraints?: string[];
  organizationId?: string;
  targetCount?: number;
}

export interface MerchantLiveOps {
  organization: {
    id: string;
    name: string;
    type?: string;
    [key: string]: any;
  };
  budget: {
    totalBudget: number;
    allocatedBudget: number;
    availableBudget: number;
    status: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    category?: string;
  }>;
}
