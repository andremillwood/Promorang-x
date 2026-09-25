import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProposeFindOrAskOutcome } from "@/hooks/useFindOrAsk";
import { trackGrowthEvent } from "@/lib/marketing-attribution";

type CanonicalOutcomeType = "place" | "offer" | "moment" | "content" | "opportunity" | "proof" | "receipt";
type SupportedRole = "merchant" | "host" | "creator" | "brand";

function supportedRole(role?: string | null): role is SupportedRole {
  return role === "merchant" || role === "host" || role === "creator" || role === "brand";
}

export function useFindOrAskOriginOutcome() {
  const [params] = useSearchParams();
  const { user, activeRole } = useAuth();
  const propose = useProposeFindOrAskOutcome();
  const discoveryId = params.get("origin_discovery");
  const action = params.get("origin_action") || "respond";

  const attachCreatedOutcome = useCallback(async (input: {
    canonicalObjectType: CanonicalOutcomeType;
    canonicalObjectId: string;
    canonicalObjectUrl?: string;
    sourceLabel?: string;
    sourceUrl?: string;
  }) => {
    if (!discoveryId || !user || !supportedRole(activeRole) || !input.canonicalObjectId.trim()) return false;
    try {
      await propose.mutateAsync({
        discoveryId,
        responderUserId: user.id,
        stakeholderRole: activeRole,
        actionKind: action,
        canonicalObjectType: input.canonicalObjectType,
        canonicalObjectId: input.canonicalObjectId,
        canonicalObjectUrl: input.canonicalObjectUrl,
        sourceLabel: input.sourceLabel,
        sourceUrl: input.sourceUrl,
        freshnessAt: new Date().toISOString(),
      });
      void trackGrowthEvent({
        eventName: "find_or_ask_outcome_auto_attached",
        journey: "commercial",
        stage: "outcome",
        entityType: input.canonicalObjectType,
        entityId: input.canonicalObjectId,
        properties: { discoveryId, action, role: activeRole },
      });
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.warn("[FindOrAsk] Could not attach canonical outcome", error);
      return false;
    }
  }, [action, activeRole, discoveryId, propose, user]);

  return {
    discoveryId,
    action,
    hasOrigin: Boolean(discoveryId),
    attachCreatedOutcome,
    isAttaching: propose.isPending,
  };
}
