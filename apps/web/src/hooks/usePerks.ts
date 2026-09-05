import { useNearbyBenefits } from "@/hooks/usePeopleExperience";

/** Live participating benefits. LocalStorage claim/redeem is gone. */
export function usePerks() {
  const nearby = useNearbyBenefits();
  return {
    perks: nearby.data || [],
    isLoading: nearby.isLoading,
    isError: nearby.isError,
    refetch: nearby.refetch,
  };
}
