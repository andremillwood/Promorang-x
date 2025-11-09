/**
 * User rewards and coupons service
 * Handles fetching and redeeming user-earned coupons
 */

import { apiFetch } from '@/react-app/utils/api';

export interface UserCoupon {
  assignment_id: string;
  coupon_id: string;
  title: string;
  description: string;
  reward_type: 'coupon' | 'giveaway' | 'credit';
  value: number;
  value_unit: string;
  source: string;
  source_label: string;
  earned_at: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  expires_at: string;
  status: 'available' | 'redeemed' | 'expired' | 'depleted' | 'inactive';
  metadata: Record<string, any>;
  conditions: Record<string, any>;
}

export interface UserCouponDetail extends UserCoupon {
  instructions: string;
}

export interface RewardStats {
  total_earned: number;
  total_redeemed: number;
  total_value: number;
  available_count: number;
}

export interface RedeemResponse {
  success: boolean;
  message: string;
  code?: string;
  instructions?: string;
  credited?: boolean;
  amount?: number;
  currency?: string;
  entered?: boolean;
}

class RewardsService {
  /**
   * List all coupons for the current user
   */
  async listCoupons(params?: {
    status?: 'all' | 'available' | 'redeemed';
    limit?: number;
    offset?: number;
  }): Promise<{
    coupons: UserCoupon[];
    total: number;
    has_more: boolean;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `/api/rewards/coupons${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiFetch(url);
    return response;
  }

  /**
   * Get details of a specific coupon assignment
   */
  async getCoupon(assignmentId: string): Promise<UserCouponDetail> {
    const response = await apiFetch(`/api/rewards/coupons/${assignmentId}`);
    return response;
  }

  /**
   * Redeem a coupon
   */
  async redeemCoupon(assignmentId: string): Promise<RedeemResponse> {
    const response = await apiFetch(`/api/rewards/coupons/${assignmentId}/redeem`, {
      method: 'POST',
    });
    return response;
  }

  /**
   * Get user's reward statistics
   */
  async getStats(): Promise<RewardStats> {
    const response = await apiFetch('/api/rewards/stats');
    return response;
  }

  /**
   * Get available coupons (shorthand)
   */
  async getAvailableCoupons(): Promise<UserCoupon[]> {
    const { coupons } = await this.listCoupons({ status: 'available' });
    return coupons;
  }

  /**
   * Get redeemed coupons (shorthand)
   */
  async getRedeemedCoupons(): Promise<UserCoupon[]> {
    const { coupons } = await this.listCoupons({ status: 'redeemed' });
    return coupons;
  }

  /**
   * Format coupon value for display
   */
  formatCouponValue(coupon: UserCoupon): string {
    if (coupon.value_unit === 'percentage') {
      return `${coupon.value}% off`;
    }
    if (coupon.value_unit === 'usd') {
      return `$${coupon.value} off`;
    }
    if (coupon.value_unit === 'gems') {
      return `${coupon.value} gems`;
    }
    if (coupon.value_unit === 'keys') {
      return `${coupon.value} keys`;
    }
    if (coupon.value_unit === 'item') {
      return coupon.title;
    }
    return `${coupon.value} ${coupon.value_unit}`;
  }

  /**
   * Get icon for coupon type
   */
  getCouponIcon(coupon: UserCoupon): string {
    switch (coupon.reward_type) {
      case 'coupon':
        return '🎫';
      case 'giveaway':
        return '🎁';
      case 'credit':
        return '💎';
      default:
        return '🎉';
    }
  }

  /**
   * Get source display name
   */
  getSourceDisplay(source: string): string {
    const sourceMap: Record<string, string> = {
      user_drop_completion: 'Drop Completion',
      user_leaderboard: 'Leaderboard Reward',
      user_content_engagement: 'Content Engagement',
      campaign: 'Campaign Reward',
      drop: 'Drop Reward',
      leaderboard: 'Leaderboard',
      content: 'Content',
    };
    return sourceMap[source] || source;
  }

  /**
   * Check if coupon is expiring soon (within 7 days)
   */
  isExpiringSoon(coupon: UserCoupon): boolean {
    const expiryDate = new Date(coupon.expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(coupon: UserCoupon): number {
    const expiryDate = new Date(coupon.expires_at);
    const now = new Date();
    return Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const rewardsService = new RewardsService();
export default rewardsService;
