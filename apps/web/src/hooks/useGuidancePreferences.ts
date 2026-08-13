import { useEffect, useState } from "react";

export type GuidanceDensity = "guided" | "compact" | "minimal";

const GUIDANCE_DENSITY_KEY = "promorang_guidance_density";
const GUIDANCE_DENSITY_EVENT = "promorang-guidance-density-change";

const isGuidanceDensity = (value: string | null): value is GuidanceDensity =>
  value === "guided" || value === "compact" || value === "minimal";

export function readGuidanceDensity(): GuidanceDensity {
  if (typeof window === "undefined") return "guided";
  const stored = window.localStorage.getItem(GUIDANCE_DENSITY_KEY);
  return isGuidanceDensity(stored) ? stored : "guided";
}

export function writeGuidanceDensity(density: GuidanceDensity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUIDANCE_DENSITY_KEY, density);
  window.dispatchEvent(new CustomEvent(GUIDANCE_DENSITY_EVENT, { detail: density }));
}

export function useGuidancePreferences() {
  const [density, setDensityState] = useState<GuidanceDensity>(() => readGuidanceDensity());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === GUIDANCE_DENSITY_KEY && isGuidanceDensity(event.newValue)) {
        setDensityState(event.newValue);
      }
    };

    const handleDensityChange = (event: Event) => {
      const next = (event as CustomEvent<GuidanceDensity>).detail;
      if (isGuidanceDensity(next)) setDensityState(next);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(GUIDANCE_DENSITY_EVENT, handleDensityChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(GUIDANCE_DENSITY_EVENT, handleDensityChange);
    };
  }, []);

  const setDensity = (next: GuidanceDensity) => {
    setDensityState(next);
    writeGuidanceDensity(next);
  };

  return { density, setDensity };
}
