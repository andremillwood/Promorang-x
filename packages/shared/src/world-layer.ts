/**
 * PromoCard-centered world layer.
 *
 * Canonical product law: docs/design/promocard-world-experience-v1.md
 *
 * This module resolves presentation from server-trusted facts.
 * It never invents live density, financial Return, Crew progress, or path titles.
 */

export const WORLD_PHYSICS = {
  throw: "A person sends attention, presence, an invitation, content, money, support, or another useful action into the world.",
  flight: "That action moves through people, Places, Moments, Crews, merchants, creators, and Scenes.",
  impact: "Something verifiable changes.",
  return: "Useful value comes back: PromoCard value, access, a Piece, recognition, a relationship, or the next opening.",
  current: "The movement of culture through the world.",
  static: "Stagnation or fragmentation when nothing useful is moving.",
} as const;

export const WORLD_LAW_FOOTER = "What you put into the Scene changed what came back.";

export type WorldPathDimension = "discover" | "connect" | "create" | "host" | "keep" | "support";

export type WorldPathTitle = "Scout" | "Connector" | "Creator" | "Host" | "Keeper" | "Patron";

export const WORLD_PATH_TITLES: Record<WorldPathDimension, WorldPathTitle> = {
  discover: "Scout",
  connect: "Connector",
  create: "Creator",
  host: "Host",
  keep: "Keeper",
  support: "Patron",
};

export const PATH_EVIDENCE_THRESHOLD = 3;

export const SHOW_UP_ACTION_TYPES = [
  "MOMENT_ATTENDANCE",
  "check_in",
  "moment_join_verified",
  "proof_verified",
] as const;

export const ACTION_TO_PATH_DIMENSION: Record<string, WorldPathDimension> = {
  DISCOVERY_RESPONSE: "discover",
  discovery_vote: "discover",
  FRIEND_INVITE: "connect",
  REFERRAL: "connect",
  referral_activated: "connect",
  CONTENT_POST: "create",
  share_completed: "create",
  MOMENT_RSVP: "host",
  CUSTOM: "host",
  MOMENT_ATTENDANCE: "keep",
  check_in: "keep",
  moment_join_verified: "keep",
  proof_verified: "keep",
  PERK_CLAIM: "support",
  PERK_REDEMPTION: "support",
  PURCHASE: "support",
  MERCHANT_VISIT: "support",
  deal_claimed: "support",
  coupon_redeemed: "support",
  order_paid: "support",
  split_tender: "support",
};

export type WorldRunObjectiveKey = "attend_moment" | "support_place" | "bring_newcomer" | "keep_memory";

export type WorldSlicePlace = {
  name: string;
  area: string;
  role: string;
};

export type WorldSlice = {
  sceneSlug: string;
  sceneTitle: string;
  seasonKey: string;
  seasonTitle: string;
  area: string;
  collectionKey: string;
  collectionTitle: string;
  runSlug: string;
  runTitle: string;
  header: string;
  currentLine: string;
  signalEyebrow: string;
  welcome: string;
  places: WorldSlicePlace[];
  objectives: Array<{
    key: WorldRunObjectiveKey;
    title: string;
    proof: string;
    actionTypes: string[];
  }>;
};

/** Copy and configuration only. Never treat these as live attendance or Crew counts. */
export const KINGSTON_AFTER_DARK_SLICE: WorldSlice = {
  sceneSlug: "kingston-after-dark",
  sceneTitle: "Kingston After Dark",
  seasonKey: "the-city-wakes",
  seasonTitle: "The City Wakes",
  area: "Barbican",
  collectionKey: "first-current",
  collectionTitle: "First Current",
  runSlug: "barbican-run",
  runTitle: "Barbican Run",
  header: "Tonight in Kingston",
  currentLine: "The Current is moving through Barbican.",
  signalEyebrow: "A Signal appeared",
  welcome: "Find a night worth leaving home for. PromoCard is the passport that carries what comes back.",
  places: [
    { name: "Barbican", area: "St. Andrew", role: "First coherent test area" },
    { name: "Red Hills Road", area: "Kingston 19", role: "Participating corridor" },
    { name: "New Kingston", area: "Kingston", role: "After-hours corridor" },
  ],
  objectives: [
    {
      key: "attend_moment",
      title: "Show up at one participating Moment",
      proof: "Verified check-in or accepted proof",
      actionTypes: ["MOMENT_ATTENDANCE", "check_in", "moment_join_verified", "proof_verified"],
    },
    {
      key: "support_place",
      title: "Support one participating Place",
      proof: "Verified visit, purchase, or perk use",
      actionTypes: ["MERCHANT_VISIT", "PURCHASE", "PERK_REDEMPTION", "coupon_redeemed", "order_paid", "split_tender"],
    },
    {
      key: "bring_newcomer",
      title: "Bring one newcomer",
      proof: "Activated referral or attributed Scene join",
      actionTypes: ["FRIEND_INVITE", "REFERRAL", "referral_activated"],
    },
    {
      key: "keep_memory",
      title: "Retain one Memory",
      proof: "A Memory issued from verified participation",
      actionTypes: ["MOMENT_ATTENDANCE", "proof_verified"],
    },
  ],
};

