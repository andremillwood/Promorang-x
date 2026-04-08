import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { API_BASE_URL } from '../config';
import { apiFetch } from '@/react-app/lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Edit3,
  Star,
  Users,
  Trophy,
  FileText,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Check,
  User,
  Target,
  ArrowRight,
  Gift,
  Calendar,
  ExternalLink,
  Image,
  Video,
  MapPin,
  AlertCircle,
  Award
} from 'lucide-react';
import type { UserType, ContentPieceType, DropType, DropApplicationType, ContentHolding, PredictionSummary } from '../../shared/types';
import type { ProfileUser, ProfileDrop } from '../../types/profile';
import { mapDrop } from '../../types/profile';
import Tooltip from '@/react-app/components/Tooltip';
import ApplicationCard from '@/react-app/components/ApplicationCard';
import EditContentModal from '@/react-app/components/EditContentModal';
import EditProfileModal from '@/react-app/components/EditProfileModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import MakeOfferModal from '@/react-app/components/MakeOfferModal';
import { getPortfolioHoldings, getPortfolioPredictions } from '@/react-app/services/portfolioService';
import EarningsBreakdown from '@/react-app/components/EarningsBreakdown';
import KycVerificationModal from '@/react-app/components/KycVerificationModal';
import { MomentRecordCard } from '@/react-app/components/MomentRecordCard';

/**
 * Simplified Profile View for State 0/1 users
 * Shows essential profile info with focus on getting started
 */
function ProfileSimplified() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`w-20 h-20 bg-gradient-to-br ${user?.house_id === 'Solis' ? 'from-amber-400 to-yellow-600' : user?.house_id === 'Luna' ? 'from-purple-400 to-slate-500' : user?.house_id === 'Terra' ? 'from-emerald-400 to-green-600' : user?.house_id === 'Aether' ? 'from-blue-400 to-cyan-600' : 'from-orange-400 to-pink-500'} rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden relative group`}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-white" />
          )}
          {user?.house_id && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{user.house_id}</span>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-pr-text-1 mb-1">
          {user?.display_name || user?.username || 'Welcome!'}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <p className="text-pr-text-2 text-sm">@{user?.username || 'your_username'}</p>
          {user?.house_id && (
            <>
              <span className="text-pr-text-3">•</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">House {user.house_id}</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats - Simplified */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-pr-surface-card rounded-xl p-4 text-center border border-pr-border shadow-sm">
          <ShieldCheck className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-pr-text-1">{(user as any)?.reliability_score || 100}</p>
          <p className="text-xs text-pr-text-2 font-bold uppercase tracking-tight">Depth</p>
        </div>
        <div className="bg-pr-surface-card rounded-xl p-4 text-center border border-pr-border">
          <Check className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-pr-text-1">0</p>
          <p className="text-xs text-pr-text-2">Moments</p>
        </div>
        <div className="bg-pr-surface-card rounded-xl p-4 text-center border border-pr-border">
          <Clock className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-pr-text-1">0d</p>
          <p className="text-xs text-pr-text-2">Active</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-border">
        <h2 className="text-lg font-semibold text-pr-text-1 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" />
          Your Journey
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="text-pr-text-1">Account created</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-pr-surface-3 rounded-full flex items-center justify-center">
              <span className="text-xs text-pr-text-2">2</span>
            </div>
            <span className="text-pr-text-2">Accept your first invitation</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-pr-surface-3 rounded-full flex items-center justify-center">
              <span className="text-xs text-pr-text-2">3</span>
            </div>
            <span className="text-pr-text-2">Index your first Impact</span>
          </div>
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Start building your profile</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Claim Your First Moment</h3>
        <p className="text-white/80 text-sm mb-4">
          Visit your pro hub to record your success and build your Trust Reputation.
        </p>
        <button
          onClick={() => navigate('/today')}
          className="w-full bg-white text-orange-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
        >
          Today on the platform
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Coming Soon */}
      <div className="text-center text-sm text-pr-text-2">
        <p>Complete activations to unlock verified records, rewards, and more</p>
      </div>
    </div>
  );
}

