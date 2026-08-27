import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gem,
  Sparkles,
  PlayCircle,
  TrendingUp,
  DollarSign,
  Users,
  Video,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface NicheOption {
  id: string;
  name: string;
  avgBounty: number;
  perArrivalRate: number;
  sampleBrand: string;
}

const NICHES: NicheOption[] = [
  {
    id: "nightlife",
    name: "Nightlife & Music",
    avgBounty: 250,
    perArrivalRate: 12,
    sampleBrand: "Soundstage Sessions",
  },
  {
    id: "culinary",
    name: "Culinary & Cocktails",
    avgBounty: 200,
    perArrivalRate: 10,
    sampleBrand: "District Food Crawl",
  },
  {
    id: "arts",
    name: "Culture & Visual Arts",
    avgBounty: 180,
    perArrivalRate: 8,
    sampleBrand: "Underground Gallery Walk",
  },
  {
    id: "wellness",
    name: "Wellness & Active Lifestyle",
    avgBounty: 220,
    perArrivalRate: 14,
    sampleBrand: "Sunrise Sound Bath",
  },
];

export const CreatorEarningsSimulator: React.FC = () => {
  const [selectedNiche, setSelectedNiche] = useState<NicheOption>(NICHES[0]);
  const [dropsPerMonth, setDropsPerMonth] = useState<number>(3);
  const [arrivalsPerDrop, setArrivalsPerDrop] = useState<number>(25);

  const earnings = useMemo(() => {
    const totalArrivals = dropsPerMonth * arrivalsPerDrop;
    const arrivalPayout = totalArrivals * selectedNiche.perArrivalRate;
    const contentBounties = dropsPerMonth * selectedNiche.avgBounty;
    const totalMonthlyCash = arrivalPayout + contentBounties;
    const totalGems = totalMonthlyCash * 10; // 10 Gems per $1

    return {
      totalArrivals,
      arrivalPayout,
      contentBounties,
      totalMonthlyCash,
      totalGems,
    };
  }, [dropsPerMonth, arrivalsPerDrop, selectedNiche]);

  return (
    <div className="w-full rounded-3xl bg-zinc-950/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Gem className="w-3.5 h-3.5" />
            Tastemaker Payout Simulator
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Predictable Creator Monetization
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Never depend on arbitrary algorithm RPMs or cheap promo codes. Get paid in cash + gems for verified scene curation and guest arrivals.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start md:self-auto border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono text-xs px-3 py-1.5"
        >
          DIRECT ESCROW PAYOUTS
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Niche Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">Select Your Primary Curation Vibe</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NICHES.map((niche) => (
                <button
                  key={niche.id}
                  onClick={() => setSelectedNiche(niche)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs ${
                    selectedNiche.id === niche.id
                      ? "bg-purple-500/20 border-purple-500/60 text-white shadow-lg shadow-purple-500/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="font-bold">{niche.name}</div>
                  <div className="text-[10px] text-purple-300 mt-1">${niche.perArrivalRate}/arrival</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Box */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            {/* Curated Drops per Month */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Curated Media Drops / Recommendations per Month</span>
                <span className="font-mono text-purple-400 font-bold text-sm">
                  {dropsPerMonth} drops / month
                </span>
              </div>
              <Slider
                value={[dropsPerMonth]}
                onValueChange={(val) => setDropsPerMonth(val[0])}
                min={1}
                max={12}
                step={1}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>1 drop (Weekend casual)</span>
                <span>6 drops</span>
                <span>12 drops (Full-time curator)</span>
              </div>
            </div>

            {/* Verified Arrivals per Drop */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Estimated Verified Guest Check-Ins per Drop</span>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {arrivalsPerDrop} arrivals / drop
                </span>
              </div>
              <Slider
                value={[arrivalsPerDrop]}
                onValueChange={(val) => setArrivalsPerDrop(val[0])}
                min={5}
                max={150}
                step={5}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>5 arrivals</span>
                <span>50 arrivals</span>
                <span>150+ arrivals</span>
              </div>
            </div>
          </div>

          {/* Live Sample Bounty Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Sample Open Bounty: {selectedNiche.sampleBrand}
                </div>
                <div className="text-[11px] text-white/60">
                  ${selectedNiche.avgBounty} base media drop fee + ${selectedNiche.perArrivalRate} per verified guest
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
              AVAILABLE NOW
            </Badge>
          </div>
        </div>

        {/* Right Column: Earnings Summary & Soft Gate (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-purple-300">
                Projected Monthly Income
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> ESCROW SECURED
              </div>
            </div>

            {/* Big Cash Display */}
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ${earnings.totalMonthlyCash.toLocaleString()}
                <span className="text-sm font-semibold text-white/50 ml-1.5">/ month</span>
              </div>
              <div className="text-xs text-amber-300 font-mono mt-1 flex items-center gap-1">
                <Gem className="w-3.5 h-3.5" /> +{earnings.totalGems.toLocaleString()} VIP Gems
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-white/70">
                <span>Verified Arrival Rewards:</span>
                <span className="font-mono font-bold text-white">${earnings.arrivalPayout.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Direct Media Drop Retainers:</span>
                <span className="font-mono font-bold text-white">${earnings.contentBounties.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Total Monthly Verified Guests:</span>
                <span className="font-mono font-bold text-purple-400">{earnings.totalArrivals} guests</span>
              </div>
            </div>
          </div>

          {/* Soft-Gate Callout */}
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Claim Your Creator Profile
            </div>
            <p className="text-xs text-white/70">
              Lock in your creator handle and start curating bounties with your projected <strong>${earnings.totalMonthlyCash.toLocaleString()}</strong> monthly earning potential.
            </p>
            <Button
              asChild
              className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white font-black text-sm shadow-xl shadow-purple-500/20"
            >
              <Link to={`/for-creators?projEarn=${earnings.totalMonthlyCash}&niche=${selectedNiche.id}`}>
                Claim Creator Handle & Access Bounties
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
