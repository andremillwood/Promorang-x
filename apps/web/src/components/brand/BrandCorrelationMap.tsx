import React from "react";
import {
  Link2,
  TrendingUp,
  MapPin,
  Users,
  Eye,
  CheckCircle2,
  Gift,
  ArrowRight,
  Sparkles,
  Layers,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { O2OAnalyticsPanel } from "@/components/analytics/O2OAnalyticsPanel";

export function BrandCorrelationMap() {
  const correlationStages = [
    {
      step: "01",
      label: "Digital Reach",
      metric: "88,400",
      helper: "Campaign & Creator Impressions",
      icon: Eye,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      step: "02",
      label: "Passes Claimed",
      metric: "3,210",
      helper: "PromoKey & Deal Reservations",
      icon: Gift,
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      step: "03",
      label: "Verified Arrivals",
      metric: "1,840",
      helper: "In-Person QR Door Check-Ins",
      icon: MapPin,
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      step: "04",
      label: "UGC Created",
      metric: "340",
      helper: "Secondary Social Amplification",
      icon: Sparkles,
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Correlation Identity */}
      <div className="p-6 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Link2 className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Online-to-Offline (O2O) Correlation Matrix</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                Attribution Verified
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Track how digital creator content directly converts into physical venue footfalls and proof-backed sales.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">Overall ROI Multiple</p>
          <p className="text-base font-black text-primary">4.9x Blended</p>
        </div>
      </div>

      {/* 2. Visual 4-Stage O2O Conversion Funnel Runway */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {correlationStages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between min-h-[140px] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-xl border ${stage.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-[10px] font-black text-white/40">STEP {stage.step}</span>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{stage.metric}</p>
                <p className="text-xs font-bold text-white mt-0.5">{stage.label}</p>
                <p className="text-[10px] text-white/50">{stage.helper}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Deep Analytics Engine Panel */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
        <O2OAnalyticsPanel audience="brand" />
      </div>
    </div>
  );
}

export default BrandCorrelationMap;