type TabType = 'overview' | 'content' | 'drops' | 'applications' | 'achievements' | 'history';

interface ProfileProps {
  isPublicProfile?: boolean;
  useUserId?: boolean;
}

type LeaderboardSummary = {
  daily_rank?: number;
  composite_score?: number;
  [key: string]: unknown;
} | null;

// Helper to adapt legacy UserType to new ProfileUser shape
function adaptLegacyUser(raw: unknown): ProfileUser | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const user = raw as Partial<UserType>;

  return {
    id: String(user.id ?? ''),
    email: user.email ?? '',
    username: user.username ?? 'unknown_user',
    displayName: user.display_name ?? user.username ?? 'Unknown User',
    avatarUrl: user.profile_image ?? null,
    bio: user.bio ?? '',
    location: user.location ?? '',
    xp: Number(user.xp_points ?? 0),
    level: Number(user.level ?? 1),
    followers: 0,
    following: 0,
    dropsCompleted: 0,
    sharesOwned: 0,
    social: {},
    referral_code: user.referral_code as string | undefined,
    user_type: user.user_type as string | undefined,
    kycStatus: user.kyc_status as string | undefined,
    createdAt: user.created_at ?? ''
  };
}

// Helper to convert ProfileUser back to UserType for modals
function profileToUserType(profile: ProfileUser | null): UserType | null {
  if (!profile) return null;

  return {
    id: profile.id,
    mocha_user_id: profile.id,
    email: profile.email,
    username: profile.username,
    display_name: profile.displayName,
    first_name: undefined,
    last_name: undefined,
    bio: profile.bio,
    profile_image: profile.avatarUrl ?? '',
    cover_image: '',
    website: '',
    location: profile.location,
    social_links: JSON.stringify(profile.social),
    role: 'user',
    points_balance: 0,
    verified_credits_balance: 0,
    keys_balance: 0,
    xp_points: profile.xp,
    level: profile.level,
    total_earnings: 0,
    total_withdrawn: 0,
    is_verified: false,
    is_banned: false,
    last_login: profile.createdAt,
    created_at: profile.createdAt,
    updated_at: profile.createdAt,
    google_user_data: undefined
  };
}

