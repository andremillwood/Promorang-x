/**
 * PromoCard-centered world layer.
 *
 * Canonical product law: docs/design/promocard-world-experience-v1.md
 * Strategy layer: docs/design/promorang-world-system-v2.md
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
  imageUrl?: string | null;
};

export type WorldSliceObjective = {
  key: WorldRunObjectiveKey;
  title: string;
  proof: string;
  actionTypes: string[];
  imageUrl?: string | null;
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
  imageUrl?: string | null;
  places: WorldSlicePlace[];
  objectives: WorldSliceObjective[];
};

/** Editorial pictures for the first Kingston test area. Live Moment / Place photos always win. */
export const KINGSTON_SLICE_IMAGES = {
  run: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1400&q=80",
  barbican: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
  redHills: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80",
  newKingston: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80",
  attendMoment: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80",
  supportPlace: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
  bringNewcomer: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
  keepMemory: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80",
} as const;

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
  runTitle: "The City Wakes",
  header: "Tonight in Kingston",
  currentLine: "The Current is moving through Barbican.",
  signalEyebrow: "A Signal appeared",
  welcome: "Find a night worth leaving home for. PromoCard is the passport that carries what comes back.",
  imageUrl: KINGSTON_SLICE_IMAGES.run,
  places: [
    { name: "Barbican", area: "St. Andrew", role: "First coherent test area", imageUrl: KINGSTON_SLICE_IMAGES.barbican },
    { name: "Red Hills Road", area: "Kingston 19", role: "Participating corridor", imageUrl: KINGSTON_SLICE_IMAGES.redHills },
    { name: "New Kingston", area: "Kingston", role: "After-hours corridor", imageUrl: KINGSTON_SLICE_IMAGES.newKingston },
  ],
  objectives: [
    {
      key: "attend_moment",
      title: "Show up at one participating Moment",
      proof: "Verified check-in or accepted proof",
      actionTypes: ["MOMENT_ATTENDANCE", "check_in", "moment_join_verified", "proof_verified"],
      imageUrl: KINGSTON_SLICE_IMAGES.attendMoment,
    },
    {
      key: "support_place",
      title: "Support one participating Place",
      proof: "Verified visit, purchase, or perk use",
      actionTypes: ["MERCHANT_VISIT", "PURCHASE", "PERK_REDEMPTION", "coupon_redeemed", "order_paid", "split_tender"],
      imageUrl: KINGSTON_SLICE_IMAGES.supportPlace,
    },
    {
      key: "bring_newcomer",
      title: "Bring one newcomer",
      proof: "Activated referral or attributed Scene join",
      actionTypes: ["FRIEND_INVITE", "REFERRAL", "referral_activated"],
      imageUrl: KINGSTON_SLICE_IMAGES.bringNewcomer,
    },
    {
      key: "keep_memory",
      title: "Retain one Memory",
      proof: "A Memory issued from verified participation",
      actionTypes: ["MOMENT_ATTENDANCE", "proof_verified"],
      imageUrl: KINGSTON_SLICE_IMAGES.keepMemory,
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
  momentImageUrl?: string | null;
  placeImageUrl?: string | null;
  sceneImageUrl?: string | null;
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

export type WorldReceiptPictureKind = "moment" | "place" | "scene";

export type WorldReceiptPicture = {
  kind: WorldReceiptPictureKind;
  title: string;
  url: string;
};

export type WorldConsequenceReceipt = {
  counted: boolean;
  heading: string;
  eyebrow: string;
  lines: WorldConsequenceLine[];
  footer: string;
  next: { label: string; href: string } | null;
  kept: { title: string; kind: "memory" | "perk" | "none" } | null;
  pictures: WorldReceiptPicture[];
};

/** Barbican is the first corridor, not the name of the Crew Run. */
export function presentWorldRunTitle(
  title?: string | null,
  slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE,
): string {
  const raw = String(title || "").trim();
  if (!raw || /^barbican run$/i.test(raw) || raw === slice.runSlug) return slice.runTitle;
  return raw;
}

export const SCENE_WAITING_CONTEST_LINE =
  "The Scene is waiting for verified movement. Houses form from how people move — the war is Current versus Static.";

const STALE_CONTEST_LINE = /no philosophy|philosophy is moving|faction war/i;

/** Remap leftover V1 faction-war copy so a stale API cannot resurrect it. */
export function presentContestLine(
  line?: string | null,
  totalCurrent = 0,
): string {
  const raw = String(line || "").trim();
  if (totalCurrent <= 0 || !raw || STALE_CONTEST_LINE.test(raw)) {
    return SCENE_WAITING_CONTEST_LINE;
  }
  return raw;
}

export function firstPictureUrl(...urls: Array<string | null | undefined>): string | null {
  for (const url of urls) {
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return null;
}

export function pictureForPlaceName(
  placeName?: string | null,
  slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE,
): string | null {
  const hay = String(placeName || "").toLowerCase();
  if (!hay) return null;
  const match = slice.places.find((place) => hay.includes(place.name.toLowerCase()));
  if (match?.imageUrl) return match.imageUrl;
  if (hay.includes("barbican")) return firstPictureUrl(slice.places[0]?.imageUrl, KINGSTON_SLICE_IMAGES.barbican);
  return null;
}

export function resolveReceiptPictures(
  facts: Pick<WorldConsequenceFacts, "momentTitle" | "placeName" | "sceneTitle" | "momentImageUrl" | "placeImageUrl" | "sceneImageUrl">,
  slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE,
): WorldReceiptPicture[] {
  const pictures: WorldReceiptPicture[] = [];
  const seen = new Set<string>();
  const push = (kind: WorldReceiptPictureKind, title: string | null | undefined, url: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    pictures.push({ kind, title: title || (kind === "moment" ? "Moment" : kind === "place" ? "Place" : "Scene"), url });
  };

  push("moment", facts.momentTitle, firstPictureUrl(facts.momentImageUrl));
  push("place", facts.placeName, firstPictureUrl(facts.placeImageUrl, pictureForPlaceName(facts.placeName, slice)));
  if (facts.momentTitle && !pictures.some((picture) => picture.kind === "moment")) {
    push("moment", facts.momentTitle, firstPictureUrl(slice.objectives.find((item) => item.key === "attend_moment")?.imageUrl));
  }
  if (pictures.length < 2) {
    push("scene", facts.sceneTitle, firstPictureUrl(facts.sceneImageUrl, slice.imageUrl));
  }
  if (!pictures.length && (facts.momentTitle || facts.placeName)) {
    push("place", facts.placeName || slice.area, firstPictureUrl(slice.places[0]?.imageUrl, slice.imageUrl));
  }
  return pictures.slice(0, 2);
}

export function resolveWorldConsequence(facts: WorldConsequenceFacts): WorldConsequenceReceipt {
  const pictures = resolveReceiptPictures(facts);

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
      pictures,
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
      pictures,
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
      value: `${presentWorldRunTitle(facts.runTitle)} · ${facts.runCompleted}/${facts.runTotal} objectives`,
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
    pictures,
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
  momentImageUrl?: string | null;
  placeImageUrl?: string | null;
  sceneImageUrl?: string | null;
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
  imageUrl: string | null;
  imageAlt: string | null;
  context: string[];
};

export function resolveWorldCurrentMove(facts: WorldCurrentMoveFacts, slice: WorldSlice = KINGSTON_AFTER_DARK_SLICE): WorldCurrentMove {
  const sceneTitle = facts.sceneTitle || (facts.sceneSlug === slice.sceneSlug ? slice.sceneTitle : null);
  const seasonTitle = facts.seasonTitle || (facts.sceneSlug === slice.sceneSlug || !facts.sceneSlug ? slice.seasonTitle : null);
  const placeName = facts.placeName || null;
  const imageUrl = firstPictureUrl(
    facts.momentImageUrl,
    facts.placeImageUrl,
    pictureForPlaceName(facts.placeName, slice),
    facts.sceneImageUrl,
    slice.imageUrl,
  );
  const imageAlt = facts.momentTitle || facts.placeName || sceneTitle || slice.area;
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
      placeName,
      imageUrl,
      imageAlt,
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
      placeName,
      imageUrl,
      imageAlt,
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
      placeName,
      imageUrl,
      imageAlt,
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
      placeName,
      imageUrl,
      imageAlt,
      context,
    };
  }

  return {
    eyebrow: "What’s on",
    header: "Tonight",
    title: "Find a night worth leaving home for",
    why: "Browse live nights and places. A scene is optional — join one only if you want a room around a night you already care about.",
    ctaLabel: "Browse nights",
    href: "/discover?tab=moments",
    sceneTitle: null,
    seasonTitle: null,
    placeName: null,
    imageUrl: null,
    imageAlt: null,
    context: [],
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
  imageUrl?: string | null;
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
    return { key: objective.key, title: objective.title, proof: objective.proof, complete, imageUrl: objective.imageUrl || null };
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

export type CrewRunRoleKey = "captain" | "scout" | "connector" | "amplifier" | "chronicler" | "keeper";

export type CrewRunRole = {
  key: CrewRunRoleKey;
  title: string;
  job: string;
};

export const CREW_RUN_ROLES: Record<CrewRunRoleKey, CrewRunRole> = {
  captain: { key: "captain", title: "Captain", job: "Keep the Crew moving toward the Run." },
  scout: { key: "scout", title: "Scout", job: "Find the Signal and the room." },
  connector: { key: "connector", title: "Connector", job: "Bring the person who should be in the room." },
  amplifier: { key: "amplifier", title: "Amplifier", job: "Make the night visible." },
  chronicler: { key: "chronicler", title: "Amplifier", job: "Keep proof of what counted — now Amplifier." },
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

export const GUILD_CREW_MIN = 2;
export const GUILD_CREW_MAX = 6;

export function resolveGuildReadiness(crewCount: number): {
  crewCount: number;
  min: number;
  max: number;
  needsCrews: number;
  forming: boolean;
  ready: boolean;
  full: boolean;
  line: string;
} {
  const count = Math.max(0, Number(crewCount) || 0);
  const needsCrews = Math.max(0, GUILD_CREW_MIN - count);
  const forming = count < GUILD_CREW_MIN;
  const full = count >= GUILD_CREW_MAX;
  return {
    crewCount: count,
    min: GUILD_CREW_MIN,
    max: GUILD_CREW_MAX,
    needsCrews,
    forming,
    ready: !forming && !full,
    full,
    line: forming
      ? `Need ${needsCrews} more ${needsCrews === 1 ? "Crew" : "Crews"} before this is a Guild.`
      : full
        ? "This Guild is full. Coordinate the Scene from here."
        : `${count} Crews coordinating one Scene.`,
  };
}

export type WorldAreaKey = "barbican" | "red-hills" | "new-kingston";

export type WorldArea = {
  key: WorldAreaKey;
  title: string;
  corridor: string;
  aliases: string[];
};

export const KINGSTON_AREAS: WorldArea[] = [
  { key: "barbican", title: "Barbican", corridor: "First coherent test area", aliases: ["barbican"] },
  { key: "red-hills", title: "Red Hills Road", corridor: "Participating corridor", aliases: ["red hills", "red-hills", "kingston 19"] },
  { key: "new-kingston", title: "New Kingston", corridor: "After-hours corridor", aliases: ["new kingston"] },
];

export const WORLD_AREA_KEYS = KINGSTON_AREAS.map((area) => area.key);

export function resolveArea(key?: string | null): WorldArea | null {
  if (!key) return null;
  return KINGSTON_AREAS.find((area) => area.key === key) || null;
}

export function resolveAreaKey(text?: string | null, explicitKey?: string | null): WorldAreaKey | null {
  if (explicitKey && resolveArea(explicitKey)) return explicitKey as WorldAreaKey;
  const hay = String(text || "").toLowerCase();
  if (!hay) return null;
  for (const area of KINGSTON_AREAS) {
    if (area.aliases.some((alias) => hay.includes(alias))) return area.key;
  }
  return null;
}

export type TerritoryState = "unknown" | "known" | "held" | "stewarded";

export type TerritoryStanding = {
  key: WorldAreaKey;
  title: string;
  corridor: string;
  state: TerritoryState;
  standingLine: string;
  presenceCount: number;
  supportCount: number;
};

const TERRITORY_LINES: Record<TerritoryState, (title: string) => string> = {
  unknown: (title) => `${title} has no proven standing yet.`,
  known: (title) => `${title} is known. Someone showed up or supported a Place.`,
  held: (title) => `${title} is held. Repeated verified presence is keeping it in the Current.`,
  stewarded: (title) => `${title} is stewarded. Presence and support are keeping the Places able to do this again.`,
};

export function resolveTerritoryStanding(input: {
  areaKey: WorldAreaKey;
  presenceCount?: number;
  supportCount?: number;
}): TerritoryStanding {
  const area = resolveArea(input.areaKey) || KINGSTON_AREAS[0];
  const presenceCount = Math.max(0, Number(input.presenceCount) || 0);
  const supportCount = Math.max(0, Number(input.supportCount) || 0);
  const total = presenceCount + supportCount;
  let state: TerritoryState = "unknown";
  if (total >= 5 && supportCount >= 1) state = "stewarded";
  else if (total >= 3) state = "held";
  else if (total >= 1) state = "known";
  return {
    key: area.key,
    title: area.title,
    corridor: area.corridor,
    state,
    standingLine: TERRITORY_LINES[state](area.title),
    presenceCount,
    supportCount,
  };
}

export function resolveKingstonTerritories(
  counts: Partial<Record<WorldAreaKey, { presenceCount?: number; supportCount?: number }>> = {},
): TerritoryStanding[] {
  return KINGSTON_AREAS.map((area) => resolveTerritoryStanding({
    areaKey: area.key,
    presenceCount: counts[area.key]?.presenceCount,
    supportCount: counts[area.key]?.supportCount,
  }));
}

export type CurrentPolarity = "current" | "thin" | "static";

export function resolveCurrentStatic(input: {
  currentCount?: number;
  lastActionAt?: string | null;
  now?: Date;
}): { polarity: CurrentPolarity; currentCount: number; line: string } {
  const currentCount = Math.max(0, Number(input.currentCount) || 0);
  const now = (input.now || new Date()).getTime();
  const last = input.lastActionAt ? new Date(input.lastActionAt).getTime() : NaN;
  const stale = Number.isFinite(last) ? now - last > 7 * 24 * 60 * 60 * 1000 : currentCount === 0;
  if (currentCount <= 0 || stale) {
    return {
      polarity: "static",
      currentCount,
      line: "The Scene is Static. Nothing useful has moved recently.",
    };
  }
  if (currentCount < 3) {
    return {
      polarity: "thin",
      currentCount,
      line: "The Current is thin. One more verified move can turn it.",
    };
  }
  return {
    polarity: "current",
    currentCount,
    line: "The Current is moving. Keep it from going still.",
  };
}

export type FactionContestStanding = {
  key: WorldFactionKey;
  title: string;
  verb: WorldFaction["verb"];
  current: number;
  rank: number;
};

export type FactionContest = {
  board: FactionContestStanding[];
  leadingCurrent: WorldFactionKey | null;
  contestLine: string;
  mixedCrewNote: string | null;
  totalCurrent: number;
  unalignedCurrent: number;
};

export function resolveFactionContest(input: {
  factionCurrents?: Partial<Record<WorldFactionKey, number>>;
  unalignedCurrent?: number;
  mixedCrew?: boolean;
} = {}): FactionContest {
  const currents = input.factionCurrents || {};
  const ranked = WORLD_FACTION_KEYS
    .map((key) => ({
      key,
      title: WORLD_FACTIONS[key].title,
      verb: WORLD_FACTIONS[key].verb,
      current: Math.max(0, Number(currents[key]) || 0),
    }))
    .sort((a, b) => b.current - a.current || a.key.localeCompare(b.key));

  let rank = 0;
  let previous = -1;
  const board = ranked.map((row, index) => {
    if (row.current !== previous) {
      rank = index + 1;
      previous = row.current;
    }
    return { ...row, rank };
  });

  const top = board[0];
  const tied = Boolean(top && top.current > 0 && board.filter((row) => row.current === top.current).length > 1);
  const leadingCurrent = top && top.current > 0 && !tied ? top.key : null;
  const unalignedCurrent = Math.max(0, Number(input.unalignedCurrent) || 0);
  const totalCurrent = board.reduce((sum, row) => sum + row.current, 0) + unalignedCurrent;

  let contestLine = SCENE_WAITING_CONTEST_LINE;
  if (leadingCurrent) {
    contestLine = `${WORLD_FACTIONS[leadingCurrent].title} lead ${WORLD_FACTIONS[leadingCurrent].verb}. The war is Current versus Static — not people versus people.`;
  } else if (tied && top) {
    const names = board.filter((row) => row.current === top.current).map((row) => row.title);
    contestLine = `${names.join(" and ")} are even. Mixed Crews usually move a Scene further than one banner.`;
  }

  return {
    board,
    leadingCurrent,
    contestLine,
    mixedCrewNote: input.mixedCrew
      ? "This Crew holds more than one philosophy. That is valid, and usually stronger."
      : null,
    totalCurrent,
    unalignedCurrent,
  };
}
