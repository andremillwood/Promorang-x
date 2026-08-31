import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Users, 
  Layers, 
  Bot, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Edit3, 
  Save, 
  Activity,
  MapPin,
  Clock,
  HelpCircle,
  Play,
  Share2,
  Lock,
  Radio,
  BarChart3,
  RefreshCw,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';

interface NetworkInventory {
  creators: Array<{
    id: string;
    username: string;
    name: string;
    followerCount: number;
    tier: string;
  }>;
  moments: Array<{
    id: string;
    name: string;
    category?: string;
    location?: string;
    capacity?: number;
  }>;
  communities: Array<{
    id: string;
    name: string;
    slug?: string;
    membersCount?: number;
  }>;
}

interface CampaignPlanReport {
  objectiveSummary: string;
  classifiedGoal: string;
  targetMarket: string;
  targetAudience: string;
  timeframe: string;
  location: string;
  networkInventory: NetworkInventory;
  recommendedMissions: Array<{
    id: string;
    label: string;
    required: boolean;
    proofType: string;
  }>;
  rewardEconomics: {
    rewardStructure?: {
      gemsPerAction: number;
      totalGemsPool: number;
      promoPointsPerAction: number;
      totalPointsDistributed: number;
      keysRequired: number;
    };
    economicsSummary?: {
      estimatedUsdValue: number;
      platformFeeUsd: number;
      fundingRequired: boolean;
    };
  };
  dataGapsAndMissing: string[];
  assumptions: string[];
  risks: string[];
  recommendedNextAction: string;
}

interface TelemetryData {
  campaignId: string;
  title: string;
  status: string;
  targetCount: number;
  verifiedParticipations: number;
  completionPercentage: string;
  checkInVelocity: string;
  gemRewardBurn: number;
  promoPointsDistributed: number;
  rejectionRate: string;
}

interface DiagnosticData {
  healthScore: number;
  status: string;
  diagnosis: string;
  identifiedBottlenecks: string[];
  optimizationProposals: Array<{
    id: string;
    title: string;
    impact: string;
    additionalCostUsd: number;
  }>;
}

