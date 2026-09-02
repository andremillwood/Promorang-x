import { describe, expect, it } from "vitest";
import {
  COOK_SHOP_OFFERS,
  CREATIVE_COOK_SHOP_SEASON,
  CREATIVE_COOK_SHOP_WEEKS,
  cookShopOffer,
  isAcquisitionWebinar,
  nextSeasonWeek,
  seasonIncludedWith,
  seasonIsLive,
  seasonPassCreditsToward,
  seasonWeekCount,
} from "./flashcreate-cook-shop";

describe("Creative Cook Shop season catalog", () => {
  it("locks a 15-week Tuesday season from Sept 8 to Dec 15 2026", () => {
    expect(seasonWeekCount()).toBe(15);
    expect(CREATIVE_COOK_SHOP_WEEKS[0]).toMatchObject({
      week: 1,
      date: "2026-09-08",
      title: "Welcome to the Creative Cook Shop",
    });
    expect(CREATIVE_COOK_SHOP_WEEKS[14]).toMatchObject({
      week: 15,
      date: "2026-12-15",
      title: "The Ultimate Cook-Off",
    });
    expect(CREATIVE_COOK_SHOP_SEASON.weekday).toBe("Tuesday");
    expect(CREATIVE_COOK_SHOP_SEASON.timeLabel).toContain("6:30");
  });

  it("keeps the weekly acquisition webinar free and separate from the season", () => {
    const webinar = cookShopOffer("acquisition_webinar");
    expect(webinar.priceUsd).toBe(0);
    expect(webinar.includesSeason).toBe(false);
    expect(webinar.destination).toBe("https://flashcreate.co/webinar");
    expect(isAcquisitionWebinar("acquisition_webinar")).toBe(true);
    expect(isAcquisitionWebinar("season_pass")).toBe(false);
  });

  it("prices the season as a $30 tripwire that credits into paid kitchen offers", () => {
    expect(cookShopOffer("season_pass").priceUsd).toBe(30);
    expect(seasonPassCreditsToward("core_300")).toBe(30);
    expect(seasonPassCreditsToward("retainer")).toBe(30);
    expect(seasonPassCreditsToward("grand_slam")).toBe(30);
    expect(seasonPassCreditsToward("acquisition_webinar")).toBe(0);
    expect(seasonPassCreditsToward("season_pass")).toBe(0);
  });

  it("includes the season with retainer and Grand Slam, not with the $300 core", () => {
    expect(seasonIncludedWith("retainer")).toBe(true);
    expect(seasonIncludedWith("grand_slam")).toBe(true);
    expect(seasonIncludedWith("core_300")).toBe(false);
    expect(seasonIncludedWith("season_pass")).toBe(true);
    expect(COOK_SHOP_OFFERS.filter((offer) => offer.includesSeason).map((offer) => offer.id)).toEqual([
      "season_pass",
      "retainer",
      "grand_slam",
    ]);
  });

  it("points the next live week at Sept 8 before the season starts", () => {
    expect(nextSeasonWeek(new Date("2026-09-02T16:00:00-05:00"))?.week).toBe(1);
    expect(nextSeasonWeek(new Date("2026-11-04T12:00:00-05:00"))?.week).toBe(10);
    expect(nextSeasonWeek(new Date("2026-12-16T12:00:00-05:00"))).toBeNull();
    expect(seasonIsLive(new Date("2026-09-08T18:30:00-04:00"))).toBe(true);
    expect(seasonIsLive(new Date("2026-08-20T18:00:00-05:00"))).toBe(false);
  });
});
