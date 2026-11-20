import { isoCountryByCode, resolveIsoCountry } from "./iso-countries";

const SIGNUP_AGE_TIME_ZONE = "America/Jamaica";

export const MINIMUM_SIGNUP_AGE_YEARS = 18;

export const SIGNUP_ELIGIBILITY_CODES = [
  "COUNTRY_REQUIRED",
  "INVALID_COUNTRY",
  "DOB_REQUIRED",
  "INVALID_DOB",
  "UNDERAGE",
] as const;

export type SignupEligibilityCode = (typeof SIGNUP_ELIGIBILITY_CODES)[number];

export type SignupEligibilityInput = {
  countryCode?: string | null;
  dob?: string | null;
};

function calendarDate(now: Date, timeZone = SIGNUP_AGE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: read("year"), month: read("month"), day: read("day") };
}

export function parseIsoDate(value: string | null | undefined): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function ageInYears(dob: string, now = new Date()): number | null {
  const parsed = parseIsoDate(dob);
  if (!parsed) return null;
  const today = calendarDate(now);
  let age = today.year - parsed.year;
  if (today.month < parsed.month || (today.month === parsed.month && today.day < parsed.day)) age -= 1;
  return age;
}

export function isAdultDob(dob: string, now = new Date()): boolean {
  const age = ageInYears(dob, now);
  return age !== null && age >= MINIMUM_SIGNUP_AGE_YEARS;
}

export function validateSignupEligibility(input: SignupEligibilityInput, now = new Date()): SignupEligibilityCode | null {
  const country = String(input.countryCode || "").trim();
  if (!country) return "COUNTRY_REQUIRED";
  if (!isoCountryByCode(country)) return "INVALID_COUNTRY";
  const dob = String(input.dob || "").trim();
  if (!dob) return "DOB_REQUIRED";
  if (!parseIsoDate(dob)) return "INVALID_DOB";
  if (!isAdultDob(dob, now)) return "UNDERAGE";
  return null;
}

/**
 * Backfill map for existing user_preferences.country values.
 * The web default token "US" (and "USA") is unknown and becomes NULL.
 * "Jamaica" / "JM" become JM. Any other recognized ISO country is kept.
 * "United States" as a full name is kept as US because it is not the stored default token.
 */
export function legacyPreferenceCountryCode(value: string | null | undefined): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (/^(us|usa)$/i.test(trimmed)) return null;
  if (/^(jm|jamaica)$/i.test(trimmed)) return "JM";
  return resolveIsoCountry(trimmed)?.code ?? null;
}
