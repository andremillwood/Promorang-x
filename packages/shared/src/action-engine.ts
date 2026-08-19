export type ActionVerificationType =
  | "qr_scan"
  | "geolocation"
  | "code_entry"
  | "merchant_confirmation"
  | "receipt_upload"
  | "social_link"
  | "manual_review";

export type VerificationConfidence = "low" | "medium" | "high" | "system_verified";

export type ActionCategory =
  | "visit_venue"
  | "attend_event"
  | "buy_product"
  | "rsvp"
  | "refer_friend"
  | "share_content"
  | "create_content"
  | "review_business"
  | "check_in"
  | "discover_location"
  | "save_offer"
  | "join_scene"
  | "invite_crew"
  | "scan_qr"
  | "custom_challenge";

export interface ActionEligibilityRules {
  min_age?: number;
  required_keys?: string[]; // PromoKey slugs required
  min_points?: number;
  min_reputation?: number;
  geographic_bounds?: {
    lat: number;
    lng: number;
    radius_meters: number;
  };
}

export interface Action {
  id: string;
  slug: string;
  title: string;
  description: string;
  creator_id?: string;
  scene_id?: string;
  merchant_id?: string;
  brand_id?: string;
  action_type: ActionCategory;
  verification_type: ActionVerificationType;
  points_reward: number;
  gems_reward_amount: number; // In Gem Ledger terms (1 Gem = $1.00 USD)
  promoshare_tickets: number;
  required_key_slug?: string;
  eligibility_rules?: ActionEligibilityRules;
  capacity?: number;
  completion_count: number;
  activated_attribution_count: number;
  start_time?: string;
  end_time?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ActionCompletion {
  id: string;
  action_id: string;
  user_id: string;
  referrer_id?: string;
  scene_id?: string;
  verification_status: "pending" | "approved" | "rejected";
  confidence: VerificationConfidence;
  proof_data: {
    qr_code?: string;
    latitude?: number;
    longitude?: number;
    receipt_url?: string;
    social_url?: string;
    code_entered?: string;
    metadata?: Record<string, unknown>;
  };
  points_awarded: number;
  gems_awarded: number;
  promoshare_tickets_awarded: number;
  completed_at: string;
}

export interface UserActivation {
  id: string;
  user_id: string;
  referrer_id?: string;
  origin_scene_id?: string;
  origin_action_id?: string;
  activation_score: number;
  is_activated: boolean;
  qualifying_actions_count: number;
  activated_at?: string;
  created_at: string;
}
