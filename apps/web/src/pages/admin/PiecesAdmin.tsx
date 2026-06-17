/**
 * Pieces Trading Admin Panel
 * For managing dividends, liquidity pools, and monitoring
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  RefreshCw,
  ScrollText
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
  asset?: {
    id: string;
    title?: string;
    name?: string;
    platform?: string;
  };
}

interface PoolAsset {
  id: string;
  piece_type: string;
  title?: string;
  name?: string;
  platform?: string;
  status?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

interface PoolAuditLog {
  id: string;
  pool_id?: string;
  actor_id?: string;
  action: string;
  piece_type?: string;
  asset_id?: string;
  previous_status?: string;
  new_status?: string;
  created_at: string;
}

export default function PiecesAdmin() {
  const { user, profile, session } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dividends');
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [assets, setAssets] = useState<PoolAsset[]>([]);
  const [auditLogs, setAuditLogs] = useState<PoolAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [poolForm, setPoolForm] = useState({
    piece_type: 'content',
    asset_id: '',
    initial_pieces: '10000',
    initial_currency: '50000',
    swap_fee_percent: '0.003',
  });
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'https://api.promorang.co').replace(/\/$/, '');
  const apiUrl = (path: string) => `${apiBaseUrl}${apiBaseUrl.endsWith('/api') ? '' : '/api'}${path}`;

  // Check admin access
  const isAdmin = ['admin', 'master_admin', 'moderator', 'platform_admin'].includes(profile?.role);

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      loadDividends();
      loadPools();
      loadAssets();
      loadAuditLogs();
    }
  }, [isAdmin, session?.access_token]);

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      loadAssets();
    }
  }, [poolForm.piece_type]);

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
    if (!session?.access_token) return;

    const response = await fetch(apiUrl('/pieces/admin/pools'), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setPools(data.pools || []);
    }
  };

  const loadAssets = async () => {
    if (!session?.access_token) return;

    const response = await fetch(apiUrl(`/pieces/admin/assets?piece_type=${poolForm.piece_type}`), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (response.ok) {
      const data = await response.json();
      const nextAssets = data.assets || [];
      setAssets(nextAssets);
      setPoolForm((current) => ({
        ...current,
        asset_id: current.asset_id || nextAssets[0]?.id || '',
      }));
    }
  };

  const loadAuditLogs = async () => {
    if (!session?.access_token) return;

    const response = await fetch(apiUrl('/pieces/admin/pools/audit-logs'), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setAuditLogs(data.logs || []);
    }
  };

  const handleCreatePool = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl('/pieces/admin/pools'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          piece_type: poolForm.piece_type,
          asset_id: poolForm.asset_id,
          initial_pieces: Number(poolForm.initial_pieces),
          initial_currency: Number(poolForm.initial_currency),
          swap_fee_percent: Number(poolForm.swap_fee_percent),
        }),
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Failed to create pool');
      }

      toast({
        title: 'Pool Created',
        description: 'The liquidity pool is now active.',
      });
      loadPools();
      loadAuditLogs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create pool',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssetApproval = async (asset: PoolAsset, status: PoolAsset['approval_status']) => {
    if (!session?.access_token || !status) return;
    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/pieces/admin/assets/${asset.piece_type}/${asset.id}/approval`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.error || 'Failed to update approval');
      toast({ title: 'Asset Updated', description: `Trading approval changed to ${status}.` });
      await Promise.all([loadAssets(), loadPools(), loadAuditLogs()]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update approval', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePoolStatus = async (poolId: string, status: 'active' | 'paused' | 'closed') => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/pieces/admin/pools/${poolId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Failed to update pool');
      }

      toast({
        title: 'Pool Updated',
        description: `Pool status changed to ${status}.`,
      });
      loadPools();
      loadAuditLogs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update pool',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">Pieces Trading Admin</h1>
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
        <TabsList className="grid w-full min-w-[760px] grid-cols-5">
          <TabsTrigger value="dividends">
            <Calculator className="w-4 h-4 mr-2" />
            Dividends
          </TabsTrigger>
          <TabsTrigger value="pools">
            <TrendingUp className="w-4 h-4 mr-2" />
            Liquidity Pools
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Shield className="w-4 h-4 mr-2" />
            Asset Approval
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="w-4 h-4 mr-2" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="audit">
            <ScrollText className="w-4 h-4 mr-2" />
            Audit
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
                      className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                      <div className="flex flex-wrap items-center gap-2">
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
              <CardTitle>Create Liquidity Pool</CardTitle>
              <CardDescription>
                Create an approved AMM pool for a published asset. Start with content pools; add moment, host, and venue approvals once those asset contracts are finalized.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Piece Type</span>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={poolForm.piece_type}
                    onChange={(event) => {
                      setPoolForm((current) => ({
                        ...current,
                        piece_type: event.target.value,
                        asset_id: '',
                      }));
                    }}
                  >
                    <option value="content">Content</option>
                    <option value="moment" disabled>Moment</option>
                    <option value="host" disabled>Host</option>
                    <option value="venue" disabled>Venue</option>
                  </select>
                </label>

                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium">Approved Asset</span>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={poolForm.asset_id}
                    onChange={(event) => setPoolForm((current) => ({ ...current, asset_id: event.target.value }))}
                  >
                    {assets.filter((asset) => asset.approval_status === 'approved').map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title || asset.name || asset.id}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">Pieces</span>
                  <Input
                    type="number"
                    min="1"
                    value={poolForm.initial_pieces}
                    onChange={(event) => setPoolForm((current) => ({ ...current, initial_pieces: event.target.value }))}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium">Gems</span>
                  <Input
                    type="number"
                    min="1"
                    value={poolForm.initial_currency}
                    onChange={(event) => setPoolForm((current) => ({ ...current, initial_currency: event.target.value }))}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="space-y-2 sm:w-48">
                  <span className="text-sm font-medium">Swap Fee</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={poolForm.swap_fee_percent}
                    onChange={(event) => setPoolForm((current) => ({ ...current, swap_fee_percent: event.target.value }))}
                  />
                </label>
                <Button
                  onClick={handleCreatePool}
                  disabled={loading || !poolForm.asset_id}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Pool
                </Button>
              </div>
            </CardContent>
          </Card>

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
                      className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <Badge>{pool.piece_type}</Badge>
                          <span className="font-medium">
                            {pool.asset?.title || pool.asset?.name || pool.asset_id}
                          </span>
                        </div>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
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
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge 
                          variant={pool.status === 'active' ? 'default' : 'destructive'}
                        >
                          {pool.status}
                        </Badge>
                        {pool.status !== 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handlePoolStatus(pool.id, 'active')} disabled={loading}>
                            Activate
                          </Button>
                        )}
                        {pool.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handlePoolStatus(pool.id, 'paused')} disabled={loading}>
                            Pause
                          </Button>
                        )}
                        {pool.status !== 'closed' && (
                          <Button size="sm" variant="destructive" onClick={() => handlePoolStatus(pool.id, 'closed')} disabled={loading}>
                            Close
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

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Asset Approval</CardTitle>
              <CardDescription>
                Publishing makes an asset visible. Approval separately authorizes Pieces trading and liquidity pools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assets.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">No published assets found.</p>
              ) : assets.map((asset) => (
                <div key={asset.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{asset.title || asset.name || asset.id}</span>
                      <Badge variant={asset.approval_status === 'approved' ? 'default' : 'secondary'}>
                        {asset.approval_status || 'pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{asset.platform || asset.piece_type}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {asset.approval_status !== 'approved' && (
                      <Button size="sm" onClick={() => handleAssetApproval(asset, 'approved')} disabled={loading}>Approve</Button>
                    )}
                    {asset.approval_status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => handleAssetApproval(asset, 'suspended')} disabled={loading}>Suspend</Button>
                    )}
                    {asset.approval_status !== 'rejected' && (
                      <Button size="sm" variant="destructive" onClick={() => handleAssetApproval(asset, 'rejected')} disabled={loading}>Reject</Button>
                    )}
                  </div>
                </div>
              ))}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Pool Audit Logs</CardTitle>
                  <CardDescription>
                    Lifecycle records for admin-created pools, user-created pools, and status changes.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={loadAuditLogs}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pool audit events recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{log.action}</Badge>
                          {log.piece_type && <Badge>{log.piece_type}</Badge>}
                          {log.previous_status && log.new_status && (
                            <span className="text-sm text-muted-foreground">
                              {log.previous_status} to {log.new_status}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-3">
                        <span>Pool: {log.pool_id || 'n/a'}</span>
                        <span>Asset: {log.asset_id || 'n/a'}</span>
                        <span>Actor: {log.actor_id || 'system'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
