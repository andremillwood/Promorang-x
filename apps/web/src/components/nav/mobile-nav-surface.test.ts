import { describe, expect, it } from "vitest";
import {
  mobileNavItemClass,
  mobileNavSectionLabelClass,
  mobileNavSheetClass,
  mobileNavTextItemClass,
} from "./mobile-nav-surface";

const glassOrGhost = /text-white|bg-\[#0a0a0c\]|backdrop-blur/;

describe("mobile nav surface", () => {
  it("uses an opaque theme sheet instead of white-on-glass", () => {
    expect(mobileNavSheetClass).toContain("bg-background");
    expect(mobileNavSheetClass).toContain("text-foreground");
    expect(mobileNavSheetClass).not.toMatch(glassOrGhost);
  });

  it("keeps labels and items on readable theme tokens", () => {
    expect(mobileNavSectionLabelClass).toContain("text-muted-foreground");
    expect(mobileNavSectionLabelClass).not.toMatch(/text-white/);
    expect(mobileNavItemClass).toContain("text-foreground");
    expect(mobileNavItemClass).toContain("bg-muted");
    expect(mobileNavTextItemClass).toContain("text-foreground");
    expect(mobileNavTextItemClass).not.toMatch(/text-white/);
  });
});
