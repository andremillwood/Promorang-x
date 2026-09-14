import { describe, expect, it } from "vitest";
import {
  AGENCY_CLIENTS_PATH,
  AGENCY_LANDING_PATH,
  BRAND_CAMPAIGN_PATH,
  BRAND_LANDING_PATH,
  agencyAuthHref,
  brandAuthHref,
  buildAuthHref,
  inferAuthRole,
  mapSponsorActionToOutcome,
  safeNextPath,
  splitPathAndSearch,
} from "./commercial-intent";

describe("inferAuthRole", () => {
  it("reads explicit brand and agency audiences", () => {
    expect(inferAuthRole("/propose", "?audience=brand")).toBe("brand");
    expect(inferAuthRole("/propose/new", "?audience=brand")).toBe("brand");
    expect(inferAuthRole("/free/sponsor", "?role=agency")).toBe("agency");
    expect(inferAuthRole("/for-agencies")).toBe("agency");
  });

  it("treats a generic proposal as host-facing unless a stored commercial audience exists", () => {
    expect(inferAuthRole("/propose/new")).toBe("host");
    expect(inferAuthRole("/propose/new", "", "brand")).toBe("brand");
    expect(inferAuthRole("/propose/new", "", "agency")).toBe("agency");
  });

  it("infers brand and host destinations from their working surfaces", () => {
    expect(inferAuthRole("/onboarding/brand")).toBe("brand");
    expect(inferAuthRole("/create/campaign")).toBe("brand");
    expect(inferAuthRole("/free/sponsor")).toBe("brand");
    expect(inferAuthRole("/for-brands")).toBe("brand");
    expect(inferAuthRole("/create/moment")).toBe("host");
    expect(inferAuthRole("/stock")).toBe("merchant");
  });
});

describe("commercial auth hrefs", () => {
  it("sends a guest into the brand campaign workspace, not a host proposal", () => {
    expect(BRAND_LANDING_PATH).toBe("/for-brands?from=sponsor");
    expect(BRAND_CAMPAIGN_PATH).toBe("/create/campaign?from=sponsor");
    expect(brandAuthHref(null)).toBe(
      "/auth?mode=signup&role=brand&next=%2Fcreate%2Fcampaign%3Ffrom%3Dsponsor",
    );
    expect(brandAuthHref({ id: "user-1" })).toBe("/create/campaign?from=sponsor");
  });

  it("keeps an agency on the client-first workspace contract", () => {
    expect(AGENCY_LANDING_PATH).toBe("/for-agencies?from=sponsor");
    expect(AGENCY_CLIENTS_PATH).toBe("/dashboard?view=studio&tab=clients");
    expect(agencyAuthHref(null)).toBe(
      "/auth?mode=signup&role=agency&next=%2Fdashboard%3Fview%3Dstudio%26tab%3Dclients",
    );
    expect(agencyAuthHref({ id: "user-1" })).toBe("/dashboard?view=studio&tab=clients");
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