export type WorldConsequenceFacts = {
  verified: boolean;
  pending?: boolean;
  actionType?: string | null;
  actorName?: string | null;
  momentTitle?: string | null;
  placeName?: string | null;
  sceneTitle?: string | null;
  seasonTitle?: string | null;
  promoCardEligible?: boolean;
  promoCardReturnLabel?: string | null;
  runTitle?: string | null;
  runCompleted?: number | null;
  runTotal?: number | null;
  pathCue?: string | null;
  memoryTitle?: string | null;
  memoryKept?: boolean;
  rewardTitle?: string | null;
  nextLabel?: string | null;
  nextHref?: string | null;
};

export type WorldConsequenceLine = {
  label: string;
  value: string;
  strong?: boolean;
};

export type WorldConsequenceReceipt = {
  counted: boolean;
  heading: string;
  eyebrow: string;
  lines: WorldConsequenceLine[];
  footer: string;
  next: { label: string; href: string } | null;
  kept: { title: string; kind: "memory" | "perk" | "none" } | null;
};

export function resolveWorldConsequence(facts: WorldConsequenceFacts): WorldConsequenceReceipt {
  if (facts.pending && !facts.verified) {
    return {
      counted: false,
      heading: "We received it",
      eyebrow: "Waiting to count",
      lines: [
        { label: "What happened", value: facts.momentTitle || "You showed up" },
        ...(facts.placeName ? [{ label: "Place", value: facts.placeName }] : []),
        { label: "What counted", value: "Proof is under review" },
        { label: "What opened next", value: "Recognition lands after it is accepted" },
      ],
      footer: "Nothing is celebrated as complete until it is verified.",
      next: facts.nextHref ? { label: facts.nextLabel || "See the Moment", href: facts.nextHref } : { label: "Open Vault", href: "/vault" },
      kept: null,
    };
  }

  if (!facts.verified) {
    return {
      counted: false,
      heading: "Not counted yet",
      eyebrow: "Still in motion",
      lines: [{ label: "What happened", value: "This action has not been verified." }],
      footer: "Promorang only keeps what it can prove.",
      next: { label: "Find a move", href: "/discover" },
      kept: null,
    };
  }

  const lines: WorldConsequenceLine[] = [
    { label: "What happened", value: facts.momentTitle ? `You showed up at ${facts.momentTitle}` : "You showed up", strong: true },
  ];
  if (facts.placeName) lines.push({ label: "Place", value: facts.placeName });
  if (facts.sceneTitle) lines.push({ label: "Scene", value: facts.sceneTitle });
  if (facts.seasonTitle) lines.push({ label: "Season", value: facts.seasonTitle });
  lines.push({ label: "What counted", value: "Verified presence" });

  if (facts.promoCardEligible) {
    lines.push({
      label: "What came back",
      value: facts.promoCardReturnLabel || "PromoCard · eligible refill",
      strong: true,
    });
  }
  if (facts.runTitle && facts.runTotal && facts.runCompleted != null) {
    lines.push({
      label: "Crew Run",
      value: `${facts.runTitle} · ${facts.runCompleted}/${facts.runTotal} objectives`,
    });
  }
  if (facts.pathCue) lines.push({ label: "Your path", value: facts.pathCue });
  if (facts.memoryKept && facts.memoryTitle) {
    lines.push({ label: "Kept", value: facts.memoryTitle, strong: true });
  } else if (facts.rewardTitle) {
    lines.push({ label: "Kept", value: facts.rewardTitle });
  }
  lines.push({
    label: "What opened next",
    value: facts.nextLabel || (facts.memoryKept ? "The memory is in your Vault" : "Look for the next Signal"),
  });

  return {
    counted: true,
    heading: "You showed up",
    eyebrow: "It counted",
    lines,
    footer: WORLD_LAW_FOOTER,
    next: facts.nextHref
      ? { label: facts.nextLabel || "See what opened", href: facts.nextHref }
      : { label: "Open Vault", href: "/vault" },
    kept: facts.memoryKept && facts.memoryTitle
      ? { title: facts.memoryTitle, kind: "memory" }
      : facts.rewardTitle
        ? { title: facts.rewardTitle, kind: "perk" }
        : null,
  };
}

