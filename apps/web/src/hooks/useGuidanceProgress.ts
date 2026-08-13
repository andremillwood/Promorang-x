import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGuidancePreferences } from "@/hooks/useGuidancePreferences";

type GuidanceState = {
  firstSeenAt: string;
  lastSeenAt: string;
  dismissedAt: string | null;
  openedCount: number;
};

const STORAGE_PREFIX = "promorang_guidance_progress:";

const readLocal = (guidanceId: string): GuidanceState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${guidanceId}`);
    return raw ? JSON.parse(raw) as GuidanceState : null;
  } catch {
    return null;
  }
};

const writeLocal = (guidanceId: string, state: GuidanceState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_PREFIX}${guidanceId}`, JSON.stringify(state));
};

export function useGuidanceProgress(guidanceId: string) {
  const { user } = useAuth();
  const { density } = useGuidancePreferences();
  const [state, setState] = useState<GuidanceState | null>(() => readLocal(guidanceId));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const now = new Date().toISOString();

    const load = async () => {
      setLoading(true);
      const local = readLocal(guidanceId);

      if (!user) {
        const next = local ?? { firstSeenAt: now, lastSeenAt: now, dismissedAt: null, openedCount: 0 };
        writeLocal(guidanceId, next);
        if (!cancelled) {
          setState(next);
          setLoading(false);
        }
        return;
      }

      try {
        const client = supabase as any;
        const { data, error } = await client
          .from("user_guidance_progress")
          .select("first_seen_at,last_seen_at,dismissed_at,opened_count")
          .eq("user_id", user.id)
          .eq("guidance_id", guidanceId)
          .maybeSingle();

        if (error) throw error;

        const next = data
          ? {
              firstSeenAt: data.first_seen_at,
              lastSeenAt: data.last_seen_at,
              dismissedAt: data.dismissed_at,
              openedCount: data.opened_count ?? 0,
            }
          : local ?? { firstSeenAt: now, lastSeenAt: now, dismissedAt: null, openedCount: 0 };

        if (!data) {
          await client.from("user_guidance_progress").upsert({
            user_id: user.id,
            guidance_id: guidanceId,
            first_seen_at: next.firstSeenAt,
            last_seen_at: now,
            dismissed_at: next.dismissedAt,
            opened_count: next.openedCount,
          }, { onConflict: "user_id,guidance_id" });
        }

        writeLocal(guidanceId, next);
        if (!cancelled) setState(next);
      } catch (error) {
        console.error("Error loading guidance progress:", error);
        const next = local ?? { firstSeenAt: now, lastSeenAt: now, dismissedAt: null, openedCount: 0 };
        writeLocal(guidanceId, next);
        if (!cancelled) setState(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [guidanceId, user]);

  const shouldStartOpen = useMemo(() => {
    if (density !== "guided") return false;
    return !state?.dismissedAt;
  }, [density, state?.dismissedAt]);

  const persist = useCallback(async (next: GuidanceState) => {
    setState(next);
    writeLocal(guidanceId, next);

    if (!user) return;

    try {
      const client = supabase as any;
      await client.from("user_guidance_progress").upsert({
        user_id: user.id,
        guidance_id: guidanceId,
        first_seen_at: next.firstSeenAt,
        last_seen_at: next.lastSeenAt,
        dismissed_at: next.dismissedAt,
        opened_count: next.openedCount,
      }, { onConflict: "user_id,guidance_id" });
    } catch (error) {
      console.error("Error saving guidance progress:", error);
    }
  }, [guidanceId, user]);

  const markCollapsed = useCallback(() => {
    const now = new Date().toISOString();
    const current = state ?? { firstSeenAt: now, lastSeenAt: now, dismissedAt: null, openedCount: 0 };
    persist({ ...current, lastSeenAt: now, dismissedAt: current.dismissedAt ?? now });
  }, [persist, state]);

  const markOpened = useCallback(() => {
    const now = new Date().toISOString();
    const current = state ?? { firstSeenAt: now, lastSeenAt: now, dismissedAt: null, openedCount: 0 };
    persist({ ...current, lastSeenAt: now, openedCount: current.openedCount + 1 });
  }, [persist, state]);

  return {
    loading,
    density,
    shouldStartOpen,
    hasSeen: Boolean(state),
    markCollapsed,
    markOpened,
  };
}
