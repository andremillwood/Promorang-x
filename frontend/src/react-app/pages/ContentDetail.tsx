import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ArrowLeft,
  ExternalLink,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Bookmark,
  Coins,
  Target,
  Gift,
  Repeat,
  Tag,
  Sparkles,
  Star,
  Flame
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import { ContentPieceType, WalletType, UserType } from '@/shared/types';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import ShareContentModal from '@/react-app/components/ShareContentModal';
import ExternalMoveModal from '@/react-app/components/ExternalMoveModal';
import ContentFundingModal from '@/react-app/components/ContentFundingModal';
import EditContentModal from '@/react-app/components/EditContentModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import Tooltip from '@/react-app/components/Tooltip';
import CommentSystem from '@/react-app/components/CommentSystem';
import SponsorshipModal from '@/react-app/components/SponsorshipModal';
import TipModal from '@/react-app/components/TipModal';
import { buildAuthHeaders } from '@/react-app/utils/api';

const fallbackImages = [
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80&sat=-10',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80&sat=-10',
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1400&q=80&sat=-10',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80&sat=-10',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80&sat=-10',
];

const getFallbackImage = (seed: number | string | undefined) => {
  const index = Math.abs(Number(seed) || 0) % fallbackImages.length;
  return `${fallbackImages[index]}&sig=${seed ?? index}`;
};

const buildFallbackContent = (seed: number): ContentPieceType => ({
  id: seed,
  creator_id: 1000 + seed,
  creator_username: 'demo_creator',
  creator_name: 'Demo Creator',
  creator_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_content',
  platform: 'instagram',
  platform_url: 'https://instagram.com/promorang',
  title: 'Demo Growth Content Spotlight',
  description: 'Experience a highlight clip from our creator community. Monitor engagement, share prices, and revenue performance in real time.',
  media_url: getFallbackImage(seed),
  total_shares: 3500,
  available_shares: 1240,
  engagement_shares_total: 3200,
  engagement_shares_remaining: 880,
  share_price: 12.5,
  current_revenue: 8450,
  performance_metrics: JSON.stringify({
    impressions: 98000,
    clicks: 12500,
    conversions: 1320,
    engagement_rate: 0.128,
  }),
  views_count: 98000,
  likes_count: 15420,
  comments_count: 2450,
  reposts_count: 1200,
  is_demo: true,
  is_sponsored: false,
  created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
});

const normalizeContent = (raw: any, seed: number): ContentPieceType => {
  const fallback = buildFallbackContent(seed);

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const id = Number(raw.id ?? seed ?? fallback.id);
  const performanceMetrics =
    typeof raw.performance_metrics === 'string'
      ? raw.performance_metrics
      : JSON.stringify({
          impressions: raw.impressions ?? fallback.views_count ?? 0,
          clicks: raw.clicks ?? 0,
          conversions: raw.conversions ?? 0,
          engagement_rate: raw.engagement_rate ?? 0.07,
        });

  const mediaUrl = raw.media_url && /^https?:\/\//i.test(raw.media_url)
    ? raw.media_url
    : getFallbackImage(id);

  return {
    id,
    creator_id: Number(raw.creator_id ?? fallback.creator_id),
    creator_username: raw.creator_username ?? fallback.creator_username,
    creator_name: raw.creator_name ?? fallback.creator_name,
    creator_avatar: raw.creator_avatar ?? fallback.creator_avatar,
    platform: raw.platform ?? fallback.platform,
    platform_url: raw.platform_url ?? raw.content_url ?? fallback.platform_url,
    title: raw.title ?? fallback.title,
    description: raw.description ?? fallback.description,
    media_url: mediaUrl,
    total_shares: Number(raw.total_shares ?? fallback.total_shares),
    available_shares: Number(raw.available_shares ?? fallback.available_shares),
    engagement_shares_total: Number(raw.engagement_shares_total ?? fallback.engagement_shares_total),
    engagement_shares_remaining: Number(raw.engagement_shares_remaining ?? fallback.engagement_shares_remaining),
    share_price: Number(raw.share_price ?? fallback.share_price),
    current_revenue: Number(raw.current_revenue ?? fallback.current_revenue),
    performance_metrics: performanceMetrics,
    views_count: Number(raw.views_count ?? raw.impressions ?? fallback.views_count),
    likes_count: Number(raw.likes_count ?? raw.likes ?? fallback.likes_count),
    comments_count: Number(raw.comments_count ?? raw.comments ?? fallback.comments_count),
    reposts_count: Number(raw.reposts_count ?? raw.shares ?? fallback.reposts_count),
    is_demo: Boolean(raw.is_demo ?? fallback.is_demo),
    is_sponsored: Boolean(raw.is_sponsored ?? fallback.is_sponsored),
    created_at: raw.created_at ?? fallback.created_at,
    updated_at: raw.updated_at ?? raw.created_at ?? fallback.updated_at,
  };
};

