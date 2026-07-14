import { API_BASE_URL } from "@/lib/api";

export type FeedIntent = "nearby" | "tonight" | "earn";

export interface FeedAction {
  label: string;
  action: string;
  href?: string;
}

export interface FeedContext {
  starts_at?: string;
  ends_at?: string;
  location_name?: string;
  city?: string;
  distance_km?: number;
  reward_value?: number;
  reward_label?: string;
  participants_count?: number;
  host_name?: string;
  venue_name?: string;
  brand_name?: string;
  sponsored?: boolean;
  live_now?: boolean;
  expires_soon?: boolean;
}

export interface FeedScoreBreakdown {
  recency: number;
  intent: number;
  relevance: number;
  proximity: number;
  urgency: number;
  social: number;
  value: number;
  quality: number;
  behavior?: number;
  diversity_adjustment: number;
}

export interface FeedItem {
  id: string;
  object_type: "moment" | "drop" | "offer" | "product" | "piece" | "content";
  entity_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  reason_labels: string[];
  score?: number;
  score_breakdown?: FeedScoreBreakdown;
  primary_cta: FeedAction;
  secondary_cta?: FeedAction;
  context: FeedContext;
  raw?: Record<string, unknown>;
}

interface RawFeedItem extends Record<string, any> {
  id: string;
  type?: string;
  object_type?: string;
}

export interface FeedResponse {
  feed: FeedItem[];
  meta: {
    next_offset: number;
    has_more: boolean;
    active_intent: FeedIntent | null;
    ranking_profile: string;
    user_interests: string[];
  };
}

const inferReasonLabels = (item: RawFeedItem, intent: FeedIntent | null): string[] => {
  const labels: string[] = [];

  if (intent === "nearby") labels.push("Near you");
  if (intent === "tonight") labels.push("Tonight");
  if (intent === "earn") labels.push("Earn now");

  if (item.score >= 140) labels.push("High match");
  if (item.type === "coupon") labels.push("Brand-funded");
  if (item.type === "drop") labels.push("Proof-based");
  if (item.location_city || item.location) labels.push("Local");

  return Array.from(new Set(labels)).slice(0, 3);
};

const normalizeFeedItem = (item: RawFeedItem, intent: FeedIntent | null): FeedItem => {
  const rawType = item.object_type || item.type;
  const objectType: FeedItem["object_type"] =
    rawType === "event" || rawType === "moment"
      ? "moment"
      : rawType === "drop"
        ? "drop"
        : rawType === "coupon" || rawType === "offer"
          ? "offer"
          : rawType === "product"
            ? "product"
            : rawType === "piece"
              ? "piece"
              : "content";

  const entityId = item.entity_id || item.id;
  const title =
    item.title ||
    item.content_title ||
    item.advertiser_coupons?.title ||
    "Recommended for you";

  const description =
    item.description ||
    item.advertiser_coupons?.description ||
    item.message ||
    "";

  const imageUrl =
    item.image_url ||
    item.media_url ||
    item.image ||
    item.advertiser_coupons?.image_url;

  const startsAt = item.starts_at || item.start_date || item.date || item.expires_at;
  const locationName = item.location || item.location_name || item.location_city || item.city;
  const rewardValue = item.value || item.gem_reward_base || item.reward_value;
  const rewardLabel =
    item.reward_label ||
    (item.gem_reward_base ? `${item.gem_reward_base} Gems` : undefined) ||
    (item.value && item.value_unit ? `${item.value}${item.value_unit}` : undefined);

  const primaryHref =
    objectType === "moment"
      ? `/moments/${entityId}`
      : objectType === "drop"
        ? "/watch-unlock"
        : objectType === "offer"
          ? item.type === "coupon" ? `/offers/${entityId}` : `/shop/${encodeURIComponent(String(entityId))}`
        : objectType === "product"
          ? `/shop/${encodeURIComponent(String(entityId))}`
          : objectType === "piece"
            ? `/pieces/content/${entityId}`
          : item.cta_url || "/explore/moments";

  const primaryLabel =
    objectType === "moment"
      ? "View Moment"
      : objectType === "drop"
        ? "Start Proof"
        : objectType === "offer"
          ? "See offer"
          : objectType === "product"
            ? "View product"
            : objectType === "piece"
              ? "View Piece"
          : "Open";

  return {
    id: `feed:${objectType}:${item.id}`,
    object_type: objectType,
    entity_id: String(entityId),
    title,
    subtitle:
      item.creator_name ||
      item.host_name ||
      item.sponsor_name ||
      item.platform ||
      undefined,
    description,
    image_url: imageUrl,
    reason_labels: inferReasonLabels(item, intent),
    score: item.score,
    score_breakdown: item.score_breakdown,
    primary_cta: {
      label: primaryLabel,
      action: "view",
      href: primaryHref,
    },
    secondary_cta: {
      label: "Save",
      action: "save",
    },
    context: {
      starts_at: startsAt,
      location_name: locationName,
      city: item.location_city || item.city,
      reward_value: typeof rewardValue === "number" ? rewardValue : undefined,
      reward_label: rewardLabel,
      participants_count: item.attendees || item.current_participants || item.participant_count,
      host_name: item.host_name,
      venue_name: item.venue_name,
      brand_name: item.sponsor_name || item.brand_name || item.merchant_name,
      sponsored: item.type === "coupon" || item.type === "offer" || Boolean(item.is_sponsored),
      expires_soon: Boolean(item.expires_at),
    },
    raw: item,
  };
};

export const getForYouFeed = async ({
  intent = null,
  offset = 0,
  limit = 18,
}: {
  intent?: FeedIntent | null;
  offset?: number;
  limit?: number;
}): Promise<FeedResponse> => {
  const params = new URLSearchParams();
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  if (intent) params.set("intent", intent);

  const response = await fetch(`${API_BASE_URL}/feed/for-you?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with ${response.status}`);
  }

  const payload = await response.json();
  const rawFeed: RawFeedItem[] = payload?.data?.feed || [];

  return {
    feed: rawFeed.map((item) => normalizeFeedItem(item, intent)),
    meta: {
      next_offset: payload?.data?.meta?.next_offset ?? offset + rawFeed.length,
      has_more: payload?.data?.meta?.has_more ?? rawFeed.length === limit,
      active_intent: (payload?.data?.meta?.active_intent || intent) as FeedIntent | null,
      ranking_profile: payload?.data?.meta?.ranking_profile || "participant",
      user_interests: payload?.data?.meta?.user_interests || [],
    },
  };
};

export const logFeedInteraction = async ({
  itemType,
  itemId,
  interactionType,
  metaData = {},
}: {
  itemType: string;
  itemId: string;
  interactionType: string;
  metaData?: Record<string, unknown>;
}) => {
  const normalizedItemType =
    itemType === "moment"
      ? "event"
      : itemType === "offer"
        ? "campaign"
        : itemType === "piece"
          ? "content"
        : itemType;

  await fetch(`${API_BASE_URL}/feed/interaction`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item_type: normalizedItemType,
      item_id: itemId,
      interaction_type: interactionType,
      meta_data: metaData,
    }),
  }).catch(() => undefined);
};
