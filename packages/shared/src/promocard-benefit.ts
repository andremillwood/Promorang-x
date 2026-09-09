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

export type PromoCardBenefitType =
  | "fixed_discount"
  | "percentage_discount"
  | "free_item"
  | "access"
  | "bundle"
  | "other";

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
  rewardType?: string | null;
  valueAmount?: number | null;
  valueCurrency?: string | null;
  locationLabel?: string | null;
  minSpend?: number | null;
  availability?: "local" | "anywhere" | null;
  surface?: "place" | "commerce" | "digital" | "release" | null;
};

export type PromoBenefitPresentation = {
  id: string;
  merchantName: string;
  merchantSlug?: string;
  headline: string;
  description?: string;
  inventoryRemaining?: number;
  locationLabel?: string;
  expiresAt?: string | null;
  scarcityLabel?: string;
  benefitType: PromoCardBenefitType;
  ctaLabel: string;
  href: string;
  empty: boolean;
};

export type PresentPromoBenefitOptions = {
  authenticated?: boolean;
  claimed?: boolean;
  unlock?: boolean;
  now?: number;
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

const STRONG_HEADLINE =
  /(\d+\s*%\s*off|\$\s*\d|\d+\s*(usd|jmd|gbp|eur)\s*off|free\s+\w+|2\s*[-–]?\s*for\s*[-–]?\s*1|complimentary|vip\s+access|early\s+access|free\s+entry)/i;
const PERCENT_HEADLINE = /\d+\s*%/;
const ACCESS_HEADLINE = /\b(entry|access|vip|guest\s*list|early\s+access)\b/i;
const FREE_HEADLINE = /\b(free|complimentary|comp)\b/i;
const BUNDLE_HEADLINE = /2\s*[-–]?\s*for\s*[-–]?\s*1|bundle/i;

function compactText(value?: string | null) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function displayHeadline(value: string) {
  return compactText(value).replace(/\s+/g, " ").toUpperCase();
}

function moneySymbol(currency?: string | null) {
  const code = String(currency || "").toUpperCase();
  if (code === "GBP") return "£";
  if (code === "EUR") return "€";
  return "$";
}

function formatMoneyAmount(amount: number, currency?: string | null) {
  const rounded = Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.00$/, "");
  return `${moneySymbol(currency)}${rounded}`;
}

