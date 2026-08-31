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
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';
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
  const { t, formatDate } = useI18n();
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
        toast.success(t('psAdmin.toastSimOk'));
      } else {
        toast.error(result.error || t('psAdmin.toastSimFail'));
      }
    } catch (error) {
      toast.error(t('psAdmin.toastSimFail'));
    } finally {
      setLoading(false);
    }
  };

  const executeDraw = async (tiered: boolean = false) => {
    if (!selectedCycle || !session?.access_token) return;
    if (!confirm(t(tiered ? 'psAdmin.confirmTiered' : 'psAdmin.confirmDraw'))) {
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
        toast.success(t('psAdmin.toastDrawOk', { count: result.data.total_winners || result.data.winners?.length || 0 }));
        fetchCycles(session.access_token);
      } else {
        toast.error(result.error || t('psAdmin.toastDrawFail'));
      }
    } catch (error) {
      toast.error(t('psAdmin.toastDrawExecFail'));
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
        toast.success(t('psAdmin.toastCycleOk'));
        fetchCycles(session.access_token);
        setActiveTab('cycles');
      } else {
        toast.error(result.error || t('psAdmin.toastCycleFail'));
      }
    } catch (error) {
      toast.error(t('psAdmin.toastCycleFail'));
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
        toast.success(t('psAdmin.toastRecalcOk', { count: result.data.processed }));
      } else {
        toast.error(t('psAdmin.toastRecalcFail'));
      }
    } catch (error) {
      toast.error(t('psAdmin.toastRecalcFail'));
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
            <h1 className="text-3xl font-bold">{t('psAdmin.title')}</h1>
            <GuidanceDisclosure
              id="promoshare-admin:overview"
              eyebrow={t('psAdmin.guideEyebrow')}
              title={t('psAdmin.guideTitle')}
              summary={t('psAdmin.guideSummary')}
              className="mt-2"
              tone="light"
            >
              <p className="text-sm text-muted-foreground">{t('psAdmin.guideBody')}</p>
            </GuidanceDisclosure>
          </div>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="w-4 h-4 mr-2" />
          {t('psAdmin.newCycle')}
        </Button>
      </div>

      {/* Cycle Selector */}
      {cycles.length > 0 && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Label className="text-sm font-medium sm:whitespace-nowrap">{t('psAdmin.selectedCycle')}</Label>
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
          <TabsTrigger value="cycles">{t('psAdmin.tabCycles')}</TabsTrigger>
          <TabsTrigger value="simulation">{t('psAdmin.tabSim')}</TabsTrigger>
          <TabsTrigger value="users">{t('psAdmin.tabUsers')}</TabsTrigger>
          <TabsTrigger value="audit">{t('psAdmin.tabAudit')}</TabsTrigger>
          <TabsTrigger value="create">{t('psAdmin.tabCreate')}</TabsTrigger>
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
                    {formatDate(cycle.start_at)} - {formatDate(cycle.end_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>{t('psAdmin.eligibility')}</strong> {t('psAdmin.eligVals', { moves: cycle.eligibility_config?.min_verified_moves ?? 0, moments: cycle.eligibility_config?.min_moments_joined ?? 0 })}</p>
                    <p><strong>{t('psAdmin.weights')}</strong> {t('psAdmin.weightVals', { base: cycle.weight_config?.base_entry ?? 0, move: cycle.weight_config?.move_weight ?? 0, moment: cycle.weight_config?.moment_weight ?? 0 })}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedCycle(cycle)}
                    >
                      {t('psAdmin.select')}
                    </Button>
                    {cycle.status === 'active' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => executeDraw(false)}
                        disabled={loading}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {t('psAdmin.draw')}
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
                <h3 className="text-lg font-semibold mb-2">{t('psAdmin.emptyTitle')}</h3>
                <p className="text-muted-foreground mb-4">{t('psAdmin.emptyCopy')}</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('psAdmin.createCycle')}
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
                  <CardTitle>{t('psAdmin.simTitle')}</CardTitle>
                  <GuidanceDisclosure
                    id="promoshare-admin:draw-simulation"
                    eyebrow={t('psAdmin.simEyebrow')}
                    title={t('psAdmin.simGuideTitle')}
                    summary={t('psAdmin.simGuideSummary')}
                    className="mt-3"
                    tone="light"
                  >
                    <CardDescription>
                      {t('psAdmin.simDesc')}
                    </CardDescription>
                  </GuidanceDisclosure>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-6">
                    <Button onClick={simulateDraw} disabled={loading}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('psAdmin.runSim')}
                    </Button>
                    {selectedCycle.status === 'active' && (
                      <>
                        <Button variant="secondary" onClick={() => executeDraw(false)} disabled={loading}>
                          <Play className="w-4 h-4 mr-2" />
                          {t('psAdmin.execLegacy')}
                        </Button>
                        <Button variant="default" onClick={() => executeDraw(true)} disabled={loading}>
                          <Trophy className="w-4 h-4 mr-2" />
                          {t('psAdmin.execTiered')}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={recalculateStats} disabled={loading}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('psAdmin.recalc')}
                    </Button>
                  </div>

                  {simulationResult && (
                    <div className="space-y-6">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">{t('psAdmin.eligible')}</p>
                          <p className="text-2xl font-bold">{simulationResult.eligible_users}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">{t('psAdmin.projected')}</p>
                          <p className="text-2xl font-bold">{simulationResult.projected_winners}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">{t('psAdmin.avgWeight')}</p>
                          <p className="text-2xl font-bold">{simulationResult.weight_stats?.average}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">{t('psAdmin.highWeight')}</p>
                          <p className="text-2xl font-bold">{simulationResult.weight_stats?.highest}</p>
                        </div>
                      </div>

                      {/* Buckets */}
                      <div>
                        <h4 className="font-semibold mb-3">{t('psAdmin.buckets')}</h4>
                        <div className="space-y-3">
                          {simulationResult.buckets?.map((bucket) => (
                            <Card key={bucket.name}>
                              <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium capitalize">{bucket.name.replace('_', ' ')}</h5>
                                  <Badge>{t('psAdmin.winners', { count: bucket.projected_winners })}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {t('psAdmin.fromPool', { count: bucket.candidate_pool })}
                                </p>
                                {bucket.top_candidates && bucket.top_candidates.length > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">{t('psAdmin.topCandidates')} </span>
                                    {bucket.top_candidates.map((c, i) => (
                                      <span key={c.user_id} className="font-medium">
                                        {t('psAdmin.userWeight', { id: c.user_id.slice(0, 8), weight: c.weight })}
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
                <h3 className="text-lg font-semibold mb-2">{t('psAdmin.noCycleTitle')}</h3>
                <p className="text-muted-foreground">{t('psAdmin.noCycleCopy')}</p>
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
                  <CardTitle>{t('psAdmin.usersTitle')}</CardTitle>
                  <CardDescription>{t('psAdmin.usersDesc')}</CardDescription>
                </div>
                <Button onClick={fetchQualifiedUsers}>
                  <Users className="w-4 h-4 mr-2" />
                  {t('psAdmin.refresh')}
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
                            <p className="text-xs text-muted-foreground">{t('psAdmin.tier', { tier: user.users?.user_tier || 'free' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            {t('psAdmin.weight', { weight: user.final_weight })}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {t('psAdmin.userStats', { moves: user.verified_moves_count, moments: user.moments_joined_count })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('psAdmin.noUsers')}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchQualifiedUsers}>
                      {t('psAdmin.loadUsers')}
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
                  <CardTitle>{t('psAdmin.auditTitle')}</CardTitle>
                  <CardDescription>{t('psAdmin.auditDesc')}</CardDescription>
                </div>
                <Button onClick={fetchAuditLog}>
                  <Activity className="w-4 h-4 mr-2" />
                  {t('psAdmin.refresh')}
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
                            {t('psAdmin.byActor', { actor: log.actor_type, date: formatDate(log.created_at) })}
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
                    <p className="text-muted-foreground">{t('psAdmin.noAudit')}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchAuditLog}>
                      {t('psAdmin.loadAudit')}
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
              <CardTitle>{t('psAdmin.createTitle')}</CardTitle>
              <GuidanceDisclosure
                id="promoshare-admin:create-cycle"
                eyebrow={t('psAdmin.cycleEyebrow')}
                title={t('psAdmin.cycleGuideTitle')}
                summary={t('psAdmin.cycleGuideSummary')}
                className="mt-3"
                tone="light"
              >
                <CardDescription>{t('psAdmin.cycleDesc')}</CardDescription>
              </GuidanceDisclosure>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('psAdmin.cycleType')}</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newCycle.cycle_type}
                    onChange={(e) => setNewCycle({ ...newCycle, cycle_type: e.target.value })}
                  >
                    <option value="daily">{t('psAdmin.typeDaily')}</option>
                    <option value="weekly">{t('psAdmin.typeWeekly')}</option>
                    <option value="monthly">{t('psAdmin.typeMonthly')}</option>
                    <option value="grand">{t('psAdmin.typeGrand')}</option>
                    <option value="campaign">{t('psAdmin.typeCampaign')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('psAdmin.cycleName')}</Label>
                  <Input
                    placeholder={t('psAdmin.namePh')}
                    value={newCycle.cycle_name}
                    onChange={(e) => setNewCycle({ ...newCycle, cycle_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('psAdmin.start')}</Label>
                  <Input
                    type="datetime-local"
                    value={newCycle.start_at}
                    onChange={(e) => setNewCycle({ ...newCycle, start_at: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('psAdmin.end')}</Label>
                  <Input
                    type="datetime-local"
                    value={newCycle.end_at}
                    onChange={(e) => setNewCycle({ ...newCycle, end_at: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">{t('psAdmin.eligReqs')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('psAdmin.minMoves')}</Label>
                    <Input
                      type="number"
                      value={newCycle.min_verified_moves}
                      onChange={(e) => setNewCycle({ ...newCycle, min_verified_moves: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('psAdmin.minMoments')}</Label>
                    <Input
                      type="number"
                      value={newCycle.min_moments_joined}
                      onChange={(e) => setNewCycle({ ...newCycle, min_moments_joined: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('psAdmin.minRefs')}</Label>
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
                <h4 className="font-semibold mb-4">{t('psAdmin.weightCfg')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t('psAdmin.baseEntry')}</Label>
                    <Input
                      type="number"
                      value={newCycle.base_entry}
                      onChange={(e) => setNewCycle({ ...newCycle, base_entry: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('psAdmin.moveWeight')}</Label>
                    <Input
                      type="number"
                      value={newCycle.move_weight}
                      onChange={(e) => setNewCycle({ ...newCycle, move_weight: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('psAdmin.momentWeight')}</Label>
                    <Input
                      type="number"
                      value={newCycle.moment_weight}
                      onChange={(e) => setNewCycle({ ...newCycle, moment_weight: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('psAdmin.refWeight')}</Label>
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
                {t('psAdmin.createCycle')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromoShareAdmin;
