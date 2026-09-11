import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AFTRHRS_COPY, AFTRHRS_OG_IMAGE, AFTRHRS_PATHS, DEFAULT_AFTRHRS_FAQS, aftrHrsDigitalReleaseView, authPathForAftrHrsClaim, authPathForAftrHrsPass } from "@promorang/shared";

describe("AftrHrs landing states", () => {
  it("sends unauthenticated claimers back to the claim flow after login", () => {
    expect(authPathForAftrHrsClaim()).toContain("next=%2Faftrhrs%3Fclaim%3D1");
    expect(authPathForAftrHrsClaim()).toContain("intent=aftrhrs_claim");
    expect(authPathForAftrHrsPass()).toContain("next=%2Faftrhrs%2Fpass");
    expect(AFTRHRS_PATHS.passAlias).toBe("/aftrhrs/pass");
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
    expect(AFTRHRS_COPY.claimGuestCta).toBe("Get my AftrHrs pass");
    expect(AFTRHRS_COPY.findPass).toMatch(/membership card is not the door pass/);
    expect(AFTRHRS_COPY.when).toBe("Every Friday");
    expect(JSON.stringify(DEFAULT_AFTRHRS_FAQS)).not.toMatch(/percentage|shown as|page reading|claim button|page counter/i);
    expect(JSON.stringify(AFTRHRS_COPY)).not.toMatch(/percentage|shown as/i);
    expect(JSON.stringify(DEFAULT_AFTRHRS_FAQS)).toMatch(/Every Friday/);
  });

  it("registers the landing snapshot so crawlers receive AftrHrs artwork", () => {
    const source = readFileSync(resolve(__dirname, "../../scripts/generate-public-seo.mjs"), "utf8");
    expect(source).toContain('path: "/aftrhrs"');
    expect(source).toContain('path: "/moments/aftrhrs"');
    expect(source).toContain('path: "/campaigns/aftrhrs"');
    expect(source).toContain(AFTRHRS_OG_IMAGE.path);
    expect(source).toContain(`imageWidth: ${AFTRHRS_OG_IMAGE.width}`);
    expect(source).toContain("every Friday");
    expect(source).toContain("https://schema.org/Friday");
    expect(source).toContain("repeatFrequency");
    expect(source).not.toContain("September 11");
  });
});
