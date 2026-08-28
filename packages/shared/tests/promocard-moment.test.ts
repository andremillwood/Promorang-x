import { describe, expect, it } from "vitest";

import {
  getPromoCardMomentImpacts,
  PROMOCARD_MOMENT_IMPACTS,
  PROMOCARD_MOMENT_LOOP,
} from "../src/promocard-moment";

describe("PromoCard Moment value contract", () => {
  it("changes the Moment before, during and after participation", () => {
    expect(PROMOCARD_MOMENT_LOOP.map((step) => step.stage)).toEqual(["before", "during", "after"]);
    for (const step of PROMOCARD_MOMENT_LOOP) expect(step.meaning.length).toBeGreaterThan(60);
  });

  it("defines a distinct outcome and measurement signal for every stakeholder", () => {
    expect(Object.keys(PROMOCARD_MOMENT_IMPACTS)).toEqual([
      "participant",
      "host",
      "creator",
      "merchant",
      "venue",
      "brand",
      "community",
    ]);
    for (const impact of Object.values(PROMOCARD_MOMENT_IMPACTS)) {
      expect(impact.outcome.length).toBeGreaterThan(40);
      expect(impact.signal.split(",").length).toBeGreaterThanOrEqual(4);
    }
  });

  it("puts the current stakeholder first without hiding the shared system", () => {
    const impacts = getPromoCardMomentImpacts("merchant");
    expect(impacts[0].role).toBe("merchant");
    expect(impacts).toHaveLength(7);
  });
});
