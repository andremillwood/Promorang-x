import { describe, expect, it } from "vitest";
import { getMemberNextMove } from "./member-next-move";

describe("getMemberNextMove", () => {
  it("sends guests to Discover first", () => {
    const move = getMemberNextMove({ signedIn: false });
    expect(move.kind).toBe("guest_discover");
    expect(move.stage).toBe("notice");
    expect(move.href).toBe("/discover");
  });

  it("asks a joined member to prove they showed up", () => {
    const move = getMemberNextMove({
      signedIn: true,
      needsCheckIn: true,
      checkInHref: "/moments/m1/checkin",
      upcomingMomentName: "Jazz on the lawn",
    });
    expect(move.kind).toBe("show_up");
    expect(move.stage).toBe("prove");
    expect(move.href).toBe("/moments/m1/checkin");
    expect(move.vars?.name).toBe("Jazz on the lawn");
  });

  it("opens an upcoming Moment before inventing a new one", () => {
    const move = getMemberNextMove({
      signedIn: true,
      hasUpcomingMoment: true,
      upcomingMomentHref: "/moments/m2",
      upcomingMomentName: "Sunset link-up",
      canCreate: true,
    });
    expect(move.kind).toBe("open_moment");
    expect(move.href).toBe("/moments/m2");
  });

  it("offers Create when there is nothing live to join", () => {
    const move = getMemberNextMove({ signedIn: true, canCreate: true });
    expect(move.kind).toBe("start_create");
    expect(move.href).toBe("/create");
  });
});
