export const FIND_OR_ASK_POST_KINDS = ["question", "demand"] as const;
export type FindOrAskPostKind = (typeof FIND_OR_ASK_POST_KINDS)[number];

export const FIND_OR_ASK_INTENT_KINDS = [
  "lookup",
  "recommendation",
  "question",
  "coordination",
  "unmet_demand",
] as const;

export type FindOrAskIntentKind = (typeof FIND_OR_ASK_INTENT_KINDS)[number];

export const FIND_OR_ASK_RECOVERY_ACTIONS = [
  "ask_people",
  "request_something",
  "search_again",
] as const;

export type FindOrAskRecoveryAction = (typeof FIND_OR_ASK_RECOVERY_ACTIONS)[number];

export const FIND_OR_ASK_CANONICAL_OBJECTS = [
  "place",
  "moment",
  "content",
  "scene",
  "person",
  "offer",
  "discovery_question",
  "discovery_demand",
  "opportunity",
  "proof",
  "receipt",
] as const;

export type FindOrAskCanonicalObject = (typeof FIND_OR_ASK_CANONICAL_OBJECTS)[number];

export interface FindOrAskIntent {
  query: string;
  kind?: FindOrAskIntentKind;
  city?: string;
  language?: string;
  recovery?: FindOrAskRecoveryAction;
  matchedObjectType?: FindOrAskCanonicalObject;
  matchedObjectId?: string;
  resultingDiscoveryId?: string;
  source: "home" | "marketing_header" | "app_header" | "discover" | "search";
}

export function findOrAskSearchHref(intent: Pick<FindOrAskIntent, "query" | "city" | "language" | "source">) {
  const params = new URLSearchParams({ q: intent.query.trim(), source: intent.source });
  if (intent.city?.trim()) params.set("city", intent.city.trim());
  if (intent.language?.trim()) params.set("lang", intent.language.trim());
  return `/search?${params.toString()}`;
}

export function findOrAskRecoveryHref(
  action: FindOrAskRecoveryAction,
  intent: Pick<FindOrAskIntent, "query" | "city" | "language" | "source">,
) {
  const params = new URLSearchParams({
    q: intent.query.trim(),
    source: intent.source,
    recovery: action,
  });
  if (intent.city?.trim()) params.set("city", intent.city.trim());
  if (intent.language?.trim()) params.set("lang", intent.language.trim());
  return `/search?${params.toString()}`;
}

export function findOrAskPostKind(action?: FindOrAskRecoveryAction | null): FindOrAskPostKind | null {
  if (action === "ask_people") return "question";
  if (action === "request_something") return "demand";
  return null;
}

export const FIND_OR_ASK_STAKEHOLDER_ACTIONS = {
  merchant: ["confirm_fact", "update_place", "create_offer"],
  host: ["create_moment"],
  creator: ["answer", "create_content", "accept_opportunity"],
  brand: ["validate", "sponsor", "commission"],
} as const;

export function isDemandTargetAllowed(kind: FindOrAskPostKind) {
  return kind === "demand";
}
