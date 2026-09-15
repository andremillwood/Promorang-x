import { describe, expect, it } from "vitest";
import {
  buildMobileInternalDestination,
  createMobilePendingNavigation,
  mobileRoleLanding,
  parseMobilePendingNavigation,
  resolveMobilePostGateDestination,
  safeMobileInternalDestination,
} from "../src/mobile-navigation-intent";

describe("mobile pending navigation", () => {
  it("preserves an internal deep link including query parameters", () => {
    expect(buildMobileInternalDestination("/moment/m-123", { ref: "push", guest: "yes" }))
      .toBe("/moment/m-123?ref=push&guest=yes");
  });

  it("rejects external, protocol-relative, gate and malformed destinations", () => {
    expect(safeMobileInternalDestination("https://evil.example/moment/1")).toBeNull();
    expect(safeMobileInternalDestination("//evil.example/moment/1")).toBeNull();
    expect(safeMobileInternalDestination("/auth/login")).toBeNull();
    expect(safeMobileInternalDestination("/onboarding")).toBeNull();
    expect(safeMobileInternalDestination("/(tabs)")).toBeNull();
    expect(safeMobileInternalDestination("/moment\\evil")).toBeNull();
  });

  it("resumes a signed-out deep link after the gate instead of role landing", () => {
    const pending = createMobilePendingNavigation("/drop/summer-pass?claim=1", 1_000, 10_000);
    expect(resolveMobilePostGateDestination({ pending, role: "participant", now: 2_000 }))
      .toBe("/drop/summer-pass?claim=1");
  });

  it("keeps a new-account destination valid through onboarding and app restart", () => {
    const pending = createMobilePendingNavigation("/guest-pass/token-123", 5_000, 50_000)!;
    const serialized = JSON.stringify(pending);
    const restored = parseMobilePendingNavigation(serialized, 20_000);

    expect(restored?.destination).toBe("/guest-pass/token-123");
    expect(resolveMobilePostGateDestination({ pending: restored, role: "brand", now: 20_000 }))
      .toBe("/guest-pass/token-123");
  });

  it("expires stale intent so it cannot trap later sessions", () => {
    const pending = createMobilePendingNavigation("/proposal/p-1", 1_000, 5_000)!;
    expect(parseMobilePendingNavigation(pending, 6_001)).toBeNull();
    expect(resolveMobilePostGateDestination({ pending, role: "merchant", now: 6_001 }))
      .toBe("/(tabs)/dashboard");
  });

  it("falls back to role landing only when no valid task intent exists", () => {
    expect(mobileRoleLanding("participant")).toBe("/(tabs)");
    expect(mobileRoleLanding("creator")).toBe("/(tabs)/dashboard");
    expect(resolveMobilePostGateDestination({ pending: null, role: "agency" }))
      .toBe("/(tabs)/dashboard");
  });
});
