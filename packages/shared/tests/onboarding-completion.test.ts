import { describe, expect, it } from "vitest";
import { hasCompletedOnboarding } from "../src/onboarding-completion";

describe("onboarding completion", () => {
  it("is incomplete when there is no preferences row", () => {
    expect(hasCompletedOnboarding(null)).toBe(false);
    expect(hasCompletedOnboarding(undefined)).toBe(false);
    expect(hasCompletedOnboarding({ preferred_categories: [] })).toBe(false);
  });

  it("counts guest taste chips as done", () => {
    expect(hasCompletedOnboarding({ preferred_categories: ["music"] })).toBe(true);
  });

  it("counts the venue stakeholder seed as done", () => {
    expect(hasCompletedOnboarding({ preferred_categories: ["stakeholder"] })).toBe(true);
  });
});
