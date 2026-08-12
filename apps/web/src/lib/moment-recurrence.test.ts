import { describe, expect, it } from "vitest";
import { resolveMomentOccurrence } from "./moment-recurrence";

describe("resolveMomentOccurrence", () => {
  it("resolves I Luv Hip Hop's weekly series to July 16", () => {
    const occurrence = resolveMomentOccurrence({
      starts_at: "2026-06-25T23:00:00-05:00",
      ends_at: "2026-06-26T03:00:00-05:00",
      recurrence_enabled: true,
      recurrence_frequency: "weekly",
      recurrence_interval: 1,
      recurrence_by_weekday: [4],
      recurrence_timezone: "America/Jamaica",
    }, new Date("2026-07-14T21:17:00-05:00"));

    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Jamaica", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(occurrence.startsAt));
    const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
    expect(`${date.year}-${date.month}-${date.day}`).toBe("2026-07-16");
    expect(occurrence.occurrenceNumber).toBe(4);
    expect(occurrence.hasFutureOccurrence).toBe(true);
  });

  it("honors recurrence count and end date limits", () => {
    const occurrence = resolveMomentOccurrence({
      starts_at: "2026-06-25T23:00:00-05:00",
      recurrence_enabled: true,
      recurrence_frequency: "weekly",
      recurrence_by_weekday: [4],
      recurrence_timezone: "America/Jamaica",
      recurrence_count: 3,
    }, new Date("2026-07-14T21:17:00-05:00"));

    expect(occurrence.hasFutureOccurrence).toBe(false);
  });
});
