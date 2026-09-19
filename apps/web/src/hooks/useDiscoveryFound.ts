import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { peopleExperienceApi } from "@/services/peopleExperience";
import { writeLocalCardUnlock } from "@/lib/discovery-card";
import {
  canonicalFoundId,
  foundUnlockPollId,
  mergeFoundListings,
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

function cacheRecordedListing(listing: FoundListing): FoundListing {
  return replaceLocalFoundListing(listing);
}

export async function putUpFoundListing(input: {
  city: string;
  kind: FoundKind;
  title: string;
  words?: string;
  whereHint?: string;
  perkToFinder?: string;
}): Promise<FoundListing> {
  const anonId = readDiscoverAnonId() || undefined;

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
      const recorded = mapRemoteListing(remote || {}, input.city);
      if (recorded) return cacheRecordedListing(recorded);
    } catch {
      // Fall through to the durable Supabase RPC.
    }
  }

  const { data, error } = await (supabase as any).rpc("put_up_found_listing", {
    p_city: input.city,
    p_kind: input.kind,
    p_title: input.title,
    p_words: input.words || input.title,
    p_where_hint: input.whereHint || null,
    p_perk_to_finder: input.perkToFinder || null,
    p_anonymous_id: anonId || null,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.listing_id) throw new Error("Could not put that request up yet.");

  return cacheRecordedListing({
    id: row.listing_id,
    city: input.city,
    kind: row.kind === "place" ? "place" : "moment",
    title: row.title || input.title,
    words: row.words || input.words || input.title,
    whereHint: row.where_hint || input.whereHint || undefined,
    perkToFinder: row.perk_to_finder || input.perkToFinder || "",
    status: row.status === "claimed" ? "claimed" : "unclaimed",
    namedCount: Number(row.named_count || 1),
    finderAnonId: anonId,
    createdAt: new Date().toISOString(),
  });
}

export async function claimFoundListingNow(
  listing: FoundListing,
  claimantUserId?: string | null,
): Promise<FoundClaimResult> {
  const target = { ...listing, id: canonicalFoundId(listing.id) };
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id || claimantUserId;
  if (!userId) throw new Error("Sign in to claim this.");

  if (sessionData.session?.access_token) {
    try {
      const remote = await peopleExperienceApi.claimFound(target.id);
      if (remote?.id) {
        const next = cacheRecordedListing({
          ...target,
          id: remote.id,
          city: remote.city || target.city,
          kind: remote.kind === "place" ? "place" : target.kind,
          title: remote.title || target.title,
          words: remote.words || target.words,
          whereHint: remote.whereHint || target.whereHint,
          perkToFinder: remote.perkToFinder || target.perkToFinder,
          status: "claimed",
          namedCount: Number(remote.namedCount || target.namedCount || 1),
          claimantUserId: userId,
          claimedAt: remote.claimedAt || new Date().toISOString(),
        });
        return {
          listing: next,
          slip: null,
          keep: remote.keep === "slip" ? "slip" : "workspace",
          alreadyClaimed: Boolean(remote.alreadyClaimed),
        };
      }
    } catch {
      // Fall through to the durable Supabase RPC.
    }
  }

  const { data, error } = await (supabase as any).rpc("claim_found_listing", {
    p_listing_id: target.id,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.listing_id || row.status !== "claimed") {
    throw new Error("Could not claim that request yet.");
  }

  const next = cacheRecordedListing({
    ...target,
    id: row.listing_id,
    title: row.title || target.title,
    kind: row.kind === "place" ? "place" : target.kind,
    perkToFinder: row.perk_to_finder || target.perkToFinder,
    status: "claimed",
    claimantUserId: userId,
    claimedAt: new Date().toISOString(),
  });

  let slip = null;
  if (row.keep === "slip" && row.slip_code && target.finderAnonId === readDiscoverAnonId()) {
    slip = writeLocalCardUnlock({
      id: `unlock:${foundUnlockPollId(next.id)}`,
      pollId: foundUnlockPollId(next.id),
      pollQuestion: next.title,
      perkTitle: next.perkToFinder,
      city: next.city,
      query: next.words,
      redemptionCode: row.slip_code,
      status: "claimed",
      createdAt: new Date().toISOString(),
      source: "finder",
      listingId: next.id,
    });
  }

  return {
    listing: next,
    slip,
    keep: row.keep === "slip" ? "slip" : "workspace",
    alreadyClaimed: Boolean(row.already_claimed),
  };
}

export function useDiscoveryFound(cityName: string) {
  const queryClient = useQueryClient();

  const listingsQuery = useQuery({
    queryKey: ["found-listings", cityName],
    initialData: () => import.meta.env.DEV
      ? mergeFoundListings(seededFoundListings(cityName), readLocalFoundListings(cityName))
      : undefined,
    queryFn: async (): Promise<FoundListing[]> => {
      const preview = import.meta.env.DEV
        ? mergeFoundListings(seededFoundListings(cityName), readLocalFoundListings(cityName))
        : [];

      const { data, error } = await (supabase as any).rpc("list_found_listings", {
        p_city: cityName,
        p_anonymous_id: readDiscoverAnonId() || null,
      });
      if (error) {
        if (import.meta.env.DEV) return preview;
        throw error;
      }

      const remote = ((data || []) as Record<string, any>[])
        .map((row) => mapRemoteListing(row, cityName))
        .filter((row): row is FoundListing => Boolean(row));

      return import.meta.env.DEV ? mergeFoundListings(remote, preview) : remote;
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
    error: listingsQuery.error,
    putUp: putUp.mutateAsync,
    claim: claim.mutateAsync,
    puttingUp: putUp.isPending,
    claiming: claim.isPending,
  };
}
