import { describe, expect, it } from "vitest";
import {
  isCinematicPublicPath,
  shouldHideMarketingFooterOnMobile,
  shouldShowMarketingFooterCta,
} from "./marketing-shell";

describe("marketing shell", () => {
  it("treats the homepage as a cinematic public path", () => {
    expect(isCinematicPublicPath("/")).toBe(true);
    expect(isCinematicPublicPath("/how-it-works")).toBe(true);
    expect(isCinematicPublicPath("/discover")).toBe(false);
  });

  it("does not stack another footer CTA on the homepage", () => {
    expect(shouldShowMarketingFooterCta("/")).toBe(false);
    expect(shouldShowMarketingFooterCta("/for-brands")).toBe(true);
  });

  it("hides the marketing footer on mobile homepage so PromoCard can own that surface", () => {
    expect(shouldHideMarketingFooterOnMobile("/")).toBe(true);
    expect(shouldHideMarketingFooterOnMobile("/how-it-works")).toBe(false);
  });
});
