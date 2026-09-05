export type ExperiencePerk = {
  id: string;
  title: string;
  detail?: string;
  kind?: string;
  status?: string;
  redemptionCode?: string | null;
  expiresAt?: string | null;
};

export type ExperienceMembership = {
  id: string;
  title: string;
  slug?: string;
  role?: string;
};

export type LivePromoCardRow = {
  available_balance?: number | string;
  monthly_limit?: number | string;
  card_number?: string;
  tier?: string;
  cycle_resets_at?: string;
  recharge_health_score?: number | string;
  total_savings_lifetime?: number | string;
  accepted_locations_count?: number;
};

export type ExperienceCardPayload = {
  name?: string;
  points?: number;
  keys?: number;
  gems?: number;
  card?: LivePromoCardRow | null;
  perks?: ExperiencePerk[];
  memberships?: ExperienceMembership[];
};

export type PromoCardView = {
  holder: string;
  available: string;
  limit: string;
  places: string;
  tier?: string;
  cardNumber: string;
  spendable: number | null;
  monthlyLimit: number | null;
  cycleDaysRemaining: number | null;
  rechargeHealth: number | null;
  lifetimeSavings: number | null;
  useCode: string;
  isLive: boolean;
  perkCount: number;
  points: number;
  keys: number;
};

const money = (value: number) => `$${value.toFixed(2)}`;

export function presentPromoCard(
  data?: ExperienceCardPayload | null,
  fallbackName = "",
): PromoCardView {
  const live = data?.card;
  const points = Number(data?.points || 0);
  const keys = Number(data?.keys || 0);
  const perkCount = data?.perks?.length || 0;
  const hasLiveBalance = live?.available_balance != null && Number.isFinite(Number(live.available_balance));
  const isLive = Boolean(live && (live.card_number || hasLiveBalance));
  const spendable = hasLiveBalance ? Number(live?.available_balance) : null;
  const monthlyLimit = isLive && live?.monthly_limit != null ? Number(live.monthly_limit) : null;

  let cycleDaysRemaining: number | null = null;
  if (live?.cycle_resets_at) {
    cycleDaysRemaining = Math.max(
      0,
      Math.ceil((new Date(live.cycle_resets_at).getTime() - Date.now()) / 86_400_000),
    );
  }

  const cardNumber = live?.card_number || "";
  const firstPerkCode = data?.perks?.find((perk) => perk.redemptionCode)?.redemptionCode || "";
  const useCode = firstPerkCode || cardNumber.replace(/[•\s]/g, "");

  return {
    holder: data?.name || fallbackName,
    available: spendable != null ? money(spendable) : `${points.toLocaleString()} pts`,
    limit: monthlyLimit != null && monthlyLimit > 0 ? money(monthlyLimit) : `${keys} keys`,
    places: perkCount
      ? `${perkCount} perk${perkCount === 1 ? "" : "s"} ready`
      : "Partner places nearby",
    tier: live?.tier,
    cardNumber,
    spendable,
    monthlyLimit,
    cycleDaysRemaining,
    rechargeHealth: live?.recharge_health_score != null ? Number(live.recharge_health_score) : null,
    lifetimeSavings:
      live?.total_savings_lifetime != null ? Number(live.total_savings_lifetime) : null,
    useCode,
    isLive,
    perkCount,
    points,
    keys,
  };
}

export const PEOPLE_EXPERIENCE_CHROME = {
  today: {
    label: "Today",
    purpose: "The live command center. PromoCard sits here.",
    humanQuestion: "What should I do now?",
    webHref: "/dashboard",
    mobileHref: "/",
  },
  people: {
    label: "People",
    purpose: "The network you built and the people helping you build it.",
    humanQuestion: "Who did I bring, and who is helping?",
    webHref: "/people",
    mobileHref: "/people",
  },
  create: {
    label: "Create",
    purpose: "Choose the behaviour. Promorang picks the tool.",
    humanQuestion: "What can I make happen?",
    webHref: "/create",
    mobileHref: "/post",
  },
  earn: {
    label: "Earn",
    purpose: "Opportunities you can take when the action is verified.",
    humanQuestion: "What can I take and get paid for?",
    webHref: "/earn",
    mobileHref: "/earn",
  },
  card: {
    label: "Card",
    purpose: "Hold and use live perks, access, points, and keys.",
    humanQuestion: "What can I use now?",
    webHref: "/card",
    mobileHref: "/card",
  },
} as const;

export const PROMOCARD_LOOP = [
  {
    step: "01",
    title: "Claim a live perk",
    copy: "Discover, demand, or a drop puts a real issuance on your PromoCard.",
  },
  {
    step: "02",
    title: "Show it at the place",
    copy: "Copy a code, present a QR, or complete the fulfillment journey the merchant asked for.",
  },
  {
    step: "03",
    title: "Keep what opened",
    copy: "Used perks stay as receipts. The next benefit comes from a new claim, not a fake recharge.",
  },
] as const;

export const PROMOCARD_RECHARGE_ACTIONS = [
  {
    id: "moment",
    title: "Post a Moment from a visit",
    copy: "Show what happened so the next invitation can find you.",
    reward: "Counts",
    webHref: "/create?intent=post",
    mobileHref: "/post?intent=post",
  },
  {
    id: "visit",
    title: "Check in at a partner place",
    copy: "A verified visit is how the card knows you showed up.",
    reward: "Counts",
    webHref: "/discover",
    mobileHref: "/discover",
  },
  {
    id: "give",
    title: "Drop a perk on a friend’s card",
    copy: "Give something. They claim it. You both move.",
    reward: "Give",
    webHref: "/give",
    mobileHref: "/give",
  },
  {
    id: "count",
    title: "Let a visit count",
    copy: "Open What Happened when something should become a result.",
    reward: "Counts",
    webHref: "/happened",
    mobileHref: "/promoshare",
  },
] as const;

export const DISCOVER_LENSES = [
  { id: "eat", label: "Eat well", detail: "Food, tastings, spots worth the trip", keywords: ["food", "eat", "taste", "restaurant", "cook", "drink"] },
  { id: "go_out", label: "Go out", detail: "Music, shows, what’s heating up", keywords: ["music", "night", "club", "live", "party", "bar"] },
  { id: "hang", label: "Hang", detail: "People, workshops, midweek lymes", keywords: ["community", "workshop", "gather", "people", "hang"] },
  { id: "try", label: "Try something new", detail: "Hidden finds the city hasn’t unlocked yet", keywords: ["new", "try", "hidden", "first", "drop"] },
] as const;
