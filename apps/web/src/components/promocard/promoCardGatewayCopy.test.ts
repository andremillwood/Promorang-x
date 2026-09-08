import { describe, expect, it } from "vitest";
import { promoCardGatewayCopy as copy } from "./promoCardGatewayCopy";

describe("promoCardGatewayCopy", () => {
  it("sells recognition and return instead of the redemption machine", () => {
    expect(copy.eyebrow).toBe("Passed along, not advertised");
    expect(copy.headlineLead).toBe("Use this.");
    expect(copy.headlineReturn).toBe("Come back.");
    expect(copy.body).toContain("last time felt like it counted");
    expect(copy.body).toContain("Someone you follow hands you a real perk");
    expect(copy.nearbyCta).toBe("Places that want you back");
    expect(copy.cardPromise).toBe("It counts when they see you");
    expect(copy.completion).toContain("Walking in does.");
    expect(copy.body.toLowerCase()).not.toContain("ambassador audience");
    expect(copy.body.toLowerCase()).not.toContain("merchant supplies");
  });

  it("keeps the PromoCard as the object people take", () => {
    expect(copy.primaryCta).toBe("Get my PromoCard");
    expect(copy.cardName).toBe("PromoCard");
    expect(copy.steps).toHaveLength(3);
  });
});
