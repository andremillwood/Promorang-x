import { describe, expect, it } from "vitest";

import {
  PARTICIPANT_ECONOMY,
  PROMOCARD_DEFAULT_RECHARGE,
  PROMOCARD_POINTS_PER_KEY,
  PROMOCARD_STARTER_CYCLE_CREDIT,
  describePromoCardCredit,
  describePromoCardInstruments,
  describePromoCardLoop,
  pickPromoCardNextSuccess,
  pickPromoCardTonightPlace,
} from "../src/index";

describe("PromoCard credit and next-success loop", () => {
  it("keeps the starter dollar credit aligned with Points-to-Key conversion", () => {
    expect(PROMOCARD_STARTER_CYCLE_CREDIT).toBe(50);
    expect(PROMOCARD_DEFAULT_RECHARGE).toBe(15);
    expect(PROMOCARD_POINTS_PER_KEY).toBe(PARTICIPANT_ECONOMY.pointsPerPromoKey);
  });

  it("shows the cycle credit a person would receive before they have a live card", () => {
    const credit = describePromoCardCredit({ hasLiveCard: false });
    expect(credit.readyToSpend).toBe(50);
    expect(credit.cycleCredit).toBe(50);
    expect(credit.networkCapacity).toBe(500);
    expect(credit.stillRestorable).toBe(0);
    expect(credit.nextRechargeAmount).toBe(15);
    expect(pickPromoCardNextSuccess({ hasLiveCard: false }).id).toBe("claim_card");
  });

  it("keeps ready-to-spend dollars in front of Points and Keys", () => {
    const loop = describePromoCardLoop({
      hasLiveCard: true,
      monthlyLimit: 50,
      availableBalance: 45,
      spentThisCycle: 0,
      points: 120,
      promoKeys: 0,
    });

    expect(loop.credit.readyToSpend).toBe(45);
    expect(loop.credit.stillRestorable).toBe(5);
    expect(loop.credit.prospectiveAfterNextAction).toBe(50);
    expect(loop.instruments.pointsToNextKey).toBe(380);
    expect(loop.next.id).toBe("earn_points");
  });

  it("prompts a newly onboarded cardholder to show up and start the Points/Key loop", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      monthlyLimit: 50,
      availableBalance: 50,
      spentThisCycle: 0,
      points: 0,
      promoKeys: 0,
    });

    expect(next.id).toBe("show_up");
    expect(next.href).toBe("/discover");
    expect(next.creditHint).toBe(15);
  });

  it("asks the member to convert Points into a Key before hunting for more Points", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      availableBalance: 40,
      points: 500,
      promoKeys: 0,
    });

    expect(next.id).toBe("convert_key");
    expect(next.href).toBe("/wallet#convert-keys");
    expect(describePromoCardInstruments({ points: 500 }).canConvertKey).toBe(true);
  });

  it("uses a ready Key as the next real outcome", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      availableBalance: 30,
      points: 80,
      promoKeys: 2,
    });

    expect(next.id).toBe("use_key");
    expect(next.href).toBe("/discover");
    expect(next.keysHint).toBe(2);
  });

  it("restores spent credit only after the Points/Key path is already in motion", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      monthlyLimit: 50,
      availableBalance: 20,
      spentThisCycle: 30,
      points: 500,
      promoKeys: 1,
    });

    expect(next.id).toBe("use_key");

    const recharge = pickPromoCardNextSuccess({
      hasLiveCard: true,
      monthlyLimit: 50,
      availableBalance: 20,
      spentThisCycle: 30,
      points: 40,
      promoKeys: 0,
    });

    expect(recharge.id).toBe("recharge");
    expect(recharge.creditHint).toBe(30);
    expect(recharge.href).toBe("/wallet#recharge");
  });

  it("opens an earned standing package before hunting for another Moment", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      availableBalance: 45,
      points: 80,
      promoKeys: 1,
      hasSealedPackage: true,
    });

    expect(next.id).toBe("open_package");
    expect(next.href).toBe("/wallet#standing-package");
  });

  it("pushes pending referrals to activate so their earnings can unlock a tier", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      availableBalance: 50,
      points: 0,
      promoKeys: 0,
      pendingReferrals: 2,
    });

    expect(next.id).toBe("activate_referrals");
    expect(next.href).toBe("/referrals");
    expect(next.pointsHint).toBe(2);
  });

  it("names a live place when the card is ready and no Key is waiting", () => {
    const next = pickPromoCardNextSuccess({
      hasLiveCard: true,
      availableBalance: 50,
      points: 0,
      promoKeys: 0,
      tonightPlace: { name: "Kingston Dub Club", href: "/discover?place=venue-dubclub", allowance: 15 },
    });

    expect(next.id).toBe("use_here");
    expect(next.placeHint).toBe("Kingston Dub Club");
    expect(next.href).toContain("venue-dubclub");
    expect(next.creditHint).toBe(15);
  });
});

describe("tonight place pick", () => {
  it("prefers a venue in the member's city hub", () => {
    const place = pickPromoCardTonightPlace(
      [
        { name: "Montego Bay Yacht Club", href: "/discover?place=mb", allowance: 15, city: "Montego Bay" },
        { name: "Kingston Dub Club", href: "/discover?place=kd", allowance: 15, city: "Kingston" },
      ],
      "Kingston & St. Andrew",
    );

    expect(place?.name).toBe("Kingston Dub Club");
  });
});
