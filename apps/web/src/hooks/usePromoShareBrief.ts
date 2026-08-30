import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

export type OperatorRole = "participant" | "host" | "creator" | "sponsor" | "steward" | "admin";

export type PromoShareLastAction = "join" | "check_in" | "complete" | "invite" | "share" | "rsvp";

export type NextMove = {
  kind: string;
  title: string;
  why: string;
  href?: string;
  ctaLabel?: string;
  momentId?: string | null;
  momentName?: string | null;
};

export type ShareDraft = {
  status: string;
  posted: boolean;
  href: string;
  message: string;
  caption?: string;
  warning?: string;
};

export type PoolDraft = {
  status: string;
  funded: boolean;
  published: boolean;
  outcome: { statement: string; targetCount: number; timeframe?: string };
  funding: {
    requested_gems: number;
    prize_pool_gems: number;
    platform_fee_percent: number;
  };
  caps: { max_winners: number; liability_cap_gems: number };
  message: string;
};

export type OperatorBrief = {
  role: OperatorRole;
  stage?: "notice" | "move" | "prove" | "unlock" | "grow" | "return" | string;
  headline: string;
  summary: string;
  unlock?: string;
  proof?: string;
  theyGet?: string;
  promorangGets?: string;
  nextMove: NextMove;
  share?: ShareDraft;
  poolDraft?: PoolDraft;
  cycle?: { tickets?: number; name?: string; eligible?: boolean } | null;
  receiptLines: Array<{ label: string; value: string; strong?: boolean }>;
  boundaries: string[];
  alerts?: string[];
  lastAction?: string | null;
  momentName?: string | null;
};

const ROLE_MAP: Record<string, OperatorRole> = {
  participant: "participant",
  creator: "creator",
  host: "host",
  brand: "sponsor",
  merchant: "sponsor",
  agency: "sponsor",
  promoter: "participant",
  marketing: "participant",
  admin: "admin",
};

export function mapPromoShareRole(activeRole?: string | null, fallback?: OperatorRole): OperatorRole {
  if (activeRole && ROLE_MAP[activeRole]) return ROLE_MAP[activeRole];
  return fallback || "participant";
}

export function usePromoShareBrief({
  defaultRole,
  lastAction,
  momentId,
  momentName,
  enabled = true,
}: {
  defaultRole?: OperatorRole;
  lastAction?: PromoShareLastAction | string;
  momentId?: string;
  momentName?: string;
  enabled?: boolean;
} = {}) {
  const { t } = useI18n();
  const { session, activeRole, profile } = useAuth();
  const role = mapPromoShareRole(activeRole, defaultRole);
  const [brief, setBrief] = useState<OperatorBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [ask, setAsk] = useState("");
  const [budgetGems, setBudgetGems] = useState("800");

  const canAskOutcome = role === "sponsor" || role === "steward" || role === "admin";
  const useHandoff = Boolean(lastAction);

  const loadBrief = useCallback(async (objective?: string) => {
    if (!session?.access_token || !enabled) return;
    setLoading(true);
    try {
      const path = useHandoff ? "/agent/promoshare/handoff" : "/agent/promoshare/brief";
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          lastAction: lastAction || undefined,
          momentId: momentId || undefined,
          momentName: momentName || undefined,
          objective: objective || undefined,
          location: profile?.city || profile?.location || undefined,
          budgetGems: canAskOutcome && budgetGems ? Number(budgetGems) : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "PromoShare could not compile a brief");
      }
      setBrief(result.data.brief);
    } catch (error) {
      console.error(error);
      toast.error(t("promoshare.operatorLoadError"));
    } finally {
      setLoading(false);
    }
  }, [
    session?.access_token,
    enabled,
    useHandoff,
    role,
    lastAction,
    momentId,
    momentName,
    profile?.city,
    profile?.location,
    canAskOutcome,
    budgetGems,
    t,
  ]);

  useEffect(() => {
    if (!session?.access_token || !enabled) return;
    loadBrief();
    // Intentionally omit loadBrief: refetch only when the person, role, or Moment changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, enabled, role, lastAction, momentId]);

  return {
    role,
    brief,
    loading,
    ask,
    setAsk,
    budgetGems,
    setBudgetGems,
    canAskOutcome,
    loadBrief,
    session,
  };
}
