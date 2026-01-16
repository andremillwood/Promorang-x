import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import {
  TrendingUp,
  DollarSign,
  Star,
  Zap,
  Crown,
  Activity,
  Coins,
  Diamond,
  Bookmark,
  Target,
  Flame,
  Gift,
  ArrowRight
} from 'lucide-react';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import ShareContentModal from '@/react-app/components/ShareContentModal';
import ExternalMoveModal from '@/react-app/components/ExternalMoveModal';
import EditContentModal from '@/react-app/components/EditContentModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import ShareModal from '@/react-app/components/ShareModal';
import SavedContentModal from '@/react-app/components/SavedContentModal';
import ContentCard from '@/react-app/components/ContentCard';
import EnhancedDropCard from '@/react-app/components/EnhancedDropCard';
import CouponCard from '@/react-app/components/CouponCard';
import PersonalizedEmptyState from '@/react-app/components/PersonalizedEmptyState';
import PlaceForecastModal from '@/react-app/components/PlaceForecastModal';
import TipModal from '@/react-app/components/TipModal';
import FeedItemWrapper from '@/react-app/components/FeedItemWrapper';
import ForecastCard, { type SocialForecast } from '@/react-app/components/ForecastCard';
import MovementCard from '@/react-app/components/MovementCard';
import WelcomeBanner from '@/react-app/components/WelcomeBanner';

import type { ContentPieceType, DropType, WalletType, UserType, EventType, ProductType } from '../../shared/types';
import { Routes as RoutePaths } from '@/react-app/utils/url';
import { logEvent } from '@/react-app/services/telemetry';
import api from '@/react-app/lib/api';
import { apiFetch } from '@/react-app/utils/api';
import rewardsService, { type UserCoupon } from '@/react-app/services/rewards';
import eventsService from '@/react-app/services/events';
import EventCard from '@/react-app/components/EventCard';
import ProductCard from '@/react-app/components/ProductCard';

