import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Users,
  Sparkles,
  ArrowRight,
  Calculator,
  Flame,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export const MerchantRoiSimulator: React.FC = () => {
  const [venueName, setVenueName] = useState<string>("Sovereign Lounge & Kitchen");
  const [perkOffer, setPerkOffer] = useState<string>("Complimentary Truffle Arancini on $50+ Tab");
  const [avgTicket, setAvgTicket] = useState<number>(65);
  const [monthlyVisits, setMonthlyVisits] = useState<number>(75);
  const [perkValue, setPerkValue] = useState<number>(14);

  // Economic calculations
  const economics = useMemo(() => {
    const grossRevenue = monthlyVisits * avgTicket;
    const perkCost = monthlyVisits * perkValue;
    // Scenario assumptions only; these are not observed Promorang economics.
    const grossMargin = grossRevenue * 0.65;
    const netProfitLift = grossMargin - perkCost;
    const traditionalAdCost = monthlyVisits * 48;
    const wastedAdSpendSaved = Math.max(0, traditionalAdCost - monthlyVisits * 5);

    return {
      grossRevenue,
      netProfitLift,
      traditionalAdCost,
      wastedAdSpendSaved,
    };
  }, [avgTicket, monthlyVisits, perkValue]);

  return (
    <div className="w-full rounded-3xl bg-zinc-950/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Store className="w-3.5 h-3.5" />
            Merchant Foot-Traffic Simulator
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Merchant Scenario Model
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Model a hypothetical merchant activation using your own assumptions. Outputs are illustrative estimates, not Promorang performance, verified demand, or guaranteed ROI.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start md:self-auto border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs px-3 py-1.5"
        >
          ILLUSTRATIVE SCENARIO
        </Badge>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs leading-5 text-amber-100/75">
        <strong>Scenario assumptions:</strong> this calculator uses a 65% gross-margin assumption and a hypothetical $48 comparison acquisition cost. Change the inputs to explore a case; none of these values are live Promorang benchmarks or promises.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Inputs & Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Venue Details Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                Your Venue / Business Name
              </label>
              <Input
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Skyline Bistro"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Featured VIP Perk Offering
              </label>
              <Input
                value={perkOffer}
                onChange={(e) => setPerkOffer(e.target.value)}
                placeholder="e.g. Complimentary Cocktails on $50+ Tab"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11 focus-visible:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Sliders Box */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            {/* Average Check Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Average Guest Check / Tab Size</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  ${avgTicket} USD
                </span>
              </div>
              <Slider
                value={[avgTicket]}
                onValueChange={(val) => setAvgTicket(val[0])}
                min={20}
                max={250}
                step={5}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>$20 (Casual)</span>
                <span>$100 (Fine Dining)</span>
                <span>$250 (Bottle/VIP)</span>
              </div>
            </div>

            {/* Monthly In-Person Visits Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Assumed Monthly Arrivals</span>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {monthlyVisits} assumed tables/guests
                </span>
              </div>
              <Slider
                value={[monthlyVisits]}
                onValueChange={(val) => setMonthlyVisits(val[0])}
                min={10}
                max={300}
                step={5}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>10 arrivals</span>
                <span>150 arrivals</span>
                <span>300+ arrivals</span>
              </div>
            </div>

            {/* Perk Wholesale Cost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Perk Value / Cost of Good Sold</span>
                <span className="font-mono text-white/80 font-bold text-sm">
                  ${perkValue} COGS
                </span>
              </div>
              <Slider
                value={[perkValue]}
                onValueChange={(val) => setPerkValue(val[0])}
                min={5}
                max={50}
                step={1}
                className="py-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50">Illustrative Gross Sales</div>
              <div className="text-lg md:text-xl font-black text-white mt-1">
                ${economics.grossRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">Assumption: arrivals × average check</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-300">Illustrative Contribution</div>
              <div className="text-lg md:text-xl font-black text-emerald-400 mt-1">
                +${Math.round(economics.netProfitLift).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">Using the scenario margin assumption</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-[10px] uppercase font-mono tracking-wider text-amber-300">Illustrative Ad-Cost Difference</div>
              <div className="text-lg md:text-xl font-black text-amber-400 mt-1">
                ${Math.round(economics.wastedAdSpendSaved).toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-300/80 mt-0.5">Uses a hypothetical comparison cost</div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendered Pass Preview & Soft Gate (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5">
                EXAMPLE PASS MOCKUP
              </Badge>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> NOT AN ISSUED PASS
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
                MEMBER PRIVILEGE KEY
              </div>
              <h4 className="text-xl font-black text-white tracking-tight">
                {venueName || "Your Venue Name"}
              </h4>
              <p className="text-xs text-amber-300/90 font-medium bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                ✨ {perkOffer || "Exclusive Member Privilege"}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
              <span>Zero Upfront Listing Fee</span>
              <span className="text-emerald-400 font-bold">Scenario only</span>
            </div>
          </div>

          {/* Soft-Gate Call to Action */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Continue with this planning scenario
            </div>
            <p className="text-xs text-white/70">
              Use this estimate as a planning input only. Actual demand, costs, verification, fulfillment and commercial terms require recorded platform activity and an agreed offer.
            </p>
            <Button
              asChild
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-sm shadow-xl shadow-emerald-500/20"
            >
              <Link
                to={`/for-merchants?claimVenue=${encodeURIComponent(
                  venueName
                )}&perk=${encodeURIComponent(perkOffer)}&projLift=${Math.round(
                  economics.netProfitLift
                )}`}
              >
                Continue with {venueName || "My Venue"}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
