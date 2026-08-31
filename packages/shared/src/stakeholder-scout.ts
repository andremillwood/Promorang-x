import { getWeeklyDropHubs, shouldPublishCalendarEvent, type WeeklyDropHub } from "./weekly-moment-drop";

/** City Steward founding target: invite 10 venues/merchants, not a blast list. */
export const SCOUT_QUEUE_CAP_PER_HUB_WEEK = 10;

/** Shortlist only when the candidate can do a specific job on a dated Moment. */
export const SCOUT_SHORTLIST_SCORE = 70;
export const SCOUT_WATCH_SCORE = 45;

export const SCOUT_STAKEHOLDER_KINDS = ["venue", "merchant", "brand", "product"] as const;
export type ScoutStakeholderKind = (typeof SCOUT_STAKEHOLDER_KINDS)[number];

export const SCOUT_CATEGORY_CLUSTERS = [
  "dinner",
  "dessert",
  "breakfast",
  "music",
  "nightlife",
  "retail",
  "grocery",
  "beverage",
  "craft",
  "wellness",
] as const;
export type ScoutCategoryCluster = (typeof SCOUT_CATEGORY_CLUSTERS)[number];

export const SCOUT_STATUSES = [
  "sourced",
  "scored",
  "watch",
  "queued",
  "approved",
  "invite_ready",
  "sent_by_human",
  "rejected",
  "suppressed",
] as const;
export type ScoutStatus = (typeof SCOUT_STATUSES)[number];

export const SCOUT_CHANNELS = ["walk_in", "steward_intro", "claim_page", "email"] as const;
export type ScoutChannel = (typeof SCOUT_CHANNELS)[number];

export type ScoutSourceKind =
  | "founding_catalog"
  | "cultural_calendar"
  | "weekly_moment"
  | "existing_place"
  | "steward_nomination";

export type ScoutCandidateInput = {
  candidateKey: string;
  kind: ScoutStakeholderKind;
  displayName: string;
  hubId: string;
  citySlug?: string | null;
  neighborhood?: string | null;
  categoryClusters: ScoutCategoryCluster[];
  job?: string | null;
  sourceKind: ScoutSourceKind;
  sourceName?: string | null;
  sourceUrl?: string | null;
  website?: string | null;
  publicContactEmail?: string | null;
  suppressed?: boolean;
  alreadyClaimed?: boolean;
  doNotContact?: boolean;
};

export type ScoutMomentContext = {
  id?: string | null;
  title: string;
  hubId: string;
  city?: string | null;
  startsAt: string | Date;
  category?: string | null;
  clusters?: ScoutCategoryCluster[];
};

export type ScoutScoreBreakdown = {
  hubFit: number;
  momentFit: number;
  categoryCluster: number;
  evidence: number;
  claimability: number;
  specificity: number;
};

export type ScoutRecommendation = "shortlist" | "watch" | "reject";

export type ScoutScoreResult = {
  total: number;
  breakdown: ScoutScoreBreakdown;
  recommendation: ScoutRecommendation;
  nextStatus: Extract<ScoutStatus, "queued" | "watch" | "rejected" | "suppressed">;
  reasons: string[];
  blockers: string[];
  preferredChannel: ScoutChannel;
};

export type ScoutInviteDraft = {
  subject: string;
  body: string;
  claimPath: string;
  preferredChannel: ScoutChannel;
  sendAllowed: false;
  autoSend: false;
  requiresHumanApproval: true;
  momentTitle: string;
  job: string;
};

export type FoundingScoutCandidate = ScoutCandidateInput & {
  notes?: string;
};

const TOKEN = /[^a-z0-9]+/g;

function tokens(...values: Array<string | null | undefined>): Set<string> {
  return new Set(
    values
      .flatMap((value) => String(value || "").toLowerCase().split(TOKEN))
      .filter((value) => value.length > 2),
  );
}

function hubFor(hubId: string): WeeklyDropHub | undefined {
  return getWeeklyDropHubs().find((hub) => hub.hubId === hubId || hub.citySlug === hubId);
}

