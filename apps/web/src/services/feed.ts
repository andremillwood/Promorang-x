import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import {
  effectiveMomentStart,
  orderFeedMoments,
  tasteProfileFromPreferences,
} from "@promorang/shared";
import type {
  FeedAction,
  FeedContext,
  FeedIntent,
  FeedItem,
  FeedResponse,
  FeedScoreBreakdown,
} from "@promorang/shared";

export type { FeedAction, FeedContext, FeedIntent, FeedItem, FeedResponse, FeedScoreBreakdown } from "@promorang/shared";

const feedAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token
    ? { Authorization: `Bearer ${data.session.access_token}` }
    : {};
};

interface RawFeedItem extends Record<string, any> {
  id: string;
  type?: string;
  object_type?: string;
}

export function isItemTonight(item: RawFeedItem): boolean {
  const dateStr = effectiveMomentStart(item) || item.starts_at || item.start_date || item.date;
  if (!dateStr) return false;
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return false;
  const now = new Date();
  const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  // Live now or starting within next 28 hours (same day/evening)
  return diffHours >= -4 && diffHours <= 28;
}

export function isItemEarning(item: RawFeedItem): boolean {
  // The API can group Discoveries under generic "content". Preserve the
  // domain type so the UI never presents a place as a creator story.
  const rawType = item.type === "discovery" ? "discovery" : item.object_type || item.type;
  if (rawType === "coupon" || rawType === "offer" || rawType === "drop" || rawType === "bounty") {
    return true;
  }
  if (item.reward && String(item.reward).trim().length > 0) {
    return true;
  }
  if (Number(item.gem_reward_base || 0) > 0 || Number(item.payout_amount || 0) > 0 || Number(item.value || 0) > 0) {
    return true;
  }
  return false;
}

export function isItemNearby(item: RawFeedItem): boolean {
  const loc = item.location || item.city || item.location_address || item.venue_name;
  return Boolean(loc && String(loc).trim().length > 0);
}

const inferReasonLabels = (item: RawFeedItem, intent: FeedIntent | null): string[] => {
  const labels: string[] = [];

  if (isItemNearby(item)) labels.push("Near you");
  if (isItemTonight(item)) labels.push("Tonight");
  if (isItemEarning(item)) labels.push("Earn now");

  if (item.score >= 140) labels.push("High match");
  if (item.type === "coupon" || item.object_type === "offer") labels.push("Brand-funded");
  if (item.type === "drop" || item.object_type === "drop") labels.push("Proof-based");

  return Array.from(new Set(labels)).slice(0, 3);
};

const normalizeFeedItem = (item: RawFeedItem, intent: FeedIntent | null): FeedItem => {
  const rawType = item.object_type || item.type;
  const objectType: FeedItem["object_type"] =
    rawType === "event" || rawType === "moment"
      ? "moment"
      : rawType === "discovery"
        ? "discovery"
      : rawType === "drop"
        ? "drop"
        : rawType === "coupon" || rawType === "offer"
          ? "offer"
          : rawType === "product"
            ? "product"
            : rawType === "piece"
              ? "piece"
              : rawType === "promoshare_draw"
                ? "promoshare_draw"
                : rawType === "promoshare_receipt"
                  ? "promoshare_receipt"
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
    (item.reward ? String(item.reward) : undefined) ||
    (item.gem_reward_base ? `${item.gem_reward_base} Gems` : undefined) ||
    (item.value && item.value_unit ? `${item.value}${item.value_unit}` : undefined);

  const primaryHref =
    objectType === "moment"
      ? `/moments/${entityId}`
      : objectType === "discovery"
        ? `/discoveries/${item.slug || entityId}`
      : objectType === "drop"
        ? "/watch-unlock"
        : objectType === "offer"
          ? item.type === "coupon" ? `/offers/${entityId}` : `/shop/${encodeURIComponent(String(entityId))}`
        : objectType === "product"
          ? `/shop/${encodeURIComponent(String(entityId))}`
          : objectType === "piece"
            ? `/pieces/content/${entityId}`
            : objectType === "promoshare_draw" || objectType === "promoshare_receipt"
              ? "/promoshare"
          : item.cta_url || "/explore/moments";

  const primaryLabel =
    objectType === "moment"
      ? "View Moment"
      : objectType === "discovery"
        ? "View Discovery"
      : objectType === "drop"
        ? "Start Proof"
        : objectType === "offer"
          ? "See offer"
          : objectType === "product"
            ? "View product"
            : objectType === "piece"
              ? "View Piece"
              : objectType === "promoshare_draw" || objectType === "promoshare_receipt"
                ? "Open PromoShare"
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
    reason_labels: Array.isArray(item.distributionReasons) && item.distributionReasons.length
      ? item.distributionReasons
      : inferReasonLabels(item, intent),
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
    piece: item.piece,
    promoshare: item.promoshare,
    raw: item,
  };
};

