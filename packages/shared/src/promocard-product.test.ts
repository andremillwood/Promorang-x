import { describe, expect, it } from "vitest";
import { DISCOVER_LENSES, PEOPLE_EXPERIENCE_CHROME, presentPromoCard } from "./promocard-product";

describe("people-experience chrome", () => {
  it("keeps one five-tab map", () => {
    expect(Object.keys(PEOPLE_EXPERIENCE_CHROME)).toEqual(["today", "people", "create", "earn", "card"]);
  });

  it("keeps Discover lenses as a shared browse vocabulary", () => {
    expect(DISCOVER_LENSES.map((item) => item.id)).toEqual(["eat", "go_out", "hang", "try"]);
  });
});

describe("presentPromoCard", () => {
  it("uses points when no live spendable card exists", () => {
    const view = presentPromoCard({ name: "Andi", points: 120, keys: 2, perks: [] });
    expect(view.holder).toBe("Andi");
    expect(view.available).toBe("120 pts");
    expect(view.limit).toBe("2 keys");
    expect(view.isLive).toBe(false);
    expect(view.useCode).toBe("PROMORANG-CARD");
  });

  it("prefers live promotional balance and a perk redemption code", () => {
    const view = presentPromoCard({
      name: "Andi",
      points: 10,
      card: { available_balance: 24, monthly_limit: 50, card_number: "PR-9911", tier: "verified" },
      perks: [{ id: "1", title: "Friday", redemptionCode: "PR-FRIDAY" }],
    });
    expect(view.available).toBe("$24.00");
    expect(view.limit).toBe("$50.00");
    expect(view.isLive).toBe(true);
    expect(view.useCode).toBe("PR-FRIDAY");
    expect(view.places).toBe("1 perk ready");
  });
});
