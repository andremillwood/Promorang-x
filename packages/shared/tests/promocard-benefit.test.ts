import { describe, expect, it } from "vitest";
import {
  canUseBenefit,
  contributorRewardAmount,
  fulfillmentFromStatus,
  isCompleteBenefit,
  loopProgress,
  primaryCardAction,
  remainingQuantity,
  selectNextBenefit,
  selectUseThis,
  summarizeRepeatUse,
} from "../src/promocard-benefit";

const usable = {
  id: "iss-1",
  offerId: "offer-1",
  issuanceId: "iss-1",
  dropId: "drop-1",
  title: "Friday tasting",
  detail: "One complimentary tasting",
  issuer: { id: "merchant-1", type: "merchant", name: "Yardbird" },
  eligibility: { who: "Claimed members", perUserLimit: 1, startsAt: null, endsAt: null, remaining: 8 },
  availableQuantity: 8,
  budget: 400,
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  fulfillmentState: "claimed" as const,
  fulfillmentType: "merchant_validation",
  redemption: { recorded: false, code: "PR-ABC123", redeemedAt: null, redeemedBy: null },
  sharedBy: { id: "amb-1", name: "Keisha" },
  href: "/card",
};

describe("PromoCard benefit source of truth", () => {
  it("requires issuer, eligibility, quantity, expiry, fulfillment and redemption", () => {
    expect(isCompleteBenefit(usable)).toBe(true);
    expect(isCompleteBenefit({ ...usable, issuer: { id: null, type: "merchant", name: "" } })).toBe(false);
    expect(isCompleteBenefit({ ...usable, redemption: undefined })).toBe(false);
  });

  it("does not treat a claimed perk as used until a merchant records redemption", () => {
    expect(canUseBenefit(usable)).toBe(true);
    expect(canUseBenefit({ ...usable, redemption: { ...usable.redemption, recorded: true }, fulfillmentState: "redeemed" })).toBe(false);
    expect(canUseBenefit({ ...usable, fulfillmentType: "shipping" })).toBe(false);
    expect(canUseBenefit({ ...usable, fulfillmentState: "issued" })).toBe(false);
    expect(fulfillmentFromStatus("claimed")).toBe("claimed");
    expect(fulfillmentFromStatus("redeemed")).toBe("redeemed");
    expect(fulfillmentFromStatus("claimed", "invalid")).toBe("expired");
  });

  it("leads the card with use, nearby, then the next benefit", () => {
    const nearby = [{ ...usable, id: "offer-2", offerId: "offer-2", fulfillmentState: "available" as const }];
    expect(selectUseThis([usable])).toEqual(usable);
    expect(selectNextBenefit(nearby, usable)?.offerId).toBe("offer-2");
    expect(primaryCardAction({ useThis: usable, nearby })).toBe("use_this");
    expect(primaryCardAction({ useThis: null, nextBenefit: nearby[0] })).toBe("get_next_benefit");
    expect(primaryCardAction({ useThis: null, nearby, nextBenefit: null })).toBe("available_nearby");
  });

  it("tracks first redemption, second use, referred redeemers and contributor rewards", () => {
    const proof = summarizeRepeatUse([
      { userId: "a", merchantId: "m1", referrerId: "amb-1", contributorId: "amb-1", contributorPoints: 25 },
      { userId: "a", merchantId: "m1", referrerId: "amb-1", contributorId: "amb-1", contributorPoints: 25 },
      { userId: "b", merchantId: "m2" },
    ]);
    expect(proof.firstRedemptions).toBe(1);
    expect(proof.secondUses).toBe(1);
    expect(proof.referredUsersWhoRedeem).toBe(1);
    expect(proof.merchantOutcomes).toMatchObject({
      participatingBusinesses: 2,
      verifiedRedemptions: 3,
      uniqueCustomers: 2,
    });
    expect(proof.contributorRewards).toEqual({ rewardedContributors: 1, pointsAwarded: 50 });
  });

  it("awards a real contributor amount from the issued offer, not a simulated recharge", () => {
    expect(contributorRewardAmount({ value_amount: 12 })).toBe(12);
    expect(contributorRewardAmount({ metadata: { contributor_reward_points: 40 } })).toBe(40);
    expect(contributorRewardAmount({})).toBe(25);
    expect(remainingQuantity(10, 3, 2)).toBe(5);
  });

  it("closes the distribution loop only after validation, attribution and a return reason", () => {
    const loop = loopProgress({
      supplied: true,
      shared: true,
      claimed: true,
      validated: true,
      attributed: true,
      returnReason: true,
    });
    expect(loop.current).toBe("return_reason");
    expect(loop.done.merchant_validated).toBe(true);
    expect(loopProgress({ supplied: true, shared: true }).current).toBe("member_claimed");
  });
});
