import { describe, expect, it } from "vitest";
import { PUBLIC_PROMOCARD_PATH, promoCardActionHref } from "./public-path";

describe("public PromoCard path", () => {
  it("exposes a shareable public destination", () => {
    expect(PUBLIC_PROMOCARD_PATH).toBe("/promocard");
  });

  it("sends guests to sign up before Wallet, and members to Wallet", () => {
    expect(promoCardActionHref(false)).toBe("/auth?mode=signup&next=/wallet");
    expect(promoCardActionHref(true)).toBe("/wallet");
  });
});
