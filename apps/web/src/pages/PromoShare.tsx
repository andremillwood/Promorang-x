import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SponsoredPoolBanner, SponsoredPoolCard } from '@/components/featured/SponsoredBadge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy,
  Ticket,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Gift,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  History,
  Activity,
  Users,
  Share2,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface CycleStats {
  cycle_id: string;
  cycle_type: string;
  cycle_name: string;
  eligible: boolean;
  status: string;
  weight: number;
  total_entries: number;
  verified_moves: number;
  moments_joined: number;
  referrals: number;
  entries_breakdown: Record<string, number>;
  progress_to_qualify: {
    moves: { current: number; required: number; complete: boolean };
    moments: { current: number; required: number; complete: boolean };
    referrals: { current: number; required: number; complete: boolean };
  };
}

interface Entry {
  id: string;
  source_type: string;
  source_action: string;
  entry_count: number;
  weight_value: number;
  created_at: string;
  cycles?: { cycle_type: string; cycle_name: string };
}

interface PromoShareData {
  draws: Array<{
    id: string;
    cycle_type: string;
    end_at: string;
    jackpot_amount: number;
    userTickets: number;
    totalTickets: number;
    poolItems: Array<{ id: string; reward_type: string; amount: number; description: string }>;
  }>;
  user_stats_by_cycle: CycleStats[];
  recent_entries: Entry[];
  history: Array<{
    id: string;
    prize_description: string;
    selection_bucket: string;
    claimed: boolean;
    created_at: string;
    cycles?: { cycle_type: string; cycle_name: string };
  }>;
}

