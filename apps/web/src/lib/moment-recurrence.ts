export type RecurringMomentLike = {
  starts_at: string;
  ends_at?: string | null;
  recurrence_enabled?: boolean | null;
  recurrence_frequency?: "daily" | "weekly" | "monthly" | null;
  recurrence_interval?: number | null;
  recurrence_by_weekday?: number[] | null;
  recurrence_day_of_month?: number | null;
  recurrence_timezone?: string | null;
  recurrence_until?: string | null;
  recurrence_count?: number | null;
};

export type ResolvedMomentOccurrence = {
  startsAt: string;
  endsAt: string | null;
  occurrenceNumber: number;
  isProjected: boolean;
  hasFutureOccurrence: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value || 0);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
}

function timeZoneOffset(date: Date, timeZone: string) {
  const parts = zonedParts(date, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - date.getTime();
}

function wallTimeToInstant(wallTime: Date, timeZone: string) {
  const guessedUtc = new Date(wallTime.getTime());
  let instant = new Date(guessedUtc.getTime() - timeZoneOffset(guessedUtc, timeZone));
  instant = new Date(guessedUtc.getTime() - timeZoneOffset(instant, timeZone));
  return instant;
}

export function resolveMomentOccurrence(moment: RecurringMomentLike, referenceDate = new Date()): ResolvedMomentOccurrence {
  const originalStart = new Date(moment.starts_at);
  const originalEnd = moment.ends_at ? new Date(moment.ends_at) : null;
  const duration = originalEnd && !Number.isNaN(originalEnd.getTime())
    ? Math.max(0, originalEnd.getTime() - originalStart.getTime())
    : null;
  const fallback = {
    startsAt: moment.starts_at,
    endsAt: moment.ends_at || null,
    occurrenceNumber: 1,
    isProjected: false,
    hasFutureOccurrence: originalStart.getTime() >= referenceDate.getTime(),
  };

  if (
    Number.isNaN(originalStart.getTime()) ||
    !moment.recurrence_enabled ||
    !moment.recurrence_frequency ||
    originalStart.getTime() >= referenceDate.getTime()
  ) return fallback;

  const interval = Math.max(1, Number(moment.recurrence_interval || 1));
  const countLimit = moment.recurrence_count ? Math.max(1, Number(moment.recurrence_count)) : Number.POSITIVE_INFINITY;
  const until = moment.recurrence_until ? new Date(moment.recurrence_until) : null;
  const untilTime = until && !Number.isNaN(until.getTime()) ? until.getTime() : Number.POSITIVE_INFINITY;
  const timeZone = moment.recurrence_timezone || "UTC";
  let originalWallParts: ReturnType<typeof zonedParts>;
  try {
    originalWallParts = zonedParts(originalStart, timeZone);
  } catch {
    originalWallParts = zonedParts(originalStart, "UTC");
  }
  const effectiveTimeZone = (() => { try { new Intl.DateTimeFormat("en", { timeZone }).format(); return timeZone; } catch { return "UTC"; } })();
  const originalWall = new Date(Date.UTC(originalWallParts.year, originalWallParts.month - 1, originalWallParts.day, originalWallParts.hour, originalWallParts.minute, originalWallParts.second, originalStart.getUTCMilliseconds()));
  let candidate = new Date(originalStart);
  let occurrenceNumber = 1;
  const weekdays = (moment.recurrence_by_weekday?.length ? moment.recurrence_by_weekday : [originalWall.getUTCDay()]).map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6);
  const requestedMonthDay = Number(moment.recurrence_day_of_month || originalWall.getUTCDate());
  let candidateWall = new Date(originalWall);
  const maxDays = 366 * 10;
  for (let elapsedDays = 1; elapsedDays <= maxDays; elapsedDays += 1) {
    candidateWall = new Date(originalWall);
    candidateWall.setUTCDate(candidateWall.getUTCDate() + elapsedDays);
    const monthDifference = (candidateWall.getUTCFullYear() - originalWall.getUTCFullYear()) * 12 + candidateWall.getUTCMonth() - originalWall.getUTCMonth();
    const lastDay = new Date(Date.UTC(candidateWall.getUTCFullYear(), candidateWall.getUTCMonth() + 1, 0)).getUTCDate();
    const eligible = moment.recurrence_frequency === "daily"
      ? elapsedDays % interval === 0
      : moment.recurrence_frequency === "monthly"
        ? monthDifference > 0 && monthDifference % interval === 0 && candidateWall.getUTCDate() === Math.min(requestedMonthDay, lastDay)
        : Math.floor(elapsedDays / 7) % interval === 0 && weekdays.includes(candidateWall.getUTCDay());
    if (!eligible) continue;
    occurrenceNumber += 1;
    candidate = wallTimeToInstant(candidateWall, effectiveTimeZone);
    if (candidate.getTime() >= referenceDate.getTime()) break;
  }

  const available = occurrenceNumber <= countLimit && candidate.getTime() <= untilTime && candidate.getTime() >= referenceDate.getTime();
  if (!available) return { ...fallback, hasFutureOccurrence: false };

  return {
    startsAt: candidate.toISOString(),
    endsAt: duration === null ? null : new Date(candidate.getTime() + duration).toISOString(),
    occurrenceNumber,
    isProjected: candidate.getTime() !== originalStart.getTime(),
    hasFutureOccurrence: true,
  };
}
