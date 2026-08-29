import { describe, expect, it } from "vitest";
import { getPromoKeyAccessState } from "./promo-key-access";

describe("getPromoKeyAccessState", () => {
  it("asks for 500 more Points from an empty balance", () => {
    expect(getPromoKeyAccessState(0)).toMatchObject({
      readyCount: 0,
      pointsNeeded: 500,
      canConvert: false,
    });
  });

  it("caps ready Keys at the daily conversion limit", () => {
    expect(getPromoKeyAccessState(2500).readyCount).toBe(3);
  });

  it("marks a full Key as ready", () => {
    expect(getPromoKeyAccessState(500)).toMatchObject({
      readyCount: 1,
      pointsNeeded: 0,
      canConvert: true,
      progress: 100,
    });
  });
});
