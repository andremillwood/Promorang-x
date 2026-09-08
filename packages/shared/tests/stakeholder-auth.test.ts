import { describe, expect, it } from "vitest";
import {
  authEntryHref,
  clearIntendedStakeholder,
  inferStakeholderRoleFromPath,
  readIntendedStakeholderNext,
  readIntendedStakeholderRole,
  rememberIntendedStakeholder,
  resolveIntendedStakeholderRole,
} from "../src/stakeholder-auth";

describe("intended stakeholder role from how you arrived", () => {
  it("reads an explicit role query first", () => {
    expect(inferStakeholderRoleFromPath("/stock?role=brand")).toBe("brand");
    expect(resolveIntendedStakeholderRole({ role: "creator", next: "/stock" })).toBe("creator");
  });

  it("infers merchant, brand, host, and creator from the setup path", () => {
    expect(inferStakeholderRoleFromPath("/stock")).toBe("merchant");
    expect(inferStakeholderRoleFromPath("/dashboard/venues/add")).toBe("merchant");
    expect(inferStakeholderRoleFromPath("/staff/scanner")).toBe("merchant");
    expect(inferStakeholderRoleFromPath("/create/campaign")).toBe("brand");
    expect(inferStakeholderRoleFromPath("/create/moment")).toBe("host");
    expect(inferStakeholderRoleFromPath("/content-drops")).toBe("creator");
    expect(inferStakeholderRoleFromPath("/earn")).toBeNull();
  });

  it("does not invent a role from a generic dashboard or card hop", () => {
    expect(inferStakeholderRoleFromPath("/dashboard")).toBeNull();
    expect(inferStakeholderRoleFromPath("/card")).toBeNull();
    expect(inferStakeholderRoleFromPath("/auth")).toBeNull();
  });

  it("builds an auth entry that keeps role and next", () => {
    expect(authEntryHref({ next: "/stock" })).toBe("/auth?role=merchant&next=%2Fstock");
    expect(authEntryHref({ next: "/create/campaign", mode: "login" })).toBe(
      "/auth?mode=login&role=brand&next=%2Fcreate%2Fcampaign",
    );
  });

  it("remembers the intended role in session storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    rememberIntendedStakeholder(storage, { next: "/create/moment" });
    expect(readIntendedStakeholderRole(storage)).toBe("host");
    expect(readIntendedStakeholderNext(storage)).toBe("/create/moment");
    clearIntendedStakeholder(storage);
    expect(readIntendedStakeholderRole(storage)).toBeNull();
    expect(readIntendedStakeholderNext(storage)).toBeNull();
  });
});
