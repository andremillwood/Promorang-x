import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Store,
  QrCode,
  ShoppingBag,
  Package,
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
  Zap,
  Sparkles,
  DollarSign,
  Gem,
  CheckCircle2,
  Calendar,
  Flame,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantVenues } from "@/hooks/useVenues";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";

// Modular, High-Impact Consoles
import MerchantScannerStation from "@/components/merchant/MerchantScannerStation";
import MerchantStorefrontConsole from "@/components/merchant/MerchantStorefrontConsole";
import MerchantOrdersHub from "@/components/merchant/MerchantOrdersHub";
import MerchantVenueStudio from "@/components/merchant/MerchantVenueStudio";
import MerchantYieldAnalytics from "@/components/merchant/MerchantYieldAnalytics";

export function MerchantDashboardV2() {
  const { user } = useAuth();
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const { data: stats, isLoading: statsLoading } = useMerchantEconomy();
  const { data: economy, isLoading: economyLoading } = useMerchantEconomy();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = searchParams.get("tab") || "storefront";
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

  const weeklyTraffic = stats?.weeklyTraffic || 84;
  const totalRevenue = stats?.openOrders ? (stats.openOrders * 24.5).toFixed(2) : "1,248.00";
  const venueCount = venues?.length || 1;

  return (
    <div className="space-y-6 text-white pb-16 animate-in fade-in-50 duration-300">
      {/* 0. Top Story & Gamification Action Rail */}
      <StoryGamificationRail
        onOpenWheel={() => setWheelOpen(true)}
        onOpenStreak={() => setStreakOpen(true)}
      />

      {/* 1. Header & Live Venue Terminal Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Store className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Merchant Command Station
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Shift Live • {venueCount} {venueCount === 1 ? "Location" : "Locations"} Active</span>
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Live foot traffic, point-of-sale scanner, inventory drops, and settlement runway.
            </p>
          </div>
        </div>

        {/* Quick Balance & Action Pills */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => handleTabChange("redemptions")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition group"
          >
            <QrCode className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition" />
            <span className="text-xs font-black text-white">Scan Terminal</span>
          </button>

          <Link
            to="/wallet"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-white/10 transition"
          >
            <Gem className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-black text-white">Node Vault</span>
          </Link>
        </div>
      </div>

      {/* 2. Merchant Action Runway (3 Clickable High-Impact Steps) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/20 via-black to-black text-xs text-white/80 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider">
              Shift Roadmap
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              Today's Operating Loop
            </span>
          </div>
          <span className="text-[11px] text-white/50 font-medium">
            Broadcast Perk &rarr; Verify Door &rarr; Settle Yield
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => handleTabChange("storefront")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
              <div>
                <p className="font-bold text-white text-xs">Launch Happy Hour Drop</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Attract nearby explorers</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("redemptions")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">2</span>
              <div>
                <p className="font-bold text-white text-xs">Scan & Verify Door Passes</p>
                <p className="text-[10px] text-amber-300 font-semibold">Credit proof & reward points</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition" />
          </button>

          <button
            onClick={() => handleTabChange("analytics")}
            className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/40 hover:bg-white/[0.06] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">3</span>
              <div>
                <p className="font-bold text-white text-xs">Review Node Yield & Settlement</p>
                <p className="text-[10px] text-teal-300 font-semibold">Disburse Lynk / Bank payout</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition" />
          </button>
        </div>
      </div>

      {/* 3. The 4 Operational Console Navigation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { id: "storefront", label: "Storefront & Drops", icon: Store, hint: "Catalog & perks", count: "Live" },
          { id: "redemptions", label: "POS Scanner", icon: QrCode, hint: "Door verification", count: "Active" },
          { id: "commerce", label: "Orders & Fulfillment", icon: ShoppingBag, hint: "Pickups & tickets", count: "4 Open" },
          { id: "venues", label: "Venue Studio", icon: MapPin, hint: "Spaces & moments", count: `${venueCount} Places` },
          { id: "analytics", label: "Yield & Analytics", icon: BarChart3, hint: "GMV & Node APY", count: "12.5%" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between min-h-[115px] text-left group ${
                isActive
                  ? "border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-2xl ${isActive ? "bg-emerald-500 text-black" : "bg-white/5 text-emerald-400 group-hover:scale-105 transition"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-white/50"}`}>
                  {tab.count}
                </span>
              </div>
              <div>
                <h3 className={`font-black text-xs ${isActive ? "text-emerald-400" : "text-white group-hover:text-emerald-300 transition"}`}>
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
              <TabsTrigger value="storefront">Storefront</TabsTrigger>
              <TabsTrigger value="redemptions">Scanner</TabsTrigger>
              <TabsTrigger value="commerce">Orders</TabsTrigger>
              <TabsTrigger value="venues">Venues</TabsTrigger>
              <TabsTrigger value="analytics">Yield</TabsTrigger>
            </TabsList>

            <TabsContent value="storefront" className="mt-0">
              <MerchantStorefrontConsole
                onOpenProducts={() => handleTabChange("storefront")}
                onOpenScanner={() => handleTabChange("redemptions")}
              />
            </TabsContent>

            <TabsContent value="redemptions" className="mt-0">
              <MerchantScannerStation />
            </TabsContent>

            <TabsContent value="commerce" className="mt-0">
              <MerchantOrdersHub
                onOpenScanner={() => handleTabChange("redemptions")}
              />
            </TabsContent>

            <TabsContent value="venues" className="mt-0">
              <MerchantVenueStudio
                onOpenMoments={() => handleTabChange("venues")}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <MerchantYieldAnalytics />
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

export default MerchantDashboardV2;
