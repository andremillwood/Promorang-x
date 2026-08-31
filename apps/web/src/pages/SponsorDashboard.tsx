import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import {
  DollarSign,
  TrendingUp,
  Users,
  Trophy,
  Plus,
  ChevronRight,
  Wallet,
  BarChart3,
  Target,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gift,
  Megaphone,
  Crown
} from 'lucide-react';

interface SponsorConfig {
  tiers: Record<string, {
    min_pool: number;
    max_pool: number;
    platform_fee_percent: number;
    max_winners: number;
    min_win_value: number;
    duration_days: number;
  }>;
  placements: Record<string, {
    price: number;
    duration_days?: number;
    per_send?: boolean;
    per_pool?: boolean;
  }>;
}

interface Pool {
  id: string;
  cycle_type: string;
  cycle_name: string;
  status: string;
  start_at: string;
  end_at: string;
  sponsor_config: {
    total_paid: number;
    platform_fee: number;
    prize_pool: number;
    payment_status: string;
    brand_message?: string;
  };
  metrics?: {
    total_spend: number;
    qualified_users: number;
    projected_cac: number;
  };
}

interface CostBreakdown {
  breakdown: {
    prize_pool: number;
    platform_fee: number;
    platform_fee_percent: number;
    placements: number;
    category_premium: number;
    total: number;
  };
  projections: {
    min_winners: number;
    max_winners: number;
    avg_winners: number;
    avg_prize_per_winner: number;
    duration_days: number;
  };
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.promorang.co/api';

const TIER_KEYS: Record<string, TranslationKey> = {
  daily: "sponsorDash.tierDaily",
  weekly: "sponsorDash.tierWeekly",
  monthly: "sponsorDash.tierMonthly",
  grand: "sponsorDash.tierGrand",
};

const STATUS_KEYS: Record<string, TranslationKey> = {
  active: "sponsorDash.statusActive",
  draft: "sponsorDash.statusDraft",
  completed: "sponsorDash.statusCompleted",
  settling: "sponsorDash.statusSettling",
};

const SponsorDashboard = () => {
  const { t, formatNumber, formatDate } = useI18n();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<SponsorConfig | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostBreakdown | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Check for payment return params
  const paymentStatus = searchParams.get('payment');
  const poolIdFromUrl = searchParams.get('pool_id');

  // New pool form
  const [newPool, setNewPool] = useState({
    tier: 'weekly',
    pool_amount: 500,
    cycle_name: '',
    brand_message: '',
    placements: [] as string[],
    targeting: {
      exclusive_category: false,
      category: ''
    }
  });

  useEffect(() => {
    fetchConfig();
    fetchPools();

    // Handle payment return
    if (paymentStatus === 'success' && poolIdFromUrl) {
      toast.success(t("sponsorDash.toastPaid"));
      // Refresh pools to show updated status
      setTimeout(() => fetchPools(), 1000);
    } else if (paymentStatus === 'cancel' && poolIdFromUrl) {
      toast.error(t("sponsorDash.toastCancelled"));
    }
  }, [paymentStatus, poolIdFromUrl, t]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/promoshare/sponsors/config`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setConfig(result.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchPools = async () => {
    try {
      const response = await fetch(`${API_BASE}/promoshare/sponsors/pools`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const result = await response.json();
      if (result.success) {
        setPools(result.data);
      }
    } catch (error) {
      console.error('Error fetching pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    setCalculating(true);
    try {
      const response = await fetch(`${API_BASE}/promoshare/sponsors/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: newPool.tier,
          pool_amount: newPool.pool_amount,
          placements: newPool.placements.map(p => ({ type: p })),
          targeting: newPool.targeting
        })
      });
      const result = await response.json();
      if (result.success) {
        setCostEstimate(result.data);
      }
    } catch (error) {
      toast.error(t("sponsorDash.toastCalc"));
    } finally {
      setCalculating(false);
    }
  };

  const createPool = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/promoshare/sponsors/pools`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: newPool.tier,
          pool_amount: newPool.pool_amount,
          cycle_name: newPool.cycle_name,
          brand_message: newPool.brand_message,
          placements: newPool.placements
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(t("sponsorDash.toastCreated"));
        // Initiate payment immediately
        await initiatePayment(result.data.cycle.id);
      } else {
        toast.error(result.error || t("sponsorDash.toastCreateFail"));
      }
    } catch (error) {
      toast.error(t("sponsorDash.toastCreateFail"));
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (poolId: string) => {
    setProcessingPayment(poolId);
    try {
      const response = await fetch(`/api/promoshare/sponsors/pools/${poolId}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success && result.data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.checkout_url;
      } else {
        toast.error(result.error || t("sponsorDash.toastPayFail"));
        setProcessingPayment(null);
      }
    } catch (error) {
      toast.error(t("sponsorDash.toastPayFail"));
      setProcessingPayment(null);
    }
  };

  const checkPaymentStatus = async (poolId: string) => {
    try {
      const response = await fetch(`/api/promoshare/sponsors/pools/${poolId}/payment-status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      const result = await response.json();
      if (result.success) {
        return result.data.payment_status;
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
    return null;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-green-500';
      case 'monthly': return 'bg-purple-500';
      case 'grand': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'completed': return 'bg-blue-500';
      case 'settling': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const tierLabel = (tier: string) => (TIER_KEYS[tier] ? t(TIER_KEYS[tier]) : tier);
  const statusLabel = (status: string) => (STATUS_KEYS[status] ? t(STATUS_KEYS[status]) : status);

  const totalSpend = pools.reduce((sum, p) => sum + (p.sponsor_config?.total_paid || 0), 0);
  const activePools = pools.filter(p => p.status === 'active').length;

  if (loading && pools.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t("sponsorDash.title")}</h1>
            <p className="text-muted-foreground">{t("sponsorDash.lede")}</p>
          </div>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="w-4 h-4 mr-2" />
          {t("sponsorDash.create")}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("sponsorDash.totalSpend")}</p>
                <p className="text-2xl font-bold">${formatNumber(totalSpend)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("sponsorDash.activePools")}</p>
                <p className="text-2xl font-bold">{activePools}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("sponsorDash.totalPools")}</p>
                <p className="text-2xl font-bold">{pools.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("sponsorDash.avgSize")}</p>
                <p className="text-2xl font-bold">
                  {pools.length ? `$${formatNumber(Math.round(totalSpend / pools.length))}` : '$0'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="overview">{t("sponsorDash.tabOverview")}</TabsTrigger>
          <TabsTrigger value="pools">{t("sponsorDash.tabPools")}</TabsTrigger>
          <TabsTrigger value="create">{t("sponsorDash.tabCreate")}</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sponsorDash.howTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{t("sponsorDash.step1")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("sponsorDash.step1Copy")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{t("sponsorDash.step2")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("sponsorDash.step2Copy")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{t("sponsorDash.step3")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("sponsorDash.step3Copy")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{t("sponsorDash.step4")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("sponsorDash.step4Copy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle>{t("sponsorDash.tiersTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(config.tiers).map(([tier, tierConfig]) => (
                    <Card key={tier} className="border-2 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => {
                        setNewPool({ ...newPool, tier });
                        setActiveTab('create');
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-3 h-3 rounded-full ${getTierColor(tier)}`} />
                          <h4 className="font-semibold capitalize">{tierLabel(tier)}</h4>
                        </div>
                        <p className="text-2xl font-bold mb-1">
                          ${tierConfig.min_pool}-{tierConfig.max_pool}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t("sponsorDash.dayCycle", { count: tierConfig.duration_days })}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>{t("sponsorDash.platformFee", { pct: tierConfig.platform_fee_percent })}</p>
                          <p>{t("sponsorDash.maxWinners", { count: tierConfig.max_winners })}</p>
                          <p>{t("sponsorDash.minPrize", { amount: tierConfig.min_win_value })}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          {t("sponsorDash.select")} <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* POOLS TAB */}
        <TabsContent value="pools">
          <div className="space-y-4">
            {pools.map((pool) => (
              <Card key={pool.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getTierColor(pool.cycle_type)}>
                        {tierLabel(pool.cycle_type)}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">{pool.cycle_name}</CardTitle>
                        <CardDescription>
                          {formatDate(pool.start_at)} - {formatDate(pool.end_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(pool.status)}>
                      {statusLabel(pool.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("sponsorDash.totalPaid")}</p>
                      <p className="text-xl font-bold">${formatNumber(pool.sponsor_config?.total_paid || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("sponsorDash.fee")}</p>
                      <p className="text-xl font-bold">${formatNumber(pool.sponsor_config?.platform_fee || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("sponsorDash.prizePool")}</p>
                      <p className="text-xl font-bold text-primary">
                        ${formatNumber(pool.sponsor_config?.prize_pool || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("sponsorDash.qualified")}</p>
                      <p className="text-xl font-bold">{pool.metrics?.qualified_users || 0}</p>
                    </div>
                  </div>
                  {pool.sponsor_config?.brand_message && (
                    <div className="p-3 bg-muted rounded-lg mb-4">
                      <p className="text-sm text-muted-foreground">{t("sponsorDash.brandMessage")}</p>
                      <p className="font-medium">{pool.sponsor_config.brand_message}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {t("sponsorDash.analytics")}
                    </Button>
                    {pool.status === 'draft' && pool.sponsor_config?.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => initiatePayment(pool.id)}
                        disabled={processingPayment === pool.id}
                      >
                        {processingPayment === pool.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {t("sponsorDash.processing")}
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            {t("sponsorDash.completePay", { amount: pool.sponsor_config?.total_paid || 0 })}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {pools.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("sponsorDash.emptyTitle")}</h3>
                  <p className="text-muted-foreground mb-4">{t("sponsorDash.emptyCopy")}</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("sponsorDash.create")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* CREATE TAB */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pool Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>{t("sponsorDash.configTitle")}</CardTitle>
                <CardDescription>{t("sponsorDash.configDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("sponsorDash.poolTier")}</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newPool.tier}
                    onChange={(e) => {
                      setNewPool({ ...newPool, tier: e.target.value });
                      setCostEstimate(null);
                    }}
                  >
                    {config?.tiers && Object.entries(config.tiers).map(([tier, tierConfig]) => (
                      <option key={tier} value={tier}>
                        {t("sponsorDash.tierOption", {
                          tier: tierLabel(tier),
                          min: tierConfig.min_pool,
                          max: tierConfig.max_pool,
                          days: tierConfig.duration_days,
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{t("sponsorDash.poolAmount")}</Label>
                  <Input
                    type="number"
                    min={config?.tiers?.[newPool.tier]?.min_pool || 50}
                    max={config?.tiers?.[newPool.tier]?.max_pool || 25000}
                    value={newPool.pool_amount}
                    onChange={(e) => {
                      setNewPool({ ...newPool, pool_amount: parseInt(e.target.value) || 0 });
                      setCostEstimate(null);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("sponsorDash.minMax", {
                      min: config?.tiers?.[newPool.tier]?.min_pool ?? 0,
                      max: config?.tiers?.[newPool.tier]?.max_pool ?? 0,
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("sponsorDash.poolName")}</Label>
                  <Input
                    placeholder={t("sponsorDash.poolNamePh")}
                    value={newPool.cycle_name}
                    onChange={(e) => setNewPool({ ...newPool, cycle_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("sponsorDash.brandMsg")}</Label>
                  <Input
                    placeholder={t("sponsorDash.brandMsgPh")}
                    value={newPool.brand_message}
                    onChange={(e) => setNewPool({ ...newPool, brand_message: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>{t("sponsorDash.placements")}</Label>
                  {config?.placements && Object.entries(config.placements).map(([key, placement]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          ${placement.price}{placement.per_send ? t("sponsorDash.perSend") : placement.duration_days ? t("sponsorDash.perDays", { days: placement.duration_days }) : ''}
                        </p>
                      </div>
                      <Switch
                        checked={newPool.placements.includes(key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewPool({ ...newPool, placements: [...newPool.placements, key] });
                          } else {
                            setNewPool({ ...newPool, placements: newPool.placements.filter(p => p !== key) });
                          }
                          setCostEstimate(null);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={calculateCost}
                  disabled={calculating}
                >
                  {calculating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t("sponsorDash.calculating")}
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {t("sponsorDash.calculate")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t("sponsorDash.costTitle")}</CardTitle>
                <CardDescription>{t("sponsorDash.costDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {costEstimate ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">{t("sponsorDash.totalCost")}</p>
                      <p className="text-3xl font-bold">${formatNumber(costEstimate.breakdown.total)}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>{t("sponsorDash.prizeLine")}</span>
                        <span className="font-medium">${formatNumber(costEstimate.breakdown.prize_pool)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>{t("sponsorDash.feeLine", { pct: costEstimate.breakdown.platform_fee_percent })}</span>
                        <span className="font-medium">${formatNumber(costEstimate.breakdown.platform_fee)}</span>
                      </div>
                      {costEstimate.breakdown.placements > 0 && (
                        <div className="flex justify-between py-2 border-b">
                          <span>{t("sponsorDash.placementsLine")}</span>
                          <span className="font-medium">${formatNumber(costEstimate.breakdown.placements)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">{t("sponsorDash.projected")}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">{costEstimate.projections.min_winners}-{costEstimate.projections.max_winners}</p>
                          <p className="text-xs text-muted-foreground">{t("sponsorDash.winners")}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">${costEstimate.projections.avg_prize_per_winner}</p>
                          <p className="text-xs text-muted-foreground">{t("sponsorDash.avgPrize")}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">{costEstimate.projections.duration_days}</p>
                          <p className="text-xs text-muted-foreground">{t("sponsorDash.days")}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">${Math.round(costEstimate.breakdown.total / costEstimate.projections.avg_winners)}</p>
                          <p className="text-xs text-muted-foreground">{t("sponsorDash.costPerWinner")}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={createPool}
                      disabled={!newPool.cycle_name || loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {t("sponsorDash.creating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t("sponsorDash.createCost", { amount: formatNumber(costEstimate.breakdown.total) })}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t("sponsorDash.clickCalc")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SponsorDashboard;
