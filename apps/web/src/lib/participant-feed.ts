export type ParticipantFeedKind = "moment" | "offer" | "drop" | "want" | "scene" | "find_or_ask";

export type ParticipantFeedAction = {
  label: string;
  href: string;
  state?: "available" | "joined" | "wanted" | "claimed" | "saved" | "completed";
};

export type ParticipantFeedSignals = {
  local?: boolean;
  joinedScene?: boolean;
  startsAt?: string | null;
  available?: boolean;
  socialProof?: number;
  freshAt?: string | null;
};

export type ParticipantFeedItem = {
  id: string;
  kind: ParticipantFeedKind;
  source: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  scene?: string | null;
  location?: string | null;
  startsAt?: string | null;
  availability?: string | null;
  socialProof?: string | null;
  optionPreview?: string[];
  primaryAction: ParticipantFeedAction;
  signals?: ParticipantFeedSignals;
  score?: number;
};

const KIND_WEIGHT: Record<ParticipantFeedKind, number> = {
  moment: 28,
  offer: 25,
  want: 18,
  scene: 14,
  drop: 12,
  find_or_ask: 2,
};

function boundedAgeScore(date: string | null | undefined, now: number) {
  if (!date) return 0;
  const ageDays = Math.max(0, (now - new Date(date).getTime()) / 86_400_000);
  return Math.max(0, 8 - ageDays);
}

export function scoreParticipantFeedItem(item: ParticipantFeedItem, now = Date.now()) {
  const signals = item.signals || {};
  let score = KIND_WEIGHT[item.kind];
  if (signals.local) score += 18;
  if (signals.joinedScene) score += 22;
  if (signals.available) score += 14;
  if (signals.socialProof) score += Math.min(12, Math.log2(signals.socialProof + 1) * 2);
  score += boundedAgeScore(signals.freshAt, now);

  if (signals.startsAt) {
    const hoursUntil = (new Date(signals.startsAt).getTime() - now) / 3_600_000;
    if (hoursUntil >= 0 && hoursUntil <= 48) score += 26;
    else if (hoursUntil > 48 && hoursUntil <= 168) score += 16;
    else if (hoursUntil > 168 && hoursUntil <= 720) score += 7;
    else if (hoursUntil < 0) score -= 30;
  }

  return Math.round(score * 100) / 100;
}

export function rankParticipantFeed(items: ParticipantFeedItem[], options?: { limit?: number; now?: number }) {
  const limit = options?.limit ?? 12;
  const now = options?.now ?? Date.now();
  const remaining = items
    .map((item) => ({ ...item, score: scoreParticipantFeedItem(item, now) }))
    .sort((a, b) => b.score - a.score);
  const ranked: Array<ParticipantFeedItem & { score: number }> = [];

  while (remaining.length && ranked.length < limit) {
    const lastTwo = ranked.slice(-2);
    const candidateIndex = remaining.findIndex((candidate) =>
      lastTwo.length < 2 || lastTwo.some((item) => item.kind !== candidate.kind),
    );
    ranked.push(remaining.splice(candidateIndex < 0 ? 0 : candidateIndex, 1)[0]);
  }

  return ranked;
}
