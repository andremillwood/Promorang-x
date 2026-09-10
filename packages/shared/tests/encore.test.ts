import { describe, expect, it } from "vitest";
import {
  ENCORE_CADENCE,
  ENCORE_TITLE,
  ENCORE_INTERVAL_WEEKS,
  ENCORE_MOMENT_ID,
  ENCORE_MOMENT_SLUG,
  ENCORE_RECURRENCE,
  ENCORE_START_ISO,
  ENCORE_WEEKDAY,
  ENCORE_WHEN_LINE,
  applyEncoreSchedule,
  hasEncoreBiweeklyFridayRecurrence,
  isEncoreMomentRef,
  isEncoreRecord,
  isEncoreSlug,
} from "../src/encore";

describe("Encore biweekly Friday cadence", () => {
  it("starts this Friday and repeats every other Friday in Jamaica", () => {
    expect(ENCORE_START_ISO).toBe("2026-09-11T20:00:00-05:00");
    expect(ENCORE_WEEKDAY).toBe(5);
    expect(ENCORE_INTERVAL_WEEKS).toBe(2);
    expect(ENCORE_TITLE).toBe("Encore 90s Fridays");
    expect(ENCORE_CADENCE).toBe("Every other Friday");
    expect(ENCORE_WHEN_LINE).toMatch(/every other friday/i);
    expect(ENCORE_WHEN_LINE).not.toMatch(/wednesday/i);
    expect(ENCORE_RECURRENCE.recurrence_interval).toBe(2);
    expect(ENCORE_RECURRENCE.recurrence_by_weekday).toEqual([5]);
  });

  it("recognizes the live Encore moment and the old Wednesday slug", () => {
    expect(isEncoreMomentRef(ENCORE_MOMENT_ID)).toBe(true);
    expect(isEncoreSlug(ENCORE_MOMENT_SLUG)).toBe(true);
    expect(isEncoreSlug("encore-wednesday-social-vip")).toBe(true);
    expect(isEncoreSlug("encore-90s-fridays")).toBe(true);
    expect(isEncoreSlug("encore-live-featuring-capleton")).toBe(false);
    expect(hasEncoreBiweeklyFridayRecurrence(ENCORE_RECURRENCE)).toBe(true);
    expect(hasEncoreBiweeklyFridayRecurrence({ ...ENCORE_RECURRENCE, recurrence_interval: 1 })).toBe(false);
    expect(hasEncoreBiweeklyFridayRecurrence({ ...ENCORE_RECURRENCE, recurrence_by_weekday: [3] })).toBe(false);
  });

  it("rewrites the old Wednesday listing onto the Friday series", () => {
    expect(isEncoreRecord({ title: "Encore Wednesday Social & VIP", slug: "encore-wednesday-social-vip" })).toBe(true);
    expect(isEncoreRecord({ title: "Capleton Encore Live — Culture Rising" })).toBe(false);
    const rewritten = applyEncoreSchedule({
      id: ENCORE_MOMENT_ID,
      title: "Encore Wednesday Social & VIP",
      slug: "encore-wednesday-social-vip",
      starts_at: "2026-09-09T21:00:00-05:00",
      recurrence_enabled: true,
      recurrence_frequency: "weekly",
      recurrence_interval: 1,
      recurrence_by_weekday: [3],
    });
    expect(rewritten.title).toBe("Encore 90s Fridays");
    expect(rewritten.slug).toBe("encore");
    expect(rewritten.starts_at).toBe(ENCORE_START_ISO);
    expect(rewritten.recurrence_interval).toBe(2);
    expect(rewritten.recurrence_by_weekday).toEqual([5]);
  });
});
