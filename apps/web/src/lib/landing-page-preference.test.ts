import { describe, expect, it } from "vitest";
import {
  getLandingPageOptions,
  ROLE_DEFAULT_LANDING_ID,
  resolveSavedLandingPreference,
  selectedLandingPageId,
} from "./landing-page-preference";

describe("landing-page-preference", () => {
  it("only exposes role-specific workspaces assigned to the account", () => {
    const options = getLandingPageOptions(["participant", "brand"], "brand");
    expect(options.some((option) => option.id === "studio:brand")).toBe(true);
    expect(options.some((option) => option.id === "studio:agency")).toBe(false);
    expect(options.some((option) => option.id === "admin-command")).toBe(false);
  });

  it("accepts a saved role-specific destination only when the account still has that role", () => {
    expect(resolveSavedLandingPreference({
      path: "/dashboard?view=studio",
      role: "brand",
      roles: ["participant", "brand"],
      activeRole: "participant",
    })?.id).toBe("studio:brand");

    expect(resolveSavedLandingPreference({
      path: "/dashboard?view=studio",
      role: "brand",
      roles: ["participant"],
      activeRole: "participant",
    })).toBeNull();
  });

  it("rejects arbitrary paths from auth metadata", () => {
    expect(resolveSavedLandingPreference({
      path: "https://evil.example",
      role: null,
      roles: ["participant"],
      activeRole: "participant",
    })).toBeNull();
  });

  it("falls back to role-default when no valid preference exists", () => {
    expect(selectedLandingPageId({
      path: "/not-a-real-start-page",
      role: null,
      roles: ["participant"],
      activeRole: "participant",
    })).toBe(ROLE_DEFAULT_LANDING_ID);
  });
});
