import { describe, expect, it } from "vitest";
import {
  COOK_SHOP_BRAND,
  CREATIVE_COOK_SHOP_SEASON,
  CREATIVE_COOK_SHOP_WEEKS,
  cookShopOffer,
  seasonIncludedWith,
} from "@promorang/shared";

describe("Creative Cook Shop platform surface", () => {
  it("exposes a dedicated season path that is not the free webinar", () => {
    expect(CREATIVE_COOK_SHOP_SEASON.publicPath).toBe("/flashcreate/creative-cook-shop");
    expect(cookShopOffer("acquisition_webinar").destination).not.toBe(CREATIVE_COOK_SHOP_SEASON.publicPath);
    expect(COOK_SHOP_BRAND.seasonName).toBe("The Creative Cook Shop");
    expect(COOK_SHOP_BRAND.serviceName).toBe("The Customer Cook Shop");
  });

  it("keeps week 15 as the close of a 15-week Tuesday season", () => {
    expect(CREATIVE_COOK_SHOP_WEEKS).toHaveLength(15);
    expect(CREATIVE_COOK_SHOP_WEEKS[14].title).toMatch(/Ultimate Cook-Off/);
    expect(seasonIncludedWith("retainer")).toBe(true);
    expect(seasonIncludedWith("core_300")).toBe(false);
  });
});