function clusterOverlap(candidate: ScoutCandidateInput, moment?: ScoutMomentContext | null): string[] {
  const momentClusters = new Set(moment?.clusters || []);
  if (!momentClusters.size && moment?.category) {
    const category = moment.category.toLowerCase();
    for (const cluster of SCOUT_CATEGORY_CLUSTERS) {
      if (category.includes(cluster)) momentClusters.add(cluster);
    }
    if (/(food|dining|restaurant|rum|festival)/.test(category)) {
      momentClusters.add("dinner");
      momentClusters.add("beverage");
    }
    if (/(music|concert|fete|reggae)/.test(category)) momentClusters.add("music");
  }
  return candidate.categoryClusters.filter((cluster) => momentClusters.has(cluster) || tokens(moment?.title).has(cluster));
}

export function preferredScoutChannel(candidate: ScoutCandidateInput): ScoutChannel {
  if (candidate.kind === "brand") return "steward_intro";
  if (candidate.kind === "product") return "steward_intro";
  return "walk_in";
}

export function scoreStakeholderCandidate(
  candidate: ScoutCandidateInput,
  moment?: ScoutMomentContext | null,
  asOf = new Date(),
): ScoutScoreResult {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const breakdown: ScoutScoreBreakdown = {
    hubFit: 0,
    momentFit: 0,
    categoryCluster: 0,
    evidence: 0,
    claimability: 0,
    specificity: 0,
  };

  const hub = hubFor(candidate.hubId);
  if (!hub) {
    blockers.push("Hub is not live or pilot — do not recruit there yet");
  } else if (hub.launchStage === "live") {
    breakdown.hubFit = 25;
    reasons.push(`Fits the live ${hub.cityName} hub`);
  } else {
    breakdown.hubFit = 18;
    reasons.push(`Fits the ${hub.cityName} pilot`);
  }

  if (!String(candidate.displayName || "").trim()) {
    blockers.push("Missing a real place, brand, or product name");
  }
  if (candidate.suppressed || candidate.doNotContact) {
    blockers.push("On the do-not-contact list");
  }
  if (candidate.alreadyClaimed) {
    blockers.push("Page already claimed — use the existing owner relationship");
  }

  if (!moment) {
    blockers.push("No dated Moment to invite them into");
  } else if (moment.hubId && hub && moment.hubId !== hub.hubId && moment.hubId !== hub.citySlug) {
    blockers.push("Moment belongs to a different hub");
  } else if (!shouldPublishCalendarEvent(new Date(moment.startsAt), asOf)) {
    blockers.push("Moment sits outside the 90-day planning window");
  } else {
    const days = (new Date(moment.startsAt).getTime() - asOf.getTime()) / 86400000;
    if (days >= 0 && days <= 14) {
      breakdown.momentFit = 30;
      reasons.push(`Can take a job on ${moment.title} within two weeks`);
    } else {
      breakdown.momentFit = 22;
      reasons.push(`Can take a job on ${moment.title} inside the 90-day window`);
    }
  }

  const overlap = clusterOverlap(candidate, moment);
  if (overlap.length) {
    breakdown.categoryCluster = Math.min(15, 9 + overlap.length * 3);
    reasons.push(`Matches the ${overlap.slice(0, 2).join(" / ")} cluster`);
  } else if (candidate.categoryClusters.length) {
    breakdown.categoryCluster = 6;
  }

  if (candidate.sourceName && candidate.sourceUrl) {
    breakdown.evidence = 15;
    reasons.push(`Public source: ${candidate.sourceName}`);
  } else if (candidate.sourceName || candidate.website) {
    breakdown.evidence = 8;
    reasons.push("Has a public name or website to verify");
  } else {
    blockers.push("No public source to verify before a steward visit");
  }

  if (candidate.kind === "venue" || candidate.kind === "merchant" || candidate.kind === "brand") {
    breakdown.claimability = candidate.alreadyClaimed ? 4 : 10;
    if (!candidate.alreadyClaimed) reasons.push("Can seed a claimable page for the owner");
  } else {
    breakdown.claimability = 6;
    reasons.push("Product should attach to a place or brand page");
  }

  if (candidate.job && candidate.job.trim().length >= 8) {
    breakdown.specificity = 5;
    reasons.push(`Concrete job: ${candidate.job}`);
  } else {
    blockers.push("Needs a concrete Moment job before anyone is contacted");
  }

  const total = Math.max(
    0,
    Math.min(
      100,
      breakdown.hubFit +
        breakdown.momentFit +
        breakdown.categoryCluster +
        breakdown.evidence +
        breakdown.claimability +
        breakdown.specificity,
    ),
  );

  const fatal = blockers.some((item) =>
    /do-not-contact|not live or pilot|already claimed|different hub|outside the 90-day|Missing a real/i.test(item),
  );
  const ready =
    !fatal &&
    Boolean(moment) &&
    Boolean(candidate.job?.trim()) &&
    Boolean(candidate.sourceName || candidate.sourceUrl || candidate.website);

  let recommendation: ScoutRecommendation = "reject";
  if (candidate.suppressed || candidate.doNotContact) recommendation = "reject";
  else if (ready && total >= SCOUT_SHORTLIST_SCORE) recommendation = "shortlist";
  else if (!fatal && total >= SCOUT_WATCH_SCORE) recommendation = "watch";

  const nextStatus =
    candidate.suppressed || candidate.doNotContact
      ? "suppressed"
      : recommendation === "shortlist"
        ? "queued"
        : recommendation === "watch"
          ? "watch"
          : "rejected";

  return {
    total,
    breakdown,
    recommendation,
    nextStatus,
    reasons: reasons.slice(0, 4),
    blockers,
    preferredChannel: preferredScoutChannel(candidate),
  };
}

