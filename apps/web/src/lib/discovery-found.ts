import { makeRedemptionCode, type DiscoveryCardUnlock } from "@/lib/discovery-card";
import { intentWords } from "@/lib/discovery-path";
import type { DemandRole } from "@/lib/discovery-demand";

export const FOUND_LISTINGS_KEY = "promorang.discover.found-listings";

export const FOUND_SEED_IDS = {
  hike: "11111111-1111-4111-8111-111111111111",
  church: "22222222-2222-4222-8222-222222222222",
} as const;

export const FOUND_ID_ALIASES: Record<string, string> = {
  "found:hiking-kids": FOUND_SEED_IDS.hike,
  "found:sunday-church": FOUND_SEED_IDS.church,
};

export function canonicalFoundId(id: string): string {
  return FOUND_ID_ALIASES[id] || id;
}

export type FoundKind = "place" | "moment";
export type FoundStatus = "unclaimed" | "claimed";
export type FoundKeep = "workspace" | "slip";

export type FoundListing = {
  id: string;
  city: string;
  kind: FoundKind;
  title: string;
  words: string;
  whereHint?: string;
  perkToFinder: string;
  status: FoundStatus;
  namedCount: number;
  finderAnonId?: string;
  finderUserId?: string;
  claimantUserId?: string;
  claimedAt?: string;
  createdAt: string;
};

export type FoundClaimant = {
  userId?: string | null;
  anonId?: string | null;
};

export type FoundClaimResult = {
  listing: FoundListing;
  slip: DiscoveryCardUnlock | null;
  keep: FoundKeep;
  alreadyClaimed: boolean;
};

export function normalizeFoundKey(value: string): string {
  return intentWords(value).slice().sort().join(" ");
}

export function defaultFinderPerk(kind: FoundKind): string {
  return kind === "place"
    ? "First table when the house claims this"
    : "A door pass when a host claims this";
}

export function listingSearchText(listing: Pick<FoundListing, "title" | "words" | "whereHint">): string {
  return `${listing.title} ${listing.words} ${listing.whereHint || ""}`.toLowerCase();
}

export function foundListingHits(
  listing: Pick<FoundListing, "title" | "words" | "whereHint">,
  query?: string | null,
): number {
  const words = intentWords(query);
  if (!words.length) return 0;
  const hay = listingSearchText(listing);
  return words.filter((word) => hay.includes(word)).length;
}

export function youFoundListing(listing: FoundListing, who: FoundClaimant): boolean {
  if (listing.finderUserId && who.userId && listing.finderUserId === who.userId) return true;
  if (listing.finderAnonId && who.anonId && listing.finderAnonId === who.anonId) return true;
  return false;
}

export function isProspectClaim(listing: FoundListing, claimant: FoundClaimant): boolean {
  return youFoundListing(listing, claimant);
}

export function foundUnlockPollId(listingId: string): string {
  return listingId.startsWith("found:") ? listingId : `found:${listingId}`;
}

export function unlockFromFoundListing(listing: FoundListing): DiscoveryCardUnlock {
  return {
    id: `unlock:${foundUnlockPollId(listing.id)}`,
    pollId: foundUnlockPollId(listing.id),
    pollQuestion: listing.title,
    perkTitle: listing.perkToFinder,
    city: listing.city,
    query: listing.words,
    redemptionCode: makeRedemptionCode(listing.id),
    status: "claimed",
    createdAt: new Date().toISOString(),
    source: "finder",
    listingId: listing.id,
  };
}

