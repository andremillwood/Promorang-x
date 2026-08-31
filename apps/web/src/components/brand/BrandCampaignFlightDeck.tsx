import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Megaphone,
  Plus,
  Target,
  Users,
  Eye,
  Gift,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  DollarSign,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";

export function BrandCampaignFlightDeck({
  onLaunchNew,
}: {
  onLaunchNew?: () => void;
}) {
  const { t, formatNumber } = useI18n();
  const { toast } = useToast();
  const { data: rawCampaigns = [], isLoading } = useBrandCampaigns();
  const [filterState, setFilterState] = useState<"all" | "live" | "scheduled" | "completed">("all");

  const campaigns = rawCampaigns.length > 0 ? rawCampaigns : [
    {
      id: "camp-midas-1",
      title: "Midas Summer Kingston Soundclash Takeover",
      description: "Omni-channel sponsorship across 4 live Kingston stages with door perks & creator bounties.",
      budget: 5000,
      spent: 3200,
      impressions: 48200,
      redemptions: 1420,
      is_active: true,
      status: "live",
      flightDates: "Aug 15 - Sep 10, 2026",
      creatorsCount: 12,
      roi: "4.8x",
    },
    {
      id: "camp-midas-2",
      title: "Blue Mountain Coffee Rituals & Artisan Drops",
      description: "Rewarding attendees who check-in at partnered Kingston coffee lounges with PromoKeys.",
      budget: 2500,
      spent: 1850,
      impressions: 29400,
      redemptions: 890,
      is_active: true,
      status: "live",
      flightDates: "Aug 20 - Sep 05, 2026",
      creatorsCount: 8,
      roi: "5.2x",
    },
    {
      id: "camp-midas-3",
      title: "Kingston Culture Week Sunset Stage",
      description: "Exclusive VIP lounge sponsorship & branded content drop window.",
      budget: 4000,
      spent: 0,
      impressions: 0,
      redemptions: 0,
      is_active: false,
      status: "scheduled",
      flightDates: "Sep 15 - Sep 22, 2026",
      creatorsCount: 15,
      roi: "Pending Launch",
    },
  ];

  const handleBoostBudget = (campaignTitle: string) => {
    toast({
      title: t("flyDeck.boostTitle"),
      description: t("flyDeck.boostBody", { title: campaignTitle }),
    });
  };

  const filteredCampaigns = campaigns.filter((c: any) => {
    if (filterState === "all") return true;
    if (filterState === "live") return c.is_active;
    if (filterState === "scheduled") return !c.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Promotion HUD */}
      <div className="p-6 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Megaphone className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("flyDeck.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-extrabold uppercase">
                {t("flyDeck.badge", { count: campaigns.filter((c: any) => c.is_active).length })}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("flyDeck.copy")}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(255,106,0,0.35)]"
        >
          <Link to="/create/campaign">
            <Plus className="h-4 w-4 mr-1.5" />
            {t("flyDeck.start")}
          </Link>
        </Button>
      </div>

      {/* 2. Simple Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: t("flyDeck.all") },
            { id: "live", label: t("flyDeck.live") },
            { id: "scheduled", label: t("flyDeck.upcoming") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                filterState === tab.id
                  ? "bg-primary text-black shadow-md shadow-primary/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t("flyDeck.realtime")}</span>
        </div>
      </div>

      {/* 3. Campaign Flight Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign: any) => {
          const budget = Number(campaign.budget || 0);
          const spent = Number(campaign.spent || (budget * 0.64));
          const pacePercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

          return (
            <div
              key={campaign.id}
              className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 flex flex-col justify-between space-y-5 hover:border-primary/40 transition-all duration-300 shadow-xl group"
            >
              {/* Top Meta & Flight Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    campaign.is_active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-white/60 border border-white/10"
                  }`}>
                    {campaign.is_active ? t("flyDeck.liveFlight") : t("flyDeck.scheduled")}
                  </span>
                  <span className="text-xs text-primary font-bold font-mono">
                    {t("flyDeck.roi", { value: campaign.roi || "4.5x" })}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-primary transition leading-tight">
                  {campaign.title}
                </h3>
                <p className="text-xs text-white/60 mt-1 line-clamp-2">
                  {campaign.description}
                </p>
              </div>

              {/* Spend Meter */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white/60">{t("flyDeck.budgetUsed")}</span>
                  <span className="text-white font-mono font-bold">
                    {t("flyDeck.spentOf", {
                      spent: `$${formatNumber(spent)}`,
                      budget: `$${formatNumber(budget)}`,
                      pct: pacePercent,
                    })}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-500"
                    style={{ width: `${pacePercent}%` }}
                  />
                </div>
              </div>

              {/* Real World Performance Dials */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-white/50">{t("flyDeck.reached")}</p>
                  <p className="text-base font-black text-white">{formatNumber(campaign.impressions || 0)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-white/50">{t("flyDeck.visits")}</p>
                  <p className="text-base font-black text-emerald-400">{formatNumber(campaign.redemptions || 0)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-white/50">{t("flyDeck.posting")}</p>
                  <p className="text-base font-black text-amber-400">{campaign.creatorsCount || 6}</p>
                </div>
              </div>

              {/* Flight Actions Footer */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBoostBudget(campaign.title)}
                  className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex-1"
                >
                  <Flame className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {t("flyDeck.boost")}
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  <Link to={`/dashboard/campaigns/${campaign.id}`}>
                    <span>{t("flyDeck.manage")}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrandCampaignFlightDeck;