export type WorldCurrentMoveFacts = {
  hasLiveMoment?: boolean;
  momentId?: string | null;
  momentTitle?: string | null;
  placeName?: string | null;
  sceneSlug?: string | null;
  sceneTitle?: string | null;
  seasonTitle?: string | null;
  joined?: boolean;
  arrived?: boolean;
  hasMemory?: boolean;
  hasPerk?: boolean;
  promoCardAccepted?: boolean;
  signalReason?: string | null;
  area?: string | null;
};

export type WorldCurrentMove = {
  eyebrow: string;
  header: string;
  title: string;
  why: string;
  ctaLabel: string;
  href: string;
  sceneTitle: string | null;
  seasonTitle: string | null;
  placeName: string | null;
  context: string[];
};

export function resolveWorldCurrentMove(facts: WorldCurrentMoveFacts, slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE): WorldCurrentMove {
  const sceneTitle = facts.sceneTitle || (facts.sceneSlug === slice.sceneSlug ? slice.sceneTitle : null);
  const seasonTitle = facts.seasonTitle || (facts.sceneSlug === slice.sceneSlug || !facts.sceneSlug ? slice.seasonTitle : null);
  const context = [
    sceneTitle,
    facts.placeName,
    facts.promoCardAccepted ? "PromoCard accepted" : null,
  ].filter((item): item is string => Boolean(item));

  if (facts.arrived && !facts.hasMemory) {
    return {
      eyebrow: "What opened",
      header: slice.header,
      title: "Keep what counted",
      why: "Your presence is verified. The Memory and any PromoCard Return now live in Vault.",
      ctaLabel: "Open Vault",
      href: "/vault",
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }

  if (facts.joined && facts.momentId) {
    return {
      eyebrow: "Your move",
      header: slice.header,
      title: facts.momentTitle ? `Check in at ${facts.momentTitle}` : "Check in when you arrive",
      why: facts.signalReason || "Let the host know you made it so PromoCard and the Scene can record what counted.",
      ctaLabel: "Check in",
      href: `/moments/${facts.momentId}/checkin`,
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }

  if (facts.hasLiveMoment && facts.momentId) {
    return {
      eyebrow: slice.signalEyebrow,
      header: slice.header,
      title: facts.momentTitle || "Follow the Signal",
      why: facts.signalReason || `${slice.currentLine} One clear move is enough.`,
      ctaLabel: "Follow Signal",
      href: `/moments/${facts.momentId}`,
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }

  if (facts.hasPerk) {
    return {
      eyebrow: "Your move",
      header: slice.header,
      title: "Use what is already on your PromoCard",
      why: "A perk is waiting. The next Return starts by using it at a participating Place.",
      ctaLabel: "Open PromoCard",
      href: "/card",
      sceneTitle,
      seasonTitle,
      placeName: facts.placeName || null,
      context,
    };
  }

  return {
    eyebrow: slice.signalEyebrow,
    header: slice.header,
    title: `Find a night in ${slice.sceneTitle}`,
    why: slice.welcome,
    ctaLabel: "Discover",
    href: `/scenes/${slice.sceneSlug}`,
    sceneTitle: slice.sceneTitle,
    seasonTitle: slice.seasonTitle,
    placeName: slice.area,
    context: [slice.sceneTitle, slice.area],
  };
}

export type PathEvidenceInput = {
  actionType?: string | null;
};

export type PathEvidence = {
  counts: Record<WorldPathDimension, number>;
  forming: boolean;
  title: WorldPathTitle | null;
  cue: string | null;
};

export function emptyPathCounts(): Record<WorldPathDimension, number> {
  return { discover: 0, connect: 0, create: 0, host: 0, keep: 0, support: 0 };
}

export function mapActionToPathDimension(actionType?: string | null): WorldPathDimension | null {
  if (!actionType) return null;
  if (ACTION_TO_PATH_DIMENSION[actionType]) return ACTION_TO_PATH_DIMENSION[actionType];
  if (actionType.startsWith("organic_")) return "create";
  return null;
}

export function resolvePathEvidence(actions: PathEvidenceInput[]): PathEvidence {
  const counts = emptyPathCounts();
  for (const action of actions || []) {
    const dimension = mapActionToPathDimension(action.actionType);
    if (dimension) counts[dimension] += 1;
  }
  const ranked = (Object.entries(counts) as Array<[WorldPathDimension, number]>).sort((a, b) => b[1] - a[1]);
  const [topDimension, topCount] = ranked[0] || ["keep", 0];
  const forming = topCount >= PATH_EVIDENCE_THRESHOLD;
  return {
    counts,
    forming,
    title: forming ? WORLD_PATH_TITLES[topDimension] : null,
    cue: forming ? `A path is forming · ${WORLD_PATH_TITLES[topDimension]}` : null,
  };
}

export type WorldRunObjectiveState = {
  key: WorldRunObjectiveKey;
  title: string;
  proof: string;
  complete: boolean;
};

export function resolveCrewRunProgress(
  actions: Array<{ actionType?: string | null; memoryKept?: boolean }>,
  slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE,
): { completed: number; total: number; objectives: WorldRunObjectiveState[] } {
  const types = new Set((actions || []).map((action) => String(action.actionType || "")));
  const keptMemory = (actions || []).some((action) => action.memoryKept);
  const objectives = slice.objectives.map((objective) => {
    const complete = objective.key === "keep_memory"
      ? keptMemory
      : objective.actionTypes.some((type) => types.has(type));
    return { key: objective.key, title: objective.title, proof: objective.proof, complete };
  });
  return {
    completed: objectives.filter((objective) => objective.complete).length,
    total: objectives.length,
    objectives,
  };
}

export function worldObjectState(input: {
  pulseState?: string | null;
  startsAt?: string | null;
  promoCardAccepted?: boolean;
  memoryAvailable?: boolean;
  sceneTitle?: string | null;
}): string[] {
  const chips: string[] = [];
  const pulse = String(input.pulseState || "").toLowerCase();
  if (pulse === "live") chips.push("Active now");
  else if (pulse === "forming") chips.push("Forming");
  else if (pulse === "cooling") chips.push("Winding down");
  else if (input.startsAt) {
    const start = new Date(input.startsAt).getTime();
    if (Number.isFinite(start) && start > Date.now()) chips.push("Upcoming");
  }
  if (input.promoCardAccepted) chips.push("PromoCard accepted");
  if (input.memoryAvailable) chips.push("Memory available");
  if (input.sceneTitle) chips.push(input.sceneTitle);
  return chips;
}

export function timeAwareWorldHeader(now: Date = new Date(), slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE): string {
  const hour = now.getHours();
  if (hour >= 17 || hour < 4) return slice.header;
  if (hour < 12) return "This morning in Kingston";
  return "Today in Kingston";
}

export type WorldFactionKey = "seekers" | "weavers" | "makers" | "keepers" | "stewards";

export type WorldFaction = {
  key: WorldFactionKey;
  title: string;
  verb: "discovery" | "connection" | "creation" | "memory" | "sustainability";
  line: string;
};

export const WORLD_FACTIONS: Record<WorldFactionKey, WorldFaction> = {
  seekers: { key: "seekers", title: "Seekers", verb: "discovery", line: "Find what the Current has not named yet." },
  weavers: { key: "weavers", title: "Weavers", verb: "connection", line: "Introduce people who should already know each other." },
  makers: { key: "makers", title: "Makers", verb: "creation", line: "Make the night worth remembering." },
  keepers: { key: "keepers", title: "Keepers", verb: "memory", line: "Keep what happened so the Scene does not forget." },
  stewards: { key: "stewards", title: "Stewards", verb: "sustainability", line: "Keep the Places able to do this again." },
};

export const WORLD_FACTION_KEYS = Object.keys(WORLD_FACTIONS) as WorldFactionKey[];

export function resolveFaction(key?: string | null): WorldFaction | null {
  if (!key) return null;
  return WORLD_FACTIONS[key as WorldFactionKey] || null;
}

export type CrewRunRoleKey = "captain" | "scout" | "chronicler" | "keeper";

export type CrewRunRole = {
  key: CrewRunRoleKey;
  title: string;
  job: string;
};

export const CREW_RUN_ROLES: Record<CrewRunRoleKey, CrewRunRole> = {
  captain: { key: "captain", title: "Captain", job: "Keep the Crew moving toward the Run." },
  scout: { key: "scout", title: "Scout", job: "Find the Signal and the room." },
  chronicler: { key: "chronicler", title: "Chronicler", job: "Keep proof of what counted." },
  keeper: { key: "keeper", title: "Keeper", job: "Hold the Memory and what came back." },
};

export const CREW_RUN_ROLE_KEYS = Object.keys(CREW_RUN_ROLES) as CrewRunRoleKey[];

export function resolveCrewRunRole(key?: string | null): CrewRunRole | null {
  if (!key) return null;
  return CREW_RUN_ROLES[key as CrewRunRoleKey] || null;
}

export type SceneHealthDimension = WorldFaction["verb"];

export type SceneHealth = {
  dimension: SceneHealthDimension;
  label: string;
  count: number;
};

const HEALTH_LABELS: Record<SceneHealthDimension, string> = {
  discovery: "Discovery",
  connection: "Connection",
  creation: "Creation",
  memory: "Memory",
  sustainability: "Sustainability",
};

const DIMENSION_TO_HEALTH: Record<WorldPathDimension, SceneHealthDimension> = {
  discover: "discovery",
  connect: "connection",
  create: "creation",
  host: "creation",
  keep: "memory",
  support: "sustainability",
};

export function resolveSceneHealth(actions: PathEvidenceInput[]): SceneHealth[] {
  const counts: Record<SceneHealthDimension, number> = {
    discovery: 0,
    connection: 0,
    creation: 0,
    memory: 0,
    sustainability: 0,
  };
  for (const action of actions || []) {
    const dimension = mapActionToPathDimension(action.actionType);
    if (dimension) counts[DIMENSION_TO_HEALTH[dimension]] += 1;
  }
  return (Object.keys(HEALTH_LABELS) as SceneHealthDimension[]).map((dimension) => ({
    dimension,
    label: HEALTH_LABELS[dimension],
    count: counts[dimension],
  }));
}

export function resolveSeasonDispatch(facts: {
  seasonTitle?: string | null;
  hasLiveMoment?: boolean;
  placeName?: string | null;
  now?: Date;
  slice?: WorldSlice;
}): { eyebrow: string; line: string } {
  const slice = facts.slice || KINGSTON_AFTER_DARK_SLICE;
  const season = facts.seasonTitle || slice.seasonTitle;
  if (facts.hasLiveMoment) {
    return {
      eyebrow: season,
      line: facts.placeName
        ? `A Signal is up at ${facts.placeName}. Follow it before the room thins.`
        : "A Signal is up. Follow it before the room thins.",
    };
  }
  return {
    eyebrow: season,
    line: slice.currentLine,
  };
}

export function resolveWorldMomentPhase(facts: {
  joined?: boolean;
  arrived?: boolean;
  hasMemory?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  now?: Date;
}): "before" | "during" | "after" {
  if (facts.hasMemory || facts.arrived) return "after";
  const now = (facts.now || new Date()).getTime();
  const start = facts.startsAt ? new Date(facts.startsAt).getTime() : NaN;
  const end = facts.endsAt ? new Date(facts.endsAt).getTime() : NaN;
  if (Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end) return "during";
  if (facts.joined && Number.isFinite(start) && now >= start) return "during";
  return "before";
}
