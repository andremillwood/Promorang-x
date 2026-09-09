/**
 * Promorang World System V2 — foundation resolvers.
 *
 * Canonical proposal: docs/design/promorang-world-system-v2.md
 * Product law: DESIGN.md + docs/design/promocard-world-experience-v1.md
 *
 * Derives presentation from server-trusted verified actions.
 * Never invents density, financial Return, or House identity before evidence.
 * Never writes PromoCard / Gems balances.
 */

import {
  mapActionToPathDimension,
  type WorldPathDimension,
  type WorldPathTitle,
} from "./world-layer";

export const WORLD_SYSTEM_RULE_VERSION = "2026-09-08.v2a";

export type WorldSystemPhase =
  | "foundation"
  | "identity"
  | "competition"
  | "livingWorld"
  | "distribution"
  | "endgame";

export type WorldSystemPhases = Record<WorldSystemPhase, boolean>;

export function resolveWorldSystemPhases(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): WorldSystemPhases {
  return {
    foundation: true,
    identity: env.WORLD_SYSTEM_IDENTITY !== "0",
    competition: env.WORLD_SYSTEM_COMPETITION === "1",
    livingWorld: env.WORLD_SYSTEM_LIVING_WORLD === "1",
    distribution: env.WORLD_SYSTEM_DISTRIBUTION === "1",
    endgame: env.WORLD_SYSTEM_ENDGAME === "1",
  };
}

export const WORLD_SYSTEM_EVENTS = [
  "resonance_progressed",
  "house_revealed",
  "trait_earned",
  "path_progressed",
  "throw_created",
  "return_chain_extended",
  "challenge_joined",
  "challenge_completed",
  "run_objective_completed",
  "technique_used",
  "convergence_joined",
  "convergence_scored",
  "secret_revealed",
  "rumour_confirmed",
  "place_state_changed",
  "discovery_nominated",
  "merchant_joined_from_discovery",
] as const;

export type WorldSystemEventKind = (typeof WORLD_SYSTEM_EVENTS)[number];

export type WorldElement = "fire" | "water" | "air" | "earth";
export type WorldHouseKey = "ember" | "tide" | "radiant" | "grove";

export type WorldHouse = {
  key: WorldHouseKey;
  title: string;
  element: WorldElement;
  color: string;
  philosophy: string;
  orientation: string;
  line: string;
};

export const WORLD_HOUSES: Record<WorldHouseKey, WorldHouse> = {
  ember: {
    key: "ember",
    title: "Ember",
    element: "fire",
    color: "#C62828",
    philosophy: "Ignite",
    orientation: "starting, leading, activating",
    line: "You start rooms and wake what was still.",
  },
  tide: {
    key: "tide",
    title: "Tide",
    element: "water",
    color: "#1565C0",
    philosophy: "Connect",
    orientation: "gathering, introducing, mobilizing",
    line: "You bring people who should already know each other.",
  },
  radiant: {
    key: "radiant",
    title: "Radiant",
    element: "air",
    color: "#F9A825",
    philosophy: "Amplify",
    orientation: "discovering, creating, spreading Signals",
    line: "You make the night visible.",
  },
  grove: {
    key: "grove",
    title: "Grove",
    element: "earth",
    color: "#2E7D32",
    philosophy: "Sustain",
    orientation: "supporting, returning, strengthening Places",
    line: "You keep Places able to do this again.",
  },
};

export const WORLD_HOUSE_KEYS = Object.keys(WORLD_HOUSES) as WorldHouseKey[];

export const ELEMENT_TO_HOUSE: Record<WorldElement, WorldHouseKey> = {
  fire: "ember",
  water: "tide",
  air: "radiant",
  earth: "grove",
};

export const HOUSE_TO_ELEMENT: Record<WorldHouseKey, WorldElement> = {
  ember: "fire",
  tide: "water",
  radiant: "air",
  grove: "earth",
};

/** Optional V1 faction → House, for migration display only. Never grants Resonance. */
export const FACTION_TO_HOUSE: Record<string, WorldHouseKey> = {
  seekers: "radiant",
  weavers: "tide",
  makers: "radiant",
  keepers: "grove",
  stewards: "grove",
};

export function resolveHouse(key?: string | null): WorldHouse | null {
  if (!key) return null;
  return WORLD_HOUSES[key as WorldHouseKey] || null;
}

export type WorldActionFact = {
  id?: string | null;
  actionType?: string | null;
  verifiedAt?: string | Date | null;
  userId?: string | null;
  referrerId?: string | null;
  contributorId?: string | null;
  merchantId?: string | null;
  placeId?: string | null;
  placeName?: string | null;
  sceneId?: string | null;
  momentId?: string | null;
  firstMover?: boolean;
  invalid?: boolean;
  fulfilled?: boolean;
};

export const IGNORED_RESONANCE_ACTIONS = new Set([
  "login",
  "open_screen",
  "tap",
  "scroll",
  "page_view",
  "session_start",
]);

