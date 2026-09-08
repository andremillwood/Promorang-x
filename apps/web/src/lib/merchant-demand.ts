export type MerchantDemandAnswers = {
  business?: string;
  gap?: string;
  strength?: string;
  goal?: string;
};

export type MerchantDemandOpening = {
  name: string;
  score: number;
  window: string;
  when: string;
  who: string;
  offer: string;
  perkExample: string;
  win: string;
  insight: string;
  moves: string[];
  cta: string;
};

export const MERCHANT_DEMAND_STORAGE_KEY = "promorang_merchant_demand";

const WHO_BY_BUSINESS: Record<string, string> = {
  "Food or drink": "People nearby looking for a table, a drink, or a reason to go out — not another coupon blast.",
  "Retail or beauty": "People nearby looking for a try-on, a treatment, or a reason to stop in.",
  "Studio or service": "People nearby looking for a session, class, or appointment they can actually keep.",
  "Venue or experience": "People nearby looking for a night out with a clear reason to arrive.",
};

const WHEN_BY_GAP: Record<string, string> = {
  "Weekday daytime": "Weekday daytime — typically 11am–3pm, when tables and chairs sit empty.",
  "After work": "After work — typically 4–7pm, when people decide where to go before they go home.",
  "Late evening": "Late evening — the last window of the night, when a named reason beats a generic special.",
  "Weekend off-peak": "Weekend off-peak — the hours around the rush, when you still have room and they still want a plan.",
};

const OFFER_BY_STRENGTH: Record<string, { offer: string; perk: string }> = {
  "The atmosphere": {
    offer: "A welcome ritual they claim on a PromoCard — first drink or tasting when they check in, on a minimum tab.",
    perk: "After-hours welcome — complimentary house drink with a $1,500 tab",
  },
  "A signature product": {
    offer: "Your signature item as the perk — they come for the thing you already do well, then pay the rest of the bill.",
    perk: "Signature tasting — complimentary house plate with a $2,000 tab",
  },
  "The people and service": {
    offer: "A host-led welcome or skip-the-wait seat. The perk is how they are treated, not a cheaper menu.",
    perk: "Host table — reserved seat and welcome pour on a $2,500 tab",
  },
  "The location or space": {
    offer: "First look at the room — a reserved seat or early access they can show at the door.",
    perk: "Reserved seat — hold a table for the first 12 guests who check in",
  },
};

const WIN_BY_GOAL: Record<string, string> = {
  "More first visits": "New faces who pay a real bill. You only give the perk when they show up and you confirm.",
  "Higher basket value": "They spend past the minimum to use the perk. You keep the rest of the tab.",
  "Repeat visits": "A reason to come back next week — same window, same welcome, proof they were here.",
  "Creator content and awareness": "A visit worth posting, with proof they were in the room — not a screenshot of an ad.",
};

function pick<T>(map: Record<string, T>, key: string | undefined, fallback: T): T {
  if (!key) return fallback;
  return map[key] ?? fallback;
}

export function buildMerchantDemandOpening(answers: MerchantDemandAnswers = {}): MerchantDemandOpening {
  const window = answers.gap || "your quieter window";
  const strength = answers.strength || "what you already do well";
  const who = pick(
    WHO_BY_BUSINESS,
    answers.business,
    "People nearby looking for a reason to walk in — not a random discount.",
  );
  const when = pick(WHEN_BY_GAP, answers.gap, `${window} is your unused capacity. That is the demand window.`);
  const offerShape = pick(OFFER_BY_STRENGTH, answers.strength, {
    offer: "A named reason to visit — a welcome drink, tasting, or reserved seat — on a minimum spend you set.",
    perk: "Welcome perk — complimentary house item with a minimum tab",
  });
  const win = pick(
    WIN_BY_GOAL,
    answers.goal,
    "They pay the rest of the bill. You only give the perk when they are standing in front of you.",
  );

  return {
    name: "Your Demand Opening",
    score: 73 + Object.keys(answers).length * 4,
    window,
    when,
    who,
    offer: offerShape.offer,
    perkExample: offerShape.perk,
    win,
    insight: `${window} can become a recognisable ritual when the invitation leads with ${strength.toLowerCase()}, not a generic promotion.`,
    moves: [
      `Hold one two-hour window: ${window}.`,
      `Put up one perk people can claim on a PromoCard — not a store-wide sale.`,
      "Confirm arrival with a PIN at the counter so only real visits get the perk.",
    ],
    cta: "See how to capture this demand",
  };
}

export function merchantDemandRoute(answers: MerchantDemandAnswers = {}): string {
  const params = new URLSearchParams({ from: "demand" });
  if (answers.business) params.set("business", answers.business);
  if (answers.gap) params.set("gap", answers.gap);
  if (answers.strength) params.set("strength", answers.strength);
  if (answers.goal) params.set("goal", answers.goal);
  return `/for-merchants?${params.toString()}`;
}

export function persistMerchantDemand(answers: MerchantDemandAnswers): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(MERCHANT_DEMAND_STORAGE_KEY, JSON.stringify(answers));
}

export function readMerchantDemand(searchParams?: URLSearchParams | null): MerchantDemandAnswers | null {
  const fromUrl: MerchantDemandAnswers = {
    business: searchParams?.get("business") || undefined,
    gap: searchParams?.get("gap") || undefined,
    strength: searchParams?.get("strength") || undefined,
    goal: searchParams?.get("goal") || undefined,
  };
  if (fromUrl.business || fromUrl.gap || fromUrl.strength || fromUrl.goal) {
    return fromUrl;
  }
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MERCHANT_DEMAND_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MerchantDemandAnswers;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function merchantAuthHref(user: unknown, next: string): string {
  return user ? next : `/auth?mode=signup&role=merchant&next=${encodeURIComponent(next)}`;
}
