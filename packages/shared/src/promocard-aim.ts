/**
 * Customer interest that aims PromoCard.
 *
 * A tap is "unlock this", not a new wallet. Unlock still goes through
 * discovery_card_unlocks / POST /experience/discover/unlock. Aiming
 * only chooses the scene, place, or desire the card should watch.
 */

import {
  canUseBenefit,
  emptyPromoBenefitPresentation,
  isLivePromoBenefit,
  selectFeaturedBenefit,
  type PromoBenefitPresentation,
  type PromoCardBenefit,
} from "./promocard-benefit";

export type PromoCardAimId = "kingston-after-dark" | "barbican" | "food" | "tonight";

export type PromoCardAim = {
  id: PromoCardAimId;
  label: string;
  city: string;
  cityLabel: string;
  scene: string | null;
  lens: "eat" | "go_out" | "hang" | "try";
  categories: string[];
  lifestyleTags: string[];
  preferredTimes: string[];
  keywords: string[];
  discoverQuery: string;
  cardLine: string;
  watchingLine: string;
};

export const PROMOCARD_AIM_STORAGE_KEY = "promorang.promocard.aim";

export const PROMOCARD_AIMS: PromoCardAim[] = [
  {
    id: "kingston-after-dark",
    label: "Kingston After Dark",
    city: "Kingston & St. Andrew",
    cityLabel: "Kingston",
    scene: "Kingston After Dark",
    lens: "go_out",
    categories: ["music", "social"],
    lifestyleTags: ["social"],
    preferredTimes: ["evening"],
    keywords: [
      "after dark",
      "after-dark",
      "nightlife",
      "cocktail",
      "cocktails",
      "bar",
      "club",
      "tab",
      "music",
      "dancehall",
      "wednesday",
    ],
    discoverQuery: "cocktails after work",
    cardLine: "Your card is set for Kingston After Dark.",
    watchingLine: "Watching nightlife, late food, and after-hours tables.",
  },
  {
    id: "barbican",
    label: "Barbican",
    city: "Kingston & St. Andrew",
    cityLabel: "Kingston",
    scene: "Barbican",
    lens: "eat",
    categories: ["food"],
    lifestyleTags: ["foodie"],
    preferredTimes: ["evening", "weekend"],
    keywords: ["barbican", "jerk", "platter", "sea deck", "restaurant", "food"],
    discoverQuery: "barbican jerk",
    cardLine: "Your card is set for Barbican.",
    watchingLine: "Watching participating places around Barbican.",
  },
  {
    id: "food",
    label: "Food",
    city: "Kingston & St. Andrew",
    cityLabel: "Kingston",
    scene: null,
    lens: "eat",
    categories: ["food"],
    lifestyleTags: ["foodie"],
    preferredTimes: ["evening", "weekend"],
    keywords: ["food", "jerk", "platter", "taste", "tasting", "restaurant", "eat", "cook", "grocer"],
    discoverQuery: "jerk on friday",
    cardLine: "Your card is set for food.",
    watchingLine: "Watching tastings, tables, and food benefits.",
  },
  {
    id: "tonight",
    label: "Tonight",
    city: "Kingston & St. Andrew",
    cityLabel: "Kingston",
    scene: "Kingston After Dark",
    lens: "go_out",
    categories: ["music", "social", "food"],
    lifestyleTags: ["social"],
    preferredTimes: ["evening"],
    keywords: ["tonight", "after dark", "nightlife", "evening", "cocktail", "tab", "live"],
    discoverQuery: "cocktails after dark",
    cardLine: "Your card is set for tonight.",
    watchingLine: "Watching what can be used tonight.",
  },
];

export function resolvePromoCardAim(value?: string | null): PromoCardAim | null {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  return PROMOCARD_AIMS.find((aim) => aim.id === key) || null;
}

export function promoCardAimPath(aim?: PromoCardAim | null): string {
  return aim ? `/card?aim=${encodeURIComponent(aim.id)}` : "/card";
}

export function promoCardUnlockHref(input: {
  authenticated?: boolean;
  aim?: PromoCardAim | null;
  next?: string | null;
}): string {
  const next = input.next || promoCardAimPath(input.aim);
  if (input.authenticated) return next;
  return `/auth?mode=signup&next=${encodeURIComponent(next)}`;
}

