import { describe, expect, it } from "vitest";
import {
  isPreviewPartnerListing,
  listingMatchesShopLens,
  partnerOfferTerms,
  shopIndexHref,
  shopListingHref,
  shopListingsForSurface,
  shopPlaceLens,
} from "./partner-offer";
import { KINGSTON_EXPERIENCE_LISTINGS } from "./preview-partners";

describe("partnerOfferTerms", () => {
  it("uses a listing discount and keeps the remainder payable", () => {
    const terms = partnerOfferTerms({ price: 24, discount_type: "fixed", discount_value: 8, currency: "USD" }, 45);
    expect(terms.minSpend).toBe(24);
    expect(terms.allowance).toBe(8);
    expect(terms.applies).toBe(8);
    expect(terms.remainder).toBe(16);
  });

  it("never applies more than the card balance", () => {
    const terms = partnerOfferTerms({ price: 28, discount_value: 10 }, 4);
    expect(terms.applies).toBe(4);
    expect(terms.remainder).toBe(24);
  });

  it("falls back to a share of price when no discount is set", () => {
    const terms = partnerOfferTerms({ price: 20 });
    expect(terms.allowance).toBe(7);
    expect(terms.minSpend).toBe(20);
  });
});

describe("shop place lenses", () => {
  it("classifies Kingston previews as food, nights, or experiences", () => {
    expect(shopPlaceLens(KINGSTON_EXPERIENCE_LISTINGS[0])).toBe("food");
    expect(shopPlaceLens(KINGSTON_EXPERIENCE_LISTINGS[1])).toBe("nights");
    expect(shopPlaceLens(KINGSTON_EXPERIENCE_LISTINGS[3])).toBe("experiences");
  });

  it("filters a food lens without hiding other categories from all", () => {
    const food = KINGSTON_EXPERIENCE_LISTINGS.filter((listing) => listingMatchesShopLens(listing, "food"));
    expect(food.some((listing) => listing.listing_id === "devon-house-tasting-passport")).toBe(true);
    expect(KINGSTON_EXPERIENCE_LISTINGS.every((listing) => listingMatchesShopLens(listing, "all"))).toBe(true);
  });
});

describe("shop hrefs and previews", () => {
  it("keeps homepage PromoCard intent on the index and a listing", () => {
    expect(shopIndexHref({ from: "promocard", lens: "food" })).toBe("/shop?from=promocard&lens=food");
    expect(shopListingHref("devon-house-tasting-passport", "promocard")).toBe(
      "/shop/devon-house-tasting-passport?from=promocard",
    );
  });

  it("treats Kingston partners as previews and shows them when live inventory is empty", () => {
    expect(isPreviewPartnerListing(KINGSTON_EXPERIENCE_LISTINGS[0])).toBe(true);
    const empty = shopListingsForSurface([], KINGSTON_EXPERIENCE_LISTINGS);
    expect(empty.showingPreviews).toBe(true);
    expect(empty.listings).toHaveLength(4);
    expect(shopListingsForSurface([{ listing_id: "live-1" } as never], KINGSTON_EXPERIENCE_LISTINGS).showingPreviews).toBe(false);
  });
});
