import { describe, expect, it } from "vitest";
import {
  KINGSTON_AFTER_DARK_SLICE,
  PATH_EVIDENCE_THRESHOLD,
  resolveCrewRunProgress,
  resolvePathEvidence,
  resolveWorldConsequence,
  resolveWorldCurrentMove,
  timeAwareWorldHeader,
  worldObjectState,
} from "../src/world-layer";

describe("world consequence receipt", () => {
  it("never celebrates unverified activity as complete", () => {
    const pending = resolveWorldConsequence({
      verified: false,
      pending: true,
      momentTitle: "AftrHrs",
      placeName: "Sea Deck",
    });
    expect(pending.counted).toBe(false);
    expect(pending.heading).toBe("We received it");
    expect(pending.lines.some((line) => line.value.includes("under review"))).toBe(true);
  });

  it("shows only server-trusted returns after a verified show-up", () => {
    const receipt = resolveWorldConsequence({
      verified: true,
      momentTitle: "AftrHrs",
      placeName: "Sea Deck",
      sceneTitle: "Kingston After Dark",
      promoCardEligible: true,
      memoryKept: true,
      memoryTitle: "First Current Memory",
      runTitle: "Barbican Run",
      runCompleted: 1,
      runTotal: 4,
      pathCue: "A path is forming · Connector",
    });
    expect(receipt.counted).toBe(true);
    expect(receipt.heading).toBe("You showed up");
    expect(receipt.footer).toContain("came back");
    expect(receipt.lines.map((line) => line.label)).toEqual(expect.arrayContaining([
      "What happened",
      "What counted",
      "What came back",
      "Kept",
      "What opened next",
    ]));
    expect(receipt.kept?.title).toBe("First Current Memory");
  });

  it("omits Crew Run and PromoCard lines when those facts are absent", () => {
    const receipt = resolveWorldConsequence({
      verified: true,
      momentTitle: "Sunday Sound",
    });
    expect(receipt.lines.some((line) => line.label === "What came back")).toBe(false);
    expect(receipt.lines.some((line) => line.label === "Crew Run")).toBe(false);
  });
});

describe("world current move", () => {
  it("asks a joined person to check in, not browse a quest log", () => {
    const move = resolveWorldCurrentMove({
      joined: true,
      momentId: "m1",
      momentTitle: "AftrHrs",
      placeName: "Sea Deck",
      sceneSlug: "kingston-after-dark",
    });
    expect(move.title).toContain("Check in");
    expect(move.href).toBe("/moments/m1/checkin");
    expect(move.ctaLabel).toBe("Check in");
  });

  it("uses a live Moment as the only Signal when one exists", () => {
    const move = resolveWorldCurrentMove({
      hasLiveMoment: true,
      momentId: "m2",
      momentTitle: "Barbican Night",
      sceneSlug: "kingston-after-dark",
      promoCardAccepted: true,
    });
    expect(move.eyebrow).toBe(KINGSTON_AFTER_DARK_SLICE.signalEyebrow);
    expect(move.href).toBe("/moments/m2");
    expect(move.context).toContain("PromoCard accepted");
  });

  it("falls back to the Scene doorway without inventing live density", () => {
    const move = resolveWorldCurrentMove({});
    expect(move.href).toBe("/scenes/kingston-after-dark");
    expect(move.why).toContain("PromoCard");
  });
});

describe("emerging path", () => {
  it("stays silent until enough verified evidence exists", () => {
    const early = resolvePathEvidence([
      { actionType: "FRIEND_INVITE" },
      { actionType: "referral_activated" },
    ]);
    expect(early.forming).toBe(false);
    expect(early.title).toBeNull();
    expect(early.cue).toBeNull();
  });

  it("surfaces a forming Connector path from repeated connection", () => {
    const actions = Array.from({ length: PATH_EVIDENCE_THRESHOLD }, () => ({ actionType: "referral_activated" }));
    const path = resolvePathEvidence(actions);
    expect(path.forming).toBe(true);
    expect(path.title).toBe("Connector");
    expect(path.cue).toContain("A path is forming");
  });
});

describe("Barbican Run progress", () => {
  it("counts only objectives that have matching verified actions", () => {
    const progress = resolveCrewRunProgress([
      { actionType: "MOMENT_ATTENDANCE", memoryKept: true },
    ]);
    expect(progress.total).toBe(4);
    expect(progress.completed).toBe(2);
    expect(progress.objectives.find((item) => item.key === "attend_moment")?.complete).toBe(true);
    expect(progress.objectives.find((item) => item.key === "bring_newcomer")?.complete).toBe(false);
  });
});

describe("world object chips", () => {
  it("does not invent attendance or Crew counts", () => {
    expect(worldObjectState({ pulseState: "live", promoCardAccepted: true, sceneTitle: "Kingston After Dark" })).toEqual([
      "Active now",
      "PromoCard accepted",
      "Kingston After Dark",
    ]);
  });

  it("keeps night copy after dark and a calmer header by day", () => {
    expect(timeAwareWorldHeader(new Date("2026-09-05T22:00:00"))).toBe("Tonight in Kingston");
    expect(timeAwareWorldHeader(new Date("2026-09-05T10:00:00"))).toBe("This morning in Kingston");
  });
});
