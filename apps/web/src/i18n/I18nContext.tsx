import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Locale, supportedLocales, TranslationKey, translations } from "./translations";
import { localeFromPath, localizePath } from "./locale-routing";
import {
  detectBrowserLocale,
  detectGeoIpLocale,
  getSavedLocalePreference,
  hasExplicitLocaleChoice,
  markExplicitLocaleChoice,
  saveLocalePreference,
} from "./geo-locale";

export const normalizeLocale = (value?: string | null): Locale => {
  if (!value) return "en";
  const normalized = value.toLowerCase();
  if (normalized.startsWith("es")) return "es-419";
  if (normalized.startsWith("pt")) return "pt-BR";
  return "en";
};

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "en";
  const pathLocale = localeFromPath(window.location.pathname);
  if (pathLocale) return pathLocale;
  const saved = getSavedLocalePreference();
  if (saved) return saved;
  return detectBrowserLocale();
};

export type SetLocaleOptions = {
  /** User-facing language pickers should leave this true (default). Market / geo suggestions pass false. */
  explicit?: boolean;
};

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale, options?: SetLocaleOptions) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((nextLocale: Locale, options?: SetLocaleOptions) => {
    if (!supportedLocales.includes(nextLocale)) return;
    const isExplicit = options?.explicit !== false;
    if (!isExplicit && hasExplicitLocaleChoice()) return;
    saveLocalePreference(nextLocale);
    if (isExplicit) markExplicitLocaleChoice();
    const nextPath = localizePath(window.location.pathname, nextLocale);
    if (nextPath !== window.location.pathname) {
      window.location.assign(`${nextPath}${window.location.search}${window.location.hash}`);
      return;
    }
    setLocaleState(nextLocale);
  }, []);

  // Check geo-IP in background on first visit if no explicit saved preference exists
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pathLocale = localeFromPath(window.location.pathname);
    if (pathLocale) return; // Explicit URL prefix takes precedence

    const hasSavedPref = Boolean(getSavedLocalePreference());
    if (hasSavedPref) return; // User already chose or has stored preference

    const controller = new AbortController();
    void detectGeoIpLocale(controller.signal).then(({ locale: geoLocale }) => {
      if (geoLocale && geoLocale !== locale && supportedLocales.includes(geoLocale)) {
        // If geo-location indicates Spanish or Portuguese, adopt it seamlessly
        setLocaleState(geoLocale);
        saveLocalePreference(geoLocale);
      }
    });

    return () => controller.abort();
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    t: (key, variables) => {
      const template = translations[locale][key] ?? translations.en[key];
      return Object.entries(variables ?? {}).reduce(
        (result, [name, val]) => result.replaceAll(`{{${name}}}`, String(val)),
        template,
      );
    },
    formatNumber: (val, options) => new Intl.NumberFormat(locale, options).format(val),
    formatDate: (val, options) => {
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return "";
        return new Intl.DateTimeFormat(locale, options).format(d);
      } catch {
        return "";
      }
    },
    formatTime: (val, options) => {
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return "";
        return new Intl.DateTimeFormat(locale, options ?? { hour: "numeric", minute: "2-digit" }).format(d);
      } catch {
        return "";
      }
    },
  }), [locale, setLocale]);

  useEffect(() => {
    if (typeof globalThis !== "undefined") {
      (globalThis as any).t = value.t;
    }
  }, [value.t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const translate = (key: TranslationKey | string, variables?: Record<string, string | number>, localeOverride?: Locale): string => {
  const currentLocale = localeOverride || (typeof window !== "undefined" ? getInitialLocale() : "en");
  const loc = translations[currentLocale] ? currentLocale : "en";
  const template = (translations[loc] as any)?.[key] ?? (translations.en as any)?.[key] ?? String(key);
  return Object.entries(variables ?? {}).reduce(
    (result, [name, val]) => result.replaceAll(`{{${name}}}`, String(val)),
    template,
  );
};

if (typeof globalThis !== "undefined" && !(globalThis as any).t) {
  (globalThis as any).t = translate;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};

