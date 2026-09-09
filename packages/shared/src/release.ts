/**
 * A Release is origin: song, news, episode, video.
 * The original stays on Spotify / the paper / YouTube.
 * Promorang holds what the release does to the graph —
 * a room, a perk, a claim — not a second CMS.
 */

export const RELEASE_KINDS = ["song", "news", "episode", "video"] as const;
export type ReleaseKind = (typeof RELEASE_KINDS)[number];

export const RELEASE_KIND_META: Record<
  ReleaseKind,
  { label: string; verb: string; move: string; placeholder: string }
> = {
  song: {
    label: "Song",
    verb: "Listen",
    move: "First listen",
    placeholder: "https://open.spotify.com/track/…",
  },
  news: {
    label: "News",
    verb: "Read",
    move: "The story",
    placeholder: "https://…",
  },
  episode: {
    label: "Episode",
    verb: "Watch",
    move: "This episode",
    placeholder: "https://youtube.com/…",
  },
  video: {
    label: "Video",
    verb: "Watch",
    move: "The video",
    placeholder: "https://…",
  },
};

/** Actions that can pay. Share / repost / comment do not. */
export const RELEASE_PAYING_ACTIONS = ["click", "open", "proof_verified", "claim", "rsvp", "check_in"] as const;
export type ReleasePayingAction = (typeof RELEASE_PAYING_ACTIONS)[number];

export type ReleaseRecord = {
  id: string;
  kind: ReleaseKind;
  title: string;
  description?: string | null;
  originalUrl: string | null;
  status: string;
  startsAt?: string | null;
  endsAt?: string | null;
  linkedMomentId?: string | null;
  linkedOfferId?: string | null;
  creatorName?: string | null;
  mediaUrl?: string | null;
};

export type ReleaseLikeDrop = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  linked_moment_id?: string | null;
  objective_type?: string | null;
  metadata?: Record<string, unknown> | null;
  content_distribution_assets?: Array<{
    target_url?: string | null;
    media_url?: string | null;
    title?: string | null;
  }> | null;
};

export function isReleaseKind(value: unknown): value is ReleaseKind {
  return RELEASE_KINDS.includes(String(value) as ReleaseKind);
}

export function inferReleaseKind(input: {
  objectiveType?: string | null;
  metadata?: Record<string, unknown> | null;
  title?: string | null;
  platform?: string | null;
} = {}): ReleaseKind {
  const explicit = input.metadata?.release_kind;
  if (isReleaseKind(explicit)) return explicit;
  const hay = [input.title, input.platform, input.objectiveType, input.metadata?.source_platform]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\b(news|press|story|article|dispatch)\b/.test(hay)) return "news";
  if (/\b(episode|podcast|series)\b/.test(hay)) return "episode";
  if (/\b(song|single|listen|spotify|soundcloud|release room)\b/.test(hay)) return "song";
  return "video";
}

export function releaseFromDrop(drop: ReleaseLikeDrop, creatorName?: string | null): ReleaseRecord {
  const asset = drop.content_distribution_assets?.[0];
  const metadata = drop.metadata && typeof drop.metadata === "object" ? drop.metadata : {};
  return {
    id: drop.id,
    kind: inferReleaseKind({
      objectiveType: drop.objective_type,
      metadata,
      title: drop.title,
      platform: typeof metadata.source_platform === "string" ? metadata.source_platform : null,
    }),
    title: drop.title,
    description: drop.description,
    originalUrl: asset?.target_url || (typeof metadata.original_url === "string" ? metadata.original_url : null),
    status: drop.status || "draft",
    startsAt: drop.starts_at,
    endsAt: drop.ends_at,
    linkedMomentId: drop.linked_moment_id || (typeof metadata.linked_moment_id === "string" ? metadata.linked_moment_id : null),
    linkedOfferId: typeof metadata.linked_offer_id === "string" ? metadata.linked_offer_id : null,
    creatorName: creatorName || (typeof metadata.creator === "string" ? metadata.creator : null),
    mediaUrl: asset?.media_url || null,
  };
}

export function isLiveRelease(release: Pick<ReleaseRecord, "status" | "startsAt" | "endsAt">, now = Date.now()) {
  if (!["active", "live", "published"].includes(String(release.status || ""))) return false;
  if (release.startsAt) {
    const start = Date.parse(release.startsAt);
    if (Number.isFinite(start) && start > now) return false;
  }
  if (release.endsAt) {
    const end = Date.parse(release.endsAt);
    if (Number.isFinite(end) && end <= now) return false;
  }
  return true;
}

export function selectLiveReleaseSignal(releases: ReleaseRecord[], now = Date.now()) {
  return releases.find((release) => isLiveRelease(release, now) && release.originalUrl) || null;
}

export function releasePaysForAction(actionType?: string | null) {
  const action = String(actionType || "").toLowerCase();
  if (action === "open") return true;
  return (RELEASE_PAYING_ACTIONS as readonly string[]).includes(action);
}

export function releaseConsequenceHrefs(release: Pick<ReleaseRecord, "id" | "linkedMomentId" | "linkedOfferId">) {
  const items: Array<{ id: string; label: string; href: string; why: string }> = [];
  if (release.linkedMomentId) {
    items.push({
      id: "room",
      label: "Join the room",
      href: `/moments/${release.linkedMomentId}`,
      why: "The release is why this gathering exists.",
    });
  }
  if (release.linkedOfferId) {
    items.push({
      id: "perk",
      label: "Claim the perk",
      href: `/discover?tab=perks&offer=${encodeURIComponent(release.linkedOfferId)}`,
      why: "A real benefit attached to this release, not a share tap.",
    });
  }
  if (!items.length) {
    items.push({
      id: "attach",
      label: "Attach a room or perk",
      href: `/give?release=${encodeURIComponent(release.id)}`,
      why: "Other stakeholders catch the release here. Sharing is not the payday.",
    });
  }
  return items;
}

export function releaseSignalCopy(release: ReleaseRecord) {
  const meta = RELEASE_KIND_META[release.kind];
  const who = release.creatorName || "A creator";
  return {
    eyebrow: "Live release",
    title: `${meta.move}: ${release.title}`,
    detail: `${who} put the original up. ${meta.verb} it, then take the Promorang move if one is attached.`,
    verb: meta.verb,
    href: `/content-drops/${release.id}`,
  };
}
