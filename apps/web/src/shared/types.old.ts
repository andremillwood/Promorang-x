import { z } from 'zod';

// ===== SCHEMAS =====

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

export interface UpdateProfileRequest extends z.infer<typeof UpdateProfileRequestSchema> {}

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
  requirements: z.record(z.any()),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_approved: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  difficulty: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_paid_drop: z.boolean().default(false),
});

export interface CreateDropRequest extends z.infer<typeof CreateDropRequestSchema> {}

// Application schemas
export const ApplyToDropRequestSchema = z.object({
  application_message: z.string(),
});

export interface ApplyToDropRequest extends z.infer<typeof ApplyToDropRequestSchema> {}

// Social action schema
export const SocialActionRequestSchema = z.object({
  action: z.string(),
  target_id: z.string(),
  target_type: z.string(),
});

export interface SocialActionRequest extends z.infer<typeof SocialActionRequestSchema> {}

// Currency conversion schema
export const ConvertCurrencyRequestSchema = z.object({
  from_currency: z.enum(['points', 'gems']),
  to_currency: z.enum(['keys']),
  amount: z.number().min(1),
});

export interface ConvertCurrencyRequest extends z.infer<typeof ConvertCurrencyRequestSchema> {}

// Master key activation schema
export const ActivateMasterKeyRequestSchema = z.object({
  date: z.string().optional(),
});

export interface ActivateMasterKeyRequest extends z.infer<typeof ActivateMasterKeyRequestSchema> {}

// Withdrawal request schema
export const CreateWithdrawalRequestSchema = z.object({
  amount: z.number().min(200),
  payment_method: z.string(),
  payment_details: z.record(z.any()),
});

export interface CreateWithdrawalRequest extends z.infer<typeof CreateWithdrawalRequestSchema> {}

// Payment preference schema
export const SavePaymentPreferenceRequestSchema = z.object({
  payment_method: z.string(),
  preference_data: z.record(z.any()),
  is_default: z.boolean().optional(),
});

export interface SavePaymentPreferenceRequest extends z.infer<typeof SavePaymentPreferenceRequestSchema> {}

// Gem purchase schema
export const CreateGemPurchaseRequestSchema = z.object({
  package_id: z.string(),
  gems: z.number().min(1),
  amount: z.number().min(0.01),
  payment_method: z.string(),
});

export interface CreateGemPurchaseRequest extends z.infer<typeof CreateGemPurchaseRequestSchema> {}

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

export interface CreateSocialForecastRequest extends z.infer<typeof CreateSocialForecastRequestSchema> {}

// Place forecast prediction schema
export const PlaceForecastRequestSchema = z.object({
  prediction_amount: z.number().min(1),
  prediction_side: z.enum(['over', 'under']),
  forecast_id: z.string(),
});

export interface PlaceForecastRequest extends z.infer<typeof PlaceForecastRequestSchema> {}

// Social betting schemas (legacy)
export const CreateSocialBetRequestSchema = z.object({
  platform: z.string(),
  content_url: z.string(),
  metric: z.string(),
  target_value: z.number(),
  end_date: z.string(),
  initial_side: z.enum(['over', 'under']),
});

export interface CreateSocialBetRequest extends z.infer<typeof CreateSocialBetRequestSchema> {}

export const PlaceBetRequestSchema = z.object({
  bet_amount: z.number().min(1),
  bet_side: z.enum(['over', 'under']),
});

export interface PlaceBetRequest extends z.infer<typeof PlaceBetRequestSchema> {}

// ===== TYPE DEFINITIONS =====

