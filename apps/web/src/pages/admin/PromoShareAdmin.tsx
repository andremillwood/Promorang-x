import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  Trophy,
  Settings,
  Activity,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ChevronRight,
  Plus,
  Eye,
  EyeOff,
  Crown
} from 'lucide-react';

interface Cycle {
  id: string;
  cycle_type: string;
  cycle_name: string;
  status: 'draft' | 'active' | 'settling' | 'completed' | 'cancelled';
  start_at: string;
  end_at: string;
  eligibility_config: {
    min_verified_moves?: number;
    min_moments_joined?: number;
    min_referrals?: number;
  };
  weight_config: {
    base_entry?: number;
    move_weight?: number;
    moment_weight?: number;
    referral_weight?: number;
  };
}

interface SimulationResult {
  eligible_users: number;
  projected_winners: number;
  weight_stats: {
    total: number;
    average: number;
    highest: number;
    lowest: number;
  };
  weight_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  buckets: Array<{
    name: string;
    projected_winners: number;
    candidate_pool: number;
    top_candidates: Array<{ user_id: string; weight: number }>;
  }>;
}

const PromoShareAdmin = () => {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState('cycles');
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [qualifiedUsers, setQualifiedUsers] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  // New cycle form state
  const [newCycle, setNewCycle] = useState({
    cycle_type: 'monthly',
    cycle_name: '',
    start_at: '',
    end_at: '',
    min_verified_moves: 3,
    min_moments_joined: 1,
    min_referrals: 1,
    base_entry: 1,
    move_weight: 1,
    moment_weight: 2,
    referral_weight: 3
  });

  useEffect(() => {
    if (!session?.access_token) return;
    fetchCycles(session.access_token);
  }, [session?.access_token]);

  const fetchCycles = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/cycles/current`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setCycles(result.data);
        if (result.data.length > 0 && !selectedCycle) {
          setSelectedCycle(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const simulateDraw = async () => {
    if (!selectedCycle || !session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/admin/cycles/${selectedCycle.id}/simulate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const result = await response.json();
      if (result.success) {
        setSimulationResult(result.data);
        toast.success('Simulation completed');
      } else {
        toast.error(result.error || 'Simulation failed');
      }
    } catch (error) {
      toast.error('Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const executeDraw = async (tiered: boolean = false) => {
    if (!selectedCycle || !session?.access_token) return;
    if (!confirm(`Are you sure you want to execute the ${tiered ? 'tiered ' : ''}draw? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = tiered
        ? `${API_BASE_URL}/promoshare/admin/cycles/${selectedCycle.id}/execute-tiered`
        : `${API_BASE_URL}/promoshare/admin/cycles/${selectedCycle.id}/execute`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Draw executed! ${result.data.total_winners || result.data.winners?.length || 0} winners selected.`);
        fetchCycles(session.access_token);
      } else {
        toast.error(result.error || 'Draw failed');
      }
    } catch (error) {
      toast.error('Draw execution failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifiedUsers = async () => {
    if (!selectedCycle || !session?.access_token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/admin/cycles/${selectedCycle.id}/qualified`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) {
        setQualifiedUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching qualified users:', error);
    }
  };

  const fetchAuditLog = async () => {
    if (!selectedCycle || !session?.access_token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/admin/cycles/${selectedCycle.id}/audit`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) {
        setAuditLog(result.data);
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
    }
  };

  const createCycle = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/admin/cycles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cycle_type: newCycle.cycle_type,
          cycle_name: newCycle.cycle_name,
          start_at: new Date(newCycle.start_at).toISOString(),
          end_at: new Date(newCycle.end_at).toISOString(),
          eligibility_config: {
            min_verified_moves: newCycle.min_verified_moves,
            min_moments_joined: newCycle.min_moments_joined,
            min_referrals: newCycle.min_referrals
          },
          weight_config: {
            base_entry: newCycle.base_entry,
            move_weight: newCycle.move_weight,
            moment_weight: newCycle.moment_weight,
            referral_weight: newCycle.referral_weight
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Cycle created successfully');
        fetchCycles(session.access_token);
        setActiveTab('cycles');
      } else {
        toast.error(result.error || 'Failed to create cycle');
      }
    } catch (error) {
      toast.error('Failed to create cycle');
    } finally {
      setLoading(false);
    }
  };

  const recalculateStats = async () => {
    if (!selectedCycle || !session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/promoshare/admin/cycles/${selectedCycle.id}/recalculate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Recalculated stats for ${result.data.processed} users`);
      } else {
        toast.error('Recalculation failed');
      }
    } catch (error) {
      toast.error('Recalculation failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'draft': return 'bg-gray-500 text-white';
      case 'settling': return 'bg-yellow-500 text-yellow-950';
      case 'completed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">PromoShare Admin</h1>
            <p className="text-muted-foreground">Manage cycles, run draws, and configure rewards</p>
          </div>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="w-4 h-4 mr-2" />
          New Cycle
        </Button>
      </div>

      {/* Cycle Selector */}
      {cycles.length > 0 && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Label className="text-sm font-medium sm:whitespace-nowrap">Selected Cycle:</Label>
              <select
                className="flex-1 p-2 border rounded-md bg-background"
                value={selectedCycle?.id || ''}
                onChange={(e) => {
                  const cycle = cycles.find(c => c.id === e.target.value);
                  setSelectedCycle(cycle || null);
                  setSimulationResult(null);
                }}
              >
                {cycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.cycle_name || cycle.cycle_type} ({cycle.status})
                  </option>
                ))}
              </select>
              {selectedCycle && (
                <Badge className={getStatusColor(selectedCycle.status)}>
                  {selectedCycle.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full min-w-[620px] grid-cols-5 lg:w-fit">
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="users">Qualified Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="create">Create Cycle</TabsTrigger>
        </TabsList>

        {/* CYCLES TAB */}
        <TabsContent value="cycles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cycles.map((cycle) => (
              <Card key={cycle.id} className={selectedCycle?.id === cycle.id ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{cycle.cycle_name || cycle.cycle_type}</CardTitle>
                    <Badge className={getStatusColor(cycle.status)}>{cycle.status}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(cycle.start_at).toLocaleDateString()} - {new Date(cycle.end_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Eligibility:</strong> {cycle.eligibility_config?.min_verified_moves} moves, {cycle.eligibility_config?.min_moments_joined} moments</p>
                    <p><strong>Weights:</strong> Base {cycle.weight_config?.base_entry}, Move {cycle.weight_config?.move_weight}, Moment {cycle.weight_config?.moment_weight}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedCycle(cycle)}
                    >
                      Select
                    </Button>
                    {cycle.status === 'active' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => executeDraw(false)}
                        disabled={loading}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Draw
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {cycles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cycles Found</h3>
                <p className="text-muted-foreground mb-4">Create your first PromoShare cycle to get started</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Cycle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SIMULATION TAB */}
        <TabsContent value="simulation" className="space-y-4">
          {selectedCycle ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Draw Simulation</CardTitle>
                  <CardDescription>
                    Preview the draw results before executing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-6">
                    <Button onClick={simulateDraw} disabled={loading}>
                      <Eye className="w-4 h-4 mr-2" />
                      Run Simulation
                    </Button>
                    {selectedCycle.status === 'active' && (
                      <>
                        <Button variant="secondary" onClick={() => executeDraw(false)} disabled={loading}>
                          <Play className="w-4 h-4 mr-2" />
                          Execute Legacy Draw
                        </Button>
                        <Button variant="default" onClick={() => executeDraw(true)} disabled={loading}>
                          <Trophy className="w-4 h-4 mr-2" />
                          Execute Tiered Draw
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={recalculateStats} disabled={loading}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Recalculate Stats
                    </Button>
                  </div>

                  {simulationResult && (
                    <div className="space-y-6">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Eligible Users</p>
                          <p className="text-2xl font-bold">{simulationResult.eligible_users}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Projected Winners</p>
                          <p className="text-2xl font-bold">{simulationResult.projected_winners}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Avg Weight</p>
                          <p className="text-2xl font-bold">{simulationResult.weight_stats?.average}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Highest Weight</p>
                          <p className="text-2xl font-bold">{simulationResult.weight_stats?.highest}</p>
                        </div>
                      </div>

                      {/* Buckets */}
                      <div>
                        <h4 className="font-semibold mb-3">Distribution Buckets</h4>
                        <div className="space-y-3">
                          {simulationResult.buckets?.map((bucket) => (
                            <Card key={bucket.name}>
                              <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium capitalize">{bucket.name.replace('_', ' ')}</h5>
                                  <Badge>{bucket.projected_winners} winners</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  From pool of {bucket.candidate_pool} candidates
                                </p>
                                {bucket.top_candidates && bucket.top_candidates.length > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Top candidates: </span>
                                    {bucket.top_candidates.map((c, i) => (
                                      <span key={c.user_id} className="font-medium">
                                        User {c.user_id.slice(0, 8)}... ({c.weight} weight)
                                        {i < bucket.top_candidates.length - 1 ? ', ' : ''}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cycle Selected</h3>
                <p className="text-muted-foreground">Select a cycle to run simulation</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Qualified Users</CardTitle>
                  <CardDescription>Users eligible for the current cycle</CardDescription>
                </div>
                <Button onClick={fetchQualifiedUsers}>
                  <Users className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {qualifiedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {qualifiedUsers.map((user, index) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{user.users?.username || user.users?.email || user.user_id}</p>
                            <p className="text-xs text-muted-foreground">{user.users?.user_tier || 'free'} tier</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            Weight: {user.final_weight}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {user.verified_moves_count} moves, {user.moments_joined_count} moments
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No qualified users found</p>
                    <Button variant="outline" className="mt-4" onClick={fetchQualifiedUsers}>
                      Load Users
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TAB */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>Complete history of PromoShare operations</CardDescription>
                </div>
                <Button onClick={fetchAuditLog}>
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {auditLog.length > 0 ? (
                  <div className="space-y-2">
                    {auditLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium capitalize">{log.action_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            by {log.actor_type} • {new Date(log.created_at).toLocaleString()}
                          </p>
                          {log.payload && Object.keys(log.payload).length > 0 && (
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No audit entries found</p>
                    <Button variant="outline" className="mt-4" onClick={fetchAuditLog}>
                      Load Audit Log
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE TAB */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Cycle</CardTitle>
              <CardDescription>Configure a new PromoShare cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cycle Type</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newCycle.cycle_type}
                    onChange={(e) => setNewCycle({ ...newCycle, cycle_type: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="grand">Grand</option>
                    <option value="campaign">Campaign-Specific</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Cycle Name</Label>
                  <Input
                    placeholder="e.g., March Monthly Draw"
                    value={newCycle.cycle_name}
                    onChange={(e) => setNewCycle({ ...newCycle, cycle_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={newCycle.start_at}
                    onChange={(e) => setNewCycle({ ...newCycle, start_at: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={newCycle.end_at}
                    onChange={(e) => setNewCycle({ ...newCycle, end_at: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Eligibility Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Min Verified Moves</Label>
                    <Input
                      type="number"
                      value={newCycle.min_verified_moves}
                      onChange={(e) => setNewCycle({ ...newCycle, min_verified_moves: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Moments Joined</Label>
                    <Input
                      type="number"
                      value={newCycle.min_moments_joined}
                      onChange={(e) => setNewCycle({ ...newCycle, min_moments_joined: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Referrals</Label>
                    <Input
                      type="number"
                      value={newCycle.min_referrals}
                      onChange={(e) => setNewCycle({ ...newCycle, min_referrals: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Weight Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Base Entry</Label>
                    <Input
                      type="number"
                      value={newCycle.base_entry}
                      onChange={(e) => setNewCycle({ ...newCycle, base_entry: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Move Weight</Label>
                    <Input
                      type="number"
                      value={newCycle.move_weight}
                      onChange={(e) => setNewCycle({ ...newCycle, move_weight: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moment Weight</Label>
                    <Input
                      type="number"
                      value={newCycle.moment_weight}
                      onChange={(e) => setNewCycle({ ...newCycle, moment_weight: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Referral Weight</Label>
                    <Input
                      type="number"
                      value={newCycle.referral_weight}
                      onChange={(e) => setNewCycle({ ...newCycle, referral_weight: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={createCycle}
                disabled={loading || !newCycle.cycle_name || !newCycle.start_at || !newCycle.end_at}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Cycle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromoShareAdmin;
