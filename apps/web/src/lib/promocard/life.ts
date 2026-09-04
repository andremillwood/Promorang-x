export type PromoCardMarkKind = "held" | "arrived" | "spent" | "recharged" | "landed";

export type PromoCardMark = {
  id: string;
  kind: PromoCardMarkKind;
  stamp: string;
  place: string;
  line: string;
  at: string;
  amount?: number;
};

export type ImminentWrite = {
  stamp: string;
  place: string;
  line: string;
};

const KIND_VERB: Record<PromoCardMarkKind, string> = {
  held: "HELD",
  arrived: "ARRIVED",
  spent: "SPENT",
  recharged: "RECHARGED",
  landed: "LANDED",
};

function storageKey(userId: string) {
  return `promorang.promocard.marks.v1.${userId}`;
}

export function stampFromPlace(place: string) {
  const cleaned = place.replace(/[^A-Za-z0-9]+/g, " ").trim();
  if (!cleaned) return "PR";
  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

export function lineForMark(kind: PromoCardMarkKind, place: string, amount?: number) {
  const verb = KIND_VERB[kind];
  const money = typeof amount === "number" ? ` · ${amount >= 0 ? "+" : ""}$${Math.abs(amount).toFixed(2)}` : "";
  return `${verb} · ${place.toUpperCase()}${money}`;
}

export function readPromoCardMarks(userId?: string): PromoCardMark[] {
  if (!userId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PromoCardMark[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function writePromoCardMark(
  userId: string,
  input: {
    kind: PromoCardMarkKind;
    place: string;
    amount?: number;
    id?: string;
  },
): PromoCardMark {
  const mark: PromoCardMark = {
    id: input.id || `${input.kind}-${Date.now()}`,
    kind: input.kind,
    stamp: stampFromPlace(input.place),
    place: input.place,
    line: lineForMark(input.kind, input.place, input.amount),
    at: new Date().toISOString(),
    amount: input.amount,
  };
  const existing = readPromoCardMarks(userId).filter((item) => item.id !== mark.id);
  const next = [mark, ...existing].slice(0, 8);
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("promorang:promocard-write", { detail: mark }));
  return mark;
}