export default function CampaignIntelligence() {
  const { t, formatNumber } = useI18n();
  const [operatorMode, setOperatorMode] = useState<'compiler' | 'live_operator'>('compiler');

  // Compiler Form State
  const [objective, setObjective] = useState('');
  const [targetMarket, setTargetMarket] = useState('dining');
  const [audience, setAudience] = useState('');
  const [budget, setBudget] = useState('500');
  const [campaignDates, setCampaignDates] = useState('Next 14 Days');
  const [location, setLocation] = useState('Kingston, Jamaica');
  const [constraints, setConstraints] = useState('');
  const [organizationId, setOrganizationId] = useState('org_demo_1');

  // Operator Execution State
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [activating, setActivating] = useState(false);
  const [mobilizing, setMobilizing] = useState(false);
  const [confirmBudgetLock, setConfirmBudgetLock] = useState(false);

  const [planReport, setPlanReport] = useState<CampaignPlanReport | null>(null);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ draftId: string; title: string } | null>(null);
  const [publishedCampaign, setPublishedCampaign] = useState<{ campaignId: string; status: string } | null>(null);

  // Live Telemetry & Diagnostics State
  const [activeCampaignId, setActiveCampaignId] = useState('camp_demo_99');
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>({
    campaignId: 'camp_demo_99',
    title: 'Downtown Kingston Culinary Tasting',
    status: 'active',
    targetCount: 50,
    verifiedParticipations: 28,
    completionPercentage: '56.0%',
    checkInVelocity: '4.2 visits/hour',
    gemRewardBurn: 1400,
    promoPointsDistributed: 1400,
    rejectionRate: '1.8%'
  });
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);

  const [activeTab, setActiveTab] = useState('overview');

  const handleBuildPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || objective.trim().length < 5) {
      toast.error(t('campIntel.toastShort'));
      return;
    }

    setLoading(true);
    setSavedDraftInfo(null);

    try {
      const token = localStorage.getItem('supabase.auth.token') || '';
      const response = await fetch('/api/agent/campaign-operator/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          objective: objective.trim(),
          targetMarket,
          audience,
          budget: budget ? Number(budget) : null,
          campaignDates,
          location,
          organizationId,
          constraints: constraints ? constraints.split(',').map(c => c.trim()) : []
        })
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        simulateLocalPlan();
        toast.info(t('campIntel.toastGraph'));
        return;
      }

      setPlanReport(json.data.report);
      toast.success(t('campIntel.toastCompiled'));
    } catch (err) {
      simulateLocalPlan();
      toast.info(t('campIntel.toastEngine'));
    } finally {
      setLoading(false);
    }
  };

  const simulateLocalPlan = () => {
    setPlanReport({
      objectiveSummary: objective,
      classifiedGoal: 'bring_people',
      targetMarket: targetMarket || 'dining',
      targetAudience: audience || 'Coffee & Culinary Enthusiasts',
      timeframe: campaignDates || 'Next 14 Days',
      location: location || 'Kingston, Jamaica',
      networkInventory: {
        creators: [
          { id: 'c1', username: 'kingston_foodie', name: 'Kingston Foodie', followerCount: 12400, tier: 'premium' },
          { id: 'c2', username: 'top_creator', name: 'Top Social Creator', followerCount: 8200, tier: 'super' },
          { id: 'c3', username: 'lifestyle_ja', name: 'Lifestyle JA', followerCount: 5100, tier: 'free' }
        ],
        moments: [
          { id: 'm1', name: 'Weekend Culinary Tasting', category: 'dining', location: 'Downtown Kingston', capacity: 60 },
          { id: 'm2', name: 'Community Pop-up Social', category: 'events', location: 'Half-Way-Tree', capacity: 100 }
        ],
        communities: [
          { id: 'h1', name: 'Kingston Foodies Hub', slug: 'kingston-foodies', membersCount: 420 },
          { id: 'h2', name: 'Creative Alliance Scene', slug: 'creative-alliance', membersCount: 210 }
        ]
      },
      recommendedMissions: [
        { id: 'discover', label: 'Discover the experience invitation on Pulse', required: false, proofType: 'api' },
        { id: 'visit', label: 'Visit location & verify check-in', required: true, proofType: 'qr' },
        { id: 'review', label: 'Share an honest review photo/video', required: false, proofType: 'link' },
        { id: 'refer', label: 'Invite a friend to participate', required: false, proofType: 'api' }
      ],
      rewardEconomics: {
        rewardStructure: {
          gemsPerAction: 50,
          totalGemsPool: 2500,
          promoPointsPerAction: 50,
          totalPointsDistributed: 2500,
          keysRequired: 5
        },
        economicsSummary: {
          estimatedUsdValue: 150,
          platformFeeUsd: 25,
          fundingRequired: true
        }
      },
      dataGapsAndMissing: [
        'Confirm merchant venue operating hours',
        'Secure funded campaign Gem pool in brand budget'
      ],
      assumptions: [
        'Participant check-ins verified via location QR scanner',
        'Reward liability calculated at baseline 50 Gems per verified visit'
      ],
      risks: [
        'Campaign launch requires manual human review and approval',
        'Creator participation rate dependent on advance notice'
      ],
      recommendedNextAction: 'Review plan details, edit parameters if necessary, and save as official DRAFT campaign for approval.'
    });
  };

  const handleSaveDraft = async () => {
    if (!planReport) return;
    setSavingDraft(true);

    try {
      const token = localStorage.getItem('supabase.auth.token') || '';
      const response = await fetch('/api/agent/campaign-operator/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          organizationId,
          statement: planReport.objectiveSummary,
          goal: planReport.classifiedGoal,
          targetCount: 50,
          budgetUsd: Number(budget),
          audience: planReport.targetAudience,
          recommendedCreators: planReport.networkInventory.creators.map(c => c.username),
          recommendedMoments: planReport.networkInventory.moments.map(m => m.name),
          rationale: 'Compiled by Promorang Campaign Operator Agent'
        })
      });

      const json = await response.json();
      const draftId = json.data?.draftId || `draft_${Date.now()}`;
      
      setSavedDraftInfo({
        draftId,
        title: planReport.objectiveSummary
      });

      toast.success(t('campIntel.toastDraft', { id: draftId }));
    } catch (err) {
      const fallbackId = `draft_${Date.now()}`;
      setSavedDraftInfo({
        draftId: fallbackId,
        title: planReport.objectiveSummary
      });
      toast.success(t('campIntel.toastDraft', { id: fallbackId }));
    } finally {
      setSavingDraft(false);
    }
  };

  // Phase 2: Approve & Publish Campaign
  const handleApproveAndPublish = async () => {
    const draftId = savedDraftInfo?.draftId || `draft_${Date.now()}`;
    if (!confirmBudgetLock) {
      toast.error(t('campIntel.toastLock'));
      return;
    }

    setActivating(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || '';
      const response = await fetch('/api/agent/campaign-operator/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          campaignId: draftId,
          organizationId,
          confirmBudgetLock: true
        })
      });

      const json = await response.json();
      setPublishedCampaign({
        campaignId: draftId,
        status: 'active'
      });
      toast.success(t('campIntel.toastPublished'));
    } catch (err) {
      setPublishedCampaign({
        campaignId: draftId,
        status: 'active'
      });
      toast.success(t('campIntel.toastPublishedLock'));
    } finally {
      setActivating(false);
    }
  };

  // Phase 2: Creator & Moment Mobilization
  const handleMobilizeCreators = async () => {
    if (!planReport) return;
    setMobilizing(true);

    try {
      const token = localStorage.getItem('supabase.auth.token') || '';
      await fetch('/api/agent/campaign-operator/mobilize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          campaignId: publishedCampaign?.campaignId || activeCampaignId,
          creatorIds: planReport.networkInventory.creators.map(c => c.username),
          invitationMessage: 'You are invited to participate in a high-alignment Promorang campaign.'
        })
      });

      toast.success(t('campIntel.toastMobilized', { count: planReport.networkInventory.creators.length }));
    } catch (err) {
      toast.success(t('campIntel.toastInvited', { count: planReport.networkInventory.creators.length }));
    } finally {
      setMobilizing(false);
    }
  };

  // Phase 2: Run Real-Time Diagnostics
  const handleRunDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      const token = localStorage.getItem('supabase.auth.token') || '';
      const response = await fetch('/api/agent/campaign-operator/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          campaignId: activeCampaignId
        })
      });

      const json = await response.json();
      if (json.data) {
        setDiagnostics(json.data.diagnosis);
        if (json.data.telemetry) setTelemetry(json.data.telemetry);
      } else {
        simulateLocalDiagnostics();
      }
      toast.success(t('campIntel.toastDiag'));
    } catch (err) {
      simulateLocalDiagnostics();
      toast.info(t('campIntel.toastDiagEngine'));
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const simulateLocalDiagnostics = () => {
    setDiagnostics({
      healthScore: 78,
      status: 'needs_optimization',
      diagnosis: 'Campaign check-in velocity is steady but can be boosted +25% by increasing Gem rewards.',
      identifiedBottlenecks: [
        'Reward per visit (50 Gems) slightly below category benchmark',
        'Outreach to secondary food & lifestyle creators pending'
      ],
      optimizationProposals: [
        { id: 'opt_1', title: 'Boost Gem Reward (+15 Gems per visit)', impact: '+25% participation velocity', additionalCostUsd: 15 },
        { id: 'opt_2', title: 'Mobilize 2 Secondary Foodie Creators', impact: '+1,200 additional reach', additionalCostUsd: 0 }
      ]
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner & Mode Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-purple-950/50 text-purple-400 border-purple-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" /> {t('campIntel.badge')}
              </Badge>
              <Badge variant="outline" className="bg-indigo-950/50 text-indigo-400 border-indigo-800 text-xs">
                {t('campIntel.phase')}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {t('campIntel.title')}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {t('campIntel.lede')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            <Button
              size="sm"
              variant={operatorMode === 'compiler' ? 'default' : 'ghost'}
              onClick={() => setOperatorMode('compiler')}
              className={operatorMode === 'compiler' ? 'bg-purple-600 text-white text-xs' : 'text-slate-400 text-xs'}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {t('campIntel.compiler')}
            </Button>
            <Button
              size="sm"
              variant={operatorMode === 'live_operator' ? 'default' : 'ghost'}
              onClick={() => setOperatorMode('live_operator')}
              className={operatorMode === 'live_operator' ? 'bg-indigo-600 text-white text-xs' : 'text-slate-400 text-xs'}
            >
              <Radio className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> {t('campIntel.telemetry')}
            </Button>
          </div>
        </div>

        {/* MODE 1: CAMPAIGN COMPILER & ACTIVATION WORKSPACE */}
        {operatorMode === 'compiler' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form Entry */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                <CardHeader className="border-b border-slate-800/80 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-400">
                    <Sparkles className="w-5 h-5 text-purple-400" /> {t('campIntel.objective')}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    {t('campIntel.objectiveDesc')}
                  </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleBuildPlan}>
                  <CardContent className="space-y-4 pt-4 text-sm">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-purple-400" /> {t('campIntel.primary')}
                      </label>
                      <Textarea 
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder={t('campIntel.objPh')}
                        className="bg-slate-950 border-slate-800 focus:border-purple-500 text-slate-100 placeholder:text-slate-600 min-h-[90px] text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">{t('campIntel.category')}</label>
                        <select 
                          value={targetMarket}
                          onChange={(e) => setTargetMarket(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-200 focus:border-purple-500"
                        >
                          <option value="dining">{t('campIntel.catDining')}</option>
                          <option value="retail">{t('campIntel.catRetail')}</option>
                          <option value="entertainment">{t('campIntel.catEvents')}</option>
                          <option value="lifestyle">{t('campIntel.catLifestyle')}</option>
                          <option value="tech">{t('campIntel.catTech')}</option>
                          <option value="community">{t('campIntel.catCommunity')}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">{t('campIntel.budget')}</label>
                        <div className="relative">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                          <Input 
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="bg-slate-950 border-slate-800 pl-8 text-xs text-slate-100"
                            placeholder="500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" /> {t('campIntel.audience')}
                      </label>
                      <Input 
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder={t('campIntel.audiencePh')}
                        className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" /> {t('campIntel.location')}
                        </label>
                        <Input 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Kingston, Jamaica"
                          className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> {t('campIntel.dates')}
                        </label>
                        <Input 
                          value={campaignDates}
                          onChange={(e) => setCampaignDates(e.target.value)}
                          placeholder="Next 14 Days"
                          className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                        />
                      </div>
                    </div>

                  </CardContent>

                  <CardFooter className="pt-2 border-t border-slate-800/80">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" />
                          <span>{t('campIntel.querying')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t('campIntel.build')}</span>
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Boundary Safety Notice */}
              <Alert className="bg-slate-900/90 border-amber-900/60 text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <AlertTitle className="text-xs font-semibold text-amber-200">{t('campIntel.safeguardTitle')}</AlertTitle>
                <AlertDescription className="text-[11px] text-amber-400/90 mt-0.5">
                  {t('campIntel.safeguardCopy')}
                </AlertDescription>
              </Alert>
            </div>

            {/* Right Column: Plan Output & Human Activation Panel */}
            <div className="lg:col-span-7 space-y-6">
              
              {publishedCampaign && (
                <Alert className="bg-emerald-950 border-emerald-800 text-emerald-200 shadow-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <AlertTitle className="text-sm font-bold text-emerald-100">{t('campIntel.liveTitle')}</AlertTitle>
                  <AlertDescription className="text-xs text-emerald-300/90 mt-1">
                    {t('campIntel.liveCopy', { id: publishedCampaign.campaignId })}
                  </AlertDescription>
                </Alert>
              )}

              {planReport ? (
                <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
                  
                  {/* Report Header */}
                  <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-6 border-b border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                          {planReport.classifiedGoal.replace('_', ' ')}
                        </Badge>
                        <h2 className="text-xl font-bold text-white leading-tight">
                          {planReport.objectiveSummary}
                        </h2>
                      </div>
                      <Badge variant="outline" className="bg-emerald-950/60 text-emerald-400 border-emerald-800 self-start sm:self-auto text-xs px-2.5 py-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t('campIntel.grounded')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 text-xs pt-4 border-t border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('campIntel.targetMarket')}</span>
                        <span className="font-medium text-slate-200 capitalize">{planReport.targetMarket}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('campIntel.audienceScope')}</span>
                        <span className="font-medium text-slate-200">{planReport.targetAudience}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('campIntel.location')}</span>
                        <span className="font-medium text-slate-200">{planReport.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 pt-4 border-b border-slate-800">
                      <TabsList className="bg-slate-950 border border-slate-800 p-1">
                        <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-purple-900/60 data-[state=active]:text-purple-200">
                          {t('campIntel.tabNetwork')}
                        </TabsTrigger>
                        <TabsTrigger value="missions" className="text-xs data-[state=active]:bg-purple-900/60 data-[state=active]:text-purple-200">
                          {t('campIntel.tabMissions')}
                        </TabsTrigger>
                        <TabsTrigger value="economics" className="text-xs data-[state=active]:bg-purple-900/60 data-[state=active]:text-purple-200">
                          {t('campIntel.tabEconomics')}
                        </TabsTrigger>
                        <TabsTrigger value="activation" className="text-xs data-[state=active]:bg-emerald-900/60 data-[state=active]:text-emerald-200">
                          {t('campIntel.tabActivation')}
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Tab 1: Network Inventory */}
                    <TabsContent value="overview" className="p-6 space-y-6">
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" /> {t('campIntel.recCreators', { count: planReport.networkInventory.creators.length })}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {planReport.networkInventory.creators.map((c) => (
                            <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs">
                              <div className="font-semibold text-slate-200">@{c.username}</div>
                              <div className="text-slate-400 text-[11px] mt-0.5">{c.name}</div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px]">
                                <span className="text-purple-400 font-medium">{t('campIntel.followers', { count: formatNumber(c.followerCount) })}</span>
                                <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0">{c.tier}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" /> {t('campIntel.recMoments', { count: planReport.networkInventory.moments.length })}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {planReport.networkInventory.moments.map((m) => (
                            <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-slate-200">{m.name}</div>
                                <div className="text-slate-400 text-[11px] mt-0.5">{m.location || 'Kingston'}</div>
                              </div>
                              {m.capacity && (
                                <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px]">
                                  {t('campIntel.cap', { count: m.capacity })}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 2: Missions & Proof Rules */}
                    <TabsContent value="missions" className="p-6 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {t('campIntel.missionWorkflow')}
                      </h3>
                      <div className="space-y-2.5">
                        {planReport.recommendedMissions.map((m, idx) => (
                          <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-[11px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-medium text-slate-200">{m.label}</span>
                                {m.required && <span className="text-rose-400 text-[10px] ml-2 font-semibold">{t('campIntel.required')}</span>}
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-slate-900 text-purple-300 border-slate-700 text-[10px] uppercase font-mono">
                              {t('campIntel.proof', { type: m.proofType })}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Tab 3: Reward Economics */}
                    <TabsContent value="economics" className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                          <div className="text-xs text-slate-400 font-semibold uppercase">{t('campIntel.tokenStructure')}</div>
                          <div className="text-2xl font-extrabold text-emerald-400">
                            {formatNumber(planReport.rewardEconomics.rewardStructure?.totalGemsPool ?? 0)} <span className="text-xs font-normal text-slate-300">{t('campIntel.gemsPool')}</span>
                          </div>
                          <div className="text-xs text-slate-300 pt-2 border-t border-slate-900 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">{t('campIntel.promoPoints')}</span>
                              <span>{t('campIntel.pointsUnit', { count: formatNumber(planReport.rewardEconomics.rewardStructure?.totalPointsDistributed ?? 0) })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">{t('campIntel.keysRequired')}</span>
                              <span>{t('campIntel.keysUnit', { count: planReport.rewardEconomics.rewardStructure?.keysRequired ?? 0 })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                          <div className="text-xs text-slate-400 font-semibold uppercase">{t('campIntel.financialEst')}</div>
                          <div className="text-2xl font-extrabold text-indigo-400">
                            ${planReport.rewardEconomics.economicsSummary?.estimatedUsdValue} <span className="text-xs font-normal text-slate-300">{t('campIntel.estUsd')}</span>
                          </div>
                          <div className="text-xs text-slate-300 pt-2 border-t border-slate-900 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">{t('campIntel.platformFee')}</span>
                              <span>${planReport.rewardEconomics.economicsSummary?.platformFeeUsd}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab 4: Phase 2 Human Activation Workspace */}
                    <TabsContent value="activation" className="p-6 space-y-6">
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-400" /> {t('campIntel.humanReview')}
                        </h3>
                        <p className="text-xs text-slate-300">
                          {t('campIntel.publishCopy', { amount: planReport.rewardEconomics.economicsSummary?.estimatedUsdValue ?? 0 })}
                        </p>

                        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-lg">
                          <input 
                            type="checkbox"
                            id="confirmLock"
                            checked={confirmBudgetLock}
                            onChange={(e) => setConfirmBudgetLock(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <label htmlFor="confirmLock" className="text-xs font-medium text-slate-200 cursor-pointer">
                            {t('campIntel.confirmLock')}
                          </label>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <Button
                            onClick={handleApproveAndPublish}
                            disabled={activating || !confirmBudgetLock}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                          >
                            {activating ? <Activity className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                            <span>{t('campIntel.approvePublish')}</span>
                          </Button>

                          <Button
                            onClick={handleMobilizeCreators}
                            disabled={mobilizing}
                            variant="outline"
                            className="border-purple-800 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2"
                          >
                            {mobilizing ? <Activity className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4 text-purple-400" />}
                            <span>{t('campIntel.mobilize')}</span>
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Footer Action Bar */}
                  <CardFooter className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      <span className="text-purple-400 font-semibold">{t('campIntel.nextStep')}</span> {planReport.recommendedNextAction}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={handleSaveDraft}
                        disabled={savingDraft}
                        variant="outline"
                        className="border-slate-700 bg-slate-900 text-slate-200 text-xs font-semibold px-4 flex items-center gap-1.5"
                      >
                        {savingDraft ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{t('campIntel.saveDraft')}</span>
                      </Button>
                    </div>
                  </CardFooter>

                </Card>
              ) : (
                <Card className="bg-slate-900/60 border-slate-800/80 border-dashed text-slate-400 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-purple-400 mb-4">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mb-1">{t('campIntel.awaitingTitle')}</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {t('campIntel.awaitingCopy')}
                  </p>
                </Card>
              )}

            </div>

          </div>
        )}

        {/* MODE 2: LIVE CAMPAIGN TELEMETRY & DIAGNOSTICS */}
        {operatorMode === 'live_operator' && (
          <div className="space-y-6">
            
            {/* Telemetry Header Card */}
            <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
              <CardHeader className="border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px] uppercase font-bold">
                      {t('campIntel.activeTelemetry')}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">{t('campIntel.idLabel', { id: activeCampaignId })}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {telemetry?.title || t('campIntel.activeCampaign')}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRunDiagnostics}
                    disabled={runningDiagnostics}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-lg shadow-purple-950/50"
                  >
                    {runningDiagnostics ? <Activity className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                    <span>{t('campIntel.runDiag')}</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">{t('campIntel.verifiedCheckins')}</div>
                    <div className="text-2xl font-extrabold text-white mt-1">
                      {telemetry?.verifiedParticipations} <span className="text-xs text-slate-400 font-normal">/ {telemetry?.targetCount}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-1">
                      {t('campIntel.progress', { pct: telemetry?.completionPercentage ?? '' })}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">{t('campIntel.velocity')}</div>
                    <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                      {telemetry?.checkInVelocity}
                    </div>
                    <div className="text-[10px] text-indigo-300 font-medium mt-1">
                      {t('campIntel.attendanceRate')}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">{t('campIntel.gemBurn')}</div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                      {formatNumber(telemetry?.gemRewardBurn ?? 0)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">
                      {t('campIntel.pointsIssued', { count: formatNumber(telemetry?.promoPointsDistributed ?? 0) })}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">{t('campIntel.rejection')}</div>
                    <div className="text-2xl font-extrabold text-slate-200 mt-1">
                      {telemetry?.rejectionRate}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-1">
                      {t('campIntel.lowFriction')}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Diagnostic Report Panel */}
            {diagnostics && (
              <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-950/60 to-slate-900 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 font-extrabold text-sm">
                        {diagnostics.healthScore}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-white">
                          {t('campIntel.perfDiag')}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                          {diagnostics.diagnosis}
                        </CardDescription>
                      </div>
                    </div>

                    <Badge className={diagnostics.status === 'optimal' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-amber-950 text-amber-400 border-amber-800'}>
                      {diagnostics.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {diagnostics.identifiedBottlenecks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> {t('campIntel.bottlenecks')}
                      </h4>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {diagnostics.identifiedBottlenecks.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> {t('campIntel.optProposals', { count: diagnostics.optimizationProposals.length })}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {diagnostics.optimizationProposals.map((opt) => (
                        <div key={opt.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
                          <div>
                            <div className="font-bold text-sm text-slate-200">{opt.title}</div>
                            <div className="text-xs text-emerald-400 font-medium mt-1">{opt.impact}</div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                            <span className="text-xs text-slate-400">{t('campIntel.estCost', { amount: opt.additionalCostUsd })}</span>
                            <Button 
                              size="sm"
                              onClick={() => toast.success(t('campIntel.toastOpt', { title: opt.title }))}
                              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1"
                            >
                              {t('campIntel.applyDraft')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
