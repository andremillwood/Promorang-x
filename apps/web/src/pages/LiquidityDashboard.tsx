/**
 * Liquidity Provider Dashboard
 * Shows all pools where user can provide liquidity
 * Displays earnings, APRs, and positions
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  Gem, 
  Tag, 
  Plus,
  ArrowUpRight,
  DollarSign,
  PieChart,
  Droplets,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LiquidityProvider } from '@/components/trading/LiquidityProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Pool {
  id: string;
  piece_type: 'content' | 'moment' | 'host' | 'venue';
  asset_id: string;
  pieces_reserve: number;
  currency_reserve: number;
  last_price: number;
  swap_fee_percent: number;
  lp_fee_percent: number;
  volume_24h: number;
  volume_7d: number;
  asset?: {
    id: string;
    title?: string;
    name?: string;
    image_url?: string;
  };
}

interface LPPosition {
  pool_id: string;
  lp_tokens: number;
  pieces_deposited: number;
  currency_deposited: number;
  fees_earned_pieces: number;
  fees_earned_currency: number;
  pool: Pool;
}

export function LiquidityDashboard() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [pools, setPools] = useState<Pool[]>([]);
  const [positions, setPositions] = useState<LPPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isLpModalOpen, setIsLpModalOpen] = useState(false);
  const [gemsBalance, setGemsBalance] = useState(0);
  const [userPieces, setUserPieces] = useState<{[key: string]: number}>({});
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  useEffect(() => {
    if (user && session?.access_token) {
      fetchData();
    }
  }, [user, session?.access_token]);

  const fetchData = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const authHeaders = { 'Authorization': `Bearer ${session.access_token}` };
      const [poolsRes, positionsRes, balanceRes] = await Promise.all([
        fetch(apiUrl('/pieces/pools?status=active'), {
          headers: authHeaders,
        }),
        fetch(apiUrl('/pieces/lp/positions'), {
          headers: authHeaders,
        }).catch(() => ({ ok: false })),
        fetch(apiUrl('/pieces/gems/balance'), {
          headers: authHeaders,
        }),
      ]);

      if (poolsRes.ok) {
        const poolsData = await poolsRes.json();
        setPools(poolsData.pools || []);
      }

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData.positions || []);
      }

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setGemsBalance(balanceData.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load liquidity data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAPR = (pool: Pool) => {
    if (!pool.volume_24h || !pool.currency_reserve) return 0;
    
    const dailyVolume = pool.volume_24h;
    const lpFeeRate = pool.lp_fee_percent || 0.0025;
    const dailyFees = dailyVolume * lpFeeRate;
    const yearlyFees = dailyFees * 365;
    
    const poolValue = pool.currency_reserve * 2;
    const apr = (yearlyFees / poolValue) * 100;
    
    return apr;
  };

  const totalDeposited = positions.reduce((sum, pos) => sum + pos.currency_deposited, 0);
  const totalFeesEarned = positions.reduce((sum, pos) => sum + pos.fees_earned_currency, 0);
  const totalValue = totalDeposited + totalFeesEarned;

  const openLiquidityModal = (pool: Pool) => {
    setSelectedPool(pool);
    setIsLpModalOpen(true);
  };

  const typeLabels = {
    content: 'Content',
    moment: 'Moment',
    host: 'Host',
    venue: 'Venue',
  };

  const typeColors = {
    content: 'bg-blue-100 text-blue-800',
    moment: 'bg-purple-100 text-purple-800',
    host: 'bg-green-100 text-green-800',
    venue: 'bg-orange-100 text-orange-800',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b bg-card/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Droplets className="h-8 w-8 text-violet-500" />
                Liquidity Provider
              </h1>
              <p className="text-muted-foreground mt-1">
                Deposit Gems and Pieces to earn trading fees
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline" size="sm">
                  <Link to="/kyc">Review KYC</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/vault">Open Vault</Link>
                </Button>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/marketplace'}>
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Trade Pieces
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Liquidity readiness</AlertTitle>
          <AlertDescription>
            Liquidity is an advanced surface. Pool browsing is live, but position reporting and deeper portfolio behavior still depend on backend endpoints that need fuller production validation.
          </AlertDescription>
        </Alert>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Wallet className="h-4 w-4" />
                Total Deposited
              </div>
              <div className="text-2xl font-bold mt-1">{totalDeposited.toFixed(2)} Gems</div>
              <div className="text-sm text-muted-foreground">
                ≈ ${totalDeposited.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                Fees Earned
              </div>
              <div className="text-2xl font-bold mt-1 text-green-600">
                +{totalFeesEarned.toFixed(4)} Gems
              </div>
              <div className="text-sm text-muted-foreground">
                Lifetime earnings
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <PieChart className="h-4 w-4" />
                Active Positions
              </div>
              <div className="text-2xl font-bold mt-1">{positions.length}</div>
              <div className="text-sm text-muted-foreground">
                pools
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Gem className="h-4 w-4" />
                Available Gems
              </div>
              <div className="text-2xl font-bold mt-1">{gemsBalance.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                Ready to deposit
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Pools</TabsTrigger>
            <TabsTrigger value="my-positions">My Positions ({positions.length})</TabsTrigger>
            <TabsTrigger value="high-apr">High APR</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map((pool) => {
                const apr = calculateAPR(pool);
                const position = positions.find(p => p.pool_id === pool.id);
                
                return (
                  <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={typeColors[pool.piece_type]}>
                            {typeLabels[pool.piece_type]}
                          </Badge>
                          <CardTitle className="text-lg mt-2 line-clamp-1">
                            {pool.asset?.title || pool.asset?.name || 'Untitled'}
                          </CardTitle>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {apr.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">APR</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Pool Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liquidity</span>
                          <span>{pool.pieces_reserve?.toFixed(0)} Pieces</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price</span>
                          <span>{pool.last_price?.toFixed(2)} Gems</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">24h Volume</span>
                          <span>{pool.volume_24h?.toFixed(0)} Gems</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fee Share</span>
                          <span>{(pool.lp_fee_percent * 100).toFixed(2)}%</span>
                        </div>
                      </div>

                      {/* User Position */}
                      {position && (
                        <div className="rounded-lg bg-emerald-500/10 p-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Your Share</span>
                            <span className="font-semibold text-green-700">
                              {((position.lp_tokens / Math.sqrt(pool.pieces_reserve * pool.currency_reserve)) * 100).toFixed(2)}%
                            </span>
                          </div>
                          {position.fees_earned_currency > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600">Fees Earned</span>
                              <span className="font-semibold text-green-600">
                                +{position.fees_earned_currency.toFixed(4)} Gems
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        className="w-full"
                        onClick={() => openLiquidityModal(pool)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {position ? 'Manage Position' : 'Add Liquidity'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-positions">
            {positions.length === 0 ? (
              <Card className="p-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No positions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start earning fees by adding liquidity to pools
                </p>
                <Button onClick={() => document.querySelector('[value="all"]')?.dispatchEvent(new Event('click'))}>
                  Browse Pools
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {positions.map((position) => {
                  const apr = calculateAPR(position.pool);
                  
                  return (
                    <Card key={position.pool_id} className="border-green-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={typeColors[position.pool.piece_type]}>
                            {typeLabels[position.pool.piece_type]}
                          </Badge>
                          <Badge variant="outline" className="text-green-600">
                            Active
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">
                          {position.pool.asset?.title || position.pool.asset?.name || 'Untitled'}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Deposited</span>
                            <span className="font-semibold">
                              {position.pieces_deposited.toFixed(2)} Pieces
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">+</span>
                            <span className="font-semibold">
                              {position.currency_deposited.toFixed(2)} Gems
                            </span>
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-700">Fees Earned</span>
                            <span className="font-semibold text-green-700">
                              +{position.fees_earned_currency.toFixed(4)} Gems
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Current APR</span>
                            <span>{apr.toFixed(0)}%</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openLiquidityModal(position.pool)}
                        >
                          Manage Position
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="high-apr">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools
                .sort((a, b) => calculateAPR(b) - calculateAPR(a))
                .slice(0, 6)
                .map((pool) => {
                  const apr = calculateAPR(pool);
                  const position = positions.find(p => p.pool_id === pool.id);
                  
                  return (
                    <Card key={pool.id} className="hover:shadow-lg transition-shadow border-violet-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={typeColors[pool.piece_type]}>
                            {typeLabels[pool.piece_type]}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Top APR
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">
                          {pool.asset?.title || pool.asset?.name || 'Untitled'}
                        </CardTitle>
                        <CardDescription>{apr.toFixed(0)}% APR</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <Button 
                          className="w-full bg-violet-600 hover:bg-violet-700"
                          onClick={() => openLiquidityModal(pool)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {position ? 'Add More' : 'Add Liquidity'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              How Liquidity Providing Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-semibold">1. Deposit</div>
                <p className="text-sm">
                  Add equal value of Pieces and Gems to a pool. You receive LP tokens representing your share.
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">2. Earn Fees</div>
                <p className="text-sm">
                  Every trade pays 0.25% fees to LPs. Your earnings auto-compound in the pool.
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">3. Withdraw Anytime</div>
                <p className="text-sm">
                  Remove your liquidity anytime. You get back your deposit + earned fees (minus impermanent loss).
                </p>
              </div>
            </div>
            
            <div className="text-sm bg-blue-100 rounded-lg p-3">
              <strong>Impermanent Loss:</strong> If piece prices change significantly, you may get back different amounts than deposited. 
              Higher trading volume = more fees = less impact from IL.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Modal */}
      <Dialog open={isLpModalOpen} onOpenChange={setIsLpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Liquidity</DialogTitle>
          </DialogHeader>
          {selectedPool && (
            <LiquidityProvider
              pool={selectedPool}
              onClose={() => setIsLpModalOpen(false)}
              gemsBalance={gemsBalance}
              userPieces={userPieces[selectedPool.asset_id] || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LiquidityDashboard;
