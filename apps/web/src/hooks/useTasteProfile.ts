import { useMemo } from "react";
import { tasteProfileFromPreferences, type TasteProfile } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export function useTasteProfile(): TasteProfile {
  const { activeRole } = useAuth();
  const { data: preferences } = useUserPreferences();

  return useMemo(
    () =>
      tasteProfileFromPreferences({
        role: activeRole,
        preferred_categories: preferences?.preferred_categories,
        lifestyle_tags: preferences?.lifestyle_tags,
        age_range: preferences?.age_range,
        preferred_times: preferences?.preferred_times,
        city: preferences?.city,
        country: preferences?.country,
        latitude: preferences?.latitude,
        longitude: preferences?.longitude,
      }),
    [activeRole, preferences],
  );
}
