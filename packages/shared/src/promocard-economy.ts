export const PROMOCARD_NETWORK_CAPACITY = 500;
export const PROMOCARD_FIRST_READY_CREDIT = 50;
export const PROMOCARD_TYPICAL_VISIT_ALLOWANCE = 15;
export const PROMOCARD_TYPICAL_MIN_BASKET = 35;
export const PROMOCARD_CASH_FEE_RATE = 0.05;

export type PromoCardIssuance = {
  everyoneGetsTheCard: true;
  creditRequiresPartnerAuthorization: true;
  isLoan: false;
  isCashBalance: false;
  fundedBy: "partners";
  networkCapacity: number;
  firstReadyCredit: number;
  typicalVisitAllowance: number;
};

export type PromoCardVisitSettlement = {
  eligible: boolean;
  reason: "ok" | "inactive_pool" | "below_minimum" | "no_ready_credit" | "no_allowance";
  promoApplied: number;
  cashRemainder: number;
  platformFee: number;
  merchantCash: number;
  memberSavings: number;
};

export function describePromoCardIssuance(): PromoCardIssuance {
  return {
    everyoneGetsTheCard: true,
    creditRequiresPartnerAuthorization: true,
    isLoan: false,
    isCashBalance: false,
    fundedBy: "partners",
    networkCapacity: PROMOCARD_NETWORK_CAPACITY,
    firstReadyCredit: PROMOCARD_FIRST_READY_CREDIT,
    typicalVisitAllowance: PROMOCARD_TYPICAL_VISIT_ALLOWANCE,
  };
}

export function settlePromoCardVisit(input: {
  basket: number;
  cardReady: number;
  merchantAllowance: number;
  minBasket?: number;
  poolActive?: boolean;
  feeRate?: number;
}): PromoCardVisitSettlement {
  const basket = Math.max(0, Number(input.basket) || 0);
  const cardReady = Math.max(0, Number(input.cardReady) || 0);
  const merchantAllowance = Math.max(0, Number(input.merchantAllowance) || 0);
  const minBasket = Math.max(0, Number(input.minBasket ?? PROMOCARD_TYPICAL_MIN_BASKET) || 0);
  const feeRate = Math.min(1, Math.max(0, Number(input.feeRate ?? PROMOCARD_CASH_FEE_RATE) || 0));

  if (input.poolActive === false) {
    return blankSettlement(basket, "inactive_pool");
  }
  if (basket < minBasket) {
    return blankSettlement(basket, "below_minimum");
  }
  if (cardReady <= 0) {
    return blankSettlement(basket, "no_ready_credit");
  }
  if (merchantAllowance <= 0) {
    return blankSettlement(basket, "no_allowance");
  }

  const promoApplied = Number(
    Math.min(cardReady, merchantAllowance, Math.max(0, basket - 1)).toFixed(2)
  );
  const cashRemainder = Number(Math.max(0, basket - promoApplied).toFixed(2));
  const platformFee = Number((cashRemainder * feeRate).toFixed(2));
  const merchantCash = Number((cashRemainder - platformFee).toFixed(2));

  return {
    eligible: promoApplied > 0,
    reason: "ok",
    promoApplied,
    cashRemainder,
    platformFee,
    merchantCash,
    memberSavings: promoApplied,
  };
}

function blankSettlement(basket: number, reason: PromoCardVisitSettlement["reason"]): PromoCardVisitSettlement {
  return {
    eligible: false,
    reason,
    promoApplied: 0,
    cashRemainder: Number(basket.toFixed(2)),
    platformFee: 0,
    merchantCash: Number(basket.toFixed(2)),
    memberSavings: 0,
  };
}
