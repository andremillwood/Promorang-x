/**
 * People-first Moments: origin types, privacy, Plans, activity events, and labels.
 * Internal values stay stable. UI copy stays human.
 */

export const MOMENT_ORIGIN_TYPES = ["hosted", "community", "crew", "emergent"] as const;
export type MomentOriginType = (typeof MOMENT_ORIGIN_TYPES)[number];

export const MOMENT_PRIVACY_VALUES = ["public", "invite_only", "unlisted"] as const;
export type MomentPrivacy = (typeof MOMENT_PRIVACY_VALUES)[number];

export const MOMENT_VISIBILITY_VALUES = ["open", "invite", "private"] as const;
export type MomentVisibility = (typeof MOMENT_VISIBILITY_VALUES)[number];

export const MOMENT_CLAIM_STATUSES = ["unclaimed", "claim_requested", "verified", "disputed"] as const;
export type MomentClaimStatus = (typeof MOMENT_CLAIM_STATUSES)[number];

export const MOMENT_LIFECYCLE_STATUSES = ["planned", "live", "ended", "cancelled"] as const;
export type MomentLifecycleStatus = (typeof MOMENT_LIFECYCLE_STATUSES)[number];

export const SOCIAL_PLAN_STATUSES = ["open", "voting", "decided", "converted", "cancelled"] as const;
export type SocialPlanStatus = (typeof SOCIAL_PLAN_STATUSES)[number];

export const ACTIVITY_EVENT_NAMES = [
  "moment.created",
  "moment.joined",
  "moment.shared",
  "moment.claim_requested",
  "moment.claimed",
  "mission.started",
  "mission.completed",
  "content.submitted",
  "perk.viewed",
  "perk.claimed",
  "perk.redeemed",
  "invite.sent",
  "invite.opened",
  "invite.accepted",
  "plan.created",
  "plan.option_added",
  "plan.vote_cast",
  "plan.converted_to_moment",
] as const;
export type ActivityEventName = (typeof ACTIVITY_EVENT_NAMES)[number];

export const PEOPLE_MOMENT_REWARD_POINTS = {
  created: 15,
  joined: 5,
  invited: 5,
  inviteAccepted: 10,
  contentSubmitted: 10,
  missionCompleted: 15,
  perkClaimed: 5,
} as const;

export const DEFAULT_PARTICIPATION_PROMPTS = [
  {
    key: "crew",
    title: "Show us your crew",
    actionText: "Take a group photo of who showed up.",
    proofType: "photo" as const,
  },
  {
    key: "fit_check",
    title: "Fit check",
    actionText: "Show what you wore out.",
    proofType: "photo" as const,
  },
  {
    key: "energy",
    title: "Rate the energy",
    actionText: "How does it feel right now?",
    proofType: "photo" as const,
  },
] as const;

export const GROWTH_METRIC_KEYS = [
  "moment_creation_rate",
  "invite_rate",
  "invite_join_conversion",
  "moment_participation_rate",
  "mission_completion_rate",
  "content_submission_rate",
  "participant_creator_rate",
  "moment_share_rate",
  "plan_moment_conversion",
  "moment_stakeholder_claim_rate",
  "claimed_moment_perk_creation_rate",
  "perk_redemption_rate",
  "referral_participation_rate",
  "repeat_moment_participation",
] as const;
export type GrowthMetricKey = (typeof GROWTH_METRIC_KEYS)[number];

export function originTypeLabel(origin: MomentOriginType | string | null | undefined): string {
  switch (origin) {
    case "hosted":
      return "Official Moment";
    case "crew":
      return "Friends only";
    case "emergent":
      return "Emerging";
    case "community":
    default:
      return "Open Moment";
  }
}

export function privacyLabel(privacy: MomentPrivacy | MomentVisibility | string | null | undefined): string {
  switch (privacy) {
    case "invite_only":
    case "invite":
      return "Friends / invited people";
    case "unlisted":
    case "private":
      return "Share link only";
    case "public":
    case "open":
    default:
      return "Public";
  }
}

export function claimStatusLabel(status: MomentClaimStatus | string | null | undefined): string {
  switch (status) {
    case "claim_requested":
      return "Claim requested";
    case "verified":
      return "Claimed";
    case "disputed":
      return "Claim disputed";
    case "unclaimed":
    default:
      return "Unclaimed";
  }
}

export function privacyToVisibility(privacy: MomentPrivacy | string): MomentVisibility {
  if (privacy === "invite_only" || privacy === "invite") return "invite";
  if (privacy === "unlisted" || privacy === "private") return "private";
  return "open";
}

export function visibilityToPrivacy(visibility: MomentVisibility | string | null | undefined): MomentPrivacy {
  if (visibility === "invite") return "invite_only";
  if (visibility === "private") return "unlisted";
  return "public";
}

export function originFromPrivacy(
  privacy: MomentPrivacy | string,
  officialHost = false,
): MomentOriginType {
  if (officialHost) return "hosted";
  if (privacy === "invite_only" || privacy === "invite") return "crew";
  return "community";
}

