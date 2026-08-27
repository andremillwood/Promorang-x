export interface MerchantMarginPool {
  merchantId: string;
  merchantName: string;
  category: string;
  logoUrl?: string;
  allowancePerUser: number; // e.g. $15 off
  minBasketSize: number; // e.g. $35 minimum spend
  monthlyCustomerCap: number; // e.g. 50 new customers
  currentRedemptionsCount: number;
  totalCashEarned: number; // Real fiat revenue brought to merchant
  totalMarginCommitted: number; // Allowance value committed ($0 cash out of pocket)
  isActive: boolean;
  termsNote: string;
}

const STORAGE_KEY = "promorang_merchant_margin_pools";

const DEFAULT_POOLS: Record<string, MerchantMarginPool> = {
  merchant_demo_1: {
    merchantId: "merchant_demo_1",
    merchantName: "Kinfolk Coffee & Roasters",
    category: "Food & Beverage",
    allowancePerUser: 10.0,
    minBasketSize: 25.0,
    monthlyCustomerCap: 60,
    currentRedemptionsCount: 28,
    totalCashEarned: 840.0,
    totalMarginCommitted: 600.0,
    isActive: true,
    termsNote: "Valid on all handcrafted beverages and pastry items over $25.",
  },
  merchant_demo_2: {
    merchantId: "merchant_demo_2",
    merchantName: "District Apparel Studio",
    category: "Fashion & Retail",
    allowancePerUser: 20.0,
    minBasketSize: 60.0,
    monthlyCustomerCap: 40,
    currentRedemptionsCount: 19,
    totalCashEarned: 1330.0,
    totalMarginCommitted: 800.0,
    isActive: true,
    termsNote: "Valid on all in-store apparel purchases over $60.",
  },
  merchant_demo_3: {
    merchantId: "merchant_demo_3",
    merchantName: "Apex High-Performance Gym",
    category: "Wellness & Fitness",
    allowancePerUser: 25.0,
    minBasketSize: 75.0,
    monthlyCustomerCap: 30,
    currentRedemptionsCount: 14,
    totalCashEarned: 1050.0,
    totalMarginCommitted: 750.0,
    isActive: true,
    termsNote: "Valid on 10-class passes and monthly memberships.",
  },
};

export class MarginPoolService {
  private static getStoredPools(): Record<string, MerchantMarginPool> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_POOLS;
  }

  private static saveStoredPools(pools: Record<string, MerchantMarginPool>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
    } catch {
      // ignore storage errors
    }
  }

  public static getAllPools(): MerchantMarginPool[] {
    const pools = this.getStoredPools();
    return Object.values(pools);
  }

  public static getPoolByMerchantId(merchantId: string): MerchantMarginPool | null {
    const pools = this.getStoredPools();
    return pools[merchantId] || null;
  }

  public static updateMarginPool(
    merchantId: string,
    updates: Partial<MerchantMarginPool>
  ): MerchantMarginPool {
    const pools = this.getStoredPools();
    const existing = pools[merchantId] || {
      merchantId,
      merchantName: updates.merchantName || "New Merchant",
      category: updates.category || "Retail",
      allowancePerUser: 15.0,
      minBasketSize: 40.0,
      monthlyCustomerCap: 50,
      currentRedemptionsCount: 0,
      totalCashEarned: 0,
      totalMarginCommitted: 750.0,
      isActive: true,
      termsNote: "Valid on all qualifying purchases.",
    };

    const updated = { ...existing, ...updates };
    updated.totalMarginCommitted = updated.allowancePerUser * updated.monthlyCustomerCap;
    pools[merchantId] = updated;

    this.saveStoredPools(pools);
    return updated;
  }

  public static recordRedemption(
    merchantId: string,
    fiatCashAmount: number,
    promoAmount: number
  ): void {
    const pools = this.getStoredPools();
    if (pools[merchantId]) {
      pools[merchantId].currentRedemptionsCount += 1;
      pools[merchantId].totalCashEarned += fiatCashAmount;
      this.saveStoredPools(pools);
    }
  }
}
