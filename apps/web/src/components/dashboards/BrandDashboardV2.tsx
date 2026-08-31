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
import { useI18n } from "@/i18n/I18nContext";

// Modular Brand Consoles
import BrandCampaignFlightDeck from "@/components/brand/BrandCampaignFlightDeck";
import BrandOpportunityRadar from "@/components/brand/BrandOpportunityRadar";
import BrandCreatorBureau from "@/components/brand/BrandCreatorBureau";
import BrandCorrelationMap from "@/components/brand/BrandCorrelationMap";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";

export function BrandDashboardV2() {
  const { t } = useI18n();
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
    activeOrg?.name || profile?.display_name || user?.user_metadata?.full_name || t("brandStage.partner");

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
                {t("brandStage.flight", { name: activeBrandName })}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>{t("brandStage.liveBadge")}</span>
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              {t("brandStage.subtitle")}
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
            <span>{t("brandStage.launch")}</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition"
          >
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-xs font-black text-white">{t("brandStage.escrow")}</span>
          </Link>
        </div>
      </div>

      {/* 2. Simple 3-Step Action Guide */}
      <div className="p-4 sm:p-5 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/15 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-wider">
              {t("brandStage.how")}
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              {t("brandStage.system")}
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            {t("brandStage.steps")}
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
                <p className="font-bold text-white text-xs">{t("brandStage.step1")}</p>
                <p className="text-[10px] text-primary font-semibold">{t("brandStage.step1Hint")}</p>
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
                <p className="font-bold text-white text-xs">{t("brandStage.step2")}</p>
                <p className="text-[10px] text-amber-300 font-semibold">{t("brandStage.step2Hint")}</p>
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
                <p className="font-bold text-white text-xs">{t("brandStage.step3")}</p>
                <p className="text-[10px] text-cyan-300 font-semibold">{t("brandStage.step3Hint")}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition" />
          </button>
        </div>
      </div>

      {/* 3. The 5 Operational Brand Navigation Arenas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { id: "campaigns", label: t("brandStage.tabCamp"), hint: t("brandStage.tabCampHint"), icon: Megaphone, count: t("brandStage.countLive", { count: activeCampaigns.length || 2 }) },
          { id: "opportunities", label: t("brandStage.tabOpp"), hint: t("brandStage.tabOppHint"), icon: Target, count: t("brandStage.countReady", { count: 3 }) },
          { id: "creators", label: t("brandStage.tabCre"), hint: t("brandStage.tabCreHint"), icon: Users, count: t("brandStage.countReady", { count: 1 }) },
          { id: "correlation", label: t("brandStage.tabTraffic"), hint: t("brandStage.tabTrafficHint"), icon: Link2, count: t("brandStage.countRoi") },
          { id: "insights", label: t("brandStage.tabBudget"), hint: t("brandStage.tabBudgetHint"), icon: Coins, count: t("brandStage.countSafe") },
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
              <TabsTrigger value="campaigns">{t("brandStage.srDeck")}</TabsTrigger>
              <TabsTrigger value="opportunities">{t("brandStage.srRadar")}</TabsTrigger>
              <TabsTrigger value="creators">{t("brandStage.srCreators")}</TabsTrigger>
              <TabsTrigger value="correlation">{t("brandStage.srMap")}</TabsTrigger>
              <TabsTrigger value="insights">{t("brandStage.srTreasury")}</TabsTrigger>
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
