import { describe, expect, it } from "vitest";
import {
  classifyExperienceRole,
  contributorValueScore,
  happenedBuckets,
  resolveCreateIntent,
  slugifyCommunityName,
} from "./people-experience";

describe("people experience mapping", () => {
  it("maps human intent instead of product ontology", () => {
    expect(resolveCreateIntent("answer").mapsTo).toBe("Discovery");
    expect(resolveCreateIntent("attend").mapsTo).toBe("Moment");
    expect(resolveCreateIntent("bring").href).toContain("/people");
    expect(resolveCreateIntent("claim").mapsTo).toBe("Drop");
  });

  it("keeps hub ownership earned, not assumed", () => {
    expect(classifyExperienceRole({ contributorHubs: 3 })).toBe("contributor");
    expect(classifyExperienceRole({ operatesHubs: 1 })).toBe("operator");
  });

  it("values verified movement over empty accounts", () => {
    expect(
      contributorValueScore({ peopleBrought: 20, activePeople: 16, verifiedActions: 20, attributedValue: 8000 }),
    ).toBeGreaterThan(contributorValueScore({ peopleBrought: 100, activePeople: 0, verifiedActions: 0 }));
  });

  it("summarizes what people did without finance jargon", () => {
    expect(happenedBuckets([{ action_type: "MOMENT_ATTENDANCE" }, { action_type: "PURCHASE" }])).toMatchObject({
      went: 1,
      bought: 1,
    });
  });

  it("creates readable community slugs", () => {
    expect(slugifyCommunityName("Kingston After Dark")).toBe("kingston-after-dark");
  });
});
