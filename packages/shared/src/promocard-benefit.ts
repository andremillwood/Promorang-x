export const PROMOCARD_DISTRIBUTION_LOOP = [
  "merchant_supplied",
  "ambassador_shared",
  "member_claimed",
  "merchant_validated",
  "attribution_updated",
  "return_reason",
] as const;

export type PromoCardLoopStage = (typeof PROMOCARD_DISTRIBUTION_LOOP)[number];

export type PromoCardFulfillmentState =
  | "available"
  | "issued"
  | "claimed"
  | "pending"
  | "redeemed"
  | "expired"
  | "exhausted";

export type PromoCardCardAction = "use_this" | "available_nearby" | "get_next_benefit";

export type PromoCardIssuer = {
  id: string | null;
  type: string;
  name: string;
};

export type PromoCardEligibility = {
  who: string;
  perUserLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  remaining: number | null;
};

export type PromoCardRedemptionRecord = {
  recorded: boolean;
  code: string | null;
  redeemedAt: string | null;
  redeemedBy: string | null;
};

export type PromoCardBenefit = {
  id: string;
  offerId: string | null;
  issuanceId: string | null;
  dropId: string | null;
  title: string;
  detail: string;
  issuer: PromoCardIssuer;
  eligibility: PromoCardEligibility;
  availableQuantity: number | null;
  budget: number | null;
  expiresAt: string | null;
  fulfillmentState: PromoCardFulfillmentState;
  fulfillmentType: string;
  redemption: PromoCardRedemptionRecord;
  sharedBy: { id: string | null; name: string } | null;
  href: string;
};

export type PromoCardRepeatUseProof = {
  firstRedemptions: number;
  secondUses: number;
  referredUsersWhoRedeem: number;
  merchantOutcomes: {
    participatingBusinesses: number;
    verifiedRedemptions: number;
    uniqueCustomers: number;
  };
  contributorRewards: {
    rewardedContributors: number;
    pointsAwarded: number;
  };
};

const REQUIRED_BENEFIT_FIELDS = [
  "id",
  "issuer",
  "eligibility",
  "availableQuantity",
  "expiresAt",
  "fulfillmentState",
  "redemption",
] as const;

export function remainingQuantity(total: number | null | undefined, reserved = 0, redeemed = 0) {
  if (total == null) return null;
  return Math.max(0, Number(total) - Number(reserved || 0) - Number(redeemed || 0));
}

