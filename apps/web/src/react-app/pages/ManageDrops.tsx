import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Clock,
  Users,
  Diamond,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Filter,
  ChevronRight,
  AlertCircle,
  Star,
  MessageSquare,
  Search,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Edit,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'https://promorang-api.vercel.app';

interface Drop {
  id: string;
  title: string;
  description: string;
  drop_type: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  gem_pool_total: number;
  gem_pool_remaining: number;
  current_participants: number;
  max_participants: number;
  deadline_at: string;
  created_at: string;
  preview_image?: string;
  is_proof_drop: boolean;
  pending_submissions?: number;
}

interface Submission {
  id: string;
  user_id: string;
  drop_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proof_url?: string;
  submission_notes?: string;
  applied_at: string;
  reviewed_at?: string;
  user?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  users?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export default function ManageDrops() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [drops, setDrops] = useState<Drop[]>([]);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as any)?.message || null
  );

  useEffect(() => {
    fetchMyDrops();
    // Clear success message after showing
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchMyDrops = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drops/my-drops`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDrops(Array.isArray(data) ? data : []);
      } else {
        // Mock data for demo
        setDrops([
          {
            id: '1',
            title: 'Summer Fashion Campaign',
            description: 'Share our new summer collection with your followers',
            drop_type: 'content_creation',
            status: 'active',
            gem_pool_total: 1000,
            gem_pool_remaining: 750,
            current_participants: 12,
            max_participants: 50,
            deadline_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            is_proof_drop: true,
            pending_submissions: 5,
          },
          {
            id: '2',
            title: 'Product Review Drop',
            description: 'Review our latest tech gadget and share your experience',
            drop_type: 'reviews',
            status: 'active',
            gem_pool_total: 500,
            gem_pool_remaining: 400,
            current_participants: 8,
            max_participants: 25,
            deadline_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            is_proof_drop: true,
            pending_submissions: 3,
          },
          {
            id: '3',
            title: 'Engagement Boost',
            description: 'Like and comment on our latest posts',
            drop_type: 'engagement',
            status: 'completed',
            gem_pool_total: 200,
            gem_pool_remaining: 0,
            current_participants: 40,
            max_participants: 40,
            deadline_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            is_proof_drop: false,
            pending_submissions: 0,
          },
          {
            id: '4',
            title: 'TikTok Challenge',
            description: 'Create a fun TikTok using our product',
            drop_type: 'content_creation',
            status: 'paused',
            gem_pool_total: 800,
            gem_pool_remaining: 600,
            current_participants: 15,
            max_participants: 100,
            deadline_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_proof_drop: true,
            pending_submissions: 2,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (dropId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/drops/${dropId}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(Array.isArray(data) ? data : []);
      } else {
        // Mock submissions
        setSubmissions([
          {
            id: 's1',
            user_id: 'u1',
            drop_id: dropId,
            status: 'pending',
            proof_url: 'https://instagram.com/p/example1',
            submission_notes: 'Posted to my feed with all required hashtags. Got great engagement!',
            applied_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            users: {
              username: 'creator_jane',
              display_name: 'Jane Creator',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
            },
          },
          {
            id: 's2',
            user_id: 'u2',
            drop_id: dropId,
            status: 'pending',
            proof_url: 'https://tiktok.com/@user/video/123',
            submission_notes: 'Created a 60 second video showcasing the product features',
            applied_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            users: {
              username: 'mike_content',
              display_name: 'Mike Content',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
            },
          },
          {
            id: 's3',
            user_id: 'u3',
            drop_id: dropId,
            status: 'approved',
            proof_url: 'https://youtube.com/watch?v=example',
            submission_notes: 'Full review video uploaded to my channel',
            applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            users: {
              username: 'sarah_reviews',
              display_name: 'Sarah Reviews',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            },
          },
          {
            id: 's4',
            user_id: 'u4',
            drop_id: dropId,
            status: 'rejected',
            proof_url: 'https://twitter.com/user/status/123',
            submission_notes: 'Shared on Twitter',
            applied_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            reviewed_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            users: {
              username: 'alex_promo',
              display_name: 'Alex Promo',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSelectDrop = async (drop: Drop) => {
    setSelectedDrop(drop);
    await fetchSubmissions(drop.id);
  };

  const handleReviewSubmission = async (action: 'approve' | 'reject') => {
    if (!selectedSubmission || !selectedDrop) return;

    setIsProcessing(true);

    try {
      const response = await fetch(
        `${API_URL}/api/drops/${selectedDrop.id}/applications/${selectedSubmission.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        setSuccessMessage(`Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        setShowReviewModal(false);
        setSelectedSubmission(null);
        await fetchSubmissions(selectedDrop.id);
      } else {
        throw new Error('Failed to process submission');
      }
    } catch (error) {
      console.error('Error processing submission:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-500/10';
      case 'completed': return 'text-gray-600 bg-gray-500/10';
      case 'paused': return 'text-amber-600 bg-amber-500/10';
      case 'pending': return 'text-amber-600 bg-amber-500/10';
      case 'approved': return 'text-emerald-600 bg-emerald-500/10';
      case 'rejected': return 'text-red-600 bg-red-500/10';
      default: return 'text-gray-600 bg-gray-500/10';
    }
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredDrops = drops.filter(drop => {
    const matchesFilter = filter === 'all' || drop.status === filter;
    const matchesSearch = !searchQuery || 
      drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending');

  const totalPending = drops.reduce((sum, d) => sum + (d.pending_submissions || 0), 0);

  // Drops List View
  const renderDropsList = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-pr-surface-1 border border-pr-surface-3">
          <div className="text-2xl font-bold text-pr-text-1">{drops.length}</div>
          <div className="text-sm text-pr-text-2">Total Drops</div>
        </div>
        <div className="p-4 rounded-xl bg-pr-surface-1 border border-pr-surface-3">
          <div className="text-2xl font-bold text-emerald-500">
            {drops.filter(d => d.status === 'active').length}
          </div>
          <div className="text-sm text-pr-text-2">Active</div>
        </div>
        <div className="p-4 rounded-xl bg-pr-surface-1 border border-pr-surface-3">
          <div className="text-2xl font-bold text-amber-500">{totalPending}</div>
          <div className="text-sm text-pr-text-2">Pending Review</div>
        </div>
        <div className="p-4 rounded-xl bg-pr-surface-1 border border-pr-surface-3">
          <div className="text-2xl font-bold text-violet-500">
            {drops.reduce((sum, d) => sum + (d.gem_pool_total - d.gem_pool_remaining), 0)} 💎
          </div>
          <div className="text-sm text-pr-text-2">Distributed</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-pr-text-2" />
          <input
            type="text"
            placeholder="Search drops..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-pr-surface-3 bg-pr-surface-1 text-pr-text-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'paused', 'completed'] as const).map((f) => (
            <button
              key={f}
              className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-pr-surface-1 text-pr-text-1 border border-pr-surface-3 hover:bg-pr-surface-2'
              }`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Drops Grid */}
      <div className="grid gap-4">
        {filteredDrops.map((drop) => (
          <div
            key={drop.id}
            className="p-5 rounded-2xl bg-pr-surface-1 border border-pr-surface-3 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectDrop(drop)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-pr-text-1">{drop.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(drop.status)}`}>
                    {drop.status}
                  </span>
                </div>
                <p className="text-sm text-pr-text-2 line-clamp-1">{drop.description}</p>
              </div>
              {drop.is_proof_drop && drop.pending_submissions && drop.pending_submissions > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600">
                  <AlertCircle size={14} />
                  <span className="text-sm font-medium">{drop.pending_submissions} pending</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Users size={16} />
                <span>{drop.current_participants}/{drop.max_participants}</span>
              </div>
              <div className="flex items-center gap-1.5 text-violet-500">
                <Diamond size={16} />
                <span>{drop.gem_pool_remaining}/{drop.gem_pool_total}</span>
              </div>
              <div className="flex items-center gap-1.5 text-pr-text-2">
                <Clock size={16} />
                <span>
                  {new Date(drop.deadline_at) > new Date()
                    ? `${Math.ceil((new Date(drop.deadline_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left`
                    : 'Ended'}
                </span>
              </div>
              <ChevronRight size={18} className="ml-auto text-pr-text-2" />
            </div>
          </div>
        ))}

        {filteredDrops.length === 0 && (
          <div className="text-center py-12 text-pr-text-2">
            {searchQuery ? 'No drops match your search' : 'No drops found'}
          </div>
        )}
      </div>
    </div>
  );

  // Drop Detail View
  const renderDropDetail = () => {
    if (!selectedDrop) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedDrop(null)}
          className="flex items-center gap-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to all drops
        </button>

        {/* Drop Info */}
        <div className="p-6 rounded-2xl bg-pr-surface-1 border border-pr-surface-3">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-pr-text-1">{selectedDrop.title}</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedDrop.status)}`}>
                  {selectedDrop.status}
                </span>
              </div>
              <p className="text-pr-text-2">{selectedDrop.description}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-pr-surface-2 text-pr-text-2">
                <Edit size={18} />
              </button>
              <button className="p-2 rounded-lg hover:bg-pr-surface-2 text-pr-text-2">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-pr-surface-2">
              <div className="flex items-center gap-2 text-pr-text-2 mb-1">
                <Users size={16} />
                <span className="text-sm">Participants</span>
              </div>
              <div className="font-bold text-pr-text-1">
                {selectedDrop.current_participants}/{selectedDrop.max_participants}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-pr-surface-2">
              <div className="flex items-center gap-2 text-violet-500 mb-1">
                <Diamond size={16} />
                <span className="text-sm">Gems Remaining</span>
              </div>
              <div className="font-bold text-pr-text-1">
                {selectedDrop.gem_pool_remaining} / {selectedDrop.gem_pool_total}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-pr-surface-2">
              <div className="flex items-center gap-2 text-pr-text-2 mb-1">
                <Clock size={16} />
                <span className="text-sm">Deadline</span>
              </div>
              <div className="font-bold text-pr-text-1">
                {new Date(selectedDrop.deadline_at).toLocaleDateString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-pr-surface-2">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <AlertCircle size={16} />
                <span className="text-sm">Pending</span>
              </div>
              <div className="font-bold text-pr-text-1">
                {pendingSubmissions.length} submissions
              </div>
            </div>
          </div>
        </div>

        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-pr-text-1 mb-4">
              Pending Review ({pendingSubmissions.length})
            </h3>
            <div className="space-y-3">
              {pendingSubmissions.map((submission) => {
                const user = submission.user || submission.users;
                return (
                  <div
                    key={submission.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-pr-surface-1 border-2 border-amber-500/30 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.user_id}`}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-pr-text-1">
                        {user?.display_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-pr-text-2">@{user?.username || 'user'}</div>
                      <div className="text-xs text-pr-text-2 mt-1">{formatTimeAgo(submission.applied_at)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowReviewModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Eye size={16} />
                      Review
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviewed Submissions */}
        {reviewedSubmissions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-pr-text-1 mb-4">
              Reviewed ({reviewedSubmissions.length})
            </h3>
            <div className="space-y-3">
              {reviewedSubmissions.map((submission) => {
                const user = submission.user || submission.users;
                return (
                  <div
                    key={submission.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-pr-surface-1 border border-pr-surface-3"
                  >
                    <img
                      src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.user_id}`}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-pr-text-1">
                        {user?.display_name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-pr-text-2">@{user?.username || 'user'}</div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status === 'approved' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span className="text-sm font-medium capitalize">{submission.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {submissions.length === 0 && (
          <div className="text-center py-12 text-pr-text-2">
            No submissions yet
          </div>
        )}
      </div>
    );
  };

  // Review Modal
  const renderReviewModal = () => {
    if (!selectedSubmission) return null;
    const user = selectedSubmission.user || selectedSubmission.users;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg bg-pr-surface-1 rounded-2xl shadow-xl overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-pr-surface-3">
            <h3 className="text-lg font-bold text-pr-text-1">Review Submission</h3>
            <button
              onClick={() => {
                setShowReviewModal(false);
                setSelectedSubmission(null);
              }}
              className="p-2 rounded-lg hover:bg-pr-surface-2 text-pr-text-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-pr-surface-2">
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSubmission.user_id}`}
                alt=""
                className="w-14 h-14 rounded-full"
              />
              <div>
                <div className="font-bold text-pr-text-1 text-lg">
                  {user?.display_name || 'Unknown User'}
                </div>
                <div className="text-pr-text-2">@{user?.username || 'user'}</div>
              </div>
            </div>

            {/* Proof Link */}
            {selectedSubmission.proof_url && (
              <div>
                <label className="block text-sm font-semibold text-pr-text-1 mb-2">Proof of Work</label>
                <a
                  href={selectedSubmission.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-pr-surface-3 hover:bg-pr-surface-2 transition-colors"
                >
                  <ExternalLink size={18} className="text-primary flex-shrink-0" />
                  <span className="text-primary truncate">{selectedSubmission.proof_url}</span>
                </a>
              </div>
            )}

            {/* Submission Notes */}
            {selectedSubmission.submission_notes && (
              <div>
                <label className="block text-sm font-semibold text-pr-text-1 mb-2">Notes</label>
                <div className="flex gap-3 p-4 rounded-xl bg-pr-surface-2">
                  <MessageSquare size={18} className="text-pr-text-2 flex-shrink-0 mt-0.5" />
                  <p className="text-pr-text-1">{selectedSubmission.submission_notes}</p>
                </div>
              </div>
            )}

            {/* Submitted Time */}
            <div className="text-sm text-pr-text-2">
              Submitted {new Date(selectedSubmission.applied_at).toLocaleString()}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 p-4 border-t border-pr-surface-3">
            <button
              onClick={() => handleReviewSubmission('reject')}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              Reject
            </button>
            <button
              onClick={() => handleReviewSubmission('approve')}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={18} />
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-pr-surface-2">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-pr-surface-1 border-b border-pr-surface-3">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => selectedDrop ? setSelectedDrop(null) : navigate(-1)}
                className="p-2 rounded-lg hover:bg-pr-surface-2 text-pr-text-2"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-pr-text-1">
                {selectedDrop ? selectedDrop.title : 'Manage Drops'}
              </h1>
            </div>
            {!selectedDrop && (
              <button
                onClick={() => navigate('/drops/create')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                Create Drop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-pr-text-2">Loading...</div>
        ) : selectedDrop ? (
          renderDropDetail()
        ) : (
          renderDropsList()
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && renderReviewModal()}
    </div>
  );
}
