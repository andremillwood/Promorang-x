import React, { useState } from "react";
import {
  BarChart3,
  DollarSign,
  Gem,
  Coins,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Calculator,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BrandEstimator } from "@/components/brand/BrandEstimator";
import { IntelligenceBureau } from "@/components/brand/IntelligenceBureau";

export function BrandIntelligenceConsole() {
  const { toast } = useToast();

  const handleDepositTreasury = () => {
    toast({
      title: "Growth Escrow Funded! 🔒",
      description: "Added $2,500 to smart campaign escrow vault for milestone disbarment.",
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Treasury Identity */}
      <div className="p-6 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Coins className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Brand Treasury & Strategic Intelligence</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                Escrow Protected
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Milestone disbursement vaults, yield multipliers, and AI budget allocation forecasting.
            </p>
          </div>
        </div>

        <Button
          onClick={handleDepositTreasury}
          className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(255,106,0,0.35)]"
        >
          <DollarSign className="h-4 w-4 mr-1.5" />
          Fund Campaign Escrow
        </Button>
      </div>

      {/* 2. Treasury Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Locked Escrow Vault</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Lock className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$6,400.00</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              Released upon verified host & creator proof
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Gem Liquidity Yield</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Gem className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">4,200 Gems</p>
            <p className="text-xs text-primary font-semibold mt-1">
              14.2% APY in Promorang Liquidity Pool
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Disbursed This Quarter</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$14,850.00</p>
            <p className="text-xs text-cyan-300 font-semibold mt-1">
              Over 28 successful activations & drops
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Budget Estimator & Intelligence Bureau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-white">Campaign ROI & Budget Estimator</h3>
          </div>
          <BrandEstimator />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-white">Agency & Intelligence Bureau</h3>
          </div>
          <IntelligenceBureau />
        </div>
      </div>
    </div>
  );
}

export default BrandIntelligenceConsole;
