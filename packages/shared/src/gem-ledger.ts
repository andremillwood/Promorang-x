export type GemLedgerState =
  | "funded"
  | "allocated"
  | "held"
  | "earned"
  | "available"
  | "pending_redemption"
  | "redeemed"
  | "refunded"
  | "reversed"
  | "expired";

export type WalletType =
  | "brand_campaign_escrow"
  | "merchant_escrow"
  | "participant_earning"
  | "steward_distribution"
  | "creator_distribution"
  | "platform_treasury"
  | "platform_operations";

export interface GemLedgerEntry {
  id: string;
  amount: number; // 1 Gem = $1.00 USD
  currency_basis: "USD";
  state: GemLedgerState;
  source_wallet_type: WalletType;
  source_id: string; // e.g. campaign_id, user_id, merchant_id
  destination_wallet_type: WalletType;
  destination_id: string;
  action_id?: string;
  campaign_id?: string;
  scene_id?: string;
  reference_reason: string;
  actor_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface PromoKeyGrant {
  id: string;
  user_id: string;
  key_slug: string; // e.g. "kingston-foodie-key", "creator-pro-key"
  title: string;
  category: string;
  granted_by: "system" | "steward" | "purchase" | "action_completion";
  expires_at?: string;
  created_at: string;
}

export interface PromoShareEntry {
  id: string;
  user_id: string;
  action_id?: string;
  tickets_count: number;
  draw_id?: string;
  is_winner: boolean;
  prize_description?: string;
  awarded_at: string;
}
