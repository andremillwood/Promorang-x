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
import {
  ALL_CITY_HUBS,
  CITY_STORAGE_KEY,
  type CityOption,
  firstCityHubForSlug,
  getCityHubByCountry,
  getDefaultCityHub,
  resolveCityHub,
} from "@/lib/city-hubs";

const STORAGE_KEY = "promorang:country";

type MarketContextValue = {
  country: CountryMarket;
  countries: readonly CountryMarket[];
  city: CityOption;
  cities: readonly CityOption[];
  setCountry: (value: string) => void;
  setCity: (value: CityOption | string) => void;
  isFeatureEnabled: (feature: MarketFeature) => boolean;
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatLocalDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions, timezone?: string) => string;
};

const MarketContext = createContext<MarketContextValue | null>(null);

const readStoredCityId = () => {
  if (typeof window === "undefined") return getDefaultCityHub().id;
  return resolveCityHub(window.localStorage.getItem(CITY_STORAGE_KEY))?.id ?? getDefaultCityHub().id;
};

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { setLocale } = useI18n();
  const routeCountry = location.pathname.match(/^\/locations\/([^/]+)/)?.[1];
  const routeCity = location.pathname.match(/^\/locations\/[^/]+\/([^/]+)/)?.[1];
  const [countryCode, setCountryCode] = useState(() => {
    if (routeCountry) return getCountryMarket(routeCountry).code;
    const storedCity = resolveCityHub(typeof window === "undefined" ? null : window.localStorage.getItem(CITY_STORAGE_KEY));
    if (storedCity) return storedCity.countryCode;
    if (typeof window === "undefined") return "JM";
    return getCountryMarket(window.localStorage.getItem(STORAGE_KEY)).code;
  });
  const [cityId, setCityId] = useState(() => {
    const fromRoute = firstCityHubForSlug(routeCountry, routeCity);
    if (fromRoute) return fromRoute.id;
    return readStoredCityId();
  });

  useEffect(() => {
    if (!routeCountry) return;
    const nextCountry = getCountryMarket(routeCountry);
    const nextCity = firstCityHubForSlug(routeCountry, routeCity) ?? getCityHubByCountry(nextCountry.code);
    setCountryCode(nextCountry.code);
    setLocale(nextCountry.locale, { explicit: false });
    if (nextCity) {
      setCityId(nextCity.id);
      window.localStorage.setItem(CITY_STORAGE_KEY, nextCity.id);
    }
  }, [routeCountry, routeCity, setLocale]);

  const country = useMemo(() => getCountryMarket(countryCode), [countryCode]);
  const city = useMemo(() => resolveCityHub(cityId) ?? getDefaultCityHub(), [cityId]);

  const setCountry = useCallback((value: string) => {
    const next = getCountryMarket(value);
    window.localStorage.setItem(STORAGE_KEY, next.code);
    setCountryCode(next.code);
    setLocale(next.locale, { explicit: false });
    setCityId((currentId) => {
      const currentHub = resolveCityHub(currentId);
      if (currentHub?.countryCode === next.code) return currentId;
      const fallback = getCityHubByCountry(next.code);
      if (!fallback) return currentId;
      window.localStorage.setItem(CITY_STORAGE_KEY, fallback.id);
      return fallback.id;
    });
  }, [setLocale]);

  const setCity = useCallback((value: CityOption | string) => {
    const next = typeof value === "string" ? resolveCityHub(value) : value;
    if (!next) return;
    window.localStorage.setItem(CITY_STORAGE_KEY, next.id);
    setCityId(next.id);
    const nextCountry = getCountryMarket(next.countryCode);
    window.localStorage.setItem(STORAGE_KEY, nextCountry.code);
    setCountryCode(nextCountry.code);
    setLocale(nextCountry.locale, { explicit: false });
  }, [setLocale]);

  const value = useMemo<MarketContextValue>(() => ({
    country,
    countries: COUNTRY_MARKETS,
    city,
    cities: ALL_CITY_HUBS,
    setCountry,
    setCity,
    isFeatureEnabled: (feature) => isMarketFeatureEnabled(country, feature),
    formatCurrency: (amount, options) => new Intl.NumberFormat(country.locale, { style: "currency", currency: country.currency, ...options }).format(amount),
    formatLocalDate: (date, options, timezone = country.timezone) => new Intl.DateTimeFormat(country.locale, { timeZone: timezone, ...options }).format(new Date(date)),
  }), [country, city, setCountry, setCity]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used within MarketProvider");
  return context;
}
