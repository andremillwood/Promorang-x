import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Megaphone,
  Target,
  Users,
  Link2,
  Coins,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  DollarSign,
  Gem,
  Calendar,
  Building2,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, useBrandStats } from "@/hooks/useCampaigns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";

// Modular Brand Consoles
import BrandCampaignFlightDeck from "@/components/brand/BrandCampaignFlightDeck";
import BrandOpportunityRadar from "@/components/brand/BrandOpportunityRadar";
import BrandCreatorBureau from "@/components/brand/BrandCreatorBureau";
import BrandCorrelationMap from "@/components/brand/BrandCorrelationMap";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";

export function BrandDashboardV2() {
  const { user, organizations, activeOrgId, profile } = useAuth();
  const { data: campaigns, isLoading: campaignsLoading } = useBrandCampaigns();
  const { isLoading: statsLoading } = useBrandStats();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "campaigns";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const activeOrg = organizations.find((org) => org.id === activeOrgId);
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
  const totalImpressions = campaigns?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 77600;
  const totalRedemptions = campaigns?.reduce((sum, c) => sum + (c.redemptions || 0), 0) || 2310;

  return (
    <div className="space-y-6 text-white pb-16 animate-in fade-in-50 duration-300">
      {/* 0. Top Story & Action Rail */}
      <StoryGamificationRail
        onOpenWheel={() => setWheelOpen(true)}
        onOpenStreak={() => setStreakOpen(true)}
      />

      {/* 1. Header & Live Brand Flight Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Megaphone className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {activeBrandName} Flight Command
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Omni-Channel Flight Live</span>
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Live campaign pacing, creator bounty pipeline, and O2O footfall verification.
            </p>
          </div>
        </div>

        {/* Quick Balance & Action Pills */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            to="/create/campaign"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black transition"
          >
            <Plus className="h-4 w-4" />
            <span>Launch Flight</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition"
          >
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-xs font-black text-white">Brand Escrow</span>
          </Link>
        </div>
      </div>

      {/* 2. Cultural Flight Action Runway */}
      <div className="p-4 sm:p-5 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/15 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-wider">
              Flight Cycle
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              Sponsorship & Creator Pipeline
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            Match Moments &rarr; Dispatch Bounties &rarr; Verify Footfalls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => handleTabChange("opportunities")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">1</span>
              <div>
                <p className="font-bold text-white text-xs">Sponsor Live Moments</p>
                <p className="text-[10px] text-primary font-semibold">Match high-affinity Kingston stages</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-primary transition" />
          </button>

          <button
            onClick={() => handleTabChange("creators")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">2</span>
              <div>
                <p className="font-bold text-white text-xs">Review Creator UGC</p>
                <p className="text-[10px] text-amber-300 font-semibold">Approve verified content bounties</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-amber-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("correlation")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">3</span>
              <div>
                <p className="font-bold text-white text-xs">Verify In-Person Footfalls</p>
                <p className="text-[10px] text-cyan-300 font-semibold">Audit door redemptions & ROI</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition" />
          </button>
        </div>
      </div>

      {/* 3. The 5 Operational Brand Navigation Arenas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { id: "campaigns", label: "Campaign Flight Deck", icon: Megaphone, hint: "Live flights & pace", count: `${activeCampaigns.length || 2} Live` },
          { id: "opportunities", label: "Opportunity Radar", icon: Target, hint: "AI moment match", count: "3 Hot" },
          { id: "creators", label: "Creator Bureau", icon: Users, hint: "UGC & bounties", count: "1 Pending" },
          { id: "correlation", label: "O2O Proof Map", icon: Link2, hint: "Footfall attribution", count: "4.9x ROI" },
          { id: "insights", label: "Treasury & Insights", icon: Coins, hint: "Escrow & APY", count: "$6.4k Vault" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between min-h-[115px] text-left group ${
                isActive
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/50"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-2xl ${isActive ? "bg-primary text-black" : "bg-white/5 text-primary group-hover:scale-105 transition"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50"}`}>
                  {tab.count}
                </span>
              </div>
              <div>
                <h3 className={`font-black text-xs ${isActive ? "text-primary" : "text-white group-hover:text-primary transition"}`}>
                  {tab.label}
                </h3>
                <p className="text-[10px] text-white/50">{tab.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Dedicated Modular Tab Content Viewports */}
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="sr-only">
              <TabsTrigger value="campaigns">Flight Deck</TabsTrigger>
              <TabsTrigger value="opportunities">Radar</TabsTrigger>
              <TabsTrigger value="creators">Creators</TabsTrigger>
              <TabsTrigger value="correlation">Proof Map</TabsTrigger>
              <TabsTrigger value="insights">Treasury</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="mt-0">
              <BrandCampaignFlightDeck
                onLaunchNew={() => handleTabChange("campaigns")}
              />
            </TabsContent>

            <TabsContent value="opportunities" className="mt-0">
              <BrandOpportunityRadar />
            </TabsContent>

            <TabsContent value="creators" className="mt-0">
              <BrandCreatorBureau />
            </TabsContent>

            <TabsContent value="correlation" className="mt-0">
              <BrandCorrelationMap />
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <BrandIntelligenceConsole />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Utility Rail */}
        <RightUtilityRail
          onOpenSlashModal={() => setSlashOpen(true)}
          onOpenStreakModal={() => setStreakOpen(true)}
        />
      </div>

      {/* Modals */}
      <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
      <TeamSlashModal isOpen={slashOpen} onClose={() => setSlashOpen(false)} />
      <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
    </div>
  );
}

export default BrandDashboardV2;
