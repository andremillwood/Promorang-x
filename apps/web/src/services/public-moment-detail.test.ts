import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: db }));

import { getPublicMomentDetail, normalizePublicMomentDetail } from "./public-moment-detail";

const row = {
  id: "11111111-2222-4333-8444-555555555555", title: "Official venue event", slug: "official-venue-event",
  starts_at: "2027-02-15T19:00:00Z", ends_at: "2027-02-15T21:00:00Z", content_origin: "imported", ownership_status: "unclaimed",
  timezone: "Europe/London", state: "Greater London", market_key: "gb-london", is_active: true,
};
const now = Date.parse("2026-11-20T12:00:00Z");

describe("public Moment detail beyond the feed window", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.from.mockReturnValue(db);
    db.select.mockReturnValue(db);
    db.eq.mockReturnValue(db);
    db.maybeSingle.mockResolvedValue({ data: row, error: null });
  });

  it("keeps a verified future event available beyond the feed's 45 day window with venue timezone", () => {
    const moment = normalizePublicMomentDetail(row, now);
    expect(moment?.lifecycle).toBe("upcoming");
    expect(moment?.recurrence_timezone).toBe("Europe/London");
    expect(moment?.market_key).toBe("gb-london");
    expect(moment?.host_id).toBeUndefined();
    expect(moment?.max_participants).toBeUndefined();
  });

  it("does not expose hidden, inactive, cancelled, or invalid records through the fallback", () => {
    expect(normalizePublicMomentDetail({ ...row, visibility: "private" }, now)).toBeNull();
    expect(normalizePublicMomentDetail({ ...row, is_active: false }, now)).toBeNull();
    expect(normalizePublicMomentDetail({ ...row, status: "cancelled" }, now)).toBeNull();
    expect(normalizePublicMomentDetail({ ...row, content_origin: "demo" }, now)).toBeNull();
    expect(normalizePublicMomentDetail({ ...row, starts_at: "invalid" }, now)).toBeNull();
    expect(normalizePublicMomentDetail({ ...row, ends_at: "2026-01-01T00:00:00Z" }, now)).toBeNull();
  });

  it("labels a long-past event as ended rather than last night", () => {
    expect(normalizePublicMomentDetail(row, Date.parse("2027-03-01T00:00:00Z"))?.lifecycle).toBe("completed");
  });

  it("looks up an exact public slug without using a raw table or service-role API", async () => {
    await getPublicMomentDetail(row.slug);
    expect(db.from).toHaveBeenCalledWith("view_public_moment_directory");
    expect(db.eq).toHaveBeenCalledWith("slug", row.slug);
    expect(db.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("looks up UUIDs as exact public IDs", async () => {
    await getPublicMomentDetail(row.id);
    expect(db.eq).toHaveBeenCalledWith("id", row.id);
  });
});
