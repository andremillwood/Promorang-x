import React from "react";
import {
  Link2,
  TrendingUp,
  MapPin,
  Users,
  Eye,
  QrCode,
  Sparkles,
  DollarSign,
  Share2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreatorO2OSummaryPanel } from "@/components/host/CreatorO2OSummaryPanel";
import { O2OLinkManager } from "@/components/host/O2OLinkManager";
import { useI18n } from "@/i18n/I18nContext";

export function CreatorAttributionMap() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Link2 className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("creTrack.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                {t("creTrack.visits", { count: 158 })}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("creTrack.subtitle")}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">{t("creTrack.perVisit")}</p>
          <p className="text-base font-black text-purple-400">{t("creTrack.perVisitVal")}</p>
        </div>
      </div>

      {/* 2. O2O Link Manager */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <O2OLinkManager />
      </div>

      {/* 3. Deep Attribution Summary */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <CreatorO2OSummaryPanel />
      </div>
    </div>
  );
}

export default CreatorAttributionMap;
