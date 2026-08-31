import { stripLocalePrefix } from "@/i18n/locale-routing";

export const MOMENT_INTENT_IDS = ["food", "shops", "trade", "sport", "culture", "night"] as const;

export type MomentIntentId = (typeof MOMENT_INTENT_IDS)[number];

export const MOMENT_INTENT_KEYWORDS: Record<MomentIntentId, string[]> = {
  food: ["food", "drink", "dining", "restaurant", "cafe", "kitchen", "brunch", "bar", "eater"],
  shops: ["shop", "retail", "store", "boutique", "mall"],
  trade: ["trade", "vendor", "service", "workshop", "market", "maker"],
  sport: ["sport", "fitness", "run", "gym", "game", "match", "athletic", "football", "soccer", "basketball"],
  culture: ["culture", "art", "community", "gathering", "museum", "gallery"],
  night: ["night", "nightlife", "party", "club", "dj", "music"],
};

const INTENT_ALIASES: Record<string, MomentIntentId> = {
  food: "food",
  drinks: "food",
  drink: "food",
  shops: "shops",
  shop: "shops",
  retail: "shops",
  trade: "trade",
  sport: "sport",
  sports: "sport",
  fitness: "sport",
  culture: "culture",
  community: "culture",
  night: "night",
  nightlife: "night",
  music: "night",
};

const HIDDEN_PROMPT_PREFIXES = [
  "/discover",
  "/discoveries",
  "/auth",
  "/onboarding",
  "/login",
  "/signup",
];

export function parseMomentIntent(value?: string | null): MomentIntentId | null {
  if (!value) return null;
  return INTENT_ALIASES[value.trim().toLowerCase()] ?? null;
}

export function normalizeDiscoverCategory(value?: string | null): string {
  const intent = parseMomentIntent(value);
  if (intent) return intent;
  if (!value || value.trim().toLowerCase() === "all") return "all";
  return value.trim().toLowerCase();
}

export function buildDiscoverIntentPath(intent?: MomentIntentId | null): string {
  const params = new URLSearchParams();
  params.set("tab", "moments");
  if (intent) params.set("intent", intent);
  return `/discover?${params.toString()}`;
}

export function momentMatchesIntent(
  haystack: string | null | undefined,
  intent: string,
): boolean {
  const normalized = normalizeDiscoverCategory(intent);
  if (normalized === "all") return true;

  const text = (haystack || "").toLowerCase();
  if (!text) return false;
  if (text.includes(normalized)) return true;

  const keywords = MOMENT_INTENT_KEYWORDS[normalized as MomentIntentId];
  if (!keywords) return text.includes(normalized);
  return keywords.some((keyword) => text.includes(keyword));
}

export function shouldHideMomentPrompt(pathname: string): boolean {
  const withoutQuery = (pathname || "/").split(/[?#]/)[0];
  const path = stripLocalePrefix(withoutQuery).toLowerCase();
  return HIDDEN_PROMPT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isRouteBootBlocking(root: ParentNode | null | undefined): boolean {
  return Boolean(root?.querySelector("[data-route-boot]"));
}

export function shouldRevealMomentPrompt({
  pathname,
  standalone,
  dismissed,
  routeBooting,
}: {
  pathname: string;
  standalone: boolean;
  dismissed: boolean;
  routeBooting: boolean;
}): boolean {
  if (standalone || dismissed || routeBooting) return false;
  return !shouldHideMomentPrompt(pathname);
}
