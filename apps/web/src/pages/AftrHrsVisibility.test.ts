import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(file: string) {
  return readFileSync(resolve(__dirname, file), "utf8");
}

describe("AftrHrs non-admin visibility", () => {
  it("does not render RSVP or inventory totals on guest and member pages", () => {
    const guestLanding = source("./AftrHrsGuestLanding.tsx");
    const memberExperience = source("./AftrHrsExperience.tsx");

    expect(guestLanding).not.toContain("remainingPercent");
    expect(guestLanding).not.toContain("communityCount");
    expect(memberExperience).not.toContain("remainingPercent");
    expect(memberExperience).not.toContain("data.communityCount");
  });

  it("does not render allocation totals on the ambassador page", () => {
    const ambassadorPage = source("./AftrHrsAmbassador.tsx");

    expect(ambassadorPage).not.toContain("allocation.allocation");
    expect(ambassadorPage).not.toContain("allocation.distributed");
    expect(ambassadorPage).not.toContain("allocation.remaining");
  });
});
