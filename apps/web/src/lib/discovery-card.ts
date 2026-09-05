import { intentWords } from "@/lib/discovery-path";

export const DISCOVER_CARD_UNLOCKS_KEY = "promorang.discover.card-unlocks";

export type CardUnlockStatus = "claimed" | "used";

export type DiscoveryCardUnlock = {
  id: string;
  pollId: string;
  pollQuestion: string;
  perkTitle: string;
  city: string;
  query?: string;
  redemptionCode: string;
  status: CardUnlockStatus;
  createdAt: string;
};

export type UnlockTally = {
  pollId: string;
  onCards: number;
  used: number;
};

export function perkTitleForPoll(poll: { targetUnlockPerk?: string; question?: string }): string {
  const perk = String(poll.targetUnlockPerk || "")
    .replace(/^[^\w]+/, "")
    .trim();
  return perk || "City perk";
}

export function makeRedemptionCode(pollId: string): string {
  const stub = String(pollId || "city")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-4)
    .toUpperCase()
    .padStart(4, "X");
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PR-${stub}${salt}`;
}

export function unlockFromPoll(input: {
  poll: { id: string; question: string; targetUnlockPerk?: string };
  city: string;
  query?: string;
  existing?: DiscoveryCardUnlock | null;
}): DiscoveryCardUnlock {
  if (input.existing && input.existing.pollId === input.poll.id) return input.existing;
  return {
    id: `unlock:${input.poll.id}`,
    pollId: input.poll.id,
    pollQuestion: input.poll.question,
    perkTitle: perkTitleForPoll(input.poll),
    city: input.city,
    query: (input.query || "").trim() || undefined,
    redemptionCode: makeRedemptionCode(input.poll.id),
    status: "claimed",
    createdAt: new Date().toISOString(),
  };
}

export function readLocalCardUnlocks(): DiscoveryCardUnlock[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DISCOVER_CARD_UNLOCKS_KEY) || "[]");
    return (Array.isArray(parsed) ? parsed : []).filter((row) => row?.pollId && row?.perkTitle);
  } catch {
    return [];
  }
}

export function writeLocalCardUnlock(unlock: DiscoveryCardUnlock): DiscoveryCardUnlock {
  if (typeof window === "undefined") return unlock;
  const rows = readLocalCardUnlocks();
  const existing = rows.find((row) => row.pollId === unlock.pollId);
  if (existing) return existing;
  window.localStorage.setItem(DISCOVER_CARD_UNLOCKS_KEY, JSON.stringify([unlock, ...rows].slice(0, 40)));
  return unlock;
}

export function tallyCardUnlocks(unlocks: Array<{ pollId: string; status?: string }>): UnlockTally[] {
  const byPoll = new Map<string, UnlockTally>();
  for (const unlock of unlocks) {
    if (!unlock.pollId) continue;
    const current = byPoll.get(unlock.pollId) || { pollId: unlock.pollId, onCards: 0, used: 0 };
    if (unlock.status === "used") current.used += 1;
    else current.onCards += 1;
    byPoll.set(unlock.pollId, current);
  }
  return [...byPoll.values()].sort((a, b) => b.onCards - a.onCards || a.pollId.localeCompare(b.pollId));
}

export function mergeUnlockTallies(...groups: UnlockTally[][]): UnlockTally[] {
  const byPoll = new Map<string, UnlockTally>();
  for (const group of groups) {
    for (const tally of group) {
      if (!tally.pollId) continue;
      const existing = byPoll.get(tally.pollId);
      if (!existing) {
        byPoll.set(tally.pollId, { ...tally });
        continue;
      }
      byPoll.set(tally.pollId, {
        pollId: tally.pollId,
        onCards: Math.max(existing.onCards, tally.onCards),
        used: Math.max(existing.used, tally.used),
      });
    }
  }
  return [...byPoll.values()].sort((a, b) => b.onCards - a.onCards || a.pollId.localeCompare(b.pollId));
}

export function cardsOnAsk(matchedPollIds: string[], tallies: UnlockTally[]): number {
  return matchedPollIds.reduce((sum, pollId) => sum + (tallies.find((row) => row.pollId === pollId)?.onCards || 0), 0);
}

export function cardUnlocksMatchQuery(unlock: DiscoveryCardUnlock, query?: string): boolean {
  const words = intentWords(query);
  if (!words.length) return true;
  const hay = `${unlock.pollQuestion} ${unlock.perkTitle} ${unlock.query || ""}`.toLowerCase();
  return words.some((word) => hay.includes(word));
}
