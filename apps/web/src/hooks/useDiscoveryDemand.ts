import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildDiscoveryDemandInbox,
  demandPollFromDiscovery,
  mergeNamedIntents,
  normalizeIntentKey,
  type DemandInbox,
  type DemandPoll,
  type NamedIntent,
} from "@/lib/discovery-demand";
import { mergeUnlockTallies, readLocalCardUnlocks, tallyCardUnlocks, type UnlockTally } from "@/lib/discovery-card";
import { intentWords, mergeDiscoveryPolls } from "@/lib/discovery-path";
import { useCityDiscoveryPolls } from "@/hooks/useCityDiscoveryPolls";

const ANON_KEY = "promorang.discover.anon";
const LOCAL_INTENTS_KEY = "promorang.discover.named-intents";

export function readDiscoverAnonId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(ANON_KEY, next);
  return next;
}

type StoredLocalIntent = NamedIntent & { city: string };

function readLocalIntents(city: string): NamedIntent[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_INTENTS_KEY) || "[]") as StoredLocalIntent[];
    return parsed
      .filter((row) => row.city === city && intentWords(row.query).length)
      .map((row) => ({ query: row.query, count: row.count || 1, lastAskedAt: row.lastAskedAt }));
  } catch {
    return [];
  }
}

function writeLocalIntent(city: string, query: string) {
  if (typeof window === "undefined") return;
  const nextQuery = query.trim();
  if (!intentWords(nextQuery).length) return;
  const key = normalizeIntentKey(nextQuery);
  const now = new Date().toISOString();
  let rows: StoredLocalIntent[] = [];
  try {
    rows = JSON.parse(window.localStorage.getItem(LOCAL_INTENTS_KEY) || "[]") as StoredLocalIntent[];
  } catch {
    rows = [];
  }
  const match = rows.find((row) => row.city === city && normalizeIntentKey(row.query) === key);
  if (match) {
    match.count += 1;
    match.lastAskedAt = now;
  } else {
    rows.push({ city, query: nextQuery, count: 1, lastAskedAt: now });
  }
  window.localStorage.setItem(LOCAL_INTENTS_KEY, JSON.stringify(rows.slice(-80)));
}

export async function recordDiscoveryNamedIntent(city: string, query: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any).rpc("record_discovery_named_intent", {
      p_city: city,
      p_query: query,
      p_anonymous_id: readDiscoverAnonId() || null,
    });
    if (error) return false;
    writeLocalIntent(city, query);
    return true;
  } catch {
    return false;
  }
}

function mergeDemandPolls(input: DemandPoll[][]): DemandPoll[] {
  return mergeDiscoveryPolls(...input);
}