export function matchMomentForCandidate(
  candidate: ScoutCandidateInput,
  moments: ScoutMomentContext[],
  asOf = new Date(),
): ScoutMomentContext | null {
  const ranked = moments
    .map((moment) => ({ moment, score: scoreStakeholderCandidate(candidate, moment, asOf) }))
    .filter((row) => !row.score.blockers.some((item) => /different hub|outside the 90-day/i.test(item)))
    .sort((a, b) => b.score.total - a.score.total || a.moment.title.localeCompare(b.moment.title));
  return ranked[0]?.moment || null;
}

const ALLOWED_TRANSITIONS: Record<ScoutStatus, ScoutStatus[]> = {
  sourced: ["scored", "suppressed"],
  scored: ["scored", "watch", "queued", "rejected", "suppressed"],
  watch: ["scored", "queued", "rejected", "suppressed"],
  queued: ["approved", "rejected", "watch", "suppressed"],
  approved: ["invite_ready", "rejected", "suppressed"],
  invite_ready: ["sent_by_human", "approved", "rejected", "suppressed"],
  sent_by_human: ["suppressed"],
  rejected: ["scored", "watch", "suppressed"],
  suppressed: ["scored"],
};

export function canTransitionScoutStatus(from: ScoutStatus, to: ScoutStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionScoutStatus(from: ScoutStatus, to: ScoutStatus): ScoutStatus {
  if (!canTransitionScoutStatus(from, to)) {
    throw new Error(`Cannot move a scout candidate from ${from} to ${to}`);
  }
  if (to === "sent_by_human" && from !== "invite_ready") {
    throw new Error("A person can record a send only after a steward approved the invite draft");
  }
  return to;
}

export function canAutoSendScoutInvite(): false {
  return false;
}

export function claimPathForCandidate(candidate: Pick<ScoutCandidateInput, "kind" | "candidateKey">): string {
  return `/claim-pages?from=scout&kind=${encodeURIComponent(candidate.kind)}&key=${encodeURIComponent(candidate.candidateKey)}`;
}

export function draftClaimPageInvite(
  candidate: ScoutCandidateInput,
  moment: ScoutMomentContext,
  options?: { stewardName?: string | null; hubName?: string | null },
): ScoutInviteDraft {
  const job = candidate.job?.trim() || "a specific verified role in this Moment";
  const hubName = options?.hubName || hubFor(candidate.hubId)?.cityName || "this city";
  const steward = options?.stewardName?.trim() || `${hubName} steward`;
  const when = new Date(moment.startsAt).toLocaleDateString("en-JM", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const place = candidate.neighborhood ? ` in ${candidate.neighborhood}` : "";

  return {
    subject: `${when} ${job} — people are already coming through ${hubName}`,
    body: [
      `Hi ${candidate.displayName},`,
      "",
      `${when} we are running ${moment.title}${place}.`,
      `We need one ${job}. You only take part if people actually show up and check in.`,
      "",
      `A page is ready for you to claim when you want it: ${claimPathForCandidate(candidate)}`,
      "A steward can walk this in. Nothing is sent until a person decides to.",
      "",
      `— ${steward}`,
    ].join("\n"),
    claimPath: claimPathForCandidate(candidate),
    preferredChannel: preferredScoutChannel(candidate),
    sendAllowed: false,
    autoSend: false,
    requiresHumanApproval: true,
    momentTitle: moment.title,
    job,
  };
}

export function queueRemainingForHub(queuedCount: number, cap = SCOUT_QUEUE_CAP_PER_HUB_WEEK): number {
  return Math.max(0, cap - Math.max(0, queuedCount));
}

export function selectWeeklyShortlist<T extends ScoutCandidateInput>(
  candidates: T[],
  moments: ScoutMomentContext[],
  asOf = new Date(),
  cap = SCOUT_QUEUE_CAP_PER_HUB_WEEK,
): Array<{ candidate: T; moment: ScoutMomentContext | null; score: ScoutScoreResult }> {
  const ranked = candidates
    .map((candidate) => {
      const moment = matchMomentForCandidate(candidate, moments, asOf);
      return { candidate, moment, score: scoreStakeholderCandidate(candidate, moment, asOf) };
    })
    .sort((a, b) => b.score.total - a.score.total || a.candidate.displayName.localeCompare(b.candidate.displayName));

  const queuedByHub = new Map<string, number>();
  return ranked.map((row) => {
    if (row.score.nextStatus !== "queued") return row;
    const used = queuedByHub.get(row.candidate.hubId) || 0;
    if (used >= cap) {
      return {
        ...row,
        score: {
          ...row.score,
          recommendation: "watch" as const,
          nextStatus: "watch" as const,
          blockers: [...row.score.blockers, `Weekly steward cap of ${cap} already filled for this hub`],
        },
      };
    }
    queuedByHub.set(row.candidate.hubId, used + 1);
    return row;
  });
}

/**
 * Curated public founding inventory. Names and official pages only.
 * No harvested inboxes. Contact happens in person or via an existing relationship.
 */
export const FOUNDING_SCOUT_CATALOG: FoundingScoutCandidate[] = [
  {
    candidateKey: "kingston-glorias-seafood",
    kind: "venue",
    displayName: "Gloria's Seafood",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "Port Royal",
    categoryClusters: ["dinner"],
    job: "dinner stop with a verified check-in",
    sourceKind: "founding_catalog",
    sourceName: "Visit Jamaica",
    sourceUrl: "https://www.visitjamaica.com/",
    website: "https://www.gloriasseafood.com/",
    notes: "Waterfront Kingston dinner room for food Moments.",
  },
  {
    candidateKey: "kingston-scotchies",
    kind: "venue",
    displayName: "Scotchies Kingston",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "Half Way Tree",
    categoryClusters: ["dinner"],
    job: "jerk dinner stop",
    sourceKind: "founding_catalog",
    sourceName: "Visit Jamaica",
    sourceUrl: "https://www.visitjamaica.com/",
    notes: "Known jerk yard for a founding food crawl.",
  },
  {
    candidateKey: "kingston-devon-house-ice-cream",
    kind: "merchant",
    displayName: "Devon House I-Scream",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "Devon House",
    categoryClusters: ["dessert"],
    job: "dessert stop",
    sourceKind: "founding_catalog",
    sourceName: "Devon House",
    sourceUrl: "https://devonhousejamaica.com/",
    website: "https://devonhousejamaica.com/",
    notes: "Natural dessert close for a Kingston food Moment.",
  },
  {
    candidateKey: "kingston-cannonball-cafe",
    kind: "merchant",
    displayName: "Cannonball Cafe",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "New Kingston",
    categoryClusters: ["breakfast", "dessert"],
    job: "coffee or dessert stop",
    sourceKind: "founding_catalog",
    sourceName: "Kingston Creative",
    sourceUrl: "https://kingstoncreative.org/",
    notes: "Daytime New Kingston room for weekday Moments.",
  },
  {
    candidateKey: "kingston-tracks-and-records",
    kind: "venue",
    displayName: "Tracks & Records Kingston",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "New Kingston",
    categoryClusters: ["dinner", "music"],
    job: "music-and-dinner room",
    sourceKind: "founding_catalog",
    sourceName: "Visit Jamaica",
    sourceUrl: "https://www.visitjamaica.com/",
    notes: "Fits food + music clusters in the same night.",
  },
  {
    candidateKey: "kingston-craft-market",
    kind: "merchant",
    displayName: "Kingston Craft Market",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "Downtown",
    categoryClusters: ["retail", "craft"],
    job: "maker stall people can visit and prove",
    sourceKind: "founding_catalog",
    sourceName: "Visit Jamaica",
    sourceUrl: "https://www.visitjamaica.com/",
    notes: "Retail/craft stop for downtown walking Moments.",
  },
  {
    candidateKey: "kingston-bookophilia",
    kind: "merchant",
    displayName: "Bookophilia",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "Liguanea",
    categoryClusters: ["retail"],
    job: "independent shop stop",
    sourceKind: "founding_catalog",
    sourceName: "Kingston Creative",
    sourceUrl: "https://kingstoncreative.org/",
    notes: "Independent store for a quieter daytime Moment.",
  },
  {
    candidateKey: "kingston-red-stripe",
    kind: "brand",
    displayName: "Red Stripe",
    hubId: "kingston",
    citySlug: "kingston",
    neighborhood: "Spanish Town Road",
    categoryClusters: ["beverage", "music"],
    job: "fund one verified beverage action",
    sourceKind: "founding_catalog",
    sourceName: "Red Stripe",
    sourceUrl: "https://www.redstripebeer.com/",
    website: "https://www.redstripebeer.com/",
    notes: "Brand brief only after a steward names the Moment and the proof.",
  },
  {
    candidateKey: "kingston-grace-foods",
    kind: "brand",
    displayName: "Grace Foods",
    hubId: "kingston",
    citySlug: "kingston",
    categoryClusters: ["grocery", "dinner"],
    job: "fund a grocery or cooking Moment people can prove",
    sourceKind: "founding_catalog",
    sourceName: "Grace Foods",
    sourceUrl: "https://www.gracefoods.com/",
    website: "https://www.gracefoods.com/",
    notes: "National brand — steward intro, never a cold blast.",
  },
  {
    candidateKey: "kingston-walkerswood-jerk",
    kind: "product",
    displayName: "Walkerswood Jerk Seasoning",
    hubId: "kingston",
    citySlug: "kingston",
    categoryClusters: ["dinner", "grocery"],
    job: "product sample tied to a jerk dinner stop",
    sourceKind: "founding_catalog",
    sourceName: "Walkerswood",
    sourceUrl: "https://www.walkerswood.com/",
    website: "https://www.walkerswood.com/",
    notes: "Attach the product to a place, not an inbox.",
  },
  {
    candidateKey: "kingston-ting",
    kind: "product",
    displayName: "Ting",
    hubId: "kingston",
    citySlug: "kingston",
    categoryClusters: ["beverage"],
    job: "beverage sample at a verified check-in",
    sourceKind: "founding_catalog",
    sourceName: "Ting",
    sourceUrl: "https://www.ting.com/",
    notes: "Product needs a venue host before any invite is drafted.",
  },
  {
    candidateKey: "montego-bay-miss-ts",
    kind: "venue",
    displayName: "Miss T's Kitchen",
    hubId: "montego-bay",
    citySlug: "montego-bay",
    neighborhood: "Orange Street",
    categoryClusters: ["dinner"],
    job: "dinner stop with a verified check-in",
    sourceKind: "founding_catalog",
    sourceName: "Visit Jamaica",
    sourceUrl: "https://www.visitjamaica.com/",
    notes: "MoBay founding dinner room.",
  },
];
