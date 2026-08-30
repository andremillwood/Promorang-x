import { describe, expect, it } from "vitest";
import { getCompletedPersonHome, getPersonSignInPath } from "./post-login-destination";

describe("post-login destination", () => {
  it("sends persons to the Vault", () => {
    expect(getPersonSignInPath({ role: "participant", hasCompletedOnboarding: true })).toBe("/vault");
    expect(getCompletedPersonHome("participant")).toBe("/vault");
  });

  it("keeps operators on their working home", () => {
    expect(getCompletedPersonHome("host")).toBe("/dashboard");
  });
});
