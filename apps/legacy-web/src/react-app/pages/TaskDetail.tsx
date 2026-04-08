import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  Calendar,
  Key,
  Diamond,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  Zap,
  Shield,
  Edit,
  Trash2,
  Gift,
  Receipt,
  Quote
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import EditDropModal from '@/react-app/components/EditDropModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import type { DropType, DropApplicationType, UserType } from '../../shared/types';
import api from '@/react-app/lib/api';
import BuyMissionSubmitModal from '@/react-app/components/BuyMissionSubmitModal';

interface MomentReflection {
  id: string;
  text: string;
  date: string;
}

export default function TaskDetail() {
  const { id, taskId, dropId } = useParams<{ id?: string; taskId?: string; dropId?: string }>();
  const dropIdParam = dropId ?? taskId ?? id ?? null;
  const navigate = useNavigate();
  const formatLabel = (value?: string | null, fallback = 'General') => {
    const label = value && value.trim().length > 0 ? value : fallback;
    return label
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const [drop, setDrop] = useState<DropType | null>(null);
  const [application, setApplication] = useState<DropApplicationType | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [masterKeyStatus, setMasterKeyStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBuyProofModal, setShowBuyProofModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reflections, setReflections] = useState<MomentReflection[]>([]);

  const USE_MOCK_DATA = !import.meta.env.VITE_API_URL;

  const buildFallbackMasterKeyStatus = () => ({
    is_activated: true,
    proof_drops_completed: 3,
    proof_drops_required: 3,
    last_activated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  });

  const buildFallbackApplications = (): DropApplicationType[] => {
    const fallbackUserId = userData?.id ?? 'demo-user';
    const dropIdKey = String(drop?.id ?? dropIdParam ?? 'demo-drop');
    return [
      {
        id: '1',
        drop_id: dropIdKey,
        user_id: fallbackUserId,
        status: 'approved',
        application_message: 'Looking forward to contributing to this drop!'
          + ' I have prior experience delivering high-quality content on tight deadlines.',
        submission_url: 'https://drive.google.com/demo-submission',
        submission_notes: 'Demo notes',
        reward_amount: 120,
        reward_currency: 'mvi',
        reward_status: 'paid',
        user_name: 'Demo User',
        user_avatar: '',
        metadata: {},
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        reviewed_by: null,
        reviewed_at: null
      },
    ];
  };

  // Check if this is demo content
  const isDemo = drop?.title?.toLowerCase().includes('[demo]') ||
    drop?.title?.toLowerCase().includes('demo') ||
    drop?.description?.toLowerCase().includes('demo');

  useEffect(() => {
    if (dropIdParam) {
      fetchDropDetail();
      checkApplication();
      fetchUserData();
      fetchMasterKeyStatus();
      fetchReflections();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropIdParam]);

  // Update creator status when both drop and userData are available
  useEffect(() => {
    if (drop && userData) {
      const isUserCreator = String(drop.creator_id) === String(userData.id);
      console.log('Checking creator status:', {
        dropCreatorId: drop.creator_id,
        userId: userData.id,
        isCreator: isUserCreator
      });
      setIsCreator(isUserCreator);
    }
  }, [drop, userData]);

  const fetchDropDetail = async () => {
    if (!dropIdParam) {
      console.warn("No drop ID provided for TaskDetail route");
      setLoading(false);
      navigate("/not-found", {
        state: {
          title: "Invalid Drop ID",
          message: "No drop ID was provided in the URL. Please check the link and try again.",
        },
      });
      return;
    }

    // Validate UUID format if needed
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(dropIdParam) && isNaN(parseInt(dropIdParam, 10))) {
      console.warn("Invalid drop ID format:", dropIdParam);
      navigate("/not-found", {
        state: {
          title: "Invalid Drop ID",
          message: "The drop ID in the URL is not in a valid format. Please check the link and try again.",
        },
      });
      return;
    }

    try {
      console.log("Fetching drop detail for ID:", dropIdParam);
      const responseData = await api.get<DropType>(`/drops/${dropIdParam}`) as any;

      if (!responseData || !responseData.id) {
        console.warn("Malformed drop data received:", responseData);
        throw new Error("Invalid drop data format");
      }
      console.log("Drop data received:", responseData);
      setDrop(responseData);
    } catch (error) {
      console.error("Failed to fetch drop:", error);
      navigate("/error", {
        state: {
          title: "Error Loading Drop",
          message: "Unable to load the drop. Please try again later.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Fetch the database user data which contains the correct ID to match with creator_id
      const data = await api.get<UserType>('/users/me');
      console.log('Database user data received:', data);
      console.log('Database user id:', data?.id);
      setUserData(data as any);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchMasterKeyStatus = async () => {
    if (USE_MOCK_DATA) {
      setMasterKeyStatus(buildFallbackMasterKeyStatus());
      return;
    }

    try {
      const data = await api.get<{ has_master_key: boolean }>('/users/master-key-status');
      setMasterKeyStatus(data.has_master_key);
    } catch (error) {
      console.error('Failed to fetch master key status:', error);
      setMasterKeyStatus(buildFallbackMasterKeyStatus());
    }
  };

  const checkApplication = async () => {
    if (USE_MOCK_DATA) {
      const dropIdKey = String(drop?.id ?? dropIdParam ?? 'demo-drop');
      const fallbackApps = buildFallbackApplications();
      const existingApp = fallbackApps.find((app) => String(app.drop_id) === dropIdKey);
      setApplication(existingApp || null);
      return;
    }

    try {
      const data = await api.get<DropApplicationType[]>('/users/drop-applications');
      const dropIdKey = String(drop?.id ?? dropIdParam ?? '');
      const existingApp = data.find((app: any) => String(app.drop_id) === dropIdKey);
      setApplication(existingApp || null);
    } catch (error) {
      console.error('Failed to check application:', error);
      const dropIdKey = String(drop?.id ?? dropIdParam ?? '');
      const fallbackApps = buildFallbackApplications();
      const existingApp = fallbackApps.find((app) => String(app.drop_id) === dropIdKey);
      setApplication(existingApp || null);
    }
  };
  const fetchReflections = async () => {
    // In a real app, this would fetch from verified_actions where reflection_text is present
    // For now, providing a mix of mock and intent
    const mockReflections = [
      { id: '1', text: "The atmosphere was incredible. Real sense of community.", date: "2026-01-20" },
      { id: '2', text: "Verification was seamless. Love the physical-to-digital bridge.", date: "2026-01-21" }
    ];
    setReflections(mockReflections);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drop || !applicationMessage.trim()) return;

    setApplying(true);
    try {
      await api.post(`/drops/${drop?.id ?? dropIdParam}/apply`, {
        application_message: applicationMessage
      });
      await Promise.all([checkApplication(), fetchUserData(), fetchMasterKeyStatus()]);
      setApplicationMessage('');
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to apply to drop');
    } finally {
      setApplying(false);
    }
  };

  const getDropTypeImage = (dropType: string) => {
    // Use the drop's content_url if available, otherwise fallback to default images
    if (drop?.content_url) {
      return drop.content_url;
    }

    switch (dropType) {
      case 'content_clipping': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop';
      case 'reviews': return 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=400&fit=crop';
      case 'ugc_creation': return 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&h=400&fit=crop';
      case 'affiliate_referral': return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=400&fit=crop';
      case 'surveys': return 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=400&fit=crop';
      case 'challenges_events': return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
      case 'engagement': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop';
      default: return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
    }
  };

  const getDropTypeIcon = (dropType: string) => {
    switch (dropType) {
      case 'content_clipping': return '✂️';
      case 'reviews': return '⭐';
      case 'ugc_creation': return '🎨';
      case 'affiliate_referral': return '🔗';
      case 'surveys': return '📊';
      case 'challenges_events': return '🏆';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-pr-surface-2 border border-green-500/60';
      case 'medium': return 'text-yellow-400 bg-pr-surface-2 border border-yellow-500/60';
      case 'hard': return 'text-red-400 bg-pr-surface-2 border border-red-500/60';
      default: return 'text-pr-text-2 bg-pr-surface-2 border border-pr-surface-3';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-pr-surface-2 border border-yellow-500/60';
      case 'approved': return 'text-blue-400 bg-pr-surface-2 border border-blue-500/60';
      case 'rejected': return 'text-red-400 bg-pr-surface-2 border border-red-500/60';
      case 'completed': return 'text-green-400 bg-pr-surface-2 border border-green-500/60';
      case 'paid': return 'text-purple-400 bg-pr-surface-2 border border-purple-500/60';
      default: return 'text-pr-text-2 bg-pr-surface-2 border border-pr-surface-3';
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/drops/${drop!.id}`);
      navigate('/earn');
    } catch (error) {
      console.error('Failed to delete drop:', error);
      alert('Failed to delete drop');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSuccess = (updatedDrop: DropType) => {
    setDrop(updatedDrop);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-pr-text-1 mb-4">Moment not found</h2>
        <button
          onClick={() => navigate('/moments')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Invitations
        </button>
      </div>
    );
  }

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
            This is demo content for testing purposes. No real verified_credits will be awarded even if the interface suggests otherwise.
          </p>
        </div>
      )}

      {/* Coupon Reward Banner - Shows when drop has attached coupons */}
      {!isDemo && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Bonus Reward Available!</h3>
                <p className="text-sm text-purple-100">Complete this drop to earn exclusive rewards</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/rewards')}
              className="bg-pr-surface-card/20 hover:bg-pr-surface-card/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Rewards
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/earn')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-pr-surface-2 hover:bg-pr-surface-3 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-pr-text-2" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-pr-text-1">
            Invitation Details {isDemo && <span className="text-orange-600">(Demo)</span>}
          </h1>
          <p className="text-pr-text-2">
            {isDemo ? 'Demo invitation - no real impact indexing' : 'Verified participation invitation'}
          </p>
        </div>

        {/* Creator Actions */}
        {isCreator && (
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image & Basic Info */}
          <div className="bg-pr-surface-card rounded-xl overflow-hidden border border-pr-surface-3">
            <div className="relative">
              <img
                src={getDropTypeImage(drop.drop_type)}
                alt={drop.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(drop.difficulty)}`}>
                  {drop.difficulty}
                </span>
              </div>
              <div className="absolute top-4 left-4">
                {drop.is_proof_drop ? (
                  <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">Verification Moment</span>
                  </div>
                ) : drop.is_paid_drop ? (
                  <div className="bg-purple-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">Impact Moment</span>
                  </div>
                ) : (
                  <div className="bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">Community Moment</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">{getDropTypeIcon(drop.drop_type)}</span>
                  <span className="text-white bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                    {formatLabel(drop.drop_type)}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">{drop.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Diamond className="w-6 h-6 text-purple-300 drop-shadow" />
                    <p className="text-2xl font-bold text-white drop-shadow-lg">{drop.gem_reward_base}</p>
                  </div>
                  <p className="text-white/80 drop-shadow">Potential Impact indexing</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
            <h2 className="text-xl font-semibold text-pr-text-1 mb-4">Description</h2>
            <p className="text-pr-text-1 leading-relaxed">{drop.description}</p>
          </div>

          {/* Requirements & Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drop.requirements && (
              <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-pr-text-1">Requirements</h3>
                </div>
                <p className="text-pr-text-1 leading-relaxed">{drop.requirements}</p>
              </div>
            )}

            {drop.deliverables && (
              <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-pr-text-1">Deliverables</h3>
                </div>
                <p className="text-pr-text-1 leading-relaxed">{drop.deliverables}</p>
              </div>
            )}
          </div>

          {/* Master Key Status */}
          {userData && masterKeyStatus && (
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-pr-text-1">Master Key Status</h3>
              </div>

              <div className="bg-pr-surface-2 rounded-lg p-4 mb-4 border border-pr-surface-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-pr-text-2">Today's Master Key</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${masterKeyStatus.is_activated ? 'text-green-400 border-green-500/60 bg-pr-surface-1' : 'text-orange-400 border-orange-500/60 bg-pr-surface-1'
                    }`}>
                    {masterKeyStatus.is_activated ? 'Activated' : 'Not Activated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pr-text-2">Moments Completed</span>
                  <span className="text-sm font-medium text-pr-text-1">
                    {masterKeyStatus.proof_drops_completed}/{masterKeyStatus.proof_drops_required}
                  </span>
                </div>
              </div>

              {!masterKeyStatus.is_activated && (
                <p className="text-sm text-pr-text-2">
                  Complete {masterKeyStatus.proof_drops_required - masterKeyStatus.proof_drops_completed} more moments to activate your Master Key and unlock the ability to use Access Keys for invitations.
                </p>
              )}
            </div>
          )}

          {/* User Currency Balance */}
          {userData && (
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-pr-text-1">Your Balance</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Key className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-pr-text-1">Access Keys</span>
                  </div>
                  <p className="text-xl font-bold text-pr-text-1">{userData.keys_balance}</p>
                </div>
                <div className="bg-pr-surface-2 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Diamond className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-pr-text-1">Presence Impact</span>
                  </div>
                  <p className="text-xl font-bold text-pr-text-1">{userData.verified_credits_balance}</p>
                </div>
              </div>

              {userData.keys_balance < (drop.key_cost || 0) && (
                <div className="mt-3 p-3 bg-pr-surface-2 border border-red-500/60 rounded-lg">
                  <p className="text-sm text-red-400">
                    You need {(drop.key_cost || 0) - userData.keys_balance} more access keys to apply for this invitation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Application Status or Form */}
          {application ? (
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-pr-text-1">Your Application</h3>
              </div>

              <div className="bg-pr-surface-2 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-pr-text-2">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-pr-text-2">Applied</span>
                  <span className="text-sm text-pr-text-1">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pr-text-2">Access Keys Used</span>
                  <span className="text-sm text-pr-text-1">{drop.key_cost}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-pr-text-1 mb-2">Your Message</h4>
                <p className="text-pr-text-1 text-sm leading-relaxed">{application.application_message}</p>
              </div>

              {application.reward_amount > 0 && (
                <div className="mt-4 p-3 bg-pr-surface-2 border border-green-500/60 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Diamond className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">
                      Indexed {application.reward_amount} Impact
                    </span>
                  </div>
                </div>
              )}

              {/* BUY MISSION PROOF SUBMISSION */}
              {drop.drop_role?.toUpperCase() === 'BUY' && application.status === 'approved' && (!application.reward_amount || application.reward_amount === 0) && (
                <div className="mt-6 pt-6 border-t border-pr-surface-3">
                  <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <Receipt className="w-6 h-6 text-purple-400" />
                      <h4 className="font-bold text-pr-text-1">Submit Proof of Purchase</h4>
                    </div>
                    <p className="text-sm text-pr-text-2 mb-4">
                      Upload your receipt or order confirmation to verify your mission and claim your {drop.gem_reward_base} treasures.
                    </p>
                    <button
                      onClick={() => setShowBuyProofModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-500/20"
                    >
                      Upload Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-pr-text-1">
                  {drop.is_distillation_drop ? 'Submit Your Distillate (Clip)' : 'Join this Objective'}
                </h3>
              </div>

              {userData && (userData.keys_balance < (drop.key_cost || 0) || !masterKeyStatus?.is_activated) && (
                <div className="mb-4 p-4 bg-pr-surface-2 border border-yellow-500/60 rounded-lg">
                  <h4 className="font-medium text-pr-text-1 mb-2">System Status:</h4>
                  <ul className="text-sm text-pr-text-2 space-y-1">
                    {userData.keys_balance < (drop.key_cost || 0) && (
                      <li>• Low Key Balance (Need {(drop.key_cost || 0) - userData.keys_balance} more)</li>
                    )}
                    {!masterKeyStatus?.is_activated && (
                      <li>• Master Key Lock Active (Complete 3 objectives today)</li>
                    )}
                  </ul>
                </div>
              )}

              <form onSubmit={handleApply} className="space-y-4">
                {drop.is_distillation_drop ? (
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      Clip / Insight URL
                    </label>
                    <input
                      type="url"
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-pr-surface-1"
                      placeholder="https://..."
                      required
                    />
                    <p className="text-[10px] text-pr-text-2 mt-2 italic">Your clip will be verified for quality by the host/sponsor.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                      Participation Note
                    </label>
                    <textarea
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-pr-surface-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-pr-surface-1"
                      placeholder="Why are you joining this objective?"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    applying ||
                    !applicationMessage.trim() ||
                    !userData ||
                    userData.keys_balance < (drop.key_cost || 0) ||
                    !masterKeyStatus?.is_activated
                  }
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xl ${drop.is_distillation_drop
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    }`}
                >
                  {applying ? 'Submitting...' : drop.is_distillation_drop ? `Submit Clip (${drop.key_cost} 🔑)` : `Join Objective (${drop.key_cost} 🔑)`}
                </button>
              </form>
            </div>
          )}

          {/* Moment Reflections (Doctrine 3.0) */}
          {reflections.length > 0 && (
            <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6 mt-6">
              <div className="flex items-center space-x-2 mb-6 text-pr-text-3">
                <Quote className="w-4 h-4" />
                <h3 className="text-xs font-black tracking-[0.2em] uppercase">Participant Reflections</h3>
              </div>
              <div className="space-y-4">
                {reflections.map(ref => (
                  <div key={ref.id} className="relative pl-6 py-2 border-l-2 border-pr-border/30 italic text-pr-text-2 text-sm">
                    "{ref.text}"
                    <div className="mt-1 text-[10px] text-zinc-500 font-bold uppercase not-italic">
                      {new Date(ref.date).toLocaleDateString()}
                      {/* No grid, no likes, no metrics - just the expression */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Drop Stats */}
          <div className="bg-pr-surface-card rounded-xl border border-pr-surface-3 p-6">
            <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Drop Information</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-orange-600" />
                  <span className="text-pr-text-2">Access Key Cost</span>
                </div>
                <span className="font-bold text-orange-600">{drop.key_cost}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Diamond className="w-4 h-4 text-purple-600" />
                  <span className="text-pr-text-2">Gem Reward</span>
                </div>
                <span className="font-bold text-purple-600">{drop.gem_reward_base}</span>
              </div>

              {(drop.gem_pool_total || 0) > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-pr-text-2">Pool Remaining</span>
                  </div>
                  <span className="font-semibold text-pr-text-1">{drop.gem_pool_remaining}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-pr-text-2">Participants</span>
                </div>
                <span className="font-semibold text-pr-text-1">
                  {drop.current_participants}/{drop.max_participants || '∞'}
                </span>
              </div>

              {(drop.follower_threshold || 0) > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-pr-text-2">Min. Followers</span>
                  </div>
                  <span className="font-semibold text-pr-text-1">{drop.follower_threshold}+</span>
                </div>
              )}

              {drop.time_commitment && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-pr-text-2">Time</span>
                  </div>
                  <span className="font-semibold text-pr-text-1">{drop.time_commitment}</span>
                </div>
              )}

              {drop.deadline_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-pr-text-2">Deadline</span>
                  </div>
                  <span className="font-semibold text-pr-text-1">
                    {new Date(drop.deadline_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3">
            <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Posted By</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-3">
                <UserLink
                  username={drop.creator_name}
                  displayName={drop.creator_name || 'Host'}
                  avatarUrl={drop.creator_avatar}
                  size="md"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Host</p>
                  <p className="text-sm font-medium text-pr-text-1">{drop.creator_name || 'Creator'}</p>
                </div>
              </div>

              {drop.sponsor_name && (
                <div className="flex items-center space-x-3 pt-4 border-t border-pr-surface-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sponsor</p>
                    <p className="text-sm font-medium text-pr-text-1">{drop.sponsor_name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-pr-surface-3">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-pr-text-1">12</p>
                  <p className="text-xs text-pr-text-2">Side Activations Posted</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-pr-text-1">4.8</p>
                  <p className="text-xs text-pr-text-2">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-pr-surface-2 rounded-xl p-6 border border-pr-surface-3">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-pr-text-1">Pro Tips</h3>
            </div>
            <ul className="text-sm text-pr-text-2 space-y-2">
              <li>• Ensure you have enough access keys before applying</li>
              <li>• Activate your Master Key daily</li>
              <li>• Read all activation objectives carefully</li>
              <li>• Submit high-quality work on time</li>
              <li>• Communicate with the activation creator</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {drop && showEditModal && (
        <EditDropModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          drop={drop}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Drop"
        message="Are you sure you want to delete this drop? This action cannot be undone and will remove all applications."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />

      {/* Buy Mission Proof Modal */}
      {drop && (
        <BuyMissionSubmitModal
          isOpen={showBuyProofModal}
          onClose={() => setShowBuyProofModal(false)}
          dropId={drop.id}
          dropTitle={drop.title}
          verified_creditsReward={drop.gem_reward_base || 0}
          onSuccess={() => {
            checkApplication();
            fetchUserData();
          }}
        />
      )}
    </div>
  );
}
