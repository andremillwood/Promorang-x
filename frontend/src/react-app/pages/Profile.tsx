import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';
import { Link, useNavigate, useParams } from 'react-router';
import { 
  Edit3, 
  Star, 
  Users, 
  DollarSign, 
  Award,
  Copy,
  Check,
  Trophy,
  FileText,
  Zap,
  TrendingUp,
  Calendar,
  ExternalLink,
  Image,
  Video,
  MapPin,
  User
} from 'lucide-react';
import { UserType, ContentPieceType, DropType, DropApplicationType, ContentHolding, PredictionSummary } from '@/shared/types';
import Tooltip from '@/react-app/components/Tooltip';
import AchievementsModal from '@/react-app/components/AchievementsModal';
import ReferralModal from '@/react-app/components/ReferralModal';
import ApplicationCard from '@/react-app/components/ApplicationCard';
import InfluenceRewardsModal from '@/react-app/components/InfluenceRewardsModal';
import EditContentModal from '@/react-app/components/EditContentModal';
import EditProfileModal from '@/react-app/components/EditProfileModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import MakeOfferModal from '@/react-app/components/MakeOfferModal';
import { getPortfolioHoldings, getPortfolioPredictions } from '@/react-app/services/portfolioService';

type TabType = 'overview' | 'content' | 'drops' | 'applications' | 'achievements';

interface ProfileProps {
  isPublicProfile?: boolean;
  useUserId?: boolean;
}

