import type {
  PromorangClientConfig,
  ApiResponse,
  FeedSearchParams,
  PromotionItem,
  ClaimCouponParams,
  CouponClaimReceipt,
  CampaignPlanParams,
  MerchantLiveOps
} from './types.js';

export class PromorangClient {
  private readonly apiKey?: string;
  private readonly authToken?: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: PromorangClientConfig = {}) {
    this.apiKey = config.apiKey || (typeof process !== 'undefined' ? process.env?.PROMORANG_API_KEY : undefined);
    this.authToken = config.authToken || (typeof process !== 'undefined' ? process.env?.PROMORANG_AUTH_TOKEN : undefined);
    this.baseUrl = (config.baseUrl || (typeof process !== 'undefined' ? process.env?.PROMORANG_API_URL : undefined) || 'https://api.promorang.co/api/v1').replace(/\/$/, '');
    this.timeoutMs = config.timeoutMs || 30000;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    } else if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const json = await response.json() as ApiResponse<T>;

      if (!response.ok || json.success === false) {
        throw new Error(json.error || `HTTP ${response.status}: Failed request to ${path}`);
      }

      return json.data as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }

  /**
   * Feed & Discovery API: search active coupons, drops, and live moments
   */
  public readonly feed = {
    search: async (params: FeedSearchParams = {}): Promise<{ items: PromotionItem[]; total: number }> => {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.set('category', params.category);
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.offset) queryParams.set('offset', String(params.offset));
      if (params.lat) queryParams.set('lat', String(params.lat));
      if (params.lng) queryParams.set('lng', String(params.lng));
      if (params.radiusKm) queryParams.set('radiusKm', String(params.radiusKm));

      const queryStr = queryParams.toString();
      const path = `/feed${queryStr ? `?${queryStr}` : ''}`;
      return this.request<{ items: PromotionItem[]; total: number }>(path);
    }
  };

  /**
   * Coupons & Actions API: claim and inspect promotions
   */
  public readonly coupons = {
    claim: async (params: ClaimCouponParams): Promise<CouponClaimReceipt> => {
      return this.request<CouponClaimReceipt>('/coupons/claim', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },
    get: async (couponId: string): Promise<PromotionItem> => {
      return this.request<PromotionItem>(`/coupons/${couponId}`);
    }
  };

  /**
   * Campaigns & AI Operating Layer API
   */
  public readonly campaigns = {
    generatePlan: async (params: CampaignPlanParams): Promise<any> => {
      return this.request<any>('/campaigns/generate-plan', {
        method: 'POST',
        body: JSON.stringify(params)
      });
    },
    get: async (campaignId: string): Promise<any> => {
      return this.request<any>(`/campaigns/${campaignId}`);
    }
  };

  /**
   * Merchant Live-Ops API
   */
  public readonly merchants = {
    getLiveOps: async (merchantId: string): Promise<MerchantLiveOps> => {
      return this.request<MerchantLiveOps>(`/merchants/${merchantId}/live-ops`);
    }
  };
}
