import { describe, expect, it } from "vitest";
import {
  isConsumerPostAuthNext,
  isFullOperatorIdentity,
  mapWorkspaceRole,
  resolvePreferredWorkspaceRole,
} from "./auth-roles";

describe("auth roles", () => {
  it("maps superadmin onto the admin workspace", () => {
    expect(mapWorkspaceRole("superadmin")).toBe("admin");
    expect(mapWorkspaceRole("super_admin")).toBe("admin");
    expect(mapWorkspaceRole("master_admin")).toBe("admin");
    expect(mapWorkspaceRole("participant")).toBe("participant");
  });

  it("treats superadmin metadata as a full operator", () => {
    expect(isFullOperatorIdentity({ metadataRole: "superadmin" })).toBe(true);
    expect(isFullOperatorIdentity({ rawRoles: ["super_admin"] })).toBe(true);
    expect(isFullOperatorIdentity({ rawRoles: ["participant"] })).toBe(false);
  });

  it("honors a saved participant switch on refresh", () => {
    expect(
      resolvePreferredWorkspaceRole(["admin", "participant"], { savedRole: "participant" }),
    ).toBe("participant");
  });

  it("treats Get PromoCard next as a consumer destination", () => {
    expect(isConsumerPostAuthNext("/card")).toBe(true);
    expect(isConsumerPostAuthNext("/card?aim=food")).toBe(true);
    expect(isConsumerPostAuthNext("/admin")).toBe(false);
    expect(isConsumerPostAuthNext("//evil.example")).toBe(false);
  });
});
