import type { Locale } from "./translations";
import { localeFromPath } from "./locale-routing";

const STORAGE_KEY = "promorang:locale";
const EXPLICIT_KEY = "promorang:locale_explicit";
const EXPLICIT_COOKIE_NAME = "promorang_locale_explicit";
const COOKIE_NAME = "promorang_locale";
const GEO_CACHE_KEY = "promorang:geo_country";

// Comprehensive mapping of country ISO codes to supported Promorang locales
export const SPANISH_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ",
  "GT", "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE"
]);

export const PORTUGUESE_COUNTRIES = new Set([
  "BR", "PT", "AO", "MZ", "CV", "GW", "ST", "TL"
]);

export function countryCodeToLocale(countryCode?: string | null): Locale {
  if (!countryCode) return "en";
  const code = countryCode.toUpperCase().trim();
  if (PORTUGUESE_COUNTRIES.has(code)) return "pt-BR";
  if (SPANISH_COUNTRIES.has(code)) return "es-419";
  return "en";
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith(prefix));
  try { return entry ? decodeURIComponent(entry.slice(prefix.length)) : null; } catch { return null; }
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getSavedLocalePreference(): Locale | null {
  if (typeof window === "undefined") return null;
  let localVal: string | null = null;
  try { localVal = window.localStorage.getItem(STORAGE_KEY); } catch { /* Cookie fallback when storage is blocked. */ }
  if (localVal === "es-419" || localVal === "pt-BR" || localVal === "en") return localVal;
  const cookieVal = getCookie(COOKIE_NAME);
  if (cookieVal === "es-419" || cookieVal === "pt-BR" || cookieVal === "en") return cookieVal;
  return null;
}

export function saveLocalePreference(locale: Locale): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, locale); } catch { /* Cookies can still persist the preference. */ }
  setCookie(COOKIE_NAME, locale);
}

export function hasExplicitLocaleChoice(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(EXPLICIT_KEY) === "1" || getCookie(EXPLICIT_COOKIE_NAME) === "1"; } catch { return getCookie(EXPLICIT_COOKIE_NAME) === "1"; }
}

export function markExplicitLocaleChoice(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(EXPLICIT_KEY, "1"); } catch { /* Persist the explicit choice in a cookie too. */ }
  setCookie(EXPLICIT_COOKIE_NAME, "1");
}

/** City / market locale may suggest a language, but never override a signed-in user's choice. */
export function shouldApplyMarketLocale(): boolean {
  return !hasExplicitLocaleChoice();
}

export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined" || !window.navigator) return "en";
  const lang = (window.navigator.language || (window.navigator as any).userLanguage || "").toLowerCase();
  if (lang.startsWith("es")) return "es-419";
  if (lang.startsWith("pt")) return "pt-BR";
  return "en";
}

export function currentUiLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return localeFromPath(window.location.pathname) || getSavedLocalePreference() || detectBrowserLocale();
}

export function localeRequestHeaders(): Record<string, string> {
  return { "X-Promorang-Locale": currentUiLocale() };
}

export async function detectGeoIpLocale(signal?: AbortSignal): Promise<{ countryCode?: string; locale: Locale }> {
  if (typeof window === "undefined") return { locale: "en" };

  try {
    const cachedCountry = window.sessionStorage.getItem(GEO_CACHE_KEY);
    if (cachedCountry) {
      return { countryCode: cachedCountry, locale: countryCodeToLocale(cachedCountry) };
    }

    const response = await fetch("https://ipapi.co/json/", {
      signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { locale: detectBrowserLocale() };
    }

    const data = await response.json();
    const countryCode = (data?.country_code || data?.country || "").toUpperCase();
    if (countryCode) {
      window.sessionStorage.setItem(GEO_CACHE_KEY, countryCode);
      return { countryCode, locale: countryCodeToLocale(countryCode) };
    }
  } catch {
    // Graceful fallback to browser locale if IP lookup fails or is blocked by adblockers
  }

  return { locale: detectBrowserLocale() };
}
