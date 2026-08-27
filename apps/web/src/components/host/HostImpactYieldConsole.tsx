import React from "react";
import {
  BarChart3,
  TrendingUp,
  Gem,
  Users,
  Award,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityImpactMatrix } from "@/components/host/CommunityImpactMatrix";

export function HostImpactYieldConsole() {
  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <BarChart3 className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Stage Community Impact & Node Yield</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase">
                Host Level 3 (Luminary)
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Community multiplier stats, retained Gem yields, and repeat attendee loyalty telemetry.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">Host Node APY</p>
          <p className="text-base font-black text-emerald-400">14.8% Active</p>
        </div>
      </div>

      {/* 2. Impact Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Total Guests Hosted</span>
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">1,840</p>
            <p className="text-xs text-amber-300 font-semibold mt-1">Across 14 staged moments</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Gems Retained</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Gem className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">2,850</p>
            <p className="text-xs text-primary font-semibold mt-1">Staked in Host Liquidity Node</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Community Points</span>
            <span className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">48,200</p>
            <p className="text-xs text-cyan-300 font-semibold mt-1">Disbursed to attendees</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Host Quality Rating</span>
            <span className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">4.95 / 5.0</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Top 5% Kingston Hosts</p>
          </div>
        </div>
      </div>

      {/* 3. Deep Community Matrix */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <CommunityImpactMatrix />
      </div>
    </div>
  );
}

export default HostImpactYieldConsole;
