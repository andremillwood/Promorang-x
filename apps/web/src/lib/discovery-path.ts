export type DiscoverLensId = "eat" | "go_out" | "hang" | "try";

export type PathablePoll = {
  id: string;
  question: string;
  category?: string;
  categorySlug?: string;
  description?: string;
  targetUnlockPerk?: string;
  tags?: string[];
  totalVotes?: number;
  thresholdForMoment?: number;
};

export type PathWhyKind = "close" | "taste" | "query" | "city";

export type PathWhy = {
  kind: PathWhyKind;
  lens: DiscoverLensId | null;
  query: string;
  city: string;
  votesRemaining: number;
  perk: string;
};

export type DiscoveryPathItem<T extends PathablePoll = PathablePoll> = {
  poll: T;
  score: number;
  why: PathWhy;
};

export const DISCOVER_LENS_IDS: DiscoverLensId[] = ["eat", "go_out", "hang", "try"];

const LENS_KEYWORDS: Record<DiscoverLensId, string[]> = {
  eat: [
    "food",
    "culinary",
    "taste",
    "jerk",
    "pasta",
    "cream",
    "cook",
    "whip",
    "restaurant",
    "baker",
    "dessert",
    "grocer",
    "foodie",
    "platter",
    "tasting",
  ],
  go_out: [
    "nightlife",
    "music",
    "concert",
    "after dark",
    "after-dark",
    "club",
    "beach",
    "dancehall",
    "reggae",
    "party",
    "bar",
    "cocktail",
    "live",
    "sound",
  ],
  hang: [
    "community",
    "workshop",
    "hangout",
    "gathering",
    "wednesday",
    "pottery",
    "lyme",
    "table",
    "people",
    "co-creation",
    "demand",
  ],
  try: [
    "price",
    "hidden",
    "unlock next",
    "new",
    "trail",
    "product",
    "quest",
    "drop",
    "gem",
    "fund",
  ],
};

const PREFERENCE_TO_LENS: Record<string, DiscoverLensId> = {
  food: "eat",
  nightlife: "go_out",
  music: "go_out",
  community: "hang",
  social: "hang",
  arts: "try",
  wellness: "try",
  fitness: "try",
  fashion: "try",
  outdoor: "try",
  workshop: "hang",
  networking: "hang",
};

const QUERY_STOP_WORDS = new Set(["a", "an", "and", "for", "in", "of", "on", "the", "to", "with"]);

export const DISCOVER_QUERY_STORAGE_KEY = "promorang.discover.query";
export const DISCOVER_VOTED_STORAGE_KEY = "promorang.discover.voted";
export const DISCOVER_SKIPPED_STORAGE_KEY = "promorang.discover.skipped";
export const DISCOVER_LENS_STORAGE_KEY = "promorang.discover.lens";

