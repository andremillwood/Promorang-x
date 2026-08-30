import { describe, expect, it } from "vitest";

import {
  ACTIVE_REFERRAL_CREDIT_USD,
  MEMBERSHIP_EARN_MULTIPLIER,
  MEMBERSHIP_TIERS,
  describeMembershipStanding,
  describeReferralEarnPot,
  earnGoalUsd,
  grantExpiresAt,
  listEarnedPackages,
  nextPaidTierAbove,
} from "../src/index";

describe("earned membership standing", () => {
  it("makes people earn double the cash price before a paid month unlocks", () => {
    expect(MEMBERSHIP_EARN_MULTIPLIER).toBe(2);
    expect(earnGoalUsd("plus")).toBe(19.98);
    expect(earnGoalUsd("pro")).toBe(49.98);
    expect(earnGoalUsd("elite")).toBe(99.98);
    expect(ACTIVE_REFERRAL_CREDIT_USD).toBe(MEMBERSHIP_TIERS.plus.monthlyPriceUsd);
  });

  it("counts activated referrals and their commissions toward the unlock pot", () => {
    const pot = describeReferralEarnPot({
      activatedReferrals: 2,
      pendingReferrals: 3,
      commissionUsd: 5.01,
    });

    expect(pot.activationCreditUsd).toBe(19.98);
    expect(pot.earnedUsd).toBe(24.99);
    expect(pot.pendingReferrals).toBe(3);
  });

  it("opens a weekend Plus taste after one activated referral, and a Plus month after 2x", () => {
    expect(listEarnedPackages(9.99, 1).map((pack) => pack.id)).toEqual([
      "weekend_taste:plus",
      "week_boost:plus",
    ]);
    expect(listEarnedPackages(19.98, 2).map((pack) => pack.id)).toEqual([
      "weekend_taste:plus",
      "month_grant:plus",
    ]);
    expect(listEarnedPackages(99.98, 4).some((pack) => pack.id === "month_grant:elite")).toBe(true);
  });

  it("keeps Free until a sealed month is opened, then holds the grant for 30 days", () => {
    const beforeOpen = describeMembershipStanding({
      activatedReferrals: 2,
      commissionUsd: 0,
    });
    expect(beforeOpen.currentTier).toBe("free");
    expect(beforeOpen.nextPackage?.id).toBe("month_grant:plus");
    expect(beforeOpen.activesNeededForNext).toBe(0);

    const openedAt = "2026-08-01T00:00:00.000Z";
    const afterOpen = describeMembershipStanding({
      activatedReferrals: 2,
      openedGrants: [{
        packageId: "month_grant:plus",
        tier: "plus",
        kind: "month_grant",
        openedAt,
        expiresAt: grantExpiresAt(openedAt, 30),
      }],
      now: "2026-08-15T00:00:00.000Z",
    });
    expect(afterOpen.currentTier).toBe("plus");
    expect(afterOpen.source).toBe("earned");
    expect(afterOpen.nextTarget).toBe("pro");
    expect(afterOpen.sealedPackages.some((pack) => pack.id === "month_grant:plus")).toBe(false);
  });

  it("lets a paid subscription sit above an earned weekend taste", () => {
    const standing = describeMembershipStanding({
      paidTier: "pro",
      paidActive: true,
      activatedReferrals: 1,
      openedGrants: [{
        packageId: "weekend_taste:plus",
        tier: "plus",
        kind: "weekend_taste",
        openedAt: "2026-08-01T00:00:00.000Z",
        expiresAt: "2026-09-01T00:00:00.000Z",
      }],
    });

    expect(standing.currentTier).toBe("pro");
    expect(standing.source).toBe("paid");
    expect(nextPaidTierAbove("pro")).toBe("elite");
  });
});
