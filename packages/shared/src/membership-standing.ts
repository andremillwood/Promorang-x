export const MEMBERSHIP_TIER_IDS = ["free", "plus", "pro", "elite"] as const;
export type MembershipTierId = (typeof MEMBERSHIP_TIER_IDS)[number];
export type PaidMembershipTierId = Exclude<MembershipTierId, "free">;

export const MEMBERSHIP_TIERS = {
  free: {
    id: "free",
    label: "Free",
    monthlyPriceUsd: 0,
    pointsMultiplier: 1,
    keyCostRate: 1,
    readyWindowUsd: 50,
    promoCardTier: "verified",
  },
  plus: {
    id: "plus",
    label: "Plus",
    monthlyPriceUsd: 9.99,
    pointsMultiplier: 1.25,
    keyCostRate: 0.9,
    readyWindowUsd: 75,
    promoCardTier: "verified",
  },
  pro: {
    id: "pro",
    label: "Pro",
    monthlyPriceUsd: 24.99,
    pointsMultiplier: 1.5,
    keyCostRate: 0.75,
    readyWindowUsd: 100,
    promoCardTier: "vip",
  },
  elite: {
    id: "elite",
    label: "Elite",
    monthlyPriceUsd: 49.99,
    pointsMultiplier: 2,
    keyCostRate: 0.6,
    readyWindowUsd: 150,
    promoCardTier: "ambassador",
  },
} as const;

export const MEMBERSHIP_EARN_MULTIPLIER = 2;
export const ACTIVE_REFERRAL_CREDIT_USD = MEMBERSHIP_TIERS.plus.monthlyPriceUsd;
export const EARNED_MONTH_DAYS = 30;
export const WEEKEND_TASTE_DAYS = 3;
export const WEEK_BOOST_DAYS = 7;

export type StandingPackageKind = "weekend_taste" | "week_boost" | "month_grant";
export type StandingSource = "free" | "paid" | "earned";

export type StandingPackage = {
  id: string;
  kind: StandingPackageKind;
  tier: PaidMembershipTierId;
  days: number;
  earnRequiredUsd: number;
};

export type OpenedStandingGrant = {
  packageId: string;
  tier: PaidMembershipTierId;
  kind: StandingPackageKind;
  openedAt: string;
  expiresAt: string;
};

export type ReferralEarnPot = {
  activatedReferrals: number;
  pendingReferrals: number;
  commissionUsd: number;
  activationCreditUsd: number;
  earnedUsd: number;
};

export type MembershipStanding = {
  currentTier: MembershipTierId;
  source: StandingSource;
  pot: ReferralEarnPot;
  nextTarget: PaidMembershipTierId | null;
  nextGoalUsd: number;
  remainingUsd: number;
  progress: number;
  sealedPackages: StandingPackage[];
  nextPackage: StandingPackage | null;
  activeGrants: OpenedStandingGrant[];
  activesNeededForNext: number;
};

const TIER_RANK: Record<MembershipTierId, number> = {
  free: 0,
  plus: 1,
  pro: 2,
  elite: 3,
};

const PAID_TIERS: PaidMembershipTierId[] = ["plus", "pro", "elite"];

const money = (value: number) => Math.max(0, Number((Number.isFinite(value) ? value : 0).toFixed(2)));

export function earnGoalUsd(tier: PaidMembershipTierId): number {
  return money(MEMBERSHIP_TIERS[tier].monthlyPriceUsd * MEMBERSHIP_EARN_MULTIPLIER);
}

export function resolveMembershipTier(tier?: string | null): MembershipTierId {
  const id = String(tier || "").toLowerCase();
  if (id === "plus" || id === "premium") return "plus";
  if (id === "pro" || id === "professional") return "pro";
  if (id === "elite" || id === "super" || id === "power" || id === "power_user") return "elite";
  return "free";
}

export function describeReferralEarnPot(input: {
  activatedReferrals?: number;
  pendingReferrals?: number;
  commissionUsd?: number;
} = {}): ReferralEarnPot {
  const activatedReferrals = Math.max(0, Math.floor(input.activatedReferrals ?? 0));
  const pendingReferrals = Math.max(0, Math.floor(input.pendingReferrals ?? 0));
  const commissionUsd = money(input.commissionUsd ?? 0);
  const activationCreditUsd = money(activatedReferrals * ACTIVE_REFERRAL_CREDIT_USD);

  return {
    activatedReferrals,
    pendingReferrals,
    commissionUsd,
    activationCreditUsd,
    earnedUsd: money(activationCreditUsd + commissionUsd),
  };
}

