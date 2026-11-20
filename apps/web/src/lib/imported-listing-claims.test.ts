import { describe, expect, it } from "vitest";
import { canClaimImportedMoment, importedListingClaimPath, parseImportedListingClaimTarget, safeEvidenceUrl } from "./imported-listing-claims";

const event = { id: "11111111-2222-4333-8444-555555555555", content_origin: "imported", ownership_status: "unclaimed", claim_status: "unclaimed" };

describe("imported listing ownership entry", () => {
  it("shows a claim entry only for an explicitly unowned imported Moment", () => {
    expect(canClaimImportedMoment(event)).toBe(true);
    expect(canClaimImportedMoment({ ...event, ownership_status: "claimed" })).toBe(false);
    expect(canClaimImportedMoment({ ...event, claim_status: "claimed" })).toBe(false);
    expect(canClaimImportedMoment({ ...event, host_id: "steward-or-owner" })).toBe(false);
    expect(canClaimImportedMoment({ ...event, organizer_id: "owner" })).toBe(false);
    expect(canClaimImportedMoment({ ...event, claimed_by: "owner" })).toBe(false);
    expect(canClaimImportedMoment({ ...event, content_origin: "stakeholder_created" })).toBe(false);
    expect(canClaimImportedMoment({ ...event, ownership_status: undefined })).toBe(false);
  });

  it("preserves the exact asset through a protected claim URL", () => {
    const path = importedListingClaimPath("venue", event.id);
    expect(path.startsWith("/claim-pages?")).toBe(true);
    expect(parseImportedListingClaimTarget(new URL(path, "https://promorang.co").searchParams)).toEqual({ entityType: "venue", entityId: event.id });
    expect(parseImportedListingClaimTarget(new URLSearchParams("entity_type=moment&entity_id=some-title"))).toBeNull();
    expect(parseImportedListingClaimTarget(new URLSearchParams(`entity_type=brand&entity_id=${event.id}`))).toBeNull();
  });

  it("accepts only HTTPS evidence without credentials or script schemes", () => {
    expect(safeEvidenceUrl(" https://venue.example/events/1 ")).toBe("https://venue.example/events/1");
    expect(safeEvidenceUrl("http://venue.example/events/1")).toBeNull();
    expect(safeEvidenceUrl("javascript:alert(1)")).toBeNull();
    expect(safeEvidenceUrl("https://user:password@venue.example")).toBeNull();
    expect(safeEvidenceUrl("not-a-url")).toBeNull();
  });
});
