import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Megaphone,
  LineChart,
  Users,
  Trophy,
  ExternalLink,
  TrendingUp,
  Zap,
  Copy,
  Eye,
  ArrowUpRight,
  Activity,
  Target,
  Rocket,
  BarChart3,
  Calendar,
  Share2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../lib/api';

interface Operator {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  type: string;
  status: string;
}

interface SeasonHub {
  id: string;
  operator_id: string;
  slug: string;
  name: string;
  description: string | null;
  access_type: string;
  status: string;
}

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [hubs, setHubs] = useState<SeasonHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingOperator, setCreatingOperator] = useState(false);
  const [creatingHub, setCreatingHub] = useState(false);

  useEffect(() => {
    void fetchOperatorAndHubs();
  }, []);

  const fetchOperatorAndHubs = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ operator: Operator | null }>('/operator/me');
      setOperator(data.operator ?? null);

      if (data.operator) {
        const hubsData = await apiFetch<{ hubs: SeasonHub[] }>('/operator/hubs');
        setHubs(hubsData.hubs || []);
      } else {
        setHubs([]);
      }
    } catch (error) {
      console.error('Failed to load operator data', error);
      toast({
        title: 'Error',
        description: 'Failed to load operator dashboard',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperator = async () => {
    try {
      setCreatingOperator(true);
      const randomHandle = `hub_${Math.random().toString(36).substring(2, 8)}`;
      const payload = {
        handle: randomHandle,
        display_name: 'Season Operator',
        type: 'operator',
      };
      const data = await apiFetch<{ operator: Operator }>('/operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setOperator(data.operator);
      toast({
        title: 'Operator created',
        description: 'You can now create and manage season hubs.',
        type: 'success',
      });
      void fetchOperatorAndHubs();
    } catch (error) {
      console.error('Failed to create operator', error);
      toast({
        title: 'Error',
        description: 'Failed to create operator profile',
        type: 'destructive',
      });
    } finally {
      setCreatingOperator(false);
    }
  };

  const handleCreateHub = async () => {
    try {
      setCreatingHub(true);
      const defaultName = 'My First Season';
      const payload = {
        name: defaultName,
        slug: 'my-first-season',
        description: 'Your first operator hub on Promorang.',
        access_type: 'open',
      };
      const data = await apiFetch<{ hub: SeasonHub }>('/operator/hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setHubs((prev) => [data.hub, ...prev]);
      toast({
        title: 'Season hub created',
        description: 'You can share this hub with your community.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to create hub', error);
      toast({
        title: 'Error',
        description: 'Failed to create season hub',
        type: 'destructive',
      });
    } finally {
      setCreatingHub(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-dynamic">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen-dynamic flex items-center justify-center bg-pr-surface-2">
        <Card className="max-w-xl w-full p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <LayoutDashboard className="h-12 w-12 text-purple-600" />
            <h1 className="text-2xl font-bold text-pr-text-1">Operate a Season</h1>
            <p className="text-pr-text-2">
              Turn your audience, brand, or community into a Season Hub on Promorang.
            </p>
            <p className="text-xs text-pr-text-2/80 max-w-md">
              As an operator you orchestrate campaigns, manage season hubs, and connect brands with the right creators.
            </p>
            <Button
              size="lg"
              className="mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateOperator}
              disabled={creatingOperator}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {creatingOperator ? 'Creating…' : 'Create Operator Profile'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const activeHubs = hubs.filter((hub) => hub.status === 'active');
  const totalCreators = hubs.length * 12; // Mock data
  const totalCampaigns = hubs.length * 8; // Mock data
  const engagementRate = 67; // Mock data

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Gradient Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs uppercase tracking-wide font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Season Operator</span>
              </div>
              <h1 className="text-4xl font-bold">{operator.display_name || 'Your Season Hub'}</h1>
              <p className="text-white/90 text-lg max-w-2xl">
                Orchestrate campaigns, manage season hubs, and connect brands with top creators in your ecosystem.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleCreateHub}
                disabled={creatingHub}
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                {creatingHub ? 'Creating...' : 'Create New Hub'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/marketplace')}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Explore Marketplace
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-xl">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>+{hubs.length > 0 ? 12 : 0}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-pr-text-2 font-medium">Total Hubs</p>
              <p className="text-3xl font-bold text-pr-text-1">{hubs.length}</p>
              <p className="text-xs text-pr-text-2">{activeHubs.length} active, {hubs.length - activeHubs.length} pending</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>+23%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-pr-text-2 font-medium">Active Creators</p>
              <p className="text-3xl font-bold text-pr-text-1">{totalCreators}</p>
              <p className="text-xs text-pr-text-2">Across all your hubs</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-cyan-600 rounded-xl">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>+18%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-pr-text-2 font-medium">Campaigns</p>
              <p className="text-3xl font-bold text-pr-text-1">{totalCampaigns}</p>
              <p className="text-xs text-pr-text-2">Running this month</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>+8%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-pr-text-2 font-medium">Engagement Rate</p>
              <p className="text-3xl font-bold text-pr-text-1">{engagementRate}%</p>
              <p className="text-xs text-pr-text-2">Above platform average</p>
            </div>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="hubs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="hubs" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">My Hubs</span>
              <span className="sm:hidden">Hubs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
              <span className="sm:hidden">Camps</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
              <span className="sm:hidden">Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* Hubs Tab */}
          <TabsContent value="hubs" className="space-y-6">
            {hubs.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-dashed">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <LayoutDashboard className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-pr-text-1">Create Your First Hub</h3>
                  <p className="text-pr-text-2">
                    Season hubs are your command center for running campaigns, coordinating creators, and tracking performance.
                  </p>
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleCreateHub}
                    disabled={creatingHub}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    {creatingHub ? 'Creating Hub…' : 'Create Season Hub'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hubs.map((hub) => (
                  <Card
                    key={hub.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group bg-pr-surface-card border border-pr-surface-3 hover:border-purple-400"
                    onClick={() => navigate(`/club/${hub.slug}`)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-pr-text-1 group-hover:text-purple-600 transition-colors">{hub.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold ${
                              hub.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {hub.status}
                            </span>
                          </div>
                          <p className="text-sm text-pr-text-2 line-clamp-2">
                            {hub.description || 'Season hub for your campaigns, drops, and community activations.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-pr-text-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 50) + 10} creators</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Megaphone className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 12) + 3} campaigns</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 30) + 50}% active</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-pr-surface-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-pr-text-2">
                          <span className="font-mono bg-pr-surface-2 px-2 py-1 rounded">{hub.slug}</span>
                          <span className={`px-2 py-1 rounded ${
                            hub.access_type === 'open' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {hub.access_type === 'open' ? 'Open Access' : 'Invite Only'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/club/${hub.slug}`);
                          }}
                          className="group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                        >
                          View Hub
                          <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-pr-text-1">Total Reach</h3>
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-pr-text-1">2.4M</p>
                <p className="text-sm text-pr-text-2 mt-1">Impressions this month</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>+32% from last month</span>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-pr-text-1">Conversion Rate</h3>
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-pr-text-1">8.7%</p>
                <p className="text-sm text-pr-text-2 mt-1">Campaign completion rate</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5.2% from last month</span>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-pr-text-1">Revenue</h3>
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-pr-text-1">$12.4K</p>
                <p className="text-sm text-pr-text-2 mt-1">Total earnings</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>+18% from last month</span>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Performance Overview</h3>
              <div className="h-64 flex items-center justify-center bg-pr-surface-1 rounded-lg border border-pr-surface-3">
                <p className="text-pr-text-2">Analytics charts coming soon</p>
              </div>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="p-6 bg-pr-surface-card border border-pr-surface-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-pr-text-1">Active Campaigns</h2>
                  <p className="text-pr-text-2 mt-1">Manage campaigns across all your hubs</p>
                </div>
                <Button onClick={() => navigate('/marketplace')} className="bg-cyan-600 hover:bg-cyan-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 bg-pr-surface-1 border border-pr-surface-3 hover:border-cyan-400 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-pr-text-1">Campaign #{i}</h4>
                        <p className="text-sm text-pr-text-2 mt-1">Running across {Math.floor(Math.random() * 3) + 1} hubs</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-pr-text-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 30) + 10}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 20) + 5}d left</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 40) + 60}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-pr-surface-card border border-pr-surface-3 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => navigate('/marketplace')}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-pr-text-1 mb-2">Drops & Content</h3>
                    <p className="text-sm text-pr-text-2 mb-3">
                      Create challenges and drops, then route creators to them from your hub or the marketplace.
                    </p>
                    <Button size="sm" variant="outline">
                      Open Marketplace
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-pr-surface-card border border-pr-surface-3 hover:border-emerald-400 transition-colors cursor-pointer" onClick={() => navigate('/leaderboard')}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-pr-text-1 mb-2">Predictions & Leaderboards</h3>
                    <p className="text-sm text-pr-text-2 mb-3">
                      Surface creator performance in public leaderboards and prediction markets.
                    </p>
                    <Button size="sm" variant="outline">
                      View Leaderboard
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-pr-surface-card border border-pr-surface-3 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-pr-text-1 mb-2">Sponsorships</h3>
                    <p className="text-sm text-pr-text-2 mb-3">
                      Position your hubs as programmable inventory for brands and sponsors.
                    </p>
                    <Button size="sm" variant="outline">
                      Advertiser View
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-pr-surface-card border border-pr-surface-3 hover:border-cyan-400 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                    <Share2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-pr-text-1 mb-2">Share & Promote</h3>
                    <p className="text-sm text-pr-text-2 mb-3">
                      Get shareable links and embed codes for your hubs and campaigns.
                    </p>
                    <Button size="sm" variant="outline">
                      Get Links
                      <Copy className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
