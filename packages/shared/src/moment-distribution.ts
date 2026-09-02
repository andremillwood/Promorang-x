import { getMomentStatus, resolveMomentOccurrence, type RecurringMomentLike } from "./moment-occurrence";

export type TasteRole = "participant" | "creator" | "host" | "merchant" | "brand" | "agency" | string;

export type TasteProfile = {
  role?: TasteRole | null;
  preferredCategories?: string[];
  lifestyleTags?: string[];
  ageRange?: string | null;
  preferredTimes?: string[];
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type RankableMoment = {
  id: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  venueName?: string | null;
  hostId?: string | null;
  venueId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string | null;
  participantCount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  recurrenceEnabled?: boolean | null;
  recurrenceFrequency?: "daily" | "weekly" | "monthly" | null;
  recurrenceInterval?: number | null;
  recurrenceByWeekday?: number[] | null;
  recurrenceDayOfMonth?: number | null;
  recurrenceTimezone?: string | null;
  recurrenceUntil?: string | null;
  recurrenceCount?: number | null;
};

export type DistributionFactor =
  | "interest"
  | "lifestyle"
  | "proximity"
  | "timing"
  | "demographics"
  | "urgency"
  | "freshness"
  | "diversity";

export type DistributionBreakdown = Record<DistributionFactor, number>;

export type RankedMoment<T = RankableMoment> = T & {
  distributionScore: number;
  distributionReasons: string[];
  distributionBreakdown: DistributionBreakdown;
};

export const INTEREST_SLUGS = [
  "social",
  "food",
  "fitness",
  "music",
  "arts",
  "outdoor",
  "networking",
  "workshop",
] as const;

export type InterestSlug = (typeof INTEREST_SLUGS)[number];

const INTEREST_SYNONYMS: Record<InterestSlug, string[]> = {
  social: ["social", "gathering", "community", "nightlife", "party", "parties", "hangout"],
  food: ["food", "beverage", "drink", "drinks", "dining", "restaurant", "culinary", "eat", "brunch", "dinner"],
  fitness: ["fitness", "sports", "wellness", "yoga", "gym", "workout", "run", "training"],
  music: ["music", "party", "parties", "dj", "concert", "nightlife", "dance", "sound", "vinyl", "dub"],
  arts: ["arts", "culture", "art", "creative", "gallery", "theatre", "theater", "film", "photo"],
  outdoor: ["outdoor", "nature", "adventure", "hike", "hiking", "beach", "trail"],
  networking: ["networking", "business", "professional", "career", "mixer"],
  workshop: ["workshop", "learning", "class", "education", "talk", "lecture", "clinic"],
};

const LIFESTYLE_AFFINITY: Record<string, InterestSlug[]> = {
  active: ["fitness", "outdoor"],
  foodie: ["food"],
  creative: ["arts", "music"],
  social: ["social", "music"],
  professional: ["networking", "workshop"],
  mindful: ["fitness", "arts"],
  adventurous: ["outdoor", "social"],
  homebody: ["workshop", "food"],
};

const AGE_AFFINITY: Record<string, InterestSlug[]> = {
  "18-24": ["music", "social", "outdoor"],
  "25-34": ["music", "food", "social", "networking"],
  "35-44": ["food", "arts", "networking", "workshop"],
  "45-54": ["arts", "workshop", "food"],
  "55+": ["arts", "workshop", "food"],
};

const ROLE_WEIGHTS: Record<string, Record<DistributionFactor, number>> = {
  participant: {
    interest: 1.35,
    lifestyle: 1.2,
    proximity: 1.15,
    timing: 1.05,
    demographics: 0.7,
    urgency: 1.15,
    freshness: 0.85,
    diversity: 1,
  },
  creator: {
    interest: 1.2,
    lifestyle: 1.1,
    proximity: 0.9,
    timing: 0.9,
    demographics: 0.5,
    urgency: 0.95,
    freshness: 1.3,
    diversity: 1,
  },
  host: {
    interest: 0.7,
    lifestyle: 0.55,
    proximity: 1.45,
    timing: 0.8,
    demographics: 0.3,
    urgency: 1.45,
    freshness: 1.15,
    diversity: 1.1,
  },
  merchant: {
    interest: 0.75,
    lifestyle: 0.6,
    proximity: 1.4,
    timing: 0.85,
    demographics: 0.35,
    urgency: 1.4,
    freshness: 1.1,
    diversity: 1.1,
  },
  brand: {
    interest: 0.95,
    lifestyle: 0.9,
    proximity: 1.2,
    timing: 0.8,
    demographics: 0.8,
    urgency: 1.05,
    freshness: 1.15,
    diversity: 1.15,
  },
  agency: {
    interest: 0.9,
    lifestyle: 0.85,
    proximity: 1.15,
    timing: 0.75,
    demographics: 0.75,
    urgency: 1,
    freshness: 1.1,
    diversity: 1.2,
  },
};

const EMPTY_BREAKDOWN = (): DistributionBreakdown => ({
  interest: 0,
  lifestyle: 0,
  proximity: 0,
  timing: 0,
  demographics: 0,
  urgency: 0,
  freshness: 0,
  diversity: 0,
});

const tokens = (value?: string | null) =>
  String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 1);

