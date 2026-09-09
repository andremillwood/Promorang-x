import { useEffect, useState } from "react";

const LOCATION_CACHE_KEY = "promorang:visitor-location";
const PLACE_CACHE_KEY = "promorang:visitor-place";
const FALLBACK_LOCATION = "Global";

export type VisitorPlace = {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  label: string;
};

type IpLocationResponse = {
  city?: string;
  country_name?: string;
  country_code?: string;
};

function readCachedLocation() {
  try {
    return sessionStorage.getItem(LOCATION_CACHE_KEY);
  } catch {
    return null;
  }
}

function readCachedPlace(): VisitorPlace | null {
  try {
    const raw = sessionStorage.getItem(PLACE_CACHE_KEY);
    return raw ? JSON.parse(raw) as VisitorPlace : null;
  } catch {
    return null;
  }
}

function cachePlace(place: VisitorPlace) {
  try {
    sessionStorage.setItem(LOCATION_CACHE_KEY, place.label);
    sessionStorage.setItem(PLACE_CACHE_KEY, JSON.stringify(place));
  } catch {
    // Storage can be unavailable in privacy-focused browser modes.
  }
}

function placeFromParts(city?: string | null, country?: string | null, countryCode?: string | null): VisitorPlace {
  const nextCity = city?.trim() || null;
  const nextCountry = country?.trim() || null;
  const nextCode = countryCode?.trim().toUpperCase() || null;
  return {
    city: nextCity,
    country: nextCountry,
    countryCode: nextCode,
    label: nextCity || nextCountry || FALLBACK_LOCATION,
  };
}

export function useVisitorPlace() {
  const [place, setPlace] = useState<VisitorPlace>(() => readCachedPlace() || placeFromParts());

  useEffect(() => {
    if (readCachedPlace()?.city || readCachedPlace()?.country) return;

    const controller = new AbortController();

    async function locateVisitor() {
      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) return;

        const data = (await response.json()) as IpLocationResponse;
        const next = placeFromParts(data.city, data.country_name, data.country_code);
        if (next.city || next.country) {
          cachePlace(next);
          setPlace(next);
        }
      } catch {
        // IP geolocation is an enhancement; the selected city hub remains the offer surface.
      }
    }

    void locateVisitor();
    return () => controller.abort();
  }, []);

  return place;
}

export function useVisitorLocation() {
  return useVisitorPlace().label;
}

export function possessiveLocation(location: string) {
  return /s$/i.test(location) ? `${location}'` : `${location}'s`;
}
