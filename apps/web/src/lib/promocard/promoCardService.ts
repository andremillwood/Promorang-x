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

const STORAGE_KEY = "promorang_promocard_state";
const GROUP_DROPS_KEY = "promorang_group_drops_state";
const BULK_ORDERS_KEY = "promorang_bulk_orders_state";

const DEFAULT_CARD_STATE: PromoCardData = {
  userId: "user_current",
  tier: "verified",
  monthlyLimit: 50.0,
  availableBalance: 45.0,
  prepaidCashBalance: 20.0,
  spentThisCycle: 15.0,
  cycleDaysRemaining: 14,
  rechargeHealthScore: 75,
  cardNumber: "•••• •••• •••• 8842",
  cardHolderName: "Promorang Member",
  memberSince: "2025",
  totalSavingsLifetime: 142.5,
  acceptedLocationsCount: 38,
};

const DEFAULT_GROUP_DROPS: GroupTippingDrop[] = [
  {
    id: "drop_community_1",
    merchantName: "Kinfolk Coffee & Roastery",
    merchantCategory: "Food & Beverage",
    headline: "Unlock $20 Super-Drop on Weekend Brunches",
    targetParticipants: 20,
    currentParticipants: 16,
    unlockedPerkAmount: 20.0,
    minSpend: 40.0,
    expiresInHours: 18,
    isUnlocked: false,
    userJoined: false,
  },
  {
    id: "drop_community_2",
    merchantName: "District Streetwear Lab",
    merchantCategory: "Fashion & Retail",
    headline: "Unlock $30 Flash Pass on New Spring Collection",
    targetParticipants: 30,
    currentParticipants: 30,
    unlockedPerkAmount: 30.0,
    minSpend: 75.0,
    expiresInHours: 6,
    isUnlocked: true,
    userJoined: true,
  },
];

const DEFAULT_RECHARGE_ACTIONS: RechargeAction[] = [
  {
    id: "action_1",
    type: "moment_post",
    title: "Post a Moment from your recent visit",
    rewardAmount: 15.0,
    completed: false,
    actionUrl: "/create-moment",
  },
  {
    id: "action_2",
    type: "check_in",
    title: "Check in at a partner venue",
    rewardAmount: 10.0,
    completed: true,
    actionUrl: "/discover",
  },
  {
    id: "action_3",
    type: "social_share",
    title: "Gift a $10 Card Drop to a friend",
    rewardAmount: 10.0,
    completed: false,
    actionUrl: "/promoshare",
  },
  {
    id: "action_4",
    type: "verified_review",
    title: "Leave a verified photo review",
    rewardAmount: 10.0,
    completed: false,
  },
];

export class PromoCardService {
  private static getStoredData(): PromoCardData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_CARD_STATE;
  }

  private static saveStoredData(data: PromoCardData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }

  public static getCardSummary(userId?: string): PromoCardData {
    const data = this.getStoredData();
    if (userId) {
      data.userId = userId;
    }
    return data;
  }

  public static getRechargeActions(): RechargeAction[] {
    return DEFAULT_RECHARGE_ACTIONS;
  }

  // --- STARBUCKS-STYLE CASH PREPAID TOP-UP ---
  public static topUpWithCash(cashAmount: number): {
    updatedCard: PromoCardData;
    bonusMarginAdded: number;
    totalBalanceAdded: number;
  } {
    const data = this.getStoredData();
    // 15% promotional bonus margin funded by merchant clearinghouse pool
    const bonusMargin = Number((cashAmount * 0.15).toFixed(2));
    const totalAdded = cashAmount + bonusMargin;

    data.prepaidCashBalance += cashAmount;
    data.availableBalance += totalAdded;
    data.monthlyLimit += totalAdded;

    this.saveStoredData(data);
    return {
      updatedCard: data,
      bonusMarginAdded: bonusMargin,
      totalBalanceAdded: totalAdded,
    };
  }

  // --- PROMORANG COMMUNITY TIPPING POINT DROPS ---
  public static getGroupDrops(): GroupTippingDrop[] {
    try {
      const stored = localStorage.getItem(GROUP_DROPS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_GROUP_DROPS;
  }

  public static joinGroupDrop(dropId: string): { success: boolean; drop: GroupTippingDrop } {
    const drops = this.getGroupDrops();
    const drop = drops.find((d) => d.id === dropId);
    if (!drop || drop.userJoined) return { success: false, drop: drop! };

    drop.currentParticipants += 1;
    drop.userJoined = true;
    if (drop.currentParticipants >= drop.targetParticipants) {
      drop.isUnlocked = true;
      // Also add the unlocked perk to the user's card!
      const data = this.getStoredData();
      data.availableBalance += drop.unlockedPerkAmount;
      this.saveStoredData(data);
    }

    try {
      localStorage.setItem(GROUP_DROPS_KEY, JSON.stringify(drops));
    } catch {}

    return { success: true, drop };
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
    userId: string,
    actionType: RechargeAction["type"],
    amount?: number
  ): { updatedCard: PromoCardData; rechargedAmount: number } {
    const data = this.getStoredData();
    const rechargeAmount = amount || 15.0;

    data.availableBalance = Math.min(data.monthlyLimit, data.availableBalance + rechargeAmount);
    data.rechargeHealthScore = Math.min(100, data.rechargeHealthScore + 25);

    this.saveStoredData(data);
    return {
      updatedCard: data,
      rechargedAmount: rechargeAmount,
    };
  }

  public static deductBalance(
    amount: number
  ): { success: boolean; newBalance: number; error?: string } {
    const data = this.getStoredData();
    if (data.availableBalance < amount) {
      return {
        success: false,
        newBalance: data.availableBalance,
        error: "Insufficient PromoCard balance",
      };
    }

    data.availableBalance = Math.max(0, data.availableBalance - amount);
    data.spentThisCycle += amount;
    data.totalSavingsLifetime += amount;

    this.saveStoredData(data);
    return {
      success: true,
      newBalance: data.availableBalance,
    };
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
