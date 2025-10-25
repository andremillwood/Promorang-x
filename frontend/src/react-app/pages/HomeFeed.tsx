import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Eye,
  DollarSign,
  Clock,
  Star,
  Zap,
  Crown,
  Bookmark,
  Gift,
  Coins,
  Diamond,
  Target,
  Flame,
  ArrowRight,
  Plus,
  Activity,
  X
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import Tooltip from '@/react-app/components/Tooltip';
import { ContentPieceType, DropType, WalletType, UserType } from '@/shared/types';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import ShareContentModal from '@/react-app/components/ShareContentModal';
import ExternalMoveModal from '@/react-app/components/ExternalMoveModal';
import PlaceForecastModal from '@/react-app/components/PlaceForecastModal';
import ContentFundingModal from '@/react-app/components/ContentFundingModal';
import EditContentModal from '@/react-app/components/EditContentModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import ShareModal from '@/react-app/components/ShareModal';
import SavedContentModal from '@/react-app/components/SavedContentModal';
import CommentSystem from '@/react-app/components/CommentSystem';
import PersonalizedEmptyState from '@/react-app/components/PersonalizedEmptyState';

export default function HomeFeed() {
  const { user } = useAuth();
  const [contentFeed, setContentFeed] = useState<ContentPieceType[]>([]);
  const [dropFeed, setDropFeed] = useState<DropType[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'social' | 'drops'>('for-you');
  const [sponsoredContent, setSponsoredContent] = useState<any[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [externalMoveModalOpen, setExternalMoveModalOpen] = useState(false);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);
  const [fundingModalOpen, setFundingModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentPieceType | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<any | null>(null);
  const [shareContentData, setShareContentData] = useState<{ id: number; title: string } | null>(null);
  const [externalMoveContentData, setExternalMoveContentData] = useState<{ id: number; title: string; platform: string; url: string } | null>(null);
  const [fundingContentData, setFundingContentData] = useState<ContentPieceType | null>(null);
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editContentData, setEditContentData] = useState<ContentPieceType | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentPieceType | null>(null);
  const [contentShareModalOpen, setContentShareModalOpen] = useState(false);
  const [shareModalContent, setShareModalContent] = useState<{ id: number; title: string } | null>(null);
  const [savedContentModalOpen, setSavedContentModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentModalContent, setCommentModalContent] = useState<ContentPieceType | null>(null);

  useEffect(() => {
    fetchFeeds();
    fetchUserData();
  }, []);

  // Add a refresh function to re-fetch data when needed
  const refreshFeeds = () => {
    fetchFeeds();
    fetchUserData();
  };

  const fetchFeeds = async () => {
    try {
      const [contentResponse, dropsResponse, walletsResponse, sponsoredResponse] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/drops?limit=10'),
        fetch('/api/users/wallets', { credentials: 'include' }),
        fetch('/api/content/sponsored', { credentials: 'include' })
      ]);

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        // Make sure we have an array
        if (Array.isArray(contentData)) {
          setContentFeed(contentData);
        } else {
          console.error('Content data is not an array:', contentData);
          setContentFeed([]);
        }
      } else {
        console.error('Content fetch failed:', contentResponse.status);
        setContentFeed([]);
      }

      if (dropsResponse.ok) {
        const dropsData = await dropsResponse.json();
        if (Array.isArray(dropsData)) {
          setDropFeed(dropsData.slice(0, 5));
        } else {
          setDropFeed([]);
        }
      } else {
        setDropFeed([]);
      }

      if (walletsResponse.ok) {
        const walletsData = await walletsResponse.json();
        setWallets(Array.isArray(walletsData) ? walletsData : []);
      } else {
        setWallets([]);
      }

      if (sponsoredResponse.ok) {
        const sponsoredData = await sponsoredResponse.json();
        setSponsoredContent(Array.isArray(sponsoredData) ? sponsoredData : []);
      } else {
        setSponsoredContent([]);
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setContentFeed([]);
      setDropFeed([]);
      setWallets([]);
      setSponsoredContent([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSocialAction = async (action: string, contentId?: number) => {
    try {
      const response = await fetch('/api/users/social-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action_type: action,
          reference_id: contentId,
          reference_type: 'content'
        })
      });

      if (response.ok) {
        const data = await response.json();
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

  const handleBuyShares = async (contentId: number, sharesCount: number) => {
    try {
      const response = await fetch('/api/content/buy-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content_id: contentId, shares_count: sharesCount })
      });

      if (response.ok) {
        await fetchFeeds(); // Refresh data after purchase
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Failed to buy shares:', error);
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

  const openCommentModal = (content: ContentPieceType) => {
    setCommentModalContent(content);
    setCommentModalOpen(true);
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

  const openFundingModal = (content: ContentPieceType) => {
    setFundingContentData(content);
    setFundingModalOpen(true);
  };

  const openEditModal = (content: ContentPieceType) => {
    setEditContentData(content);
    setEditContentModalOpen(true);
  };

  const openDeleteConfirm = (content: ContentPieceType) => {
    setContentToDelete(content);
    setDeleteConfirmModalOpen(true);
  };

  const handleEditSuccess = (updatedContent: ContentPieceType) => {
    setEditContentModalOpen(false);
    setEditContentData(null);
    
    // Update content in the local state
    setContentFeed(prev => prev.map(item => 
      item.id === updatedContent.id ? updatedContent : item
    ));
  };

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return;

    try {
      const response = await fetch(`/api/content/${contentToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Remove content from local state
        setContentFeed(prev => prev.filter(item => item.id !== contentToDelete.id));
        setDeleteConfirmModalOpen(false);
        setContentToDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleFundingSuccess = (newRevenue: number, newSharePrice: number) => {
    setFundingModalOpen(false);
    // Update the content in the local state
    if (fundingContentData) {
      const updatedContent = { 
        ...fundingContentData, 
        current_revenue: newRevenue, 
        share_price: newSharePrice 
      };
      
      // Update content array
      setContentFeed(prev => prev.map(item => 
        item.id === fundingContentData.id ? updatedContent : item
      ));
    }
    setFundingContentData(null);
    fetchUserData(); // Refresh user data to show updated balance
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

  const getPointsForAction = (action: string) => {
    // In-app actions now give 1/10th the points of external moves
    const basePoints = { like: 0.1, comment: 0.3, save: 0.5, share: 1 };
    const base = basePoints[action as keyof typeof basePoints] || 0;
    const multiplier = userData ? getTierMultiplier(userData.user_tier) : 1.0;
    return Math.floor(base * multiplier * 10) / 10; // Allow decimals for small amounts
  };

  const getSmartCTA = () => {
    if (!userData) return null;

    // Smart CTA logic based on user state
    if (!userData.master_key_activated_at) {
      return {
        text: "Activate Master Key",
        subtext: "Complete a Proof Drop to unlock premium features",
        action: () => window.location.href = '/earn?type=proof',
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
        action: () => window.location.href = '/invest/portfolio',
        color: "from-purple-500 to-pink-500",
        icon: <Diamond className="w-5 h-5" />
      };
    }

    return {
      text: "Explore Growth Hub",
      subtext: "Stake gems, fund projects, and secure your earnings",
      action: () => window.location.href = '/growth-hub',
      color: "from-green-500 to-emerald-500",
      icon: <TrendingUp className="w-5 h-5" />
    };
  };

  const getForYouFeed = () => {
    // Mix content and drops in a personalized order
    const mixedFeed = [];
    
    // Add sponsored content first (highest priority)
    sponsoredContent.forEach(content => {
      mixedFeed.push({ type: 'content', data: content, isSponsored: true });
    });
    
    // Add high-value opportunities
    const highValueDrops = dropFeed.filter(drop => drop.gem_reward_base >= 50);
    const trendingContent = contentFeed.filter(content => 
      content.available_shares > 0 && 
      !sponsoredContent.some(sponsored => sponsored.id === content.id)
    );
    
    // Interleave content and drops
    for (let i = 0; i < Math.max(trendingContent.length, highValueDrops.length); i++) {
      if (trendingContent[i]) mixedFeed.push({ type: 'content', data: trendingContent[i] });
      if (highValueDrops[i]) mixedFeed.push({ type: 'drop', data: highValueDrops[i] });
    }
    
    return mixedFeed.slice(0, 10); // Limit to 10 items for better UX
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your personalized feed...</p>
        </div>
      </div>
    );
  }

  const smartCTA = getSmartCTA();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personalized Dashboard Header */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }}></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {user?.google_user_data?.given_name}! 👋
              </h1>
              <p className="text-orange-100 text-sm sm:text-base">
                Ready to turn your influence into income?
              </p>
            </div>
            {userData && (
              <div className="text-right">
                <div className="flex items-center space-x-2 justify-end mb-1">
                  {getTierIcon(userData.user_tier)}
                  <span className="text-sm font-semibold capitalize">
                    {userData.user_tier}
                  </span>
                </div>
                <div className="text-xs text-orange-200">
                  {getTierMultiplier(userData.user_tier)}x multiplier
                </div>
                {userData.points_streak_days > 0 && (
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <Flame className="w-3 h-3 text-orange-300" />
                    <span className="text-xs text-orange-200">
                      {userData.points_streak_days} day streak
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          {userData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { value: (userData.points_balance || 0).toLocaleString(), label: 'Points', icon: <Coins className="w-4 h-4" />, color: 'text-blue-200' },
                { value: userData.keys_balance || 0, label: 'Keys', icon: <Target className="w-4 h-4" />, color: 'text-orange-200' },
                { value: (userData.gems_balance || 0).toFixed(1), label: 'Gems', icon: <Diamond className="w-4 h-4" />, color: 'text-purple-200' },
                { value: 'View', label: 'Saved', icon: <Bookmark className="w-4 h-4" />, color: 'text-green-200', action: openSavedContentModal }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center ${(stat as any).action ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''}`}
                  onClick={(stat as any).action || undefined}
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-xs text-white/80">{stat.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Smart CTA */}
          {smartCTA && (
            <button
              onClick={smartCTA.action}
              className={`w-full bg-gradient-to-r ${smartCTA.color} hover:shadow-lg text-white rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    {smartCTA.icon}
                    <span className="font-semibold">{smartCTA.text}</span>
                  </div>
                  <p className="text-white/90 text-sm">{smartCTA.subtext}</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-75" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Feed Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'for-you', label: 'For You', icon: <Star className="w-4 h-4" /> },
              { key: 'social', label: 'Social Feed', icon: <Activity className="w-4 h-4" /> },
              { key: 'drops', label: 'Opportunities', icon: <DollarSign className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50'
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
                          onExternalMove={openExternalMoveModal}
                          onFunding={openFundingModal}
                          onSocialAction={handleSocialAction}
                          getPointsForAction={getPointsForAction}
                          isPersonalized={true}
                          currentUser={userData}
                          onEdit={openEditModal}
                          onDelete={openDeleteConfirm}
                          onComment={openCommentModal}
                          isSponsored={(item as any).isSponsored}
                        />
                      ) : (
                        <EnhancedDropCard drop={item.data as DropType} />
                      )}
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
                  onClick={refreshFeeds}
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
                      onExternalMove={openExternalMoveModal}
                      onFunding={openFundingModal}
                      onSocialAction={handleSocialAction}
                      getPointsForAction={getPointsForAction}
                      currentUser={userData}
                      onEdit={openEditModal}
                      onDelete={openDeleteConfirm}
                      onComment={openCommentModal}
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
                        onExternalMove={openExternalMoveModal}
                        onFunding={openFundingModal}
                        onSocialAction={handleSocialAction}
                        getPointsForAction={getPointsForAction}
                        currentUser={userData}
                        onEdit={openEditModal}
                        onDelete={openDeleteConfirm}
                        onComment={openCommentModal}
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
                      onClick={refreshFeeds}
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
        </div>
      </div>

      {/* Modals */}
      {selectedContent && (
        <BuySharesModal
          content={selectedContent}
          wallet={wallets.find(w => w.currency_type === 'USD')}
          isOpen={buyModalOpen}
          onClose={() => {
            setBuyModalOpen(false);
            setSelectedContent(null);
          }}
          onPurchase={handleBuyShares}
        />
      )}

      {selectedForecast && (
        <PlaceForecastModal
          forecast={selectedForecast}
          isOpen={forecastModalOpen}
          onClose={() => {
            setForecastModalOpen(false);
            setSelectedForecast(null);
          }}
          onPredictionPlaced={() => {
            setForecastModalOpen(false);
            setSelectedForecast(null);
            fetchUserData(); // Refresh user data to update balance
          }}
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

      <ContentFundingModal
        isOpen={fundingModalOpen}
        onClose={() => {
          setFundingModalOpen(false);
          setFundingContentData(null);
        }}
        contentId={fundingContentData?.id || 0}
        contentTitle={fundingContentData?.title || ''}
        isOwner={false}
        currentRevenue={fundingContentData?.current_revenue || 0}
        sharePrice={fundingContentData?.share_price || 0}
        totalShares={fundingContentData?.total_shares || 0}
        onSuccess={handleFundingSuccess}
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

      {/* Comment Modal */}
      {commentModalOpen && commentModalContent ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Comments</h2>
              <button
                onClick={() => {
                  setCommentModalOpen(false);
                  setCommentModalContent(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <CommentSystem
                contentId={commentModalContent.id}
                currentUser={userData}
                isOwner={userData?.id === commentModalContent.creator_id}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
