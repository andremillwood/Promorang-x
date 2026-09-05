import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { peopleExperienceApi } from "@/services/peopleExperience";
import { writeLocalCardUnlock } from "@/lib/discovery-card";
import {
  claimFoundListing,
  draftFoundListing,
  mergeFoundListings,
  normalizeFoundKey,
  readLocalFoundListings,
  replaceLocalFoundListing,
  seededFoundListings,
  writeLocalFoundListing,
  type FoundClaimResult,
  type FoundKind,
  type FoundListing,
} from "@/lib/discovery-found";
import { readDiscoverAnonId } from "@/hooks/useDiscoveryDemand";

function mapRemoteListing(row: Record<string, any>, city: string): FoundListing | null {
  const id = String(row.listing_id || row.id || "");
  const title = String(row.title || "").trim();
  if (!id || !title) return null;
  return {
    id,
    city: String(row.city || city),
    kind: row.kind === "place" ? "place" : "moment",
    title,
    words: String(row.words || title),
    whereHint: row.where_hint || row.whereHint || undefined,
    perkToFinder: String(row.perk_to_finder || row.perkToFinder || ""),
    status: row.status === "claimed" ? "claimed" : "unclaimed",
    namedCount: Number(row.named_count || row.namedCount || 1),
    finderAnonId: row.you_found || row.youFound ? readDiscoverAnonId() : undefined,
    claimedAt: row.claimed_at || row.claimedAt || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export async function putUpFoundListing(input: {
  city: string;
  kind: FoundKind;
  title: string;
  words?: string;
  whereHint?: string;
  perkToFinder?: string;
}): Promise<FoundListing> {
  const local = writeLocalFoundListing(
    draftFoundListing({
      ...input,
      finderAnonId: readDiscoverAnonId() || undefined,
      existing: readLocalFoundListings(input.city).find(
        (row) =>
          row.status === "unclaimed" &&
          normalizeFoundKey(row.words || row.title) === normalizeFoundKey(input.words || input.title),
      ) || null,
    }),
  );

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      try {
        const remote = await peopleExperienceApi.putUpFound({
          city: input.city,
          kind: input.kind,
          title: input.title,
          words: input.words,
          whereHint: input.whereHint,
          perkToFinder: input.perkToFinder,
        });
        if (remote?.id) {
          return writeLocalFoundListing({
            ...local,
            id: remote.id,
            perkToFinder: remote.perkToFinder || local.perkToFinder,
            namedCount: remote.namedCount || local.namedCount,
          });
        }
      } catch {
        // RPC still records the find when the API is down.
      }
    }

    const { data, error } = await (supabase as any).rpc("put_up_found_listing", {
      p_city: input.city,
      p_kind: input.kind,
      p_title: input.title,
      p_words: input.words || input.title,
      p_where_hint: input.whereHint || null,
      p_perk_to_finder: input.perkToFinder || null,
      p_anonymous_id: readDiscoverAnonId() || null,
    });
    if (!error && Array.isArray(data) && data[0]?.listing_id) {
      return writeLocalFoundListing({
        ...local,
        id: data[0].listing_id,
        perkToFinder: data[0].perk_to_finder || local.perkToFinder,
        namedCount: data[0].named_count || local.namedCount,
        status: data[0].status === "claimed" ? "claimed" : "unclaimed",
      });
    }
  } catch {
    // Local listing is enough for this browser.
  }

  return local;
}

export async function claimFoundListingNow(
  listing: FoundListing,
  claimantUserId?: string | null,
): Promise<FoundClaimResult> {
  const local = claimFoundListing(listing, {
    userId: claimantUserId,
    anonId: readDiscoverAnonId(),
  });
  replaceLocalFoundListing(local.listing);
  if (local.slip && local.keep === "slip" && listing.finderAnonId === readDiscoverAnonId()) {
    writeLocalCardUnlock(local.slip);
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id || claimantUserId;
    if (sessionData.session?.access_token) {
      try {
        const remote = await peopleExperienceApi.claimFound(listing.id);
        if (remote?.id) {
          const next = replaceLocalFoundListing({
            ...local.listing,
            id: remote.id || local.listing.id,
            status: "claimed",
            claimantUserId: userId || local.listing.claimantUserId,
          });
          return { ...local, listing: next };
        }
      } catch {
        // RPC still claims when the API is down.
      }

      const { data, error } = await (supabase as any).rpc("claim_found_listing", {
        p_listing_id: listing.id,
      });
      if (!error && Array.isArray(data) && data[0]?.listing_id) {
        const next = replaceLocalFoundListing({
          ...local.listing,
          id: data[0].listing_id,
          status: "claimed",
          claimantUserId: userId || local.listing.claimantUserId,
        });
        return { ...local, listing: next, keep: data[0].keep === "slip" ? "slip" : local.keep };
      }
    }
  } catch {
    // Local claim is enough for preview.
  }

  return local;
}

export function useDiscoveryFound(cityName: string) {
  const queryClient = useQueryClient();

  const listingsQuery = useQuery({
    queryKey: ["found-listings", cityName],
    initialData: () => mergeFoundListings(seededFoundListings(cityName), readLocalFoundListings(cityName)),
    queryFn: async (): Promise<FoundListing[]> => {
      const seeded = seededFoundListings(cityName);
      const local = readLocalFoundListings(cityName);
      try {
        const { data, error } = await (supabase as any).rpc("list_found_listings", {
          p_city: cityName,
          p_anonymous_id: readDiscoverAnonId() || null,
        });
        if (error) return mergeFoundListings(seeded, local);
        const remote = ((data || []) as Record<string, any>[])
          .map((row) => mapRemoteListing(row, cityName))
          .filter((row): row is FoundListing => Boolean(row));
        return mergeFoundListings(seeded, remote, local);
      } catch {
        return mergeFoundListings(seeded, local);
      }
    },
  });

  const putUp = useMutation({
    mutationFn: (input: {
      kind: FoundKind;
      title: string;
      words?: string;
      whereHint?: string;
      perkToFinder?: string;
    }) => putUpFoundListing({ city: cityName, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["found-listings", cityName] });
      queryClient.invalidateQueries({ queryKey: ["discovery-named-intents", cityName] });
    },
  });

  const claim = useMutation({
    mutationFn: async (listing: FoundListing) => {
      const { data } = await supabase.auth.getSession();
      return claimFoundListingNow(listing, data.session?.user?.id || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["found-listings", cityName] });
      queryClient.invalidateQueries({ queryKey: ["experience-card"] });
      queryClient.invalidateQueries({ queryKey: ["discovery-card-unlocks"] });
    },
  });

  const listings = listingsQuery.data || [];
  const waiting = useMemo(() => listings.filter((row) => row.status === "unclaimed"), [listings]);
  const claimed = useMemo(() => listings.filter((row) => row.status === "claimed"), [listings]);

  return {
    listings,
    waiting,
    claimed,
    isLoading: listingsQuery.isLoading,
    putUp: putUp.mutateAsync,
    claim: claim.mutateAsync,
    puttingUp: putUp.isPending,
    claiming: claim.isPending,
  };
}
