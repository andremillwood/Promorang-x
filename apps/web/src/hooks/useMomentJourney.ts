import { useQuery } from "@tanstack/react-query";
import { resolveMomentJourney, type MomentJourneyFacts } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useMomentJourney(momentId?: string | null) {
  const { session } = useAuth();
  const isValidUuid = Boolean(momentId && UUID_PATTERN.test(momentId));

  return useQuery({
    queryKey: ["moment-journey", momentId, session?.user?.id],
    enabled: Boolean(isValidUuid && session?.access_token),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/participation/moments/${momentId}/journey`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success || !payload?.facts) {
        throw new Error(payload?.error || `Moment journey unavailable (${response.status})`);
      }

      return resolveMomentJourney(payload.facts as MomentJourneyFacts);
    },
  });
}
