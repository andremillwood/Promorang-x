import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Film,
  Target,
  Link2,
  Coins,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  DollarSign,
  Gem,
  Video,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";

// Modular Creator Consoles
import CreatorStudioConsole from "@/components/creator/CreatorStudioConsole";
import CreatorMissionsHub from "@/components/creator/CreatorMissionsHub";
import CreatorAttributionMap from "@/components/creator/CreatorAttributionMap";
import CreatorEarningsVault from "@/components/creator/CreatorEarningsVault";
import CreatorReputationDeck from "@/components/creator/CreatorReputationDeck";

export function CreatorDashboardV2() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "studio";
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

  const creatorName = user?.user_metadata?.full_name?.split(" ")[0] || "Creator";

  return (
    <div className="space-y-6 text-white pb-16 animate-in fade-in-50 duration-300">
      {/* 0. Top Story & Action Rail */}
      <StoryGamificationRail
        onOpenWheel={() => setWheelOpen(true)}
        onOpenStreak={() => setStreakOpen(true)}
      />

      {/* 1. Header & Live Creator Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-black backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Film className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {t("creStage.title")}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>{t("creStage.active")}</span>
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {t("creStage.subtitle")}
            </p>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <Link
            to="/content-share"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-purple-400/40 bg-purple-400/10 hover:bg-purple-400/20 text-purple-300 text-xs font-black transition"
          >
            <Plus className="h-4 w-4" />
            <span>{t("creStage.submit")}</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-400/40 hover:bg-white/10 transition"
          >
            <Gem className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-black text-white">{t("creStage.vault")}</span>
          </Link>
        </div>
      </div>

      {/* 2. Creator Action Runway */}
      <div className="p-4 sm:p-5 rounded-3xl border border-purple-500/25 bg-gradient-to-r from-purple-950/15 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-500 text-black font-black text-[10px] uppercase tracking-wider">
              {t("creStage.loop")}
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              {t("creStage.todayFlow")}
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            {t("creStage.flowPath")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => handleTabChange("missions")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-purple-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">1</span>
              <div>
                <p className="font-bold text-white text-xs">{t("creStage.step1Title")}</p>
                <p className="text-[10px] text-purple-300 font-semibold">{t("creStage.step1Hint")}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-purple-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("studio")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-purple-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">2</span>
              <div>
                <p className="font-bold text-white text-xs">{t("creStage.step2Title")}</p>
                <p className="text-[10px] text-pink-300 font-semibold">{t("creStage.step2Hint")}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-pink-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("earnings")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-purple-400/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">3</span>
              <div>
                <p className="font-bold text-white text-xs">{t("creStage.step3Title")}</p>
                <p className="text-[10px] text-emerald-300 font-semibold">{t("creStage.step3Hint")}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition" />
          </button>
        </div>
      </div>

      {/* 3. The 5 Operational Creator Arenas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { id: "studio", label: t("creStage.tabStudio"), icon: Film, hint: t("creStage.tabStudioHint"), count: t("creStage.tabStudioCount") },
          { id: "missions", label: t("creStage.tabMissions"), icon: Target, hint: t("creStage.tabMissionsHint"), count: t("creStage.tabMissionsCount") },
          { id: "attribution", label: t("creStage.tabLinks"), icon: Link2, hint: t("creStage.tabLinksHint"), count: t("creStage.tabLinksCount") },
          { id: "earnings", label: t("creStage.tabEarn"), icon: Coins, hint: t("creStage.tabEarnHint"), count: t("creStage.tabEarnCount") },
          { id: "reputation", label: t("creStage.tabRep"), icon: Award, hint: t("creStage.tabRepHint"), count: t("creStage.tabRepCount") },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between min-h-[115px] text-left group ${
                isActive
                  ? "border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400/50"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-2xl ${isActive ? "bg-purple-500 text-white" : "bg-white/5 text-purple-400 group-hover:scale-105 transition"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/5 text-white/50"}`}>
                  {tab.count}
                </span>
              </div>
              <div>
                <h3 className={`font-black text-xs ${isActive ? "text-purple-300" : "text-white group-hover:text-purple-300 transition"}`}>
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
              <TabsTrigger value="studio">{t("creStage.srStudio")}</TabsTrigger>
              <TabsTrigger value="missions">{t("creStage.srMissions")}</TabsTrigger>
              <TabsTrigger value="attribution">{t("creStage.srLinks")}</TabsTrigger>
              <TabsTrigger value="earnings">{t("creStage.srEarn")}</TabsTrigger>
              <TabsTrigger value="reputation">{t("creStage.srRep")}</TabsTrigger>
            </TabsList>

            <TabsContent value="studio" className="mt-0">
              <CreatorStudioConsole />
            </TabsContent>

            <TabsContent value="missions" className="mt-0">
              <CreatorMissionsHub />
            </TabsContent>

            <TabsContent value="attribution" className="mt-0">
              <CreatorAttributionMap />
            </TabsContent>

            <TabsContent value="earnings" className="mt-0">
              <CreatorEarningsVault />
            </TabsContent>

            <TabsContent value="reputation" className="mt-0">
              <CreatorReputationDeck />
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

export default CreatorDashboardV2;
