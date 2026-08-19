export type FeedIntent = "nearby" | "tonight" | "earn";

export type FeedObjectType =
  | "moment"
  | "discovery"
  | "drop"
  | "content"
  | "product"
  | "offer"
  | "piece"
  | "promoshare_draw"
  | "promoshare_receipt";

export type FeedAction = {
  label: string;
  action: string;
  href?: string;
};

export type FeedContext = {
  moment_id?: string;
  content_id?: string;
  venue_id?: string;
  merchant_id?: string;
  brand_id?: string;
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
  merchant_name?: string;
  brand_name?: string;
  sponsored?: boolean;
  live_now?: boolean;
  expires_soon?: boolean;
  user_is_joined?: boolean;
  user_is_checked_in?: boolean;
  available_here_now?: boolean;
};

export type FeedPieceSummary = {
  piece_type: "content" | "moment" | "host" | "venue";
  asset_id: string;
  user_quantity?: number;
  current_price?: number;
  change_24h?: number;
  volume_24h?: number;
  can_buy?: boolean;
  can_sell?: boolean;
};

export type PromoShareReceiptSummary = {
  cycle_id: string;
  cycle_type?: "daily" | "weekly" | "monthly" | "grand";
  ticket_count: number;
  source_action?: string;
  source_id?: string;
  draw_at?: string;
  status: "earned" | "entered" | "closing" | "completed" | "won" | "not_selected";
};

export type FeedScoreBreakdown = {
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
};

export type FeedItem = {
  id: string;
  object_type: FeedObjectType;
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
  piece?: FeedPieceSummary;
  promoshare?: PromoShareReceiptSummary;
  raw?: Record<string, unknown>;
};

export type FeedResponse = {
  feed: FeedItem[];
  meta: {
    next_offset: number;
    has_more: boolean;
    active_intent: FeedIntent | null;
    ranking_profile: string;
    user_interests: string[];
  };
};

export const feedObjectHref = (objectType: FeedObjectType, entityId: string, platform: "web" | "mobile") => {
  const routes = platform === "mobile"
    ? {
        moment: `/moment/${entityId}`,
        discovery: `/discoveries/${entityId}`,
        drop: "/search?type=content",
        content: `/content/${entityId}`,
        product: `/product/${entityId}`,
        offer: `/product/${entityId}`,
        piece: `/pieces/content/${entityId}`,
        promoshare_draw: "/promoshare",
        promoshare_receipt: "/promoshare",
      }
    : {
        moment: `/moments/${entityId}`,
        discovery: `/discoveries/${entityId}`,
        drop: "/watch-unlock",
        content: `/content-drops/${entityId}`,
        product: `/shop/${entityId}`,
        offer: `/offers/${entityId}`,
        piece: `/pieces/content/${entityId}`,
        promoshare_draw: "/promoshare",
        promoshare_receipt: "/promoshare",
      };

  return routes[objectType];
};
