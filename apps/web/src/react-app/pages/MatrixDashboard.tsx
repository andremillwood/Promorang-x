import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  UserPlus,
  MessageSquare,
  GraduationCap,
  Shield,
  Crown,
  Star,
  Sparkles,
  BarChart3,
  RefreshCw,
  Copy,
  ExternalLink,
  Calendar,
  Activity,
  Zap,
  Network,
  CircleDollarSign,
  BadgeCheck,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  MoreVertical,
  Phone,
  Mail,
  HelpCircle,
  BookOpen,
  Play,
  Check,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/react-app/lib/api';

// Types
interface MatrixRank {
  key: string;
  name: string;
  badge_icon: string;
  badge_color: string;
  weekly_cap_cents: number;
  eligible_depth: number;
}

interface MatrixSubscription {
  tier: string;
  tier_name: string;
  status: string;
  amount_cents: number;
  current_period_end: string;
  days_remaining: number;
}

interface QualificationRequirement {
  met: boolean;
  current?: number | boolean;
  required?: number | boolean;
  value?: boolean;
}

interface MatrixQualification {
  current_period: {
    id: string;
    status: string;
    period_start: string;
    period_end: string;
    days_remaining: number;
  };
  status: string;
  requirements: {
    active_subscription: QualificationRequirement;
    min_active_recruits: QualificationRequirement;
    support_actions: QualificationRequirement;
    retention_rate: QualificationRequirement;
  };
  reasons: string[];
}

interface MatrixEarnings {
  current_period: {
    pending: number;
    eligible: number;
    total: number;
  };
  last_period: {
    earned: number;
    paid: number;
  };
  lifetime: {
    total_earned: number;
    total_paid: number;
    pending: number;
  };
  weekly_cap: number;
  cap_used_percent: number;
}

interface MatrixTeam {
  direct_recruits: number;
  active_recruits: number;
  total_team_size: number;
  retention_rate: number;
  new_this_period: number;
  at_risk: number;
}

interface ActivityEvent {
  type: string;
  message: string;
  time: string;
}

interface MatrixDashboardData {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  rank: {
    current: MatrixRank;
    next: {
      key: string;
      name: string;
      badge_icon: string;
      requirements: {
        min_active_recruits: number;
        min_team_size: number;
        min_retention_rate: number;
      };
      progress: {
        active_recruits: { current: number; required: number; met: boolean };
        team_size: { current: number; required: number; met: boolean };
        retention_rate: { current: number; required: number; met: boolean };
      };
    };
  };
  subscription: MatrixSubscription;
  qualification: MatrixQualification;
  earnings: MatrixEarnings;
  team: MatrixTeam;
  next_payout: {
    date: string;
    estimated_amount: number;
    status: string;
  };
  activity: {
    recent_events: ActivityEvent[];
  };
}

interface Recruit {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  subscription: {
    tier: string;
    status: string;
    amount_cents: number;
  };
  linked_at: string;
  level: number;
  support_actions_this_period: number;
  onboarding_complete: boolean;
  their_recruits: number;
  earnings_generated: number;
  at_risk?: boolean;
  risk_reason?: string;
  churned?: boolean;
  churn_date?: string;
}

interface EarningEntry {
  id: string;
  period: string;
  source_type: string;
  amount_cents: number;
  status: string;
  recruit: string;
  level?: number;
  created_at: string;
}

interface PayoutRequest {
  id: string;
  period: string;
  requested_amount_cents: number;
  approved_amount_cents: number;
  status: string;
  created_at: string;
  paid_at?: string;
  estimated_payment_date?: string;
}

interface SupportLog {
  id: string;
  recruit: string;
  action_type: string;
  notes: string;
  verified: boolean;
  created_at: string;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  required: boolean;
  completed: boolean;
  score?: number;
  rank_required?: string;
}

