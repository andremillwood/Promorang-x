import { describe, expect, it } from "vitest";
import { AFTRHRS_COPY, DEFAULT_AFTRHRS_FAQS, aftrHrsDigitalReleaseView, authPathForAftrHrsClaim } from "@promorang/shared";

describe("AftrHrs landing states", () => {
  it("sends unauthenticated claimers back to the claim flow after login", () => {
    expect(authPathForAftrHrsClaim()).toContain("next=%2Faftrhrs%3Fclaim%3D1");
    expect(authPathForAftrHrsClaim()).toContain("intent=aftrhrs_claim");
  });

  it("keeps the night open after digital inventory is gone", () => {
    const release = aftrHrsDigitalReleaseView({ soldOut: true, hasPass: false });
    expect(release.kind).toBe("sold_out");
    if (release.kind !== "sold_out") return;
    expect(release.headline).toBe(AFTRHRS_COPY.soldOutHeadline);
    expect(release.primaryCta).toBe("Find an AftrHrs Ambassador");
    expect(release.secondaryCta).toBe("Join the AftrHrs Waitlist");
    expect(release.eventUnavailable).toBe(false);
    expect(release.body).toContain("Physical invitations are still available");
    expect(release.body).not.toMatch(/\b20\b/);
    expect(release.body).not.toMatch(/\b30\b/);
    expect(AFTRHRS_COPY.arrivalRule).toContain("11:30 PM");
    expect(AFTRHRS_COPY.poweredBy).toBe("Powered by PROMORANG");
    expect(JSON.stringify(DEFAULT_AFTRHRS_FAQS)).not.toMatch(/percentage|page reading|claim button/i);
  });
});
