import { describe, expect, it } from "vitest";
import { resolveMomentExperience, resolveMomentJourney } from "../src";

describe("authoritative Moment journey", () => {
  it("asks a joined person to arrive", () => expect(resolveMomentJourney({ moment_id: "m1", joined_at: "2026-01-01" }).stage).toBe("arrive"));
  it("keeps pending proof in review across platforms", () => expect(resolveMomentJourney({ moment_id: "m1", joined_at: "x", checked_in_at: "y", proof_state: "pending" }).stage).toBe("review"));
  it("moves a retained memory toward return", () => expect(resolveMomentJourney({ moment_id: "m1", joined_at: "x", checked_in_at: "y", proof_state: "verified", memory_id: "mem1", return_destination: "/scenes/night" }).stage).toBe("return"));
  it("uses Vault as the success destination", () => expect(resolveMomentJourney({ moment_id: "m1", memory_id: "mem1" }).success_destination.href).toContain("mem1"));
});

describe("Moment experience presentation", () => {
  it("makes arrival the next clear move after joining", () => {
    const result = resolveMomentExperience({ participationState: "joined" });
    expect(result.phase).toBe("before");
    expect(result.actionLabel).toBe("Check in when you arrive");
    expect(result.steps.map((step) => step.status)).toEqual(["current", "upcoming", "upcoming"]);
  });

  it("turns completion into a portable receipt", () => {
    const result = resolveMomentExperience({ participationState: "completed", momentTitle: "Aqua Fest", ticketCount: 2, pieceQuantity: 1 });
    expect(result.phase).toBe("after");
    expect(result.receipt?.title).toBe("Aqua Fest");
    expect(result.receipt?.lines).toEqual(expect.arrayContaining([
      { label: "Participation", value: "Verified" },
      { label: "PromoShare", value: "2 tickets" },
      { label: "Moment Piece", value: "1 kept" },
    ]));
  });
});