// Helper functions
const formatCents = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'pass':
    case 'paid':
    case 'eligible':
      return 'text-green-600 bg-green-100';
    case 'pending':
    case 'processing':
    case 'on_track':
      return 'text-yellow-600 bg-yellow-100';
    case 'past_due':
    case 'at_risk':
    case 'hold':
    case 'held':
      return 'text-orange-600 bg-orange-100';
    case 'canceled':
    case 'fail':
    case 'void':
    case 'churned':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'earning':
      return <DollarSign className="w-4 h-4 text-green-500" />;
    case 'support_logged':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'renewal':
      return <RefreshCw className="w-4 h-4 text-purple-500" />;
    case 'at_risk':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'new_recruit':
      return <UserPlus className="w-4 h-4 text-indigo-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

// Tab type
type MatrixTab = 'overview' | 'team' | 'earnings' | 'payouts' | 'rank' | 'training' | 'support';

export default function MatrixDashboard() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<MatrixTab>(
    (searchParams.get('tab') as MatrixTab) || 'overview'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [dashboard, setDashboard] = useState<MatrixDashboardData | null>(null);
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [supportLogs, setSupportLogs] = useState<SupportLog[]>([]);
  const [training, setTraining] = useState<{ modules: TrainingModule[]; progress: { completed: number; total: number } } | null>(null);
  const [ranks, setRanks] = useState<{ key: string; name: string; badge_icon: string; badge_color: string; order: number; weekly_cap: string; eligible_depth: number; requirements: { recruits: number; team: number; retention: string }; current?: boolean; next?: boolean }[]>([]);
  const [referralLink, setReferralLink] = useState<{ referral_code: string; referral_link: string; qr_code_url: string } | null>(null);
  
  // Filter states
  const [recruitFilter, setRecruitFilter] = useState<'all' | 'active' | 'past_due' | 'at_risk'>('all');
  const [earningsFilter, setEarningsFilter] = useState<'all' | 'pending' | 'eligible' | 'paid'>('all');
  
  // Support log form
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportFormData, setSuportFormData] = useState({
    recruit_user_id: '',
    action_type: 'check_in',
    notes: ''
  });

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await apiFetch<MatrixDashboardData>('/matrix/dashboard');
      setDashboard(data);
    } catch (err) {
      console.error('Failed to fetch Matrix dashboard:', err);
      setError('Failed to load dashboard. Please ensure you have an active $50+ subscription.');
    }
  }, []);

  const fetchRecruits = useCallback(async () => {
    try {
      const data = await apiFetch<{ recruits: Recruit[] }>(`/matrix/team/recruits?status=${recruitFilter}`);
      setRecruits(data.recruits);
    } catch (err) {
      console.error('Failed to fetch recruits:', err);
    }
  }, [recruitFilter]);

  const fetchEarnings = useCallback(async () => {
    try {
      const statusParam = earningsFilter === 'all' ? '' : `?status=${earningsFilter}`;
      const data = await apiFetch<{ earnings: EarningEntry[] }>(`/matrix/earnings${statusParam}`);
      setEarnings(data.earnings);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  }, [earningsFilter]);

  const fetchPayouts = useCallback(async () => {
    try {
      const data = await apiFetch<{ payouts: PayoutRequest[] }>('/matrix/payouts');
      setPayouts(data.payouts);
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    }
  }, []);

  const fetchSupportLogs = useCallback(async () => {
    try {
      const data = await apiFetch<{ logs: SupportLog[] }>('/matrix/support/logs');
      setSupportLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch support logs:', err);
    }
  }, []);

  const fetchTraining = useCallback(async () => {
    try {
      const data = await apiFetch<{ modules: TrainingModule[]; progress: { completed: number; total: number } }>('/matrix/training');
      setTraining(data);
    } catch (err) {
      console.error('Failed to fetch training:', err);
    }
  }, []);

  const fetchRanks = useCallback(async () => {
    try {
      const data = await apiFetch<{ ranks: typeof ranks }>('/matrix/ranks');
      setRanks(data.ranks);
    } catch (err) {
      console.error('Failed to fetch ranks:', err);
    }
  }, []);

  const fetchReferralLink = useCallback(async () => {
    try {
      const data = await apiFetch<{ referral_code: string; referral_link: string; qr_code_url: string }>('/matrix/referral-link');
      setReferralLink(data);
    } catch (err) {
      console.error('Failed to fetch referral link:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboard();
      await fetchReferralLink();
      setLoading(false);
    };
    loadData();
  }, [fetchDashboard, fetchReferralLink]);

  useEffect(() => {
    if (activeTab === 'team') {
      fetchRecruits();
    } else if (activeTab === 'earnings') {
      fetchEarnings();
    } else if (activeTab === 'payouts') {
      fetchPayouts();
    } else if (activeTab === 'support') {
      fetchSupportLogs();
      fetchRecruits();
    } else if (activeTab === 'training') {
      fetchTraining();
    } else if (activeTab === 'rank') {
      fetchRanks();
    }
  }, [activeTab, fetchRecruits, fetchEarnings, fetchPayouts, fetchSupportLogs, fetchTraining, fetchRanks]);

  useEffect(() => {
    if (recruitFilter !== 'all') {
      fetchRecruits();
    }
  }, [recruitFilter, fetchRecruits]);

  useEffect(() => {
    if (earningsFilter !== 'all') {
      fetchEarnings();
    }
  }, [earningsFilter, fetchEarnings]);

  const handleTabChange = (tab: MatrixTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCopyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink.referral_link);
    }
  };

  const handleLogSupport = async () => {
    try {
      await apiFetch('/matrix/support/log', {
        method: 'POST',
        body: JSON.stringify(supportFormData)
      });
      setShowSupportForm(false);
      setSuportFormData({ recruit_user_id: '', action_type: 'check_in', notes: '' });
      fetchSupportLogs();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to log support:', err);
    }
  };

  const handleRequestPayout = async () => {
    try {
      await apiFetch('/matrix/payouts/request', {
        method: 'POST',
        body: JSON.stringify({})
      });
      fetchPayouts();
      fetchDashboard();
    } catch (err) {
      console.error('Failed to request payout:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Growth Partner Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Growth Partner Access Required</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Growth Partner access requires an active $50+ subscription. Upgrade your plan to unlock team bonuses.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/settings?tab=subscription')} className="w-full bg-purple-600 hover:bg-purple-700">
              Upgrade Subscription
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: MatrixTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'earnings', label: 'Earnings', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'payouts', label: 'Payouts', icon: <Wallet className="w-4 h-4" /> },
    { id: 'rank', label: 'Rank', icon: <Crown className="w-4 h-4" /> },
    { id: 'training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'support', label: 'Support', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-pr-surface-background pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                {dashboard.rank.current.badge_icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Growth Partner Dashboard</h1>
                <p className="text-purple-200">
                  {dashboard.rank.current.name} • {dashboard.user.display_name}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-purple-200">Lifetime Earnings</p>
                <p className="text-xl font-bold">{formatCents(dashboard.earnings.lifetime.total_earned)}</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-right">
                <p className="text-sm text-purple-200">Available</p>
                <p className="text-xl font-bold">{formatCents(dashboard.earnings.lifetime.pending)}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <div className="flex items-center gap-2 text-pr-text-2 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Active Partners
                </div>
                <p className="text-2xl font-bold text-pr-text-1">{dashboard.team.active_recruits}</p>
                <p className="text-xs text-pr-text-2">of {dashboard.team.direct_recruits} direct</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <div className="flex items-center gap-2 text-pr-text-2 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Retention Rate
                </div>
                <p className="text-2xl font-bold text-pr-text-1">{formatPercent(dashboard.team.retention_rate)}</p>
                <p className="text-xs text-green-500">Above threshold</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <div className="flex items-center gap-2 text-pr-text-2 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  This Period
                </div>
                <p className="text-2xl font-bold text-pr-text-1">{formatCents(dashboard.earnings.current_period.total)}</p>
                <p className="text-xs text-yellow-500">Pending</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <div className="flex items-center gap-2 text-pr-text-2 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Next Payout
                </div>
                <p className="text-2xl font-bold text-pr-text-1">{formatCents(dashboard.next_payout.estimated_amount)}</p>
                <p className="text-xs text-pr-text-2">{formatDate(dashboard.next_payout.date)}</p>
              </div>
            </div>

            {/* Qualification Status */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm overflow-hidden border border-pr-surface-3">
              <div className="p-4 border-b border-pr-surface-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-pr-text-1">Qualification Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dashboard.qualification.status)}`}>
                    {dashboard.qualification.status === 'on_track' ? 'On Track' : dashboard.qualification.status}
                  </span>
                </div>
                <p className="text-sm text-pr-text-2 mt-1">
                  Period ends in {dashboard.qualification.current_period.days_remaining} days
                </p>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(dashboard.qualification.requirements).map(([key, req]) => (
                  <div key={key} className="flex items-start gap-3">
                    {req.met ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-pr-text-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-pr-text-2">
                        {typeof req.current === 'number' && typeof req.required === 'number'
                          ? `${req.current} / ${req.required}`
                          : req.met ? 'Met' : 'Not met'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank Progress */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm p-4 border border-pr-surface-3">
              <h3 className="font-semibold text-pr-text-1 mb-4">Rank Progress</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{dashboard.rank.current.badge_icon}</span>
                  <div>
                    <p className="font-medium text-pr-text-1">{dashboard.rank.current.name}</p>
                    <p className="text-xs text-pr-text-2">Current Rank</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-pr-text-2" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl opacity-50">{dashboard.rank.next.badge_icon}</span>
                  <div>
                    <p className="font-medium text-pr-text-2">{dashboard.rank.next.name}</p>
                    <p className="text-xs text-pr-text-2">Next Rank</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(dashboard.rank.next.progress).map(([key, prog]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-pr-text-2 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className={prog.met ? 'text-green-500' : 'text-pr-text-1'}>
                        {prog.current} / {prog.required}
                      </span>
                    </div>
                    <div className="h-2 bg-pr-surface-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${prog.met ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(100, (prog.current / prog.required) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Link */}
            {referralLink && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white">
                <h3 className="font-semibold mb-2">Your Matrix Referral Link</h3>
                <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3">
                  <input
                    type="text"
                    value={referralLink.referral_link}
                    readOnly
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    onClick={handleCopyReferralLink}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-purple-200 mt-2">
                  Share this link to invite new partners and earn team bonuses
                </p>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm border border-pr-surface-3">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1">Recent Activity</h3>
              </div>
              <div className="divide-y divide-pr-surface-3">
                {dashboard.activity.recent_events.map((event, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pr-surface-2 flex items-center justify-center">
                      {getActivityIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-pr-text-1">{event.message}</p>
                      <p className="text-xs text-pr-text-2">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Team Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Team Members</p>
                <p className="text-2xl font-bold text-pr-text-1">{dashboard.team.direct_recruits}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Active</p>
                <p className="text-2xl font-bold text-green-500">{dashboard.team.active_recruits}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Total Team</p>
                <p className="text-2xl font-bold text-pr-text-1">{dashboard.team.total_team_size}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">At Risk</p>
                <p className="text-2xl font-bold text-orange-500">{dashboard.team.at_risk}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Retention</p>
                <p className="text-2xl font-bold text-purple-500">{formatPercent(dashboard.team.retention_rate)}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-pr-text-2">Filter:</span>
              {(['all', 'active', 'past_due', 'at_risk'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRecruitFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    recruitFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Recruits List */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm overflow-hidden border border-pr-surface-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pr-surface-2">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Recruit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Support</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Earnings</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pr-surface-3">
                    {recruits.map((recruit) => (
                      <tr key={recruit.id} className="hover:bg-pr-surface-2">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={recruit.avatar_url}
                              alt={recruit.display_name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-pr-text-1">{recruit.display_name}</p>
                              <p className="text-xs text-pr-text-2">@{recruit.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recruit.subscription.status)}`}>
                            {recruit.subscription.status}
                          </span>
                          {recruit.at_risk && (
                            <p className="text-xs text-orange-500 mt-1">{recruit.risk_reason}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-pr-text-1">Level {recruit.level}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-pr-text-1">{recruit.support_actions_this_period}</span>
                            {recruit.onboarding_complete ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-pr-text-1">
                            {formatCents(recruit.earnings_generated)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-pr-text-2">{formatDate(recruit.linked_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Earnings Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{formatCents(dashboard.earnings.current_period.pending)}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Eligible</p>
                <p className="text-2xl font-bold text-green-500">{formatCents(dashboard.earnings.lifetime.pending)}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Paid Out</p>
                <p className="text-2xl font-bold text-pr-text-1">{formatCents(dashboard.earnings.lifetime.total_paid)}</p>
              </div>
              <div className="bg-pr-surface-card rounded-xl p-4 shadow-sm border border-pr-surface-3">
                <p className="text-sm text-pr-text-2">Weekly Cap</p>
                <p className="text-2xl font-bold text-purple-500">{formatCents(dashboard.earnings.weekly_cap)}</p>
                <div className="mt-2 h-2 bg-pr-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${dashboard.earnings.cap_used_percent * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-pr-text-2">Filter:</span>
              {(['all', 'pending', 'eligible', 'paid'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setEarningsFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    earningsFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'bg-pr-surface-2 text-pr-text-2 hover:bg-pr-surface-3'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Earnings List */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm overflow-hidden border border-pr-surface-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pr-surface-2">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-pr-text-2 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pr-surface-3">
                    {earnings.map((entry) => (
                      <tr key={entry.id} className="hover:bg-pr-surface-2">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-pr-text-1 capitalize">
                            {entry.source_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-pr-text-2">
                            @{entry.recruit}
                            {entry.level && entry.level > 1 && (
                              <span className="text-xs text-pr-text-2 ml-1">(L{entry.level})</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-pr-text-1">
                            {formatCents(entry.amount_cents)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-pr-text-2">{formatDate(entry.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payout Action */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Available for Payout</h3>
                  <p className="text-3xl font-bold">{formatCents(dashboard.earnings.lifetime.pending)}</p>
                  <p className="text-sm text-green-200 mt-1">
                    Next payout: {formatDate(dashboard.next_payout.date)}
                  </p>
                </div>
                <Button
                  onClick={handleRequestPayout}
                  className="bg-white text-green-600 hover:bg-green-50"
                  disabled={dashboard.earnings.lifetime.pending < 1000}
                >
                  Request Payout
                </Button>
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm overflow-hidden border border-pr-surface-3">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1">Payout History</h3>
              </div>
              <div className="divide-y divide-pr-surface-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-pr-text-1">{payout.period}</p>
                      <p className="text-sm text-pr-text-2">
                        {payout.paid_at ? `Paid ${formatDate(payout.paid_at)}` : `Requested ${formatDate(payout.created_at)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-pr-text-1">{formatCents(payout.approved_amount_cents || payout.requested_amount_cents)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rank Tab */}
        {activeTab === 'rank' && (
          <div className="space-y-6">
            {/* Current Rank */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm p-6 border border-pr-surface-3">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${dashboard.rank.current.badge_color}20` }}
                >
                  {dashboard.rank.current.badge_icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-pr-text-1">{dashboard.rank.current.name}</h2>
                  <p className="text-pr-text-2">Your current Matrix rank</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-pr-text-2">
                      Weekly Cap: <strong className="text-pr-text-1">{formatCents(dashboard.rank.current.weekly_cap_cents)}</strong>
                    </span>
                    <span className="text-pr-text-2">
                      Depth: <strong className="text-pr-text-1">{dashboard.rank.current.eligible_depth} levels</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank Ladder */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm overflow-hidden border border-pr-surface-3">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1">Rank Ladder</h3>
              </div>
              <div className="divide-y divide-pr-surface-3">
                {ranks.map((rank) => (
                  <div
                    key={rank.key}
                    className={`p-4 flex items-center gap-4 ${rank.current ? 'bg-purple-500/10' : ''}`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${rank.badge_color}20` }}
                    >
                      {rank.badge_icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-pr-text-1">{rank.name}</p>
                        {rank.current && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">Current</span>
                        )}
                        {rank.next && (
                          <span className="px-2 py-0.5 bg-pr-surface-3 text-pr-text-2 text-xs rounded-full">Next</span>
                        )}
                      </div>
                      <p className="text-sm text-pr-text-2">
                        {rank.requirements.recruits} recruits • {rank.requirements.team} team • {rank.requirements.retention} retention
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-pr-text-1">{rank.weekly_cap}/week</p>
                      <p className="text-sm text-pr-text-2">{rank.eligible_depth} levels deep</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && training && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm p-6 border border-pr-surface-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-pr-text-1">Training Progress</h3>
                  <p className="text-sm text-pr-text-2">
                    {training.progress.completed} of {training.progress.total} modules completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-500">
                    {Math.round((training.progress.completed / training.progress.total) * 100)}%
                  </p>
                </div>
              </div>
              <div className="h-3 bg-pr-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${(training.progress.completed / training.progress.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              {training.modules.map((module) => (
                <div
                  key={module.id}
                  className={`bg-pr-surface-card rounded-xl shadow-sm p-4 border border-pr-surface-3 ${module.completed ? 'border-l-4 border-l-green-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      module.completed ? 'bg-green-500/20 text-green-500' : 'bg-pr-surface-2 text-pr-text-2'
                    }`}>
                      {module.completed ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-pr-text-1">{module.title}</h4>
                        {module.required && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Required</span>
                        )}
                        {module.rank_required && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                            {module.rank_required}+
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-pr-text-2 mt-1">{module.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-pr-text-2">
                        <span>{module.duration} min</span>
                        {module.completed && module.score && (
                          <span className="text-green-500">Score: {module.score}%</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={module.completed ? 'outline' : 'default'}
                      size="sm"
                      className={module.completed ? '' : 'bg-purple-600 hover:bg-purple-700'}
                    >
                      {module.completed ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            {/* Log Support Action */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm p-6 border border-pr-surface-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-pr-text-1">Log Support Action</h3>
                <Button
                  onClick={() => setShowSupportForm(!showSupportForm)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Action
                </Button>
              </div>

              {showSupportForm && (
                <div className="border-t border-pr-surface-3 pt-4 mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-1">Recruit</label>
                    <select
                      value={supportFormData.recruit_user_id}
                      onChange={(e) => setSuportFormData({ ...supportFormData, recruit_user_id: e.target.value })}
                      className="w-full px-3 py-2 border border-pr-surface-3 rounded-lg bg-pr-surface-2 text-pr-text-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a recruit...</option>
                      {recruits.filter(r => r.level === 1).map((recruit) => (
                        <option key={recruit.id} value={recruit.id}>
                          {recruit.display_name} (@{recruit.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-1">Action Type</label>
                    <select
                      value={supportFormData.action_type}
                      onChange={(e) => setSuportFormData({ ...supportFormData, action_type: e.target.value })}
                      className="w-full px-3 py-2 border border-pr-surface-3 rounded-lg bg-pr-surface-2 text-pr-text-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="check_in">Check-in Call</option>
                      <option value="onboarding_complete">Onboarding Complete</option>
                      <option value="training_attended">Training Attended</option>
                      <option value="module_completed">Module Completed</option>
                      <option value="activation_help">Activation Help</option>
                      <option value="call_logged">Call Logged</option>
                      <option value="message_sent">Message Sent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pr-text-1 mb-1">Notes</label>
                    <textarea
                      value={supportFormData.notes}
                      onChange={(e) => setSuportFormData({ ...supportFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-pr-surface-3 rounded-lg bg-pr-surface-2 text-pr-text-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-pr-text-2"
                      placeholder="Describe the support action..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSupportForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogSupport}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!supportFormData.recruit_user_id}
                    >
                      Log Support
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Support Logs */}
            <div className="bg-pr-surface-card rounded-xl shadow-sm overflow-hidden border border-pr-surface-3">
              <div className="p-4 border-b border-pr-surface-3">
                <h3 className="font-semibold text-pr-text-1">Recent Support Logs</h3>
              </div>
              <div className="divide-y divide-pr-surface-3">
                {supportLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.verified ? 'bg-green-500/20 text-green-500' : 'bg-pr-surface-2 text-pr-text-2'
                    }`}>
                      {log.verified ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-pr-text-1">@{log.recruit}</span>
                        <span className="px-2 py-0.5 bg-pr-surface-2 text-pr-text-2 text-xs rounded-full capitalize">
                          {log.action_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-pr-text-2 mt-1">{log.notes}</p>
                      <p className="text-xs text-pr-text-2 mt-1">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
