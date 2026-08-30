import { describe, expect, it } from "vitest";
import {
  describePromoCardValue,
  FALLBACK_USD_TO_LOCAL,
  formatGemsCredit,
  gemsToLocal,
  gemsToUsd,
  resolveFxQuote,
} from "./promocard-economy";

describe("PromoCard promotional credit", () => {
  it("pegs 1 Gem to 1 USD of promotional value", () => {
    expect(gemsToUsd(45)).toBe(45);
    expect(formatGemsCredit(45)).toBe("45 Gems");
  });

  it("localizes Jamaica as JMD from the USD peg", () => {
    const jmd = resolveFxQuote("JMD");
    expect(jmd.quote).toBe("JMD");
    expect(jmd.localPerUsd).toBe(FALLBACK_USD_TO_LOCAL.JMD);
    expect(gemsToLocal(1, jmd)).toBe(157.5);
    expect(describePromoCardValue(10, jmd).localLabel).toMatch(/JMD|\$/);
  });

  it("prefers a live FX quote when it is for the same currency", () => {
    const live = resolveFxQuote("JMD", { quote: "JMD", localPerUsd: 160.2, asOf: "2026-08-30", source: "live" });
    expect(live.source).toBe("live");
    expect(gemsToLocal(2, live)).toBeCloseTo(320.4);
  });

  it("does not treat PromoCard value as cash", () => {
    const value = describePromoCardValue(20, resolveFxQuote("JMD"));
    expect(value.disclaimer.toLowerCase()).toContain("not cash");
    expect(value.unit).toBe("GEMS");
  });
});
