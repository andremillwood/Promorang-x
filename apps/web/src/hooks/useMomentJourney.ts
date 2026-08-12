import { useQuery } from "@tanstack/react-query";
import { resolveMomentJourney, type MomentJourneyFacts } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useMomentJourney(momentId?: string | null) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["moment-journey", momentId, session?.user?.id],
    enabled: Boolean(momentId && session?.access_token),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/participation/moments/${momentId}/journey`, { headers: { Authorization: `Bearer ${session!.access_token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load your Moment journey");
      return resolveMomentJourney(payload.facts as MomentJourneyFacts);
    },
  });
}
