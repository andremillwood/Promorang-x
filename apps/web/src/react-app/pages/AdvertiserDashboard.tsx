import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import {
  BarChart3,
  Users,
  Diamond,
  TrendingUp,
  Calendar,
  Plus,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  Megaphone,
  ExternalLink,
  Sparkles,
  Building2,
  Settings,
  Edit,
  PlusCircle,
  TicketPercent,
  Crown,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type DropType, type AdvertiserAnalyticsType } from '@/shared/types';
import {
  PerformanceMetrics,
  ActivityBreakdown,
  TrendLine,
  MultiMetricChart,
  KPICard
} from '@/react-app/components/AnalyticsCharts';
import SponsorshipModal from '@/react-app/components/SponsorshipModal';
import BrandProfileModal from '@/react-app/components/BrandProfileModal';
import Campaigns from './Campaigns';
import { apiFetch } from '@/react-app/utils/api';
import advertiserService from '@/react-app/services/advertiser';
import type { AdvertiserPlan, CouponListPayload } from '@/react-app/services/advertiser';
import UpgradePlanModal from '@/react-app/components/UpgradePlanModal';
import CouponManager from '@/react-app/components/CouponManager';
import ErrorBoundary from '@/react-app/components/ErrorBoundary';
import paymentsService from '@/react-app/services/payments';
import type { PaymentProviderSummary, PaymentProvider } from '@/react-app/services/payments';
import { PAYMENT_CONFIG } from '@/react-app/config';

