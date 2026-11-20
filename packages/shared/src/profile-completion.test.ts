import { describe, expect, it } from "vitest";
import {
  PROFILE_COMPLETION_PATH,
  isProfileGateCode,
  profileCompletionHref,
  signInHref,
} from "./profile-completion";

describe("profile completion route", () => {
  it("keeps the completion path in one constant and returns to the drop", () => {
    expect(PROFILE_COMPLETION_PATH).toBe("/complete-profile");
    expect(profileCompletionHref("/capped-drop/friday-100")).toBe(
      "/complete-profile?next=%2Fcapped-drop%2Ffriday-100",
    );
  });

  it("sends a signed-out person to sign-in with the same next path", () => {
    expect(signInHref("/capped-drop/friday-100")).toBe(
      "/auth?next=%2Fcapped-drop%2Ffriday-100",
    );
  });

  it("recognizes the fail-closed claim codes", () => {
    expect(isProfileGateCode("AGE_REQUIRED")).toBe(true);
    expect(isProfileGateCode("COUNTRY_REQUIRED")).toBe(true);
    expect(isProfileGateCode("SOLD_OUT")).toBe(false);
  });
});