const PromoShare = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PromoShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [featuredPools, setFeaturedPools] = useState<any[]>([]);

  useEffect(() => {
    fetchPromoShareData();
    fetchFeaturedPools();
  }, []);

  const fetchFeaturedPools = async () => {
    try {
      const response = await fetch('/api/featured-marketplace/active?placement_type=promoshare_homepage_banner&limit=3');
      const data = await response.json();
      if (data.success) {
        setFeaturedPools(data.placements);
      }
    } catch (error) {
      console.error('Error fetching featured pools:', error);
    }
  };

  const fetchPromoShareData = async () => {
    try {
      const response = await fetch('/api/promoshare/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to load PromoShare data');
      }
    } catch (error) {
      console.error('Error fetching PromoShare data:', error);
      toast.error('Failed to load PromoShare data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winner': return 'bg-yellow-500 text-yellow-950';
      case 'qualified': return 'bg-green-500 text-white';
      case 'boosted': return 'bg-purple-500 text-white';
      case 'not_qualified': return 'bg-gray-500 text-white';
      case 'disqualified': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'winner': return 'Winner';
      case 'qualified': return 'Qualified';
      case 'boosted': return 'Boosted';
      case 'not_qualified': return 'Not Qualified';
      case 'disqualified': return 'Disqualified';
      default: return 'In Progress';
    }
  };

  const formatTimeRemaining = (endAt: string) => {
    const end = new Date(endAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load PromoShare</h2>
            <p className="text-muted-foreground">Please try again later</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryCycle = data.user_stats_by_cycle?.[0];
  const totalWeight = data.user_stats_by_cycle?.reduce((sum, c) => sum + (c.weight || 0), 0) || 0;
  const totalEntries = data.user_stats_by_cycle?.reduce((sum, c) => sum + (c.total_entries || 0), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Featured Pool Banner - PromoShare Homepage Banner ($200/day) */}
      {featuredPools.length > 0 && (
        <div className="mb-8">
          {featuredPools.map((pool) => (
            <SponsoredPoolBanner
              key={pool.id}
              pool={{
                id: pool.entity_id,
                name: pool.entity_data?.title || 'Featured Pool',
                description: pool.entity_data?.description,
                prize_pool: pool.entity_data?.prize_pool || 0,
                sponsor_name: pool.user?.display_name || 'Sponsor',
                sponsor_logo: pool.user?.profile_image,
                end_date: pool.end_date,
                participant_count: pool.entity_data?.participant_count || 0,
              }}
              onClick={() => window.location.href = `/promoshare?pool=${pool.entity_id}`}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">PromoShare</h1>
            <p className="text-muted-foreground">
              Your activity earns you recurring rewards and recognition
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycles">Active Cycles</TabsTrigger>
          <TabsTrigger value="activity">My Activity</TabsTrigger>
          <TabsTrigger value="history">Win History</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                    <p className="text-2xl font-bold">{totalWeight}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <p className="text-2xl font-bold">{totalEntries}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Cycles</p>
                    <p className="text-2xl font-bold">{data.user_stats_by_cycle?.length || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wins</p>
                    <p className="text-2xl font-bold">{data.history?.length || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Cycle Status */}
          {primaryCycle && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {primaryCycle.cycle_name || `${primaryCycle.cycle_type} PromoShare`}
                    </CardTitle>
                    <CardDescription>
                      Your current standing in the active cycle
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(primaryCycle.status)}>
                    {getStatusLabel(primaryCycle.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weight Display */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Your Weight Score</span>
                      <span className="text-sm text-muted-foreground">{primaryCycle.weight} points</span>
                    </div>
                    <Progress value={Math.min((primaryCycle.weight / 50) * 100, 100)} className="h-3" />
                  </div>
                </div>

                {/* Progress to Qualification */}
                {!primaryCycle.eligible && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Complete these to qualify:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          primaryCycle.progress_to_qualify?.moves?.complete ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {primaryCycle.progress_to_qualify?.moves?.complete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Verified Actions</p>
                          <p className="text-xs text-muted-foreground">
                            {primaryCycle.progress_to_qualify?.moves?.current || 0} / {primaryCycle.progress_to_qualify?.moves?.required || 3}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          primaryCycle.progress_to_qualify?.moments?.complete ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {primaryCycle.progress_to_qualify?.moments?.complete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Join Moments</p>
                          <p className="text-xs text-muted-foreground">
                            {primaryCycle.progress_to_qualify?.moments?.current || 0} / {primaryCycle.progress_to_qualify?.moments?.required || 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          primaryCycle.progress_to_qualify?.referrals?.complete ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {primaryCycle.progress_to_qualify?.referrals?.complete ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Refer Friends</p>
                          <p className="text-xs text-muted-foreground">
                            {primaryCycle.progress_to_qualify?.referrals?.current || 0} / {primaryCycle.progress_to_qualify?.referrals?.required || 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {primaryCycle.eligible && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">You're Qualified!</p>
                      <p className="text-sm text-green-700">
                        Your activity has earned you {primaryCycle.weight} weight points. Keep participating to increase your chances!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How PromoShare Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">1. Participate</h4>
                  <p className="text-sm text-muted-foreground">Complete verified actions across Promorang</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">2. Earn Weight</h4>
                  <p className="text-sm text-muted-foreground">Each action increases your weighted score</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">3. Cycle Ends</h4>
                  <p className="text-sm text-muted-foreground">Winners are selected from qualified users</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">4. Win Rewards</h4>
                  <p className="text-sm text-muted-foreground">Claim gems, perks, and special access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CYCLES TAB */}
        <TabsContent value="cycles" className="space-y-4">
          {data.draws?.map((draw) => (
            <Card key={draw.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">{draw.cycle_type} Draw</CardTitle>
                    <CardDescription>{formatTimeRemaining(draw.end_at)}</CardDescription>
                  </div>
                  <Badge variant="secondary">{draw.userTickets} entries</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Jackpot</p>
                      <p className="text-2xl font-bold text-primary">{draw.jackpot_amount.toLocaleString()} Gems</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
                      <p className="text-2xl font-bold">{draw.totalTickets.toLocaleString()}</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Your Chance</p>
                      <p className="text-2xl font-bold">
                        {draw.totalTickets > 0 ? ((draw.userTickets / draw.totalTickets) * 100).toFixed(2) : 0}%
                      </p>
                    </div>
                  </div>

                  {draw.poolItems && draw.poolItems.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Pool Prizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {draw.poolItems.map((item) => (
                          <Badge key={item.id} variant="outline" className="px-3 py-1">
                            <Gift className="w-3 h-3 mr-1" />
                            {item.description} ({item.amount} {item.reward_type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!data.draws || data.draws.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Cycles</h3>
                <p className="text-muted-foreground">Check back soon for new PromoShare opportunities</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your verified actions that earned PromoShare entries</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {data.recent_entries?.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {entry.source_type === 'move' && <Activity className="w-4 h-4 text-primary" />}
                          {entry.source_type === 'moment' && <Zap className="w-4 h-4 text-primary" />}
                          {entry.source_type === 'referral' && <Share2 className="w-4 h-4 text-primary" />}
                          {entry.source_type === 'proof' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          {!['move', 'moment', 'referral', 'proof'].includes(entry.source_type) && (
                            <Award className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{entry.source_action || entry.source_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.cycles?.cycle_name || entry.cycles?.cycle_type || 'PromoShare'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          +{entry.weight_value} weight
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!data.recent_entries || data.recent_entries.length === 0) && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete verified actions to earn entries
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Activity by Source */}
          {data.user_stats_by_cycle?.map((cycle) => (
            cycle.entries_breakdown && Object.keys(cycle.entries_breakdown).length > 0 && (
              <Card key={cycle.cycle_id}>
                <CardHeader>
                  <CardTitle className="text-base">{cycle.cycle_name || cycle.cycle_type} - Activity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(cycle.entries_breakdown).map(([source, count]) => (
                      <div key={source} className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize">{source}s</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Win History</CardTitle>
              <CardDescription>Your past PromoShare wins and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              {data.history && data.history.length > 0 ? (
                <div className="space-y-3">
                  {data.history.map((win) => (
                    <div
                      key={win.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{win.prize_description}</p>
                          <p className="text-sm text-muted-foreground">
                            {win.cycles?.cycle_name || win.cycles?.cycle_type} • {win.selection_bucket}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(win.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={win.claimed ? 'bg-green-500' : 'bg-amber-500'}>
                        {win.claimed ? 'Claimed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Wins Yet</h3>
                  <p className="text-muted-foreground mb-4">Keep participating to increase your chances</p>
                  <Button onClick={() => setActiveTab('overview')}>
                    View Active Cycles
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromoShare;
