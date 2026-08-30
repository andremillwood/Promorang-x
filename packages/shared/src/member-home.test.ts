import { describe, expect, it } from "vitest";
import {
  getPersonSignInPath,
  isOperatorRole,
  PERSON_HOME_PATH,
  PERSON_TODAY_PATH,
  PROMOCARD_HOME_LOOP,
} from "./member-home";

describe("person home loop", () => {
  it("lands persons in the Vault after onboarding", () => {
    expect(getPersonSignInPath({ role: "participant", hasCompletedOnboarding: true })).toBe(PERSON_HOME_PATH);
    expect(getPersonSignInPath({ hasCompletedOnboarding: true })).toBe("/vault");
  });

  it("keeps first-run persons in onboarding", () => {
    expect(getPersonSignInPath({ role: "participant", hasCompletedOnboarding: false })).toBe("/onboarding");
  });

  it("honors a safe next path and demo landing", () => {
    expect(getPersonSignInPath({
      role: "participant",
      hasCompletedOnboarding: true,
      requestedNext: "/moments/sunday-sound",
    })).toBe("/moments/sunday-sound");
    expect(getPersonSignInPath({
      role: "participant",
      hasCompletedOnboarding: true,
      requestedNext: "//evil.example",
      demoPath: "/vault",
    })).toBe("/vault");
  });

  it("does not steal operator first-run from the router", () => {
    expect(isOperatorRole("merchant")).toBe(true);
    expect(getPersonSignInPath({ role: "merchant", hasCompletedOnboarding: true })).toBe(PERSON_TODAY_PATH);
  });

  it("keeps Today in service of the PromoCard", () => {
    expect(PROMOCARD_HOME_LOOP.todayJob).toMatch(/PromoCard/);
    expect(PROMOCARD_HOME_LOOP.carry).toMatch(/Vault/);
  });
});
