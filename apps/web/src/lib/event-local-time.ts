export type EventTimeErrorCode = "invalid_time" | "invalid_timezone" | "nonexistent_time" | "ambiguous_time";

// Machine-readable HTML input values require Gregorian dates and Latin digits;
// localized display formatting is handled separately by the UI.
const INPUT_CALENDAR_LOCALE = "en-CA-u-ca-gregory-nu-latn";

export class EventTimeError extends Error {
  constructor(public readonly code: EventTimeErrorCode) {
    super(code);
  }
}

/** A datetime-local input is a venue wall time, never the viewer's timezone. */
export function eventDateTimeInput(instant: string | null | undefined, timezone: string): string {
  if (!instant) return "";
  const date = new Date(instant);
  if (!Number.isFinite(date.getTime())) throw new EventTimeError("invalid_time");
  try {
    const parts = new Intl.DateTimeFormat(INPUT_CALENDAR_LOCALE, {
      timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(date);
    const part = (name: string) => parts.find((item) => item.type === name)?.value;
    return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
  } catch {
    throw new EventTimeError("invalid_timezone");
  }
}

export function eventDateTimeInstant(value: string, timezone: string, original?: string | null): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new EventTimeError("invalid_time");
  const wall = new Date(`${value}:00Z`);
  if (!Number.isFinite(wall.getTime()) || wall.toISOString().slice(0, 16) !== value) throw new EventTimeError("invalid_time");

  // Preserve the original instant (including seconds) on unrelated edits and
  // preserve the chosen occurrence during a repeated daylight-saving hour.
  if (original && eventDateTimeInput(original, timezone) === value) return new Date(original).toISOString();

  // Probe both sides of a possible DST transition. Each observed offset gives
  // an instant candidate; only candidates that round-trip exactly are valid.
  const offsets = new Set<number>();
  for (const hours of [-36, -24, -12, 0, 12, 24, 36]) {
    const probe = wall.getTime() + hours * 3_600_000;
    const local = eventDateTimeInput(new Date(probe).toISOString(), timezone);
    offsets.add(new Date(`${local}:00Z`).getTime() - probe);
  }
  const matches = [...offsets].map((offset) => new Date(wall.getTime() - offset).toISOString())
    .filter((instant) => eventDateTimeInput(instant, timezone) === value);
  if (!matches.length) throw new EventTimeError("nonexistent_time");
  if (matches.length > 1) throw new EventTimeError("ambiguous_time");
  return matches[0];
}
