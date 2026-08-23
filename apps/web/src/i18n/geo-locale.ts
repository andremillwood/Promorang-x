import type { Locale } from "./translations";

const STORAGE_KEY = "promorang:locale";
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
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getSavedLocalePreference(): Locale | null {
  if (typeof window === "undefined") return null;
  const localVal = window.localStorage.getItem(STORAGE_KEY);
  if (localVal === "es-419" || localVal === "pt-BR" || localVal === "en") return localVal;
  const cookieVal = getCookie(COOKIE_NAME);
  if (cookieVal === "es-419" || cookieVal === "pt-BR" || cookieVal === "en") return cookieVal;
  return null;
}

export function saveLocalePreference(locale: Locale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  setCookie(COOKIE_NAME, locale);
}

export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined" || !window.navigator) return "en";
  const lang = (window.navigator.language || (window.navigator as any).userLanguage || "").toLowerCase();
  if (lang.startsWith("es")) return "es-419";
  if (lang.startsWith("pt")) return "pt-BR";
  return "en";
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
