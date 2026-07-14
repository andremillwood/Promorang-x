import { supabase } from './supabase';
import type {
  PromoShareDashboardData,
  PromoShareCycle,
  PromoShareUserStats,
  PromoShareEntry,
  PromoShareWinner,
  SponsorPool,
  SponsorTier,
  SponsorAnalytics,
  MaturityStateData,
  VisibilityRules,
  FeaturedPlacement,
  PlacementPricing,
  VaultAsset,
  VaultTransaction,
  KYCStatus,
  MatrixDashboard,
} from '@/types';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.promorang.co';
export const WEB_BASE = (process.env.EXPO_PUBLIC_WEB_URL || 'https://promorang.co').replace(/\/$/, '');

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
  };
}

// Helper for API requests
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// PROMOSHARE API
// ============================================

export const promoShareApi = {
  // Get full dashboard data
  getDashboard: () => 
    apiRequest<{ success: boolean; data: PromoShareDashboardData }>('/api/promoshare/dashboard'),

  // Get current user stats
  getMe: () => 
    apiRequest<{ success: boolean; data: {
      cycles: PromoShareUserStats[];
      recent_entries: PromoShareEntry[];
      history: PromoShareWinner[];
    } }>('/api/promoshare/me'),

  // Get user history
  getHistory: (limit = 20) => 
    apiRequest<{ success: boolean; data: PromoShareWinner[] }>(`/api/promoshare/me/history?limit=${limit}`),

  // Get recent entries
  getEntries: (limit = 10) => 
    apiRequest<{ success: boolean; data: PromoShareEntry[] }>(`/api/promoshare/me/entries?limit=${limit}`),

  // Get cycle progress
  getCycleProgress: (cycleId: string) => 
    apiRequest<{ success: boolean; data: {
      cycle: PromoShareCycle;
      user_stats: PromoShareUserStats;
      progress_percent: number;
      actions_needed: number;
    } }>(`/api/promoshare/cycles/${cycleId}/progress`),

  // Get all active cycles
  getActiveCycles: () => 
    apiRequest<{ success: boolean; data: PromoShareCycle[] }>('/api/promoshare/cycles/current'),

  // Get specific cycle
  getCycle: (cycleId: string) =>
    apiRequest<{ success: boolean; data: PromoShareCycle }>(`/api/promoshare/cycles/${cycleId}`),

  // Get unclaimed prizes
  getUnclaimedPrizes: () =>
    apiRequest<{ success: boolean; data: PromoShareWinner[] }>('/api/promoshare/me/prizes'),

  // Claim a prize
  claimPrize: (winnerId: string) =>
    apiRequest<{ success: boolean; data: { prize: PromoShareWinner; message: string } }>(`/api/promoshare/me/prizes/${winnerId}/claim`, {
      method: 'POST',
    }),
};

