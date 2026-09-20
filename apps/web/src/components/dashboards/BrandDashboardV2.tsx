import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Link2,
  Megaphone,
  PackageCheck,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, useBrandStats } from "@/hooks/useCampaigns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";

// Modular Brand Consoles
import BrandCampaignFlightDeck from "@/components/brand/BrandCampaignFlightDeck";
import BrandOpportunityRadar from "@/components/brand/BrandOpportunityRadar";
import BrandCreatorBureau from "@/components/brand/BrandCreatorBureau";
import BrandCorrelationMap from "@/components/brand/BrandCorrelationMap";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";
import { BusinessOutcomeEntry } from "@/components/business/BusinessOutcomeEntry";

export function BrandDashboardV2() {
  const { user, organizations, activeOrgId, profile, agencyClients } = useAuth();
  const { data: campaigns, isLoading: campaignsLoading } = useBrandCampaigns();
  useBrandStats();
  const momentFeed = useCanonicalMomentFeed();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "campaigns";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const managingAgency = organizations.find((org) => org.type === "agency");
  const isManagedClient = agencyClients.some((client) => client.id === activeOrgId);
  const activeBrandName =
    activeOrg?.name || profile?.display_name || user?.user_metadata?.full_name || "Brand Partner";
  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab) setActiveTab(requestedTab);
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams((prev) => {
      prev.set("tab", val);
      return prev;
    });
  };

  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];
  const totalRedemptions = campaigns?.reduce((sum, c) => sum + (c.redemptions || 0), 0) || 0;
  const isNewBrandWorkspace = !campaignsLoading && (campaigns?.length || 0) === 0;

  if (isNewBrandWorkspace) {
    const pilotTitle = `First 50 for ${activeBrandName}`;
    const pilotOutcome = "Create one small measurable demand test, move 50 real people to act, and use the recorded result to decide what should scale.";

    return (
      <div className="space-y-6 pb-16 text-white animate-in fade-in-50 duration-300">
        <BusinessOutcomeEntry role="brand" />
        <section className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-black to-black p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  <Building2 className="h-3.5 w-3.5" />
                  Client workspace
                </span>
                {isManagedClient && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60">
                    Managed by {managingAgency?.name || "your agency"}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-black sm:text-4xl">{activeBrandName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                This workspace exists to turn marketing activity into measurable customer movement. Start with one outcome, prove it with real people, then decide what is worth scaling.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 lg:max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">What success means first</p>
              <p className="mt-2 text-sm font-bold text-white">50 attributable customer actions</p>
              <p className="mt-1 text-xs leading-5 text-white/55">Not impressions. Not vague awareness. People who actually choose, claim, visit, try, buy, review, or refer.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="rounded-3xl border border-border bg-card/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Recommended first activation</p>
                <h2 className="mt-2 text-xl font-black sm:text-2xl">{pilotTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{pilotOutcome}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Choose an action",
                  copy: "Decide the single customer behavior this test should create.",
                },
                {
                  step: "02",
                  title: "Give a reason to act",
                  copy: "Use an approved offer, sample, access, useful content, or other incentive that makes the action worthwhile.",
                },
                {
                  step: "03",
                  title: "Capture proof",
                  copy: "Track attributable claims, visits, redemptions, purchases, reviews, or referrals so the client can see what happened.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <span className="text-[10px] font-black text-primary">{item.step}</span>
                  <h3 className="mt-2 text-sm font-black">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">{item.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-xl font-black">
                <Link to="/create/campaign">
                  Build the free pilot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => handleTabChange("demand")}>
                See what people are asking for
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Before launch</p>
            <h2 className="mt-2 text-xl font-black">What needs to be confirmed before launch</h2>
            <div className="mt-5 space-y-3">
              {[
                "Confirm the product, service, or offer being promoted",
                "Approved product details, pack sizes and current pricing where relevant",
                "Approved images or creative assets",
                "The incentive or customer reason to act",
                "Where the customer action happens: online, retail, event, QR, WhatsApp, or another channel",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-5 text-white/65">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-white/40">You can prepare the campaign before every asset is supplied. Do not invent prices, product claims, or promotions on the client’s behalf.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/70 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">The reason to use Promorang</p>
              <h2 className="mt-2 text-xl font-black">From activity to a client decision</h2>
            </div>
            <span className="text-xs font-bold text-white/45">Start small → prove movement → scale only what works</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              { icon: Sparkles, title: "Launch", copy: "Put one clear customer action into market." },
              { icon: Users, title: "Move people", copy: "Get the first 50 attributable participants." },
              { icon: PackageCheck, title: "Prove", copy: "Show what people actually did, not only what they saw." },
              { icon: TrendingUp, title: "Decide", copy: "Use the result to stop, adjust, or scale the next activation." },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-black">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/50">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white pb-16 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Megaphone className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeBrandName} Demand Workspace</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>{activeCampaigns.length} active</span>
              </span>
              {isManagedClient && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/60">
                  Managed by {managingAgency?.name || "agency"}
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 mt-0.5">Launch demand, measure attributable customer action, and decide what deserves more budget.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link to="/create/campaign" className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black transition">
            <Plus className="h-4 w-4" />
            <span>New activation</span>
          </Link>
          <Link to="/wallet" className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-xs font-black text-white">Budget</span>
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/15 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-wider">Operating loop</span>
            <span className="font-bold text-white text-xs sm:text-sm">Create demand → capture proof → decide what scales</span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">Keep every activation tied to a measurable customer action.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button onClick={() => handleTabChange("opportunities")} className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">1</span>
              <div><p className="font-bold text-white text-xs">Choose the demand opportunity</p><p className="text-[10px] text-primary font-semibold">What should people do next?</p></div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-primary transition" />
          </button>
          <button onClick={() => handleTabChange("creators")} className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">2</span>
              <div><p className="font-bold text-white text-xs">Distribute the activation</p><p className="text-[10px] text-amber-300 font-semibold">Use creators, channels and partners</p></div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-amber-400 transition" />
          </button>
          <button onClick={() => handleTabChange("correlation")} className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left">
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">3</span>
              <div><p className="font-bold text-white text-xs">Review attributable results</p><p className="text-[10px] text-cyan-300 font-semibold">See what people actually did</p></div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { id: "demand", label: "Demand signals", icon: Vote, hint: "What people are asking for", count: "Live" },
          { id: "campaigns", label: "Activations", icon: Megaphone, hint: "Campaigns and budget", count: `${activeCampaigns.length} live` },
          { id: "opportunities", label: "Opportunities", icon: Target, hint: "Places and moments to activate", count: momentFeed.isLoading ? "Checking" : `${(momentFeed.data?.moments || []).filter((moment) => moment.sponsorship_ready).length} ready` },
          { id: "creators", label: "Distribution", icon: Users, hint: "Creator and partner work", count: "Review" },
          { id: "correlation", label: "Proof", icon: Link2, hint: "Attributed customer action", count: "Measured" },
          { id: "insights", label: "Economics", icon: Coins, hint: "Budget and outcomes", count: `${totalRedemptions} redeemed` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between min-h-[115px] text-left group ${isActive ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/50" : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"}`}>
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-2xl ${isActive ? "bg-primary text-black" : "bg-white/5 text-primary group-hover:scale-105 transition"}`}><Icon className="h-4 w-4" /></span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50"}`}>{tab.count}</span>
              </div>
              <div><h3 className={`font-black text-xs ${isActive ? "text-primary" : "text-white group-hover:text-primary transition"}`}>{tab.label}</h3><p className="text-[10px] text-white/50">{tab.hint}</p></div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="sr-only">
              <TabsTrigger value="demand">Demand</TabsTrigger>
              <TabsTrigger value="campaigns">Activations</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="creators">Distribution</TabsTrigger>
              <TabsTrigger value="correlation">Proof</TabsTrigger>
              <TabsTrigger value="insights">Economics</TabsTrigger>
            </TabsList>
            <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="brand" /></TabsContent>
            <TabsContent value="campaigns" className="mt-0"><BrandCampaignFlightDeck onLaunchNew={() => handleTabChange("campaigns")} /></TabsContent>
            <TabsContent value="opportunities" className="mt-0"><BrandOpportunityRadar /></TabsContent>
            <TabsContent value="creators" className="mt-0"><BrandCreatorBureau /></TabsContent>
            <TabsContent value="correlation" className="mt-0"><BrandCorrelationMap /></TabsContent>
            <TabsContent value="insights" className="mt-0"><BrandIntelligenceConsole /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default BrandDashboardV2;