/**
 * Versioned evidence map. UI must not scatter these weights.
 * Values are units of Resonance, not Gems or PromoCard balance.
 */
export const RESONANCE_ACTION_WEIGHTS: Record<string, Partial<Record<WorldElement, number>>> = {
  CUSTOM: { fire: 1 },
  MOMENT_RSVP: { fire: 0.5, air: 0.5 },
  FRIEND_INVITE: { water: 1 },
  REFERRAL: { water: 1 },
  referral_activated: { water: 2 },
  DISCOVERY_RESPONSE: { air: 1 },
  discovery_vote: { air: 1 },
  CONTENT_POST: { air: 1 },
  share_completed: { air: 1 },
  MOMENT_ATTENDANCE: { earth: 1 },
  check_in: { earth: 1 },
  moment_join_verified: { earth: 1 },
  proof_verified: { earth: 1 },
  PERK_REDEMPTION: { earth: 2 },
  MERCHANT_VISIT: { earth: 1.5 },
  PURCHASE: { earth: 1.5 },
  coupon_redeemed: { earth: 1.5 },
  order_paid: { earth: 1.5 },
  split_tender: { earth: 1.5 },
  PERK_CLAIM: { earth: 0.5 },
  deal_claimed: { earth: 0.5 },
};

export const RESONANCE_STAGE_TOTALS = { forming: 3, affinity: 6, reveal: 10 } as const;
export const HOUSE_REVEAL_SHARE = 0.4;
export const HOUSE_REVEAL_LEAD = 2;
export const HOUSE_SWITCH_LEAD = 4;

export type ResonanceScores = Record<WorldElement, number>;

export type ResonanceState = {
  ruleVersion: string;
  scores: ResonanceScores;
  total: number;
  stage: 0 | 1 | 2 | 3;
  cue: string | null;
  primaryElement: WorldElement | null;
  houseKey: WorldHouseKey | null;
  house: WorldHouse | null;
  revealEligible: boolean;
};

export function emptyResonanceScores(): ResonanceScores {
  return { fire: 0, water: 0, air: 0, earth: 0 };
}

export function mapActionToResonance(actionType?: string | null): Partial<Record<WorldElement, number>> | null {
  if (!actionType || IGNORED_RESONANCE_ACTIONS.has(actionType)) return null;
  if (RESONANCE_ACTION_WEIGHTS[actionType]) return RESONANCE_ACTION_WEIGHTS[actionType];
  if (actionType.startsWith("organic_")) return { air: 1 };
  return null;
}

function rankedElements(scores: ResonanceScores): Array<[WorldElement, number]> {
  return (Object.entries(scores) as Array<[WorldElement, number]>).sort((a, b) => b[1] - a[1]);
}