export const couponApi = {
  getMyRedemptions: () =>
    apiRequest<{ status: string; data: { redemptions: any[] } }>('/api/coupons/my-redemptions'),
  validateMerchantCode: (code: string) =>
    apiRequest<{ status: string; data: { redemption: any }; message?: string }>('/api/coupons/merchant/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

export const commerceApi = {
  getStripeConfig: () =>
    apiRequest<{ publishableKey: string; configured: boolean }>('/api/stripe/config'),
  createStripeIntent: (productId: string, quantity = 1) =>
    apiRequest<{ paymentIntentId: string; clientSecret: string; amount: number; currency: string; status: string }>('/api/stripe/commerce/payment-intent', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  getReceipt: (receiptId: string) =>
    apiRequest<{ success: boolean; receipt: any; timeline: any[]; permissions?: Record<string, boolean> }>(`/api/commerce/receipts/${encodeURIComponent(receiptId)}`),
  getReceiptByPaymentIntent: (paymentIntentId: string) =>
    apiRequest<{ success: boolean; receipt: { id: string; status: string } }>(`/api/commerce/receipts/by-payment-intent/${encodeURIComponent(paymentIntentId)}`),
  getCheckoutUrl: (productId: string) => `${WEB_BASE}/shop/${encodeURIComponent(productId)}`,
};

export const merchantApi = {
  getReceipts: () =>
    apiRequest<{ receipts: any[] }>('/api/merchant/receipts'),
  updateReceiptStatus: (receiptId: string, status: 'fulfilled' | 'cancelled' | 'refunded', note?: string) =>
    apiRequest<{ receipt: any }>(`/api/merchant/receipts/${receiptId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),
  validateSaleCode: (code: string) =>
    apiRequest<any>(`/api/merchant/sales/${encodeURIComponent(code)}/validate`, {
      method: 'POST',
    }),
};

export const feedApi = {
  getForYou: (intent?: 'nearby' | 'tonight' | 'earn' | null, limit = 24) => {
    const query = new URLSearchParams({ limit: String(limit), offset: '0' });
    if (intent) query.set('intent', intent);
    return apiRequest<{
      status: string;
      data: {
        feed: any[];
        meta: { active_intent?: string | null; ranking_profile?: string; user_interests?: string[] };
      };
    }>(`/api/feed/for-you?${query.toString()}`);
  },
  recordInteraction: (params: {
    item_type: string;
    item_id: string;
    interaction_type: 'impression' | 'click' | 'save' | 'dismiss' | string;
    meta_data?: Record<string, unknown>;
  }) =>
    apiRequest<{ success?: boolean; status?: string }>('/api/feed/interaction', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

export const privacyApi = {
  requestAccountDeletion: (reason?: string) =>
    apiRequest<{ success: boolean; message: string; request: { id: string; status: string; requested_at: string } }>(
      '/api/privacy/account-deletion-requests/authenticated',
      { method: 'POST', body: JSON.stringify({ reason: reason || null }) }
    ),
};

export const safetyApi = {
  report: (data: {
    target_type: 'moment' | 'content' | 'product' | 'offer' | 'piece' | 'user';
    target_id: string;
    reported_user_id?: string | null;
    reason: 'spam' | 'harassment' | 'hate' | 'nudity' | 'violence' | 'dangerous' | 'fraud' | 'intellectual_property' | 'other';
    details?: string | null;
  }) => apiRequest<{ success: boolean }>('/api/feed/report', { method: 'POST', body: JSON.stringify(data) }),
  blockUser: (blockedUserId: string) =>
    apiRequest<{ success: boolean }>('/api/feed/block', {
      method: 'POST',
      body: JSON.stringify({ blocked_user_id: blockedUserId }),
    }),
};

// ============================================
// SPONSOR API
// ============================================

export const sponsorApi = {
  // Get sponsor configuration (tiers, pricing)
  getConfig: () => 
    apiRequest<{ success: boolean; data: {
      tiers: SponsorTier[];
      features: string[];
    } }>('/api/sponsors/config'),

  // Calculate pool cost
  calculateCost: (params: {
    tier: string;
    amount: number;
    homepage_banner?: boolean;
    push_notification?: boolean;
    sponsored_badge?: boolean;
  }) => 
    apiRequest<{ success: boolean; data: {
      breakdown: {
        base_pool: number;
        platform_fee: number;
        total_cost: number;
        winner_count: number;
        min_win_value: number;
      };
      premium_placements: {
        homepage_banner: number;
        push_notification: number;
        sponsored_badge: number;
      };
    } }>('/api/sponsors/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Create a new pool
  createPool: (poolData: {
    name: string;
    tier: string;
    pool_amount: number;
    brand_message?: string;
    premium_placements?: {
      homepage_banner?: boolean;
      push_notification?: boolean;
      sponsored_badge?: boolean;
    };
  }) => 
    apiRequest<{ success: boolean; data: SponsorPool }>('/api/sponsors/pools', {
      method: 'POST',
      body: JSON.stringify(poolData),
    }),

  // Get sponsor's pools
  getPools: () => 
    apiRequest<{ success: boolean; data: SponsorPool[] }>('/api/sponsors/pools'),

  // Get pool analytics
  getAnalytics: (poolId: string) => 
    apiRequest<{ success: boolean; data: SponsorAnalytics }>(`/api/sponsors/analytics/${poolId}`),

  // Activate pool (after payment)
  activatePool: (poolId: string) => 
    apiRequest<{ success: boolean; data: SponsorPool }>(`/api/sponsors/pools/${poolId}/activate`, {
      method: 'POST',
    }),

  // Create checkout session for payment
  createCheckout: (poolId: string) => 
    apiRequest<{ success: boolean; data: { checkout_url: string; session_id: string } }>(`/api/sponsors/pools/${poolId}/checkout`, {
      method: 'POST',
    }),

  // Check payment status
  getPaymentStatus: (poolId: string) => 
    apiRequest<{ success: boolean; data: { status: string; paid: boolean } }>(`/api/sponsors/pools/${poolId}/payment-status`),
};

// ============================================
// MATURITY STATE API
// ============================================

export const maturityApi = {
  // Get current maturity state
  getState: () => 
    apiRequest<{ success: boolean; data: MaturityStateData & { visibility: VisibilityRules } }>('/api/maturity/state'),

  // Record a verified action
  recordAction: (actionType: string, metadata?: Record<string, any>) => 
    apiRequest<{ success: boolean; data: { new_state?: MaturityStateData; transitioned: boolean } }>('/api/maturity/action', {
      method: 'POST',
      body: JSON.stringify({ action_type: actionType, metadata }),
    }),

  // Mark first reward received
  markRewardReceived: () => 
    apiRequest<{ success: boolean; data: { success: boolean } }>('/api/maturity/reward-received', {
      method: 'POST',
    }),

  // Check feature access
  checkFeatureAccess: (feature: string) => 
    apiRequest<{ success: boolean; data: { accessible: boolean; min_state_required: number } }>(`/api/maturity/check-access/${feature}`),

  // Get visibility rules only (lightweight)
  getVisibility: () => 
    apiRequest<{ success: boolean; data: VisibilityRules }>('/api/maturity/visibility'),
};

// ============================================
// FEATURED MARKETPLACE API
// ============================================

export const featuredApi = {
  // Get all placement types and pricing
  getPlacementTypes: () => 
    apiRequest<{ success: boolean; data: PlacementPricing[] }>('/api/featured-marketplace/placement-types'),

  // Get pricing for specific type
  getPricing: (type: string) => 
    apiRequest<{ success: boolean; data: PlacementPricing }>(`/api/featured-marketplace/pricing/${type}`),

  // Check availability
  getAvailability: (type: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return apiRequest<{ success: boolean; data: { available: boolean; conflicting: any[] } }>(
      `/api/featured-marketplace/availability/${type}?${params.toString()}`
    );
  },

  // Create a booking
  createBooking: (bookingData: {
    placement_type: string;
    content_type: string;
    content_id?: string;
    content_title: string;
    duration_days: number;
    cpc_budget?: number;
  }) => 
    apiRequest<{ success: boolean; data: FeaturedPlacement }>('/api/featured-marketplace/book', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  // Get active placements
  getActive: () => 
    apiRequest<{ success: boolean; data: FeaturedPlacement[] }>('/api/featured-marketplace/active'),

  // Get my bookings
  getMyBookings: () => 
    apiRequest<{ success: boolean; data: FeaturedPlacement[] }>('/api/featured-marketplace/my-bookings'),

  // Record impression
  recordImpression: (placementId: string) => 
    apiRequest<{ success: boolean }>(`/api/featured-marketplace/${placementId}/record-impression`, {
      method: 'POST',
    }),

  // Record click
  recordClick: (placementId: string) => 
    apiRequest<{ success: boolean }>(`/api/featured-marketplace/${placementId}/record-click`, {
      method: 'POST',
    }),
};

// ============================================
// VAULT API
// ============================================

export const vaultApi = {
  // Get vault assets
  getAssets: () => 
    apiRequest<{ success: boolean; data: VaultAsset[] }>('/api/vault/assets'),

  // Get vault transactions
  getTransactions: (limit = 20) => 
    apiRequest<{ success: boolean; data: VaultTransaction[] }>(`/api/vault/transactions?limit=${limit}`),

  // Get vault summary
  getSummary: () => 
    apiRequest<{ success: boolean; data: {
      total_value_usd: number;
      asset_counts: Record<string, number>;
    } }>('/api/vault/summary'),
};

// ============================================
// KYC API
// ============================================

export const kycApi = {
  // Get KYC status
  getStatus: () => 
    apiRequest<{ success: boolean; data: KYCStatus }>('/api/kyc/status'),

  // Submit KYC
  submit: (data: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    address: string;
    city: string;
    country: string;
    document_type: 'passport' | 'drivers_license' | 'national_id';
    document_number: string;
  }) => 
    apiRequest<{ success: boolean; data: KYCStatus }>('/api/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Upload document
  uploadDocument: (formData: FormData) => 
    apiRequest<{ success: boolean; data: { document_url: string } }>('/api/kyc/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for multipart
    }),
};

// ============================================
// MATRIX / GROWTH PARTNER API
// ============================================

export const matrixApi = {
  // Check if user has matrix access
  checkAccess: () => 
    apiRequest<{ success: boolean; data: { accessible: boolean; reason?: string } }>('/api/matrix/status'),

  // Get dashboard
  getDashboard: () => 
    apiRequest<{ success: boolean; data: MatrixDashboard }>('/api/matrix/dashboard'),

  // Get team/recruits
  getTeam: (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    return apiRequest<{ success: boolean; data: any[] }>(`/api/matrix/team/recruits?${params.toString()}`);
  },

  // Get earnings
  getEarnings: (period?: 'week' | 'month' | 'all') => 
    apiRequest<{ success: boolean; data: any[] }>(`/api/matrix/earnings?period=${period || 'all'}`),

  // Get referral link
  getReferralLink: () => 
    apiRequest<{ success: boolean; data: { referral_link: string; qr_code: string } }>('/api/matrix/referral-link'),
};

// ============================================
// USER API
// ============================================

export const userApi = {
  // Get current user profile
  getProfile: () => 
    apiRequest<{ success: boolean; data: any }>('/api/users/me'),

  // Update profile
  updateProfile: (data: Record<string, any>) => 
    apiRequest<{ success: boolean; data: any }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Get user stats
  getStats: () => 
    apiRequest<{ success: boolean; data: any }>('/api/users/me/stats'),
};
