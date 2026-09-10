export const ENCORE_MOMENT_ID = "00000000-0000-0000-0002-000000000002";
export const ENCORE_MOMENT_SLUG = "encore";
export const ENCORE_LEGACY_SLUG = "encore-wednesday-social-vip";
export const ENCORE_TITLE = "Encore";
export const ENCORE_VENUE_NAME = "Fiction Nightclub";
export const ENCORE_TIMEZONE = "America/Jamaica";
/** First biweekly Friday: 11 Sep 2026, 8:00 PM Jamaica. */
export const ENCORE_START_ISO = "2026-09-11T20:00:00-05:00";
export const ENCORE_END_ISO = "2026-09-12T02:00:00-05:00";
/** JS weekday: Sunday = 0 … Friday = 5. */
export const ENCORE_WEEKDAY = 5;
export const ENCORE_INTERVAL_WEEKS = 2;
export const ENCORE_DOORS = "8:00 PM";
export const ENCORE_CADENCE = "Every other Friday";
export const ENCORE_WHEN_LINE = "Every other Friday · 8:00 PM";
export const ENCORE_RECURRENCE = {
  recurrence_enabled: true,
  recurrence_frequency: "weekly" as const,
  recurrence_interval: ENCORE_INTERVAL_WEEKS,
  recurrence_by_weekday: [ENCORE_WEEKDAY],
  recurrence_timezone: ENCORE_TIMEZONE,
  recurrence_until: null,
  recurrence_count: null,
};

export const ENCORE_EVENT_SCHEDULE = {
  "@type": "Schedule",
  repeatFrequency: "P2W",
  byDay: "https://schema.org/Friday",
  startTime: "20:00",
  scheduleTimezone: ENCORE_TIMEZONE,
} as const;

export type EncoreRecurrenceLike = {
  recurrence_enabled?: boolean | null;
  recurrence_frequency?: string | null;
  recurrence_interval?: number | null;
  recurrence_by_weekday?: Array<number | string> | null;
  recurrence_timezone?: string | null;
};

export function isEncoreSlug(value?: string | null): boolean {
  const slug = String(value || "").trim().toLowerCase();
  return slug === ENCORE_MOMENT_SLUG || slug === ENCORE_LEGACY_SLUG;
}

export function isEncoreMomentRef(value?: string | null): boolean {
  const id = String(value || "").trim().toLowerCase();
  return id === ENCORE_MOMENT_ID || isEncoreSlug(id);
}

export function isEncoreRecord(moment?: { id?: string | null; slug?: string | null; title?: string | null } | null): boolean {
  if (!moment) return false;
  if (isEncoreMomentRef(moment.id) || isEncoreSlug(moment.slug)) return true;
  const title = String(moment.title || "").toLowerCase();
  if (!title.includes("encore")) return false;
  return !title.includes("capleton") && !title.includes("encore live");
}

export function applyEncoreSchedule<T extends object>(moment: T): T {
  if (!isEncoreRecord(moment)) return moment;
  return {
    ...moment,
    title: ENCORE_TITLE,
    slug: ENCORE_MOMENT_SLUG,
    starts_at: ENCORE_START_ISO,
    ends_at: ENCORE_END_ISO,
    ...ENCORE_RECURRENCE,
  };
}

export function hasEncoreBiweeklyFridayRecurrence(moment?: EncoreRecurrenceLike | null): boolean {
  if (!moment?.recurrence_enabled) return false;
  if (String(moment.recurrence_frequency || "").toLowerCase() !== "weekly") return false;
  if (Number(moment.recurrence_interval || 1) !== ENCORE_INTERVAL_WEEKS) return false;
  const weekdays = Array.isArray(moment.recurrence_by_weekday)
    ? moment.recurrence_by_weekday.map((day) => Number(day))
    : [];
  if (!weekdays.includes(ENCORE_WEEKDAY)) return false;
  return (moment.recurrence_timezone || ENCORE_TIMEZONE) === ENCORE_TIMEZONE;
}