export function resolvePeopleMomentStatus(input: {
  hereNow?: boolean;
  startsAt?: string | Date | null;
  endsAt?: string | Date | null;
  now?: Date;
}): { status: "scheduled" | "joinable" | "active" | "closed"; lifecycle: MomentLifecycleStatus } {
  const now = input.now ?? new Date();
  const startsAt = input.startsAt ? new Date(input.startsAt) : now;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;

  if (input.hereNow) {
    if (endsAt && endsAt.getTime() < now.getTime()) {
      return { status: "closed", lifecycle: "ended" };
    }
    return { status: "active", lifecycle: "live" };
  }

  if (endsAt && endsAt.getTime() < now.getTime()) {
    return { status: "closed", lifecycle: "ended" };
  }

  if (startsAt.getTime() <= now.getTime()) {
    return { status: "active", lifecycle: "live" };
  }

  const hoursUntilStart = (startsAt.getTime() - now.getTime()) / 36e5;
  if (hoursUntilStart <= 48) {
    return { status: "joinable", lifecycle: "planned" };
  }
  return { status: "scheduled", lifecycle: "planned" };
}

export function isPeopleFirstOrigin(origin: string | null | undefined): boolean {
  return origin === "community" || origin === "crew" || origin === "emergent";
}

export function canAttachPerk(input: {
  originType?: string | null;
  claimStatus?: string | null;
  claimedByStakeholderId?: string | null;
  isHost?: boolean;
}): boolean {
  if (input.isHost) return true;
  return input.claimStatus === "verified" && Boolean(input.claimedByStakeholderId);
}

export function nextClaimStatus(
  current: MomentClaimStatus | string | null | undefined,
  action: "request" | "verify" | "dispute" | "withdraw",
): MomentClaimStatus {
  if (action === "request") return "claim_requested";
  if (action === "verify") return "verified";
  if (action === "dispute") return "disputed";
  return current === "verified" ? "disputed" : "unclaimed";
}

export type PeopleMomentCreateInput = {
  title: string;
  location: string;
  hereNow?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  privacy?: MomentPrivacy;
  officialHost?: boolean;
  originType?: MomentOriginType;
  description?: string | null;
  imageUrl?: string | null;
  sceneId?: string | null;
  venueName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  planId?: string | null;
};

export function buildPeopleMomentInsert(input: PeopleMomentCreateInput, userId: string) {
  const title = input.title.trim();
  const location = input.location.trim();
  if (!title) throw new Error("What are you doing?");
  if (!location) throw new Error("Where?");

  const privacy = input.privacy ?? "public";
  const originType = input.originType ?? originFromPrivacy(privacy, Boolean(input.officialHost));
  const startsAt = input.hereNow ? new Date().toISOString() : input.startsAt;
  if (!startsAt) throw new Error("When?");

  const resolved = resolvePeopleMomentStatus({
    hereNow: input.hereNow,
    startsAt,
    endsAt: input.endsAt,
  });

  return {
    title,
    description: input.description?.trim() || null,
    location,
    venue_name: input.venueName?.trim() || location,
    image_url: input.imageUrl || null,
    starts_at: startsAt,
    ends_at: input.endsAt || null,
    host_id: userId,
    creator_user_id: userId,
    creative_owner_id: userId,
    origin_type: originType,
    here_now: Boolean(input.hereNow),
    privacy,
    visibility: privacyToVisibility(privacy),
    claim_status: "unclaimed" as const,
    claimed_by_stakeholder_id: null,
    plan_id: input.planId || null,
    status: resolved.status,
    is_active: resolved.status !== "closed",
    pulse_state: resolved.lifecycle === "live" ? "live" : "forming",
    category: "Community Gathering",
    content_origin: "stakeholder_created",
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
  };
}

export function sharePathForMoment(momentId: string, invitedBy?: string | null): string {
  const params = new URLSearchParams();
  if (invitedBy) params.set("invitedBy", invitedBy);
  const query = params.toString();
  return query ? `/moments/${momentId}?${query}` : `/moments/${momentId}`;
}

export function sharePathForPlan(planId: string, invitedBy?: string | null): string {
  const params = new URLSearchParams();
  if (invitedBy) params.set("invitedBy", invitedBy);
  const query = params.toString();
  return query ? `/plans/${planId}?${query}` : `/plans/${planId}`;
}

export function winningPlanOption<T extends { id: string }>(
  options: T[],
  votes: Array<{ option_id: string }>,
): T | null {
  if (!options.length) return null;
  const counts = new Map<string, number>();
  for (const vote of votes) {
    counts.set(vote.option_id, (counts.get(vote.option_id) || 0) + 1);
  }
  let winner = options[0];
  let best = -1;
  for (const option of options) {
    const count = counts.get(option.id) || 0;
    if (count > best) {
      winner = option;
      best = count;
    }
  }
  return winner;
}