export default function Profile({ isPublicProfile = false, useUserId = false }: ProfileProps) {
  const { user: authUser } = useAuth();
  const { username: urlUsername, id: urlUserId } = useParams();
  const navigate = useNavigate();
  const apiBase = API_BASE_URL || '';
  const withApiBase = (path: string) => `${apiBase}${path}`;
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  // New state for profile data
  const [userContent, setUserContent] = useState<ContentPieceType[]>([]);
  const [userDrops, setUserDrops] = useState<DropType[]>([]);
  const [userApplications, setUserApplications] = useState<DropApplicationType[]>([]);
  const [publicHoldings, setPublicHoldings] = useState<ContentHolding[]>([]);
  const [publicPredictions, setPublicPredictions] = useState<PredictionSummary[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [dropsLoading, setDropsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showInfluenceRewardsModal, setShowInfluenceRewardsModal] = useState(false);
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editContentData, setEditContentData] = useState<ContentPieceType | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentPieceType | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerHolding, setOfferHolding] = useState<ContentHolding | null>(null);
  

  useEffect(() => {
    if (isPublicProfile && (urlUsername || urlUserId)) {
      fetchPublicProfile();
    } else {
      fetchUserProfile();
    }

    // Check for query parameter to open Influence Rewards modal
    const params = new URLSearchParams(window.location.search);
    if (params.get('openInfluenceRewards') === 'true') {
      setShowInfluenceRewardsModal(true);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [isPublicProfile, urlUsername]);

  useEffect(() => {
    // Skip additional fetching for public profiles since we get the data in the initial call
    if (isPublicProfile) return;

    // Don't fetch content until user state is properly set
    if (!user) return;

    // Temporarily disable tab-based fetching to prevent API call issues
    // if (activeTab === 'content' && userContent.length === 0) {
    //   fetchUserContent();
    // } else if (activeTab === 'drops' && userDrops.length === 0) {
    //   fetchUserDrops();
    // } else if (activeTab === 'applications' && userApplications.length === 0) {
    //   fetchUserApplications();
    // }
  }, [activeTab, isPublicProfile, user]);

  useEffect(() => {
    if (!user) return;

    const loadPortfolioSignals = async () => {
      const holdings = await getPortfolioHoldings(String(user.id));
      setPublicHoldings(holdings.filter((holding) => holding.visibility !== 'private'));
      const predictions = await getPortfolioPredictions(String(user.id));
      setPublicPredictions(predictions);
    };

    loadPortfolioSignals();
  }, [user?.id]);

  const fetchPublicProfile = async () => {
    if (!urlUsername && !urlUserId) return;
    
    try {
      let apiPath;
      if (useUserId && urlUserId) {
        apiPath = `/api/users/public/id/${urlUserId}`;
      } else if (urlUsername) {
        apiPath = `/api/users/public/${urlUsername}`;
      } else {
        throw new Error('No user identifier provided');
      }
      
      const response = await fetch(withApiBase(apiPath));
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      setUser(data.user);
      setUserContent(data.content || []);
      setUserDrops(data.drops || []);
      setLeaderboardPosition(data.leaderboard_position);
    } catch (error) {
      console.error('Failed to fetch public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditContentModal = (content: ContentPieceType) => {
    setEditContentData(content);
    setEditContentModalOpen(true);
  };

  const openDeleteContentConfirm = (content: ContentPieceType) => {
    setContentToDelete(content);
    setDeleteConfirmModalOpen(true);
  };

  const openOfferModal = (holding: ContentHolding) => {
    setOfferHolding(holding);
    setOfferModalOpen(true);
  };

  const handleEditContentSuccess = (updatedContent: ContentPieceType) => {
    setEditContentModalOpen(false);
    setEditContentData(null);
    
    // Update content in the local state
    setUserContent(prev => prev.map(item => 
      item.id === updatedContent.id ? updatedContent : item
    ));
  };

  const handleDeleteContentConfirm = async () => {
    if (!contentToDelete) return;

    try {
      const response = await fetch(withApiBase(`/api/content/${contentToDelete.id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Remove content from local state
        setUserContent(prev => prev.filter(item => item.id !== contentToDelete.id));
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

  const fetchUserProfile = async () => {
    // Use authUser directly since ProtectedRoute already validates authentication
    if (authUser && !isPublicProfile) {
      console.log('Using authenticated user data directly:', authUser);
      setUser(authUser);
      setLoading(false);
      return;
    }

    // Fallback: make API call only if authUser is not available
    try {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(withApiBase('/api/auth/profile'), { headers, credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    if (!user) return;

    // For demo accounts, use mock data instead of making API calls
    if (authUser && !authUser.id) {
      console.log('Using mock content data for demo account');
      setUserContent([]);
      setContentLoading(false);
      return;
    }

    // Skip API calls if we don't have a real user ID
    if (!user.id) {
      setUserContent([]);
      setContentLoading(false);
      return;
    }

    setContentLoading(true);
    try {
      const response = await fetch(withApiBase(`/api/users/${user.id}/content`), {
        credentials: 'include'
      });
      if (response.ok) {
        const content = await response.json();
        setUserContent(content);
      } else {
        setUserContent([]);
      }
    } catch (error) {
      console.error('Failed to fetch user content:', error);
      setUserContent([]);
    } finally {
      setContentLoading(false);
    }
  };

  const fetchUserDrops = async () => {
    if (!user) return;

    // For demo accounts, use mock data instead of making API calls
    if (authUser && !authUser.id) {
      console.log('Using mock drops data for demo account');
      setUserDrops([]);
      setDropsLoading(false);
      return;
    }

    // Skip API calls if we don't have a real user ID
    if (!user.id) {
      setUserDrops([]);
      setDropsLoading(false);
      return;
    }

    setDropsLoading(true);
    try {
      const response = await fetch(withApiBase(`/api/users/${user.id}/drops`), {
        credentials: 'include'
      });
      if (response.ok) {
        const drops = await response.json();
        setUserDrops(drops);
      } else {
        setUserDrops([]);
      }
    } catch (error) {
      console.error('Failed to fetch user drops:', error);
      setUserDrops([]);
    } finally {
      setDropsLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!user) return;

    // For demo accounts, use mock data instead of making API calls
    if (authUser && !authUser.id) {
      console.log('Using mock applications data for demo account');
      setUserApplications([]);
      setApplicationsLoading(false);
      return;
    }

    // Skip API calls if we don't have a real user ID
    if (!user.id) {
      setUserApplications([]);
      setApplicationsLoading(false);
      return;
    }

    setApplicationsLoading(true);
    try {
      const response = await fetch(withApiBase('/api/users/drop-applications'), {
        credentials: 'include'
      });
      if (response.ok) {
        const applications = await response.json();
        setUserApplications(applications);
      } else {
        setUserApplications([]);
      }
    } catch (error) {
      console.error('Failed to fetch user applications:', error);
      setUserApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchLeaderboardPosition = async (userId: number) => {
    // Skip leaderboard fetching for demo accounts that don't have proper backend integration
    if (authUser && !authUser.id) {
      console.log('Skipping leaderboard fetch for demo account');
      return;
    }

    // Skip if no real user ID
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(withApiBase(`/api/users/${userId}/leaderboard-position`), {
        credentials: 'include'
      });
      if (response.ok) {
        const position = await response.json();
        setLeaderboardPosition(position);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard position:', error);
    }
  };

  const handleProfileUpdateSuccess = (updatedUser: UserType) => {
    setUser(updatedUser);
    setShowEditProfileModal(false);
  };

  const copyReferralCode = async () => {
    if (user?.referral_code) {
      await navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLevelProgress = (xp: number) => {
    const baseXP = 1000;
    const level = user?.level || 1;
    const currentLevelXP = baseXP * level;
    const nextLevelXP = baseXP * (level + 1);
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getContentTypeIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Video className="w-4 h-4" />;
      case 'instagram':
      case 'twitter':
      case 'linkedin':
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Only show "User Not Found" if we're not loading and don't have authUser for non-public profiles
  if (!user && !loading && !isPublicProfile && !authUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">
            {isPublicProfile
              ? "The user you're looking for doesn't exist or may have been removed."
              : "There was an issue loading your profile. Please try refreshing the page."
            }
          </p>
          <Link
            to="/"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Define tabs based on whether it's a public profile or not
  const tabs = isPublicProfile ? [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'content', label: 'Content', icon: FileText, count: userContent.length },
    ...(user?.user_type === 'advertiser' ? [{ id: 'drops', label: 'Drops Created', icon: Zap, count: userDrops.length }] : []),
    { id: 'achievements', label: 'Achievements', icon: Award },
  ] : [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'content', label: 'Content', icon: FileText, count: userContent.length },
    { id: 'drops', label: 'Drops Created', icon: Zap, count: userDrops.length },
    { id: 'applications', label: 'Applications', icon: MapPin, count: userApplications.length },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {isPublicProfile ? `${user?.display_name || user?.username || 'User'}'s Profile` : 'Profile'}
        </h1>
        <p className="text-gray-600">
          {isPublicProfile
            ? 'View public profile and activity'
            : 'Manage your account and view your activity'
          }
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner Section */}
        <div className="relative h-48 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
          {user?.banner_url ? (
            <div className="relative w-full h-full">
              <img
                src={user.banner_url}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
          )}


        </div>

        {/* Profile Info Section */}
        <div className="px-6 lg:px-8 pb-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 space-y-6 lg:space-y-0">
            {/* Avatar */}
            <div className="relative z-10">
              <div className="relative">
                <img
                  src={user?.avatar_url || authUser?.google_user_data?.picture || '/default-avatar.png'}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
                />
              </div>
            </div>

            {/* Edit Button */}
            {!isPublicProfile && (
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="lg:mb-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl self-start lg:self-auto"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Name and Details */}
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.display_name || (isPublicProfile ? user?.username : authUser?.google_user_data?.name) || 'User'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-gray-600">
                <span>@{user?.username || 'username-not-set'}</span>
                <span>•</span>
                <span>Level {user?.level || 1}</span>
                {user?.user_type === 'advertiser' && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Advertiser
                    </span>
                  </>
                )}
              </div>

              {leaderboardPosition && (
                <div className="flex flex-wrap items-center gap-6 mt-3">
                  <Tooltip content="Daily leaderboard rank" compact={true}>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Daily Rank</span>
                      <span className="font-semibold text-yellow-700">#{leaderboardPosition.daily_rank || 'N/A'}</span>
                    </div>
                  </Tooltip>
                  <Tooltip content="Activity score" compact={true}>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className="font-semibold text-gray-900">{(leaderboardPosition.composite_score || 0).toFixed(1)}</span>
                    </div>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Links and Social */}
            {(user.website_url || user.social_links) && (
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {user.website_url && (
                  <a
                    href={user.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}

                {user.social_links && (() => {
                  try {
                    const socialLinks = JSON.parse(user.social_links);
                    return Object.entries(socialLinks).map(([platform, handle]) => (
                      <div key={platform} className="flex items-center space-x-1 text-gray-600">
                        <span className="text-sm font-medium capitalize">{platform}:</span>
                        <span className="text-sm">{handle as string}</span>
                      </div>
                    ));
                  } catch {
                    return null;
                  }
                })()}
              </div>
            )}

            {/* Bio */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-700 leading-relaxed">
                {user?.bio || (isPublicProfile ? 'No bio available.' : 'No bio yet. Click edit to add one!')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto px-6 lg:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 mr-8 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {!isPublicProfile && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-900">${((user?.total_earnings_usd || 0)).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">XP Points</p>
                      <p className="text-2xl font-bold text-blue-900">{(user?.xp_points || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Followers</p>
                      <p className="text-2xl font-bold text-purple-900">{(user?.follower_count || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700">Level</p>
                      <p className="text-2xl font-bold text-yellow-900">{user?.level || 1}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Level {user?.level || 1}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{(user?.xp_points || 0).toLocaleString()} XP</span>
                    <span>{(((user?.level || 1) + 1) * 1000).toLocaleString()} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getLevelProgress(user?.xp_points || 0)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isPublicProfile
                      ? `${user?.points_streak_days || 0} day activity streak`
                      : `${(((user?.level || 1) + 1) * 1000) - (user?.xp_points || 0)} XP until next level`
                    }
                  </p>
                </div>
              </div>

              {/* Influence Rewards - Only show for own profile */}
              {!isPublicProfile && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Influence Rewards</h3>
                        <p className="text-sm text-blue-700">Earn monthly points based on your follower count</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInfluenceRewardsModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Get Rewards
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-blue-700">Formula</div>
                      <div className="font-bold text-blue-900">Followers × 0.01</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-blue-700">Reset</div>
                      <div className="font-bold text-blue-900">Monthly</div>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-sm text-blue-700">Min Followers</div>
                      <div className="font-bold text-blue-900">1,000</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Referral Program - Only show for own profile */}
              {!isPublicProfile && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-900">Referral Program</h3>
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Manage Referrals
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                      <h4 className="font-medium text-purple-900">Your Referral Code</h4>
                      <p className="text-sm text-purple-700">Share this code and earn when friends join!</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-4 py-2 rounded-xl border font-mono text-lg">
                        {user.referral_code}
                      </code>
                      <Tooltip content={copied ? "Copied!" : "Copy code"} compact={true}>
                        <button
                          onClick={copyReferralCode}
                          className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )}

              <PublicHoldingsSection
                holdings={publicHoldings}
                isOwner={!isPublicProfile || (authUser && user && authUser.id === user.id)}
                onOffer={openOfferModal}
                onView={(holding) => navigate(`/portfolio/holdings/${holding.content_id}`)}
              />

              <PublicPredictionsSection
                predictions={publicPredictions}
                onView={(prediction) => navigate(`/predictions/${prediction.id}`)}
              />
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Your Content</h3>
                <Link
                  to="/create"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Create New Content
                </Link>
              </div>

              {contentLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              ) : userContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userContent.map((content) => (
                    <div key={content.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getContentTypeIcon(content.platform)}
                          <span className="text-sm font-medium text-gray-600 capitalize">{content.platform}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!isPublicProfile && (
                            <>
                              <Tooltip content="Edit content" compact={true}>
                                <button
                                  onClick={() => openEditContentModal(content)}
                                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </Tooltip>
                              <Tooltip content="Delete content" compact={true}>
                                <button
                                  onClick={() => openDeleteContentConfirm(content)}
                                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </Tooltip>
                            </>
                          )}
                          <Link
                            to={`/content/${content.id}`}
                            className="text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{content.title}</h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{content.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {content.available_shares || 0}/{content.total_shares || 0} shares
                        </span>
                        <span className="font-semibold text-green-600">
                          ${(content.share_price || 0).toFixed(2)}/share
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Content Yet</h3>
                  <p className="text-gray-600 mb-6">Start creating content to build your portfolio</p>
                  <Link
                    to="/create"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Create Your First Content
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'drops' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Drops You Created</h3>
                {!isPublicProfile && user && user.user_type === 'advertiser' && (
                  <Link
                    to="/earn?create=proof"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    Create New Drop
                  </Link>
                )}
              </div>

              {dropsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              ) : userDrops.length > 0 ? (
                <div className="space-y-4">
                  {userDrops.map((drop) => (
                    <div key={drop.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{drop.title}</h4>
                          <p className="text-gray-600 mb-3">{drop.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(drop.difficulty)}`}>
                              {drop.difficulty.charAt(0).toUpperCase() + drop.difficulty.slice(1)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(drop.status)}`}>
                              {drop.status.charAt(0).toUpperCase() + drop.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {drop.current_participants || 0} participants
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-500 mb-1">Reward</div>
                          <div className="font-semibold text-purple-600">
                            {drop.gem_reward_base || 0} gems
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Cost: {drop.key_cost || 0} keys
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Created {new Date(drop.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Pool:</span>
                          <span className="font-medium text-purple-600">
                            {drop.gem_pool_remaining || 0}/{drop.gem_pool_total || 0} gems
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drops Created</h3>
                  <p className="text-gray-600 mb-6">Create your first drop to start earning</p>
                  <Link
                    to="/earn?create=proof"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Create Your First Drop
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Your Applications</h3>

              {applicationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              ) : userApplications.length > 0 ? (
                <div className="space-y-4">
                  {userApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onSubmissionSuccess={() => {
                        fetchUserApplications();
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">Apply to drops to start earning rewards</p>
                  <Link
                    to="/earn"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Browse Opportunities
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Achievements</h3>
                <button
                  onClick={() => setShowAchievementsModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock achievements for demo */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-yellow-900 mb-2">First Steps</h4>
                  <p className="text-sm text-yellow-700">Complete your first drop application</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">Content Creator</h4>
                  <p className="text-sm text-blue-700">Share your first piece of content</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2">Influencer</h4>
                  <p className="text-sm text-purple-700">Reach 100 followers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={user!}
        onSuccess={handleProfileUpdateSuccess}
      />

      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        user={user!}
      />

      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        user={user!}
        onSuccess={() => {
          // Refresh user data
          fetchUserProfile();
        }}
      />

      <InfluenceRewardsModal
        isOpen={showInfluenceRewardsModal}
        onClose={() => setShowInfluenceRewardsModal(false)}
        user={user!}
        onSuccess={() => {
          // Refresh user data
          fetchUserProfile();
        }}
      />

      <MakeOfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        holding={offerHolding}
        sellerId={user?.id ? String(user.id) : undefined}
      />

      {editContentData && (
        <EditContentModal
          isOpen={editContentModalOpen}
          onClose={() => {
            setEditContentModalOpen(false);
            setEditContentData(null);
          }}
          onSuccess={handleEditContentSuccess}
          content={editContentData}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setContentToDelete(null);
        }}
        onConfirm={handleDeleteContentConfirm}
        title="Delete Content"
        message={`Are you sure you want to delete "${contentToDelete?.title}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

// Export ProfilePage as an alias for Profile
export const ProfilePage = Profile;

function PublicHoldingsSection({
  holdings,
  isOwner,
  onOffer,
  onView,
}: {
  holdings: ContentHolding[];
  isOwner: boolean;
  onOffer: (holding: ContentHolding) => void;
  onView: (holding: ContentHolding) => void;
}) {
  const visibleHoldings = holdings.filter((holding) => holding.visibility !== 'private');

  if (!visibleHoldings.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Public Holdings</h3>
          <p className="text-sm text-gray-500">
            {isOwner
              ? 'Only holdings you set to public are visible to others.'
              : 'Shared portfolio highlights from this creator.'}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {visibleHoldings.length} assets
        </span>
      </div>

      <div className="space-y-3">
        {visibleHoldings.map((holding) => (
          <div key={holding.content_id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <img
                src={holding.content_thumbnail}
                alt={holding.content_title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{holding.content_title}</p>
                <p className="text-sm text-gray-500">
                  {holding.owned_shares} shares • Avg ${holding.avg_cost.toFixed(2)} • Now ${holding.current_price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(holding)}
                className="px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                View
              </button>
              {!isOwner && (
                <button
                  onClick={() => onOffer(holding)}
                  className="px-3 py-1.5 text-sm font-medium border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Make offer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicPredictionsSection({
  predictions,
  onView,
}: {
  predictions: PredictionSummary[];
  onView: (prediction: PredictionSummary) => void;
}) {
  if (!predictions.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prediction History</h3>
          <p className="text-sm text-gray-500">Public predictions and outcomes shared by this creator.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          {predictions.length} entries
        </span>
      </div>

      <div className="space-y-3">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div>
              <p className="font-medium text-gray-900">{prediction.content_title}</p>
              <p className="text-sm text-gray-500">
                {prediction.platform.toUpperCase()} • {new Date(prediction.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-600 capitalize">{prediction.prediction_side}</p>
                <p className="text-sm text-gray-500">
                  {prediction.status === 'settled' && prediction.result
                    ? `Result: ${prediction.result}`
                    : `Status: ${prediction.status}`}
                </p>
              </div>
              <button
                onClick={() => onView(prediction)}
                className="px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
