import { useEffect, useState } from "react";
import {
  resolveParticipantEconomyTier,
  type ParticipantEconomyTierId,
} from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export type ParticipantMembership = ReturnType<typeof resolveParticipantEconomyTier> & {
  statusSource?: string | null;
};

export function useParticipantMembership() {
  const { session } = useAuth();
  const [membership, setMembership] = useState<ParticipantMembership>(() => resolveParticipantEconomyTier("starter"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!session?.access_token) {
        if (!cancelled) {
          setMembership(resolveParticipantEconomyTier("starter"));
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/economy/membership`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = response.ok ? await response.json() : null;
        const id = (payload?.membership?.id || payload?.membership?.tier_key || "starter") as ParticipantEconomyTierId;
        if (!cancelled) {
          setMembership({
            ...resolveParticipantEconomyTier(id),
            statusSource: payload?.membership?.statusSource || payload?.membership?.status_source || null,
          });
        }
      } catch {
        if (!cancelled) setMembership(resolveParticipantEconomyTier("starter"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  return { membership, isLoading };
}
