// ===== CORE TYPES =====

export interface UserType {
  id: string;
  mocha_user_id: string;
  email: string;
  username: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  bio: string;
  profile_image: string;
  cover_image: string;
  website: string;
  location: string;
  social_links: string;
  role: 'user' | 'admin' | 'moderator' | 'advertiser';
  points_balance: number;
  gems_balance: number;
  keys_balance: number;
  xp_points?: number;
  level?: number;
  total_earnings: number;
  total_withdrawn: number;
  is_verified: boolean;
  is_banned: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  google_user_data?: {
    given_name?: string;
    family_name?: string;
    picture?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown; // For any additional properties that might be present
}

export interface WalletType {
  id: number;
  user_id: number;
  currency_type: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionType {
  id: number;
  user_id: number;
  transaction_type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference_id: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TaskType {
  id: number;
  creator_id: number;
  title: string;
  description: string;
  task_type: string;
  reward_amount: number;
  reward_currency: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  is_public: boolean;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  current_participants: number;
  requirements: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DropType {
  id: string;
  creator_id: number;
  creator_name?: string;
  title: string;
  description: string;
  drop_type: string;
  platform: string;
  content_url: string;
  reward_amount: number;
  reward_currency: string;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  current_participants: number;
  requirements?: string;
  is_public: boolean;
  is_featured: boolean;
  is_approved: boolean;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  difficulty: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  is_paid_drop: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  gem_reward_base?: number;
  gem_pool_total?: number;
  follower_threshold?: number;
  time_commitment?: string;
  deliverables?: string;
  deadline_at?: string;
  move_cost_points?: number;
  key_reward_amount?: number;
  is_proof_drop?: boolean;
  key_cost?: number;
}

export interface DropApplicationType {
  id: string;
  drop_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  application_message: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  submission_url: string;
  submission_notes: string;
  reward_amount: number;
  reward_currency: string;
  reward_status: 'pending' | 'paid' | 'failed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContentPieceType {
  id: number;
  creator_id: number;
  creator_username?: string;
  creator_avatar?: string;
  title: string;
  description: string;
  content_type: string;
  platform: string;
  content_url: string;
  platform_url?: string;
  media_url?: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  is_featured: boolean;
  is_approved: boolean;
  status: 'draft' | 'published' | 'archived';
  metadata: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
  total_shares?: number;
  share_price?: number;
  available_shares?: number;
}

export interface ContentHolding {
  content_id: string;
  content_title: string;
  content_thumbnail: string;
  content_url?: string;
  content_creator: string;
  content_creator_avatar?: string;
  content_platform: string;
  content_type?: string;
  creator_id: string;
  creator_name: string;
  platform: string;
  shares_owned?: number;
  average_buy_price?: number;
  total_investment?: number;
  current_value?: number;
  current_price: number;
  profit_loss?: number;
  profit_loss_percentage?: number;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'sold' | 'pending' | 'inactive' | 'listed';
  genres?: string[];
  tags?: string[];
  description?: string;
  url?: string;
  owned_shares: number;
  avg_cost: number;
  is_verified?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  is_sale?: boolean;
  sale_discount?: number;
  sale_end_date?: string;
  visibility?: 'public' | 'private';
  available_to_sell?: number;
  market_value?: number;
  unrealized_gain?: number;
  day_change_pct?: number;
  week_change_pct?: number;
  month_change_pct?: number;
  last_trade_at?: string;
  is_listed?: boolean;
  listing_id?: string;
}

export interface ShareListing {
  id: string;
  content_id: string;
  content_title: string;
  content_thumbnail: string;
  shares_available: number;
  price_per_share: number;
  ask_price?: number;
  bid_price?: number;
  market_price?: number;
  total_value: number;
  seller_id: string;
  owner_id: string;
  owner_name: string;
  seller_username: string;
  created_at: string;
  expires_at?: string;
  status?: 'active' | 'sold' | 'expired' | 'pending' | 'cancelled';
  content_creator?: string;
  content_platform?: string;
  content_url?: string;
  description?: string;
  total_shares?: number;
  remaining_quantity?: number;
  quantity?: number;
}

export interface ShareOffer {
  id: string;
  content_id: string;
  content_title?: string;
  shares_requested: number;
  price_per_share: number;
  bid_price?: number;
  total_offer: number;
  buyer_id: string;
  seller_id: string;
  buyer_username: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'completed' | 'cancelled' | 'withdrawn';
  created_at: string;
  expires_at?: string;
  content_thumbnail?: string;
  seller_username?: string;
  message?: string;
  updated_at?: string;
  quantity?: number;
  listing_id?: string;
  buyer_name?: string;
  seller_name?: string;
  buyer_avatar?: string;
  seller_avatar?: string;
  content_platform?: string;
}

export interface PredictionSummary {
  id: string;
  forecast_id: string;
  content_id?: string;
  content_title: string;
  content_thumbnail?: string;
  platform: string;
  metric?: string;
  target_value?: number;
  current_value?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  prediction_side: 'over' | 'under' | 'up' | 'down';
  amount: number;
  potential_payout: number;
  status: 'active' | 'completed' | 'cancelled' | 'won' | 'lost' | 'refunded' | 'settled' | 'pending';
  resolved_at?: string | null;
  result?: 'won' | 'lost' | 'refunded' | 'pending' | null;
  odds?: number;
  creator_id?: string;
  creator_username?: string;
}

export interface ContentHoldingDetail {
  holding: ContentHolding;
  content: {
    description: string;
    view_count?: number;
    like_count?: number;
    share_count?: number;
    comment_count?: number;
    engagement_rate?: number;
    growth_rate?: number;
    created_at?: string;
    updated_at?: string;
    genres?: string[];
    platform?: string;
    url?: string;
    published_at?: string;
    total_views?: number;
    earnings_to_date?: number;
  };
  performance: {
    day_change?: number;
    week_change?: number;
    month_change?: number;
    all_time_change?: number;
    history?: Array<{
      date: string;
      value?: number;
      price?: number;
      volume?: number;
    }>;
    ledger?: Array<{
      id: string;
      type: string;
      quantity: number;
      price: number;
      timestamp: string;
    }>;
  };
  recent_activity?: Array<{
    date: string;
    event: string;
    amount: number;
    value: number;
    type?: string;
    status?: string;
  }>;
  marketplace?: {
    listings?: Array<{
      id: string;
      quantity: number;
      ask_price: number;
      status: string;
      filled_at?: string;
    }>;
    offers?: Array<{
      id: string;
      quantity: number;
      bid_price: number;
      status: string;
      buyer_name?: string;
      message?: string;
    }>;
  };
}

export interface TrajectoryEntry {
  date: string;
  actual: number;
  expected: number;
}

export interface ForecastDetail {
  metric: string;
  target_value?: number;
  current_value?: number;
  end_date?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'settled' | 'expired';
  created_at?: string;
  target?: string;
  odds?: number;
  expires_at?: string;
  creator_projection?: string;
  creator_id?: string;
  creator_username?: string;
  content_id?: string;
  content_title?: string;
  content_thumbnail?: string;
  platform?: string;
  is_public?: boolean;
  is_featured?: boolean;
  tags?: string[];
  historical_data?: Array<{
    date: string;
    value: number;
    price?: number;
    volume?: number;
  }>;
}

export interface Participant {
  username: string;
  amount: number;
  side: 'over' | 'under';
  status: 'active' | 'won' | 'lost' | 'refunded';
}

export interface PredictionDetail {
  prediction: PredictionSummary;
  forecast: {
    metric?: string;
    target?: string;
    odds?: number;
    expires_at?: string;
    creator_projection?: string;
    [key: string]: unknown; // For any additional properties
  };
  trajectory: TrajectoryEntry[];
  participants: Array<{
    username: string;
    amount: number;
    side: 'over' | 'under' | 'up' | 'down';
    status: 'active' | 'won' | 'lost' | 'refunded' | 'pending';
  }>;
}

export interface MasterKeyActivationType {
  id: number;
  user_id: number;
  activation_date: string;
  expiration_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface WithdrawalMethodType {
  id: number;
  method_name: string;
  display_name: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  required_fields?: string;
  processing_time?: string;
  fee_percentage?: number;
  min_amount?: number;
}

export interface UserPaymentPreferenceType {
  id: number;
  user_id: number;
  payment_method: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  preference_data?: string;
}

export interface AdvertiserAnalyticsType {
  id: number;
  advertiser_id: number;
  period_start: string;
  period_end: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  created_at: string;
  updated_at: string;
}

export interface ForecastType {
  id: number;
  content_id?: number;
  creator_id: number;
  platform: string;
  content_url: string;
  metric: string;
  target_value: number;
  current_value: number;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  result?: 'over' | 'under' | 'draw';
  over_pool: number;
  under_pool: number;
  total_volume: number;
  created_at: string;
  updated_at: string;
}

export interface CouponType {
  id: string;
  advertiser_id: string;
  title: string;
  description: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  total_quantity: number;
  quantity_remaining: number;
  redemption_limit: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  assignments?: CouponAssignmentType[];
}

export interface CouponAssignmentType {
  id: string;
  coupon_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  redeemed_at: string | null;
  status: 'assigned' | 'redeemed' | 'expired';
}

export interface CouponRedemptionType {
  id: string;
  coupon_id: string;
  user_id: string;
  user_name: string;
  redeemed_at: string;
  reward_value: number;
  reward_unit: CouponType['discount_type'];
  status: 'pending' | 'completed' | 'cancelled';
}

// ===== EVENT TYPES =====

export interface EventType {
  id: string;
  creator_id: string;
  organizer_name: string;
  organizer_avatar: string | null;
  title: string;
  description: string | null;
  category: string | null;
  flyer_url: string | null;
  banner_url: string | null;
  event_date: string;
  event_end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  location_coordinates: { lat: number; lng: number } | null;
  ticketing_platform: string | null;
  ticketing_url: string | null;
  ticket_price_range: string | null;
  is_virtual: boolean;
  virtual_url: string | null;
  is_public: boolean;
  is_featured: boolean;
  max_attendees: number | null;
  total_rewards_pool: number;
  total_gems_pool: number;
  tags: string[] | null;
  metadata: Record<string, unknown>;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  total_attendees: number;
  total_check_ins: number;
  total_tasks_completed: number;
  total_ugc_submissions: number;
  engagement_score: number;
  rewards_distributed: number;
  gems_distributed: number;
  total_rsvps: number;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface EventRsvpType {
  id: string;
  event_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  created_at: string;
  checked_in_at: string | null;
}

export interface EventTaskType {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  task_type: string;
  points_reward: number;
  gems_reward: number;
  max_completions: number | null;
  current_completions: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

export interface EventSponsorType {
  id: string;
  event_id: string;
  sponsor_id: string;
  sponsor_name: string;
  sponsor_logo: string | null;
  tier: string;
  amount: number;
  benefits: Record<string, unknown>;
  status: 'pending' | 'approved' | 'active';
  created_at: string;
}


export interface ProductType {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  images: string[];
  rating: number;
  review_count: number;
  sales_count: number;
  is_featured: boolean;
  merchant_stores: {
    store_name: string;
    store_slug: string;
    logo_url: string;
  };
  product_categories: {
    name: string;
    slug: string;
  } | null;
  created_at: string;
}

export interface CategoryType {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

// ===== REQUEST TYPES =====


import { z } from 'zod';

// User profile update schema
export const UpdateProfileRequestSchema = z.object({
  username: z.string().optional(),
  display_name: z.string().optional(),
  bio: z.string().optional(),
  profile_image: z.string().optional(),
  cover_image: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  social_links: z.string().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// Drop creation schema
export const CreateDropRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  drop_type: z.string(),
  platform: z.string(),
  content_url: z.string().url(),
  reward_amount: z.number().min(0),
  reward_currency: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  max_participants: z.number().min(1).optional(),
  requirements: z.string().optional(),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_approved: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  difficulty: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_paid_drop: z.boolean().default(false),
  gem_reward_base: z.number().optional(),
  gem_pool_total: z.number().optional(),
  follower_threshold: z.number().optional(),
  time_commitment: z.string().optional(),
  deliverables: z.string().optional(),
  deadline_at: z.string().optional(),
  move_cost_points: z.number().optional(),
  key_reward_amount: z.number().optional(),
  is_proof_drop: z.boolean().optional(),
  key_cost: z.number().optional(),
  reward_logic: z.string().optional(),
});

export type CreateDropRequest = z.infer<typeof CreateDropRequestSchema>;

// Application schemas
export const ApplyToDropRequestSchema = z.object({
  application_message: z.string(),
});

export type ApplyToDropRequest = z.infer<typeof ApplyToDropRequestSchema>;

// Social action schema
export const SocialActionRequestSchema = z.object({
  action: z.string(),
  target_id: z.string(),
  target_type: z.string(),
});

export type SocialActionRequest = z.infer<typeof SocialActionRequestSchema>;

// Currency conversion schema
export const ConvertCurrencyRequestSchema = z.object({
  from_currency: z.enum(['points', 'gems']),
  to_currency: z.enum(['keys']),
  amount: z.number().min(1),
});

export type ConvertCurrencyRequest = z.infer<typeof ConvertCurrencyRequestSchema>;

// Master key activation schema
export const ActivateMasterKeyRequestSchema = z.object({
  date: z.string().optional(),
});

export type ActivateMasterKeyRequest = z.infer<typeof ActivateMasterKeyRequestSchema>;

// Withdrawal request schema
export const CreateWithdrawalRequestSchema = z.object({
  amount: z.number().min(200),
  payment_method: z.string(),
  payment_details: z.record(z.unknown()),
});

export type CreateWithdrawalRequest = z.infer<typeof CreateWithdrawalRequestSchema>;

// Payment preference schema
export const SavePaymentPreferenceRequestSchema = z.object({
  payment_method: z.string(),
  preference_data: z.record(z.unknown()),
  is_default: z.boolean().optional(),
});

export type SavePaymentPreferenceRequest = z.infer<typeof SavePaymentPreferenceRequestSchema>;

// Gem purchase schema
export const CreateGemPurchaseRequestSchema = z.object({
  package_id: z.string(),
  gems: z.number().min(1),
  amount: z.number().min(0.01),
  payment_method: z.string(),
});

export type CreateGemPurchaseRequest = z.infer<typeof CreateGemPurchaseRequestSchema>;

// Social forecast creation schema
export const CreateSocialForecastRequestSchema = z.object({
  content_id: z.number().optional(),
  platform: z.string(),
  content_url: z.string(),
  metric: z.string(),
  target_value: z.number(),
  end_date: z.string(),
  description: z.string().optional(),
});

export type CreateSocialForecastRequest = z.infer<typeof CreateSocialForecastRequestSchema>;

// Place forecast prediction schema
export const PlaceForecastRequestSchema = z.object({
  prediction_amount: z.number().min(1),
  prediction_side: z.enum(['over', 'under']),
  forecast_id: z.string(),
});

export type PlaceForecastRequest = z.infer<typeof PlaceForecastRequestSchema>;

// Social betting schemas (legacy)
export const CreateSocialBetRequestSchema = z.object({
  platform: z.string(),
  content_url: z.string(),
  metric: z.string(),
  target_value: z.number(),
  end_date: z.string(),
  initial_side: z.enum(['over', 'under']),
});

export type CreateSocialBetRequest = z.infer<typeof CreateSocialBetRequestSchema>;

export const PlaceBetRequestSchema = z.object({
  bet_amount: z.number().min(1),
  bet_side: z.enum(['over', 'under']),
});

export type PlaceBetRequest = z.infer<typeof PlaceBetRequestSchema>;

// Content creation schema
export const CreateContentRequestSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin']),
  title: z.string().min(1),
  description: z.string().optional(),
  content_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  total_shares: z.number().min(1),
  share_price: z.number().min(0),
});

export type CreateContentRequest = z.infer<typeof CreateContentRequestSchema>;

// Content investment schema
export const BuySharesRequestSchema = z.object({
  content_id: z.number(),
  shares_count: z.number().min(1),
});

export type BuySharesRequest = z.infer<typeof BuySharesRequestSchema>;

// Schema enums for form validation
export const PlatformSchema = z.enum(['instagram', 'tiktok', 'youtube', 'twitter']);
export const DropTypeSchema = z.enum(['content_clipping', 'reviews', 'ugc_creation', 'affiliate_referral', 'surveys', 'challenges_events', 'engagement']);
export const DropDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export const TaskCategorySchema = z.enum(['social_media', 'content_creation', 'marketing', 'review', 'survey']);
export const TaskDifficultySchema = z.enum(['easy', 'medium', 'hard']);
