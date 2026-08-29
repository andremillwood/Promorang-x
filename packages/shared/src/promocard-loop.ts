import {
  PROMOCARD_FIRST_READY_CREDIT,
  PROMOCARD_NETWORK_CAPACITY,
  PROMOCARD_TYPICAL_VISIT_ALLOWANCE,
} from "./promocard-economy";

export const PROMOCARD_STARTER_CYCLE_CREDIT = PROMOCARD_FIRST_READY_CREDIT;
export const PROMOCARD_DEFAULT_RECHARGE = PROMOCARD_TYPICAL_VISIT_ALLOWANCE;
export const PROMOCARD_POINTS_PER_KEY = 500;
export { PROMOCARD_NETWORK_CAPACITY, PROMOCARD_FIRST_READY_CREDIT };

export type PromoCardNextSuccessId =
  | "claim_card"
  | "show_up"
  | "earn_points"
  | "convert_key"
  | "use_key"
  | "recharge"
  | "keep_loop";

export type PromoCardCreditSnapshot = {
  readyToSpend: number;
  cycleCredit: number;
  networkCapacity: number;
  spentThisCycle: number;
  stillRestorable: number;
  nextRechargeAmount: number;
  prospectiveAfterNextAction: number;
};

export type PromoCardInstrumentSnapshot = {
  points: number;
  promoKeys: number;
  pointsPerKey: number;
  pointsToNextKey: number;
  nextKeyProgress: number;
  canConvertKey: boolean;
};

export type PromoCardNextSuccess = {
  id: PromoCardNextSuccessId;
  href: string;
  creditHint: number;
  pointsHint: number;
  keysHint: number;
};

export type PromoCardLoopInput = {
  hasLiveCard?: boolean;
  monthlyLimit?: number;
  availableBalance?: number;
  spentThisCycle?: number;
  nextRechargeAmount?: number;
  points?: number;
  promoKeys?: number;
  pointsPerKey?: number;
};

const money = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0);

export function describePromoCardCredit(input: PromoCardLoopInput = {}): PromoCardCreditSnapshot {
  const cycleCredit = money(input.monthlyLimit ?? PROMOCARD_STARTER_CYCLE_CREDIT);
  const readyToSpend = money(input.hasLiveCard === false ? cycleCredit : (input.availableBalance ?? cycleCredit));
  const spentThisCycle = money(input.spentThisCycle ?? 0);
  const stillRestorable = money(cycleCredit - (input.hasLiveCard === false ? cycleCredit : money(input.availableBalance ?? cycleCredit)));
  const nextRechargeAmount = money(input.nextRechargeAmount ?? PROMOCARD_DEFAULT_RECHARGE);
  const appliedRecharge = Math.min(stillRestorable || nextRechargeAmount, nextRechargeAmount);

  return {
    readyToSpend,
    cycleCredit,
    networkCapacity: PROMOCARD_NETWORK_CAPACITY,
    spentThisCycle,
    stillRestorable,
    nextRechargeAmount,
    prospectiveAfterNextAction: Math.min(cycleCredit, readyToSpend + appliedRecharge),
  };
}

export function describePromoCardInstruments(input: PromoCardLoopInput = {}): PromoCardInstrumentSnapshot {
  const pointsPerKey = Math.max(1, Math.round(input.pointsPerKey ?? PROMOCARD_POINTS_PER_KEY));
  const points = Math.max(0, Math.floor(input.points ?? 0));
  const promoKeys = Math.max(0, Math.floor(input.promoKeys ?? 0));
  const remainder = points % pointsPerKey;
  const canConvertKey = points >= pointsPerKey;

  return {
    points,
    promoKeys,
    pointsPerKey,
    pointsToNextKey: canConvertKey ? 0 : pointsPerKey - remainder,
    nextKeyProgress: canConvertKey ? 100 : Math.min(100, (remainder / pointsPerKey) * 100),
    canConvertKey,
  };
}

export function pickPromoCardNextSuccess(input: PromoCardLoopInput = {}): PromoCardNextSuccess {
  const credit = describePromoCardCredit(input);
  const instruments = describePromoCardInstruments(input);
  const hasLiveCard = Boolean(input.hasLiveCard);

  if (!hasLiveCard) {
    return {
      id: "claim_card",
      href: "/auth?mode=signup&next=/wallet",
      creditHint: credit.networkCapacity,
      pointsHint: 0,
      keysHint: 0,
    };
  }

  if (instruments.promoKeys >= 1) {
    return {
      id: "use_key",
      href: "/discover",
      creditHint: credit.nextRechargeAmount,
      pointsHint: instruments.points,
      keysHint: instruments.promoKeys,
    };
  }

  if (instruments.canConvertKey) {
    return {
      id: "convert_key",
      href: "/wallet#convert-keys",
      creditHint: credit.nextRechargeAmount,
      pointsHint: instruments.points,
      keysHint: 1,
    };
  }

  if (instruments.points === 0) {
    return {
      id: "show_up",
      href: "/discover",
      creditHint: credit.nextRechargeAmount,
      pointsHint: instruments.pointsPerKey,
      keysHint: 0,
    };
  }

  if (credit.spentThisCycle > 0 && credit.stillRestorable > 0) {
    return {
      id: "recharge",
      href: "/wallet#recharge",
      creditHint: credit.stillRestorable,
      pointsHint: instruments.pointsToNextKey,
      keysHint: instruments.promoKeys,
    };
  }

  if (instruments.pointsToNextKey > 0) {
    return {
      id: "earn_points",
      href: "/discover",
      creditHint: credit.nextRechargeAmount,
      pointsHint: instruments.pointsToNextKey,
      keysHint: 0,
    };
  }

  return {
    id: "keep_loop",
    href: "/discover",
    creditHint: credit.readyToSpend,
    pointsHint: instruments.points,
    keysHint: instruments.promoKeys,
  };
}

export function describePromoCardLoop(input: PromoCardLoopInput = {}) {
  return {
    credit: describePromoCardCredit(input),
    instruments: describePromoCardInstruments(input),
    next: pickPromoCardNextSuccess(input),
  };
}
