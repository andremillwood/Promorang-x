export type UserRole = 'user' | 'merchant' | 'advertiser';

export interface User {
  id: string | number;
  name: string;
  display_name?: string;
  username: string;
  email: string;
  avatar: string; // Legacy field for mobile UI
  avatar_url?: string; // New field from backend
  instagram_handle?: string;
  instagram_verified?: boolean;
  bio?: string;
  role: UserRole;
  followers: number;
  following: number;
  earnings: number;
  total_earnings_usd?: number;
  points_balance?: number;
  keys_balance?: number;
  gems_balance?: number;
  promoGems?: number; // Legacy field for mobile UI
  referralCode: string;
  referral_code?: string; // New field from backend
  referredBy?: string;
  joinedAt: string;
  created_at?: string; // New field from backend
  level?: string | number;
  xp?: number;
  badges?: string[];
  brand_name?: string;
  brand_logo_url?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  gem_reward_base?: number; // Web parity
  key_cost?: number; // Web parity
  gem_pool_remaining?: number; // Web parity
  preview_image?: string; // Web parity
  content_url?: string; // Web parity
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  requirements: string[] | string;
  deliverables?: string;
  completions: number;
  current_participants?: number;
  max_participants?: number;
  deadline?: string;
  status: 'active' | 'completed' | 'expired' | 'pending';
  createdAt: string;
  is_proof_drop?: boolean;
  is_paid_drop?: boolean;
}

export interface Post {
  id: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: {
    text?: string;
    media?: string[];
    media_url?: string; // Web parity
    type: 'image' | 'video' | 'text';
  };
  title?: string;
  description?: string;
  likes: number;
  comments: number;
  shares: number;
  views_count?: number; // Web parity
  current_revenue?: number; // Web parity
  total_shares?: number; // Web parity
  available_shares?: number; // Web parity
  engagement_shares_remaining?: number; // Web parity
  createdAt: string;
  isLiked: boolean;
  isShared: boolean;
  isBacked: boolean;
  is_demo?: boolean;
  is_sponsored?: boolean;
  backPrice?: number;
  currentValue?: number;
  sourceUrl?: string;
  sourcePlatform?: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook';
  platform?: string;
  platform_url?: string;
  enableContentShares?: boolean;
  enableBetting?: boolean;
  initialSharePrice?: number;
  share_price?: number;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  merchant: {
    id: string;
    name: string;
    avatar: string;
  };
  reward: number;
  rewardType: 'fixed' | 'percentage';
  media: string;
  category: string;
  shares: number;
  conversions: number;
  status: 'active' | 'completed' | 'expired' | 'pending';
  expiresAt?: string;
  createdAt: string;
}

export interface Bet {
  id: string;
  title: string;
  description: string;
  contentId?: string; // Links bet to specific post
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  target: {
    platform: 'instagram' | 'tiktok' | 'twitter' | 'facebook';
    metric: 'likes' | 'shares' | 'comments' | 'views';
    value: number;
  };
  currentValue: number;
  odds: number;
  pool: number;
  participants: number;
  expiresAt: string;
  status: 'active' | 'completed' | 'expired' | 'pending';
  createdAt: string;
}

export interface ContentShare {
  id: string;
  content: Post;
  totalShares: number; // Always 100 per PRD
  founderShares: number; // 50% allocation to creator
  publicShares: number; // 50% available to public
  availableShares: number; // Remaining public shares for sale
  currentPrice: number; // Price per share in PromoGems
  priceChange: number;
  priceChangePercent: number;
  dividendPool: number; // Accumulated PromoGems for dividend distribution
  totalDividendsPaid: number;
  holders: number;
  createdAt: string;
  sourceUrl: string; // Link to original content (Instagram, TikTok, etc.)
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Twitter';
  category: string;
  views: number;
  engagement: number;
  timeLeft?: string; // For limited-time offerings
}

export interface ShareOwnership {
  id: string;
  userId: string;
  contentShareId: string;
  sharesOwned: number;
  avgBuyPrice: number;
  totalInvested: number;
  dividendsEarned: number;
  purchaseDate: string;
}

export interface DividendEvent {
  id: string;
  contentShareId: string;
  eventType: 'share_action' | 'engagement_milestone' | 'primary_sale' | 'advertiser_spend';
  amount: number; // PromoGems added to dividend pool
  timestamp: string;
  description: string;
}

export interface Transaction {
  id: string | number;
  type: 'earning' | 'withdrawal' | 'investment' | 'referral' | string;
  transaction_type?: string; // From backend
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | string;
  createdAt: string; // Legacy field for mobile UI
  created_at?: string; // New field from backend
  currency_type?: string; // From backend
}

export interface GrowthInitiative {
  id: string;
  type: 'channel' | 'kickstarter' | 'shield';
  title: string;
  description: string;
  boost: string;
  duration: string;
  gemsRequired: number;
  status?: 'active' | 'available' | 'completed';
  expiresAt?: string;
}

export interface PromoGem {
  id: string;
  amount: number;
  source: 'task' | 'campaign' | 'referral' | 'bonus';
  status: 'available' | 'staked' | 'spent';
  createdAt: string;
  expiresAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  type: 'live' | 'creator' | 'drop' | 'community';
  attendees: number;
  isRegistered?: boolean;
  organizer: {
    name: string;
    avatar: string;
  };
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  brand: {
    name: string;
    logo: string;
  };
  expiresAt: string;
  isClaimed: boolean;
  category: string;
  terms?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  images: string[];
  category_id?: string;
  category_name?: string;
  is_digital: boolean;
  inventory_count: number;
  status: string;
  rating: number;
  review_count: number;
  sales_count: number;
  is_featured: boolean;
  merchant_stores?: {
    store_name: string;
    store_slug: string;
    logo_url: string;
    rating: number;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price_usd: number | null;
  price_gems: number | null;
  price_gold: number | null;
  products?: Product;
}

export interface ShoppingCart {
  id: string;
  cart_items: CartItem[];
}

export interface Store {
  id: string;
  store_name: string;
  store_slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  rating: number;
  review_count: number;
  total_sales?: number;
  total_products?: number;
  contact_email?: string;
  contact_phone?: string;
  social_links?: Record<string, string>;
  users?: {
    username: string;
    display_name: string;
  };
}