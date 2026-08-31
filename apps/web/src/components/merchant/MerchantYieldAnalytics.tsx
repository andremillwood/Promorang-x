import React from "react";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Gem,
  Users,
  Repeat,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";

export function MerchantYieldAnalytics() {
  const { toast } = useToast();
  const { t } = useI18n();
  const { data: economy } = useMerchantEconomy();

  const handleDisbursePayout = () => {
    toast({
      title: t("merchStats.settleToast"),
      description: t("merchStats.settleCopy"),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Financial Yield Banner */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <TrendingUp className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("merchStats.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                {t("merchStats.badge")}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("merchStats.copy")}
            </p>
          </div>
        </div>

        <Button
          onClick={handleDisbursePayout}
          className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20"
        >
          <DollarSign className="h-4 w-4 mr-1.5" />
          {t("merchStats.settle")}
        </Button>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">{t("merchStats.gmv")}</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$4,820.50</p>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              {t("merchStats.gmvDelta")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">{t("merchStats.gems")}</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Gem className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">1,450</p>
            <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-1">
              <Sparkles className="h-3 w-3" />
              {t("merchStats.gemsHint")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">{t("merchStats.arrivals")}</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">384</p>
            <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {t("merchStats.arrivalsHint")}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">{t("merchStats.repeat")}</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Repeat className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">41.8%</p>
            <p className="text-xs text-amber-300 font-semibold flex items-center gap-1 mt-1">
              <Flame className="h-3 w-3" />
              {t("merchStats.repeatHint")}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Deep Sales & Revenue Graph Sub-Engine */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">{t("merchStats.breakdown")}</h3>
            <p className="text-xs text-white/50 mt-0.5">
              {t("merchStats.breakdownCopy")}
            </p>
          </div>
        </div>

        <SalesAnalyticsDashboard />
      </div>
    </div>
  );
}

export default MerchantYieldAnalytics;