export function draftFoundListing(input: {
  city: string;
  kind: FoundKind;
  title: string;
  words?: string;
  whereHint?: string;
  perkToFinder?: string;
  finderAnonId?: string;
  finderUserId?: string;
  existing?: FoundListing | null;
}): FoundListing {
  const title = input.title.trim();
  const words = (input.words || title).trim();
  if (input.existing && normalizeFoundKey(input.existing.words) === normalizeFoundKey(words)) {
    return {
      ...input.existing,
      namedCount: input.existing.namedCount + 1,
    };
  }
  return {
    id: `found:${crypto.randomUUID()}`,
    city: input.city,
    kind: input.kind,
    title,
    words,
    whereHint: (input.whereHint || "").trim() || undefined,
    perkToFinder: (input.perkToFinder || "").trim() || defaultFinderPerk(input.kind),
    status: "unclaimed",
    namedCount: 1,
    finderAnonId: input.finderAnonId || undefined,
    finderUserId: input.finderUserId || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function claimFoundListing(listing: FoundListing, claimant: FoundClaimant): FoundClaimResult {
  if (listing.status === "claimed") {
    return { listing, slip: null, keep: "workspace", alreadyClaimed: true };
  }

  const claimed: FoundListing = {
    ...listing,
    status: "claimed",
    claimantUserId: claimant.userId || undefined,
    claimedAt: new Date().toISOString(),
  };

  if (isProspectClaim(listing, claimant)) {
    return { listing: claimed, slip: null, keep: "workspace", alreadyClaimed: false };
  }

  return {
    listing: claimed,
    slip: unlockFromFoundListing(listing),
    keep: "slip",
    alreadyClaimed: false,
  };
}

export function mergeFoundListings(...groups: FoundListing[][]): FoundListing[] {
  const byKey = new Map<string, FoundListing>();
  for (const group of groups) {
    for (const listing of group) {
      const id = canonicalFoundId(listing.id);
      const row = { ...listing, id };
      const key = `${row.city}::${id}`;
      const wordsKey = `${row.city}::${normalizeFoundKey(row.words || row.title)}`;
      const existing = byKey.get(id) || byKey.get(key) || byKey.get(wordsKey);
      if (!existing) {
        byKey.set(id, row);
        byKey.set(wordsKey, row);
        continue;
      }
      const next: FoundListing = {
        ...existing,
        ...row,
        id: existing.status === "claimed" ? canonicalFoundId(existing.id) : id,
        status: existing.status === "claimed" || listing.status === "claimed" ? "claimed" : "unclaimed",
        namedCount: Math.max(existing.namedCount || 0, listing.namedCount || 0),
        perkToFinder: existing.perkToFinder || listing.perkToFinder,
        claimedAt: existing.claimedAt || listing.claimedAt,
        claimantUserId: existing.claimantUserId || listing.claimantUserId,
      };
      byKey.set(next.id, next);
      byKey.set(wordsKey, next);
    }
  }
  const unique = new Map<string, FoundListing>();
  for (const listing of byKey.values()) unique.set(listing.id, listing);
  return [...unique.values()].sort((a, b) => {
    if (a.status !== b.status) return a.status === "unclaimed" ? -1 : 1;
    return (b.namedCount || 0) - (a.namedCount || 0) || a.title.localeCompare(b.title);
  });
}

export const OPENING_FOUND_LISTINGS: FoundListing[] = [
  {
    id: FOUND_SEED_IDS.hike,
    city: "Kingston & St. Andrew",
    kind: "moment",
    title: "Hiking with kids",
    words: "hiking with kids",
    whereHint: "Blue Mountains",
    perkToFinder: "First family table when a host claims this",
    status: "unclaimed",
    namedCount: 3,
    finderAnonId: "seed:hiking-kids",
    createdAt: "2026-09-05T12:00:00.000Z",
  },
  {
    id: FOUND_SEED_IDS.church,
    city: "Kingston & St. Andrew",
    kind: "place",
    title: "Sunday church",
    words: "sunday church",
    whereHint: "Kingston",
    perkToFinder: "A seat when the house opens the door",
    status: "unclaimed",
    namedCount: 2,
    finderAnonId: "seed:sunday-church",
    createdAt: "2026-09-05T12:00:00.000Z",
  },
];

export function seededFoundListings(_city?: string): FoundListing[] {
  return OPENING_FOUND_LISTINGS;
}

export function foundWorkspacePath(listing: FoundListing, role: DemandRole): string {
  const query = new URLSearchParams({
    found: listing.id,
    title: listing.title,
  });
  if (listing.whereHint) query.set("where", listing.whereHint);
  if (role === "merchant" || role === "brand" || listing.kind === "place") {
    return `/give?${query.toString()}`;
  }
  return `/create/moment?${query.toString()}`;
}

export function readLocalFoundListings(city?: string): FoundListing[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FOUND_LISTINGS_KEY) || "[]") as FoundListing[];
    const rows = (Array.isArray(parsed) ? parsed : [])
      .filter((row) => row?.id && row?.title)
      .map((row) => ({ ...row, id: canonicalFoundId(row.id) }));
    return city ? rows.filter((row) => !row.city || row.city === city) : rows;
  } catch {
    return [];
  }
}

export function writeLocalFoundListing(listing: FoundListing): FoundListing {
  if (typeof window === "undefined") return listing;
  const rows = readLocalFoundListings();
  const sameWords = rows.find(
    (row) =>
      row.city === listing.city &&
      normalizeFoundKey(row.words || row.title) === normalizeFoundKey(listing.words || listing.title),
  );
  const next = sameWords && sameWords.id !== listing.id
    ? { ...sameWords, namedCount: Math.max(sameWords.namedCount, listing.namedCount) + (listing.status === "unclaimed" ? 1 : 0) }
    : listing;
  const others = rows.filter((row) => row.id !== next.id && row.id !== sameWords?.id);
  window.localStorage.setItem(FOUND_LISTINGS_KEY, JSON.stringify([next, ...others].slice(0, 40)));
  return next;
}

export function replaceLocalFoundListing(listing: FoundListing): FoundListing {
  if (typeof window === "undefined") return listing;
  const rows = readLocalFoundListings().filter((row) => row.id !== listing.id);
  window.localStorage.setItem(FOUND_LISTINGS_KEY, JSON.stringify([listing, ...rows].slice(0, 40)));
  return listing;
}
