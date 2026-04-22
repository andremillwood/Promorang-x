// ============================================
// PROMOSHARE TYPES
// ============================================

export interface PromoShareCycle {
  id: string;
  name: string;
  description: string | null;
  cycle_type: 'weekly' | 'monthly' | 'special';
  starts_at: string;
  ends_at: string;
  prize_pool_gems: number;
  status: 'pending' | 'active' | 'drawing' | 'completed';
  created_at: string;
}

export interface PromoShareUserStats {
  id: string;
  user_id: string;
  cycle_id: string;
  verified_actions_count: number;
  entries_earned: number;
  weight_score: number;
  eligibility_status: 'ineligible' | 'eligible' | 'qualified';
  is_winner: boolean;
  prize_gems: number | null;
  created_at: string;
  updated_at: string;
}

export interface PromoShareEntry {
  id: string;
  user_id: string;
  cycle_id: string;
  entry_number: number;
  source_action: string;
  weight: number;
  created_at: string;
}

export interface PromoShareWinner {
  id: string;
  cycle_id: string;
  user_id: string;
  entry_id: string;
  prize_gems: number;
  prize_tier: string;
  bucket_type: 'top_performers' | 'weighted_random' | 'newcomers' | 'loyalty';
  claimed_at: string | null;
  claim_deadline: string;
  created_at: string;
}

export interface PromoShareDashboardData {
  active_cycles: PromoShareCycle[];
  user_stats_by_cycle: PromoShareUserStats[];
  recent_entries: PromoShareEntry[];
  history: PromoShareWinner[];
  total_entries_all_time: number;
  total_won_all_time: number;
}

// ============================================
// SPONSOR TYPES
// ============================================

export interface SponsorPool {
  id: string;
  sponsor_id: string;
  name: string;
  tier: 'daily' | 'weekly' | 'monthly' | 'grand';
  total_pool_amount: number;
  gem_amount: number;
  status: 'draft' | 'pending_payment' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  starts_at: string;
  ends_at: string;
  winner_count: number;
  min_win_value: number;
  promoshare_contribution: number;
  brand_message: string | null;
  premium_placements: {
    homepage_banner?: boolean;
    push_notification?: boolean;
    sponsored_badge?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SponsorTier {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  platform_fee_percent: number;
  min_winners: number;
  max_winners: number;
  min_win_value: number;
  duration_days: number;
}

export interface SponsorAnalytics {
  pool_id: string;
  total_participants: number;
  total_entries: number;
  participant_growth: number[];
  entry_growth: number[];
  days_remaining: number;
  estimated_win_value: number;
}

// ============================================
// MATURITY STATE TYPES
// ============================================

export type MaturityState = 0 | 1 | 2 | 3 | 4;

export interface MaturityStateData {
  state: MaturityState;
  state_name: 'FIRST_TIME' | 'ACTIVE' | 'REWARDED' | 'POWER_USER' | 'OPERATOR_PRO';
  verified_actions_count: number;
  first_reward_received_at: string | null;
  last_used_surface: 'web' | 'mobile' | 'api' | null;
}

export interface VisibilityRules {
  show_balance: boolean;
  show_promoshare_badge: boolean;
  show_social_shield_badge: boolean;
  show_growth_hub: boolean;
  show_forecasts: boolean;
  show_matrix: boolean;
  show_history: boolean;
  copy_tier: 'early' | 'later';
}

// ============================================
// FEATURED MARKETPLACE TYPES
// ============================================

export interface FeaturedPlacement {
  id: string;
  user_id: string;
  placement_type: 
    | 'homepage_hero' 
    | 'homepage_featured' 
    | 'category_featured' 
    | 'featured_moment'
    | 'moment_boost'
    | 'promoshare_homepage_banner'
    | 'promoshare_sponsored_badge'
    | 'push_notification';
  content_type: 'moment' | 'pool' | 'content' | 'product';
  content_id: string | null;
  content_title: string;
  content_image_url: string | null;
  starts_at: string;
  ends_at: string;
  status: 'pending_payment' | 'pending_activation' | 'active' | 'completed' | 'cancelled';
  total_cost: number;
  platform_fee: number;
  cpc_budget_remaining?: number;
  cpc_cost_per_click?: number;
  created_at: string;
}

export interface PlacementPricing {
  type: string;
  base_price: number;
  price_model: 'fixed_daily' | 'cpc' | 'per_send';
  min_duration_days: number;
  max_duration_days: number;
  volume_discounts: {
    days: number;
    discount_percent: number;
  }[];
}

// ============================================
// VAULT TYPES
// ============================================

export interface VaultAsset {
  id: string;
  user_id: string;
  asset_type: 'token' | 'nft' | 'coupon' | 'ticket' | 'key';
  asset_name: string;
  asset_symbol: string;
  balance: number;
  metadata: Record<string, any>;
  acquired_at: string;
  expires_at: string | null;
}

export interface VaultTransaction {
  id: string;
  user_id: string;
  asset_type: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'stake' | 'unstake';
  status: 'pending' | 'completed' | 'failed';
  tx_hash: string | null;
  created_at: string;
}

// ============================================
// KYC TYPES
// ============================================

export interface KYCStatus {
  id: string;
  user_id: string;
  status: 'not_started' | 'in_review' | 'verified' | 'rejected';
  level: 0 | 1 | 2 | 3;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

// ============================================
// GROWTH PARTNER (MATRIX) TYPES
// ============================================

export interface MatrixRank {
  id: string;
  name: string;
  weekly_cap: number;
  depth_levels: number;
  requirements: {
    active_partners: number;
    total_team_volume: number;
  };
}

export interface MatrixEarnings {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  direct_commission: number;
  residual_commission: number;
  bonuses: number;
  total_earnings: number;
  status: 'pending' | 'eligible' | 'paid';
}

export interface MatrixDashboard {
  current_rank: MatrixRank | null;
  next_rank: MatrixRank | null;
  weekly_earnings: number;
  monthly_earnings: number;
  total_earnings: number;
  team_size: number;
  active_partners: number;
  qualification_status: 'qualified' | 'not_qualified';
  weekly_cap_remaining: number;
}
