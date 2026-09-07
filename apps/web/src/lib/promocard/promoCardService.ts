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

export interface RechargeAction {
  id: string;
  type: "moment_post" | "verified_review" | "referral_join" | "check_in" | "social_share";
  title: string;
  rewardAmount: number;
  completed: boolean;
  actionUrl?: string;
}

export interface GroupTippingDrop {
  id: string;
  merchantName: string;
  merchantCategory: string;
  headline: string;
  targetParticipants: number;
  currentParticipants: number;
  unlockedPerkAmount: number;
  minSpend: number;
  expiresInHours: number;
  isUnlocked: boolean;
  userJoined: boolean;
}

export interface BulkPassOrder {
  id: string;
  organizationName: string;
  passCount: number;
  amountPerPass: number;
  totalCashPaid: number;
  passCodePrefix: string;
  createdAt: string;
}

const BULK_ORDERS_KEY = "promorang_bulk_orders_state";

const DEFAULT_CARD_STATE: PromoCardData = {
  userId: "user_current",
  tier: "starter",
  monthlyLimit: 0,
  availableBalance: 0,
  prepaidCashBalance: 0,
  spentThisCycle: 0,
  cycleDaysRemaining: 0,
  rechargeHealthScore: 0,
  cardNumber: "No live balance",
  cardHolderName: "Promorang Member",
  memberSince: "2026",
  totalSavingsLifetime: 0,
  acceptedLocationsCount: 0,
};

const SIMULATED_COMPLETION = "PromoCard does not complete payment, gift activation, or recharge in the customer journey. Claim a merchant benefit and have it validated.";

export class PromoCardService {
  private static refuseSimulatedCompletion(action: string): never {
    throw new Error(`${action} is not a live PromoCard completion. ${SIMULATED_COMPLETION}`);
  }

  private static getStoredData(): PromoCardData {
    return { ...DEFAULT_CARD_STATE, availableBalance: 0, prepaidCashBalance: 0, spentThisCycle: 0 };
  }

  private static saveStoredData(_data: PromoCardData): void {
    this.refuseSimulatedCompletion("Saving a local PromoCard balance");
  }

  public static getCardSummary(userId?: string): PromoCardData {
    const data = this.getStoredData();
    if (userId) {
      data.userId = userId;
    }
    return data;
  }

  public static getRechargeActions(): RechargeAction[] {
    return [];
  }

  // --- STARBUCKS-STYLE CASH PREPAID TOP-UP ---
  public static topUpWithCash(_cashAmount: number): never {
    this.refuseSimulatedCompletion("Cash top-up");
  }

  // --- PROMORANG COMMUNITY TIPPING POINT DROPS ---
  public static getGroupDrops(): GroupTippingDrop[] {
    return [];
  }

  public static joinGroupDrop(_dropId: string): never {
    this.refuseSimulatedCompletion("Gift or group-drop activation");
  }

  // --- B2B CORPORATE & EVENT BULK PASSES ---
  public static createBulkPassOrder(
    organizationName: string,
    passCount: number,
    amountPerPass: number
  ): BulkPassOrder {
    const totalCash = passCount * amountPerPass;
    const order: BulkPassOrder = {
      id: `bulk_${Date.now()}`,
      organizationName,
      passCount,
      amountPerPass,
      totalCashPaid: totalCash,
      passCodePrefix: `CORP_${organizationName.slice(0, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing: BulkPassOrder[] = JSON.parse(localStorage.getItem(BULK_ORDERS_KEY) || "[]");
      existing.push(order);
      localStorage.setItem(BULK_ORDERS_KEY, JSON.stringify(existing));
    } catch {}

    return order;
  }

  public static rechargeCard(
    _userId: string,
    _actionType: RechargeAction["type"],
    _amount?: number
  ): never {
    this.refuseSimulatedCompletion("Attention recharge");
  }

  public static deductBalance(_amount: number): never {
    this.refuseSimulatedCompletion("Simulated payment");
  }

  public static upgradeTier(newTier: PromoCardTier): PromoCardData {
    const data = this.getStoredData();
    const limits: Record<PromoCardTier, number> = {
      starter: 25.0,
      verified: 50.0,
      vip: 100.0,
      ambassador: 250.0,
    };

    data.tier = newTier;
    data.monthlyLimit = limits[newTier];
    data.availableBalance = Math.min(data.monthlyLimit, data.availableBalance + (limits[newTier] - data.monthlyLimit));

    this.saveStoredData(data);
    return data;
  }
}