export function readStoredIdList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeStoredIdList(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readStoredDiscoverQuery(): string {
  if (typeof window === "undefined") return "";
  try {
    return (window.localStorage.getItem(DISCOVER_QUERY_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function writeStoredDiscoverQuery(query: string) {
  if (typeof window === "undefined") return;
  const next = query.trim();
  if (intentWords(next).length) {
    window.localStorage.setItem(DISCOVER_QUERY_STORAGE_KEY, next);
    return;
  }
  window.localStorage.removeItem(DISCOVER_QUERY_STORAGE_KEY);
}

export function discoveryHref(poll: { id: string; slug?: string }): string {
  return `/discoveries/${poll.slug || poll.id}`;
}

export function discoverPathHref(query?: string | null): string {
  const next = (query || "").trim();
  if (!intentWords(next).length) return "/discover?tab=discoveries";
  return `/discover?tab=discoveries&q=${encodeURIComponent(next)}`;
}

export function discoveryPollLocationHint(poll: PathablePoll): {
  title: string;
  description: string;
} {
  return {
    title: poll.question,
    description: [poll.description, poll.targetUnlockPerk, ...(poll.tags || [])].filter(Boolean).join(" "),
  };
}

export function mergeDiscoveryPolls<T extends { id: string }>(...groups: T[][]): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const group of groups) {
    for (const poll of group) {
      if (seen.has(poll.id)) continue;
      seen.add(poll.id);
      merged.push(poll);
    }
  }
  return merged;
}

export function isDiscoverLensId(value: string | null | undefined): value is DiscoverLensId {
  return DISCOVER_LENS_IDS.includes(value as DiscoverLensId);
}

export function pollSearchText(poll: PathablePoll): string {
  return [
    poll.question,
    poll.category,
    poll.categorySlug,
    poll.description,
    poll.targetUnlockPerk,
    ...(poll.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function inferLensesFromPreferences(categories: string[] | null | undefined): DiscoverLensId[] {
  const seen = new Set<DiscoverLensId>();
  for (const raw of categories || []) {
    const lens = PREFERENCE_TO_LENS[raw.trim().toLowerCase()];
    if (lens) seen.add(lens);
  }
  return DISCOVER_LENS_IDS.filter((id) => seen.has(id));
}

export function votesRemaining(poll: PathablePoll): number {
  return Math.max(0, (poll.thresholdForMoment || 0) - (poll.totalVotes || 0));
}

export function intentWords(query: string | null | undefined): string[] {
  return (query || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !QUERY_STOP_WORDS.has(word));
}

function lensHits(poll: PathablePoll, lens: DiscoverLensId): number {
  const text = pollSearchText(poll);
  return LENS_KEYWORDS[lens].filter((keyword) => text.includes(keyword)).length;
}

export function queryHits(poll: PathablePoll, query: string | null | undefined): number {
  const words = intentWords(query);
  if (!words.length) return 0;
  const text = pollSearchText(poll);
  return words.filter((word) => text.includes(word)).length;
}

export function intentMatchCount(
  poll: PathablePoll,
  lenses: DiscoverLensId[],
  query?: string | null,
): number {
  if (intentWords(query).length) return queryHits(poll, query);
  return lenses.reduce((sum, lens) => sum + lensHits(poll, lens), 0);
}

export function scorePollForLenses(poll: PathablePoll, lenses: DiscoverLensId[]): number {
  const active = lenses.length ? lenses : DISCOVER_LENS_IDS;
  let score = 0;

  for (const lens of active) {
    score += lensHits(poll, lens) * 12;
  }

  const remaining = votesRemaining(poll);
  if (remaining === 0) score += 6;
  else if (remaining <= 10) score += 18;
  else if (remaining <= 25) score += 10;
  else score += 3;

  return score;
}

export function whyForPoll(
  poll: PathablePoll,
  lenses: DiscoverLensId[],
  city: string,
  query = "",
): PathWhy {
  const remaining = votesRemaining(poll);
  const perk = (poll.targetUnlockPerk || "").replace(/^[^\w]+/, "").trim();
  const matchedLens = lenses.find((lens) => lensHits(poll, lens) > 0) || null;

  if (queryHits(poll, query) > 0) {
    return { kind: "query", lens: matchedLens, query, city, votesRemaining: remaining, perk };
  }
  if (matchedLens && remaining > 0 && remaining <= 12) {
    return { kind: "close", lens: matchedLens, query, city, votesRemaining: remaining, perk };
  }
  if (matchedLens) {
    return { kind: "taste", lens: matchedLens, query, city, votesRemaining: remaining, perk };
  }
  return { kind: "city", lens: null, query, city, votesRemaining: remaining, perk };
}

export function buildDiscoveryPath<T extends PathablePoll>(input: {
  polls: T[];
  lenses: DiscoverLensId[];
  query?: string;
  votedIds?: Iterable<string>;
  skippedIds?: Iterable<string>;
  cityName?: string;
  limit?: number;
}): DiscoveryPathItem<T>[] {
  const voted = new Set(input.votedIds || []);
  const skipped = new Set(input.skippedIds || []);
  const city = input.cityName || "this city";
  const limit = input.limit ?? 4;
  const lenses = input.lenses;
  const query = (input.query || "").trim();
  const namedIntent = Boolean(lenses.length || intentWords(query).length);

  const ranked = input.polls
    .filter((poll) => !voted.has(poll.id) && !skipped.has(poll.id))
    .map((poll) => {
      const tasteHits = lenses.reduce((sum, lens) => sum + lensHits(poll, lens), 0);
      const textHits = queryHits(poll, query);
      return {
        poll,
        score: scorePollForLenses(poll, lenses) + textHits * 16,
        tasteHits,
        textHits,
        why: whyForPoll(poll, lenses, city, query),
      };
    })
    .sort((a, b) => {
      if (query && a.textHits !== b.textHits) return b.textHits - a.textHits;
      if (lenses.length && a.tasteHits !== b.tasteHits) return b.tasteHits - a.tasteHits;
      return b.score - a.score;
    });

  const matched = ranked.filter((item) => {
    if (query) return item.textHits > 0;
    if (lenses.length) return item.tasteHits > 0;
    return true;
  });

  if (namedIntent && matched.length === 0) return [];

  const pool = matched.length ? matched : ranked;
  return pool.slice(0, limit).map(({ poll, score, why }) => ({ poll, score, why }));
}
