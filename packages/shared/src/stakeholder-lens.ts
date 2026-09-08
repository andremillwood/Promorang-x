/**
 * Role changes tone and supply, not the product.
 *
 * Every non-admin workspace uses the same five destinations:
 * Today, World, Activity, Put-in, PromoCard.
 * Labels and hrefs change so a host, merchant, or brand can see
 * what the card is for, where the world is, what activity counts,
 * and what they must put in for the loop to work.
 */

export type StakeholderNavRole =
  | "participant"
  | "creator"
  | "host"
  | "brand"
  | "merchant"
  | "agency"
  | "promoter"
  | "marketing"
  | "admin";

export type StakeholderObjectId = "today" | "world" | "activity" | "putIn" | "promoCard";

export type StakeholderDestination = {
  id: StakeholderObjectId;
  label: string;
  href: string;
  meaning: string;
  accent?: boolean;
};

export type StakeholderExtra = {
  label: string;
  href: string;
  group: "manage" | "utility";
};

export type StakeholderLens = {
  role: StakeholderNavRole;
  workspaceLabel: string;
  promise: string;
  ticker: string;
  putIn: { label: string; href: string; detail: string; stub: string };
  promoCard: { meaning: string };
  world: { label: string; meaning: string; href: string };
  activity: { label: string; meaning: string; href: string };
  destinations: StakeholderDestination[];
  extras: StakeholderExtra[];
};

const UTILITY_EXTRAS: StakeholderExtra[] = [
  { label: "Wallet", href: "/wallet", group: "utility" },
  { label: "Settings", href: "/dashboard/settings", group: "utility" },
];

const PEOPLE_EXTRAS: StakeholderExtra[] = [
  { label: "People", href: "/people", group: "manage" },
  { label: "Demand", href: "/demand", group: "manage" },
];

function destinations(parts: {
  world: StakeholderDestination;
  activity: StakeholderDestination;
  putIn: StakeholderDestination;
  promoCard: StakeholderDestination;
}): StakeholderDestination[] {
  return [
    { id: "today", label: "Today", href: "/dashboard", meaning: "Your next useful move." },
    parts.world,
    parts.activity,
    { ...parts.putIn, accent: true },
    parts.promoCard,
  ];
}

function lensParts(
  role: Exclude<StakeholderNavRole, "admin">,
  config: {
    workspaceLabel: string;
    promise: string;
    ticker: string;
    putIn: StakeholderLens["putIn"];
    promoCardMeaning: string;
    worldLabel: string;
    worldHref: string;
    worldMeaning: string;
    activityLabel: string;
    activityHref: string;
    activityMeaning: string;
    extras?: StakeholderExtra[];
  },
): StakeholderLens {
  const world: StakeholderDestination = {
    id: "world",
    label: config.worldLabel,
    href: config.worldHref,
    meaning: config.worldMeaning,
  };
  const activity: StakeholderDestination = {
    id: "activity",
    label: config.activityLabel,
    href: config.activityHref,
    meaning: config.activityMeaning,
  };
  const putIn: StakeholderDestination = {
    id: "putIn",
    label: config.putIn.label,
    href: config.putIn.href,
    meaning: config.putIn.detail,
  };
  const promoCard: StakeholderDestination = {
    id: "promoCard",
    label: "Card",
    href: "/card",
    meaning: config.promoCardMeaning,
  };
  return {
    role,
    workspaceLabel: config.workspaceLabel,
    promise: config.promise,
    ticker: config.ticker,
    putIn: config.putIn,
    promoCard: { meaning: config.promoCardMeaning },
    world: { label: config.worldLabel, meaning: config.worldMeaning, href: config.worldHref },
    activity: { label: config.activityLabel, meaning: config.activityMeaning, href: config.activityHref },
    destinations: destinations({ world, activity, putIn, promoCard }),
    extras: [...(config.extras || []), ...UTILITY_EXTRAS],
  };
}

