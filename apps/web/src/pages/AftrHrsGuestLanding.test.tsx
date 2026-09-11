import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AFTRHRS_COPY, AFTRHRS_PATHS, DEFAULT_AFTRHRS_GUEST_FAQS, guestLaneCopy } from "@promorang/shared";

describe("AftrHrs guest landing", () => {
  it("keeps the public door off Promorang signup", () => {
    const landing = readFileSync(resolve(__dirname, "./AftrHrsGuestLanding.tsx"), "utf8");
    const hook = readFileSync(resolve(__dirname, "../hooks/useAftrHrs.ts"), "utf8");
    const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
    expect(app).toContain('path="/aftrhrs"');
    expect(app).toContain("AftrHrsGuestLanding");
    expect(app).toContain('path="/moments/aftrhrs"');
    expect(app).toContain("AftrHrsExperience");
    expect(hook).toContain("/guest-rsvp");
    expect(landing).toContain("useAftrHrsGuest");
    expect(landing).not.toContain("authPathForAftrHrsClaim");
    expect(landing).not.toContain("useAftrHrsAutoClaim");
    expect(landing).toContain("AFTRHRS_COPY.guestNameLabel");
    expect(landing).toContain("AFTRHRS_COPY.guestEmailLabel");
    expect(landing).toContain("AFTRHRS_COPY.guestPhoneLabel");
    expect(landing).toContain("AFTRHRS_PATHS.moment");
    expect(landing).toContain("guestGoingLine");
    expect(landing).toContain("communityCount");
    expect(JSON.stringify(AFTRHRS_COPY.guestLandingLead)).not.toMatch(/30 RSVP|30 spots|\b50\b/i);
    expect(AFTRHRS_COPY.guestMomentLine).toMatch(/PROMORANG/);
    expect(AFTRHRS_COPY.guestMomentLine).toMatch(/going/);
    expect(JSON.stringify(DEFAULT_AFTRHRS_GUEST_FAQS)).not.toMatch(/30 RSVP|30 spots|\b50\b/i);
    expect(DEFAULT_AFTRHRS_GUEST_FAQS[0].answer).toMatch(/No/);
    expect(guestLaneCopy("rsvp", 90, false).cta).toBe(AFTRHRS_COPY.guestRsvpCta);
    expect(AFTRHRS_PATHS.ticket).toBe("/aftrhrs/ticket");
  });
});
