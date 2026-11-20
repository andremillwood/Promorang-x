/**
 * PromoRang launch window.
 *
 * One calendar date, not a hardcoded check scattered through features.
 * The country/invites sibling should import this same value.
 * SQL mirror: system_settings key LAUNCH_WINDOW_END
 * (supabase/migrations/20261120150000_capped_drops.sql).
 * Server mirror: backend/lib/launchWindow.js.
 */
export const LAUNCH_WINDOW_END = "2027-01-31";

/** CEO/Andre default for a capped drop. Column default matches this. */
export const DEFAULT_CAPPED_DROP_CAP = 100;

/** Inclusive end of the launch window in Jamaica (EST, UTC-5). */
export function launchWindowEndInstant(): Date {
  return new Date(`${LAUNCH_WINDOW_END}T23:59:59-05:00`);
}

export function launchWindowCalendarDate(value: Date | string, timeZone = "America/Jamaica"): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** True when the instant falls on or before the launch-window end date in Jamaica. */
export function isOnOrBeforeLaunchWindowEnd(value: Date | string): boolean {
  return launchWindowCalendarDate(value) <= LAUNCH_WINDOW_END;
}
