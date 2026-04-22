/**
 * Pieces Trading Admin Panel
 * For managing dividends, liquidity pools, and monitoring
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Activity,
  Play,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  calculateAndDistributeDividends, 
  checkCircuitBreaker,
  monitorAllPools,
  autoDistributeDividend
} from '@/lib/pieces';
import { supabase } from '@/integrations/supabase/client';
import { setupTestData } from '@/scripts/setup-test-data';

interface Dividend {
  id: string;
  piece_type: string;
  asset_id: string;
  total_distribution_pool: number;
  pieces_eligible: number;
  dividend_per_piece: number;
  distribution_status: string;
  created_at: string;
}

interface Pool {
  id: string;
  piece_type: string;
  asset_id: string;
  pieces_reserve: number;
  currency_reserve: number;
  last_price: number;
  status: string;
  volume_24h: number;
}

export default function PiecesAdmin() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dividends');
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);

  // Check admin access
  const isAdmin = profile?.role === 'admin' || profile?.role === 'platform_admin';

  useEffect(() => {
    if (isAdmin) {
      loadDividends();
      loadPools();
    }
  }, [isAdmin]);

  const loadDividends = async () => {
    const { data, error } = await supabase
      .from('piece_dividends')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setDividends(data);
    }
  };

  const loadPools = async () => {
    const { data, error } = await supabase
      .from('piece_liquidity_pools')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPools(data);
    }
  };

  const handleSetupTestData = async () => {
    setLoading(true);
    try {
      await setupTestData();
      toast({
        title: 'Test Data Created',
        description: 'Sample liquidity pool, holdings, and dividends created successfully.',
      });
      loadDividends();
      loadPools();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDividend = async () => {
    setLoading(true);
    try {
      const dividendId = await calculateAndDistributeDividends({
        pieceType: 'content',
        assetId: '12345678-1234-1234-1234-123456789abc',
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-03-31')
      });

      if (dividendId) {
        toast({
          title: 'Dividend Calculated',
          description: `Dividend ${dividendId} created successfully.`,
        });
        loadDividends();
      } else {
        toast({
          title: 'No Revenue',
          description: 'No revenue found for the specified period.',
          variant: 'warning'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to calculate dividend',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCircuitBreakers = async () => {
    setMonitoring(true);
    try {
      await monitorAllPools();
      toast({
        title: 'Monitoring Complete',
        description: 'All pools checked for circuit breaker triggers.',
      });
      loadPools();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Monitoring check failed',
        variant: 'destructive'
      });
    } finally {
      setMonitoring(false);
    }
  };

  const handleDistributeDividend = async (dividendId: string) => {
    setLoading(true);
    try {
      await autoDistributeDividend(dividendId);
      toast({
        title: 'Dividend Distributed',
        description: 'All claims have been auto-distributed.',
      });
      loadDividends();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to distribute dividend',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Admin Access Required</h2>
            <p className="text-muted-foreground mt-2">
              You need admin privileges to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pieces Trading Admin</h1>
          <p className="text-muted-foreground">
            Manage dividends, liquidity pools, and circuit breakers
          </p>
        </div>
        <Button onClick={handleSetupTestData} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Setup Test Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dividends">
            <Calculator className="w-4 h-4 mr-2" />
            Dividends
          </TabsTrigger>
          <TabsTrigger value="pools">
            <TrendingUp className="w-4 h-4 mr-2" />
            Liquidity Pools
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="w-4 h-4 mr-2" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Dividends Tab */}
        <TabsContent value="dividends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculate New Dividend</CardTitle>
              <CardDescription>
                Calculate and distribute dividends for a specific period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCalculateDividend} 
                disabled={loading}
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Q1 2025 Dividend
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Dividends</CardTitle>
            </CardHeader>
            <CardContent>
              {dividends.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No dividends calculated yet
                </p>
              ) : (
                <div className="space-y-2">
                  {dividends.map((dividend) => (
                    <div 
                      key={dividend.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge>{dividend.piece_type}</Badge>
                          <span className="font-medium">
                            ${dividend.total_distribution_pool?.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {dividend.pieces_eligible} pieces eligible • 
                          ${dividend.dividend_per_piece?.toFixed(4)} per piece
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={dividend.distribution_status === 'distributed' ? 'default' : 'secondary'}
                        >
                          {dividend.distribution_status}
                        </Badge>
                        {dividend.distribution_status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleDistributeDividend(dividend.id)}
                            disabled={loading}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pools Tab */}
        <TabsContent value="pools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity Pools</CardTitle>
              <CardDescription>
                Active AMM liquidity pools and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pools.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No liquidity pools found. Create test data to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {pools.map((pool) => (
                    <div 
                      key={pool.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge>{pool.piece_type}</Badge>
                          <span className="font-medium">
                            {pool.pieces_reserve?.toLocaleString()} pieces
                          </span>
                          <span className="text-muted-foreground">
                            @ ${pool.last_price?.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${pool.currency_reserve?.toLocaleString()} liquidity • 
                          Vol: ${pool.volume_24h?.toLocaleString()} (24h)
                        </p>
                      </div>
                      <Badge 
                        variant={pool.status === 'active' ? 'default' : 'destructive'}
                      >
                        {pool.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Circuit Breaker Monitoring</CardTitle>
              <CardDescription>
                Monitor pools for price anomalies and trigger circuit breakers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleCheckCircuitBreakers}
                disabled={monitoring}
                className="w-full"
              >
                <Shield className="w-4 h-4 mr-2" />
                {monitoring ? 'Checking...' : 'Check All Pools Now'}
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Monitoring Status</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Circuit breaker checks: Automated
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Price anomaly detection: Active
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Auto-pause on trigger: Enabled
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold">{pools.length}</div>
                  <div className="text-sm text-muted-foreground">Active Pools</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold">{dividends.length}</div>
                  <div className="text-sm text-muted-foreground">Dividends</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
