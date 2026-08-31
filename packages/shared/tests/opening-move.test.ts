import { describe, expect, it } from "vitest";
import { getOpeningMove, openingHref, shouldShowOpeningMove } from "../src/opening-move";

describe("opening move after signup", () => {
  it("asks a new personal account who they are before inventing a next step", () => {
    const move = getOpeningMove({ role: "participant", hostedMomentCount: 0, joinedMomentCount: 0 });
    expect(move.path).toBe("choose_path");
    expect(move.headline).toMatch(/place/i);
    expect(move.plainEnglish).toMatch(/bar/i);
    expect(shouldShowOpeningMove({ role: "participant", hostedMomentCount: 0, joinedMomentCount: 0 })).toBe(true);
  });

  it("tells a venue owner to start tonight in plain language", () => {
    const move = getOpeningMove({ role: "host", hostedMomentCount: 0 });
    expect(move.path).toBe("start_tonight");
    expect(move.headline).toMatch(/tonight/i);
    expect(move.ctaLabel).toBe("Start tonight");
    expect(move.plainEnglish).toMatch(/moment is just tonight/i);
    expect(move.steps).toHaveLength(3);
    expect(openingHref(move.destination)).toBe("/create/moment?firstTime=true");
    expect(JSON.stringify(move)).not.toMatch(/WHAT NEEDS MY ATTENTION/i);
  });

  it("uses the same tonight move for a merchant or someone who said they have a place", () => {
    expect(getOpeningMove({ role: "merchant", hostedMomentCount: 0 }).path).toBe("start_tonight");
    expect(getOpeningMove({ role: "participant", pathChoice: "place", hostedMomentCount: 0 }).path).toBe("start_tonight");
  });

  it("sends someone going out to discover instead of create", () => {
    const move = getOpeningMove({ role: "participant", pathChoice: "out", hostedMomentCount: 0, joinedMomentCount: 0 });
    expect(move.path).toBe("find_something");
    expect(move.destination).toBe("discover");
    expect(openingHref(move.destination)).toBe("/discover?firstTime=true");
  });

  it("hides the opening move once a venue has hosted something", () => {
    expect(shouldShowOpeningMove({ role: "host", hostedMomentCount: 1 })).toBe(false);
  });
});
