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
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  requirements: string[];
  completions: number;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
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
    type: 'image' | 'video' | 'text';
  };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isLiked: boolean;
  isShared: boolean;
  isBacked: boolean;
  backPrice?: number;
  currentValue?: number;
  sourceUrl?: string;
  sourcePlatform?: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook';
  enableContentShares?: boolean;
  enableBetting?: boolean;
  initialSharePrice?: number;
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
  status: 'active' | 'completed' | 'expired';
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
  status: 'active' | 'completed' | 'expired';
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