const CouponManagerFallback = () => (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
    Unable to load incentive tools right now. Please refresh or try again later.
  </div>
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

interface AdvertiserInventory {
  moves_used?: number;
  proof_drops_used?: number;
  paid_drops_used?: number;
  [key: string]: number | undefined;
}

type DashboardDrop = DropType & {
  total_applications?: number;
  gems_paid?: number;
  status?: string;
};

type DashboardAnalytics = AdvertiserAnalyticsType & {
  drops_created?: number;
  total_participants?: number;
  gems_spent?: number;
  impressions?: number;
  engagement_rate?: number;
  period_start?: string;
  period_end?: string;
};

interface AdvertiserDashboardData {
  drops: DashboardDrop[];
  analytics: DashboardAnalytics[];
  user_tier: string;
  monthly_inventory?: AdvertiserInventory;
  weekly_inventory?: AdvertiserInventory;
}

interface AdvertiserUser {
  id?: string;
  user_type?: string;
  brand_name?: string;
  brand_logo_url?: string;
  brand_description?: string;
  gems_balance?: number;
  [key: string]: unknown;
}

interface SuggestedContentItem {
  id: string;
  title: string;
  platform: string;
  platform_url: string;
  suggested_package: string;
  description?: string;
  is_trending?: boolean;
  total_engagement?: number;
  engagement_rate?: number;
  roi_potential?: number;
  [key: string]: unknown;
}

type TierInfo = {
  name: string;
  color: string;
  inventory: string;
  features: string[];
};

type DashboardApiResponse =
  | { status: 'success'; data: AdvertiserDashboardData; message?: string }
  | { status: 'error'; message: string };

type SuggestedContentResponse =
  | { status: 'success'; data: SuggestedContentItem[]; message?: string }
  | { status: 'error'; message: string };

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<AdvertiserUser | null>(null);
  const [dashboardData, setDashboardData] = useState<AdvertiserDashboardData | null>(null);
  const [suggestedContent, setSuggestedContent] = useState<SuggestedContentItem[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [selectedContentForSponsorship, setSelectedContentForSponsorship] = useState<SuggestedContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [plans, setPlans] = useState<AdvertiserPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState(false);
  const [couponData, setCouponData] = useState<CouponListPayload>({
    coupons: [],
    redemptions: [],
  });
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviderSummary[]>([]);
  const [defaultPaymentProvider, setDefaultPaymentProvider] = useState<PaymentProvider>('mock');
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [paymentProviderError, setPaymentProviderError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await apiFetch('/api/users/me');

      if (!response.ok) {
        console.error('Failed to fetch user data:', response.status);
        return;
      }

      const payload = (await response.json()) as unknown;
      if (!isRecord(payload)) {
        console.error('Unexpected user payload shape');
        return;
      }

      const maybeUser = isRecord(payload.user) ? payload.user : payload;
      setUserData(maybeUser as AdvertiserUser);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load user data');
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!userData) return;

    try {
      const response = await apiFetch('/api/advertisers/dashboard');
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(`Failed to load dashboard (${response.status})`);
      }

      if (!isRecord(payload) || (payload.status !== 'success' && payload.status !== 'error')) {
        throw new Error('Invalid dashboard payload');
      }

      const result = payload as DashboardApiResponse;

      if (result.status !== 'success') {
        console.error('Dashboard payload error:', result.message);
        setDashboardData({
          drops: [],
          analytics: [],
          user_tier: userData.user_type === 'advertiser' ? userData.user_type : 'free'
        });
        return;
      }

      setDashboardData(result.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setDashboardData({
        drops: [],
        analytics: [],
        user_tier: userData.user_type === 'advertiser' ? userData.user_type : 'free'
      });
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const fetchSuggestedContent = useCallback(async () => {
    try {
      const response = await apiFetch('/api/advertisers/suggested-content');
      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(`Failed to load suggested content (${response.status})`);
      }

      if (!isRecord(payload) || (payload.status !== 'success' && payload.status !== 'error')) {
        throw new Error('Invalid suggested content payload');
      }

      const result = payload as SuggestedContentResponse;

      if (result.status !== 'success') {
        console.error('Suggested content payload error:', result.message);
        setSuggestedContent([]);
        return;
      }

      setSuggestedContent(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error('Failed to fetch suggested content:', err);
      setSuggestedContent([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const data = await advertiserService.getPlans();
      setPlans(data.plans);
      setCurrentPlanId(data.currentTier || 'free');
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const fetchPaymentProviders = useCallback(async () => {
    if (!PAYMENT_CONFIG.enabled) {
      setPaymentProviders([]);
      setDefaultPaymentProvider('mock');
      return;
    }

    setLoadingProviders(true);
    setPaymentProviderError(null);

    try {
      const summary = await paymentsService.listProviders();
      setPaymentProviders(summary.providers);
      setDefaultPaymentProvider(summary.defaultProvider);
    } catch (err) {
      console.error('Failed to fetch payment providers', err);
      setPaymentProviders([]);
      setPaymentProviderError('Unable to reach payment providers right now.');
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const data = await advertiserService.listCoupons();
      setCouponData({
        coupons: data.coupons || [],
        redemptions: data.redemptions || [],
      });
    } catch (err) {
      console.error('Failed to fetch coupons', err);
      setCouponData({ coupons: [], redemptions: [] });
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchUserData();
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    if (userData) {
      void fetchDashboardData();
      void fetchSuggestedContent();
      void fetchCoupons();
    }
  }, [userData, fetchDashboardData, fetchSuggestedContent, fetchCoupons]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        void fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, fetchUserData]);

  useEffect(() => {
    if (user) {
      void fetchUserData();
    }
  }, [location?.pathname, user, fetchUserData]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'advertiser_conversion' && e.newValue === 'true') {
        localStorage.removeItem('advertiser_conversion');
        void fetchUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserData]);

  useEffect(() => {
    if (window.location.hash === '#converted' && user) {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => {
        void fetchUserData();
      }, 500);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    if (user) {
      void fetchPlans();
      void fetchPaymentProviders();
    }
  }, [user, fetchPlans, fetchPaymentProviders]);
  const handleUpgradePlan = async (planId: string) => {
    setUpgradingPlan(true);
    try {
      const selectedPlan = plans.find((plan) => plan.id === planId);
      const readyProvider =
        paymentProviders.find((provider) => provider.enabled && provider.ready)?.provider ||
        defaultPaymentProvider;

      if (PAYMENT_CONFIG.enabled && readyProvider && readyProvider !== 'mock') {
        const checkout = await paymentsService.startCheckout({
          planId,
          provider: readyProvider,
          successUrl: `${window.location.origin}/advertiser?upgrade=success&plan=${planId}`,
          cancelUrl: `${window.location.origin}/advertiser?upgrade=cancelled`,
          metadata: {
            planName: selectedPlan?.name,
          },
        });

        if (checkout?.url && checkout.status !== 'mock') {
          setShowUpgradeModal(false);
          setUpgradingPlan(false);
          window.location.href = checkout.url;
          return;
        }
      }

      const response = await advertiserService.upgrade(planId);
      setCurrentPlanId(response?.plan?.id || planId);
      if (response?.message) {
        alert(response.message);
      }
      fetchPlans();
    } catch (err) {
      console.error('Failed to upgrade plan', err);
      alert('Unable to upgrade plan right now. Please try again later.');
    } finally {
      setUpgradingPlan(false);
      setShowUpgradeModal(false);
    }
  };

  const getTierBenefits = (tier: string): TierInfo => {
    switch (tier) {
      case 'super':
        return {
          name: 'Super Advertiser',
          color: 'text-yellow-600 bg-yellow-50',
          inventory: 'Weekly: 500 moves, 25 proof drops, 15 paid drops',
          features: [
            'Premium analytics',
            'Priority support',
            'Custom targeting',
            'Advanced reporting',
            'Create proof & paid drops'
          ]
        };
      case 'premium':
        return {
          name: 'Premium Advertiser',
          color: 'text-purple-600 bg-purple-50',
          inventory: 'Weekly: 200 moves, 15 proof drops, 8 paid drops',
          features: [
            'Advanced analytics',
            'Priority support',
            'Custom targeting',
            'Create proof & paid drops'
          ]
        };
      default:
        return {
          name: 'Free Advertiser',
          color: 'text-pr-text-2 bg-pr-surface-2',
          inventory: 'Monthly Sample: 50 moves, 5 proof drops',
          features: [
            'Basic analytics',
            'Standard support',
            'Create proof drops only',
            'Sponsor content with gems'
          ]
        };
    }
  };

  const calculateTotals = () => {
    if (!dashboardData?.drops) {
      return { totalDrops: 0, totalParticipants: 0, totalGems: 0 };
    }

    return dashboardData.drops.reduce(
      (acc, drop) => ({
        totalDrops: acc.totalDrops + 1,
        totalParticipants: acc.totalParticipants + (drop.total_applications ?? 0),
        totalGems: acc.totalGems + (drop.gem_reward_base ?? 0)
      }),
      { totalDrops: 0, totalParticipants: 0, totalGems: 0 }
    );
  };

  const generateAnalyticsData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        applications: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 20) + 5,
        impressions: Math.floor(Math.random() * 1000) + 200,
        clicks: Math.floor(Math.random() * 100) + 20,
        spent: Math.floor(Math.random() * 500) + 100,
        participants: Math.floor(Math.random() * 30) + 5
      };
    });
    return last30Days;
  };

  const analyticsData = dashboardData?.analytics?.map(a => ({
    date: a.period_start.split('T')[0],
    applications: a.total_participants || 0,
    conversions: a.conversions || 0,
    impressions: a.impressions || 0,
    clicks: a.total_participants * 0.1 || 0, // Simplified estimate
    spent: a.gems_spent || 0,
    participants: a.total_participants || 0
  })) || [];

  // Fallback for new advertisers with no data yet
  const displayAnalytics = analyticsData.length > 0 ? analyticsData : generateAnalyticsData();
  const campaignPerformance = [
    { metric: 'Click-through Rate', value: 4.2 },
    { metric: 'Conversion Rate', value: 12.8 },
    { metric: 'Engagement Rate', value: 8.5 },
    { metric: 'Application Rate', value: 15.3 },
    { metric: 'Completion Rate', value: 78.9 }
  ];
  const dropTypeBreakdown = [
    { name: 'Content Creation', value: 45, color: '#f97316' },
    { name: 'Social Sharing', value: 30, color: '#8b5cf6' },
    { name: 'Reviews', value: 15, color: '#10b981' },
    { name: 'Surveys', value: 10, color: '#3b82f6' }
  ];

  const tierInfo = getTierBenefits(dashboardData?.user_tier || 'free');
  const totals = calculateTotals();
  const paymentProviderName = (provider: PaymentProvider) => {
    switch (provider) {
      case 'stripe':
        return 'Stripe';
      case 'coinbase':
        return 'Coinbase Commerce';
      default:
        return 'Mock';
    }
  };

  const paymentProviderStatus = (provider: PaymentProviderSummary) => {
    if (!provider.enabled) {
      return 'Disabled';
    }
    return provider.ready ? 'Ready' : 'Configured';
  };

  const handleSponsorContent = (content: SuggestedContentItem) => setSelectedContentForSponsorship(content);

  const getPackageDetails = (packageId: string) => {
    const packages = {
      'quick-boost': { name: 'Quick Boost', gems: 25, hours: 1, multiplier: 1.5 },
      'popular-boost': { name: 'Popular Boost', gems: 50, hours: 6, multiplier: 2.0 },
      'daily-featured': { name: 'Daily Feature', gems: 100, hours: 24, multiplier: 3.0 },
      'premium-spotlight': { name: 'Premium Spotlight', gems: 200, hours: 72, multiplier: 4.0 },
      'viral-campaign': { name: 'Viral Campaign', gems: 500, hours: 168, multiplier: 6.0 }
    };
    return packages[packageId as keyof typeof packages] || packages['quick-boost'];
  };

  const handleSaveBrandProfile = async (brandData: Record<string, unknown>) => {
    setSavingBrand(true);
    try {
      const response = await fetch('/api/users/brand-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(brandData)
      });

      if (response.ok) {
        setShowBrandModal(false);
        fetchUserData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save brand profile');
      }
    } catch (err) {
      console.error('Error saving brand profile:', err);
      alert('Failed to save brand profile');
    } finally {
      setSavingBrand(false);
    }
  };

  const isCampaignsView =
    location.pathname === '/advertiser/campaigns' ||
    location.pathname.startsWith('/advertiser/campaigns/') ||
    location.pathname === '/campaigns' ||
    location.pathname.startsWith('/campaigns/');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  if (userData.user_type !== 'advertiser') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Megaphone className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Become an Advertiser</h2>
          <p className="text-blue-700 mb-6 max-w-md mx-auto">
            Your account is not yet set up for advertising. Click below to become an advertiser and start creating
            marketing campaigns.
          </p>
          <Link
            to="/advertiser/onboarding"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Become an Advertiser
          </Link>
          <p className="text-sm text-pr-text-2 mt-4">
            Free to get started • No setup fees • Create your first campaign
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-pr-text-1 mb-2">Loading Dashboard...</h3>
        <p className="text-pr-text-2">Please wait while we load your advertiser dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCampaignsView ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-pr-text-1">Campaigns</h2>
              <p className="text-sm text-pr-text-2">Manage your marketing campaigns and track performance</p>
            </div>
            <Button
              onClick={() => navigate('/campaigns/new')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Campaign</span>
            </Button>
          </div>
          <Campaigns showHeader={false} basePath="/advertiser/campaigns" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                {userData?.brand_name ? (
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-pr-surface-2 rounded-xl flex items-center justify-center overflow-hidden border border-pr-surface-3">
                      {userData?.brand_logo_url ? (
                        <img
                          src={userData.brand_logo_url}
                          alt="Brand logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-3xl font-bold text-pr-text-1">{userData.brand_name}</h1>
                        <button
                          onClick={() => setShowBrandModal(true)}
                          className="text-gray-400 hover:text-pr-text-2 transition-colors"
                          title="Edit brand profile"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-pr-text-2">
                        {userData?.brand_description || 'Manage your campaigns and track performance'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-3xl font-bold text-pr-text-1">Advertiser Dashboard</h1>
                      <button
                        onClick={() => setShowBrandModal(true)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Set up brand</span>
                      </button>
                    </div>
                    <p className="text-pr-text-2 mt-2">Manage your campaigns and track performance</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg ${tierInfo.color}`}>
                <span className="font-medium">{tierInfo.name}</span>
              </div>
              <button
                onClick={() => setShowBrandModal(true)}
                className="text-gray-400 hover:text-pr-text-2 transition-colors p-2 rounded-lg hover:bg-pr-surface-2"
                title="Brand settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subscription Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-sm font-medium text-blue-600">
                    <Crown className="h-4 w-4" />
                    <span>Advertiser Plan</span>
                  </div>
                  <h3 className="mt-1 text-2xl font-semibold text-pr-text-1 capitalize">
                    {currentPlanId}
                  </h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Unlock larger incentive budgets, deeper analytics, and leaderboards targeting with Premium plans.
                  </p>
                </div>
                <div className="text-right text-sm text-blue-700">
                  {loadingPlans ? (
                    <div className="flex items-center space-x-1 text-xs text-blue-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Loading plans…</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-purple-600"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>

              {plans.length > 0 && (
                <ul className="mt-4 grid gap-2 text-sm text-blue-800 md:grid-cols-2">
                  {plans
                    .find((plan) => plan.id === currentPlanId)?.features
                    ?.slice(0, 4)
                    .map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <span>{feature}</span>
                      </li>
                    )) || (
                      <li className="text-sm text-blue-700">
                        Compare plans to see everything you unlock.
                      </li>
                    )}
                </ul>
              )}

              <div className="mt-6 rounded-xl border border-blue-100 bg-pr-surface-card/70 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Payment Providers</span>
                  {loadingProviders ? (
                    <span className="flex items-center space-x-1 text-blue-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Checking…</span>
                    </span>
                  ) : null}
                </div>

                {!PAYMENT_CONFIG.enabled ? (
                  <p className="mt-3 text-sm text-blue-600">
                    Payments are currently disabled. Our team will process upgrades manually.
                  </p>
                ) : paymentProviderError ? (
                  <p className="mt-3 text-sm text-red-600">{paymentProviderError}</p>
                ) : paymentProviders.length === 0 ? (
                  <p className="mt-3 text-sm text-blue-600">No payment providers configured yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {paymentProviders.map((provider) => (
                      <li
                        key={provider.provider}
                        className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700"
                      >
                        <div>
                          <span className="font-semibold">{paymentProviderName(provider.provider)}</span>
                          {defaultPaymentProvider === provider.provider && (
                            <span className="ml-2 rounded-full bg-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              Default
                            </span>
                          )}
                          {provider.publishableKey && (
                            <span className="block text-xs text-blue-500">
                              Key • {provider.publishableKey.slice(0, 12)}…
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            provider.enabled ? 'text-emerald-600' : 'text-pr-text-2'
                          }`}
                        >
                          {paymentProviderStatus(provider)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-pr-surface-card p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-sm font-medium text-purple-600">
                    <TicketPercent className="h-4 w-4" />
                    <span>Giveaways & Coupons</span>
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-pr-text-1">Incentive Highlights</h3>
                  <p className="mt-2 text-sm text-pr-text-2">
                    Design rewards for top leaderboard performers or attach coupons directly to high-value drops.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-pr-text-2 md:grid-cols-2">
                <div className="rounded-lg bg-purple-50 px-3 py-2">
                  <p className="font-medium text-purple-700">Leaderboard Incentives</p>
                  <p>Deliver exclusive rewards automatically to top ranked creators.</p>
                </div>
                <div className="rounded-lg bg-purple-50 px-3 py-2">
                  <p className="font-medium text-purple-700">Drop Attachments</p>
                  <p>Motivate applicants with coupons and giveaways baked into campaign briefs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-pr-surface-card rounded-xl p-6 shadow-sm border border-pr-surface-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-pr-text-1">Sample Inventory</h3>
                  <p className="text-sm text-pr-text-2">
                    Use monthly samples to test promotions before upgrading
                  </p>
                </div>
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
                  Monthly
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                  <h4 className="text-sm font-medium text-pr-text-2">Moves</h4>
                  <p className="text-xl font-semibold text-pr-text-1">
                    {dashboardData?.monthly_inventory?.moves_used ?? 0}/50
                  </p>
                </div>
                <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                  <h4 className="text-sm font-medium text-pr-text-2">Proof Drops</h4>
                  <p className="text-xl font-semibold text-pr-text-1">
                    {dashboardData?.monthly_inventory?.proof_drops_used ?? 0}/5
                  </p>
                </div>
                <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                  <h4 className="text-sm font-medium text-pr-text-2">Paid Drops</h4>
                  <p className="text-xl font-semibold text-pr-text-1">Upgrade</p>
                </div>
              </div>
            </div>

            <div className="bg-pr-surface-card rounded-xl p-6 shadow-sm border border-pr-surface-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-pr-text-1">Weekly Allocation</h3>
                  <p className="text-sm text-pr-text-2">Upgrade to unlock weekly inventory packs</p>
                </div>
                <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                  Upgrade
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                  <h4 className="text-sm font-medium text-pr-text-2">Moves</h4>
                  <p className="text-xl font-semibold text-pr-text-1">200</p>
                  <span className="text-xs text-pr-text-2">Premium tier</span>
                </div>
                <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                  <h4 className="text-sm font-medium text-pr-text-2">Proof Drops</h4>
                  <p className="text-xl font-semibold text-pr-text-1">15</p>
                </div>
                <div className="text-center p-3 bg-pr-surface-2 rounded-lg">
                  <h4 className="text-sm font-medium text-pr-text-2">Paid Drops</h4>
                  <p className="text-xl font-semibold text-pr-text-1">8</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Drops"
              value={totals.totalDrops}
              change={12}
              changeType="increase"
              icon={<BarChart3 className="w-5 h-5" />}
              trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: Math.floor(Math.random() * 20) + 5 }))}
            />
            <KPICard
              title="Total Participants"
              value={totals.totalParticipants.toLocaleString()}
              change={8}
              changeType="increase"
              icon={<Users className="w-5 h-5" />}
              trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: d.participants }))}
            />
            <KPICard
              title="Gems Distributed"
              value={totals.totalGems.toFixed(1)}
              change={15}
              changeType="increase"
              icon={<Diamond className="w-5 h-5" />}
              trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: d.spent }))}
            />
            <KPICard
              title="Avg. Engagement"
              value={`${dashboardData.analytics.length > 0
                ? (
<<<<<<< HEAD:frontend/src/react-app/pages/AdvertiserDashboard.tsx
                  dashboardData.analytics.reduce(
                    (sum, a) => sum + (a.engagement_rate || 0),
                    0
                  ) / dashboardData.analytics.length
                ).toFixed(1)
=======
                    dashboardData.analytics.reduce(
                      (sum, a) => sum + (a.engagement_rate ?? 0),
                      0
                    ) / dashboardData.analytics.length
                  ).toFixed(1)
>>>>>>> feature/error-handling-updates:apps/web/src/react-app/pages/AdvertiserDashboard.tsx
                : '8.5'}%`}
              change={analyticsData.length > 0 ? 0 : 3}
              changeType="increase"
              icon={<TrendingUp className="w-5 h-5" />}
              trend={displayAnalytics.slice(-7).map(d => ({ date: d.date, value: d.applications }))}
            />
          </div>

          {/* Suggested Content */}
          <div className="bg-pr-surface-card rounded-xl shadow-sm border border-pr-surface-3">
            <div className="p-6 border-b border-pr-surface-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pr-text-1">Suggested Content to Sponsor</h3>
                    <p className="text-sm text-pr-text-2">High-performing content perfect for your brand</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-pr-text-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Last updated just now</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingSuggestions ? (
                <div className="text-center py-8 text-pr-text-2">Loading suggestions...</div>
              ) : suggestedContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedContent.slice(0, 6).map(content => {
                    const packageDetails = getPackageDetails(content.suggested_package);
                    return (
                      <div key={content.id} className="border border-pr-surface-3 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                {content.platform}
                              </span>
                              {content.is_trending && (
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                  Trending
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-pr-text-1">{content.title}</h4>
                            <p className="text-sm text-pr-text-2 line-clamp-2 mt-1">{content.description}</p>
                          </div>
                          <button
                            className="text-gray-400 hover:text-pr-text-2 transition-colors"
                            onClick={() => window.open(content.platform_url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center text-sm mb-3">
                          <div>
                            <p className="font-semibold text-pr-text-1">{content.total_engagement}</p>
                            <p className="text-xs text-pr-text-2">Engagement</p>
                          </div>
                          <div>
                            <p className="font-semibold text-pr-text-1">{content.engagement_rate}%</p>
                            <p className="text-xs text-pr-text-2">Eng. Rate</p>
                          </div>
                          <div>
                            <p className="font-semibold text-pr-text-1">{content.roi_potential}%</p>
                            <p className="text-xs text-pr-text-2">ROI Potential</p>
                          </div>
                        </div>

                        <div className="bg-pr-surface-2 rounded-lg p-3 mb-3">
                          <div className="text-xs text-pr-text-2 mb-1">Suggested Package:</div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-pr-text-1">{packageDetails.name}</div>
                              <div className="text-xs text-pr-text-2">
                                {packageDetails.hours}h • {packageDetails.multiplier}x boost
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-purple-600 font-semibold">
                              <Diamond className="w-3 h-3" />
                              <span>{packageDetails.gems}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSponsorContent(content)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                        >
                          Sponsor This Content
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-pr-text-1 mb-2">No suggestions available</h4>
                  <p className="text-pr-text-2">We'll find great content for you to sponsor soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-pr-text-1">Campaign Performance</h3>
                <div className="flex items-center space-x-2 text-sm text-pr-text-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last 30 days</span>
                </div>
              </div>
              <MultiMetricChart
                data={displayAnalytics}
                height={300}
                metrics={[
                  { key: 'applications', name: 'Applications', color: '#f97316' },
                  { key: 'conversions', name: 'Conversions', color: '#10b981' },
                  { key: 'clicks', name: 'Clicks', color: '#3b82f6' }
                ]}
              />
            </div>

            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
              <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Drop Type Distribution</h3>
              <ActivityBreakdown data={dropTypeBreakdown} height={300} />
            </div>

            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
              <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Key Performance Indicators</h3>
              <PerformanceMetrics data={campaignPerformance} height={300} />
            </div>

            <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
              <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Spending & Engagement Trends</h3>
              <TrendLine
                data={analyticsData.map(d => ({
                  date: d.date,
                  value: d.spent,
                  secondary: d.impressions / 10
                }))}
                height={300}
                primaryKey="value"
                secondaryKey="secondary"
                primaryColor="#f97316"
                secondaryColor="#8b5cf6"
              />
            </div>
          </div>

          {loadingCoupons ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-12">
              <div className="flex flex-col items-center space-y-3 text-purple-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm font-medium">Loading incentive toolkit…</p>
              </div>
            </div>
          ) : (
            <ErrorBoundary fallback={<CouponManagerFallback />}>
              <CouponManager
                coupons={couponData.coupons}
                redemptions={couponData.redemptions}
                drops={dashboardData.drops}
                onRefresh={fetchCoupons}
              />
            </ErrorBoundary>
          )}

          {/* Real-time Metrics */}
          <div className="bg-pr-surface-card rounded-xl p-6 border border-pr-surface-3 shadow-sm">
            <h3 className="text-lg font-semibold text-pr-text-1 mb-6">Real-time Campaign Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">24.3K</p>
                <p className="text-sm text-blue-600">Impressions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MousePointer className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">1.2K</p>
                <p className="text-sm text-green-600">Clicks</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">156</p>
                <p className="text-sm text-purple-600">Applications</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">89</p>
                <p className="text-sm text-orange-600">Conversions</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900">$0.78</p>
                <p className="text-sm text-yellow-600">Cost/Convert</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-900">4.2%</p>
                <p className="text-sm text-red-600">CTR</p>
              </div>
            </div>
          </div>

          {/* Recent Drops */}
          <div className="bg-pr-surface-card rounded-xl shadow-sm border border-pr-surface-3">
            <div className="p-6 border-b border-pr-surface-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pr-text-1">Recent Drops</h3>
                {userData?.user_type === 'advertiser' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = '/earn?create=proof'}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Proof Drop</span>
                    </button>
                    {dashboardData?.user_tier !== 'free' && (
                      <button
                        onClick={() => window.location.href = '/earn?create=paid'}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Paid Drop</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {dashboardData.drops.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.drops.slice(0, 5).map((drop) => (
                    <div key={drop.id} className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-pr-text-1">{drop.title}</h4>
                        <p className="text-sm text-pr-text-2 mt-1">{drop.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-pr-text-2">
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{drop.total_applications} applicants</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Diamond className="w-4 h-4" />
                            <span>{drop.gem_reward_base} gems</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(drop.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
<<<<<<< HEAD:frontend/src/react-app/pages/AdvertiserDashboard.tsx
                          className={`px-3 py-1 rounded-full text-xs font-medium ${drop.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                            }`}
=======
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            drop.status === 'active' ? 'text-green-600 bg-green-100' : 'text-pr-text-2 bg-pr-surface-2'
                          }`}
>>>>>>> feature/error-handling-updates:apps/web/src/react-app/pages/AdvertiserDashboard.tsx
                        >
                          {drop.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-pr-text-1 mb-2">No drops yet</h4>
                  <p className="text-pr-text-2 mb-4">Create your first drop to start engaging with creators.</p>
                  {userData?.user_type === 'advertiser' && (
                    <button
                      onClick={() => window.location.href = '/earn?create=proof'}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Create Your First Drop
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Analytics Table */}
          {dashboardData.analytics.length > 0 && (
            <div className="bg-pr-surface-card rounded-xl shadow-sm border border-pr-surface-3">
              <div className="p-6 border-b border-pr-surface-3">
                <h3 className="text-lg font-semibold text-pr-text-1">Performance Analytics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pr-surface-2">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                        Drops
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                        Gems Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                        Impressions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-pr-text-2 uppercase tracking-wider">
                        Engagement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-pr-surface-card divide-y divide-gray-200">
                    {dashboardData.analytics.slice(0, 10).map((analytics) => (
                      <tr key={analytics.id} className="hover:bg-pr-surface-2">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">
                          {new Date(analytics.period_start).toLocaleDateString()} -{' '}
                          {new Date(analytics.period_end).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">{analytics.drops_created ?? 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">{analytics.total_participants ?? 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">
                          {(analytics.gems_spent ?? 0).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">
                          {(analytics.impressions ?? 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-pr-text-1">
                          {(analytics.engagement_rate ?? 0).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {selectedContentForSponsorship && (
        <SponsorshipModal
          isOpen={true}
          onClose={() => setSelectedContentForSponsorship(null)}
          onSponsor={async (gemAmount: number, boostMultiplier: number, durationHours: number) => {
            if (!selectedContentForSponsorship) {
              return;
            }

            try {
              const response = await fetch('/api/content/sponsor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  contentId: selectedContentForSponsorship.id,
                  gemAmount,
                  boostMultiplier,
                  durationHours
                })
              });

              if (response.ok) {
                setSelectedContentForSponsorship(null);
                fetchSuggestedContent();
              } else {
                console.error('Failed to sponsor content');
              }
            } catch (err) {
              console.error('Error sponsoring content:', err);
            }
          }}
          contentTitle={selectedContentForSponsorship.title}
          userGems={userData?.gems_balance ?? 0}
        />
      )}

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        plans={plans}
        currentTier={currentPlanId}
        onSelect={handleUpgradePlan}
        isSubmitting={upgradingPlan}
      />

      <BrandProfileModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSave={handleSaveBrandProfile}
        currentBrandData={userData ?? undefined}
        loading={savingBrand}
      />
    </div>
  );
}
