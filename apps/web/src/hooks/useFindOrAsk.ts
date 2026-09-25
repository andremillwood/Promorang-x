import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FindOrAskPostKind } from "@promorang/shared";

const db = supabase as any;

export type FindOrAskDiscoveryRow = {
  id: string;
  question: string;
  semantic_kind: FindOrAskPostKind;
  city?: string | null;
  language?: string | null;
  source?: string | null;
  recovery_action?: string | null;
  created_at: string;
  updated_at?: string | null;
  answered_at?: string | null;
  support_count?: number | null;
  demand_target?: number | null;
  user_supported?: boolean;
  has_answer?: boolean;
  moderation_status?: string;
};

export type FindOrAskOutcomeRow = {
  id: string;
  discovery_id: string;
  stakeholder_role: "merchant" | "host" | "creator" | "brand";
  action_kind: string;
  canonical_object_type: string;
  canonical_object_id: string;
  canonical_object_url?: string | null;
  source_label?: string | null;
  source_url?: string | null;
  freshness_at?: string | null;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
};

export function useFindOrAskDiscoveries(city?: string) {
  return useQuery({
    queryKey: ["find-or-ask-discoveries", city || "all"],
    queryFn: async () => {
      let query = db.from("view_public_find_or_ask_discoveries").select("*").order("created_at", { ascending: false }).limit(40);
      if (city) query = query.ilike("city", city);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FindOrAskDiscoveryRow[];
    },
  });
}

export function useFindOrAskOutcomes(discoveryId?: string | null) {
  return useQuery({
    queryKey: ["find-or-ask-outcomes", discoveryId],
    enabled: Boolean(discoveryId),
    queryFn: async () => {
      const { data, error } = await db
        .from("discovery_outcomes")
        .select("*")
        .eq("discovery_id", discoveryId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FindOrAskOutcomeRow[];
    },
  });
}

export function useProposeFindOrAskOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      discoveryId: string;
      responderUserId: string;
      stakeholderRole: "merchant" | "host" | "creator" | "brand";
      actionKind: string;
      canonicalObjectType: "place" | "offer" | "moment" | "content" | "opportunity" | "proof" | "receipt";
      canonicalObjectId: string;
      canonicalObjectUrl?: string;
      sourceLabel?: string;
      sourceUrl?: string;
      freshnessAt?: string;
    }) => {
      const { data, error } = await db.from("discovery_outcomes").insert({
        discovery_id: input.discoveryId,
        responder_user_id: input.responderUserId,
        stakeholder_role: input.stakeholderRole,
        action_kind: input.actionKind,
        canonical_object_type: input.canonicalObjectType,
        canonical_object_id: input.canonicalObjectId.trim(),
        canonical_object_url: input.canonicalObjectUrl?.trim() || null,
        source_label: input.sourceLabel?.trim() || null,
        source_url: input.sourceUrl?.trim() || null,
        freshness_at: input.freshnessAt || new Date().toISOString(),
        verification_status: "pending",
        moderation_status: "pending",
      }).select("*").single();
      if (error) throw error;
      return data as FindOrAskOutcomeRow;
    },
    onSuccess: (_, input) => queryClient.invalidateQueries({ queryKey: ["find-or-ask-outcomes", input.discoveryId] }),
  });
}

export function useCreateFindOrAskDiscovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      query: string;
      kind: FindOrAskPostKind;
      city?: string;
      language: string;
      source: string;
      recovery: "ask_people" | "request_something";
      authorName: string;
    }) => {
      const { data, error } = await db.rpc("create_find_or_ask_discovery", {
        p_query: input.query,
        p_kind: input.kind,
        p_city: input.city || null,
        p_language: input.language,
        p_source: input.source,
        p_recovery: input.recovery,
        p_author_name: input.authorName,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.discovery_id) throw new Error("No Discovery was returned");
      return row as { discovery_id: string; duplicate: boolean; semantic_kind: FindOrAskPostKind; status: string };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["find-or-ask-discoveries"] }),
  });
}

export function useSupportFindOrAskDemand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (discoveryId: string) => {
      const { data, error } = await db.rpc("support_find_or_ask_demand", { p_discovery_id: discoveryId });
      if (error) throw error;
      return Number(data || 0);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["find-or-ask-discoveries"] }),
  });
}
