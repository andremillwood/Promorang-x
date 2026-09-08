import { describe, expect, it } from "vitest";
import { promoCardGatewayCopy as copy } from "./promoCardGatewayCopy";

describe("promoCardGatewayCopy", () => {
  it("answers where the card is used before it sells the return", () => {
    expect(copy.eyebrow).toBe("Not in the app. At the counter.");
    expect(copy.headlineLead).toBe("Use this.");
    expect(copy.headlineWhere).toBe("At the");
    expect(copy.headlineReturn).toBe("counter.");
    expect(copy.body).toContain("real place nearby");
    expect(copy.body).toContain("That’s why you come back.");
    expect(copy.nearbyCta).toBe("See the places");
    expect(copy.faceAction).toBe("At the counter");
    expect(copy.placesLabel).toBe("Tonight nearby");
    expect(copy.completion).toContain("The counter does.");
    expect(copy.body.toLowerCase()).not.toContain("ambassador audience");
    expect(copy.body.toLowerCase()).not.toContain("merchant supplies");
  });

  it("keeps the PromoCard as the object people take", () => {
    expect(copy.primaryCta).toBe("Get my PromoCard");
    expect(copy.cardName).toBe("PromoCard");
    expect(copy.steps[0]?.title).toBe("At the counter");
    expect(copy.steps).toHaveLength(3);
  });
});
