import { describe, expect, it } from "vitest";
import { buildPromoShareUrl } from "./promoShareRail";

describe("buildPromoShareUrl", () => {
  it("does not invent referral attribution when no recorded code is supplied", () => {
    const url = new URL(buildPromoShareUrl("moment", "moment-1", "friday-night"));
    expect(url.searchParams.get("ref")).toBeNull();
    expect(url.searchParams.get("ps_src")).toBe("moment");
    expect(url.searchParams.get("ps_id")).toBe("moment-1");
  });

  it("includes an explicitly recorded referral code", () => {
    const url = new URL(buildPromoShareUrl("discovery", "discovery-1", "best-jerk", "PROMO-RECORDED"));
    expect(url.searchParams.get("ref")).toBe("PROMO-RECORDED");
    expect(url.searchParams.get("ps_src")).toBe("discovery");
  });
});