export function fulfillmentFromStatus(status?: string | null, expiresAt?: string | null): PromoCardFulfillmentState {
  if (expiresAt) {
    const expiry = Date.parse(expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return "expired";
  }
  switch (String(status || "")) {
    case "issued":
      return "issued";
    case "claimed":
      return "claimed";
    case "fulfillment_pending":
      return "pending";
    case "redeemed":
      return "redeemed";
    case "expired":
      return "expired";
    case "exhausted":
      return "exhausted";
    case "active":
    case "available":
      return "available";
    default:
      return status ? "available" : "issued";
  }
}

export function isCompleteBenefit(benefit: Partial<PromoCardBenefit> | null | undefined) {
  if (!benefit || typeof benefit !== "object") return false;
  for (const field of REQUIRED_BENEFIT_FIELDS) {
    if (benefit[field] == null) return false;
  }
  if (!benefit.issuer?.id && !benefit.issuer?.name) return false;
  if (!benefit.eligibility || typeof benefit.eligibility.who !== "string") return false;
  if (!benefit.redemption || typeof benefit.redemption.recorded !== "boolean") return false;
  return true;
}

export function canUseBenefit(benefit: Pick<PromoCardBenefit, "fulfillmentState" | "fulfillmentType" | "redemption" | "expiresAt">) {
  if (benefit.redemption?.recorded) return false;
  if (benefit.expiresAt) {
    const expiry = Date.parse(benefit.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return false;
  }
  const type = benefit.fulfillmentType || "merchant_validation";
  if (!["code", "merchant_validation"].includes(type)) return false;
  return benefit.fulfillmentState === "claimed" && Boolean(benefit.redemption?.code);
}

export function selectUseThis(benefits: PromoCardBenefit[]) {
  return benefits.find((benefit) => canUseBenefit(benefit)) || null;
}

export function selectNextBenefit(nearby: PromoCardBenefit[], used?: PromoCardBenefit | null) {
  if (!nearby.length) return null;
  const usedOffer = used?.offerId;
  return nearby.find((benefit) => benefit.offerId && benefit.offerId !== usedOffer) || nearby[0] || null;
}

export function primaryCardAction(input: {
  useThis?: PromoCardBenefit | null;
  nearby?: PromoCardBenefit[];
  nextBenefit?: PromoCardBenefit | null;
}): PromoCardCardAction {
  if (input.useThis && canUseBenefit(input.useThis)) return "use_this";
  if (input.nextBenefit) return "get_next_benefit";
  if ((input.nearby || []).length) return "available_nearby";
  return "get_next_benefit";
}

export function contributorRewardAmount(offer: {
  value_amount?: number | string | null;
  metadata?: Record<string, unknown> | null;
} = {}) {
  const meta = offer.metadata && typeof offer.metadata === "object" ? offer.metadata : {};
  const fromMeta = Number(meta.contributor_reward_points ?? meta.you_earn_points);
  if (Number.isFinite(fromMeta) && fromMeta > 0) return Math.min(Math.round(fromMeta), 500);
  const value = Number(offer.value_amount);
  if (Number.isFinite(value) && value > 0) return Math.min(Math.max(5, Math.round(value)), 100);
  return 25;
}

export function summarizeRepeatUse(rows: Array<{
  userId: string;
  referrerId?: string | null;
  merchantId?: string | null;
  contributorId?: string | null;
  contributorPoints?: number | null;
}>): PromoCardRepeatUseProof {
  const redemptionsByUser = new Map<string, number>();
  const merchants = new Set<string>();
  const referred = new Set<string>();
  const contributors = new Set<string>();
  let pointsAwarded = 0;

  for (const row of rows) {
    redemptionsByUser.set(row.userId, (redemptionsByUser.get(row.userId) || 0) + 1);
    if (row.merchantId) merchants.add(row.merchantId);
    if (row.referrerId) referred.add(row.userId);
    if (row.contributorId) {
      contributors.add(row.contributorId);
      pointsAwarded += Number(row.contributorPoints || 0);
    }
  }

  let firstRedemptions = 0;
  let secondUses = 0;
  for (const count of redemptionsByUser.values()) {
    if (count === 1) firstRedemptions += 1;
    if (count >= 2) secondUses += 1;
  }

  return {
    firstRedemptions,
    secondUses,
    referredUsersWhoRedeem: referred.size,
    merchantOutcomes: {
      participatingBusinesses: merchants.size,
      verifiedRedemptions: rows.length,
      uniqueCustomers: redemptionsByUser.size,
    },
    contributorRewards: {
      rewardedContributors: contributors.size,
      pointsAwarded,
    },
  };
}

export function loopProgress(input: {
  supplied?: boolean;
  shared?: boolean;
  claimed?: boolean;
  validated?: boolean;
  attributed?: boolean;
  returnReason?: boolean;
}) {
  const done: Record<PromoCardLoopStage, boolean> = {
    merchant_supplied: Boolean(input.supplied),
    ambassador_shared: Boolean(input.shared),
    member_claimed: Boolean(input.claimed),
    merchant_validated: Boolean(input.validated),
    attribution_updated: Boolean(input.attributed),
    return_reason: Boolean(input.returnReason),
  };
  const current = PROMOCARD_DISTRIBUTION_LOOP.find((stage) => !done[stage]) || "return_reason";
  return { stages: PROMOCARD_DISTRIBUTION_LOOP, done, current };
}
