import { describe, expect, it } from "vitest";
import {
  buildPeopleMomentInsert,
  canAttachPerk,
  claimStatusLabel,
  nextClaimStatus,
  originFromPrivacy,
  originTypeLabel,
  privacyToVisibility,
  resolvePeopleMomentStatus,
  sharePathForMoment,
  winningPlanOption,
} from "./people-moments";

describe("people-first moment taxonomy", () => {
  it("uses human labels for origin types", () => {
    expect(originTypeLabel("crew")).toBe("Friends only");
    expect(originTypeLabel("community")).toBe("Open Moment");
    expect(originTypeLabel("hosted")).toBe("Official Moment");
    expect(originTypeLabel("emergent")).toBe("Emerging");
  });

  it("maps privacy to existing visibility values", () => {
    expect(privacyToVisibility("public")).toBe("open");
    expect(privacyToVisibility("invite_only")).toBe("invite");
    expect(privacyToVisibility("unlisted")).toBe("private");
  });

  it("defaults crew Moments for friends-only privacy", () => {
    expect(originFromPrivacy("invite_only")).toBe("crew");
    expect(originFromPrivacy("public")).toBe("community");
    expect(originFromPrivacy("public", true)).toBe("hosted");
  });

  it("treats Here now as a live Moment", () => {
    const resolved = resolvePeopleMomentStatus({
      hereNow: true,
      now: new Date("2026-08-28T21:00:00-05:00"),
    });
    expect(resolved.status).toBe("active");
    expect(resolved.lifecycle).toBe("live");
  });

  it("builds a people-first insert without a stakeholder", () => {
    const row = buildPeopleMomentInsert(
      {
        title: "Sunset link-up at Devon House",
        location: "Devon House",
        hereNow: true,
        privacy: "public",
      },
      "user-1",
    );

    expect(row.host_id).toBe("user-1");
    expect(row.creator_user_id).toBe("user-1");
    expect(row.origin_type).toBe("community");
    expect(row.here_now).toBe(true);
    expect(row.status).toBe("active");
    expect(row.claim_status).toBe("unclaimed");
    expect(row.claimed_by_stakeholder_id).toBeNull();
    expect(row.visibility).toBe("open");
  });

  it("requires the human fields", () => {
    expect(() => buildPeopleMomentInsert({ title: "  ", location: "Dulce" }, "user-1")).toThrow("What are you doing?");
    expect(() => buildPeopleMomentInsert({ title: "We're at Dulce", location: "" }, "user-1")).toThrow("Where?");
    expect(() =>
      buildPeopleMomentInsert({ title: "Friday", location: "Home", hereNow: false }, "user-1"),
    ).toThrow("When?");
  });

  it("keeps claim as a relationship, not ownership transfer", () => {
    expect(nextClaimStatus("unclaimed", "request")).toBe("claim_requested");
    expect(nextClaimStatus("claim_requested", "verify")).toBe("verified");
    expect(claimStatusLabel("unclaimed")).toBe("Unclaimed");
    expect(canAttachPerk({ claimStatus: "verified", claimedByStakeholderId: "org-1" })).toBe(true);
    expect(canAttachPerk({ claimStatus: "unclaimed" })).toBe(false);
    expect(canAttachPerk({ isHost: true })).toBe(true);
  });

  it("preserves invite attribution on share links", () => {
    expect(sharePathForMoment("moment-1", "user-2")).toBe("/moments/moment-1?invitedBy=user-2");
  });

  it("converts a Plan by picking the winning option", () => {
    const winner = winningPlanOption(
      [
        { id: "dinner", title: "Dinner" },
        { id: "aftrhrs", title: "AftrHrs" },
      ],
      [{ option_id: "aftrhrs" }, { option_id: "aftrhrs" }, { option_id: "dinner" }],
    );
    expect(winner?.id).toBe("aftrhrs");
  });
});
