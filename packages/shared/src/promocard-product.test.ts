import { describe, expect, it } from "vitest";
import { DISCOVER_LENSES, PEOPLE_EXPERIENCE_CHROME, presentPromoCard } from "./promocard-product";

describe("people-experience chrome", () => {
  it("keeps one five-tab map", () => {
    expect(Object.keys(PEOPLE_EXPERIENCE_CHROME)).toEqual(["today", "people", "create", "earn", "card"]);
    expect(PEOPLE_EXPERIENCE_CHROME.card.purpose).not.toMatch(/recharge|spend/i);
  });

  it("keeps Discover lenses as a shared browse vocabulary", () => {
    expect(DISCOVER_LENSES.map((item) => item.id)).toEqual(["eat", "go_out", "hang", "try"]);
  });
});

describe("presentPromoCard", () => {
  it("does not print points or a fake serial when the card is empty", () => {
    const view = presentPromoCard({ name: "Andi", points: 120, keys: 2, perks: [] });
    expect(view.holder).toBe("Andi");
    expect(view.available).toMatch(/nothing to show/i);
    expect(view.isLive).toBe(false);
    expect(view.useCode).toBe("");
    expect(view.cardNumber).toBe("");
    expect(view.faceState).toBe("empty");
    expect(presentPromoCard().holder).toBe("Your card");
    expect(presentPromoCard().cardNumber).not.toMatch(/0842|Member/i);
    expect(view.available).not.toMatch(/\$|pts/i);
  });

  it("prefers a live perk credential over a ledger balance", () => {
    const view = presentPromoCard({
      name: "Andi",
      points: 10,
      card: { available_balance: 24, monthly_limit: 50, card_number: "PR-9911", tier: "verified" },
      perks: [{ id: "1", title: "Friday", redemptionCode: "PR-FRIDAY" }],
    });
    expect(view.available).toBe("Show this");
    expect(view.limit).toBe("Friday");
    expect(view.isLive).toBe(true);
    expect(view.useCode).toBe("PR-FRIDAY");
    expect(view.faceState).toBe("ready");
    expect(view.spendable).toBe(24);
    expect(view.face.canFlip).toBe(true);
  });

  it("reads a card payload's useThis and nearby instead of inventing a wallet face", () => {
    const view = presentPromoCard({
      name: "Maya",
      nearby: [{ title: "Friday tasting" }],
      nextBenefit: { title: "Friday tasting" },
    });
    expect(view.faceState).toBe("nearby");
    expect(view.available).toBe("Available nearby");
    expect(view.limit).toBe("Friday tasting");
  });
});