function titleFromHeadline(headline: string) {
  return compactText(headline)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

export function isLivePromoBenefit(benefit?: PromoCardBenefit | null, now = Date.now()) {
  if (!benefit) return false;
  if (["expired", "exhausted", "redeemed"].includes(benefit.fulfillmentState)) return false;
  if (benefit.availableQuantity === 0) return false;
  if (benefit.expiresAt) {
    const expiry = Date.parse(benefit.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= now) return false;
  }
  return true;
}

export function classifyBenefitType(benefit: Pick<PromoCardBenefit, "title" | "detail" | "rewardType" | "valueAmount">): PromoCardBenefitType {
  const title = benefit.title || "";
  const detail = benefit.detail || "";
  const amount = Number(benefit.valueAmount);
  const hasAmount = Number.isFinite(amount) && amount > 0;
  if (PERCENT_HEADLINE.test(title) || PERCENT_HEADLINE.test(detail)) return "percentage_discount";
  if (BUNDLE_HEADLINE.test(title)) return "bundle";
  if (ACCESS_HEADLINE.test(title)) return "access";
  if (FREE_HEADLINE.test(title)) return "free_item";
  if (hasAmount) return "fixed_discount";
  if (BUNDLE_HEADLINE.test(detail)) return "bundle";
  if (ACCESS_HEADLINE.test(detail) || (benefit.rewardType === "experience" && !hasAmount)) return "access";
  if (FREE_HEADLINE.test(detail)) return "free_item";
  if (["coupon", "voucher", "cash"].includes(String(benefit.rewardType || ""))) return "fixed_discount";
  return "other";
}

export function presentBenefitHeadline(benefit: Pick<PromoCardBenefit, "title" | "detail" | "rewardType" | "valueAmount" | "valueCurrency">) {
  const title = compactText(benefit.title);
  const percentMatch = title.match(/(\d+)\s*%/);
  if (percentMatch) return displayHeadline(`${percentMatch[1]}% OFF`);
  const moneyMatch = title.match(/\$\s*(\d+(?:\.\d+)?)\s*off/i);
  if (moneyMatch) return displayHeadline(`$${moneyMatch[1]} OFF`);

  if (title && STRONG_HEADLINE.test(title)) return displayHeadline(title);

  const amount = Number(benefit.valueAmount);
  const hasAmount = Number.isFinite(amount) && amount > 0;
  if (hasAmount && PERCENT_HEADLINE.test(`${title} ${benefit.detail || ""}`)) {
    return displayHeadline(`${amount}% OFF`);
  }
  if (hasAmount && ["coupon", "voucher", "cash", "other", ""].includes(String(benefit.rewardType || "")) && !FREE_HEADLINE.test(title) && !ACCESS_HEADLINE.test(title)) {
    return displayHeadline(`${formatMoneyAmount(amount, benefit.valueCurrency)} OFF`);
  }
  if (title) return displayHeadline(title);
  if (hasAmount) return displayHeadline(`${formatMoneyAmount(amount, benefit.valueCurrency)} OFF`);
  return "A LIVE BENEFIT";
}

export function presentBenefitDescription(benefit: Pick<PromoCardBenefit, "title" | "detail" | "minSpend" | "valueCurrency">) {
  const detail = compactText(benefit.detail);
  if (detail) return detail;
  if (benefit.minSpend != null && Number(benefit.minSpend) > 0) {
    return `Spend ${formatMoneyAmount(Number(benefit.minSpend), benefit.valueCurrency)} or more`;
  }
  const title = compactText(benefit.title);
  const headline = presentBenefitHeadline(benefit);
  if (title && displayHeadline(title) !== headline) return title;
  return undefined;
}

function startOfLocalDay(now: number) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function benefitExpiryLabel(expiresAt?: string | null, now = Date.now()) {
  if (!expiresAt) return undefined;
  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now) return undefined;
  const startToday = startOfLocalDay(now);
  const startTomorrow = startToday + 86_400_000;
  if (expiry < startTomorrow) {
    const hour = new Date(expiry).getHours();
    return hour >= 17 ? "Ends tonight" : "Available today";
  }
  if (expiry < startToday + 2 * 86_400_000) return "Ends tomorrow";
  return `Expires ${new Date(expiry).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function benefitScarcityLabel(
  benefit: Pick<PromoCardBenefit, "availableQuantity" | "eligibility" | "expiresAt">,
  now = Date.now(),
) {
  const remaining = benefit.availableQuantity ?? benefit.eligibility?.remaining ?? null;
  const parts: string[] = [];
  if (remaining != null && remaining > 0) {
    parts.push(remaining <= 8 ? `Only ${remaining} left` : `${remaining} remaining`);
  }
  const expiry = benefitExpiryLabel(benefit.expiresAt, now);
  if (expiry) parts.push(expiry);
  return parts.length ? parts.join(" · ") : undefined;
}

export function benefitCtaLabel(
  benefit: PromoCardBenefit,
  options: PresentPromoBenefitOptions = {},
) {
  if (options.claimed && canUseBenefit(benefit)) return "Redeem Benefit";
  if (options.unlock && !options.claimed) return "Unlock this";
  const type = classifyBenefitType(benefit);
  const headline = titleFromHeadline(presentBenefitHeadline(benefit));
  if (type === "fixed_discount" || type === "percentage_discount") return `Claim ${headline}`;
  if (type === "free_item") return headline.toLowerCase().includes("free") ? `Get ${headline}` : "Claim Benefit";
  if (type === "access") return /entry/i.test(headline) ? "Unlock Entry" : "Unlock Access";
  if (type === "bundle") return "Unlock Offer";
  return "See Benefit";
}

function featuredScore(benefit: PromoCardBenefit) {
  let score = 0;
  const amount = Number(benefit.valueAmount);
  if (Number.isFinite(amount) && amount > 0) score += Math.min(amount, 500);
  if (STRONG_HEADLINE.test(benefit.title || "") || STRONG_HEADLINE.test(presentBenefitHeadline(benefit))) score += 80;
  const remaining = benefit.availableQuantity ?? benefit.eligibility?.remaining;
  if (remaining != null && remaining > 0 && remaining <= 25) score += 20;
  if (benefit.locationLabel) score += 10;
  return score;
}

export function selectFeaturedBenefit(input: {
  useThis?: PromoCardBenefit | null;
  nearby?: PromoCardBenefit[];
  nextBenefit?: PromoCardBenefit | null;
  now?: number;
}) {
  const now = input.now ?? Date.now();
  if (input.useThis && canUseBenefit(input.useThis)) return input.useThis;
  const pool = [...(input.nearby || [])];
  if (input.nextBenefit && !pool.some((item) => item.id === input.nextBenefit?.id)) {
    pool.unshift(input.nextBenefit);
  }
  const live = pool.filter((item) => isLivePromoBenefit(item, now));
  if (!live.length) return null;
  return [...live].sort((left, right) => featuredScore(right) - featuredScore(left))[0] || null;
}

export function presentPromoBenefit(
  benefit?: PromoCardBenefit | null,
  options: PresentPromoBenefitOptions = {},
): PromoBenefitPresentation | null {
  if (!benefit) return null;
  const claimed = options.claimed ?? canUseBenefit(benefit);
  const remaining = benefit.availableQuantity ?? benefit.eligibility?.remaining ?? null;
  return {
    id: benefit.id,
    merchantName: benefit.issuer?.name || "Participating place",
    headline: presentBenefitHeadline(benefit),
    description: presentBenefitDescription(benefit),
    inventoryRemaining: remaining == null ? undefined : remaining,
    locationLabel: compactText(benefit.locationLabel) || undefined,
    expiresAt: benefit.expiresAt,
    scarcityLabel: benefitScarcityLabel(benefit, options.now),
    benefitType: classifyBenefitType(benefit),
    ctaLabel: benefitCtaLabel(benefit, { ...options, claimed }),
    href: benefit.href || "/discover",
    empty: false,
  };
}

export function emptyPromoBenefitPresentation(input: {
  authenticated?: boolean;
  href?: string;
} = {}): PromoBenefitPresentation {
  return {
    id: "empty",
    merchantName: "PromoCard",
    headline: "NEW BENEFITS ARE LANDING",
    description: "Your PromoCard gives you access as participating places come online.",
    benefitType: "other",
    ctaLabel: input.authenticated ? "Explore PromoCard" : "Get My PromoCard",
    href: input.href || (input.authenticated ? "/card" : "/auth?mode=signup&next=/card"),
    empty: true,
  };
}
