import { afterEach, describe, expect, it } from "vitest";
import {
  MERCHANT_DEMAND_STORAGE_KEY,
  buildMerchantDemandOpening,
  merchantAuthHref,
  merchantDemandRoute,
  persistMerchantDemand,
  readMerchantDemand,
} from "./merchant-demand";

afterEach(() => {
  sessionStorage.clear();
});

describe("buildMerchantDemandOpening", () => {
  it("names the after-work food window and a concrete perk", () => {
    const opening = buildMerchantDemandOpening({
      business: "Food or drink",
      gap: "After work",
      strength: "The atmosphere",
      goal: "More first visits",
    });

    expect(opening.name).toBe("Your Demand Opening");
    expect(opening.window).toBe("After work");
    expect(opening.when).toMatch(/4–7pm/);
    expect(opening.who).toMatch(/table, a drink/);
    expect(opening.offer).toMatch(/welcome ritual/i);
    expect(opening.perkExample).toMatch(/house drink/);
    expect(opening.win).toMatch(/New faces/);
    expect(opening.moves[0]).toMatch(/After work/);
    expect(opening.cta).toBe("See how to capture this demand");
  });

  it("still returns a usable opening with empty answers", () => {
    const opening = buildMerchantDemandOpening({});
    expect(opening.when).toMatch(/quieter window/);
    expect(opening.offer).toMatch(/named reason/);
    expect(opening.perkExample).toMatch(/Welcome perk/);
  });
});

describe("merchantDemandRoute", () => {
  it("carries quiz answers onto the merchant page", () => {
    const href = merchantDemandRoute({
      business: "Food or drink",
      gap: "After work",
      strength: "The atmosphere",
      goal: "More first visits",
    });
    expect(href).toContain("/for-merchants?");
    expect(href).toContain("from=demand");
    expect(href).toContain("gap=After+work");
    expect(href).toContain("business=Food+or+drink");
  });
});

describe("persist and read merchant demand", () => {
  it("prefers URL params over session storage", () => {
    persistMerchantDemand({ gap: "Late evening" });
    const fromUrl = readMerchantDemand(new URLSearchParams("gap=After+work&business=Food+or+drink"));
    expect(fromUrl?.gap).toBe("After work");
    expect(fromUrl?.business).toBe("Food or drink");
  });

  it("falls back to session storage", () => {
    persistMerchantDemand({ gap: "Weekend off-peak", strength: "A signature product" });
    expect(sessionStorage.getItem(MERCHANT_DEMAND_STORAGE_KEY)).toContain("Weekend off-peak");
    const stored = readMerchantDemand(new URLSearchParams());
    expect(stored?.gap).toBe("Weekend off-peak");
    expect(stored?.strength).toBe("A signature product");
  });
});

describe("merchantAuthHref", () => {
  it("sends signed-out merchants through merchant signup", () => {
    expect(merchantAuthHref(null, "/stock")).toBe("/auth?mode=signup&role=merchant&next=%2Fstock");
  });

  it("sends signed-in merchants straight to the next tool", () => {
    expect(merchantAuthHref({ id: "m1" }, "/dashboard/venues/add")).toBe("/dashboard/venues/add");
  });
});
