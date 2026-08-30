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

export type PathWhyKind = "close" | "taste" | "city";

export type PathWhy = {
  kind: PathWhyKind;
  lens: DiscoverLensId | null;
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

export function scorePollForLenses(poll: PathablePoll, lenses: DiscoverLensId[]): number {
  const text = pollSearchText(poll);
  const active = lenses.length ? lenses : DISCOVER_LENS_IDS;
  let score = 0;

  for (const lens of active) {
    const hits = LENS_KEYWORDS[lens].filter((keyword) => text.includes(keyword)).length;
    score += hits * 12;
  }

  const remaining = votesRemaining(poll);
  if (remaining === 0) score += 6;
  else if (remaining <= 10) score += 18;
  else if (remaining <= 25) score += 10;
  else score += 3;

  return score;
}

function lensHits(poll: PathablePoll, lens: DiscoverLensId): number {
  const text = pollSearchText(poll);
  return LENS_KEYWORDS[lens].filter((keyword) => text.includes(keyword)).length;
}

export function whyForPoll(poll: PathablePoll, lenses: DiscoverLensId[], city: string): PathWhy {
  const remaining = votesRemaining(poll);
  const perk = (poll.targetUnlockPerk || "").replace(/^[^\w]+/, "").trim();
  const matchedLens = lenses.find((lens) => lensHits(poll, lens) > 0) || null;

  if (matchedLens && remaining > 0 && remaining <= 12) {
    return { kind: "close", lens: matchedLens, city, votesRemaining: remaining, perk };
  }
  if (matchedLens) {
    return { kind: "taste", lens: matchedLens, city, votesRemaining: remaining, perk };
  }
  return { kind: "city", lens: null, city, votesRemaining: remaining, perk };
}

export function buildDiscoveryPath<T extends PathablePoll>(input: {
  polls: T[];
  lenses: DiscoverLensId[];
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

  const ranked = input.polls
    .filter((poll) => !voted.has(poll.id) && !skipped.has(poll.id))
    .map((poll) => {
      const tasteHits = lenses.reduce((sum, lens) => sum + lensHits(poll, lens), 0);
      return {
        poll,
        score: scorePollForLenses(poll, lenses),
        tasteHits,
        why: whyForPoll(poll, lenses, city),
      };
    })
    .sort((a, b) => {
      if (lenses.length && a.tasteHits !== b.tasteHits) return b.tasteHits - a.tasteHits;
      return b.score - a.score;
    });

  const matched = lenses.length ? ranked.filter((item) => item.tasteHits > 0) : ranked;
  const pool = matched.length ? matched : ranked;

  return pool.slice(0, limit).map(({ poll, score, why }) => ({ poll, score, why }));
}
