import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DISCOVERY_POLLS } from "@/data/discoveriesData";
import {
  buildDiscoveryDemandInbox,
  demandPollFromDiscovery,
  mergeNamedIntents,
  normalizeIntentKey,
  type DemandInbox,
  type DemandPoll,
  type NamedIntent,
} from "@/lib/discovery-demand";
import { intentWords, mergeDiscoveryPolls } from "@/lib/discovery-path";
import { useCityDiscoveryPolls } from "@/hooks/useCityDiscoveryPolls";
import { useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";

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
  writeLocalIntent(city, query);
  try {
    const { error } = await (supabase as any).rpc("record_discovery_named_intent", {
      p_city: city,
      p_query: query,
      p_anonymous_id: readDiscoverAnonId() || null,
    });
    return !error;
  } catch {
    return false;
  }
}

function mergeDemandPolls(input: DemandPoll[][]): DemandPoll[] {
  return mergeDiscoveryPolls(...input);
}

export function useDiscoveryDemand(cityName: string, countrySlug = "jamaica", citySlug?: string) {
  const queryClient = useQueryClient();
  const cityPolls = useCityDiscoveryPolls(countrySlug, citySlug, 12);
  const listingPolls = useListingDiscoveryPolls(8);

  const intentsQuery = useQuery({
    queryKey: ["discovery-named-intents", cityName],
    initialData: () => readLocalIntents(cityName),
    queryFn: async (): Promise<NamedIntent[]> => {
      const local = readLocalIntents(cityName);
      try {
        const { data, error } = await (supabase as any).rpc("list_discovery_named_intent_counts", {
          p_city: cityName,
        });
        if (error) return local;
        const remote = ((data || []) as Array<{ query_raw: string; ask_count: number; last_asked_at?: string }>).map((row) => ({
          query: row.query_raw,
          count: row.ask_count,
          lastAskedAt: row.last_asked_at,
        }));
        return mergeNamedIntents(remote, local);
      } catch {
        return local;
      }
    },
  });

  const polls = useMemo(
    () =>
      mergeDemandPolls([
        (listingPolls.data || []).map(demandPollFromDiscovery),
        (cityPolls.data || []).map((poll) =>
          demandPollFromDiscovery({
            id: poll.id,
            question: poll.question,
            category: poll.category,
            totalVotes: poll.total_votes,
            thresholdForMoment: poll.threshold_for_moment,
            options: poll.options,
          }),
        ),
        DISCOVERY_POLLS.map(demandPollFromDiscovery),
      ]),
    [listingPolls.data, cityPolls.data],
  );

  const inbox: DemandInbox = useMemo(
    () =>
      buildDiscoveryDemandInbox({
        polls,
        intents: intentsQuery.data || [],
        city: cityName,
      }),
    [polls, intentsQuery.data, cityName],
  );

  const record = useMutation({
    mutationFn: (query: string) => recordDiscoveryNamedIntent(cityName, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovery-named-intents", cityName] });
    },
  });

  return {
    inbox,
    isLoading: cityPolls.isLoading || listingPolls.isLoading || intentsQuery.isLoading,
    recordAsk: record.mutateAsync,
  };
}
