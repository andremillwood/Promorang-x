import { describe, expect, it } from "vitest";

import {
  FALLBACK_PROMOCARD_OFFER,
  formatPromoCardSerial,
  formatPromoCardSpend,
  offerFromOpportunity,
  resolvePromoCardSurface,
} from "../src/promocard-present";

describe("PromoCard present-or-offer", () => {
  it("never shows a card face for an honest empty wallet", () => {
    const surface = resolvePromoCardSurface({
      holder: "Andre",
      spendable: 0,
      perks: [],
    });
    expect(surface.mode).toBe("offer");
    if (surface.mode !== "offer") throw new Error("expected offer");
    expect(surface.offer).toEqual(FALLBACK_PROMOCARD_OFFER);
    expect(surface.presentLabel).toMatch(/lands on your card/i);
  });

  it("presents dollars when there is spendable value", () => {
    const surface = resolvePromoCardSurface({
      holder: "Andre Millwood",
      spendable: 16,
      limit: 40,
      cardNumber: "•••• •••• •••• 8842",
      currency: "USD",
      perks: [],
    });
    expect(surface.mode).toBe("present");
    if (surface.mode !== "present") throw new Error("expected present");
    expect(surface.showSpendFace).toBe(true);
    expect(surface.available).toBe("$16.00");
    expect(surface.limit).toBe("$40.00");
    expect(surface.caption).toBe("Available to spend");
    expect(surface.serial).toBe("PR · 8842");
    expect(surface.presentLabel).toBe("Show this");
  });

  it("presents a claimed perk without printing a fake $0.00", () => {
    const surface = resolvePromoCardSurface({
      spendable: 0,
      perks: [{ id: "perk-1", title: "2-for-1 Friday", detail: "Kingston" }],
    });
    expect(surface.mode).toBe("present");
    if (surface.mode !== "present") throw new Error("expected present");
    expect(surface.showSpendFace).toBe(false);
    expect(surface.available).toBe("2-for-1 Friday");
    expect(surface.caption).toBe("Ready to show");
    expect(surface.limit).toBe("");
  });

  it("uses tonight's live offer instead of a fallback when the card is empty", () => {
    const surface = resolvePromoCardSurface({
      spendable: 0,
      nextOffer: {
        title: "Kinfolk brunch drop",
        detail: "Unlock $20 off weekend brunch.",
        href: "/discover",
        stub: "Go",
        place: "Kingston",
      },
    });
    expect(surface.mode).toBe("offer");
    if (surface.mode !== "offer") throw new Error("expected offer");
    expect(surface.offer.title).toBe("Kinfolk brunch drop");
    expect(surface.offer.detail).toContain("brunch");
  });

  it("formats Kingston money as J$ and keeps a readable serial", () => {
    expect(formatPromoCardSpend(24.4, "JMD")).toBe("J$24");
    expect(formatPromoCardSpend(8, "USD")).toBe("$8.00");
    expect(formatPromoCardSerial("PROMO-349E-4F8F")).toBe("PR · 4F8F");
    expect(formatPromoCardSerial("")).toBe("PR · 0842");
  });

  it("turns an opportunity into a ticket, not a second identity card", () => {
    expect(offerFromOpportunity({
      title: "Check in at Devon House",
      peopleGet: "A tasting lands on your PromoCard.",
      sourceKind: "offer",
    })).toMatchObject({
      title: "Check in at Devon House",
      href: "/discover",
      stub: "NOW",
    });
    expect(offerFromOpportunity(null).title).toBe(FALLBACK_PROMOCARD_OFFER.title);
  });

  it("treats points as invisible to the face", () => {
    const surface = resolvePromoCardSurface({
      spendable: 0,
      perks: [],
    });
    expect(JSON.stringify(surface)).not.toMatch(/pts|PromoKey|Gem/i);
  });
});
