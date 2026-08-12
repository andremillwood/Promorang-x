import { useState, useEffect } from "react";

export type LandingPreference = "today" | "for_you";

const STORAGE_KEY = "promorang_landing_preference";

export function useLandingPreference() {
  const [preference, setPreferenceState] = useState<LandingPreference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as LandingPreference) || "today";
    } catch {
      return "today";
    }
  });

  const setPreference = (newPref: LandingPreference) => {
    setPreferenceState(newPref);
    try {
      localStorage.setItem(STORAGE_KEY, newPref);
    } catch (e) {
      console.warn("Could not save landing preference:", e);
    }
  };

  return { preference, setPreference };
}