function haystackForBenefit(benefit: Pick<PromoCardBenefit, "title" | "detail" | "locationLabel" | "issuer">): string {
  return [
    benefit.title,
    benefit.detail,
    benefit.locationLabel,
    benefit.issuer?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function aimMatchScore(
  aim: PromoCardAim,
  text: string | null | undefined,
): number {
  const hay = String(text || "").toLowerCase();
  if (!hay.trim() || !aim?.keywords?.length) return 0;
  return aim.keywords.reduce((score, keyword) => score + (hay.includes(keyword) ? 1 : 0), 0);
}

export function aimMatchesBenefit(
  aim: PromoCardAim,
  benefit: Pick<PromoCardBenefit, "title" | "detail" | "locationLabel" | "issuer">,
): boolean {
  return aimMatchScore(aim, haystackForBenefit(benefit)) > 0;
}

export function inferPromoCardAim(
  benefit?: Pick<PromoCardBenefit, "title" | "detail" | "locationLabel" | "issuer"> | null,
): PromoCardAim | null {
  if (!benefit) return null;
  const hay = haystackForBenefit(benefit);
  const ranked = PROMOCARD_AIMS
    .map((aim) => ({ aim, score: aimMatchScore(aim, hay) }))
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || left.aim.id.localeCompare(right.aim.id));
  return ranked[0]?.aim || null;
}

export function selectAimedBenefit(input: {
  aim?: PromoCardAim | null;
  useThis?: PromoCardBenefit | null;
  nearby?: PromoCardBenefit[];
  nextBenefit?: PromoCardBenefit | null;
  now?: number;
}): PromoCardBenefit | null {
  const now = input.now ?? Date.now();
  if (input.useThis && canUseBenefit(input.useThis)) return input.useThis;
  if (!input.aim) return selectFeaturedBenefit(input);

  const pool = [...(input.nearby || [])];
  if (input.nextBenefit && !pool.some((item) => item.id === input.nextBenefit?.id)) {
    pool.unshift(input.nextBenefit);
  }
  const live = pool.filter((item) => isLivePromoBenefit(item, now));
  const matched = live
    .map((benefit) => ({ benefit, score: aimMatchScore(input.aim!, haystackForBenefit(benefit)) }))
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score);
  if (matched.length) return matched[0].benefit;
  return selectFeaturedBenefit(input);
}

export function sortBenefitsByAim<T extends Pick<PromoCardBenefit, "title" | "detail" | "locationLabel" | "issuer">>(
  benefits: T[],
  aim?: PromoCardAim | null,
): T[] {
  if (!aim) return benefits;
  return [...benefits].sort((left, right) => {
    return aimMatchScore(aim, haystackForBenefit(right)) - aimMatchScore(aim, haystackForBenefit(left));
  });
}

export function discoverHrefForAim(aim?: PromoCardAim | null): string {
  if (!aim) return "/discover";
  return `/discover?tab=discoveries&lens=${encodeURIComponent(aim.lens)}&q=${encodeURIComponent(aim.discoverQuery)}&aim=${encodeURIComponent(aim.id)}`;
}

export function inferPromoCardAimFromText(value?: string | null): PromoCardAim | null {
  const raw = String(value || "");
  const tagged = raw.match(/aim:([a-z0-9-]+)/i);
  if (tagged) return resolvePromoCardAim(tagged[1]);
  return resolvePromoCardAim(raw);
}

export function selectOwnedUseThis(input: {
  aim?: PromoCardAim | null;
  benefits?: PromoCardBenefit[];
  useThis?: PromoCardBenefit | null;
}): PromoCardBenefit | null {
  const usable = (input.benefits || []).filter((benefit) => canUseBenefit(benefit));
  if (input.useThis && canUseBenefit(input.useThis)) {
    if (!input.aim || aimMatchesBenefit(input.aim, input.useThis)) return input.useThis;
  }
  if (input.aim) {
    const matched = usable.find((benefit) => aimMatchesBenefit(input.aim!, benefit));
    if (matched) return matched;
  }
  return usable[0] || null;
}

export function ownedBenefitKicker(
  benefit?: { fromDiscover?: boolean; issuer?: { name?: string } } | null,
  aim?: PromoCardAim | null,
): string {
  if (aim) return `On your card · ${aim.label}`;
  if (benefit?.fromDiscover) return "On your card";
  return benefit?.issuer?.name || "On your card";
}

export function ownedBenefitStatus(
  benefit?: Pick<PromoCardBenefit, "fulfillmentState" | "redemption" | "expiresAt"> | null,
): string {
  if (!benefit) return "Waiting";
  if (benefit.redemption?.recorded) return "Used";
  if (benefit.expiresAt) {
    const expiry = Date.parse(benefit.expiresAt);
    if (Number.isFinite(expiry) && expiry <= Date.now()) return "Expired";
  }
  if (canUseBenefit(benefit as PromoCardBenefit)) return "Ready to use";
  return benefit.fulfillmentState || "Claimed";
}

export function ownedCardCopy(input: {
  aim?: PromoCardAim | null;
  owned?: boolean;
  holder?: string;
}): { title: string; description: string } {
  const holder = input.holder && input.holder !== "there" ? input.holder : "Your";
  if (input.owned) {
    return {
      title: input.aim ? `${holder === "Your" ? "Your" : `${holder}'s`} ${input.aim.label}` : "This is on your card",
      description: "Show it where it works. Using it is what opens the next one.",
    };
  }
  if (input.aim) {
    return {
      title: input.aim.cardLine.replace(/\.$/, ""),
      description: `${input.aim.watchingLine} When it lands, it is yours to show.`,
    };
  }
  return {
    title: holder === "Your" ? "Your PromoCard" : `${holder}'s PromoCard`,
    description: "Unlock something around you. Then it lives on this card until you use it.",
  };
}

export function aimedEmptyPresentation(input: {
  aim: PromoCardAim;
  authenticated?: boolean;
  href?: string;
}): PromoBenefitPresentation {
  const href = input.href || promoCardUnlockHref(input);
  return {
    ...emptyPromoBenefitPresentation({
      authenticated: input.authenticated,
      href,
    }),
    headline: `SET FOR ${input.aim.label.toUpperCase()}`,
    description: `${input.aim.watchingLine} When a participating place puts something up, it lands here.`,
    ctaLabel: input.authenticated ? "Open My PromoCard" : "Unlock this",
    href,
  };
}
