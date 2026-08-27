import React from "react";
import {
  Award,
  Sparkles,
  Star,
  ShieldCheck,
  TrendingUp,
  Flame,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CreatorReputationDeck() {
  const tiers = [
    { level: "Level 1", name: "Scout Creator", req: "1-3 Stories published", status: "completed" },
    { level: "Level 2", name: "Culture Vanguard", req: "5+ Stories & 50+ Footfalls", status: "active" },
    { level: "Level 3", name: "Kingston Luminary", req: "15+ Stories & Brand Ambassador", status: "upcoming" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Award className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Creator Cultural Reputation & Tiers</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-extrabold uppercase">
                Vanguard Tier (L2)
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Level progression, brand affinity badges, and community trust multipliers.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">Vibe Score</p>
          <p className="text-base font-black text-purple-400">98 / 100</p>
        </div>
      </div>

      {/* 2. Tier Progression Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isDone = tier.status === "completed";
          const isActive = tier.status === "active";

          return (
            <div
              key={tier.level}
              className={`p-5 rounded-3xl border flex flex-col justify-between min-h-[140px] space-y-3 transition-all duration-300 ${
                isActive
                  ? "border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40"
                  : isDone
                  ? "border-emerald-500/30 bg-[#08160f]"
                  : "border-white/10 bg-[#0e1015]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isActive ? "bg-purple-500 text-black font-black" : isDone ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"
                }`}>
                  {tier.level}
                </span>
                {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {isActive && <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />}
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{tier.name}</h3>
                <p className="text-xs text-white/60 mt-0.5">{tier.req}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreatorReputationDeck;
