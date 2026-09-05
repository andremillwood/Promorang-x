export type PromoCardTier = "starter" | "verified" | "vip" | "ambassador";

export interface PromoCardData {
  userId: string;
  tier: PromoCardTier;
  monthlyLimit: number;
  availableBalance: number;
  prepaidCashBalance: number; // Starbucks-style prepaid cash float
  spentThisCycle: number;
  cycleDaysRemaining: number;
  rechargeHealthScore: number; // 0 to 100%
  cardNumber: string;
  cardHolderName: string;
  memberSince: string;
  totalSavingsLifetime: number;
  acceptedLocationsCount: number;
}
