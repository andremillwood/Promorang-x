import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Locale, supportedLocales, TranslationKey, translations } from "./translations";
import { localeFromPath, localizePath } from "./locale-routing";
import {
  detectBrowserLocale,
  detectGeoIpLocale,
  getSavedLocalePreference,
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

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!supportedLocales.includes(nextLocale)) return;
    saveLocalePreference(nextLocale);
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
    formatDate: (val, options) => new Intl.DateTimeFormat(locale, options).format(new Date(val)),
  }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};

