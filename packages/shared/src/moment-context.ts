export type MomentCommerceItem = {
  listing_id: string;
  source_id: string;
  kind: "product" | "offer" | "service";
  name: string;
  description?: string | null;
  image_url?: string | null;
  price?: number | null;
  currency?: string | null;
  discount_label?: string | null;
  merchant_name?: string | null;
  venue_name?: string | null;
  inventory_quantity?: number | null;
  fulfillment_mode?: string | null;
  available_now: boolean;
};

export type MomentCommerceAvailability = {
  state: "available" | "limited" | "sold_out";
  label: string;
  actionLabel: string;
  canAct: boolean;
};

/** One truthful availability vocabulary for the Moment page on web and mobile. */
export function resolveMomentCommerceAvailability(item: MomentCommerceItem): MomentCommerceAvailability {
  const quantity = item.inventory_quantity;
  if (!item.available_now || quantity === 0) {
    return { state: "sold_out", label: "Unavailable here", actionLabel: "View details", canAct: false };
  }
  const actionLabel = item.kind === "offer" ? "Claim offer" : item.kind === "service" ? "Reserve" : "Buy now";
  if (quantity != null && quantity > 0 && quantity <= 5) {
    return { state: "limited", label: `${quantity} left here`, actionLabel, canAct: true };
  }
  return { state: "available", label: item.fulfillment_mode === "onsite" ? "Available at this venue" : "Available now", actionLabel, canAct: true };
}

export type MomentMove = {
  id: string;
  title: string;
  description?: string | null;
  proof_type?: string | null;
  reward_label?: string | null;
  status?: string | null;
};

export type MomentParticipationState = "not_joined" | "joined" | "checked_in" | "completed";

export type MomentLiveContext = {
  moment_id: string;
  participation: {
    state: MomentParticipationState;
    joined_at?: string | null;
    checked_in_at?: string | null;
  };
  commerce: MomentCommerceItem[];
  moves: MomentMove[];
  piece?: {
    current_price?: number | null;
    change_24h?: number | null;
    volume_24h?: number | null;
    user_quantity?: number | null;
  } | null;
  promoshare: {
    ticket_count: number;
    active_draw_count: number;
    next_draw_at?: string | null;
  };
};
