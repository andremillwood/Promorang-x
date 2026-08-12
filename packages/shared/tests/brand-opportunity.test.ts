import { describe, expect, it } from "vitest";
import { rankBrandOpportunities } from "../src";

describe("brand opportunity ranking", () => {
  it("ranks explainable market and objective alignment above raw directories", () => {
    const ranked = rankBrandOpportunities({ industries: ["music"], geographies: ["Kingston Jamaica"], objectives: ["visits activation"] }, [
      { id: "generic", kind: "moment", title: "Generic Event", city: "Miami", momentum: 900, data: {} },
      { id: "fit", kind: "moment", title: "Kingston Music Night", city: "Kingston", country: "Jamaica", momentum: 120, starts_at: "2026-07-25", data: {} },
    ], new Date("2026-07-21"));
    expect(ranked[0].id).toBe("fit");
    expect(ranked[0].reasons).toEqual(expect.arrayContaining([expect.stringContaining("Kingston"), expect.stringContaining("music")]));
  });

  it("makes existing brand relationships visible in the explanation", () => {
    const [ranked] = rankBrandOpportunities({}, [{ id: "m1", kind: "moment", title: "Moment", already_connected: true, data: {} }]);
    expect(ranked.reasons[0]).toContain("brand graph");
  });
});
