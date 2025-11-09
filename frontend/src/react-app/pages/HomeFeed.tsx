import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { 
  Settings,
  LogOut,
  User,
  ArrowRight,
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
  Gift
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

import type { ContentPieceType, DropType, WalletType, UserType } from '../../shared/types';
import { Routes as RoutePaths } from '@/react-app/utils/url';
import { logEvent } from '@/react-app/services/telemetry';
import api from '@/react-app/lib/api';
import rewardsService, { type UserCoupon } from '@/react-app/services/rewards';

export default function HomeFeed() {
  const { user, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const [contentFeed, setContentFeed] = useState<ContentPieceType[]>([]);
  const [dropFeed, setDropFeed] = useState<DropType[]>([]);
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'social' | 'drops' | 'rewards'>('for-you');
  const [sponsoredContent, setSponsoredContent] = useState<any[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [externalMoveModalOpen, setExternalMoveModalOpen] = useState(false);
  const [, setForecastModalOpen] = useState(false);
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const profileSlug =
    userData?.username ||
    (userData?.email ? userData.email.split('@')[0] : undefined) ||
    (user?.username ? String(user.username) : undefined) ||
    (user?.email ? user.email.split('@')[0] : undefined) ||
    'me';

  const profilePath = RoutePaths.profile(profileSlug);

  useEffect(() => {
    fetchFeeds();
    fetchUserData();

    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
      const [contentData, dropsData, walletsData, sponsoredData, couponsData] = await Promise.all([
        api.get<ContentPieceType[]>('/content'),
        api.get<DropType[]>('/drops?limit=10'),
        api.get<WalletType[]>('/users/me/wallets'),
        api.get('/content/sponsored'),
        rewardsService.getAvailableCoupons().catch(() => [])
      ]);

      console.log('📊 Feed data received:', {
        content: Array.isArray(contentData) ? contentData.length : 'not array',
        drops: Array.isArray(dropsData) ? dropsData.length : 'not array',
        wallets: Array.isArray(walletsData) ? walletsData.length : 'not array',
        sponsored: Array.isArray(sponsoredData) ? sponsoredData.length : 'not array',
        coupons: Array.isArray(couponsData) ? couponsData.length : 'not array'
      });
      console.log('🎯 Drops data type:', typeof dropsData, 'isArray:', Array.isArray(dropsData));
      console.log('🎯 Drops data structure:', JSON.stringify(dropsData).substring(0, 200));

      setContentFeed(Array.isArray(contentData) ? contentData : []);
      setDropFeed(Array.isArray(dropsData) ? dropsData.slice(0, 5) : []);
      setWallets(Array.isArray(walletsData) ? walletsData : []);
      setSponsoredContent(Array.isArray(sponsoredData) ? sponsoredData : []);
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setContentFeed([]);
      setDropFeed([]);
      setWallets([]);
      setSponsoredContent([]);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'super': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'premium': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Zap className="w-4 h-4 text-gray-600" />;
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

  const getForYouFeed = () => {
    // Mix content, drops, and coupons in a personalized order
    const mixedFeed = [];

    console.log('🔄 Building For You feed:', {
      contentFeed: contentFeed.length,
      dropFeed: dropFeed.length,
      sponsoredContent: sponsoredContent.length,
      coupons: coupons.length
    });

    // Add sponsored content first (highest priority)
    sponsoredContent.forEach(content => {
      mixedFeed.push({ type: 'content', data: content, isSponsored: true });
    });

    // Filter non-sponsored content
    const regularContent = contentFeed.filter(content =>
      !sponsoredContent.some(sponsored => sponsored.id === content.id)
    );

    // Interleave content, drops, and coupons (2 content : 1 drop : 1 coupon every 5 items)
    let contentIndex = 0;
    let dropIndex = 0;
    let couponIndex = 0;
    let itemCount = 0;
    
    while (contentIndex < regularContent.length || dropIndex < dropFeed.length || couponIndex < coupons.length) {
      // Add 2 content items
      if (contentIndex < regularContent.length) {
        mixedFeed.push({ type: 'content', data: regularContent[contentIndex] });
        contentIndex++;
        itemCount++;
      }
      if (contentIndex < regularContent.length) {
        mixedFeed.push({ type: 'content', data: regularContent[contentIndex] });
        contentIndex++;
        itemCount++;
      }
      
      // Add 1 drop
      if (dropIndex < dropFeed.length) {
        mixedFeed.push({ type: 'drop', data: dropFeed[dropIndex] });
        dropIndex++;
        itemCount++;
      }

      // Add 1 coupon every 5 items
      if (itemCount >= 5 && couponIndex < coupons.length) {
        mixedFeed.push({ type: 'coupon', data: coupons[couponIndex] });
        couponIndex++;
        itemCount = 0;
      }
    }

    console.log('✅ Mixed feed generated:', mixedFeed.length, 'items');
    return mixedFeed.slice(0, 20); // Show more items
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top spacing to account for fixed header */}
      <div className="h-16"></div>
      
      {/* User dropdown (moved from nav bar) */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="user-menu flex items-center space-x-2 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {(userData?.display_name || userData?.username || user?.email || 'U')[0].toUpperCase()}
            </div>
            <span className="flex items-center text-sm font-medium text-gray-700">
              {userData?.display_name || userData?.username || 'Account'}
            </span>
            <ArrowRight
              className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showUserMenu ? 'rotate-90' : ''}`}
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => {
                  navigate(profilePath);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate('/growth-hub');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Growth Hub</span>
              </button>

              <button
                onClick={() => {
                  navigate('/advertiser');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Advertiser</span>
              </button>

              <hr className="my-1 border-gray-200" />

              <button
                onClick={() => {
                  handleLogout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-4xl mx-auto space-y-6 p-4">
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
                  Welcome back, {user?.google_user_data?.given_name || 'Creator'}! 👋
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
                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-200 cursor-pointer hover:-translate-y-1 ${stat.action ? 'cursor-pointer' : ''}`}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'for-you', label: 'For You', icon: <Star className="w-5 h-5" /> },
              { key: 'social', label: 'Social Feed', icon: <Activity className="w-5 h-5" /> },
              { key: 'drops', label: 'Opportunities', icon: <DollarSign className="w-5 h-5" /> },
              { key: 'rewards', label: 'Rewards', icon: <Gift className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-base transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* For You Tab - Personalized Mix */}
          {activeTab === 'for-you' && (
            <div className="space-y-6">
              {getForYouFeed().length > 0 ? (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Trending opportunities for you</h3>
                  </div>
                  {getForYouFeed().map((item, index) => (
                    <div key={index}>
                      {item.type === 'content' ? (
                        <ContentCard
                          content={item.data as ContentPieceType}
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
                      ) : item.type === 'drop' ? (
                        <EnhancedDropCard drop={item.data as DropType} />
                      ) : item.type === 'coupon' ? (
                        <CouponCard coupon={item.data as UserCoupon} />
                      ) : null}
                    </div>
                  ))}
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
                // Show sponsored content first, then regular content
                [
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
                ]
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to create and share content!</p>
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
                dropFeed.map((drop) => (
                  <EnhancedDropCard key={drop.id} drop={drop} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities available</h3>
                  <p className="text-gray-600 mb-4">Check back later for new earning opportunities!</p>
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
                      <h3 className="text-lg font-semibold text-gray-900">Your Available Rewards</h3>
                    </div>
                    <button
                      onClick={() => navigate('/rewards')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {coupons.slice(0, 6).map((coupon) => (
                      <CouponCard key={coupon.assignment_id} coupon={coupon} compact />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No rewards yet</h3>
                  <p className="text-gray-600 mb-4">
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
                      className="bg-white border border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200"
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
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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
    </div>
  );
}
