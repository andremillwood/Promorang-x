import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  COUNTRY_MARKETS,
  type CountryMarket,
  type MarketFeature,
  getCountryMarket,
  isMarketFeatureEnabled,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

const STORAGE_KEY = "promorang:country";

type MarketContextValue = {
  country: CountryMarket;
  countries: readonly CountryMarket[];
  setCountry: (value: string) => void;
  isFeatureEnabled: (feature: MarketFeature) => boolean;
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatLocalDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions, timezone?: string) => string;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { setLocale } = useI18n();
  const routeCountry = location.pathname.match(/^\/locations\/([^/]+)/)?.[1];
  const [countryCode, setCountryCode] = useState(() => {
    if (routeCountry) return getCountryMarket(routeCountry).code;
    if (typeof window === "undefined") return "JM";
    return getCountryMarket(window.localStorage.getItem(STORAGE_KEY)).code;
  });

  useEffect(() => {
    if (!routeCountry) return;
    const next = getCountryMarket(routeCountry);
    setCountryCode(next.code);
    setLocale(next.locale);
  }, [routeCountry, setLocale]);

  const country = useMemo(() => getCountryMarket(countryCode), [countryCode]);

  const setCountry = useCallback((value: string) => {
    const next = getCountryMarket(value);
    window.localStorage.setItem(STORAGE_KEY, next.code);
    setCountryCode(next.code);
    setLocale(next.locale);
  }, [setLocale]);

  const value = useMemo<MarketContextValue>(() => ({
    country,
    countries: COUNTRY_MARKETS,
    setCountry,
    isFeatureEnabled: (feature) => isMarketFeatureEnabled(country, feature),
    formatCurrency: (amount, options) => new Intl.NumberFormat(country.locale, { style: "currency", currency: country.currency, ...options }).format(amount),
    formatLocalDate: (date, options, timezone = country.timezone) => new Intl.DateTimeFormat(country.locale, { timeZone: timezone, ...options }).format(new Date(date)),
  }), [country, setCountry]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used within MarketProvider");
  return context;
}
