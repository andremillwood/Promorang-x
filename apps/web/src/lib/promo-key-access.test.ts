import { describe, expect, it } from "vitest";
import { getPromoKeyAccessState } from "./promo-key-access";

describe("getPromoKeyAccessState", () => {
  it("treats a full stack of Points as ready for one PromoKey", () => {
    expect(getPromoKeyAccessState(500)).toEqual({
      pointsPerKey: 500,
      readyKeys: 1,
      canGetKey: true,
      pointsNeeded: 0,
      progress: 100,
    });
  });

  it("shows how many Points are still required", () => {
    expect(getPromoKeyAccessState(180)).toMatchObject({
      readyKeys: 0,
      canGetKey: false,
      pointsNeeded: 320,
      progress: 36,
    });
  });

  it("caps ready keys at the daily conversion limit", () => {
    expect(getPromoKeyAccessState(4000).readyKeys).toBe(3);
  });

  it("treats empty or invalid balances as a full gap", () => {
    expect(getPromoKeyAccessState(0).pointsNeeded).toBe(500);
    expect(getPromoKeyAccessState(Number.NaN).pointsNeeded).toBe(500);
  });
});
