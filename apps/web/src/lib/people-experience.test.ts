import { describe, expect, it } from "vitest";
import {
  CREATE_INTENTS,
  classifyExperienceRole,
  contributorValueScore,
  resolveCreateIntent,
} from "@promorang/shared";

describe("simplified PROMORANG experience", () => {
  it("never asks a creator to pick Moment vs Mission vs Discovery first", () => {
    expect(CREATE_INTENTS.every((item) => !/moment|mission|discovery|campaign/i.test(item.label))).toBe(true);
    expect(resolveCreateIntent("answer").mapsTo).toBe("Discovery");
    expect(resolveCreateIntent("attend").href).toContain("/create/moment");
  });

  it("lets people contribute without owning a hub", () => {
    expect(classifyExperienceRole({ contributorHubs: 1, operatesHubs: 0 })).toBe("contributor");
  });

  it("scores verified value over recruitment depth", () => {
    expect(
      contributorValueScore({ peopleBrought: 20, activePeople: 15, verifiedActions: 18, attributedValue: 3200 }),
    ).toBeGreaterThan(contributorValueScore({ peopleBrought: 80, activePeople: 1, verifiedActions: 0 }));
  });
});
