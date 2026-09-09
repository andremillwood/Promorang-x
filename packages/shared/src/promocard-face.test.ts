import { describe, expect, it } from "vitest";
import { resolvePromoCardFace } from "./promocard-face";

describe("resolvePromoCardFace", () => {
  it("keeps an empty city honest instead of looking like a funded wallet", () => {
    const face = resolvePromoCardFace({ holder: "Maya" });
    expect(face.state).toBe("empty");
    expect(face.headline).toMatch(/nothing on this card/i);
    expect(face.canFlip).toBe(false);
    expect(face.credential).toBeNull();
    expect(face.footerCue).toMatch(/your PromoCard/i);
  });

  it("puts a live issuer and code on a ready face", () => {
    const face = resolvePromoCardFace({
      holder: "Maya",
      useThis: {
        title: "Coffee on us",
        issuer: { name: "Sea Deck" },
        redemptionCode: "COFFEE-TEST",
      },
      sceneMark: "Kingston After Dark",
      crewMark: "Barbican",
    });
    expect(face.state).toBe("ready");
    expect(face.issuer).toBe("Sea Deck");
    expect(face.issuerInitial).toBe("S");
    expect(face.credential).toBe("COFFEE-TEST");
    expect(face.canFlip).toBe(true);
    expect(face.headline).toBe("Show this");
    expect(face.action).toMatch(/merchant/i);
    expect(face.sceneMark).toBe("Kingston After Dark");
  });

  it("shows a dated Return as eligibility, not a refill", () => {
    const face = resolvePromoCardFace({
      latestReturn: "You showed up at AftrHrs",
      latestReturnAt: "2026-09-08",
    });
    expect(face.state).toBe("returned");
    expect(face.action).toMatch(/not a refill/i);
    expect(face.returnStamp).toMatch(/AftrHrs/);
  });

  it("punches a recorded use and fades an expired perk", () => {
    expect(resolvePromoCardFace({ recordedUse: true, useThis: { title: "Coffee on us", issuer: { name: "Sea Deck" } } }).state).toBe("used");
    expect(resolvePromoCardFace({ expiredOnly: true, useThis: { title: "Past offer" } }).state).toBe("expired");
  });

  it("prefers a showable code over nearby inventory", () => {
    const face = resolvePromoCardFace({
      nearbyCount: 3,
      useThis: { title: "Coffee on us", redemptionCode: "LIVE" },
    });
    expect(face.state).toBe("ready");
  });

  it("speaks shipping and credit instead of a door scan", () => {
    const ship = resolvePromoCardFace({
      useThis: {
        title: "Sample pack",
        issuer: { name: "Island Signal" },
        fulfillmentType: "shipping",
        fulfillmentData: { shipping_stage: "shipped" },
      },
    });
    expect(ship.state).toBe("ready");
    expect(ship.headline).toBe("On the way");
    expect(ship.canFlip).toBe(false);

    const credit = resolvePromoCardFace({
      useThis: { title: "50 Gems", issuer: { name: "Promorang" }, fulfillmentType: "automatic" },
    });
    expect(credit.headline).toBe("Credited");
    expect(credit.action).toMatch(/on the card/i);
  });
});
