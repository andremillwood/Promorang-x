import { useEffect, useState } from "react";

const LOCATION_CACHE_KEY = "promorang:visitor-location";
const FALLBACK_LOCATION = "Global";

type IpLocationResponse = {
  city?: string;
  country_name?: string;
};

function readCachedLocation() {
  try {
    return sessionStorage.getItem(LOCATION_CACHE_KEY);
  } catch {
    return null;
  }
}

function cacheLocation(location: string) {
  try {
    sessionStorage.setItem(LOCATION_CACHE_KEY, location);
  } catch {
    // Storage can be unavailable in privacy-focused browser modes.
  }
}

export function useVisitorLocation() {
  const [location, setLocation] = useState(() => readCachedLocation() || FALLBACK_LOCATION);

  useEffect(() => {
    if (readCachedLocation()) return;

    const controller = new AbortController();

    async function locateVisitor() {
      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) return;

        const data = (await response.json()) as IpLocationResponse;
        const detectedLocation = data.city?.trim() || data.country_name?.trim();

        if (detectedLocation) {
          cacheLocation(detectedLocation);
          setLocation(detectedLocation);
        }
      } catch {
        // IP geolocation is an enhancement; the Jamaica fallback remains visible.
      }
    }

    void locateVisitor();
    return () => controller.abort();
  }, []);

  return location;
}

export function possessiveLocation(location: string) {
  return /s$/i.test(location) ? `${location}'` : `${location}'s`;
}
