/**
 * Normalized Perk Model for Promorang
 *
 * Provides a unified abstraction over coupons, complimentary items, upgrades,
 * access passes, experiences, and limited drops.
 */

export type PerkType =
  | 'discount'
  | 'complimentary_item'
  | 'upgrade'
  | 'access'
  | 'experience'
  | 'bundle'
  | 'limited_drop'
  | 'reward'
  | 'cashback'
  | 'points_bonus'
  | 'other';

export type PerkObjective =
  | 'bring_new_customers'
  | 'increase_spend'
  | 'fill_slow_hours'
  | 'launch_item'
  | 'move_inventory'
  | 'generate_repeat_visits'
  | 'generate_referrals'
  | 'build_awareness'
  | 'reward_loyal'
  | 'drive_attendance';

export type PerkAudience =
  | 'everyone'
  | 'new_customers'
  | 'repeat_regulars'
  | 'vip_members'
  | 'students'
  | 'discovery_voters';

export type PerkStatus =
  | 'available'
  | 'claimed'
  | 'unlocked'
  | 'redeemed'
  | 'saved'
  | 'sold_out'
  | 'expired';

export interface Perk {
  id: string;
  title: string;
  description?: string;
  perkType: PerkType;
  merchantId?: string;
  merchantName?: string;
  merchantAvatar?: string;
  merchantLocation?: string;
  brandId?: string;
  imageUrl?: string;
  availableQuantity?: number;
  remainingQuantity?: number;
  startsAt?: string;
  expiresAt?: string;
  claimRequirement?: string;
  redemptionMethod?: 'qr_scan' | 'code_entry' | 'merchant_validation' | 'automatic';
  redemptionCode?: string;
  rewardPoints?: number;
  rewardGems?: number;
  promoShareTickets?: number;
  sourceType?: 'coupon' | 'campaign' | 'moment' | 'discovery' | 'offer' | 'direct';
  sourceId?: string;
  terms?: string;
  discountType?: 'percentage' | 'fixed' | 'free_item';
  discountValue?: number;
  objective?: PerkObjective;
  targetAudience?: PerkAudience;
  category?: string;
  isFeatured?: boolean;
  userState?: {
    isSaved?: boolean;
    isClaimed?: boolean;
    isRedeemed?: boolean;
    claimedAt?: string;
    redemptionCode?: string;
  };
}

export interface PerkClaimResult {
  success: boolean;
  redemptionCode?: string;
  expiresAt?: string;
  promoPointsAwarded?: number;
  promoShareTicketsAwarded?: number;
  message?: string;
}
