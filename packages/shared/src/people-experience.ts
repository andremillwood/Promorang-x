export type ExperienceRole = "member" | "contributor" | "operator";

export type PerkKind =
  | "free_entry"
  | "discount"
  | "complimentary"
  | "priority"
  | "invitation"
  | "points"
  | "promokey"
  | "merchant"
  | "custom";

export type DropAudience = "everyone" | "most_active" | "first_x" | "specific" | "complete_something";

export type CreateIntent =
  | "go"
  | "attend"
  | "buy"
  | "try"
  | "answer"
  | "post"
  | "bring"
  | "claim"
  | "other";

export type CreateIntentTarget = {
  intent: CreateIntent;
  label: string;
  prompt: string;
  mapsTo: string;
  href: string;
};

export const CREATE_INTENTS: CreateIntentTarget[] = [
  { intent: "go", label: "Go somewhere", prompt: "Get your people to a place.", mapsTo: "Moment", href: "/create/moment?intent=go" },
  { intent: "attend", label: "Attend something", prompt: "Put a night, show or gathering on the calendar.", mapsTo: "Moment", href: "/create/moment?intent=attend" },
  { intent: "buy", label: "Buy something", prompt: "Move people toward a purchase.", mapsTo: "Merchant perk", href: "/give?kind=merchant" },
  { intent: "try", label: "Try something", prompt: "Let people sample a place, drink or brand.", mapsTo: "Moment + perk", href: "/create/moment?intent=try" },
  { intent: "answer", label: "Answer something", prompt: "Ask your people what they want.", mapsTo: "Discovery", href: "/create?intent=answer" },
  { intent: "post", label: "Post something", prompt: "Get people to share a story or clip.", mapsTo: "Mission", href: "/missions" },
  { intent: "bring", label: "Bring friends", prompt: "Grow the network through people they already trust.", mapsTo: "Invite", href: "/people?action=invite" },
  { intent: "claim", label: "Claim something", prompt: "Put a perk on their PromoCard.", mapsTo: "Drop", href: "/give" },
  { intent: "other", label: "Something else", prompt: "Make something happen your own way.", mapsTo: "Moment", href: "/create/moment?intent=other" },
];

export const PERK_KIND_LABELS: Record<PerkKind, string> = {
  free_entry: "Free Entry",
  discount: "Discount",
  complimentary: "Complimentary Item",
  priority: "Priority Access",
  invitation: "Invitation",
  points: "PromoPoints",
  promokey: "PromoKey",
  merchant: "Merchant Perk",
  custom: "Custom Perk",
};

export const AUDIENCE_LABELS: Record<DropAudience, string> = {
  everyone: "Everyone",
  most_active: "Most active members",
  first_x: "First people who claim",
  specific: "Specific people",
  complete_something: "People who complete something",
};

export const COMMUNITY_THEMES = [
  { id: "nightlife", label: "Nightlife" },
  { id: "food", label: "Food" },
  { id: "music", label: "Music" },
  { id: "fitness", label: "Fitness" },
  { id: "campus", label: "Campus" },
  { id: "automotive", label: "Automotive" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "other", label: "Other" },
] as const;

export const REACH_CHANNELS = [
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tiktok", label: "TikTok" },
  { id: "other", label: "Other" },
] as const;

export function resolveCreateIntent(intent?: string | null): CreateIntentTarget {
  return CREATE_INTENTS.find((item) => item.intent === intent) || CREATE_INTENTS[CREATE_INTENTS.length - 1];
}

export function classifyExperienceRole(input: {
  operatesHubs?: number;
  contributorHubs?: number;
  platformRoles?: string[];
}): ExperienceRole {
  if ((input.operatesHubs || 0) > 0) return "operator";
  const elevated = new Set(["creator", "host", "promoter", "merchant", "brand", "agency", "admin"]);
  if ((input.contributorHubs || 0) > 0) return "contributor";
  if ((input.platformRoles || []).some((role) => elevated.has(role))) return "contributor";
  return "member";
}

export function contributorValueScore(input: {
  peopleBrought?: number;
  activePeople?: number;
  verifiedActions?: number;
  attributedValue?: number;
}): number {
  const people = Number(input.peopleBrought || 0);
  const active = Number(input.activePeople || 0);
  const actions = Number(input.verifiedActions || 0);
  const value = Number(input.attributedValue || 0);
  return active * 8 + actions * 5 + value * 0.01 + people * 0.4;
}

export function slugifyCommunityName(name: string): string {
  const base = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "community";
}

export function humanActionLabel(actionType?: string | null): string {
  const map: Record<string, string> = {
    SIGNUP: "joined",
    REFERRAL: "brought a friend",
    DISCOVERY_RESPONSE: "answered something",
    MOMENT_RSVP: "said they are going",
    MOMENT_ATTENDANCE: "went somewhere",
    MERCHANT_VISIT: "visited a place",
    PURCHASE: "bought something",
    PERK_CLAIM: "claimed a perk",
    PERK_REDEMPTION: "used a perk",
    PROMOKEY_USE: "used access",
    CONTENT_POST: "shared something",
    MISSION_COMPLETE: "finished something",
    FRIEND_INVITE: "brought friends",
    TEST_DRIVE: "tried a vehicle",
    CUSTOM: "did something",
    deal_claimed: "claimed a perk",
    event_rsvp: "said they are going",
    check_in: "went somewhere",
    share_completed: "shared something",
    moment_join_verified: "went somewhere",
    proof_verified: "showed up",
    referral_activated: "brought a friend",
  };
  return map[String(actionType || "")] || "showed up";
}

export function classifyHappenedBucket(actionType?: string | null): keyof ReturnType<typeof emptyHappenedBuckets> {
  const type = String(actionType || "");
  if (["MOMENT_ATTENDANCE", "MERCHANT_VISIT", "check_in", "TEST_DRIVE", "moment_join_verified", "proof_verified", "event_rsvp", "MOMENT_RSVP"].includes(type)) return "went";
  if (["PURCHASE", "order_paid", "split_tender"].includes(type)) return "bought";
  if (["DISCOVERY_RESPONSE", "discovery_vote"].includes(type)) return "answered";
  if (["CONTENT_POST", "share_completed"].includes(type) || type.startsWith("organic_")) return "shared";
  if (["FRIEND_INVITE", "REFERRAL", "referral_activated"].includes(type)) return "brought";
  if (["PERK_CLAIM", "PERK_REDEMPTION", "deal_claimed", "PROMOKEY_USE"].includes(type)) return "claimed";
  return "other";
}

export function emptyHappenedBuckets() {
  return { went: 0, bought: 0, answered: 0, shared: 0, brought: 0, claimed: 0, other: 0 };
}

export function happenedBuckets(actions: Array<{ action_type?: string | null }>) {
  const buckets = emptyHappenedBuckets();
  for (const action of actions) {
    buckets[classifyHappenedBucket(action.action_type)] += 1;
  }
  return buckets;
}

export function dropShareCopy(creatorName: string, perkTitle: string) {
  const who = creatorName || "Someone";
  const what = perkTitle || "something";
  return `${who} just dropped ${what} on your PromoCard.`;
}
