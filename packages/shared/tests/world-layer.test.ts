import { describe, expect, it } from "vitest";
import {
  KINGSTON_AFTER_DARK_SLICE,
  PATH_EVIDENCE_THRESHOLD,
  resolveCrewRunProgress,
  resolveCrewRunRole,
  resolveFaction,
  resolvePathEvidence,
  resolveSceneHealth,
  resolveSeasonDispatch,
  presentContestLine,
  presentWorldRunTitle,
  SCENE_WAITING_CONTEST_LINE,
  resolveWorldConsequence,
  resolveWorldCurrentMove,
  resolveWorldMomentPhase,
  resolveGuildReadiness,
  resolveAreaKey,
  resolveTerritoryStanding,
  resolveKingstonTerritories,
  resolveCurrentStatic,
  resolveFactionContest,
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
      runTitle: "The City Wakes",
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
    expect(receipt.pictures.some((picture) => picture.title === "AftrHrs" || picture.title === "Sea Deck")).toBe(true);
    expect(receipt.pictures[0]?.url).toBeTruthy();
  });

  it("omits Crew Run and PromoCard lines when those facts are absent", () => {
    const receipt = resolveWorldConsequence({
      verified: true,
      momentTitle: "Sunday Sound",
    });
    expect(receipt.lines.some((line) => line.label === "What came back")).toBe(false);
    expect(receipt.lines.some((line) => line.label === "Crew Run")).toBe(false);
  });

  it("prefers live Moment and Place photos on the receipt", () => {
    const receipt = resolveWorldConsequence({
      verified: true,
      momentTitle: "AftrHrs",
      placeName: "Sea Deck, Barbican",
      momentImageUrl: "https://cdn.promorang.test/aftrhrs.jpg",
      placeImageUrl: "https://cdn.promorang.test/seadeck.jpg",
    });
    expect(receipt.pictures.map((picture) => picture.kind)).toEqual(["moment", "place"]);
    expect(receipt.pictures[0].url).toBe("https://cdn.promorang.test/aftrhrs.jpg");
    expect(receipt.pictures[1].url).toBe("https://cdn.promorang.test/seadeck.jpg");
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
    expect(move.imageUrl).toBeTruthy();
  });

  it("falls back to browsing nights without forcing one Scene", () => {
    const move = resolveWorldCurrentMove({});
    expect(move.href).toBe("/discover?tab=moments");
    expect(move.why).toMatch(/optional/i);
    expect(move.sceneTitle).toBeNull();
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

describe("Crew Run naming", () => {
  it("does not brand the Run as Barbican", () => {
    expect(KINGSTON_AFTER_DARK_SLICE.runTitle).toBe("The City Wakes");
    expect(presentWorldRunTitle("Barbican Run")).toBe("The City Wakes");
    expect(presentWorldRunTitle("Night Shift")).toBe("Night Shift");
  });
});

describe("Crew Run progress", () => {
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

describe("optional factions and run roles", () => {
  it("treats factions as philosophy, not a required class", () => {
    expect(resolveFaction(null)).toBeNull();
    expect(resolveFaction("weavers")?.verb).toBe("connection");
  });

  it("keeps Run roles temporary and named", () => {
    expect(resolveCrewRunRole("captain")?.title).toBe("Captain");
    expect(resolveCrewRunRole("wizard")).toBeNull();
  });

  it("counts Scene health from verified actions only", () => {
    const health = resolveSceneHealth([
      { actionType: "discovery_vote" },
      { actionType: "referral_activated" },
      { actionType: "check_in" },
    ]);
    expect(health.find((item) => item.dimension === "discovery")?.count).toBe(1);
    expect(health.find((item) => item.dimension === "connection")?.count).toBe(1);
    expect(health.find((item) => item.dimension === "memory")?.count).toBe(1);
    expect(health.find((item) => item.dimension === "sustainability")?.count).toBe(0);
  });

  it("writes a season dispatch without inventing attendance", () => {
    const quiet = resolveSeasonDispatch({});
    expect(quiet.line).toBe(KINGSTON_AFTER_DARK_SLICE.currentLine);
    const live = resolveSeasonDispatch({ hasLiveMoment: true, placeName: "Sea Deck" });
    expect(live.line).toContain("Sea Deck");
  });

  it("places a Moment in before/during/after from proof, not a clock alone", () => {
    expect(resolveWorldMomentPhase({ hasMemory: true })).toBe("after");
    expect(resolveWorldMomentPhase({ arrived: true })).toBe("after");
    expect(resolveWorldMomentPhase({ joined: false })).toBe("before");
  });
});

describe("guilds, territory, and faction contest", () => {
  it("treats a Guild as forming until two Crews sit together", () => {
    const early = resolveGuildReadiness(1);
    expect(early.forming).toBe(true);
    expect(early.needsCrews).toBe(1);
    expect(resolveGuildReadiness(2).ready).toBe(true);
    expect(resolveGuildReadiness(6).full).toBe(true);
  });

  it("maps Kingston place copy to corridors without inventing ownership", () => {
    expect(resolveAreaKey("Sea Deck, Barbican")).toBe("barbican");
    expect(resolveAreaKey("Red Hills Road night")).toBe("red-hills");
    expect(resolveAreaKey("somewhere else")).toBeNull();
  });

  it("derives territory standing from verified presence and support only", () => {
    expect(resolveTerritoryStanding({ areaKey: "barbican" }).state).toBe("unknown");
    expect(resolveTerritoryStanding({ areaKey: "barbican", presenceCount: 2 }).state).toBe("known");
    expect(resolveTerritoryStanding({ areaKey: "barbican", presenceCount: 3 }).state).toBe("held");
    expect(resolveTerritoryStanding({ areaKey: "barbican", presenceCount: 4, supportCount: 2 }).state).toBe("stewarded");
    const board = resolveKingstonTerritories();
    expect(board).toHaveLength(3);
    expect(board.every((area) => area.state === "unknown")).toBe(true);
  });

  it("calls the war Current versus Static, never people versus people", () => {
    const quiet = resolveFactionContest();
    expect(quiet.leadingCurrent).toBeNull();
    expect(quiet.contestLine).toBe(SCENE_WAITING_CONTEST_LINE);
    expect(quiet.contestLine).not.toMatch(/philosophy|faction/i);
    const moving = resolveFactionContest({
      factionCurrents: { seekers: 4, weavers: 1 },
      mixedCrew: true,
    });
    expect(moving.leadingCurrent).toBe("seekers");
    expect(moving.contestLine).toContain("not people versus people");
    expect(moving.mixedCrewNote).toContain("stronger");
    const tied = resolveFactionContest({ factionCurrents: { seekers: 2, weavers: 2 } });
    expect(tied.leadingCurrent).toBeNull();
    expect(tied.contestLine).toContain("even");
  });

  it("remaps leftover V1 contest copy at the UI boundary", () => {
    expect(presentContestLine("No philosophy is moving the Scene yet. The war is Current versus Static.")).toBe(
      SCENE_WAITING_CONTEST_LINE,
    );
    expect(presentContestLine("Faction war · Current vs Static", 4)).toBe(SCENE_WAITING_CONTEST_LINE);
    expect(presentContestLine("Seekers lead by showing up. The war is Current versus Static — not people versus people.", 4))
      .toContain("Seekers");
  });

  it("marks a Scene Static when nothing useful has moved", () => {
    expect(resolveCurrentStatic({ currentCount: 0 }).polarity).toBe("static");
    expect(resolveCurrentStatic({ currentCount: 2, lastActionAt: "2026-09-06T20:00:00Z", now: new Date("2026-09-07T21:00:00Z") }).polarity).toBe("thin");
    expect(resolveCurrentStatic({ currentCount: 5, lastActionAt: "2026-09-07T20:00:00Z", now: new Date("2026-09-07T21:00:00Z") }).polarity).toBe("current");
  });
});