const fallbackMetrics = (seed: number) => ({
  likes: 14500 + (seed % 500),
  comments: 2800 + (seed % 250),
  shares: 1200 + (seed % 150),
  views: 98000 + (seed % 5000),
  internal_moves: 420 + (seed % 80),
  external_moves: 215 + (seed % 40),
  total_engagement: 14500 + (seed % 1000),
});

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentPieceType | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [externalMoveModalOpen, setExternalMoveModalOpen] = useState(false);
  const [fundingModalOpen, setFundingModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [userStatus, setUserStatus] = useState<{ has_liked: boolean; has_saved: boolean }>({ has_liked: false, has_saved: false });
  const [sponsorshipModalOpen, setSponsorshipModalOpen] = useState(false);
  const [sponsorshipData, setSponsorshipData] = useState<any>(null);
  const [tipModalOpen, setTipModalOpen] = useState(false);

  // Check if this is demo content
  const isDemo = content?.title?.toLowerCase().includes('[demo]') ||
                 content?.title?.toLowerCase().includes('demo') ||
                 content?.description?.toLowerCase().includes('demo');

  // Check if current user owns this content
  const isOwner = userData && content && (
    userData.id === content.creator_id ||
    userData.username === content.creator_name ||
    userData.display_name === content.creator_name
  );

  useEffect(() => {
    if (id) {
      fetchContentDetail();
      fetchWallets();
      fetchUserData();
      fetchMetrics();
      fetchSponsorshipData();
    }
  }, [id]);

  const fetchContentDetail = async () => {
    const seed = Number(id ?? Date.now());

    try {
      const response = await fetch(`/api/content/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContent(normalizeContent(data?.content ?? data, seed));
      } else {
        setContent(normalizeContent(null, seed));
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setContent(normalizeContent(null, seed));
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const headers = buildAuthHeaders();
      const response = await fetch('/api/users/me/wallets', {
        credentials: 'include',
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setWallets(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const headers = buildAuthHeaders();
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchMetrics = async () => {
    const seed = Number(id ?? Date.now());
    try {
      const response = await fetch(`/api/content/${id}/metrics`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        setMetrics(fallbackMetrics(seed));
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setMetrics(fallbackMetrics(seed));
    }
  };

  const fetchUserStatus = async () => {
    if (!userData || !id) return;

    try {
      const headers = buildAuthHeaders();
      const response = await fetch(`/api/content/${id}/user-status`, {
        credentials: 'include',
        headers
      });
      if (response.ok) {
        const status = await response.json();
        setUserStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  const fetchSponsorshipData = async () => {
    if (!id) return;

    try {
      const headers = buildAuthHeaders();
      const response = await fetch(`/api/content/${id}/sponsorship`, {
        credentials: 'include',
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setSponsorshipData(data);
      }
    } catch (error) {
      console.error('Failed to fetch sponsorship data:', error);
    }
  };

  const handleBuyShares = async (content: ContentPieceType, sharesCount: number) => {
    try {
      const response = await fetch('/api/content/buy-shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ content_id: content.id, shares_count: sharesCount })
      });

      if (response.ok) {
        await fetchContentDetail();
        await fetchWallets();
        await fetchMetrics();
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Failed to buy shares:', error);
      throw error;
    }
  };

  const handleSocialAction = async (action: string) => {
    try {
      // Check for one-time actions
      if (action === 'like' && userStatus.has_liked) {
        alert('You have already liked this content!');
        return;
      }

      if (action === 'save' && userStatus.has_saved) {
        alert('Content already saved to your collection!');
        return;
      }

      if (action === 'share') {
        setShareModalOpen(true);
        return;
      }

      const response = await fetch('/api/users/social-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          action_type: action,
          reference_id: content?.id,
          reference_type: 'content'
        })
      });

      if (response.ok) {
        const data = await response.json();
        showPointsNotification(data);
        await fetchMetrics();
        await fetchUserData();
        await fetchContentDetail(); // Refresh to show engagement shares changes
        await fetchUserStatus(); // Refresh user interaction status
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          alert(errorData.error);
        }
      }
    } catch (error) {
      console.error(`Failed to record ${action} action:`, error);
    }
  };

  const showPointsNotification = (data: any) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>+${data.points_earned} points!</span>
        <span class="text-xs">(${data.multiplier.toFixed(1)}x multiplier)</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const handleTip = async (content: ContentPieceType, amount: number) => {
    try {
      const response = await fetch('/api/content/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ content_id: content.id, tip_amount: amount })
      });

      if (response.ok) {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-purple-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-lg">💎</span>
            <div>
              <div class="font-semibold">Tip sent!</div>
              <div class="text-xs opacity-90">Tipped ${amount} gems to ${content.creator_name || content.creator_username || 'creator'}</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 4000);

        fetchUserData(); // Refresh user balance
      } else {
        throw new Error('Tip failed');
      }
    } catch (error) {
      console.error('Failed to send tip:', error);
      throw error;
    }
  };

  const handleFundingSuccess = (newRevenue: number, newSharePrice: number) => {
    setFundingModalOpen(false);
    // Update the content in the local state
    if (content) {
      setContent({
        ...content,
        current_revenue: newRevenue,
        share_price: newSharePrice
      });
    }
    fetchUserData(); // Refresh user data to show updated balance
  };

  const handleEditSuccess = (updatedContent: ContentPieceType) => {
    setEditModalOpen(false);
    setContent(updatedContent);
    fetchMetrics(); // Refresh metrics to show updated engagement data
  };

  const handleDeleteConfirm = async () => {
    if (!content) return;

    try {
      const response = await fetch(`/api/content/${content.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildAuthHeaders()
      });

      if (response.ok) {
        // Redirect to home after successful deletion
        navigate('/home');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleSponsorContent = async (gemAmount: number, boostMultiplier: number, durationHours: number) => {
    if (!content) return;

    try {
      const response = await fetch(`/api/content/${content.id}/sponsor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({
          gems_allocated: gemAmount,
          boost_multiplier: boostMultiplier,
          duration_hours: durationHours
        })
      });

      if (response.ok) {
        setSponsorshipModalOpen(false);
        await fetchSponsorshipData(); // Refresh sponsorship data
        await fetchUserData(); // Refresh user balance
        alert(`Content sponsored successfully! It will receive ${boostMultiplier}x visibility boost for ${durationHours} hours.`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to sponsor content');
      }
    } catch (error) {
      console.error('Error sponsoring content:', error);
      alert('Failed to sponsor content');
    }
  };

  const getTierMultiplier = (tier: string) => {
    switch (tier) {
      case 'super': return 2.0;
      case 'premium': return 1.5;
      default: return 1.0;
    }
  };

  const getPointsForAction = (action: string) => {
    const basePoints = { like: 0.1, comment: 0.3, save: 0.5, share: 1, repost: 0.2 };
    const base = basePoints[action as keyof typeof basePoints] || 0;
    const multiplier = userData ? getTierMultiplier(userData.user_tier) : 1.0;
    return Math.floor(base * multiplier * 10) / 10;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  const getEngagementMetrics = () => {
    if (!metrics) {
      return {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        internal_moves: 0,
        external_moves: 0
      };
    }
    return metrics;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content not found</h2>
        <button
          onClick={() => navigate('/home')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const engagementMetrics = getEngagementMetrics();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Demo Alert Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-2xl">🧪</span>
            <h2 className="text-xl font-bold">DEMO CONTENT</h2>
            <span className="text-2xl">🧪</span>
          </div>
          <p className="text-center text-orange-100">
            This is demo content for testing purposes. No real money or value transfers will occur.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Content Details {isDemo && <span className="text-orange-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600">
              {isDemo ? 'Demo investment simulation - no real value' : 'Investment opportunity analysis'}
            </p>

            {/* Demo/Sponsored Indicators */}
            <div className="flex items-center space-x-2 mt-2">
              {content.is_demo && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Demo</span>
                </span>
              )}
              {content.is_sponsored && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200 flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>Sponsored</span>
                </span>
              )}

              {/* View Count */}
              {content.views_count !== undefined && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{engagementMetrics.views?.toLocaleString() || content.views_count.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Owner Actions */}
        {isOwner && (
          <div className="flex items-center space-x-2">
            <Tooltip content="Edit content">
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
            </Tooltip>
            <Tooltip content="Delete content">
              <button
                onClick={() => setDeleteConfirmModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Card */}
          <div className={`bg-white rounded-xl border overflow-hidden ${
            isDemo ? 'border-orange-300 bg-orange-50/30' : content.is_sponsored ? 'ring-2 ring-orange-200 ring-opacity-50' : 'border-gray-200'
          }`}>
            {/* Demo Banner */}
            {isDemo && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm font-medium">
                  <span>🧪</span>
                  <span>DEMO CONTENT - No real value transfers</span>
                  <span>🧪</span>
                </div>
              </div>
            )}

            {/* Sponsored Banner */}
            {content.is_sponsored && !isDemo && (
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  <span>SPONSORED CONTENT</span>
                  <Tag className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Creator Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
                  {getPlatformIcon(content.platform)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <UserLink
                      username={content.creator_name}
                      displayName={content.creator_name || 'Creator'}
                      avatarUrl={content.creator_avatar}
                      className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                      showAvatar={false}
                    />
                    <div className="flex items-center space-x-2">
                      {isOwner && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          YOUR CONTENT
                        </span>
                      )}
                      {isDemo && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                          DEMO
                        </span>
                      )}
                      <span className="text-sm text-gray-500 capitalize">{content.platform}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
            </div>

            {/* Content Image */}
            {content.media_url && (
              <div className="relative">
                <img
                  src={content.media_url}
                  alt={content.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Content Details */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{content.title}</h2>

              {content.description && (
                <p className="text-gray-700 mb-6 leading-relaxed">{content.description}</p>
              )}

              {/* Real Engagement Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-red-500 mb-1">
                    <Heart className="w-5 h-5" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.likes)}</p>
                  <p className="text-sm text-gray-500">Likes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-blue-500 mb-1">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.comments)}</p>
                  <p className="text-sm text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-green-500 mb-1">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.shares)}</p>
                  <p className="text-sm text-gray-500">Shares</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-purple-500 mb-1">
                    <Eye className="w-5 h-5" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(engagementMetrics.views)}</p>
                  <p className="text-sm text-gray-500">Views</p>
                </div>
              </div>

              {/* Move Activity Stats */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-3">Platform Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-900">{engagementMetrics.internal_moves || 0}</p>
                    <p className="text-xs text-blue-700">Internal Moves</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-900">{engagementMetrics.external_moves || 0}</p>
                    <p className="text-xs text-purple-700">External Moves</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Engagement Shares Display */}
              {content.engagement_shares_total > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">Free Engagement Shares</h4>
                        <p className="text-sm text-green-700">Earn by engaging with this content!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {content.engagement_shares_remaining}
                      </div>
                      <div className="text-sm text-green-500">remaining</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">Progress</span>
                      <span className="text-sm font-semibold text-green-600">
                        {content.engagement_shares_total - content.engagement_shares_remaining} / {content.engagement_shares_total}
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${((content.engagement_shares_total - content.engagement_shares_remaining) / content.engagement_shares_total) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Engagement Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Heart className="w-4 h-4" />
                      <span>Like for 1 share</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment for 3 shares</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Share2 className="w-4 h-4" />
                      <span>Share for 5 shares</span>
                    </div>
                  </div>
                </div>
              )}

              {/* External Move Button - Most Prominent */}
              <div className="mb-6">
                <Tooltip content="Perform actions on the original platform for 10x points!" position="top">
                  <button
                    onClick={() => setExternalMoveModalOpen(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span className="text-xl">🚀</span>
                    <span>Perform External Move</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">10x Points!</span>
                  </button>
                </Tooltip>
              </div>

              {/* Quick Internal Actions */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Quick Actions</span>
                  <span className="text-xs text-gray-400">Reduced points</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      action: 'like',
                      icon: Heart,
                      color: userStatus.has_liked ? 'text-red-500 bg-red-50' : 'hover:text-red-500',
                      disabled: userStatus.has_liked
                    },
                    { action: 'comment', icon: MessageCircle, color: 'hover:text-blue-500', disabled: false },
                    { action: 'repost', icon: Repeat, color: 'hover:text-purple-500', disabled: false },
                    {
                      action: 'save',
                      icon: Bookmark,
                      color: userStatus.has_saved ? 'text-yellow-500 bg-yellow-50' : 'hover:text-yellow-500',
                      disabled: userStatus.has_saved
                    }
                  ].map(({ action, icon: Icon, color, disabled }) => (
                    <Tooltip
                      key={action}
                      content={
                        disabled && action === 'like' ? 'Already liked!' :
                        disabled && action === 'save' ? 'Already saved!' :
                        `+${getPointsForAction(action)} points`
                      }
                      compact={true}
                    >
                      <button
                        onClick={() => handleSocialAction(action)}
                        disabled={disabled}
                        className={`flex flex-col items-center p-3 rounded-lg transition-colors hover:bg-white ${color} ${
                          disabled ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${
                          userStatus.has_liked && action === 'like' ? 'fill-current' : ''
                        } ${
                          userStatus.has_saved && action === 'save' ? 'fill-current' : ''
                        }`} />
                        <span className="text-xs text-gray-600 capitalize">{action}</span>
                        <span className="text-xs text-green-600 font-medium">
                          {disabled ? (action === 'like' ? '✓' : action === 'save' ? '✓' : `+${getPointsForAction(action)}`) : `+${getPointsForAction(action)}`}
                        </span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Platform Link */}
              <div className="pt-4 border-t border-gray-100">
                <a
                  href={content.platform_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on {content.platform}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Engagement Rate</span>
                </div>
                <p className="text-xl font-bold text-green-900">8.7%</p>
                <p className="text-xs text-green-600">+2.3% from avg</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Growth Rate</span>
                </div>
                <p className="text-xl font-bold text-blue-900">15.2%</p>
                <p className="text-xs text-blue-600">Last 24 hours</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Revenue/View</span>
                </div>
                <p className="text-xl font-bold text-purple-900">$0.0032</p>
                <p className="text-xs text-purple-600">Industry avg: $0.0028</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Reach</span>
                </div>
                <p className="text-xl font-bold text-orange-900">1.2M</p>
                <p className="text-xs text-orange-600">Unique users</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <CommentSystem
              contentId={content.id}
              currentUser={userData}
              isOwner={isOwner || false}
            />
          </div>
        </div>

        {/* Investment Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Sponsorship Status */}
          {sponsorshipData && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-purple-900">Sponsored Content</span>
                {sponsorshipData.sponsor_count > 1 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {sponsorshipData.sponsor_count} Sponsors
                  </span>
                )}
              </div>
              <p className="text-sm text-purple-700 mb-3">
                This content receives {sponsorshipData.total_boost_multiplier || sponsorshipData.boost_multiplier}x visibility boost
                {sponsorshipData.sponsor_count > 1 && ' from multiple sponsors'}
              </p>

              {/* Sponsor Information */}
              <div className="space-y-2">
                {sponsorshipData.sponsor_names && sponsorshipData.sponsor_names.length > 0 ? (
                  <div className="text-sm text-purple-700">
                    <span className="font-medium">Sponsored by:</span>
                    <div className="mt-1">
                      {sponsorshipData.sponsor_names.slice(0, 3).map((name: string, index: number) => (
                        <span key={index} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium mr-2 mb-1">
                          {name}
                        </span>
                      ))}
                      {sponsorshipData.sponsor_names.length > 3 && (
                        <span className="text-xs text-purple-600">
                          +{sponsorshipData.sponsor_names.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-purple-700">
                    <span className="font-medium">Primary Sponsor:</span> {sponsorshipData.primary_sponsor || sponsorshipData.advertiser_name || 'Advertiser'}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-purple-600 pt-2 border-t border-purple-200">
                  <span>{sponsorshipData.total_gems_allocated || sponsorshipData.gems_allocated} gems invested</span>
                  <span>{sponsorshipData.sponsor_count || 1} active sponsorship{(sponsorshipData.sponsor_count || 1) !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Advertiser Sponsorship Controls */}
          {userData?.user_type === 'advertiser' && !isOwner && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {sponsorshipData ? 'Boost Further' : 'Sponsor This Content'}
                </span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                {sponsorshipData
                  ? `Add your sponsorship to boost visibility even more! Multiple sponsors can collaborate to maximize reach.`
                  : `Boost this content's visibility and reach more users. Sponsored content appears higher in feeds and gets priority placement.`
                }
              </p>
              {sponsorshipData && (
                <div className="bg-blue-100 rounded-lg p-3 mb-3">
                  <div className="text-xs text-blue-700">
                    <div className="flex justify-between items-center">
                      <span>Current boost:</span>
                      <span className="font-semibold">{sponsorshipData.total_boost_multiplier || sponsorshipData.boost_multiplier}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active sponsors:</span>
                      <span className="font-semibold">{sponsorshipData.sponsor_count || 1}</span>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSponsorshipModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{sponsorshipData ? 'Add Your Sponsorship' : 'Sponsor This Content'}</span>
              </button>
            </div>
          )}

          {/* Investment Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Share Price</span>
                <span className="text-xl font-bold text-green-600">${(content.share_price || 0).toFixed(4)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Shares</span>
                <span className="font-semibold text-gray-900">{content.available_shares || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Shares</span>
                <span className="font-semibold text-gray-900">{content.total_shares || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Engagement Shares</span>
                <span className="font-semibold text-orange-600">{content.engagement_shares_remaining || 0}/{content.engagement_shares_total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Revenue</span>
                <span className="font-semibold text-purple-600">${(content.current_revenue || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Tooltip content={isDemo ? "Demo content - no real value transfers" : "Tip creator & boost content value"}>
                <button
                  onClick={() => setTipModalOpen(true)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isDemo
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{isDemo ? 'Demo Tip Creator' : 'Tip Creator'}</span>
                </button>
              </Tooltip>

              <button
                onClick={() => setBuyModalOpen(true)}
                disabled={content.available_shares === 0}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                  isDemo
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {content.available_shares === 0 ? 'Sold Out' : isDemo ? 'Demo Shares' : 'Buy Shares'}
              </button>

              <button
                onClick={() => navigate('/invest/social-forecasts')}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Target className="w-4 h-4" />
                <span>Make Performance Forecast</span>
              </button>

              {isDemo && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-700 text-center">
                    💡 This is demo content. No real purchases or value transfers will occur.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Market Stats */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">24h Volume</span>
                <span className="font-semibold text-gray-900">$1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Change</span>
                <span className="font-semibold text-green-600">+7.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Investors</span>
                <span className="font-semibold text-gray-900">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI Potential</span>
                <span className="font-semibold text-purple-600">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {content && (
        <>
          <BuySharesModal
            content={content}
            wallet={wallets?.find(w => w.currency_type === 'USD')}
            isOpen={buyModalOpen}
            onClose={() => setBuyModalOpen(false)}
            onPurchase={handleBuyShares}
          />

          <ShareContentModal
            user={userData}
            contentId={content.id}
            contentTitle={content.title}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            onSuccess={() => {
              fetchUserData();
              fetchMetrics();
            }}
          />

          <ExternalMoveModal
            user={userData}
            contentId={content.id}
            contentTitle={content.title}
            contentPlatform={content.platform}
            contentUrl={content.platform_url}
            isOpen={externalMoveModalOpen}
            onClose={() => setExternalMoveModalOpen(false)}
            onSuccess={() => {
              fetchUserData();
              fetchMetrics();
            }}
          />

          <ContentFundingModal
            isOpen={fundingModalOpen}
            onClose={() => setFundingModalOpen(false)}
            contentId={content.id}
            contentTitle={content.title}
            isOwner={false}
            currentRevenue={content.current_revenue || 0}
            sharePrice={content.share_price || 0}
            totalShares={content.total_shares || 0}
            onSuccess={handleFundingSuccess}
          />

          <EditContentModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={handleEditSuccess}
            content={content}
          />

          <ConfirmationModal
            isOpen={deleteConfirmModalOpen}
            onClose={() => setDeleteConfirmModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Content"
            message={`Are you sure you want to delete "${content.title}"? This action cannot be undone and will remove all associated data.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />

          {/* Enhanced Sponsorship Modal */}
          <SponsorshipModal
            isOpen={sponsorshipModalOpen}
            onClose={() => setSponsorshipModalOpen(false)}
            onSponsor={handleSponsorContent}
            contentTitle={content.title}
            userGems={userData?.gems_balance || 0}
          />

          {/* Tip Modal */}
          <TipModal
            content={content}
            isOpen={tipModalOpen}
            onClose={() => setTipModalOpen(false)}
            onTip={handleTip}
          />
        </>
      )}
    </div>
  );
}

// Export ContentDetailPage as an alias for ContentDetail
export const ContentDetailPage = ContentDetail;