export function useDiscoveryDemand(cityName: string, countrySlug = "jamaica", citySlug?: string, sceneId?: string) {
  const queryClient = useQueryClient();
  const cityPolls = useCityDiscoveryPolls(countrySlug, citySlug, 12);
  const scenePolls = useQuery({
    queryKey: ["scene-demand-polls", sceneId],
    enabled: Boolean(sceneId),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("discovery_questions")
        .select("id,scene_id,question,category,total_votes,threshold_for_moment,semantic_kind,discovery_options(id,option_text,votes_count)")
        .eq("scene_id", sceneId)
        .eq("semantic_kind", "demand")
        .order("total_votes", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data || []).map((row: any) => demandPollFromDiscovery({
        id: row.id,
        question: row.question,
        category: row.category,
        totalVotes: row.total_votes,
        thresholdForMoment: row.threshold_for_moment,
        options: (row.discovery_options || []).map((option: any) => ({ id: option.id, text: option.option_text, votes: option.votes_count || 0 })),
      }));
    },
  });

  const intentsQuery = useQuery({
    queryKey: ["discovery-named-intents", cityName],
    initialData: () => import.meta.env.DEV ? readLocalIntents(cityName) : undefined,
    queryFn: async (): Promise<NamedIntent[]> => {
      const local = import.meta.env.DEV ? readLocalIntents(cityName) : [];
      const { data: sessionData } = await supabase.auth.getSession();
      const rpcName = sessionData.session
        ? "list_discovery_named_intent_counts"
        : "list_public_discovery_named_intent_counts";
      const { data, error } = await (supabase as any).rpc(rpcName, {
        p_city: cityName,
      });
      if (error) {
        if (import.meta.env.DEV) return local;
        throw error;
      }
      const remote = ((data || []) as Array<{ query_raw: string; ask_count: number; last_asked_at?: string }>).map((row) => ({
        query: row.query_raw,
        count: row.ask_count,
        lastAskedAt: row.last_asked_at,
      }));
      return import.meta.env.DEV ? mergeNamedIntents(remote, local) : remote;
    },
  });

  const polls = useMemo(
    () =>
      mergeDemandPolls([
        ...(sceneId ? [scenePolls.data || []] : []),
        ...(sceneId ? [] : [(cityPolls.data || []).map((poll) =>
          demandPollFromDiscovery({
            id: poll.id,
            question: poll.question,
            category: poll.category,
            totalVotes: poll.total_votes,
            thresholdForMoment: poll.threshold_for_moment,
            options: poll.options,
            userVotedOptionId: poll.user_voted_option_id || undefined,
          }),
        )]),
      ]),
    [cityPolls.data, scenePolls.data, sceneId],
  );

  const responsesQuery = useQuery({
    queryKey: ["discovery-demand-responses", polls.map((poll) => poll.id).join(",")],
    enabled: polls.length > 0,
    queryFn: async () => {
      const ids = polls.map((poll) => poll.id);
      const { data, error } = await (supabase as any)
        .from("demand_activation_responses")
        .select("id,discovery_id,proposal_id,response_summary,route,published_at")
        .in("discovery_id", ids)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const responsesByDemand = useMemo(() => {
    const byDemand = new Map<string, any>();
    for (const response of responsesQuery.data || []) {
      if (!byDemand.has(response.discovery_id)) byDemand.set(response.discovery_id, response);
    }
    return byDemand;
  }, [responsesQuery.data]);

  const unlocksQuery = useQuery({
    queryKey: ["discovery-card-unlocks", cityName],
    initialData: () => import.meta.env.DEV
      ? tallyCardUnlocks(readLocalCardUnlocks().filter((row) => row.city === cityName))
      : undefined,
    queryFn: async (): Promise<UnlockTally[]> => {
      const local = import.meta.env.DEV
        ? tallyCardUnlocks(readLocalCardUnlocks().filter((row) => !row.city || row.city === cityName))
        : [];
      const { data, error } = await (supabase as any).rpc("list_discovery_card_unlock_counts", {
        p_city: cityName,
      });
      if (error) {
        if (import.meta.env.DEV) return local;
        throw error;
      }
      const remote = ((data || []) as Array<{ poll_id: string; on_cards: number; used: number }>).map((row) => ({
        pollId: row.poll_id,
        onCards: row.on_cards || 0,
        used: row.used || 0,
      }));
      return import.meta.env.DEV ? mergeUnlockTallies(remote, local) : remote;
    },
  });

  const inbox: DemandInbox = useMemo(
    () =>
      buildDiscoveryDemandInbox({
        polls,
        intents: intentsQuery.data || [],
        unlocks: unlocksQuery.data || [],
        city: cityName,
      }),
    [polls, intentsQuery.data, unlocksQuery.data, cityName],
  );

  const record = useMutation({
    mutationFn: (query: string) => recordDiscoveryNamedIntent(cityName, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery-named-intents", cityName] });
    },
  });

  return {
    inbox,
    polls,
    isLoading: cityPolls.isLoading || scenePolls.isLoading || intentsQuery.isLoading || unlocksQuery.isLoading || responsesQuery.isLoading,
    responsesByDemand,
    recordAsk: record.mutateAsync,
  };
}
