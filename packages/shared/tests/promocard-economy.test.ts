import { describe, expect, it } from "vitest";

import {
  PROMOCARD_FIRST_READY_CREDIT,
  PROMOCARD_NETWORK_CAPACITY,
  PROMOCARD_TYPICAL_MIN_BASKET,
  PROMOCARD_TYPICAL_VISIT_ALLOWANCE,
  describePromoCardCredit,
  describePromoCardIssuance,
  describePromoCardSpendReceipt,
  pickPromoCardNextSuccess,
  settlePromoCardVisit,
} from "../src/index";

describe("PromoCard issuance and partner-funded capacity", () => {
  it("gives every account the card, not a Promorang-funded cash grant", () => {
    const issuance = describePromoCardIssuance();
    expect(issuance.everyoneGetsTheCard).toBe(true);
    expect(issuance.creditRequiresPartnerAuthorization).toBe(true);
    expect(issuance.isLoan).toBe(false);
    expect(issuance.isCashBalance).toBe(false);
    expect(issuance.fundedBy).toBe("partners");
    expect(issuance.networkCapacity).toBe(500);
    expect(issuance.firstReadyCredit).toBe(50);
    expect(issuance.typicalVisitAllowance).toBe(15);
  });

  it("makes $500 the attractive partner capacity and $50 the first ready slice", () => {
    expect(PROMOCARD_NETWORK_CAPACITY).toBe(500);
    expect(PROMOCARD_FIRST_READY_CREDIT).toBe(50);
    expect(PROMOCARD_TYPICAL_VISIT_ALLOWANCE).toBe(15);
    expect(PROMOCARD_TYPICAL_MIN_BASKET).toBe(35);

    const beforeCard = describePromoCardCredit({ hasLiveCard: false });
    expect(beforeCard.networkCapacity).toBe(500);
    expect(beforeCard.cycleCredit).toBe(50);
    expect(beforeCard.readyToSpend).toBe(50);
    expect(pickPromoCardNextSuccess({ hasLiveCard: false }).creditHint).toBe(500);
  });

  it("applies only the merchant-authorized slice, even if the card capacity is $500", () => {
    const visit = settlePromoCardVisit({
      basket: 40,
      cardReady: 500,
      merchantAllowance: 15,
      minBasket: 35,
    });

    expect(visit.eligible).toBe(true);
    expect(visit.promoApplied).toBe(15);
    expect(visit.cashRemainder).toBe(25);
    expect(visit.platformFee).toBe(1.25);
    expect(visit.merchantCash).toBe(23.75);
    expect(visit.memberSavings).toBe(15);
  });

  it("stays profit-positive for the partner because cash still hits the till", () => {
    const visit = settlePromoCardVisit({
      basket: 40,
      cardReady: 50,
      merchantAllowance: 15,
    });

    expect(visit.cashRemainder).toBeGreaterThan(visit.promoApplied);
    expect(visit.merchantCash).toBeGreaterThan(0);
    expect(visit.platformFee).toBeGreaterThan(0);
    expect(visit.merchantCash + visit.platformFee + visit.promoApplied).toBe(40);
  });

  it("does not move promotional dollars when the basket misses partner terms", () => {
    const tooSmall = settlePromoCardVisit({
      basket: 20,
      cardReady: 50,
      merchantAllowance: 15,
      minBasket: 35,
    });
    expect(tooSmall.eligible).toBe(false);
    expect(tooSmall.promoApplied).toBe(0);
    expect(tooSmall.cashRemainder).toBe(20);

    const noPool = settlePromoCardVisit({
      basket: 40,
      cardReady: 50,
      merchantAllowance: 15,
      poolActive: false,
    });
    expect(noPool.eligible).toBe(false);
    expect(noPool.reason).toBe("inactive_pool");
  });

  it("turns a settled visit into a holdable spend receipt", () => {
    const settlement = settlePromoCardVisit({
      basket: 40,
      cardReady: 50,
      merchantAllowance: 15,
    });
    const receipt = describePromoCardSpendReceipt({
      settlement,
      placeName: "Kingston Dub Club",
      basket: 40,
    });

    expect(receipt.headline).toBe("The bill split");
    expect(receipt.placeName).toBe("Kingston Dub Club");
    expect(receipt.promoApplied).toBe(15);
    expect(receipt.cashRemainder).toBe(25);
    expect(receipt.youSaved).toBe(15);
    expect(receipt.nextHint).toMatch(/restore/i);
  });
});
