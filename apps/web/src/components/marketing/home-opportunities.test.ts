import { describe, expect, it } from "vitest";
import { buildHomeOpportunities } from "./home-opportunities";
import type { CanonicalMoment } from "@/services/moment-feed";
const now = Date.parse("2026-10-09T12:00:00Z");
const moment = { id: "current", title: "Dinner", slug: "dinner", starts_at: "2026-10-09T11:00:00Z", effective_ends_at: "2026-10-09T14:00:00Z", lifecycle: "live" } as CanonicalMoment;
describe("public hero inventory", () => {
  it("features complete nearby listings without displacing live events", () => {
    const upcoming = { ...moment, lifecycle: "upcoming", starts_at: "2026-10-12T11:00:00Z", effective_ends_at: "2026-10-12T14:00:00Z" } as CanonicalMoment;
    const imported = { ...upcoming, id: "imported", content_origin: "imported" } as CanonicalMoment;
    const hosted = { ...upcoming, id: "hosted", content_origin: "stakeholder_created", image_url: "/event.jpg", starts_at: "2026-10-15T11:00:00Z", effective_ends_at: "2026-10-15T14:00:00Z" } as CanonicalMoment;
    const distant = { ...hosted, id: "distant", starts_at: "2026-11-15T11:00:00Z", effective_ends_at: "2026-11-15T14:00:00Z" };
    expect(buildHomeOpportunities([], [imported, distant, hosted, moment], [], now).map(item => item.id)).toEqual(["current", "hosted", "imported", "distant"]);
  });
  it("only includes missions connected to current supplied moments", () => {
    const result = buildHomeOpportunities([], [moment], [
      { id: "valid", moment: { id: "current" }, content: { title: "Share your experience" } },
      { id: "other", moment: { id: "another-city" }, content: { title: "Other mission" } },
    ], now);
    expect(result.map(item => item.href)).toEqual(["/moments/dinner", "/missions/valid"]);
  });
  it("removes elapsed moments and their missions even before the feed refreshes", () => {
    expect(buildHomeOpportunities([], [moment], [{ id: "valid", moment: { id: "current" }, content: { title: "Share" } }], Date.parse("2026-10-09T15:00:00Z"))).toEqual([]);
  });
});
