import { describe, expect, it } from "vitest";
import {
  landingPathForNeed,
  needsConsumerTasteSteps,
  resolveNeedFromPersona,
  resolveStakeholderNeed,
  STAKEHOLDER_NEEDS,
} from "../src/stakeholder-need";

describe("stakeholder need routing", () => {
  it("covers every live stakeholder instead of a guest-only path", () => {
    expect(STAKEHOLDER_NEEDS.map((need) => need.role)).toEqual([
      "host",
      "merchant",
      "creator",
      "brand",
      "agency",
      "participant",
    ]);
  });

  it("sends a door-tonight need to the host role, not Discover taste prefs", () => {
    const need = resolveStakeholderNeed("people_tonight");
    expect(need?.role).toBe("host");
    expect(needsConsumerTasteSteps(need?.role)).toBe(false);
    expect(landingPathForNeed(need!)).toBe("/?firstNight=true");
  });

  it("keeps going-out as a guest path that still uses taste steps", () => {
    const need = resolveStakeholderNeed("somewhere_to_go");
    expect(need?.role).toBe("participant");
    expect(needsConsumerTasteSteps(need?.role)).toBe(true);
  });

  it("still resolves the old Mayor persona to a host need", () => {
    expect(resolveNeedFromPersona("mayor")?.id).toBe("people_tonight");
  });
});