export function resolveResonance(actions: WorldActionFact[]): ResonanceState {
  const scores = emptyResonanceScores();
  const seen = new Set<string>();
  for (const action of actions || []) {
    if (action.invalid) continue;
    const dedupe = action.id ? `id:${action.id}` : `${action.actionType}:${action.verifiedAt}:${action.userId}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const weights = mapActionToResonance(action.actionType);
    if (!weights) continue;
    for (const [element, weight] of Object.entries(weights) as Array<[WorldElement, number]>) {
      scores[element] += weight;
    }
  }

  const total = scores.fire + scores.water + scores.air + scores.earth;
  const ranked = rankedElements(scores);
  const [top, topScore] = ranked[0] || ["earth", 0];
  const secondScore = ranked[1]?.[1] || 0;
  const share = total > 0 ? topScore / total : 0;
  const clearLead = topScore >= secondScore + HOUSE_REVEAL_LEAD && share >= HOUSE_REVEAL_SHARE;

  let stage: ResonanceState["stage"] = 0;
  if (total >= RESONANCE_STAGE_TOTALS.reveal && clearLead) stage = 3;
  else if (total >= RESONANCE_STAGE_TOTALS.affinity && topScore > secondScore) stage = 2;
  else if (total >= RESONANCE_STAGE_TOTALS.forming) stage = 1;

  const houseKey = stage >= 2 ? ELEMENT_TO_HOUSE[top] : null;
  const revealEligible = stage === 3;
  const cue =
    stage === 0
      ? null
      : stage === 1
        ? "A Resonance is forming"
        : stage === 2
          ? `${WORLD_HOUSES[ELEMENT_TO_HOUSE[top]].title} affinity is visible`
          : `${WORLD_HOUSES[ELEMENT_TO_HOUSE[top]].title} can be named`;

  return {
    ruleVersion: WORLD_SYSTEM_RULE_VERSION,
    scores,
    total,
    stage,
    cue,
    primaryElement: stage >= 2 ? top : null,
    houseKey,
    house: houseKey ? WORLD_HOUSES[houseKey] : null,
    revealEligible,
  };
}

export type HouseAssignment = {
  houseKey: WorldHouseKey | null;
  persist: boolean;
  revealed: boolean;
  switched: boolean;
};

export function resolveHouseAssignment(input: {
  currentHouse?: string | null;
  revealedAt?: string | Date | null;
  candidate?: WorldHouseKey | null;
  revealEligible?: boolean;
  scores?: ResonanceScores;
}): HouseAssignment {
  const current = resolveHouse(input.currentHouse);
  const candidate = resolveHouse(input.candidate);
  if (!candidate || !input.revealEligible) {
    return { houseKey: current?.key || null, persist: false, revealed: false, switched: false };
  }
  if (!current) {
    return { houseKey: candidate.key, persist: true, revealed: true, switched: false };
  }
  if (current.key === candidate.key) {
    return { houseKey: current.key, persist: false, revealed: false, switched: false };
  }
  const scores = input.scores || emptyResonanceScores();
  const candidateScore = scores[HOUSE_TO_ELEMENT[candidate.key]] || 0;
  const currentScore = scores[HOUSE_TO_ELEMENT[current.key]] || 0;
  if (candidateScore >= currentScore + HOUSE_SWITCH_LEAD) {
    return { houseKey: candidate.key, persist: true, revealed: false, switched: true };
  }
  return { houseKey: current.key, persist: false, revealed: false, switched: false };
}

export type InfluenceKind =
  | "attendance"
  | "newcomer"
  | "redemption"
  | "discovery"
  | "content_movement"
  | "return_chain";

export const INFLUENCE_ACTION_WEIGHTS: Record<string, { kind: InfluenceKind; weight: number }> = {
  MOMENT_ATTENDANCE: { kind: "attendance", weight: 1 },
  check_in: { kind: "attendance", weight: 1 },
  moment_join_verified: { kind: "attendance", weight: 1 },
  proof_verified: { kind: "attendance", weight: 1 },
  referral_activated: { kind: "newcomer", weight: 2 },
  FRIEND_INVITE: { kind: "newcomer", weight: 1 },
  REFERRAL: { kind: "newcomer", weight: 1 },
  PERK_REDEMPTION: { kind: "redemption", weight: 2 },
  coupon_redeemed: { kind: "redemption", weight: 2 },
  MERCHANT_VISIT: { kind: "redemption", weight: 1 },
  order_paid: { kind: "redemption", weight: 2 },
  split_tender: { kind: "redemption", weight: 2 },
  DISCOVERY_RESPONSE: { kind: "discovery", weight: 1 },
  discovery_vote: { kind: "discovery", weight: 1 },
  share_completed: { kind: "content_movement", weight: 1 },
  CONTENT_POST: { kind: "content_movement", weight: 1 },
};

export type InfluenceState = {
  ruleVersion: string;
  score: number;
  counted: number;
  byKind: Record<InfluenceKind, number>;
  line: string | null;
};

export function emptyInfluenceKinds(): Record<InfluenceKind, number> {
  return {
    attendance: 0,
    newcomer: 0,
    redemption: 0,
    discovery: 0,
    content_movement: 0,
    return_chain: 0,
  };
}

export function resolveInfluence(actions: WorldActionFact[]): InfluenceState {
  const byKind = emptyInfluenceKinds();
  const seen = new Set<string>();
  let score = 0;
  let counted = 0;
  for (const action of actions || []) {
    if (action.invalid) continue;
    const key = action.id ? `id:${action.id}` : `${action.actionType}:${action.verifiedAt}:${action.userId}`;
    if (seen.has(key)) continue;
    const weight = action.actionType ? INFLUENCE_ACTION_WEIGHTS[action.actionType] : null;
    if (!weight) continue;
    seen.add(key);
    byKind[weight.kind] += weight.weight;
    score += weight.weight;
    counted += 1;
  }
  return {
    ruleVersion: WORLD_SYSTEM_RULE_VERSION,
    score,
    counted,
    byKind,
    line: score > 0 ? `You helped ${counted} verified ${counted === 1 ? "movement" : "movements"}` : null,
  };
}

export type ReputationState = {
  ruleVersion: string;
  score: number | null;
  fulfilled: number;
  invalid: number;
  visible: boolean;
  line: string | null;
};

export function resolveReputation(actions: WorldActionFact[]): ReputationState {
  let fulfilled = 0;
  let invalid = 0;
  for (const action of actions || []) {
    if (action.invalid) {
      invalid += 1;
      continue;
    }
    const type = String(action.actionType || "");
    if (
      type === "MOMENT_ATTENDANCE" ||
      type === "check_in" ||
      type === "proof_verified" ||
      type === "PERK_REDEMPTION" ||
      type === "referral_activated" ||
      action.fulfilled
    ) {
      fulfilled += 1;
    }
  }
  const evidence = fulfilled + invalid;
  const visible = fulfilled >= 3;
  const ratio = evidence === 0 ? 0 : fulfilled / evidence;
  const score = visible ? Math.round(ratio * 100) : null;
  return {
    ruleVersion: WORLD_SYSTEM_RULE_VERSION,
    score,
    fulfilled,
    invalid,
    visible,
    line: visible ? `Trusted on ${fulfilled} verified ${fulfilled === 1 ? "move" : "moves"}` : null,
  };
}

export const THROW_ACTION_TYPES = [
  "FRIEND_INVITE",
  "REFERRAL",
  "referral_activated",
  "share_completed",
  "CONTENT_POST",
  "DISCOVERY_RESPONSE",
  "discovery_vote",
] as const;

export function isThrowAction(actionType?: string | null): boolean {
  if (!actionType) return false;
  return (THROW_ACTION_TYPES as readonly string[]).includes(actionType);
}

export type ReturnChainHop = {
  actionType: string;
  actorId?: string | null;
};

export type ReturnChainState = {
  counted: boolean;
  heading: string | null;
  hops: number;
  movements: number;
  influence: number;
  moving: boolean;
  line: string | null;
};

export function resolveReturnChain(input: {
  origin?: WorldActionFact | null;
  downstream?: WorldActionFact[];
  now?: Date;
}): ReturnChainState {
  const origin = input.origin;
  const empty: ReturnChainState = {
    counted: false,
    heading: null,
    hops: 0,
    movements: 0,
    influence: 0,
    moving: false,
    line: null,
  };
  if (!origin || !isThrowAction(origin.actionType) || origin.invalid) return empty;

  const originActor = origin.userId || origin.contributorId;
  const hops = (input.downstream || []).filter((action) => {
    if (action.invalid || !action.actionType) return false;
    if (!INFLUENCE_ACTION_WEIGHTS[action.actionType] && !isThrowAction(action.actionType)) return false;
    return Boolean(
      (originActor && (action.referrerId === originActor || action.contributorId === originActor)) ||
        (origin.id && action.referrerId && action.referrerId === origin.id),
    );
  });

  if (!hops.length) return empty;

  const influence = hops.reduce((sum, action) => {
    const weight = action.actionType ? INFLUENCE_ACTION_WEIGHTS[action.actionType]?.weight || 0 : 0;
    return sum + weight;
  }, 0);
  const now = input.now || new Date();
  const last = hops
    .map((action) => new Date(action.verifiedAt || 0).getTime())
    .filter((time) => Number.isFinite(time))
    .sort((a, b) => b - a)[0];
  const moving = Boolean(last && now.getTime() - last < 14 * 24 * 60 * 60 * 1000);

  return {
    counted: true,
    heading: "Your Throw returned",
    hops: hops.length,
    movements: hops.length,
    influence,
    moving,
    line: `${hops.length} verified ${hops.length === 1 ? "movement" : "movements"} came back`,
  };
}

export type WorldTraitKey =
  | "early_mover"
  | "night_owl"
  | "loyalist"
  | "explorer"
  | "tastemaker"
  | "reliable"
  | "scene_keeper";

export type WorldTrait = {
  key: WorldTraitKey;
  title: string;
  criteria: string;
};

export const WORLD_TRAITS: Record<WorldTraitKey, WorldTrait> = {
  early_mover: { key: "early_mover", title: "Early Mover", criteria: "First verified mover on a qualifying Moment." },
  night_owl: { key: "night_owl", title: "Night Owl", criteria: "Most show-ups after 9pm." },
  loyalist: { key: "loyalist", title: "Loyalist", criteria: "Three verified supports at the same Place." },
  explorer: { key: "explorer", title: "Explorer", criteria: "Verified presence at three different Places." },
  tastemaker: { key: "tastemaker", title: "Tastemaker", criteria: "A discovery or share that produced verified movement." },
  reliable: { key: "reliable", title: "Reliable", criteria: "Three fulfilled show-ups and no invalid proof." },
  scene_keeper: { key: "scene_keeper", title: "Scene Keeper", criteria: "Five verified keep or support actions in one Scene." },
};

export function resolveTraits(actions: WorldActionFact[]): WorldTrait[] {
  const list = actions || [];
  const earned: WorldTrait[] = [];

  if (list.some((action) => action.firstMover && !action.invalid)) earned.push(WORLD_TRAITS.early_mover);

  const showUps = list.filter((action) => ["MOMENT_ATTENDANCE", "check_in", "moment_join_verified"].includes(String(action.actionType)));
  const night = showUps.filter((action) => {
    const hour = new Date(action.verifiedAt || 0).getHours();
    return Number.isFinite(hour) && (hour >= 21 || hour < 4);
  });
  if (showUps.length >= 3 && night.length * 2 >= showUps.length) earned.push(WORLD_TRAITS.night_owl);

  const supportByPlace = new Map<string, number>();
  const places = new Set<string>();
  for (const action of list) {
    if (action.invalid) continue;
    const place = action.placeId || action.merchantId || action.placeName;
    if (place) places.add(String(place));
    const dimension = mapActionToPathDimension(action.actionType);
    if (dimension === "support" && place) {
      supportByPlace.set(String(place), (supportByPlace.get(String(place)) || 0) + 1);
    }
  }
  if ([...supportByPlace.values()].some((count) => count >= 3)) earned.push(WORLD_TRAITS.loyalist);
  if (places.size >= 3) earned.push(WORLD_TRAITS.explorer);

  const throwReturned = list.some((origin) => resolveReturnChain({ origin, downstream: list }).counted);
  if (throwReturned) earned.push(WORLD_TRAITS.tastemaker);

  const reputation = resolveReputation(list);
  if (reputation.fulfilled >= 3 && reputation.invalid === 0) earned.push(WORLD_TRAITS.reliable);

  const sceneKeep = new Map<string, number>();
  for (const action of list) {
    if (action.invalid || !action.sceneId) continue;
    const dimension = mapActionToPathDimension(action.actionType);
    if (dimension === "keep" || dimension === "support") {
      sceneKeep.set(action.sceneId, (sceneKeep.get(action.sceneId) || 0) + 1);
    }
  }
  if ([...sceneKeep.values()].some((count) => count >= 5)) earned.push(WORLD_TRAITS.scene_keeper);

  return earned;
}

export type WorldTitleKey =
  | "first_wave"
  | "founder"
  | "keeper_of_barbican"
  | "wayfinder"
  | "signal_hunter"
  | "merchant_ally"
  | "crew_captain"
  | "archivist"
  | "pioneer";

export type WorldTitle = {
  key: WorldTitleKey;
  title: string;
  criteria: string;
};

export const WORLD_TITLES: Record<WorldTitleKey, WorldTitle> = {
  first_wave: { key: "first_wave", title: "First Wave", criteria: "Among the first verified seats in a Scene season." },
  founder: { key: "founder", title: "Founder", criteria: "Founded a Crew that completed a Run." },
  keeper_of_barbican: { key: "keeper_of_barbican", title: "Keeper of Barbican", criteria: "Stewarded Barbican standing from verified presence and support." },
  wayfinder: { key: "wayfinder", title: "Wayfinder", criteria: "Path Scout after three verified discoveries." },
  signal_hunter: { key: "signal_hunter", title: "Signal Hunter", criteria: "Confirmed a Rumour or accepted discovery that moved people." },
  merchant_ally: { key: "merchant_ally", title: "Merchant Ally", criteria: "Path Patron after three verified Place supports." },
  crew_captain: { key: "crew_captain", title: "Crew Captain", criteria: "Held Captain on a completed Run." },
  archivist: { key: "archivist", title: "Archivist", criteria: "Kept three Memories from verified nights." },
  pioneer: { key: "pioneer", title: "Pioneer", criteria: "Canonical Pioneer program — not granted by world-only math." },
};

export function resolveTitles(input: {
  pathTitle?: WorldPathTitle | null;
  pathCounts?: Partial<Record<WorldPathDimension, number>>;
  memoriesKept?: number;
  barbicanStewarded?: boolean;
  runCaptainCompleted?: boolean;
  crewFoundedCompleted?: boolean;
}): WorldTitle[] {
  const earned: WorldTitle[] = [];
  if ((input.pathCounts?.discover || 0) >= 3 || input.pathTitle === "Scout") earned.push(WORLD_TITLES.wayfinder);
  if ((input.pathCounts?.support || 0) >= 3 || input.pathTitle === "Patron") earned.push(WORLD_TITLES.merchant_ally);
  if ((input.memoriesKept || 0) >= 3) earned.push(WORLD_TITLES.archivist);
  if (input.barbicanStewarded) earned.push(WORLD_TITLES.keeper_of_barbican);
  if (input.runCaptainCompleted) earned.push(WORLD_TITLES.crew_captain);
  if (input.crewFoundedCompleted) earned.push(WORLD_TITLES.founder);
  return earned;
}

export type TechniqueKey = "ignite" | "rally" | "reveal" | "anchor";

export type TechniqueContract = {
  key: TechniqueKey;
  house: WorldHouseKey;
  title: string;
  explanation: string;
  prerequisite: string;
  cooldownHours: number;
  phase: WorldSystemPhase;
};

export const TECHNIQUES: Record<TechniqueKey, TechniqueContract> = {
  ignite: {
    key: "ignite",
    house: "ember",
    title: "Ignite",
    explanation: "Unlock one optional high-value Run objective when the Crew is already moving.",
    prerequisite: "Ember revealed and one completed Run objective.",
    cooldownHours: 72,
    phase: "competition",
  },
  rally: {
    key: "rally",
    house: "tide",
    title: "Rally",
    explanation: "Allow one valid late newcomer onto a live Run.",
    prerequisite: "Tide revealed and a Crew seat.",
    cooldownHours: 72,
    phase: "competition",
  },
  reveal: {
    key: "reveal",
    house: "radiant",
    title: "Reveal",
    explanation: "Reveal one hidden objective or Signal the Crew already earned the right to see.",
    prerequisite: "Radiant revealed and a forming path.",
    cooldownHours: 48,
    phase: "livingWorld",
  },
  anchor: {
    key: "anchor",
    house: "grove",
    title: "Anchor",
    explanation: "Hold a defined amount of qualifying Influence against short-term decay.",
    prerequisite: "Grove revealed and Reputation visible.",
    cooldownHours: 168,
    phase: "competition",
  },
};

export function resolveTechniquePermission(input: {
  technique: TechniqueKey;
  phases?: WorldSystemPhases;
  houseKey?: string | null;
  runObjectivesComplete?: number;
  hasCrew?: boolean;
  pathForming?: boolean;
  reputationVisible?: boolean;
  lastUsedAt?: string | Date | null;
  now?: Date;
}): { allowed: boolean; reason: string } {
  const technique = TECHNIQUES[input.technique];
  const phases = input.phases || resolveWorldSystemPhases();
  if (!phases[technique.phase]) return { allowed: false, reason: "Technique is not in season yet." };
  if (input.houseKey !== technique.house) return { allowed: false, reason: "This Technique belongs to another House." };
  if (technique.key === "ignite" && !(input.runObjectivesComplete || 0)) {
    return { allowed: false, reason: "Complete one Run objective first." };
  }
  if (technique.key === "rally" && !input.hasCrew) return { allowed: false, reason: "Rally needs a Crew." };
  if (technique.key === "reveal" && !input.pathForming) return { allowed: false, reason: "Reveal needs a forming path." };
  if (technique.key === "anchor" && !input.reputationVisible) return { allowed: false, reason: "Anchor needs visible Reputation." };
  if (input.lastUsedAt) {
    const elapsed = (input.now || new Date()).getTime() - new Date(input.lastUsedAt).getTime();
    if (elapsed < technique.cooldownHours * 60 * 60 * 1000) {
      return { allowed: false, reason: "This Technique is cooling down." };
    }
  }
  return { allowed: true, reason: technique.explanation };
}

export const ELEMENTAL_MODIFIERS = {
  earth_vs_fire: 0.05,
  fire_vs_water: 0.05,
  water_vs_air: 0.05,
  air_vs_earth: 0.05,
} as const;

export function resolveElementalModifier(attacker?: WorldElement | null, defender?: WorldElement | null): number {
  if (!attacker || !defender) return 0;
  if (attacker === "earth" && defender === "fire") return ELEMENTAL_MODIFIERS.earth_vs_fire;
  if (attacker === "fire" && defender === "water") return ELEMENTAL_MODIFIERS.fire_vs_water;
  if (attacker === "water" && defender === "air") return ELEMENTAL_MODIFIERS.water_vs_air;
  if (attacker === "air" && defender === "earth") return ELEMENTAL_MODIFIERS.air_vs_earth;
  return 0;
}

export type ChallengeTemplateKey =
  | "signal_hunt"
  | "connector_challenge"
  | "trail_race"
  | "merchant_rally"
  | "discovery_clash"
  | "return_race";

export type ChallengeContract = {
  key: ChallengeTemplateKey;
  title: string;
  objective: string;
  qualifyingActions: string[];
  proof: string;
  phase: WorldSystemPhase;
};

export const CHALLENGE_TEMPLATES: Record<ChallengeTemplateKey, ChallengeContract> = {
  signal_hunt: {
    key: "signal_hunt",
    title: "Signal Hunt",
    objective: "Find and show up at a participating Signal first.",
    qualifyingActions: ["DISCOVERY_RESPONSE", "check_in", "MOMENT_ATTENDANCE"],
    proof: "Verified discovery plus show-up.",
    phase: "competition",
  },
  connector_challenge: {
    key: "connector_challenge",
    title: "Connector Challenge",
    objective: "Activate a newcomer who then shows up.",
    qualifyingActions: ["referral_activated", "MOMENT_ATTENDANCE"],
    proof: "Attributed referral plus verified attendance.",
    phase: "competition",
  },
  trail_race: {
    key: "trail_race",
    title: "Trail Race",
    objective: "Complete ordered Run objectives before the window closes.",
    qualifyingActions: ["check_in", "PERK_REDEMPTION", "referral_activated"],
    proof: "Run objectives derived from verified actions.",
    phase: "competition",
  },
  merchant_rally: {
    key: "merchant_rally",
    title: "Merchant Rally",
    objective: "Support participating Places with verified redemptions.",
    qualifyingActions: ["PERK_REDEMPTION", "MERCHANT_VISIT", "order_paid"],
    proof: "Canonical merchant redemption.",
    phase: "competition",
  },
  discovery_clash: {
    key: "discovery_clash",
    title: "Discovery Clash",
    objective: "Name demand the city can actually fill.",
    qualifyingActions: ["DISCOVERY_RESPONSE", "discovery_vote"],
    proof: "Accepted discovery or qualifying vote.",
    phase: "competition",
  },
  return_race: {
    key: "return_race",
    title: "Return Race",
    objective: "Produce the longest trusted Return Chain in the window.",
    qualifyingActions: ["share_completed", "referral_activated", "check_in"],
    proof: "Attributed downstream verified movement.",
    phase: "competition",
  },
};

export function scoreChallenge(input: {
  template: ChallengeTemplateKey;
  actions: WorldActionFact[];
  phases?: WorldSystemPhases;
}): { score: number; eligible: boolean } {
  const template = CHALLENGE_TEMPLATES[input.template];
  const phases = input.phases || resolveWorldSystemPhases();
  if (!phases[template.phase]) return { score: 0, eligible: false };
  const seen = new Set<string>();
  let score = 0;
  for (const action of input.actions || []) {
    if (action.invalid || !action.actionType || !template.qualifyingActions.includes(action.actionType)) continue;
    const key = action.id || `${action.actionType}:${action.verifiedAt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    score += INFLUENCE_ACTION_WEIGHTS[action.actionType]?.weight || 1;
  }
  return { score, eligible: true };
}

/** Convergence scoring reuses verified Influence. Empty evidence stays quiet. */
export function scoreConvergence(input: {
  actions: WorldActionFact[];
  phases?: WorldSystemPhases;
}): { score: number; eligible: boolean; quiet: boolean } {
  const phases = input.phases || resolveWorldSystemPhases();
  if (!phases.competition) return { score: 0, eligible: false, quiet: true };
  const influence = resolveInfluence(input.actions);
  return { score: influence.score, eligible: true, quiet: influence.score === 0 };
}

/**
 * Artifacts reuse Memories/Pieces. Uniqueness is issuance-key based.
 * Never mints a second inventory row for the same artifact key.
 */
export function canIssueArtifact(input: {
  artifactKey: string;
  existingKeys?: string[];
  issuanceCount?: number;
  maxIssuance?: number;
}): { allowed: boolean; reason: string } {
  const existing = input.existingKeys || [];
  if (!input.artifactKey) return { allowed: false, reason: "Artifact key is required." };
  if (existing.includes(input.artifactKey)) {
    return { allowed: false, reason: "This Artifact was already issued." };
  }
  if (typeof input.maxIssuance === "number" && (input.issuanceCount || 0) >= input.maxIssuance) {
    return { allowed: false, reason: "Issuance limit reached." };
  }
  return { allowed: true, reason: "Eligible." };
}

export type PlaceActivityState = "dormant" | "stirring" | "active" | "surging" | "legendary";

export const PLACE_INFLUENCE_MIN = 5;
export const PLACE_DECAY_DAYS = { half: 21, gone: 45 } as const;

export function decayWeight(verifiedAt?: string | Date | null, now: Date = new Date()): number {
  if (!verifiedAt) return 1;
  const age = now.getTime() - new Date(verifiedAt).getTime();
  const days = age / (24 * 60 * 60 * 1000);
  if (days > PLACE_DECAY_DAYS.gone) return 0;
  if (days > PLACE_DECAY_DAYS.half) return 0.5;
  return 1;
}

export function resolvePlaceActivity(count: number): PlaceActivityState {
  if (count <= 0) return "dormant";
  if (count < 3) return "stirring";
  if (count < 8) return "active";
  if (count < 16) return "surging";
  return "legendary";
}

export type PlaceHouseShare = {
  visible: boolean;
  state: PlaceActivityState;
  shares: Array<{ house: WorldHouseKey; title: string; percent: number }>;
};

export function resolvePlaceHouseShare(
  actions: Array<WorldActionFact & { houseKey?: WorldHouseKey | null }>,
  now: Date = new Date(),
): PlaceHouseShare {
  const totals: Record<WorldHouseKey, number> = { ember: 0, tide: 0, radiant: 0, grove: 0 };
  let weight = 0;
  for (const action of actions || []) {
    if (action.invalid || !action.houseKey) continue;
    const w = decayWeight(action.verifiedAt, now);
    if (w <= 0) continue;
    totals[action.houseKey] += w;
    weight += w;
  }
  const state = resolvePlaceActivity(weight);
  if (weight < PLACE_INFLUENCE_MIN) {
    return { visible: false, state, shares: [] };
  }
  const shares = WORLD_HOUSE_KEYS
    .map((house) => ({
      house,
      title: WORLD_HOUSES[house].title,
      percent: Math.round((totals[house] / weight) * 100),
    }))
    .filter((row) => row.percent > 0)
    .sort((a, b) => b.percent - a.percent);
  return { visible: true, state, shares };
}

export type RumourState = "forming" | "investigating" | "confirmed" | "disproved" | "expired";

export function resolveRumourLifecycle(input: {
  state: RumourState;
  evidenceCount?: number;
  confirmed?: boolean;
  disproved?: boolean;
  expired?: boolean;
}): { state: RumourState; factual: boolean; label: string } {
  if (input.expired) return { state: "expired", factual: false, label: "Rumour · expired" };
  if (input.disproved) return { state: "disproved", factual: false, label: "Rumour · disproved" };
  if (input.confirmed) return { state: "confirmed", factual: true, label: "Confirmed" };
  if ((input.evidenceCount || 0) >= 3) return { state: "investigating", factual: false, label: "Rumour · investigating" };
  return { state: input.state || "forming", factual: false, label: "Rumour" };
}

export type SecretReveal = {
  revealed: boolean;
  label: string;
};

export function resolveSecretReveal(input: {
  committedMoneyOrGems?: boolean;
  qualified?: boolean;
  expired?: boolean;
  hiddenLabel: string;
  revealedLabel: string;
}): SecretReveal {
  if (input.committedMoneyOrGems) return { revealed: true, label: input.revealedLabel };
  if (input.expired) return { revealed: false, label: input.hiddenLabel };
  if (input.qualified) return { revealed: true, label: input.revealedLabel };
  return { revealed: false, label: input.hiddenLabel };
}

export const EXTENDED_CREW_RUN_ROLES = {
  captain: { key: "captain", title: "Captain", job: "Keep the Crew moving toward the Run." },
  scout: { key: "scout", title: "Scout", job: "Find the Signal and the room." },
  connector: { key: "connector", title: "Connector", job: "Bring the person who should be in the room." },
  amplifier: { key: "amplifier", title: "Amplifier", job: "Make the night visible." },
  chronicler: { key: "chronicler", title: "Amplifier", job: "Keep proof of what counted — now Amplifier." },
  keeper: { key: "keeper", title: "Keeper", job: "Hold the Memory and what came back." },
} as const;

export function resolveExtendedRunRole(key?: string | null): { key: string; title: string; job: string } | null {
  if (!key) return null;
  return EXTENDED_CREW_RUN_ROLES[key as keyof typeof EXTENDED_CREW_RUN_ROLES] || null;
}

export type IdentityCard = {
  house: WorldHouse | null;
  pathTitle: WorldPathTitle | null;
  line: string | null;
  traits: WorldTrait[];
  influenceLine: string | null;
  reputationLine: string | null;
  throwLine: string | null;
};

export function resolveIdentityCard(input: {
  phases?: WorldSystemPhases;
  resonance: ResonanceState;
  assignment?: HouseAssignment;
  pathTitle?: WorldPathTitle | null;
  traits?: WorldTrait[];
  influence?: InfluenceState | null;
  reputation?: ReputationState | null;
  returnChain?: ReturnChainState | null;
}): IdentityCard {
  const phases = input.phases || resolveWorldSystemPhases();
  if (!phases.identity) {
    return {
      house: null,
      pathTitle: input.pathTitle || null,
      line: input.pathTitle ? `A path is forming · ${input.pathTitle}` : null,
      traits: [],
      influenceLine: null,
      reputationLine: null,
      throwLine: null,
    };
  }
  const house = input.assignment?.houseKey
    ? WORLD_HOUSES[input.assignment.houseKey]
    : input.resonance.revealEligible
      ? input.resonance.house
      : null;
  const pathTitle = input.pathTitle || null;
  const line = house && pathTitle
    ? `${house.title} · ${pathTitle}`
    : house
      ? house.title
      : input.resonance.cue;
  return {
    house,
    pathTitle,
    line,
    traits: (input.traits || []).slice(0, 3),
    influenceLine: input.influence?.line || null,
    reputationLine: input.reputation?.visible ? input.reputation.line : null,
    throwLine: input.returnChain?.counted ? input.returnChain.line : null,
  };
}

/**
 * Invitation for an empty or forming world.
 * Always explain what this is, what to do, and why it pays.
 * Never invent scores, Houses, or live activity.
 */
export type WorldInvitation = {
  headline: string;
  why: string;
  benefit: string;
  nextLabel: string;
  nextHref: string;
  formingLine: string | null;
  steps: Array<{ title: string; line: string }>;
};

export function resolveWorldInvitation(input: {
  hasProof?: boolean;
  identityLine?: string | null;
  hasLiveMoment?: boolean;
  nextHref?: string | null;
} = {}): WorldInvitation {
  const named = Boolean(input.identityLine);
  const nextHref = input.nextHref || "/discover";
  return {
    headline: named ? String(input.identityLine) : "The night writes who you are",
    why: named
      ? "This came from nights that counted — not from opening the app."
      : "Promorang remembers what you actually do. Show up, bring someone, or use PromoCard. That becomes your path, your House, and what comes back.",
    benefit: named
      ? "Keep the same kind of night. PromoCard gets more useful. Places can remember you."
      : "First show-up can keep a Memory and put something live on your PromoCard. Bring someone and a Throw can return.",
    nextLabel: input.hasLiveMoment ? "Show up tonight" : "Find something worth doing",
    nextHref,
    formingLine: named
      ? null
      : "A path can be named after three matching nights. A House is named only when a pattern is clear.",
    steps: [
      { title: "Show up", line: "Be in the room. It counts. You can keep a Memory." },
      { title: "Use PromoCard", line: "Claim or redeem. The merchant sees you. The card becomes useful." },
      { title: "Bring someone", line: "If they show up, your Throw can return." },
    ],
  };
}

/** Guard: world math must never be treated as PromoCard or Gem value. */
export function worldScoreIsNotMoney(score: number): true {
  void score;
  return true;
}
