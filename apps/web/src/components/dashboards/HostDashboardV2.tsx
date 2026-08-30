import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Activity,
  ShieldCheck,
  Handshake,
  BarChart3,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  DollarSign,
  Gem,
  Radio,
  Users,
  ChevronRight,
  Vote,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHostedMoments, useHostStats } from "@/hooks/useMoments";
import { useHostEconomy } from "@/hooks/useStakeholderEconomy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";

// Modular Host Consoles
import HostMomentsStagingConsole from "@/components/host/HostMomentsStagingConsole";
import HostLivePulseConsole from "@/components/host/HostLivePulseConsole";
import HostProofReviewConsole from "@/components/host/HostProofReviewConsole";
import HostSponsorshipConsole from "@/components/host/HostSponsorshipConsole";
import HostImpactYieldConsole from "@/components/host/HostImpactYieldConsole";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";

export function HostDashboardV2() {
  const { user } = useAuth();
  const { data: hostedMoments, isLoading: momentsLoading } = useHostedMoments();
  const { data: stats, isLoading: statsLoading } = useHostStats();
  const { data: economy, isLoading: economyLoading } = useHostEconomy();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "moments";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

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

  const totalParticipants = stats?.totalParticipants || 85;
  const hostName = user?.user_metadata?.full_name || "Host";

  return (
    <div className="space-y-6 text-white pb-16 animate-in fade-in-50 duration-300">
      {/* 0. Top Story & Action Rail */}
      <StoryGamificationRail
        onOpenWheel={() => setWheelOpen(true)}
        onOpenStreak={() => setStreakOpen(true)}
      />

      {/* 1. Header & Live Stage Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-black backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Calendar className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Host Stage Command & Pulse
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Host Station Active</span>
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Curate live gatherings, broadcast in-room announcements, verify guest proofs, and lock brand sponsorships.
            </p>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            to="/create/moment"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-black transition"
          >
            <Plus className="h-4 w-4" />
            <span>Stage Moment</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 transition"
          >
            <Gem className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-black text-white">Host Vault</span>
          </Link>
        </div>
      </div>

      {/* 2. Host Action Runway */}
      <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/25 bg-gradient-to-r from-amber-950/15 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider">
              Stage Lifecycle
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              Today's Gathering Flow
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            Stage Lineup &rarr; Pulse Announcements &rarr; Credit Attendee Proofs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => handleTabChange("moments")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">1</span>
              <div>
                <p className="font-bold text-white text-xs">Stage Next Gathering</p>
                <p className="text-[10px] text-amber-300 font-semibold">Publish moment & set door perks</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-amber-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("pulse")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">2</span>
              <div>
                <p className="font-bold text-white text-xs">Live Room Pulse & Push</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Broadcast micro-drops to guests</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("review")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
              <div>
                <p className="font-bold text-white text-xs">Verify Guest Proofs</p>
                <p className="text-[10px] text-cyan-300 font-semibold">Disburse points & credit status</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition" />
          </button>
        </div>
      </div>

      {/* 3. The 5 Operational Host Arenas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { id: "demand", label: "City Demand", icon: Vote, hint: "What people named", count: "Live asks" },
          { id: "moments", label: "Stage Lineup", icon: Calendar, hint: "Moments & RSVP", count: `${hostedMoments?.length || 2} Staged` },
          { id: "pulse", label: "Live Room Pulse", icon: Radio, hint: "In-venue beacon", count: "Live Beacon" },
          { id: "review", label: "Proof Review", icon: ShieldCheck, hint: "Check-in audits", count: "2 Pending" },
          { id: "sponsorships", label: "Brand Sponsors", icon: Handshake, hint: "Funded stages", count: "$1.4k Escrow" },
          { id: "impact", label: "Impact & Yield", icon: BarChart3, hint: "Node APY & Stats", count: "14.8% APY" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between min-h-[115px] text-left group ${
                isActive
                  ? "border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-2xl ${isActive ? "bg-amber-400 text-black" : "bg-white/5 text-amber-400 group-hover:scale-105 transition"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-white/5 text-white/50"}`}>
                  {tab.count}
                </span>
              </div>
              <div>
                <h3 className={`font-black text-xs ${isActive ? "text-amber-300" : "text-white group-hover:text-amber-300 transition"}`}>
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
              <TabsTrigger value="demand">Demand</TabsTrigger>
              <TabsTrigger value="moments">Moments</TabsTrigger>
              <TabsTrigger value="pulse">Pulse</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="sponsorships">Sponsors</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="demand" className="mt-0">
              <DiscoveryDemandInbox role="host" />
            </TabsContent>

            <TabsContent value="moments" className="mt-0">
              <HostMomentsStagingConsole />
            </TabsContent>

            <TabsContent value="pulse" className="mt-0">
              <HostLivePulseConsole />
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              <HostProofReviewConsole />
            </TabsContent>

            <TabsContent value="sponsorships" className="mt-0">
              <HostSponsorshipConsole />
            </TabsContent>

            <TabsContent value="impact" className="mt-0">
              <HostImpactYieldConsole />
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

export default HostDashboardV2;
