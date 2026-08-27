import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Video,
  CheckCircle2,
  Lock,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type ObjectiveType = "foot_traffic" | "ugc_creator" | "cultural_takeover";

interface ObjectiveConfig {
  id: ObjectiveType;
  title: string;
  desc: string;
  perCheckinRatio: number; // % of budget
  perUgcRatio: number;
}

const OBJECTIVES: Record<ObjectiveType, ObjectiveConfig> = {
  foot_traffic: {
    id: "foot_traffic",
    title: "In-Person Sampling & Foot-Traffic",
    desc: "Maximize verified physical diner and attendee arrivals at partner venues.",
    perCheckinRatio: 0.85,
    perUgcRatio: 0.15,
  },
  ugc_creator: {
    id: "ugc_creator",
    title: "Authentic Creator Video Drops",
    desc: "Engage local tastemakers for high-energy video content and scene curation.",
    perCheckinRatio: 0.2,
    perUgcRatio: 0.8,
  },
  cultural_takeover: {
    id: "cultural_takeover",
    title: "Full Cultural Scene Takeover",
    desc: "Balanced footprint: sponsor top venues, back cultural events, and commission creator drops.",
    perCheckinRatio: 0.5,
    perUgcRatio: 0.5,
  },
};

export const BrandCampaignSimulator: React.FC = () => {
  const [budget, setBudget] = useState<number>(10000);
  const [objective, setObjective] = useState<ObjectiveType>("cultural_takeover");

  const results = useMemo(() => {
    const config = OBJECTIVES[objective];
    const checkinBudget = budget * config.perCheckinRatio;
    const ugcBudget = budget * config.perUgcRatio;

    // Verified check-in cost ~$15-$20 avg reward payout
    const verifiedArrivals = Math.round(checkinBudget / 16);
    // UGC video drop avg bounty ~$225
    const ugcVideoDrops = Math.round(ugcBudget / 225);
    // Social organic reach per drop ~3,500
    const estimatedOrganicReach = ugcVideoDrops * 3500 + verifiedArrivals * 45;
    // Equivalent digital ad waste avoided (~35% bot fraud on programmatic networks)
    const adFraudWasteAvoided = budget * 0.38;

    return {
      verifiedArrivals,
      ugcVideoDrops,
      estimatedOrganicReach,
      adFraudWasteAvoided,
    };
  }, [budget, objective]);

  return (
    <div className="w-full rounded-3xl bg-zinc-950/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Brand & Sponsor ROI Allocator
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Auditable In-Person Foot-Traffic & UGC
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Eliminate programmatic ad fraud. Pay only when verified customers walk through doors and authentic creators drop content.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start md:self-auto border-blue-500/40 bg-blue-500/10 text-blue-300 font-mono text-xs px-3 py-1.5"
        >
          ZERO-BOT ATTRIBUTION
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders & Objectives (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Objective Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">Select Campaign Objective</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(OBJECTIVES) as ObjectiveType[]).map((key) => {
                const item = OBJECTIVES[key];
                return (
                  <button
                    key={item.id}
                    onClick={() => setObjective(item.id)}
                    className={`p-3 rounded-xl text-left border transition-all text-xs ${
                      objective === item.id
                        ? "bg-blue-500/20 border-blue-500/60 text-white shadow-lg shadow-blue-500/10"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">{item.title}</div>
                    <div className="text-[10px] text-white/50 mt-1 line-clamp-2">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Slider */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Total Campaign Escrow Budget</span>
                <span className="font-mono text-blue-400 font-bold text-sm">
                  ${budget.toLocaleString()} USD
                </span>
              </div>
              <Slider
                value={[budget]}
                onValueChange={(val) => setBudget(val[0])}
                min={2500}
                max={50000}
                step={2500}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>$2.5k (Local activation)</span>
                <span>$25k (Multi-venue campaign)</span>
                <span>$50k+ (Enterprise takeover)</span>
              </div>
            </div>
          </div>

          {/* Yield Forecast Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50">Verified Arrivals</div>
              <div className="text-lg md:text-xl font-black text-white mt-1">
                {results.verifiedArrivals.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-300/80 mt-0.5">In-person proof</div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="text-[10px] uppercase font-mono tracking-wider text-purple-300">Creator UGC Drops</div>
              <div className="text-lg md:text-xl font-black text-purple-400 mt-1">
                {results.ugcVideoDrops} videos
              </div>
              <div className="text-[10px] text-purple-300/80 mt-0.5">Authentic local media</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300">Ad Fraud Avoided</div>
              <div className="text-lg md:text-xl font-black text-emerald-400 mt-1">
                ${Math.round(results.adFraudWasteAvoided).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">Zero bot clicks</div>
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Audit & Soft Gate (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/40 via-zinc-900 to-zinc-950 border border-blue-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-blue-300">
                Auditable Campaign Yield
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> SMART ESCROW
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {results.estimatedOrganicReach.toLocaleString()}
                <span className="text-sm font-semibold text-white/50 ml-2">Estimated Impressions</span>
              </div>
              <div className="text-xs text-blue-300 font-mono mt-1">
                100% human-verified engagement & physical foot-traffic
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Escrow Hold Structure:</span>
                <span className="font-mono font-bold text-white">Funds released on verified proof</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Receipt Verification:</span>
                <span className="font-mono font-bold text-emerald-400">Cryptographic audit trail</span>
              </div>
            </div>
          </div>

          {/* Soft-Gate Callout */}
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Launch Your Escrow Campaign
            </div>
            <p className="text-xs text-white/70">
              Deploy your <strong>${budget.toLocaleString()}</strong> campaign brief with zero bot waste and full receipt transparency.
            </p>
            <Button
              asChild
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20"
            >
              <Link to={`/for-brands?budget=${budget}&objective=${objective}`}>
                Deploy Escrow Campaign Brief
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
