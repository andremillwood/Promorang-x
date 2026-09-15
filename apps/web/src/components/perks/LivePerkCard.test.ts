import { describe, expect, it } from "vitest";
import { livePerkHref, type LivePerkLike } from "./LivePerkCard";

const base: LivePerkLike = {
  id: "perk-1",
  title: "Dinner benefit",
  offerId: "offer-1",
};

describe("livePerkHref", () => {
  it("returns owned/used benefits to PromoCard", () => {
    expect(livePerkHref({ ...base, redemption: { recorded: true } })).toBe("/card");
    expect(livePerkHref({ ...base, redemption: { code: "ABC", recorded: false } })).toBe("/card");
    expect(livePerkHref({ ...base, fulfillmentState: "redeemed" })).toBe("/card");
  });

  it("preserves explicit and drop destinations", () => {
    expect(livePerkHref({ ...base, href: "/moments/special" })).toBe("/moments/special");
    expect(livePerkHref({ ...base, offerId: null, dropSlug: "dinner-drop" })).toBe("/drop/dinner-drop");
  });

  it("uses Give for creator share intent when an offer exists", () => {
    expect(livePerkHref(base, "share")).toBe("/give?offer=offer-1");
  });

  it("falls back to the Discover perks surface for claim intent", () => {
    expect(livePerkHref(base)).toBe("/discover?tab=perks");
  });
});
