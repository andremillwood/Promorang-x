import { COUNTRY_MARKETS, type MarketLaunchStage } from "./markets";

/** Calendar lead window for weekly Moment announcements. */
export const WEEKLY_MOMENT_LEAD_DAYS = 90;

/** Maps market city slugs to Explore hub ids in apps/web city-hubs. */
const CITY_SLUG_TO_HUB_ID: Record<string, string> = {
  kingston: "kingston",
  "montego-bay": "montego-bay",
  "port-of-spain": "trinidad",
  bridgetown: "barbados",
  nassau: "bahamas",
  georgetown: "guyana",
  accra: "accra",
  "santo-domingo": "dominican-republic",
  medellin: "medellin",
  bogota: "bogota",
  "panama-city": "panama-city",
};

export const WEEKLY_DROP_SOURCES: Record<string, Array<{ name: string; url: string }>> = {
  JM: [
    { name: "Visit Jamaica", url: "https://www.visitjamaica.com/experiences/events/" },
    { name: "Kingston Creative", url: "https://kingstoncreative.org/artwalk/" },
  ],
  TT: [{ name: "Office of the President of Trinidad and Tobago", url: "https://otp.tt/trinidad-and-tobago/national-holidays-and-awards/" }],
  BB: [{ name: "Visit Barbados", url: "https://www.visitbarbados.org/events" }],
  BS: [{ name: "Bahamas Ministry of Tourism", url: "https://www.bahamas.com/events" }],
  GY: [{ name: "Guyana Tourism Authority", url: "https://guyanatourism.com/" }],
  GH: [{ name: "Ghana Tourism Authority", url: "https://visitghana.com/" }],
  DO: [{ name: "Go Dominican Republic", url: "https://www.godominicanrepublic.com/" }],
  CO: [{ name: "ProColombia", url: "https://colombia.travel/en/events" }],
  PA: [{ name: "Visit Panama", url: "https://www.visitpanama.com/" }],
};

export type WeeklyDropHub = {
  countryCode: string;
  countrySlug: string;
  countryName: string;
  citySlug: string;
  cityName: string;
  hubId: string;
  timezone: string;
  launchStage: MarketLaunchStage;
  sources: Array<{ name: string; url: string }>;
};

export function getWeeklyDropHubs(): WeeklyDropHub[] {
  return COUNTRY_MARKETS.flatMap((country) =>
    country.cities.map((city) => ({
      countryCode: country.code,
      countrySlug: country.slug,
      countryName: country.name,
      citySlug: city.slug,
      cityName: city.name,
      hubId: CITY_SLUG_TO_HUB_ID[city.slug] ?? city.slug,
      timezone: city.timezone,
      launchStage: country.launchStage,
      sources: WEEKLY_DROP_SOURCES[country.code] ?? [],
    })),
  ).filter((hub) => hub.launchStage === "live" || hub.launchStage === "pilot");
}

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
  newMoments: Array<{ title: string; starts_at: string | Date; city?: string | null; country?: string | null }>;
  horizonCount: number;
  hubCount?: number;
  leadDays?: number;
}): string {
  const leadDays = input.leadDays ?? WEEKLY_MOMENT_LEAD_DAYS;
  const headlines = input.newMoments.slice(0, 5).map((moment) => {
    const when = formatJamaicaDate(new Date(moment.starts_at));
    const place = [moment.city, moment.country].filter(Boolean).join(", ");
    const placeLabel = place ? ` · ${place}` : "";
    return `• ${moment.title} — ${when}${placeLabel}`;
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
  if (input.hubCount && input.hubCount > 1) {
    lines.push(`${input.hubCount} live and pilot hubs are on this week's calendar.`);
  }

  return lines.join("\n");
}
