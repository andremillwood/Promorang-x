import { PromoCardService } from "./promoCardService";
import { MarginPoolService } from "./marginPoolService";

export interface SplitTenderCalculation {
  grossAmount: number;
  promoBalanceAvailable: number;
  promoAllowanceForMerchant: number;
  minBasketSizeRequired: number;
  isEligibleForPromo: boolean;
  promoDiscountApplied: number;
  fiatCashPayable: number;
  platformFee: number; // 5% of fiat cash
  operatorShare: number; // 80% of platform fee
  promorangShare: number; // 20% of platform fee
  netMerchantPayout: number;
  savingsPercentage: number;
}

export interface SplitTenderReceipt {
  id: string;
  timestamp: string;
  merchantId: string;
  merchantName: string;
  grossAmount: number;
  promoDiscountApplied: number;
  fiatCashCharged: number;
  platformFee: number;
  netMerchantReceived: number;
  savingsSummary: string;
}

export class SplitTenderService {
  public static calculateSplit(
    grossAmount: number,
    merchantId: string,
    usePromoCredit: boolean = true
  ): SplitTenderCalculation {
    const card = PromoCardService.getCardSummary();
    const pool = MarginPoolService.getPoolByMerchantId(merchantId);

    const allowance = pool?.allowancePerUser ?? 10.0;
    const minBasket = pool?.minBasketSize ?? 25.0;
    const isEligible = grossAmount >= minBasket && pool?.isActive !== false;

    let promoDiscount = 0;
    if (usePromoCredit && isEligible) {
      // discount is the minimum of user's balance, merchant's allowance, or grossAmount - 1 (leave at least $1 cash)
      promoDiscount = Math.min(card.availableBalance, allowance, Math.max(0, grossAmount - 1));
    }

    const fiatCash = Math.max(0, grossAmount - promoDiscount);
    const platformFee = Number((fiatCash * 0.05).toFixed(2));
    const operatorShare = Number((platformFee * 0.8).toFixed(2));
    const promorangShare = Number((platformFee * 0.2).toFixed(2));
    const netMerchantPayout = Number((fiatCash - platformFee).toFixed(2));
    const savingsPercent = grossAmount > 0 ? Math.round((promoDiscount / grossAmount) * 100) : 0;

    return {
      grossAmount,
      promoBalanceAvailable: card.availableBalance,
      promoAllowanceForMerchant: allowance,
      minBasketSizeRequired: minBasket,
      isEligibleForPromo: isEligible,
      promoDiscountApplied: promoDiscount,
      fiatCashPayable: fiatCash,
      platformFee,
      operatorShare,
      promorangShare,
      netMerchantPayout,
      savingsPercentage: savingsPercent,
    };
  }

  public static executeTransaction(
    _merchantId: string,
    _merchantName: string,
    _grossAmount: number,
    _usePromoCredit: boolean = true
  ): { success: boolean; receipt?: SplitTenderReceipt; error?: string } {
    return {
      success: false,
      error: "PromoCard does not complete simulated payments. Claim a live perk and have the merchant validate it.",
    };
  }
}
