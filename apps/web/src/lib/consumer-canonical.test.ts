import { describe, expect, it } from "vitest";
import { CONSUMER_PRIMARY_NAV } from "./consumer-canonical";

describe("consumer primary nav", () => {
  it("keeps the signed-in Today surface first and PromoCard in the primary destinations", () => {
    expect(CONSUMER_PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Today",
      "Discover",
      "PromoCard",
      "Vault",
    ]);
    expect(CONSUMER_PRIMARY_NAV[0].href).toBe("/today");
    expect(CONSUMER_PRIMARY_NAV.find((item) => item.label === "PromoCard")?.href).toBe("/card");
  });
});
