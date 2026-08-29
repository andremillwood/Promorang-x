import { describe, expect, it } from "vitest";
import {
  themeBarClass,
  themeChipClass,
  themeDialogClass,
  themeMutedClass,
  themeNavIdleClass,
  themeOverlayClass,
} from "./theme-surfaces";
import { mobileNavSheetClass } from "./mobile-nav-surface";

const glass = /text-white|bg-\[#0e0e11\]|bg-\[#0a0a0c\]|backdrop-blur/;

describe("theme surfaces", () => {
  it("keeps site chrome on opaque theme tokens", () => {
    for (const value of [themeBarClass, themeOverlayClass, themeDialogClass, themeChipClass, mobileNavSheetClass]) {
      expect(value).not.toMatch(glass);
      expect(value).toMatch(/bg-(background|popover|muted)/);
    }
    expect(themeMutedClass).toContain("text-muted-foreground");
    expect(themeNavIdleClass).toContain("text-foreground");
  });
});