const ROLE_LENSES: Record<Exclude<StakeholderNavRole, "admin">, StakeholderLens> = {
  participant: lensParts("participant", {
    workspaceLabel: "People",
    promise: "Keep useful value on PromoCard, then use it in the world.",
    ticker: "Your card is ready",
    putIn: {
      label: "Claim",
      href: "/earn",
      detail: "Take a live benefit onto PromoCard. It only counts if a merchant already put it up.",
      stub: "CLAIM",
    },
    promoCardMeaning: "What you can use now, nearby, and next.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "Where you can show up and use the card.",
    activityLabel: "Activity",
    activityHref: "/activity",
    activityMeaning: "What you did and what came back.",
    extras: PEOPLE_EXTRAS,
  }),
  creator: lensParts("creator", {
    workspaceLabel: "Creator",
    promise: "Share a live perk. You get paid after the merchant validates.",
    ticker: "Share what already exists",
    putIn: {
      label: "Share",
      href: "/earn",
      detail: "Take a merchant perk and drop it. Do not invent inventory.",
      stub: "SHARE",
    },
    promoCardMeaning: "What your people carry after they claim the drop.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "The Scene your story should move people through.",
    activityLabel: "Attributed",
    activityHref: "/activity",
    activityMeaning: "Joins, visits, and uses that came from your share.",
    extras: [
      { label: "Content drops", href: "/content-drops", group: "manage" },
      { label: "Studio", href: "/dashboard?view=studio", group: "manage" },
      ...PEOPLE_EXTRAS,
    ],
  }),
  host: lensParts("host", {
    workspaceLabel: "Host",
    promise: "Put tonight’s gathering in, attach a live perk, and see who showed up.",
    ticker: "Fill the room",
    putIn: {
      label: "Gather",
      href: "/create/moment",
      detail: "A host gathering is the place a perk gets used. Publishing it is not the finish.",
      stub: "HOST",
    },
    promoCardMeaning: "The pass guests carry to the door.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "The Scene your gathering lives in.",
    activityLabel: "Showed up",
    activityHref: "/happened",
    activityMeaning: "Arrivals, returns, and what the room actually did.",
    extras: [
      { label: "Door Check-Ins", href: "/organizer/check-ins", group: "manage" },
      ...PEOPLE_EXTRAS,
    ],
  }),
  merchant: lensParts("merchant", {
    workspaceLabel: "Merchant",
    promise: "Put one real perk up. Validate the code. See attributable spend.",
    ticker: "The loop starts with what you put up",
    putIn: {
      label: "Put up",
      href: "/stock",
      detail: "Supply one real benefit. Local drafts and flash toasts do not count.",
      stub: "STOCK",
    },
    promoCardMeaning: "The card people show at your counter.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "Where your perk can be used tonight.",
    activityLabel: "Used",
    activityHref: "/happened",
    activityMeaning: "Claims, redemptions, and people who came back.",
    extras: [
      { label: "Add venue", href: "/dashboard/venues/add", group: "manage" },
      { label: "Storefront", href: "/dashboard?view=studio&tab=storefront", group: "manage" },
      { label: "Redeem", href: "/staff/scanner", group: "manage" },
      ...PEOPLE_EXTRAS,
    ],
  }),
  brand: lensParts("brand", {
    workspaceLabel: "Brand",
    promise: "Fund a real benefit. Pay on recorded use, not impressions.",
    ticker: "Pay on recorded use",
    putIn: {
      label: "Fund",
      href: "/stock",
      detail: "Put inventory a merchant can validate. Creators share it; members use it.",
      stub: "FUND",
    },
    promoCardMeaning: "The member face of the benefit you funded.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "The Scene your funding should move.",
    activityLabel: "Attributed",
    activityHref: "/happened",
    activityMeaning: "Qualified actions after your benefit was used.",
    extras: [
      { label: "Launch campaign", href: "/create/campaign", group: "manage" },
      { label: "Campaigns", href: "/dashboard?view=studio", group: "manage" },
      ...PEOPLE_EXTRAS,
    ],
  }),
  agency: lensParts("agency", {
    workspaceLabel: "Agency",
    promise: "Put a client benefit in, then prove the first recorded result.",
    ticker: "Prove the client loop",
    putIn: {
      label: "Activate",
      href: "/create/campaign",
      detail: "Launch a client benefit people can claim and a merchant can validate.",
      stub: "CLIENT",
    },
    promoCardMeaning: "The card that proves the client offer reached a person.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "Where the client’s benefit should show up.",
    activityLabel: "Results",
    activityHref: "/happened",
    activityMeaning: "Recorded use across the clients you operate.",
    extras: [
      { label: "Clients", href: "/dashboard?view=studio&tab=clients", group: "manage" },
      ...PEOPLE_EXTRAS,
    ],
  }),
  promoter: lensParts("promoter", {
    workspaceLabel: "Promoter",
    promise: "Move a live drop. You earn after someone uses it.",
    ticker: "Move a live drop",
    putIn: {
      label: "Share",
      href: "/give",
      detail: "Hand out a drop that already exists. Attribution follows the use.",
      stub: "MOVE",
    },
    promoCardMeaning: "What the person you invited can actually use.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "Where the drop should be used.",
    activityLabel: "Activated",
    activityHref: "/happened",
    activityMeaning: "People who claimed and used because you shared.",
    extras: PEOPLE_EXTRAS,
  }),
  marketing: lensParts("marketing", {
    workspaceLabel: "Marketing",
    promise: "Put distribution behind a real benefit, then read attributed use.",
    ticker: "Distribution needs a live perk",
    putIn: {
      label: "Fund",
      href: "/stock",
      detail: "A campaign still needs inventory someone can claim and a merchant can validate.",
      stub: "FUND",
    },
    promoCardMeaning: "The member object your campaign is trying to fill.",
    worldLabel: "World",
    worldHref: "/discover",
    worldMeaning: "The Scene the campaign should move.",
    activityLabel: "Attributed",
    activityHref: "/happened",
    activityMeaning: "Use that can be tied back to the campaign.",
    extras: PEOPLE_EXTRAS,
  }),
};

