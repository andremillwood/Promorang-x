import { describe, expect, it } from "vitest";
import { resolveMerchantNextMove, resolveMerchantOutcomeStages } from "./merchant-outcome";

describe("merchant outcome resolver", () => {
  it("starts with business setup before promotion work", () => {
    expect(resolveMerchantNextMove({ venueCount: 0, offerCount: 0, activeOfferCount: 0, totalRedemptions: 0 }).id).toBe("setup");
  });

  it("moves from launch to verification to repeat based on verified facts", () => {
    expect(resolveMerchantNextMove({ venueCount: 1, offerCount: 0, activeOfferCount: 0, totalRedemptions: 0 }).id).toBe("launch");
    expect(resolveMerchantNextMove({ venueCount: 1, offerCount: 1, activeOfferCount: 1, totalRedemptions: 0 }).id).toBe("verify");
    expect(resolveMerchantNextMove({ venueCount: 1, offerCount: 1, activeOfferCount: 1, totalRedemptions: 3 }).id).toBe("repeat");
  });

  it("does not mark repeat customer or positive economics complete from redemption counts alone", () => {
    const stages = resolveMerchantOutcomeStages({ venueCount: 1, offerCount: 2, activeOfferCount: 1, totalRedemptions: 8 });
    expect(stages.find((stage) => stage.id === "value")?.status).toBe("current");
    expect(stages.find((stage) => stage.id === "repeat")?.status).toBe("upcoming");
    expect(stages.find((stage) => stage.id === "economics")?.status).toBe("upcoming");
  });
});