export function listEarnedPackages(earnedUsd: number, activatedReferrals: number): StandingPackage[] {
  const earned = money(earnedUsd);
  const actives = Math.max(0, Math.floor(activatedReferrals));
  const packages: StandingPackage[] = [];

  if (actives >= 1) {
    packages.push({
      id: "weekend_taste:plus",
      kind: "weekend_taste",
      tier: "plus",
      days: WEEKEND_TASTE_DAYS,
      earnRequiredUsd: ACTIVE_REFERRAL_CREDIT_USD,
    });
  }

  for (const tier of PAID_TIERS) {
    const goal = earnGoalUsd(tier);
    const half = money(goal / 2);
    if (earned >= half && earned < goal) {
      packages.push({
        id: `week_boost:${tier}`,
        kind: "week_boost",
        tier,
        days: WEEK_BOOST_DAYS,
        earnRequiredUsd: half,
      });
    }
    if (earned >= goal) {
      packages.push({
        id: `month_grant:${tier}`,
        kind: "month_grant",
        tier,
        days: EARNED_MONTH_DAYS,
        earnRequiredUsd: goal,
      });
    }
  }

  return packages;
}

export function highestMembershipTier(tiers: MembershipTierId[]): MembershipTierId {
  return tiers.reduce<MembershipTierId>((lead, tier) => (TIER_RANK[tier] > TIER_RANK[lead] ? tier : lead), "free");
}

export function nextPaidTierAbove(current: MembershipTierId): PaidMembershipTierId | null {
  if (current === "free") return "plus";
  if (current === "plus") return "pro";
  if (current === "pro") return "elite";
  return null;
}

export function grantExpiresAt(openedAt: string | Date, days: number): string {
  const start = new Date(openedAt);
  const expires = new Date(start.getTime() + Math.max(1, days) * 86_400_000);
  return expires.toISOString();
}

export function describeMembershipStanding(input: {
  paidTier?: string | null;
  paidActive?: boolean;
  activatedReferrals?: number;
  pendingReferrals?: number;
  commissionUsd?: number;
  openedGrants?: OpenedStandingGrant[];
  now?: string | Date;
} = {}): MembershipStanding {
  const pot = describeReferralEarnPot(input);
  const now = new Date(input.now ?? Date.now());
  const openedGrants = input.openedGrants ?? [];
  const activeGrants = openedGrants.filter((grant) => new Date(grant.expiresAt).getTime() > now.getTime());
  const paidTier = input.paidActive ? resolveMembershipTier(input.paidTier) : "free";
  const earnedTier = highestMembershipTier(activeGrants.map((grant) => grant.tier));
  const currentTier = highestMembershipTier([paidTier, earnedTier]);
  const source: StandingSource = TIER_RANK[paidTier] >= TIER_RANK[currentTier] && paidTier !== "free"
    ? "paid"
    : currentTier === "free"
      ? "free"
      : "earned";

  const earnedPackages = listEarnedPackages(pot.earnedUsd, pot.activatedReferrals);
  const openedIds = new Set(openedGrants.map((grant) => grant.packageId));
  const sealedPackages = earnedPackages
    .filter((pack) => !openedIds.has(pack.id))
    .sort((a, b) => b.earnRequiredUsd - a.earnRequiredUsd || b.days - a.days);
  const nextPackage = sealedPackages[0] ?? null;
  const nextTarget = nextPaidTierAbove(currentTier);
  const nextGoalUsd = nextTarget ? earnGoalUsd(nextTarget) : 0;
  const remainingUsd = nextTarget ? money(Math.max(0, nextGoalUsd - pot.earnedUsd)) : 0;

  return {
    currentTier,
    source,
    pot,
    nextTarget,
    nextGoalUsd,
    remainingUsd,
    progress: nextGoalUsd > 0 ? Math.min(100, (pot.earnedUsd / nextGoalUsd) * 100) : 100,
    sealedPackages,
    nextPackage,
    activeGrants,
    activesNeededForNext: nextTarget ? Math.max(0, Math.ceil(remainingUsd / ACTIVE_REFERRAL_CREDIT_USD)) : 0,
  };
}
