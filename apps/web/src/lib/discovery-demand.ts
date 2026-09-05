import { intentWords, queryHits, votesRemaining, type PathablePoll } from "@/lib/discovery-path";

export type DemandRole = "host" | "creator" | "brand" | "merchant";

export type DemandPoll = PathablePoll & {
  slug?: string;
  options?: Array<{ id?: string; text: string; votes: number }>;
  connectedScene?: { title: string; slug: string };
};

export type NamedIntent = {
  query: string;
  count: number;
  lastAskedAt?: string;
};

export type DemandAsk = {
  query: string;
  count: number;
  matchedPollIds: string[];
  status: "live" | "miss";
};

export type DemandOption = {
  text: string;
  votes: number;
  share: number;
};

export type DemandQuestion = {
  poll: DemandPoll;
  votesRemaining: number;
  leading: DemandOption | null;
  options: DemandOption[];
  matchedAsks: string[];
  closeness: "unlocking" | "warming" | "early";
};

export type DemandInbox = {
  city: string;
  asks: DemandAsk[];
  misses: DemandAsk[];
  questions: DemandQuestion[];
  unlocking: DemandQuestion[];
  namedAskCount: number;
  liveVoteCount: number;
};

export function resolveDemandRole(role?: string | null): DemandRole {
  if (role === "host") return "host";
  if (role === "brand") return "brand";
  if (role === "merchant") return "merchant";
  return "creator";
}

export function normalizeIntentKey(query: string): string {
  return intentWords(query).slice().sort().join(" ");
}

export function optionShares(
  options: Array<{ text: string; votes: number }> | undefined,
  totalVotes: number,
): DemandOption[] {
  const rows = (options || []).map((option) => ({
    text: option.text,
    votes: option.votes || 0,
    share: 0,
  }));
  const denom = Math.max(
    totalVotes,
    rows.reduce((sum, row) => sum + row.votes, 0),
    1,
  );
  return rows
    .map((row) => ({ ...row, share: Math.round((row.votes / denom) * 100) }))
    .sort((a, b) => b.votes - a.votes);
}

export function closenessForPoll(poll: DemandPoll): DemandQuestion["closeness"] {
  const remaining = votesRemaining(poll);
  if (remaining === 0) return "unlocking";
  if (remaining <= 12) return "unlocking";
  if (remaining <= 30) return "warming";
  return "early";
}

export function toDemandQuestion(poll: DemandPoll, asks: DemandAsk[] = []): DemandQuestion {
  const options = optionShares(poll.options, poll.totalVotes || 0);
  return {
    poll,
    votesRemaining: votesRemaining(poll),
    leading: options[0] || null,
    options,
    matchedAsks: asks.filter((ask) => ask.matchedPollIds.includes(poll.id)).map((ask) => ask.query),
    closeness: closenessForPoll(poll),
  };
}

export function mergeNamedIntents(...groups: NamedIntent[][]): NamedIntent[] {
  const byKey = new Map<string, NamedIntent>();
  for (const group of groups) {
    for (const intent of group) {
      const key = normalizeIntentKey(intent.query);
      if (!key) continue;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { ...intent });
        continue;
      }
      byKey.set(key, {
        query: existing.count >= intent.count ? existing.query : intent.query,
        count: Math.max(existing.count, intent.count),
        lastAskedAt: [existing.lastAskedAt, intent.lastAskedAt].filter(Boolean).sort().at(-1),
      });
    }
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.query.localeCompare(b.query));
}

export function buildDiscoveryDemandInbox(input: {
  polls: DemandPoll[];
  intents?: NamedIntent[];
  city?: string;
  limit?: number;
}): DemandInbox {
  const city = input.city || "this city";
  const limit = input.limit ?? 6;
  const polls = input.polls || [];

  const asks = (input.intents || [])
    .map((intent) => {
      const matchedPollIds = polls
        .filter((poll) => queryHits(poll, intent.query) > 0)
        .map((poll) => poll.id);
      return {
        query: intent.query,
        count: intent.count,
        matchedPollIds,
        status: matchedPollIds.length ? ("live" as const) : ("miss" as const),
      };
    })
    .filter((ask) => normalizeIntentKey(ask.query))
    .sort((a, b) => b.count - a.count || a.query.localeCompare(b.query));

  const questions = polls
    .map((poll) => toDemandQuestion(poll, asks))
    .sort((a, b) => {
      const closenessRank = { unlocking: 0, warming: 1, early: 2 };
      if (closenessRank[a.closeness] !== closenessRank[b.closeness]) {
        return closenessRank[a.closeness] - closenessRank[b.closeness];
      }
      if (a.matchedAsks.length !== b.matchedAsks.length) return b.matchedAsks.length - a.matchedAsks.length;
      return (b.poll.totalVotes || 0) - (a.poll.totalVotes || 0);
    })
    .slice(0, limit);

  return {
    city,
    asks: asks.filter((ask) => ask.status === "live"),
    misses: asks.filter((ask) => ask.status === "miss"),
    questions,
    unlocking: questions.filter((item) => item.closeness === "unlocking"),
    namedAskCount: asks.reduce((sum, ask) => sum + ask.count, 0),
    liveVoteCount: polls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0),
  };
}

export function demandPollFromDiscovery(poll: {
  id: string;
  slug?: string;
  question: string;
  category?: string;
  tags?: string[];
  description?: string;
  targetUnlockPerk?: string;
  totalVotes?: number;
  thresholdForMoment?: number;
  options?: Array<{ id?: string; text: string; votes: number }>;
  connectedScene?: { title: string; slug: string };
}): DemandPoll {
  return {
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    category: poll.category,
    tags: poll.tags,
    description: poll.description,
    targetUnlockPerk: poll.targetUnlockPerk,
    totalVotes: poll.totalVotes,
    thresholdForMoment: poll.thresholdForMoment,
    options: poll.options,
    connectedScene: poll.connectedScene,
  };
}