export const getForYouFeed = async ({
  intent = null,
  offset = 0,
  limit = 24,
}: {
  intent?: FeedIntent | null;
  offset?: number;
  limit?: number;
}): Promise<FeedResponse> => {
  let rawFeed: RawFeedItem[] = [];

  try {
    const params = new URLSearchParams();
    params.set("offset", String(offset));
    params.set("limit", String(limit));
    if (intent) params.set("intent", intent);

    const response = await fetch(`${API_BASE_URL}/feed/for-you?${params.toString()}`, {
      credentials: "include",
      headers: await feedAuthHeaders(),
    });

    if (response.ok) {
      const payload = await response.json();
      rawFeed = payload?.data?.feed || [];
    }
  } catch (e) {
    console.warn("Feed API endpoint fallback to Supabase DB:", e);
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  const { data: preferences } = userId
    ? await supabase
      .from("user_preferences")
      .select("preferred_categories, lifestyle_tags, age_range, preferred_times, city, country, latitude, longitude")
      .eq("user_id", userId)
      .maybeSingle()
    : { data: null };
  const activeRole = typeof localStorage !== "undefined" ? localStorage.getItem("promorang_active_role") : null;
  const taste = tasteProfileFromPreferences({ role: activeRole, ...preferences });
  const usedFallback = rawFeed.length === 0;

  // Fallback to querying Supabase DB directly for Moments, Discoveries & Missions
  if (usedFallback) {
    const [{ data: dbMoments }, { data: dbDiscoveries }, { data: dbMissions }] = await Promise.all([
      supabase.from("moments").select("*").eq("is_active", true).order("starts_at", { ascending: true }).limit(Math.max(limit * 3, 24)),
      supabase.from("discoveries" as any).select("*").eq("verification_status", "approved").limit(limit),
      supabase.from("moment_bounties" as any).select("*").order("created_at", { ascending: false }).limit(limit),
    ]);

    rawFeed = [
      ...(dbMoments || []).map((m) => ({ ...m, object_type: "moment", type: "event" })),
      ...(dbDiscoveries || []).map((d) => ({ ...d, object_type: "discovery", type: "discovery" })),
      ...(dbMissions || []).map((b) => ({ ...b, object_type: "drop", type: "bounty" })),
    ];
  }

  rawFeed = orderFeedMoments(rawFeed, taste) as RawFeedItem[];

  // Filter rawFeed according to intent criteria strictly
  if (intent === "tonight") {
    rawFeed = rawFeed.filter(isItemTonight);
  } else if (intent === "earn") {
    rawFeed = rawFeed.filter(isItemEarning);
  } else if (intent === "nearby") {
    rawFeed = rawFeed.filter(isItemNearby);
  }

  return {
    feed: rawFeed.map((item) => normalizeFeedItem(item, intent)),
    meta: {
      next_offset: offset + rawFeed.length,
      has_more: false,
      active_intent: intent,
      ranking_profile: taste.role || "participant",
      user_interests: taste.preferredCategories || [],
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
      ...(await feedAuthHeaders()),
    },
    body: JSON.stringify({
      item_type: normalizedItemType,
      item_id: itemId,
      interaction_type: interactionType,
      meta_data: metaData,
    }),
  }).catch(() => undefined);
};
