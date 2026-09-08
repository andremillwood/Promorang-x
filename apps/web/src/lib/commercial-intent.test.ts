import { describe, expect, it } from "vitest";
import {
  buildAuthHref,
  inferAuthRole,
  mapSponsorActionToOutcome,
  safeNextPath,
  splitPathAndSearch,
} from "./commercial-intent";

describe("inferAuthRole", () => {
  it("reads an explicit brand audience on the propose path", () => {
    expect(inferAuthRole("/propose", "?audience=brand")).toBe("brand");
    expect(inferAuthRole("/propose/new", "?audience=brand")).toBe("brand");
  });

  it("treats a generic proposal as host-facing unless a stored brand audience exists", () => {
    expect(inferAuthRole("/propose/new")).toBe("host");
    expect(inferAuthRole("/propose/new", "", "brand")).toBe("brand");
  });

  it("infers brand and host destinations from their working surfaces", () => {
    expect(inferAuthRole("/onboarding/brand")).toBe("brand");
    expect(inferAuthRole("/create/campaign")).toBe("brand");
    expect(inferAuthRole("/create/moment")).toBe("host");
    expect(inferAuthRole("/stock")).toBe("merchant");
  });
});

describe("buildAuthHref", () => {
  it("carries role and next so a brand does not land as a participant", () => {
    expect(buildAuthHref("/propose/new?audience=brand", "brand", "signup")).toBe(
      "/auth?mode=signup&role=brand&next=%2Fpropose%2Fnew%3Faudience%3Dbrand",
    );
  });

  it("rejects unsafe next paths", () => {
    expect(safeNextPath("https://evil.example/auth")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath("/propose/new")).toBe("/propose/new");
  });

  it("splits a next path so query flags still infer brand", () => {
    const parts = splitPathAndSearch("/propose/new?audience=brand");
    expect(inferAuthRole(parts.pathname, parts.search)).toBe("brand");
  });
});

describe("mapSponsorActionToOutcome", () => {
  it("maps quiz behaviour to an activation outcome", () => {
    expect(mapSponsorActionToOutcome("Visits or redemptions")).toBe("visits");
    expect(mapSponsorActionToOutcome("Creator output")).toBe("content");
    expect(mapSponsorActionToOutcome("Qualified attendance")).toBe("gather");
    expect(mapSponsorActionToOutcome("Repeat participation")).toBe("community");
  });
});
