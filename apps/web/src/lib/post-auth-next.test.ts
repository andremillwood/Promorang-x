import { describe, expect, it } from "vitest";
import {
  authPathForReturn,
  defaultPostAuthPath,
  isCommercialNext,
  resolvePostAuthPath,
  roleFromNext,
  sanitizePostAuthNext,
} from "./post-auth-next";

describe("post-auth-next", () => {
  it("keeps same-origin next paths and drops open redirects", () => {
    expect(sanitizePostAuthNext("/propose/new?from=moment")).toBe("/propose/new?from=moment");
    expect(sanitizePostAuthNext("//evil.example")).toBeNull();
    expect(sanitizePostAuthNext("https://evil.example")).toBeNull();
    expect(sanitizePostAuthNext("/auth")).toBeNull();
  });

  it("recognizes host and commercial return paths", () => {
    expect(isCommercialNext("/propose/new?from=moment")).toBe(true);
    expect(isCommercialNext("/discover/moments")).toBe(false);
    expect(roleFromNext("/propose/new?from=moment")).toBe("host");
    expect(roleFromNext("/propose?audience=brand")).toBe("brand");
    expect(roleFromNext("/propose/new?from=sponsor")).toBe("brand");
    expect(roleFromNext("/for-creators")).toBe("creator");
    expect(roleFromNext("/for-merchants")).toBe("merchant");
    expect(roleFromNext("/for-brands")).toBe("brand");
    expect(roleFromNext("/stock")).toBe("merchant");
    expect(roleFromNext("/create/moment")).toBe("host");
    expect(roleFromNext("/create/campaign")).toBe("brand");
  });

  it("returns hosts to the proposal they started, not the member home", () => {
    expect(resolvePostAuthPath({
      requestedNext: "/propose/new?from=moment",
      role: "admin",
    })).toBe("/propose/new?from=moment");
  });

  it("lands commercial roles in the studio workspace when nothing was in progress", () => {
    expect(defaultPostAuthPath("host")).toBe("/dashboard?view=studio");
    expect(defaultPostAuthPath("creator")).toBe("/dashboard?view=studio");
    expect(defaultPostAuthPath("merchant")).toBe("/dashboard?view=studio");
    expect(defaultPostAuthPath("brand")).toBe("/dashboard?view=studio");
    expect(defaultPostAuthPath("admin")).toBe("/admin?tab=command");
    expect(defaultPostAuthPath("participant")).toBe("/dashboard");
  });

  it("builds an auth URL that keeps the host return path", () => {
    expect(authPathForReturn("/propose/new?from=moment")).toBe(
      "/auth?next=%2Fpropose%2Fnew%3Ffrom%3Dmoment&role=host",
    );
  });

  it("builds an auth URL that keeps a brand on the sponsor brief path", () => {
    expect(authPathForReturn("/propose/new?from=sponsor&audience=brand")).toBe(
      "/auth?next=%2Fpropose%2Fnew%3Ffrom%3Dsponsor%26audience%3Dbrand&role=brand",
    );
  });
});
