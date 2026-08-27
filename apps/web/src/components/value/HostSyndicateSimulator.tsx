import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  CalendarDays,
  Coins,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const HostSyndicateSimulator: React.FC = () => {
  const [productionCost, setProductionCost] = useState<number>(3500);
  const [venueCapacity, setVenueCapacity] = useState<number>(200);
  const [ticketPrice, setTicketPrice] = useState<number>(35);
  const [coProducerTierPrice, setCoProducerTierPrice] = useState<number>(100);

  const syndicateMetrics = useMemo(() => {
    // Number of Co-Producer passes needed to 100% fund upfront production
    const backersNeededForBreakeven = Math.ceil(productionCost / coProducerTierPrice);
    
    // Remaining capacity for GA tickets
    const remainingCap = Math.max(0, venueCapacity - backersNeededForBreakeven);
    
    // Projected GA ticket revenue at 85% capacity
    const projectedGaTicketsSold = Math.round(remainingCap * 0.85);
    const projectedGaRevenue = projectedGaTicketsSold * ticketPrice;
    
    // Total gross box office + backer pool
    const totalGross = productionCost + projectedGaRevenue;
    const netProducerProfit = totalGross - productionCost;
    
    // Social street team amplification: each backer drives ~3.5 peer arrivals
    const guaranteedPeerArrivals = Math.round(backersNeededForBreakeven * 3.5);

    return {
      backersNeededForBreakeven,
      remainingCap,
      projectedGaTicketsSold,
      projectedGaRevenue,
      totalGross,
      netProducerProfit,
      guaranteedPeerArrivals,
    };
  }, [productionCost, venueCapacity, ticketPrice, coProducerTierPrice]);

  return (
    <div className="w-full rounded-3xl bg-zinc-950/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Ticket className="w-3.5 h-3.5" />
            Event Producer & Syndicate Simulator
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            De-Risk Production Costs Before Doors Open
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Never risk personal savings on venue deposits or talent. Calculate how many Co-Producer Backers you need to achieve 100% breakeven before opening night.
          </p>
        </div>

        <Badge
          variant="outline"
          className="self-start md:self-auto border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-mono text-xs px-3 py-1.5"
        >
          ZERO-RISK PRODUCTION
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            {/* Upfront Production Cost */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Upfront Production Budget (Venue, Sound, Talent)</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  ${productionCost.toLocaleString()} USD
                </span>
              </div>
              <Slider
                value={[productionCost]}
                onValueChange={(val) => setProductionCost(val[0])}
                min={500}
                max={15000}
                step={250}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>$500 (Intimate)</span>
                <span>$5,000 (Concert/Party)</span>
                <span>$15,000+ (Festival/Showcase)</span>
              </div>
            </div>

            {/* Venue Capacity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/90">Total Venue Guest Capacity</span>
                <span className="font-mono text-white/90 font-bold text-sm">
                  {venueCapacity} capacity
                </span>
              </div>
              <Slider
                value={[venueCapacity]}
                onValueChange={(val) => setVenueCapacity(val[0])}
                min={50}
                max={1000}
                step={25}
                className="py-1 cursor-pointer"
              />
            </div>

            {/* Ticket & Co-Producer Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white/80">GA Ticket Price</span>
                  <span className="font-mono text-emerald-400 font-bold">${ticketPrice}</span>
                </div>
                <Slider
                  value={[ticketPrice]}
                  onValueChange={(val) => setTicketPrice(val[0])}
                  min={15}
                  max={120}
                  step={5}
                  className="py-1 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white/80">Co-Producer Tier</span>
                  <span className="font-mono text-amber-400 font-bold">${coProducerTierPrice}</span>
                </div>
                <Slider
                  value={[coProducerTierPrice]}
                  onValueChange={(val) => setCoProducerTierPrice(val[0])}
                  min={50}
                  max={300}
                  step={25}
                  className="py-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Social Proof Amplifier Box */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Built-in Viral Street Team
                </div>
                <div className="text-[11px] text-white/70">
                  Your {syndicateMetrics.backersNeededForBreakeven} Co-Producers will organically drive ~{syndicateMetrics.guaranteedPeerArrivals} peer ticket sales.
                </div>
              </div>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
              ORGANIC FLYWHEEL
            </Badge>
          </div>
        </div>

        {/* Right Column: Syndicate Breakeven Model & Soft Gate (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-300">
                Syndicate Breakeven Target
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% PRE-FUNDED
              </div>
            </div>

            {/* Target Backers */}
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {syndicateMetrics.backersNeededForBreakeven}
                <span className="text-base font-semibold text-white/50 ml-2">Co-Producer Backers</span>
              </div>
              <div className="text-xs text-cyan-300 font-mono mt-1">
                at ${coProducerTierPrice}/pass = ${productionCost.toLocaleString()} (100% Breakeven)
              </div>
            </div>

            {/* Projected Net Profit */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-white/70">
                <span>General Admission Tickets Left:</span>
                <span className="font-mono font-bold text-white">{syndicateMetrics.remainingCap} tickets</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Projected GA Box Office Revenue:</span>
                <span className="font-mono font-bold text-white">${syndicateMetrics.projectedGaRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Projected Net Producer Profit:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +${syndicateMetrics.netProducerProfit.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* Soft-Gate Intent Callout */}
          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Open Your Syndicate in Minutes
            </div>
            <p className="text-xs text-white/70">
              Create your event page and issue Co-Producer passes to fund your <strong>${productionCost.toLocaleString()}</strong> budget with zero out-of-pocket risk.
            </p>
            <Button
              asChild
              className="w-full h-11 bg-cyan-500 hover:bg-cyan-600 text-gray-950 font-black text-sm shadow-xl shadow-cyan-500/20"
            >
              <Link to={`/hosting?budget=${productionCost}&cap=${venueCapacity}`}>
                Launch Syndicate & Open Pre-Sales
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