const ADMIN_LENS: StakeholderLens = {
  role: "admin",
  workspaceLabel: "Admin",
  promise: "Keep the loop trusted: supply, proof, redemption, and return.",
  ticker: "Platform operations",
  putIn: {
    label: "Command",
    href: "/admin?tab=command",
    detail: "Watch supply, proof, and payout health.",
    stub: "OPS",
  },
  promoCard: { meaning: "Member value the platform must keep honest." },
  world: { label: "World", meaning: "Live Scenes, Moments, and venues.", href: "/discover" },
  activity: { label: "Activity", meaning: "System health and market movement.", href: "/admin?tab=overview" },
  destinations: [
    { id: "today", label: "Command", href: "/admin?tab=command", meaning: "Platform-wide operations." },
    { id: "world", label: "World", href: "/discover", meaning: "Live Scenes, Moments, and venues." },
    { id: "activity", label: "Activity", href: "/admin?tab=overview", meaning: "System health and market movement." },
    { id: "putIn", label: "Moments", href: "/admin?tab=moments", meaning: "Supply of Moments and venues.", accent: true },
    { id: "promoCard", label: "Users", href: "/admin?tab=users", meaning: "People, KYC, and access." },
  ],
  extras: UTILITY_EXTRAS,
};

export function normalizeStakeholderRole(role?: string | null): StakeholderNavRole {
  const key = String(role || "").toLowerCase();
  if (key === "explorer" || key === "member" || key === "people" || key === "guest") return "participant";
  if (
    key === "creator" ||
    key === "host" ||
    key === "brand" ||
    key === "merchant" ||
    key === "agency" ||
    key === "promoter" ||
    key === "marketing" ||
    key === "admin"
  ) {
    return key;
  }
  return "participant";
}

export function getStakeholderLens(role?: string | null): StakeholderLens {
  const normalized = normalizeStakeholderRole(role);
  if (normalized === "admin") return ADMIN_LENS;
  return ROLE_LENSES[normalized];
}

export function stakeholderPrimaryDestinations(role?: string | null): StakeholderDestination[] {
  return getStakeholderLens(role).destinations;
}

export function resolveStakeholderHomeMove(
  role?: string | null,
  facts: {
    communities?: number;
    perksGiven?: number;
    cardPerks?: number;
    hasInventory?: boolean;
  } = {},
): { href: string; label: string; copy: string; stub: string } {
  const lens = getStakeholderLens(role);
  const key = lens.role;

  if (key === "participant") {
    if ((facts.cardPerks || 0) === 0) {
      return {
        href: lens.world.href,
        label: "See what’s open",
        copy: lens.world.meaning,
        stub: "GO",
      };
    }
    return {
      href: "/card",
      label: "Open your PromoCard",
      copy: lens.promoCard.meaning,
      stub: "CARD",
    };
  }

  if ((key === "merchant" || key === "brand" || key === "marketing") && !facts.hasInventory && (facts.perksGiven || 0) === 0) {
    return {
      href: lens.putIn.href,
      label: lens.putIn.label,
      copy: lens.putIn.detail,
      stub: lens.putIn.stub,
    };
  }

  if (key === "host" && (facts.communities || 0) === 0) {
    return {
      href: lens.putIn.href,
      label: lens.putIn.label,
      copy: lens.putIn.detail,
      stub: lens.putIn.stub,
    };
  }

  return {
    href: lens.putIn.href,
    label: lens.putIn.label,
    copy: lens.putIn.detail,
    stub: lens.putIn.stub,
  };
}
