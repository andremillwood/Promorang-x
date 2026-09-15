import { describe, expect, it } from "vitest";
import {
  canAccessAdminTab,
  firstAdminTab,
  resolveAdminAccessProfile,
} from "./admin-access";

describe("admin experience access", () => {
  it("maps existing platform roles to understandable access levels", () => {
    expect(resolveAdminAccessProfile(["moderator"])?.level).toBe("reviewer");
    expect(resolveAdminAccessProfile(["admin"])?.level).toBe("operations");
    expect(resolveAdminAccessProfile(["administrator"])?.level).toBe("operations");
    expect(resolveAdminAccessProfile(["master_admin"])?.level).toBe("owner");
  });

  it("uses the highest authorized level when a person has multiple roles", () => {
    expect(resolveAdminAccessProfile(["moderator", "master_admin"])?.level).toBe("owner");
  });

  it("does not grant admin access for ordinary product roles", () => {
    expect(resolveAdminAccessProfile(["participant", "host", "merchant"])).toBeNull();
  });

  it("keeps reviewers away from money and system controls", () => {
    expect(canAccessAdminTab("reviewer", "verification-hub")).toBe(true);
    expect(canAccessAdminTab("reviewer", "support")).toBe(true);
    expect(canAccessAdminTab("reviewer", "payouts")).toBe(false);
    expect(canAccessAdminTab("reviewer", "config")).toBe(false);
  });

  it("keeps operations managers away from owner-only controls", () => {
    expect(canAccessAdminTab("operations", "commerce")).toBe(true);
    expect(canAccessAdminTab("operations", "promopush")).toBe(true);
    expect(canAccessAdminTab("operations", "access")).toBe(false);
    expect(canAccessAdminTab("operations", "audit")).toBe(false);
  });

  it("allows platform owners to reach every defined control", () => {
    expect(canAccessAdminTab("owner", "config")).toBe(true);
    expect(canAccessAdminTab("owner", "payouts")).toBe(true);
    expect(canAccessAdminTab("owner", "audit")).toBe(true);
  });

  it("shows a narrowly delegated workspace without raising the person's whole role", () => {
    expect(canAccessAdminTab("support", "payouts", ["payouts.read"])).toBe(true);
    expect(canAccessAdminTab("support", "economy", ["payouts.read"])).toBe(false);
    expect(canAccessAdminTab("reviewer", "team-access", ["admin_access.manage"])).toBe(true);
  });

  it("starts reviewers in their primary work queue", () => {
    expect(firstAdminTab("reviewer")).toBe("verification-hub");
    expect(firstAdminTab("operations")).toBe("command");
  });
});