export default function Profile({ isPublicProfile = false, useUserId = false }: ProfileProps) {
  const { user: authUser } = useAuth();
  const { maturityState, isLoading: maturityLoading } = useMaturity();
  const { slug: urlUsername, id: urlUserId } = useParams();
  const navigate = useNavigate();
  const apiBase = API_BASE_URL || '';
  const withApiBase = useCallback((path: string) => `${apiBase}${path}`, [apiBase]);
  const [user, setUser] = useState<ProfileUser | null>(adaptLegacyUser(authUser));
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [momentHistory, setMomentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch Moment History
  useEffect(() => {
    if (activeTab === 'achievements') { // Reuse achievements tab for History/Records? Or add new one.
      // Let's repurpose 'achievements' or 'content' or just add 'history' to types type TabType
    }

    // Actually, let's just fetch it on mount or when tab changes to 'moment_records'
    if (user?.id) {
      setHistoryLoading(true);
      apiFetch('/moments/me/history')
        .then(data => setMomentHistory(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to fetch moment history', err))
        .finally(() => setHistoryLoading(false));
    }
  }, [user?.id]);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);



  // Derived state to securely check if we are viewing the logged-in user's profile
  const isOwnProfile = useMemo(() => {
    // If strict public view is enforced, never show private controls/data
    if (isPublicProfile) return false;

    // If no user loaded or no auth user, not own profile
    if (!user || !authUser) return false;

    // Strict ID check
    return String(user.id) === String(authUser.id);
  }, [isPublicProfile, user, authUser]);

  // State 0/1: Show simplified view (only for own profile, not public profiles)
  const isOwnUsernameUrl = urlUsername && authUser && (urlUsername === authUser.username || urlUsername === 'me');
  if (!maturityLoading && maturityState <= 1 && !isPublicProfile && (isOwnProfile || isOwnUsernameUrl || (!urlUsername && !urlUserId))) {
    return <ProfileSimplified />;
  }

  // New state for profile data
  const [userContent, setUserContent] = useState<ContentPieceType[]>([]);
  const [userDrops, setUserDrops] = useState<ProfileDrop[]>([]);
  const [userApplications, setUserApplications] = useState<DropApplicationType[]>([]);
  const [publicHoldings, setPublicHoldings] = useState<ContentHolding[]>([]);
  const [publicPredictions, setPublicPredictions] = useState<PredictionSummary[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [dropsLoading, setDropsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editContentData, setEditContentData] = useState<ContentPieceType | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentPieceType | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerHolding, setOfferHolding] = useState<ContentHolding | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsBreakdown, setEarningsBreakdown] = useState<any>(null);
  const [leaderboardPosition, setLeaderboardPosition] = useState<any | null>(null);
  const [crewStats, setCrewStats] = useState<any>(null);
  const [crewLoading, setCrewLoading] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);


  // Define fetch callbacks before useEffect hooks that depend on them
  const fetchUserContent = useCallback(async (userId: string | null) => {
    if (isPublicProfile || !userId) {
      setUserContent([]);
      setContentLoading(false);
      return;
    }

    setContentLoading(true);
    try {
      const content = await apiFetch(`/users/${userId}/content`);
      if (content) {
        setUserContent(Array.isArray(content) ? content : []);
      } else {
        setUserContent([]);
      }
    } catch (error) {
      console.error('Failed to fetch user content:', error);
      setUserContent([]);
    } finally {
      setContentLoading(false);
    }
  }, [isPublicProfile, withApiBase]);

  const fetchUserDrops = useCallback(async (userId: string | null, isDemoAccount: boolean) => {
    if (isPublicProfile || !userId || isDemoAccount) {
      setDropsLoading(false);
      return;
    }

    setDropsLoading(true);
    try {
      const drops = await apiFetch(`/users/${userId}/drops`);
      if (drops) {
        const normalized: ProfileDrop[] = Array.isArray(drops)
          ? drops.map((drop: DropType) => mapDrop(drop as any))
          : [];
        setUserDrops(normalized);
      } else {
        setUserDrops([]);
      }
    } catch (error) {
      console.error('Failed to fetch user drops:', error);
      setUserDrops([]);
    } finally {
      setDropsLoading(false);
    }
  }, [isPublicProfile, withApiBase]);

  const fetchLeaderboardPosition = useCallback(async (userId: string | null, isDemoAccount: boolean) => {
    if (isPublicProfile || !userId || isDemoAccount) {
      setLeaderboardPosition(null);
      return;
    }

    try {
      const position = await apiFetch(`/users/${userId}/leaderboard-position`);
      if (position) {
        setLeaderboardPosition(
          typeof position === 'object' && position !== null ? (position as LeaderboardSummary) : null
        );
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard position:', error);
    }
  }, [isPublicProfile, withApiBase]);

  const fetchCrewStats = useCallback(async (userId: string | null) => {
    if (!userId) return;
    setCrewLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/social/crew/stats/${userId}`);
      const result = await response.json();
      if (result.status === 'success') {
        setCrewStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch crew stats:', error);
    } finally {
      setCrewLoading(false);
    }
  }, [apiBase]);

  const fetchUserApplications = useCallback(async (userId: string | null, isDemoAccount: boolean) => {
    if (isPublicProfile || !userId || isDemoAccount) {
      setUserApplications([]);
      setApplicationsLoading(false);
      return;
    }

    setApplicationsLoading(true);
    try {
      const applications = await apiFetch('/users/drop-applications');
      if (applications) {
        setUserApplications(Array.isArray(applications) ? applications : []);
      } else {
        setUserApplications([]);
      }
    } catch (error) {
      console.error('Failed to fetch user applications:', error);
      setUserApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, [isPublicProfile, withApiBase]);

  const fetchEarningsBreakdown = useCallback(async () => {
    if (isPublicProfile) return;
    setEarningsLoading(true);
    try {
      const data = await apiFetch('/users/me/earnings-breakdown');
      setEarningsBreakdown(data);
    } catch (error) {
      console.error('Failed to fetch earnings breakdown:', error);
    } finally {
      setEarningsLoading(false);
    }
  }, [isPublicProfile]);

  const fetchPublicProfile = useCallback(async () => {
    if (!urlUsername && !urlUserId) return;

    try {
      let endpoint;
      if (useUserId && urlUserId) {
        endpoint = `/users/public/id/${urlUserId}`;
      } else if (urlUsername) {
        endpoint = `/users/public/${urlUsername}`;
      } else {
        throw new Error('No user identifier provided');
      }

      const data = await apiFetch(endpoint);
      if (data) {
        setUser(adaptLegacyUser(data.user));
        setUserContent(Array.isArray(data.content) ? data.content : []);
        setUserDrops(Array.isArray(data.drops) ? data.drops.map((d: DropType) => mapDrop(d as any)) : []);
        setLeaderboardPosition(
          typeof data.leaderboard_position === 'object' && data.leaderboard_position !== null
            ? (data.leaderboard_position as LeaderboardSummary)
            : null
        );
      }
    } catch (error) {
      console.error('Failed to fetch public profile:', error);
    } finally {
      setLoading(false);
    }
  }, [urlUsername, urlUserId, useUserId, withApiBase]);

  const fetchUserProfile = useCallback(async () => {
    // Use authUser directly since ProtectedRoute already validates authentication
    if (authUser && !isPublicProfile) {
      setUser(adaptLegacyUser(authUser));
      setLoading(false);
      return;
    }

    // Fallback: make API call only if authUser is not available
    try {
      const accessToken = localStorage.getItem('access_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(withApiBase('/api/users/me'), { headers, credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const userData = data?.user || data?.data?.user || data;
        if (userData && userData.id) {
          setUser(adaptLegacyUser(userData));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [authUser, isPublicProfile, withApiBase]);

  useEffect(() => {
    const isOwnProfile = !isPublicProfile && user &&
      (urlUsername === user.username ||
        urlUsername === user.email?.split('@')[0] ||
        urlUsername === 'me');

    if (isPublicProfile || (!isOwnProfile && urlUsername)) {
      void fetchPublicProfile();
    } else {
      void fetchUserProfile();
    }

    // Check for query parameter to open Influence Rewards modal
    // Check for query parameter to open Influence Rewards modal (logic removed if unused)
  }, [fetchPublicProfile, fetchUserProfile, isPublicProfile, urlUsername, urlUserId]);

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

  const openEditContentModal = (content: ContentPieceType) => {
    setEditContentData(content);
    setEditContentModalOpen(true);
  };

  const openDeleteContentConfirm = (content: ContentPieceType) => {
    setContentToDelete(content);
    setDeleteConfirmModalOpen(true);
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

  const copyReferralCode = async () => {
    if (user?.referral_code) {
      await navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        return 'bg-pr-surface-2 text-pr-text-1';
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
        return 'bg-pr-surface-2 text-pr-text-1';
    }
  };

  const completeUser = useMemo(() => profileToUserType(user), [user]);

  useEffect(() => {
    if (!user?.id || isPublicProfile) {
      return;
    }
    const userId = user.id ? String(user.id) : null;
    const isDemoAccount = !!authUser && !authUser.id;
    void fetchUserContent(userId);
    void fetchUserDrops(userId, isDemoAccount);
    void fetchLeaderboardPosition(userId, isDemoAccount);
    void fetchCrewStats(userId);
  }, [fetchLeaderboardPosition, fetchUserContent, fetchUserDrops, fetchCrewStats, isPublicProfile, user?.id, authUser]);

  useEffect(() => {
    if (!user?.id || isPublicProfile) {
      return;
    }
    const userId = user.id ? String(user.id) : null;
    const isDemoAccount = !!authUser && !authUser.id;
    void fetchUserApplications(userId, isDemoAccount);
    void fetchEarningsBreakdown();
  }, [fetchUserApplications, fetchEarningsBreakdown, isPublicProfile, user?.id, authUser]);

  const handleProfileUpdateSuccess = useCallback((updatedUser: UserType) => {
    setUser(adaptLegacyUser(updatedUser));
    setShowEditProfileModal(false);
  }, []);

  const openOfferModal = useCallback((holding: ContentHolding) => {
    if (!user) return;
    setOfferHolding(holding);
    setOfferModalOpen(true);
  }, [user]);

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
        <div className="bg-pr-surface-card rounded-2xl shadow-sm border border-pr-border p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-pr-text-1 mb-2">User Not Found</h2>
          <p className="text-pr-text-2 mb-6">
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
    ...(user?.user_type === 'advertiser' ? [{ id: 'drops', label: 'Moments Created', icon: Zap, count: userDrops.length }] : []),
    { id: 'achievements', label: 'Achievements', icon: Award },
  ] : [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'content', label: 'Participation', icon: FileText, count: userContent.length },
    { id: 'drops', label: 'Hosted Moments', icon: Zap, count: userDrops.length },
    { id: 'applications', label: 'Moment Redemptions', icon: Gift, count: userApplications.length },
    { id: 'history', label: 'Moment History', icon: ShieldCheck, count: momentHistory.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-pr-text-1">
          {isPublicProfile ? `${user?.displayName || user?.username || 'User'}'s Profile` : 'Profile'}
        </h1>
        <p className="text-pr-text-2">
          {isPublicProfile
            ? 'View public profile and activity'
            : 'Manage your account and view your activity'
          }
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-pr-surface-card rounded-2xl shadow-sm border border-pr-border overflow-hidden">
        {/* Banner Section */}
        <div className={`relative h-48 bg-gradient-to-r ${user?.house_id === 'Solis' ? 'from-amber-400 via-yellow-500/80 to-amber-600' : user?.house_id === 'Luna' ? 'from-purple-500 via-slate-400 to-purple-800' : user?.house_id === 'Terra' ? 'from-emerald-500 via-green-400 to-emerald-800' : user?.house_id === 'Aether' ? 'from-blue-500 via-cyan-400 to-blue-800' : 'from-orange-500 via-red-500 to-pink-500'}`}>
          {user?.avatarUrl ? (
            <div className="relative w-full h-full">
              <img
                src={user.avatarUrl}
                alt="Profile banner"
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            </div>
          ) : (
            <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          )}

          {user?.house_id && (
            <div className="absolute top-6 right-8 text-right">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Affiliation</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest blur-[0.3px]">House {user.house_id}</h2>
            </div>
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
                  src={user?.avatarUrl || '/default-avatar.png'}
                  alt="Profile"
                  className={`w-32 h-32 rounded-2xl border-4 ${user?.house_id === 'Solis' ? 'border-amber-400' : user?.house_id === 'Luna' ? 'border-purple-400' : user?.house_id === 'Terra' ? 'border-emerald-400' : user?.house_id === 'Aether' ? 'border-blue-400' : 'border-white'} shadow-xl object-cover bg-pr-surface-card`}
                />
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
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
              <h2 className="text-3xl font-bold text-pr-text-1 mb-2">
                {user?.displayName || user?.username || 'User'}
              </h2>
              <div className="flex items-center space-x-2 text-pr-text-2 mb-6">
                <span>@{user?.username || 'username-not-set'}</span>
              </div>

              {/* Stats: Moments Lived & Hosted (No Popularity) */}
              <div className="flex flex-wrap items-center gap-8 text-sm">
                {/* Moments Lived (Participation) */}
                <div className="flex flex-col">
                  <span className="font-bold text-pr-text-1 text-2xl">{user?.dropsCompleted || 0}</span>
                  <span className="text-[10px] uppercase font-bold text-pr-text-3 tracking-widest">Moments Lived</span>
                </div>

                {/* Hosted (Organizer) */}
                <div className="flex flex-col">
                  <span className="font-bold text-pr-text-1 text-2xl">{user?.sharesOwned || 0}</span>
                  <span className="text-[10px] uppercase font-bold text-pr-text-3 tracking-widest">Hosted</span>
                </div>

                {/* Presence Depth (Heritage) */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-500 text-2xl">{(user as any)?.reliability_score || 100}</span>
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-[10px] uppercase font-black text-indigo-600 tracking-widest">Presence Depth</span>
                </div>
              </div>


              {/* No Connection Graph per Doctrine 3.1 */}
            </div>
          </div>
        </div>

        {/* KYC Status Badge */}
        {user && (
          <div className="flex items-center space-x-2 px-6 pb-6">
            {user.kycStatus === 'verified' ? (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Identity Verified</span>
              </div>
            ) : user.kycStatus === 'pending' ? (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Verification Pending</span>
              </div>
            ) : isOwnProfile ? (
              <button
                onClick={() => setShowKycModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full hover:bg-orange-500/20 transition-colors group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider group-hover:underline text-[10px]">Verify Identity</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
      {/* Links and Social */}
      {
        user?.social && Object.keys(user.social).length > 0 ? (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-pr-surface-2 rounded-xl">
            {Object.entries(user.social).map(([platform, handle]) => (
              <div key={platform} className="flex items-center space-x-1 text-pr-text-2">
                <span className="text-sm font-medium capitalize">{platform}:</span>
                <span className="text-sm">{handle}</span>
              </div>
            ))}
          </div>
        ) : null
      }

      {/* Bio */}
      <div className="p-4 bg-pr-surface-2 rounded-xl">
        <p className="text-pr-text-1 leading-relaxed">
          {user?.bio || (isPublicProfile ? 'No bio available.' : 'No bio yet. Click edit to add one!')}
        </p>
      </div>




      {/* Tabs Section */}
      <div className="bg-pr-surface-card rounded-2xl shadow-sm border border-pr-border overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-pr-border">
          <nav className="flex overflow-x-auto px-6 lg:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 mr-8 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-pr-text-2 hover:text-pr-text-1 hover:border-pr-surface-3'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="bg-pr-surface-2 text-pr-text-2 px-2 py-1 rounded-full text-xs font-medium">
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

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyLoading ? (
                <div className="col-span-2 py-8 text-center text-gray-500">Loading history...</div>
              ) : momentHistory.length === 0 ? (
                <div className="col-span-2 py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No verified moments yet.</p>
                  <p className="text-sm text-gray-400">Participate in moments to build your verified story.</p>
                </div>
              ) : (
                momentHistory.map((record, i) => (
                  <MomentRecordCard key={i} record={record} />
                ))
              )}
            </div>
          )
          }

          {
            activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Removed Total Earnings Card */}




                  <div className="bg-pr-surface-card rounded-2xl p-6 border border-pr-surface-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Moment History</p>
                        <p className="text-2xl font-bold text-blue-900">{user?.dropsCompleted || 0}</p>
                        <p className="text-[10px] text-pr-text-2 font-medium uppercase tracking-widest">Verified Entries</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-pr-surface-card rounded-2xl p-6 border border-pr-surface-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-indigo-700 uppercase tracking-tight">Presence Impact</p>
                        <p className="text-2xl font-black text-indigo-900">{(user as any).mvi_indexed || 0}</p>
                        <p className="text-[10px] text-pr-text-3 font-black uppercase tracking-widest mt-1">Total Impact</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                </div >

                {/* Earnings Breakdown - Only show for own profile */}
                {
                  isOwnProfile && (
                    <EarningsBreakdown data={earningsBreakdown} loading={earningsLoading} />
                  )
                }

                {/* Level Progress REMOVED per Doctrine 2.3 (No Grinding) */}

                {/* Guild Network Section REMOVED per Doctrine 11 (No graphs/following) */}

                {/* Referral Program REMOVED per Doctrine 11 */}

                {/* Hide complex sections for State 0/1 */}
                {
                  maturityState > 1 && (
                    <>
                      <PublicHoldingsSection
                        holdings={publicHoldings}
                        isOwner={isOwnProfile}
                        onOffer={openOfferModal}
                        onView={(holding) => navigate(`/portfolio/holdings/${holding.content_id}`)}
                      />

                      <PublicPredictionsSection
                        predictions={publicPredictions}
                        onView={(prediction) => navigate(`/prediction/${prediction.id}`)}
                      />
                    </>
                  )
                }
              </div>
            )
          }

          {
            activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-pr-text-1">Your Participation</h3>
                </div>

                {contentLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : userContent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userContent.map((content) => (
                      <div key={content.id} className="bg-pr-surface-2 rounded-2xl p-6 border border-pr-border hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {getContentTypeIcon(content.platform)}
                            <span className="text-sm font-medium text-pr-text-2 capitalize">{content.platform}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isOwnProfile && (
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
                        <h4 className="font-semibold text-pr-text-1 mb-2 line-clamp-2">{content.title}</h4>
                        <p className="text-sm text-pr-text-2 mb-4 line-clamp-2">{content.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-pr-text-2">
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
                    <h3 className="text-xl font-semibold text-pr-text-1 mb-2">No Records Yet</h3>
                    <p className="text-pr-text-2 mb-6">Build your portfolio by participating in moments.</p>
                  </div>
                )}
              </div>
            )
          }

          {
            activeTab === 'drops' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-pr-text-1">Moments You Hosted</h3>
                  {isOwnProfile && user && user.user_type === 'advertiser' && (
                    <Link
                      to="/moments/create"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      Host New Moment
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
                      <div key={drop.id} className="bg-pr-surface-2 rounded-2xl p-6 border border-pr-border">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-pr-text-1 mb-2">{drop.title}</h4>
                            <p className="text-pr-text-2 mb-3">{drop.description}</p>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${drop.difficulty ? getDifficultyColor(drop.difficulty) : 'bg-pr-surface-2'}`}>
                                {drop.difficulty ? drop.difficulty.charAt(0).toUpperCase() + drop.difficulty.slice(1) : 'Unknown'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(drop.status)}`}>
                                {drop.status.charAt(0).toUpperCase() + drop.status.slice(1)}
                              </span>
                              <span className="text-sm text-pr-text-2">
                                {drop.currentParticipants || 0} explorers
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-sm text-pr-text-2 mb-1">Reward</div>
                            <div className="flex items-center space-x-2 text-green-600">
                              {drop.verifiedCreditsReward || 0} Credits
                            </div>
                            <div className="text-sm text-pr-text-2 mt-1">
                              Cost: {drop.keysCost || 0} keys
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-pr-text-2">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(drop.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-pr-text-2">
                            <span className="text-pr-text-2">Pool:</span>
                            <span className="font-medium text-purple-600">
                              {`${drop.creditsPoolRemaining ?? 0}/${drop.creditsPoolTotal ?? 0} Credits`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-pr-text-1 mb-2">No Drops Created</h3>
                    <p className="text-pr-text-2 mb-6">Create your first drop to start earning</p>
                    <Link
                      to="/earn?create=proof"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      Host Your First Moment
                    </Link>
                  </div>
                )}
              </div>
            )
          }

          {
            activeTab === 'applications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-pr-text-1">Your Applications</h3>

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
                          const userId = user?.id ? String(user.id) : null;
                          const isDemoAccount = !!authUser && !authUser.id;
                          fetchUserApplications(userId, isDemoAccount);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-pr-text-1 mb-2">No Applications Yet</h3>
                    <p className="text-pr-text-2 mb-6">Apply to drops to start earning rewards</p>
                    <Link
                      to="/today"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      Discover Moments
                    </Link>
                  </div>
                )}
              </div>
            )
          }

          {
            activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-pr-text-1">Your Badges & Achievements</h3>
                  <button
                    onClick={() => { }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    View Progress
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Real badges would be fetched here, showing mock completed ones for now if API not ready */}
                    {[
                      { key: 'first_steps', name: 'First Steps', icon: 'Trophy', color: 'yellow', completed: true },
                      { key: 'pioneer', name: 'Pioneer', icon: 'Award', color: 'purple', completed: true },
                      { key: 'social', name: 'Social Butterfly', icon: 'Users', color: 'blue', completed: false },
                      { key: 'streak', name: 'Hot Streak', icon: 'Zap', color: 'orange', completed: false },
                      { key: 'creator', name: 'Creator', icon: 'Star', color: 'emerald', completed: false },
                    ].map((badge) => (
                      <div
                        key={badge.key}
                        className={`relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${badge.completed
                          ? 'bg-white dark:bg-slate-800 border-pr-surface-3 shadow-sm scale-100 opacity-100 hover:-translate-y-1'
                          : 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-40 grayscale group-hover:grayscale-0'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.completed ? `bg-${badge.color}-100 text-${badge.color}-600` : 'bg-slate-200 text-slate-400'
                          }`}>
                          {badge.icon === 'Trophy' && <Trophy className="w-6 h-6" />}
                          {badge.icon === 'Award' && <Award className="w-6 h-6" />}
                          {badge.icon === 'Users' && <Users className="w-6 h-6" />}
                          {badge.icon === 'Zap' && <Zap className="w-6 h-6" />}
                          {badge.icon === 'Star' && <Star className="w-6 h-6" />}
                        </div>
                        <h4 className="font-bold text-xs text-pr-text-1 mb-1">{badge.name}</h4>
                        {badge.completed && (
                          <div className="absolute top-2 right-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }
        </div >
      </div >

      {/* Modals */}
      {
        completeUser && (
          <EditProfileModal
            isOpen={showEditProfileModal}
            onClose={() => setShowEditProfileModal(false)}
            user={completeUser}
            onSuccess={handleProfileUpdateSuccess}
          />
        )
      }

      <MakeOfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        holding={offerHolding}
        sellerId={user?.id ? String(user.id) : undefined}
      />

      {
        editContentData && (
          <EditContentModal
            isOpen={editContentModalOpen}
            onClose={() => {
              setEditContentModalOpen(false);
              setEditContentData(null);
            }}
            onSuccess={handleEditContentSuccess}
            content={editContentData}
          />
        )
      }

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

      {
        isOwnProfile && (
          <KycVerificationModal
            isOpen={showKycModal}
            onClose={() => setShowKycModal(false)}
            onSuccess={() => {
              void fetchUserProfile();
            }}
          />
        )
      }
    </div >
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
    <div className="bg-pr-surface-card rounded-2xl p-6 border border-pr-surface-3 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-pr-text-1">Public Holdings</h3>
          <p className="text-sm text-pr-text-2">
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
          <div key={holding.content_id} className="flex items-center justify-between bg-pr-surface-2 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <img
                src={holding.content_thumbnail}
                alt={holding.content_title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-pr-text-1">{holding.content_title}</p>
                <p className="text-sm text-pr-text-2">
                  {holding.owned_shares} shares • Avg ${holding.avg_cost.toFixed(2)} • Now ${holding.current_price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(holding)}
                className="px-3 py-1.5 text-sm font-medium border border-pr-surface-3 text-pr-text-2 rounded-lg hover:bg-pr-surface-2"
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
    <div className="bg-pr-surface-card rounded-2xl p-6 border border-pr-surface-3 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-pr-text-1">Prediction History</h3>
          <p className="text-sm text-pr-text-2">Public predictions and outcomes shared by this creator.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          {predictions.length} entries
        </span>
      </div>

      <div className="space-y-3">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="flex items-center justify-between bg-pr-surface-2 rounded-xl p-4">
            <div>
              <p className="font-medium text-pr-text-1">{prediction.content_title}</p>
              <p className="text-sm text-pr-text-2">
                {prediction.platform.toUpperCase()} • {new Date(prediction.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-pr-text-2 capitalize">{prediction.prediction_side}</p>
                <p className="text-sm text-pr-text-2">
                  {prediction.status === 'settled' && prediction.result
                    ? `Result: ${prediction.result}`
                    : `Status: ${prediction.status}`}
                </p>
              </div>
              <button
                onClick={() => onView(prediction)}
                className="px-3 py-1.5 text-sm font-medium border border-pr-surface-3 text-pr-text-2 rounded-lg hover:bg-pr-surface-2"
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
