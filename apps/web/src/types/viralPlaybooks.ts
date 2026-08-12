export interface SlashItDeal {
  id: string;
  couponId: string;
  dealTitle: string;
  originalPrice: number;
  currentPrice: number;
  targetPrice: number;
  slashesNeeded: number;
  slashesCompleted: number;
  expiresAt: string;
  contributors: { helperName: string; avatarUrl?: string; amountSaved: number }[];
}

export interface FlashRaid {
  id: string;
  title: string;
  merchantName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  rewardMultiplier: number;
  endsAt: string;
  totalSpots: number;
  claimedSpots: number;
  distanceFormatted: string;
  userWithinRadius: boolean;
}

export interface UserExplorationStreak {
  currentStreakDays: number;
  longestStreakDays: number;
  streakFreezesAvailable: number;
  yieldMultiplier: number;
  lastActivityFormatted: string;
}

export interface DropGift {
  id: string;
  senderName: string;
  senderAvatar?: string;
  couponTitle: string;
  merchantName: string;
  message?: string;
  sentAtFormatted: string;
}

export interface SuperMerchantInfo {
  isSuperMerchant: boolean;
  trustScore: number;
  totalRedemptions: number;
  badgeTitle: string;
}