export default function HomeFeed() {
  const { user, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const [contentFeed, setContentFeed] = useState<ContentPieceType[]>([]);
  const [dropFeed, setDropFeed] = useState<DropType[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);

  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [unifiedFeed, setUnifiedFeed] = useState<any[]>([]); // Unified feed items
  const [userData, setUserData] = useState<UserType | null>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'social' | 'drops' | 'rewards'>('for-you');
  const [sponsoredContent, setSponsoredContent] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Generalized infinite scroll state for all tabs
  const [pagination, setPagination] = useState({
    'for-you': { offset: 0, hasMore: true },
    'social': { offset: 0, hasMore: true },
    'drops': { offset: 0, hasMore: true },
    'rewards': { offset: 0, hasMore: true }
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const FEED_PAGE_SIZE = 20;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [externalMoveModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentPieceType | null>(null);
  const [shareContentData, setShareContentData] = useState<{ id: number; title: string } | null>(null);
  const [externalMoveContentData, setExternalMoveContentData] = useState<{ id: number; title: string; platform: string; url: string } | null>(null);
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editContentData, setEditContentData] = useState<ContentPieceType | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentPieceType | null>(null);
  const [contentShareModalOpen, setContentShareModalOpen] = useState(false);
  const [shareModalContent, setShareModalContent] = useState<{ id: number; title: string } | null>(null);
  const [savedContentModalOpen, setSavedContentModalOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipContent, setTipContent] = useState<ContentPieceType | null>(null);
  const [predictModalOpen, setPredictModalOpen] = useState(false);
  const [predictContent, setPredictContent] = useState<ContentPieceType | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<SocialForecast | null>(null);
  const profileSlug =
    userData?.username ||
    (userData?.email ? userData.email.split('@')[0] : undefined) ||
    (user?.username ? String(user.username) : undefined) ||
    (user?.email ? user.email.split('@')[0] : undefined) ||
    'me';

  const profilePath = RoutePaths.profile(profileSlug);

  useEffect(() => {
    fetchUserPreferences();
    fetchFeeds();
    fetchUserData();

  }, []);

  // Refetch feeds when interests change
  useEffect(() => {
    if (userInterests.length > 0) {
      // Refetch drops and for-you with personalization
      fetchPersonalizedData();
    }
  }, [userInterests]);

  const fetchUserPreferences = async () => {
    if (!user) return;
    try {
      const response = await apiFetch('/api/users/preferences');
      const data = await response.json();
      if (data.success && data.preferences?.interests) {
        setUserInterests(data.preferences.interests);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchPersonalizedData = async () => {
    try {
      const interestsParam = userInterests.length > 0 ? `&interests=${userInterests.join(',')}` : '';

      const [dropsData, feedResponse] = await Promise.all([
        api.get<DropType[]>(`/drops?limit=10${interestsParam}`),
        api.get<{ data?: { feed: any[] }, feed?: any[] }>(`/feed/for-you?limit=${FEED_PAGE_SIZE}&offset=0${interestsParam}`)
      ]);

      if (Array.isArray(dropsData)) {
        setDropFeed(dropsData.slice(0, 5));
      }

      const feedData = feedResponse?.data?.feed || feedResponse?.feed || [];
      if (feedData.length > 0) {
        setUnifiedFeed(feedData);
      }
    } catch (error) {
      console.error('Error fetching personalized data:', error);
    }
  };

  useEffect(() => {
    logEvent('growth_feed_view', {
      source: 'home_feed',
    }, { userId: user?.id || userData?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab: 'for-you' | 'social' | 'drops' | 'rewards') => {
    setActiveTab(tab);
    logEvent('growth_tab_selected', {
      tab,
    }, { userId: user?.id || userData?.id });
  };

  const openContentDetail = (content: ContentPieceType) => {
    logEvent('growth_content_open', {
      contentId: content.id,
      source: activeTab,
    }, { userId: user?.id || userData?.id });
    navigate(`/content/${content.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const fetchFeeds = async () => {
    try {
      // Build interests param for personalization
      const interestsParam = userInterests.length > 0 ? `&interests=${userInterests.join(',')}` : '';

      const [contentData, dropsData, walletsData, sponsoredData, couponsData, eventsData, productsResponse] = await Promise.all([
        api.get<ContentPieceType[]>('/content'),
        api.get<DropType[]>(`/drops?limit=10${interestsParam}`),
        api.get<WalletType[]>('/users/me/wallets'),
        api.get('/content/sponsored'),
        rewardsService.getAvailableCoupons().catch(() => []),
        eventsService.listEvents({ limit: 5, upcoming: true }).catch(() => []),
        api.get<{ products: ProductType[] }>('/marketplace/products?limit=10').catch(() => ({ products: [] }))
      ]);

      console.log('📊 Feed data received:', {
        content: Array.isArray(contentData) ? contentData.length : 'not array',
        drops: Array.isArray(dropsData) ? dropsData.length : 'not array',
        wallets: Array.isArray(walletsData) ? walletsData.length : 'not array',
        sponsored: Array.isArray(sponsoredData) ? sponsoredData.length : 'not array',
        coupons: Array.isArray(couponsData) ? couponsData.length : 'not array',
        events: Array.isArray(eventsData) ? eventsData.length : 'not array',
        products: productsResponse?.products?.length || '0'
      });

      setContentFeed(Array.isArray(contentData) ? contentData : []);
      setDropFeed(Array.isArray(dropsData) ? dropsData.slice(0, 5) : []);
      setWallets(Array.isArray(walletsData) ? walletsData : []);
      setSponsoredContent(Array.isArray(sponsoredData) ? sponsoredData : []);
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setProducts(Array.isArray(productsResponse?.products) ? productsResponse.products : (Array.isArray(productsResponse) ? productsResponse : []));

      // Fetch unified feed separately - reset pagination
      try {
        const interestsParam = userInterests.length > 0 ? `&interests=${userInterests.join(',')}` : '';
        const feedResponse = await api.get<{ data?: { feed: any[] }, feed?: any[] }>(`/feed/for-you?limit=${FEED_PAGE_SIZE}&offset=0${interestsParam}`);
        const feedData = feedResponse?.data?.feed || feedResponse?.feed || [];
        setUnifiedFeed(feedData);

        setPagination(prev => ({
          ...prev,
          'for-you': { offset: FEED_PAGE_SIZE, hasMore: feedData.length >= FEED_PAGE_SIZE },
          'social': { offset: FEED_PAGE_SIZE, hasMore: (contentData as any)?.length >= FEED_PAGE_SIZE },
          'drops': { offset: 10, hasMore: (dropsData as any)?.length >= 10 },
          'rewards': { offset: FEED_PAGE_SIZE, hasMore: (couponsData as any)?.length >= FEED_PAGE_SIZE }
        }));
      } catch (e) {
        console.error('Failed to fetch unified feed', e);
      }

    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setContentFeed([]);
    } finally {
      setLoading(false);
    }
  };

  // Load more function for infinite scroll - generalized for all tabs
  const loadMoreFeed = useCallback(async () => {
    if (isLoadingMore) return;

    const currentPagination = pagination[activeTab];
    if (!currentPagination.hasMore) return;

    setIsLoadingMore(true);
    try {
      let endpoint = '';
      let limit = FEED_PAGE_SIZE;
      const offset = currentPagination.offset;

      switch (activeTab) {
        case 'for-you':
          endpoint = `/feed/for-you?limit=${limit}&offset=${offset}`;
          break;
        case 'social':
          // content API uses page=, limit=
          const page = Math.floor(offset / limit) + 1;
          endpoint = `/content?limit=${limit}&page=${page}`;
          break;
        case 'drops':
          limit = 10;
          const dropsInterests = userInterests.length > 0 ? `&interests=${userInterests.join(',')}` : '';
          endpoint = `/drops?limit=${limit}&offset=${offset}${dropsInterests}`;
          break;
        case 'rewards':
          endpoint = `/rewards/coupons?limit=${limit}&offset=${offset}`;
          break;
      }

      const response = await api.get<any>(endpoint);
      let newItems: any[] = [];

      // Handle different response shapes
      if (activeTab === 'for-you') {
        newItems = response?.data?.feed || response?.feed || [];
      } else if (activeTab === 'social') {
        newItems = Array.isArray(response) ? response : (response?.data || []);
      } else if (activeTab === 'drops') {
        newItems = Array.isArray(response) ? response : (response?.data || []);
      } else if (activeTab === 'rewards') {
        newItems = response?.coupons || [];
      }

      if (newItems.length > 0) {
        // Update respective state
        switch (activeTab) {
          case 'for-you':
            setUnifiedFeed(prev => [...prev, ...newItems]);
            break;
          case 'social':
            setContentFeed(prev => [...prev, ...newItems]);
            break;
          case 'drops':
            setDropFeed(prev => [...prev, ...newItems]);
            break;
          case 'rewards':
            setCoupons(prev => [...prev, ...newItems]);
            break;
        }

        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            offset: offset + limit,
            hasMore: newItems.length >= limit
          }
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          [activeTab]: { ...currentPagination, hasMore: false }
        }));
      }
    } catch (e) {
      console.error(`Failed to load more items for ${activeTab}`, e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeTab, pagination, isLoadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination[activeTab].hasMore && !isLoadingMore) {
          loadMoreFeed();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [activeTab, pagination, isLoadingMore, loadMoreFeed]);

  const fetchUserData = async () => {
    try {
      const response = await api.get<{ user: UserType }>('/users/me');
      console.log('🔐 /users/me raw response:', response);
      const user =
        (response as any)?.user ||
        (response as any)?.data?.user ||
        (response as unknown as UserType);
      if (user) {
        console.log('👤 Normalized user payload for dashboard:', {
          id: user.id,
          points: user.points_balance,
          keys: user.keys_balance,
          gems: user.gems_balance,
          masterKeyActivated: user.master_key_activated_at,
        });
        setUserData(user);
      } else {
        console.warn('⚠️ No user object resolved from /users/me response');
      }
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        await logout();
        navigate('/auth?expired=1');
      }
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSocialAction = async (action: string, contentId?: number) => {
    try {
      const data = await api.post<{ points_earned: number; multiplier: number }>(
        '/users/social-action',
        {
          action_type: action,
          reference_id: contentId,
          reference_type: 'content'
        }
      );

      if (data) {
        showPointsNotification(data);
        fetchUserData(); // Refresh user data
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

  const handleBuyShares = async (content: ContentPieceType, sharesCount: number) => {
    try {
      await api.post('/content/buy-shares', {
        content_id: content.id,
        shares_count: sharesCount
      });

      await fetchFeeds(); // Refresh data after purchase
    } catch (error) {
      console.error('Failed to buy shares:', error);
      throw error;
    }
  };

  const handleTip = async (content: ContentPieceType, amount: number) => {
    try {
      await api.post('/content/tip', {
        content_id: content.id,
        tip_amount: amount
      });

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
    } catch (error) {
      console.error('Failed to send tip:', error);
      throw error;
    }
  };

  const openBuyModal = (content: ContentPieceType) => {
    setSelectedContent(content);
    setBuyModalOpen(true);
  };

  const openShareModal = (content: ContentPieceType) => {
    setShareModalContent({ id: content.id, title: content.title });
    setContentShareModalOpen(true);
  };

  const openSavedContentModal = () => {
    setSavedContentModalOpen(true);
  };

  const openExternalMoveModal = (content: ContentPieceType) => {
    setExternalMoveContentData({
      id: content.id,
      title: content.title,
      platform: content.platform,
      url: content.platform_url
    });
    setExternalMoveModalOpen(true);
  };

  const openTipModal = (content: ContentPieceType) => {
    setTipContent(content);
    setTipModalOpen(true);
  };

  const openEditModal = (content: ContentPieceType) => {
    setEditContentData(content);
    setEditContentModalOpen(true);
  };

  const openPredictModal = (content: ContentPieceType) => {
    setPredictContent(content);
    setPredictModalOpen(true);
  };

  const openDeleteConfirm = (content: ContentPieceType) => {
    setContentToDelete(content);
    setDeleteConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return;

    try {
      await api.delete(`/content/${contentToDelete.id}`);

      // Remove content from local state
      setContentFeed(prev => prev.filter(item => item.id !== contentToDelete.id));
      setDeleteConfirmModalOpen(false);
      setContentToDelete(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handlePlaceForecast = (forecast: SocialForecast) => {
    setSelectedForecast(forecast);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'super': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'premium': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Zap className="w-4 h-4 text-pr-text-2" />;
    }
  };

  const getTierMultiplier = (tier: string) => {
    switch (tier) {
      case 'super': return 2.0;
      case 'premium': return 1.5;
      default: return 1.0;
    }
  };

  const getSmartCTA = () => {
    if (!userData) return null;

    // Smart CTA logic based on user state
    if (!userData.master_key_activated_at) {
      return {
        text: "Activate Master Key",
        subtext: "Complete a Proof Drop to unlock premium features",
        route: '/earn?type=proof',
        color: "from-orange-500 to-red-500",
        icon: <Target className="w-5 h-5" />
      };
    }

    if (userData.points_streak_days === 0) {
      return {
        text: "Start Your Streak",
        subtext: "Engage with content today to begin earning streaks",
        action: () => setActiveTab('social'),
        color: "from-blue-500 to-purple-500",
        icon: <Flame className="w-5 h-5" />
      };
    }

    if (userData.gems_balance < 10) {
      return {
        text: "Get More Gems",
        subtext: "Purchase gems to access paid drops and predictions",
        route: '/invest/portfolio',
        color: "from-purple-500 to-pink-500",
        icon: <Diamond className="w-5 h-5" />
      };
    }

    return {
      text: "Explore Growth Hub",
      subtext: "Stake gems, fund projects, and secure your earnings",
      route: '/growth-hub',
      color: "from-green-500 to-emerald-500",
      icon: <TrendingUp className="w-5 h-5" />
    };
  };

  const smartCTA = getSmartCTA();

  const handleSmartCTA = () => {
    if (!smartCTA) return;
    if (smartCTA.route) {
      navigate(smartCTA.route, smartCTA.options);
    } else if (smartCTA.action) {
      smartCTA.action();
    }
  };

  // Check if user is new (for showing welcome banner)
  const isNewUser = userData && (
    !userData.master_key_activated_at &&
    (userData.total_drops_completed || 0) === 0 &&
    (userData.total_content_created || 0) === 0
  );

  const showWelcomeBanner = isNewUser && !localStorage.getItem('welcome_banner_dismissed');

  return (
    <div className="bg-pr-surface-2">
      {/* Main Dashboard Content */}
      <div className="max-w-4xl mx-auto space-y-6 px-0 sm:px-0">
        {/* Welcome Banner for New Users */}
        {showWelcomeBanner && (
          <WelcomeBanner
            userName={user?.google_user_data?.given_name || userData?.display_name}
          />
        )}

        {/* Personalized Dashboard Header */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M30 30c0 16.569-13.431 30-30 30v-60c16.569 0 30 13.431 30 30z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 leading-tight">
                  Welcome back, {user?.google_user_data?.given_name || 'User'}! 👋
                </h1>
                <p className="text-orange-100 text-base">
                  Ready to turn your influence into income?
                </p>
              </div>
              {userData && (
                <div className="text-right">
                  <div className="flex items-center space-x-2 justify-end mb-1">
                    {getTierIcon(userData.user_tier)}
                    <span className="text-base font-semibold capitalize">
                      {userData.user_tier}
                    </span>
                  </div>
                  <div className="text-sm text-orange-200">
                    {getTierMultiplier(userData.user_tier)}x multiplier
                  </div>
                  {userData.points_streak_days > 0 && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <Flame className="w-4 h-4 text-orange-300" />
                      <span className="text-sm text-orange-200">
                        {userData.points_streak_days} day streak
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            {userData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { value: (userData.points_balance || 0).toLocaleString(), label: 'Points', icon: <Coins className="w-5 h-5" />, color: 'text-blue-200' },
                  { value: userData.keys_balance || 0, label: 'Keys', icon: <Target className="w-5 h-5" />, color: 'text-orange-200' },
                  { value: (userData.gems_balance || 0).toFixed(1), label: 'Gems', icon: <Diamond className="w-5 h-5" />, color: 'text-purple-200' },
                  { value: 'View', label: 'Saved', icon: <Bookmark className="w-5 h-5" />, color: 'text-green-200', action: openSavedContentModal }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`bg-pr-surface-card/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-pr-surface-card/20 transition-all duration-200 cursor-pointer hover:-translate-y-1 ${stat.action ? 'cursor-pointer' : ''}`}
                    onClick={stat.action || undefined}
                  >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className={stat.color}>{stat.icon}</span>
                      <span className="text-sm text-white/90 font-medium">{stat.label}</span>
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Smart CTA */}
            {smartCTA && (
              <button
                onClick={handleSmartCTA}
                className={`w-full bg-gradient-to-r ${smartCTA.color} hover:shadow-xl text-white rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      {smartCTA.icon}
                      <span className="font-semibold text-lg">{smartCTA.text}</span>
                    </div>
                    <p className="text-white/90 text-base">{smartCTA.subtext}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 opacity-75" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Feed Tabs */}
      <div className="bg-pr-surface-card shadow-sm border-t border-b border-pr-surface-3 overflow-hidden max-w-full rounded-none sm:rounded-xl sm:border sm:border-pr-surface-3">
        <div className="border-b border-pr-surface-3 overflow-x-auto no-scrollbar">
          <nav className="flex min-w-max">
            {[
              { key: 'for-you', label: 'For You', icon: <Star className="w-5 h-5" /> },
              { key: 'social', label: 'Social Feed', icon: <Activity className="w-5 h-5" /> },
              { key: 'drops', label: 'Opportunities', icon: <DollarSign className="w-5 h-5" /> },
              { key: 'rewards', label: 'Rewards', icon: <Gift className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-base transition-all duration-200 ${activeTab === tab.key
                  ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50 shadow-sm'
                  : 'text-pr-text-2 hover:text-pr-text-1 hover:bg-pr-surface-2'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-0 pt-4 pb-6 sm:p-6">
          {/* For You Tab - Personalized Mix */}
          {activeTab === 'for-you' && (
            <div className="space-y-6">
              {unifiedFeed.length > 0 ? (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-pr-text-1">Trending opportunities for you</h3>
                  </div>
                  {unifiedFeed.map((item, index) => (
                    <div key={`${item.type}-${item.id || index}`}>
                      {item.type === 'content' ? (
                        <FeedItemWrapper type="content">
                          <ContentCard
                            content={item}
                            onBuyShares={openBuyModal}
                            onShare={openShareModal}
                            onSocialAction={handleSocialAction}
                            onTip={openTipModal}
                            onNavigate={openContentDetail}
                            onPredict={openPredictModal}
                            currentUser={userData}
                            onEdit={openEditModal}
                            onDelete={openDeleteConfirm}
                            isSponsored={(item as any).isSponsored}
                          />
                        </FeedItemWrapper>
                      ) : item.type === 'drop' ? (
                        <FeedItemWrapper type="drop">
                          <EnhancedDropCard drop={item} />
                        </FeedItemWrapper>
                      ) : item.type === 'event' ? (
                        <FeedItemWrapper type="event">
                          <EventCard event={item} />
                        </FeedItemWrapper>
                      ) : item.type === 'product' ? (
                        <FeedItemWrapper type="product">
                          <ProductCard product={item} compact />
                        </FeedItemWrapper>
                      ) : item.type === 'coupon' ? (
                        <FeedItemWrapper type="coupon">
                          <CouponCard coupon={item} />
                        </FeedItemWrapper>
                      ) : item.type === 'prediction' ? (
                        <FeedItemWrapper type="prediction">
                          <ForecastCard
                            forecast={item}
                            onPlacePrediction={handlePlaceForecast}
                          />
                        </FeedItemWrapper>
                      ) : item.type === 'movement' ? (
                        <FeedItemWrapper type="movement">
                          <MovementCard movement={item} />
                        </FeedItemWrapper>
                      ) : null}
                    </div>
                  ))}

                  {/* Infinite scroll observer target and loading indicator */}
                  <div ref={loadMoreRef} className="py-4">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center space-x-2 text-pr-text-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                    {!pagination['for-you'].hasMore && unifiedFeed.length > 0 && (
                      <div className="text-center text-sm text-pr-text-2 py-2">
                        You've reached the end of your personalized feed
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <PersonalizedEmptyState />
              )}
            </div>
          )}

          {/* Social Feed Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {/* Debug info and refresh button */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  Showing {contentFeed.length} content pieces
                </div>
                <button
                  onClick={fetchFeeds}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Refresh Feed
                </button>
              </div>
              {contentFeed.length > 0 ? (
                <>
                  {/* Show sponsored content first, then regular content */}
                  {[
                    ...sponsoredContent.map((content) => (
                      <ContentCard
                        key={`sponsored-${content.id}`}
                        content={content}
                        onBuyShares={openBuyModal}
                        onShare={openShareModal}
                        onSocialAction={handleSocialAction}
                        onTip={openTipModal}
                        onNavigate={openContentDetail}
                        onPredict={openPredictModal}
                        currentUser={userData}
                        onEdit={openEditModal}
                        onDelete={openDeleteConfirm}
                        isSponsored={true}
                      />
                    )),
                    ...contentFeed
                      .filter(content => !sponsoredContent.some(sponsored => sponsored.id === content.id))
                      .map((content) => (
                        <ContentCard
                          key={content.id}
                          content={content}
                          onBuyShares={openBuyModal}
                          onShare={openShareModal}
                          onSocialAction={handleSocialAction}
                          onTip={openTipModal}
                          onNavigate={openContentDetail}
                          onPredict={openPredictModal}
                          currentUser={userData}
                          onEdit={openEditModal}
                          onDelete={openDeleteConfirm}
                        />
                      ))
                  ]}

                  {/* Infinite scroll observer target and loading indicator */}
                  <div ref={loadMoreRef} className="py-4">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center space-x-2 text-pr-text-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                    {!pagination['social'].hasMore && contentFeed.length > 0 && (
                      <div className="text-center text-sm text-pr-text-2 py-2">
                        You've reached the end of the social feed
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-pr-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-pr-text-1 mb-2">No content yet</h3>
                  <p className="text-pr-text-2 mb-4">Be the first to create and share content!</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.location.href = '/create'}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Content</span>
                    </button>
                    <button
                      onClick={fetchFeeds}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Check for new content
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opportunities/Drops Tab */}
          {activeTab === 'drops' && (
            <div className="space-y-4">
              {dropFeed.length > 0 ? (
                <>
                  {dropFeed.map((drop) => (
                    <EnhancedDropCard key={drop.id} drop={drop} />
                  ))}

                  {/* Infinite scroll observer target and loading indicator */}
                  <div ref={loadMoreRef} className="py-4">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center space-x-2 text-pr-text-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                    {!pagination['drops'].hasMore && dropFeed.length > 0 && (
                      <div className="text-center text-sm text-pr-text-2 py-2">
                        No more opportunities available
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-pr-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-pr-text-1 mb-2">No opportunities available</h3>
                  <p className="text-pr-text-2 mb-4">Check back later for new earning opportunities!</p>
                  <button
                    onClick={() => window.location.href = '/earn'}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Browse All Opportunities
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              {coupons.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-pr-text-1">Your Available Rewards</h3>
                    </div>
                    <button
                      onClick={() => navigate('/rewards')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {coupons.map((coupon) => (
                      <CouponCard key={coupon.assignment_id} coupon={coupon} compact />
                    ))}
                  </div>

                  {/* Infinite scroll observer target and loading indicator */}
                  <div ref={loadMoreRef} className="py-4">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center space-x-2 text-pr-text-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                        <span className="text-sm">Loading more...</span>
                      </div>
                    )}
                    {!pagination['rewards'].hasMore && coupons.length > 0 && (
                      <div className="text-center text-sm text-pr-text-2 py-2">
                        You've seen all your rewards
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-pr-text-1 mb-2">No rewards yet</h3>
                  <p className="text-pr-text-2 mb-4">
                    Complete drops, engage with content, or climb the leaderboard to earn rewards!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate('/earn')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Browse Opportunities
                    </button>
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="bg-pr-surface-card border border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      View Leaderboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedContent && (
        <BuySharesModal
          content={selectedContent}
          wallet={wallets?.find(w => w.currency_type === 'USD')}
          isOpen={buyModalOpen}
          onClose={() => {
            setBuyModalOpen(false);
            setSelectedContent(null);
          }}
          onPurchase={handleBuyShares}
        />
      )}

      <ShareContentModal
        user={userData}
        contentId={shareContentData?.id}
        contentTitle={shareContentData?.title}
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareContentData(null);
        }}
        onSuccess={() => {
          fetchUserData();
          fetchFeeds();
        }}
      />

      <ExternalMoveModal
        user={userData}
        contentId={externalMoveContentData?.id}
        contentTitle={externalMoveContentData?.title}
        contentPlatform={externalMoveContentData?.platform}
        contentUrl={externalMoveContentData?.url}
        isOpen={externalMoveModalOpen}
        onClose={() => {
          setExternalMoveModalOpen(false);
          setExternalMoveContentData(null);
        }}
        onSuccess={() => {
          fetchUserData();
          fetchFeeds();
        }}
      />

      {editContentData && (
        <EditContentModal
          isOpen={editContentModalOpen}
          onClose={() => {
            setEditContentModalOpen(false);
            setEditContentData(null);
          }}
          onSuccess={handleEditSuccess}
          content={editContentData}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setContentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Content"
        message={`Are you sure you want to delete "${contentToDelete?.title}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Share Modal */}
      {shareModalContent && (
        <ShareModal
          isOpen={contentShareModalOpen}
          onClose={() => {
            setContentShareModalOpen(false);
            setShareModalContent(null);
          }}
          contentId={shareModalContent.id}
          contentTitle={shareModalContent.title}
        />
      )}

      {/* Saved Content Modal */}
      <SavedContentModal
        isOpen={savedContentModalOpen}
        onClose={() => setSavedContentModalOpen(false)}
        user={userData}
      />

      {/* Tip Modal */}
      {tipContent && (
        <TipModal
          content={tipContent}
          isOpen={tipModalOpen}
          onClose={() => {
            setTipModalOpen(false);
            setTipContent(null);
          }}
          onTip={handleTip}
        />
      )}

      {/* Prediction Modal */}
      {predictContent && (
        <PlaceForecastModal
          forecast={{
            id: predictContent.id,
            creator_name: predictContent.creator_name || predictContent.creator_username || 'Unknown',
            platform: predictContent.platform || 'Unknown',
            content_url: predictContent.platform_url || '',
            content_title: predictContent.title,
            forecast_type: 'engagement',
            target_value: 1000,
            current_value: 500,
            odds: 2.5,
            pool_size: 250.00,
            creator_initial_amount: 100.00,
            creator_side: 'over',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            status: 'active',
            creator_id: 0
          }}
          isOpen={predictModalOpen}
          onClose={() => {
            setPredictModalOpen(false);
            setPredictContent(null);
          }}
          onPredictionPlaced={() => {
            setPredictModalOpen(false);
            setPredictContent(null);
            fetchFeeds(); // Refresh feeds to show new prediction
          }}
        />
      )}

      {/* Actual Social Forecast Modal */}
      {selectedForecast && (
        <PlaceForecastModal
          forecast={selectedForecast}
          isOpen={!!selectedForecast}
          onClose={() => setSelectedForecast(null)}
          onPredictionPlaced={() => {
            setSelectedForecast(null);
            fetchFeeds();
          }}
        />
      )}
    </div>
  );
}