const compact = (value?: string | null) => String(value || "").trim().toLowerCase();

export function interestSlugsForText(...parts: Array<string | null | undefined>): InterestSlug[] {
  const haystack = new Set(parts.flatMap((part) => tokens(part)));
  return INTEREST_SLUGS.filter((slug) => INTEREST_SYNONYMS[slug].some((word) => haystack.has(word)));
}

export function rankableFromMomentRow(row: Record<string, unknown>): RankableMoment {
  return {
    id: String(row.id ?? ""),
    title: (row.title as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    category: (row.category as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    venueName: ((row.venue_name ?? row.venueName) as string | null) ?? null,
    hostId: ((row.host_id ?? row.hostId) as string | null) ?? null,
    venueId: ((row.venue_id ?? row.venueId) as string | null) ?? null,
    startsAt: ((row.starts_at ??
      row.startsAt ??
      (row.context && typeof row.context === "object"
        ? (row.context as Record<string, unknown>).starts_at
        : null)) as string | null) ?? null,
    endsAt: ((row.ends_at ?? row.endsAt) as string | null) ?? null,
    createdAt: ((row.created_at ?? row.createdAt) as string | null) ?? null,
    participantCount: ((row.participant_count ?? row.participantCount) as number | null) ?? null,
    latitude: ((row.latitude as number | null) ?? null) as number | null,
    longitude: ((row.longitude as number | null) ?? null) as number | null,
    recurrenceEnabled: ((row.recurrence_enabled ?? row.recurrenceEnabled) as boolean | null) ?? null,
    recurrenceFrequency: ((row.recurrence_frequency ?? row.recurrenceFrequency) as RankableMoment["recurrenceFrequency"]) ?? null,
    recurrenceInterval: ((row.recurrence_interval ?? row.recurrenceInterval) as number | null) ?? null,
    recurrenceByWeekday: ((row.recurrence_by_weekday ?? row.recurrenceByWeekday) as number[] | null) ?? null,
    recurrenceDayOfMonth: ((row.recurrence_day_of_month ?? row.recurrenceDayOfMonth) as number | null) ?? null,
    recurrenceTimezone: ((row.recurrence_timezone ?? row.recurrenceTimezone) as string | null) ?? null,
    recurrenceUntil: ((row.recurrence_until ?? row.recurrenceUntil) as string | null) ?? null,
    recurrenceCount: ((row.recurrence_count ?? row.recurrenceCount) as number | null) ?? null,
  };
}

export function toRecurrenceInput(moment: RankableMoment): RecurringMomentLike | null {
  if (!moment.startsAt) return null;
  return {
    starts_at: moment.startsAt,
    ends_at: moment.endsAt,
    recurrence_enabled: moment.recurrenceEnabled,
    recurrence_frequency: moment.recurrenceFrequency,
    recurrence_interval: moment.recurrenceInterval,
    recurrence_by_weekday: moment.recurrenceByWeekday,
    recurrence_day_of_month: moment.recurrenceDayOfMonth,
    recurrence_timezone: moment.recurrenceTimezone,
    recurrence_until: moment.recurrenceUntil,
    recurrence_count: moment.recurrenceCount,
  };
}

export function effectiveMomentStart(item: object, now = new Date()): string | null {
  const moment = rankableFromMomentRow(item as Record<string, unknown>);
  const recurrence = toRecurrenceInput(moment);
  if (!recurrence) {
    const row = item as Record<string, unknown>;
    return ((row.start_date ?? row.date ?? row.expires_at) as string | null) ?? null;
  }
  const occurrence = resolveMomentOccurrence(recurrence, now);
  return occurrence.hasFutureOccurrence || occurrence.startsAt ? occurrence.startsAt : moment.startsAt;
}

export function tasteProfileFromPreferences(input?: {
  role?: string | null;
  preferred_categories?: string[] | null;
  preferredCategories?: string[] | null;
  interests?: string[] | null;
  lifestyle_tags?: string[] | null;
  lifestyleTags?: string[] | null;
  age_range?: string | null;
  ageRange?: string | null;
  preferred_times?: string[] | null;
  preferredTimes?: string[] | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_data?: { city?: string | null; country?: string | null } | null;
} | null): TasteProfile {
  const source = input || {};
  return {
    role: source.role ?? null,
    preferredCategories: source.preferredCategories || source.preferred_categories || source.interests || [],
    lifestyleTags: source.lifestyleTags || source.lifestyle_tags || [],
    ageRange: source.ageRange ?? source.age_range ?? null,
    preferredTimes: source.preferredTimes || source.preferred_times || [],
    city: source.city || source.location_data?.city || null,
    country: source.country || source.location_data?.country || null,
    latitude: source.latitude ?? null,
    longitude: source.longitude ?? null,
  };
}

function toRankable(item: object, now: Date): RankableMoment {
  const moment = rankableFromMomentRow(item as Record<string, unknown>);
  const recurrence = toRecurrenceInput(moment);
  if (!recurrence) return moment;
  const occurrence = resolveMomentOccurrence(recurrence, now);
  if (!occurrence.hasFutureOccurrence) return moment;
  return { ...moment, startsAt: occurrence.startsAt, endsAt: occurrence.endsAt ?? moment.endsAt };
}

function kmDistance(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

function hourBucket(date: Date): "morning" | "afternoon" | "evening" {
  const hour = date.getHours();
  if (hour < 11) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function scoreMoment(moment: RankableMoment, profile: TasteProfile, now: Date) {
  const breakdown = EMPTY_BREAKDOWN();
  const reasons: string[] = [];
  const slugs = interestSlugsForText(moment.category, moment.title, moment.description, moment.location);
  const wanted = new Set((profile.preferredCategories || []).map((value) => compact(value)).filter(Boolean));
  const lifestyles = (profile.lifestyleTags || []).map((value) => compact(value)).filter(Boolean);

  const matchedInterests = slugs.filter((slug) => wanted.has(slug));
  if (matchedInterests.length) {
    breakdown.interest = Math.min(40, 16 + matchedInterests.length * 10);
    reasons.push(`Matches ${matchedInterests.slice(0, 2).join(" and ")}`);
  } else if (wanted.size && slugs.length) {
    breakdown.interest = 2;
  }

  const lifestyleHits = lifestyles.flatMap((tag) => (LIFESTYLE_AFFINITY[tag] || []).filter((slug) => slugs.includes(slug)));
  const uniqueLifestyleHits = [...new Set(lifestyleHits)];
  if (uniqueLifestyleHits.length) {
    breakdown.lifestyle = Math.min(24, uniqueLifestyleHits.length * 10);
    reasons.push(`Fits a ${lifestyles[0]} night`);
  }

  const momentCity = compact(moment.city);
  const profileCity = compact(profile.city);
  const momentPlace = [moment.city, moment.location, moment.venueName].map(compact).join(" ");
  if (profileCity && (momentCity === profileCity || momentPlace.includes(profileCity))) {
    breakdown.proximity += 26;
    reasons.push(`Near ${profile.city}`);
  } else if (profileCity && momentCity && momentCity !== profileCity) {
    breakdown.proximity -= 12;
  } else if (profile.country && compact(moment.country) === compact(profile.country)) {
    breakdown.proximity += 6;
  }

  if (
    Number.isFinite(profile.latitude) &&
    Number.isFinite(profile.longitude) &&
    Number.isFinite(moment.latitude) &&
    Number.isFinite(moment.longitude)
  ) {
    const km = kmDistance(profile.latitude as number, profile.longitude as number, moment.latitude as number, moment.longitude as number);
    if (km <= 5) breakdown.proximity += 16;
    else if (km <= 15) breakdown.proximity += 10;
    else if (km <= 40) breakdown.proximity += 5;
  }

  const startsAt = moment.startsAt ? new Date(moment.startsAt) : null;
  const validStart = startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : null;
  if (validStart && (profile.preferredTimes || []).length) {
    const times = new Set((profile.preferredTimes || []).map(compact));
    if (times.has(hourBucket(validStart))) {
      breakdown.timing += 10;
      reasons.push("At a time you like");
    }
    const isWeekend = validStart.getDay() === 0 || validStart.getDay() === 6;
    if (times.has("weekend") && isWeekend) {
      breakdown.timing += 8;
    }
  }

  const ageLikes = profile.ageRange ? AGE_AFFINITY[profile.ageRange] || [] : [];
  const ageHits = ageLikes.filter((slug) => slugs.includes(slug));
  if (ageHits.length) {
    breakdown.demographics = Math.min(12, ageHits.length * 5);
  }

  if (validStart) {
    const hours = (validStart.getTime() - now.getTime()) / 36e5;
    if (hours < -6) breakdown.urgency = -24;
    else if (hours <= 0) {
      breakdown.urgency = 20;
      reasons.push("Happening now");
    } else if (hours <= 6) {
      breakdown.urgency = 16;
      reasons.push("Starting soon");
    } else if (hours <= 18) {
      breakdown.urgency = 12;
      reasons.push("Tonight");
    } else if (hours <= 48) breakdown.urgency = 8;
    else if (hours <= 168) breakdown.urgency = 4;
  }

  if (moment.createdAt) {
    const created = new Date(moment.createdAt);
    if (!Number.isNaN(created.getTime())) {
      const ageHours = (now.getTime() - created.getTime()) / 36e5;
      if (ageHours >= 0 && ageHours <= 12) {
        breakdown.freshness = 10;
        reasons.push("Just posted");
      } else if (ageHours <= 48) {
        breakdown.freshness = 6;
      }
    }
  }

  const weights = ROLE_WEIGHTS[profile.role || "participant"] || ROLE_WEIGHTS.participant;
  const score = (Object.keys(breakdown) as DistributionFactor[]).reduce(
    (total, factor) => total + breakdown[factor] * (weights[factor] ?? 1),
    0,
  );

  return {
    score: Number(score.toFixed(2)),
    breakdown,
    reasons: reasons.slice(0, 3),
    slugs,
  };
}

type Scored<T> = {
  item: T;
  moment: RankableMoment;
  slugs: InterestSlug[];
  score: number;
  breakdown: DistributionBreakdown;
  reasons: string[];
};

function applyDiversity<T extends object>(
  scored: Array<Scored<T>>,
  role?: TasteRole | null,
): Array<Scored<T>> {
  const weights = ROLE_WEIGHTS[role || "participant"] || ROLE_WEIGHTS.participant;
  const remaining = [...scored];
  const ordered: typeof scored = [];
  const hostCounts = new Map<string, number>();
  const venueCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  while (remaining.length) {
    let bestIndex = 0;
    let bestAdjusted = -Infinity;
    remaining.forEach((candidate, index) => {
      const hostKey = candidate.moment.hostId || "none";
      const venueKey = candidate.moment.venueId || candidate.moment.venueName || "none";
      const categoryKey = compact(candidate.moment.category) || candidate.slugs[0] || "uncategorized";
      const penalty =
        (hostCounts.get(hostKey) || 0) * 22 +
        (venueCounts.get(venueKey) || 0) * 12 +
        Math.max(0, (categoryCounts.get(categoryKey) || 0) - 1) * 10;
      const adjusted = candidate.score - penalty * weights.diversity;
      if (adjusted > bestAdjusted) {
        bestAdjusted = adjusted;
        bestIndex = index;
      }
    });

    const [picked] = remaining.splice(bestIndex, 1);
    const hostKey = picked.moment.hostId || "none";
    const venueKey = picked.moment.venueId || picked.moment.venueName || "none";
    const categoryKey = compact(picked.moment.category) || "uncategorized";
    const penalty =
      (hostCounts.get(hostKey) || 0) * 22 +
      (venueCounts.get(venueKey) || 0) * 12 +
      Math.max(0, (categoryCounts.get(categoryKey) || 0) - 1) * 10;
    const diversity = -Number((penalty * weights.diversity).toFixed(2));
    if (diversity < 0) {
      picked.reasons = [...picked.reasons.slice(0, 2), "Spread across places"];
    }
    picked.breakdown.diversity = diversity;
    picked.score = Number((picked.score + diversity).toFixed(2));
    hostCounts.set(hostKey, (hostCounts.get(hostKey) || 0) + 1);
    venueCounts.set(venueKey, (venueCounts.get(venueKey) || 0) + 1);
    categoryCounts.set(categoryKey, (categoryCounts.get(categoryKey) || 0) + 1);
    ordered.push(picked);
  }

  return ordered;
}

export function distributeMoments<T extends object>(
  moments: T[],
  profile: TasteProfile = {},
  options?: { now?: Date; take?: number },
): Array<RankedMoment<T>> {
  const now = options?.now ?? new Date();
  const scored = moments.map((item) => {
    const moment = toRankable(item, now);
    const result = scoreMoment(moment, profile, now);
    return {
      item,
      moment,
      slugs: result.slugs,
      score: result.score,
      breakdown: result.breakdown,
      reasons: result.reasons,
    };
  });

  scored.sort((a, b) => b.score - a.score || String(a.moment.id).localeCompare(String(b.moment.id)));
  const diversified = applyDiversity(scored, profile.role);
  const ranked = diversified.map((entry) => ({
    ...entry.item,
    distributionScore: entry.score,
    distributionReasons: entry.reasons.length ? entry.reasons : ["Coming up"],
    distributionBreakdown: entry.breakdown,
  }));

  return typeof options?.take === "number" ? ranked.slice(0, options.take) : ranked;
}

export function isMomentFeedItem(item: object): boolean {
  const row = item as Record<string, unknown>;
  const type = String(row.object_type || row.type || "").toLowerCase();
  return type === "moment" || type === "event";
}

export function isShowableMoment(item: object, now = new Date()): boolean {
  const moment = rankableFromMomentRow(item as Record<string, unknown>);
  const recurrence = toRecurrenceInput(moment);
  if (!recurrence) return true;
  return !getMomentStatus(recurrence, now).isPast;
}

export function rankLiveMoments<T extends object>(
  moments: T[],
  profile: TasteProfile = {},
  options?: { now?: Date; take?: number },
): Array<RankedMoment<T>> {
  const now = options?.now ?? new Date();
  return distributeMoments(
    moments.filter((item) => isShowableMoment(item, now)),
    profile,
    options,
  );
}

export function orderFeedMoments<T extends object>(
  items: T[],
  profile: TasteProfile = {},
  options?: { now?: Date },
): Array<T | RankedMoment<T>> {
  const moments = items.filter((item) => isMomentFeedItem(item));
  const rest = items.filter((item) => !isMomentFeedItem(item));
  return [...rankLiveMoments(moments, profile, options), ...rest];
}
