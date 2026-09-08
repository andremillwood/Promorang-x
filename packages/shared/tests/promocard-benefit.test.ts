import { describe, expect, it } from "vitest";
import {
  benefitCtaLabel,
  benefitExpiryLabel,
  benefitScarcityLabel,
  canUseBenefit,
  classifyBenefitType,
  contributorRewardAmount,
  emptyPromoBenefitPresentation,
  fulfillmentFromStatus,
  isCompleteBenefit,
  isLivePromoBenefit,
  loopProgress,
  presentBenefitHeadline,
  presentPromoBenefit,
  primaryCardAction,
  remainingQuantity,
  selectFeaturedBenefit,
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

describe("PromoCard benefit presentation", () => {
  const nearby = {
    ...usable,
    fulfillmentState: "available" as const,
    redemption: { recorded: false, code: null, redeemedAt: null, redeemedBy: null },
  };

  it("derives concrete headlines for money, percent, free, access and bundle offers", () => {
    expect(presentBenefitHeadline({ title: "Sea Deck weekend", valueAmount: 50, rewardType: "coupon" })).toBe("$50 OFF");
    expect(presentBenefitHeadline({ title: "Barbican dinner", valueAmount: 500, rewardType: "voucher" })).toBe("$500 OFF");
    expect(presentBenefitHeadline({ title: "10% off mains", valueAmount: 10, rewardType: "coupon" })).toBe("10% OFF");
    expect(presentBenefitHeadline({ title: "Free Wings", detail: "with any main meal" })).toBe("FREE WINGS");
    expect(presentBenefitHeadline({ title: "Free Entry", rewardType: "experience" })).toBe("FREE ENTRY");
    expect(presentBenefitHeadline({ title: "2-for-1 rum special" })).toBe("2-FOR-1 RUM SPECIAL");
    expect(presentBenefitHeadline({ title: "Complimentary drink" })).toBe("COMPLIMENTARY DRINK");
    expect(presentBenefitHeadline({ title: "VIP Access" })).toBe("VIP ACCESS");
    expect(presentBenefitHeadline({ title: "Early access" })).toBe("EARLY ACCESS");
    expect(classifyBenefitType({ title: "10% off mains", valueAmount: 10 })).toBe("percentage_discount");
    expect(classifyBenefitType({ title: "VIP Access" })).toBe("access");
    expect(classifyBenefitType({ title: "Free Wings" })).toBe("free_item");
  });

  it("does not invent a dollar amount when the offer has no value", () => {
    expect(presentBenefitHeadline({ title: "Friday tasting" })).toBe("FRIDAY TASTING");
    expect(presentBenefitHeadline({ title: "" })).toBe("A LIVE BENEFIT");
  });

  it("shows real scarcity and omits it when inventory or expiry is missing", () => {
    expect(benefitScarcityLabel({ availableQuantity: 23, eligibility: usable.eligibility, expiresAt: null })).toBe("23 remaining");
    expect(benefitScarcityLabel({ availableQuantity: 8, eligibility: usable.eligibility, expiresAt: null })).toBe("Only 8 left");
    expect(benefitScarcityLabel({ availableQuantity: null, eligibility: { ...usable.eligibility, remaining: null }, expiresAt: null })).toBeUndefined();
    const tonight = new Date();
    tonight.setHours(22, 0, 0, 0);
    expect(benefitExpiryLabel(tonight.toISOString(), tonight.getTime() - 60_000)).toBe("Ends tonight");
  });

  it("uses contextual customer CTAs instead of Use this", () => {
    expect(benefitCtaLabel({ ...nearby, title: "$500 OFF", valueAmount: 500 })).toBe("Claim $500 Off");
    expect(benefitCtaLabel({ ...nearby, title: "Free Wings" })).toBe("Get Free Wings");
    expect(benefitCtaLabel({ ...nearby, title: "Free Entry" })).toBe("Unlock Entry");
    expect(benefitCtaLabel({ ...nearby, title: "VIP Access" })).toBe("Unlock Access");
    expect(benefitCtaLabel({ ...nearby, title: "2-for-1 rum special" })).toBe("Unlock Offer");
    expect(benefitCtaLabel({ ...nearby, title: "$500 OFF", valueAmount: 500 }, { unlock: true })).toBe("Unlock this");
    expect(benefitCtaLabel(usable, { claimed: true })).toBe("Redeem Benefit");
  });

  it("features a claimed usable benefit, then the strongest live nearby offer", () => {
    const weak = { ...nearby, id: "weak", title: "Open table", availableQuantity: 40, valueAmount: null };
    const strong = { ...nearby, id: "strong", title: "$500 OFF", valueAmount: 500, availableQuantity: 12, locationLabel: "Barbican" };
    expect(selectFeaturedBenefit({ useThis: usable, nearby: [weak, strong] })?.id).toBe("iss-1");
    expect(selectFeaturedBenefit({ nearby: [weak, strong] })?.id).toBe("strong");
    expect(selectFeaturedBenefit({ nearby: [{ ...strong, availableQuantity: 0, fulfillmentState: "exhausted" }] })).toBeNull();
    expect(isLivePromoBenefit({ ...strong, availableQuantity: 0 })).toBe(false);
  });

  it("keeps the empty state honest", () => {
    const empty = emptyPromoBenefitPresentation({ authenticated: false });
    expect(empty.headline).toBe("NEW BENEFITS ARE LANDING");
    expect(empty.ctaLabel).toBe("Get My PromoCard");
    expect(empty.empty).toBe(true);
    expect(presentPromoBenefit(null)).toBeNull();
    expect(presentPromoBenefit({ ...nearby, title: "$50 OFF", valueAmount: 50, locationLabel: "Kingston" })?.headline).toBe("$50 OFF");
  });
});
