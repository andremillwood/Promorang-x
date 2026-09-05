import { describe, expect, it } from "vitest";
import { CONSUMER_PRIMARY_NAV } from "./consumer-canonical";

describe("consumer primary nav", () => {
  it("keeps Home on the public homepage and PromoCard in the first five destinations", () => {
    expect(CONSUMER_PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Home",
      "Discover",
      "PromoCard",
      "Rewards",
      "You",
    ]);
    expect(CONSUMER_PRIMARY_NAV[0].href).toBe("/");
    expect(CONSUMER_PRIMARY_NAV.find((item) => item.label === "PromoCard")?.href).toBe("/card");
  });
});
