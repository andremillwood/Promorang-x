import { describe, expect, it } from "vitest";
import { AFTRHRS_RECURRENCE, AFTRHRS_START_ISO, ENCORE_RECURRENCE, ENCORE_START_ISO } from "@promorang/shared";
import { getMomentStatus, resolveMomentOccurrence } from "./moment-recurrence";

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

  it("projects AftrHrs from the first Friday to the next Friday in Jamaica", () => {
    const occurrence = resolveMomentOccurrence({
      starts_at: AFTRHRS_START_ISO,
      recurrence_enabled: AFTRHRS_RECURRENCE.recurrence_enabled,
      recurrence_frequency: AFTRHRS_RECURRENCE.recurrence_frequency,
      recurrence_interval: AFTRHRS_RECURRENCE.recurrence_interval,
      recurrence_by_weekday: AFTRHRS_RECURRENCE.recurrence_by_weekday,
      recurrence_timezone: AFTRHRS_RECURRENCE.recurrence_timezone,
    }, new Date("2026-09-12T12:00:00-05:00"));

    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Jamaica", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(occurrence.startsAt));
    const date = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    expect(`${date.year}-${date.month}-${date.day}`).toBe("2026-09-18");
    expect(occurrence.occurrenceNumber).toBe(2);
    expect(occurrence.hasFutureOccurrence).toBe(true);
  });

  it("keeps Encore on the first Friday before doors, then jumps two weeks", () => {
    const beforeFirst = resolveMomentOccurrence({
      starts_at: ENCORE_START_ISO,
      ends_at: "2026-09-12T02:00:00-05:00",
      ...ENCORE_RECURRENCE,
    }, new Date("2026-09-10T12:00:00-05:00"));
    const afterFirst = resolveMomentOccurrence({
      starts_at: ENCORE_START_ISO,
      ends_at: "2026-09-12T02:00:00-05:00",
      ...ENCORE_RECURRENCE,
    }, new Date("2026-09-12T12:00:00-05:00"));

    const formatDay = (iso: string) => {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Jamaica", year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" }).formatToParts(new Date(iso));
      const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      return `${value.weekday} ${value.year}-${value.month}-${value.day}`;
    };

    expect(formatDay(beforeFirst.startsAt)).toBe("Friday 2026-09-11");
    expect(formatDay(afterFirst.startsAt)).toBe("Friday 2026-09-25");
    expect(afterFirst.occurrenceNumber).toBe(2);
    expect(getMomentStatus({
      starts_at: ENCORE_START_ISO,
      ...ENCORE_RECURRENCE,
    }).statusBadge).toBe("Biweekly Series");
  });
});
