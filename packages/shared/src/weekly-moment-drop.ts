/** Calendar lead window for weekly Moment announcements. */
export const WEEKLY_MOMENT_LEAD_DAYS = 90;

export type LeadWindow = "past" | "this_week" | "near" | "horizon" | "too_far";

export function getIsoWeekStart(asOf: Date): Date {
  const date = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()));
  const weekday = date.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - daysFromMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function getLeadHorizonEnd(asOf: Date, leadDays = WEEKLY_MOMENT_LEAD_DAYS): Date {
  return new Date(asOf.getTime() + leadDays * 24 * 60 * 60 * 1000);
}

export function classifyLeadWindow(startsAt: Date, asOf: Date, leadDays = WEEKLY_MOMENT_LEAD_DAYS): LeadWindow {
  if (startsAt.getTime() < asOf.getTime() - 12 * 60 * 60 * 1000) return "past";
  const weekEnd = new Date(getIsoWeekStart(asOf).getTime() + 7 * 24 * 60 * 60 * 1000);
  if (startsAt.getTime() < weekEnd.getTime()) return "this_week";
  const nearEnd = new Date(asOf.getTime() + 14 * 24 * 60 * 60 * 1000);
  if (startsAt.getTime() < nearEnd.getTime()) return "near";
  if (startsAt.getTime() <= getLeadHorizonEnd(asOf, leadDays).getTime()) return "horizon";
  return "too_far";
}

export function shouldPublishCalendarEvent(startsAt: Date, asOf: Date, leadDays = WEEKLY_MOMENT_LEAD_DAYS): boolean {
  const window = classifyLeadWindow(startsAt, asOf, leadDays);
  return window === "this_week" || window === "near" || window === "horizon";
}

export function formatJamaicaDate(value: Date): string {
  return new Intl.DateTimeFormat("en-JM", {
    timeZone: "America/Jamaica",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value);
}

export function buildWeeklyAnnouncement(input: {
  weekStart: Date;
  newMoments: Array<{ title: string; starts_at: string | Date; city?: string | null }>;
  horizonCount: number;
  leadDays?: number;
}): string {
  const leadDays = input.leadDays ?? WEEKLY_MOMENT_LEAD_DAYS;
  const headlines = input.newMoments.slice(0, 5).map((moment) => {
    const when = formatJamaicaDate(new Date(moment.starts_at));
    const place = moment.city ? ` · ${moment.city}` : "";
    return `• ${moment.title} — ${when}${place}`;
  });

  const lines = [
    `This week on Promorang (${formatJamaicaDate(input.weekStart)})`,
    "",
    input.newMoments.length > 0
      ? `Newly announced (${input.newMoments.length}):`
      : "No new Moments cleared this week. The 90-day calendar is still being filled.",
    ...headlines,
  ];

  if (input.horizonCount > 0) {
    lines.push("", `${input.horizonCount} more dated events sit inside the ${leadDays}-day planning window.`);
  }

  return lines.join("\n");
}
