import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DISCOVERY_POLLS } from "@/data/discoveriesData";
import {
  buildDiscoveryDemandInbox,
  demandPollFromDiscovery,
  type DemandInbox,
  type DemandPoll,
  type NamedIntent,
} from "@/lib/discovery-demand";
import { useCityDiscoveryPolls } from "@/hooks/useCityDiscoveryPolls";
import { useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";

const ANON_KEY = "promorang.discover.anon";

export function readDiscoverAnonId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(ANON_KEY, next);
  return next;
}

export async function recordDiscoveryNamedIntent(city: string, query: string): Promise<boolean> {
  const { error } = await (supabase as any).rpc("record_discovery_named_intent", {
    p_city: city,
    p_query: query,
    p_anonymous_id: readDiscoverAnonId() || null,
  });
  return !error;
}

function mergeDemandPolls(input: DemandPoll[][]): DemandPoll[] {
  const seen = new Set<string>();
  const merged: DemandPoll[] = [];
  for (const group of input) {
    for (const poll of group) {
      if (seen.has(poll.id)) continue;
      seen.add(poll.id);
      merged.push(poll);
    }
  }
  return merged;
}

export function useDiscoveryDemand(cityName: string, countrySlug = "jamaica", citySlug?: string) {
  const queryClient = useQueryClient();
  const cityPolls = useCityDiscoveryPolls(countrySlug, citySlug, 12);
  const listingPolls = useListingDiscoveryPolls(8);

  const intentsQuery = useQuery({
    queryKey: ["discovery-named-intents", cityName],
    queryFn: async (): Promise<NamedIntent[]> => {
      const { data, error } = await (supabase as any).rpc("list_discovery_named_intent_counts", {
        p_city: cityName,
      });
      if (error) return [];
      return ((data || []) as Array<{ query_raw: string; ask_count: number; last_asked_at?: string }>).map((row) => ({
        query: row.query_raw,
        count: row.ask_count,
        lastAskedAt: row.last_asked_at,
      }));
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