export interface UserType {
  id: string;
  mocha_user_id: string;
  email: string;
  username: string;
  display_name: string;
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
  total_earnings: number;
  total_withdrawn: number;
  is_verified: boolean;
  is_banned: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
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
  metadata: Record<string, any>;
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
  requirements: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
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
  requirements: Record<string, any>;
  is_public: boolean;
  is_featured: boolean;
  is_approved: boolean;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  difficulty: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  is_paid_drop: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
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
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
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
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  is_featured: boolean;
  is_approved: boolean;
  status: 'draft' | 'published' | 'archived';
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ContentHolding {
  content_id: string;
  content_title: string;
  content_thumbnail: string;
  content_url: string;
  content_creator: string;
  content_creator_avatar: string;
  content_platform: string;
  content_type: string;
  shares_owned: number;
  total_shares: number;
  share_percentage: number;
  total_invested: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  last_updated: string;
  purchase_date: string;
  is_verified: boolean;
  is_featured: boolean;
  is_trending: boolean;
  is_new: boolean;
  is_hot: boolean;
  is_sale: boolean;
  sale_discount: number;
  sale_end_date: string;
  visibility?: 'public' | 'private';
}

export interface ShareListing {
  id: string;
  content_id: string;
  content_title: string;
  content_thumbnail: string;
  shares_available: number;
  price_per_share: number;
  total_value: number;
  seller_id: string;
  seller_username: string;
  created_at: string;
  expires_at?: string;
}

export interface ShareOffer {
  id: string;
  content_id: string;
  content_title?: string;
  shares_requested: number;
  price_per_share: number;
  total_offer: number;
  buyer_id: string;
  buyer_username: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  expires_at?: string;
}

export interface PredictionSummary {
  id: string;
  forecast_id: string;
  content_title: string;
  content_thumbnail: string;
  metric: string;
  target_value: number;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  resolved_at?: string;
}

export interface ContentHoldingDetail {
  holding: ContentHolding;
  content: {
    description: string;
    view_count: number;
    like_count: number;
    share_count: number;
    comment_count: number;
    engagement_rate: number;
    growth_rate: number;
    created_at: string;
    updated_at: string;
  };
  performance: {
    day_change: number;
    week_change: number;
    month_change: number;
    all_time_change: number;
  };
  recent_activity: Array<{
    date: string;
    event: string;
    amount: number;
    value: number;
  }>;
}

export interface PredictionDetail {
  prediction: PredictionSummary;
  forecast: {
    metric: string;
    target_value: number;
    current_value: number;
    end_date: string;
    status: 'active' | 'completed' | 'cancelled';
    created_at: string;
  };
  user_prediction: {
    amount: number;
    side: 'over' | 'under';
    potential_payout: number;
    status: 'active' | 'won' | 'lost' | 'refunded';
  };
  participants: Array<{ username: string; amount: number; side: string; status: string }>;
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
}

export interface UserPaymentPreferenceType {
  id: number;
  user_id: number;
  payment_method: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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

// Schema enums for form validation
export const PlatformSchema = z.enum(['instagram', 'tiktok', 'youtube', 'twitter']);
export const DropTypeSchema = z.enum(['content_clipping', 'reviews', 'ugc_creation', 'affiliate_referral', 'surveys', 'challenges_events', 'engagement']);
export const DropDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export const TaskCategorySchema = z.enum(['social_media', 'content_creation', 'marketing', 'review', 'survey']);
export const TaskDifficultySchema = z.enum(['easy', 'medium', 'hard']);

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

export interface CreateContentRequest extends z.infer<typeof CreateContentRequestSchema> {}

// Content investment schema
export const BuySharesRequestSchema = z.object({
  content_id: z.number(),
  shares_count: z.number().min(1),
});

export interface BuySharesRequest extends z.infer<typeof BuySharesRequestSchema> {}

// Forecast type
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

// Coupon types
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

// Re-export all types for backward compatibility
export type UserType = UserType;
export type WalletType = WalletType;
export type TransactionType = TransactionType;
export type TaskType = TaskType;
export type DropType = DropType;
export type DropApplicationType = DropApplicationType;
export type ContentPieceType = ContentPieceType;
export type ContentHolding = ContentHolding;
export type ShareListing = ShareListing;
export type ShareOffer = ShareOffer;
export type PredictionSummary = PredictionSummary;
export type ContentHoldingDetail = ContentHoldingDetail;
export type PredictionDetail = PredictionDetail;
export type MasterKeyActivationType = MasterKeyActivationType;
export type WithdrawalMethodType = WithdrawalMethodType;
export type UserPaymentPreferenceType = UserPaymentPreferenceType;
export type AdvertiserAnalyticsType = AdvertiserAnalyticsType;
export type ForecastType = ForecastType;
export type CouponType = CouponType;
export type CouponAssignmentType = CouponAssignmentType;
export type CouponRedemptionType = CouponRedemptionType;

// Export request types
export type { CreateContentRequest };
export type { BuySharesRequest };
export type { UpdateProfileRequest };
export type { CreateDropRequest };
export type { ApplyToDropRequest };
export type { SocialActionRequest };
export type { ConvertCurrencyRequest };
export type { ActivateMasterKeyRequest };
export type { CreateWithdrawalRequest };
export type { SavePaymentPreferenceRequest };
export type { CreateGemPurchaseRequest };
export type { CreateSocialForecastRequest };
export type { PlaceForecastRequest };
export type { CreateSocialBetRequest };
export type { PlaceBetRequest };
