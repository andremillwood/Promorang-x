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

const SponsorDashboard = () => {
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
      toast.success('Payment successful! Your pool is now active.');
      // Refresh pools to show updated status
      setTimeout(() => fetchPools(), 1000);
    } else if (paymentStatus === 'cancel' && poolIdFromUrl) {
      toast.error('Payment was cancelled. Your pool remains in draft.');
    }
  }, [paymentStatus, poolIdFromUrl]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/promoshare/sponsors/config', {
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
      const response = await fetch('/api/promoshare/sponsors/pools', {
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
      const response = await fetch('/api/promoshare/sponsors/calculate', {
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
      toast.error('Failed to calculate cost');
    } finally {
      setCalculating(false);
    }
  };

  const createPool = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/promoshare/sponsors/pools', {
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
        toast.success('Pool created! Redirecting to payment...');
        // Initiate payment immediately
        await initiatePayment(result.data.cycle.id);
      } else {
        toast.error(result.error || 'Failed to create pool');
      }
    } catch (error) {
      toast.error('Failed to create pool');
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
        toast.error(result.error || 'Failed to initiate payment');
        setProcessingPayment(null);
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
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
            <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
            <p className="text-muted-foreground">Create and manage PromoShare prize pools</p>
          </div>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Pool
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">${totalSpend.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Active Pools</p>
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
                <p className="text-sm text-muted-foreground">Total Pools</p>
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
                <p className="text-sm text-muted-foreground">Avg. Pool Size</p>
                <p className="text-2xl font-bold">
                  {pools.length ? `$${Math.round(totalSpend / pools.length)}` : '$0'}
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pools">My Pools</TabsTrigger>
          <TabsTrigger value="create">Create Pool</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How PromoShare Sponsorship Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Fund Pool</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose tier (daily to grand) and set your prize amount
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Target Users</h4>
                  <p className="text-sm text-muted-foreground">
                    Select categories, locations, and engagement requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Users Qualify</h4>
                  <p className="text-sm text-muted-foreground">
                    Active users complete verified actions to enter your pool
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">4. Winners Selected</h4>
                  <p className="text-sm text-muted-foreground">
                    Tiered distribution ensures fairness. You get detailed analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle>Pool Tiers & Pricing</CardTitle>
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
                          <h4 className="font-semibold capitalize">{tier}</h4>
                        </div>
                        <p className="text-2xl font-bold mb-1">
                          ${tierConfig.min_pool}-${tierConfig.max_pool}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {tierConfig.duration_days} day cycle
                        </p>
                        <div className="space-y-1 text-sm">
                          <p><strong>{tierConfig.platform_fee_percent}%</strong> platform fee</p>
                          <p><strong>{tierConfig.max_winners}</strong> max winners</p>
                          <p><strong>${tierConfig.min_win_value}</strong> min prize</p>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          Select <ChevronRight className="w-4 h-4 ml-1" />
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
                        {pool.cycle_type}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">{pool.cycle_name}</CardTitle>
                        <CardDescription>
                          {new Date(pool.start_at).toLocaleDateString()} - {new Date(pool.end_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(pool.status)}>
                      {pool.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-xl font-bold">${pool.sponsor_config?.total_paid?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Platform Fee</p>
                      <p className="text-xl font-bold">${pool.sponsor_config?.platform_fee?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prize Pool</p>
                      <p className="text-xl font-bold text-primary">
                        ${pool.sponsor_config?.prize_pool?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Qualified Users</p>
                      <p className="text-xl font-bold">{pool.metrics?.qualified_users || 0}</p>
                    </div>
                  </div>
                  {pool.sponsor_config?.brand_message && (
                    <div className="p-3 bg-muted rounded-lg mb-4">
                      <p className="text-sm text-muted-foreground">Brand Message:</p>
                      <p className="font-medium">{pool.sponsor_config.brand_message}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
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
                            Processing...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Complete Payment (${pool.sponsor_config?.total_paid || 0})
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
                  <h3 className="text-lg font-semibold mb-2">No Pools Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first PromoShare prize pool</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pool
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
                <CardTitle>Configure Your Pool</CardTitle>
                <CardDescription>Set up your prize pool parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pool Tier</Label>
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
                        {tier.charAt(0).toUpperCase() + tier.slice(1)} - ${tierConfig.min_pool}-${tierConfig.max_pool} ({tierConfig.duration_days} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Pool Amount ($)</Label>
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
                    Min: ${config?.tiers?.[newPool.tier]?.min_pool}, Max: ${config?.tiers?.[newPool.tier]?.max_pool}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Pool Name</Label>
                  <Input
                    placeholder="e.g., Summer Vibes Weekly Draw"
                    value={newPool.cycle_name}
                    onChange={(e) => setNewPool({ ...newPool, cycle_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Brand Message</Label>
                  <Input
                    placeholder="Your message to participants..."
                    value={newPool.brand_message}
                    onChange={(e) => setNewPool({ ...newPool, brand_message: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Premium Placements</Label>
                  {config?.placements && Object.entries(config.placements).map(([key, placement]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          ${placement.price}{placement.per_send ? ' per send' : placement.duration_days ? ` / ${placement.duration_days} days` : ''}
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
                      Calculating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Calculate Cost
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Estimated costs and projections</CardDescription>
              </CardHeader>
              <CardContent>
                {costEstimate ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                      <p className="text-3xl font-bold">${costEstimate.breakdown.total.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>Prize Pool</span>
                        <span className="font-medium">${costEstimate.breakdown.prize_pool.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Platform Fee ({costEstimate.breakdown.platform_fee_percent}%)</span>
                        <span className="font-medium">${costEstimate.breakdown.platform_fee.toLocaleString()}</span>
                      </div>
                      {costEstimate.breakdown.placements > 0 && (
                        <div className="flex justify-between py-2 border-b">
                          <span>Premium Placements</span>
                          <span className="font-medium">${costEstimate.breakdown.placements.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">Projected Results</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">{costEstimate.projections.min_winners}-{costEstimate.projections.max_winners}</p>
                          <p className="text-xs text-muted-foreground">Winners</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">${costEstimate.projections.avg_prize_per_winner}</p>
                          <p className="text-xs text-muted-foreground">Avg Prize</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">{costEstimate.projections.duration_days}</p>
                          <p className="text-xs text-muted-foreground">Days</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <p className="text-2xl font-bold">${Math.round(costEstimate.breakdown.total / costEstimate.projections.avg_winners)}</p>
                          <p className="text-xs text-muted-foreground">Est. Cost Per Winner</p>
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create Pool (${costEstimate.breakdown.total.toLocaleString()})
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Click "Calculate Cost" to see breakdown</p>
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
