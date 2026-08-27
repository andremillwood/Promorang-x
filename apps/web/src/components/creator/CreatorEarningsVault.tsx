import React from "react";
import {
  DollarSign,
  Gem,
  Coins,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreatorEarningsTab } from "@/components/dashboards/host/CreatorEarningsTab";

export function CreatorEarningsVault() {
  const { toast } = useToast();

  const handleWithdraw = () => {
    toast({
      title: "Creator Payout Requested! 💸",
      description: "Dispatched $465.00 via Lynk Direct. Funds will arrive within 1 business hour.",
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Coins className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Creator Earnings, Gems & Treasury Vault</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                $465.00 Available
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Bounty payouts, Gem creator royalties, node staking yields, and instant Lynk transfers.
            </p>
          </div>
        </div>

        <Button
          onClick={handleWithdraw}
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20"
        >
          <DollarSign className="h-4 w-4 mr-1.5" />
          Withdraw via Lynk
        </Button>
      </div>

      {/* 2. Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Available Cash</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$465.00</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Ready for withdrawal</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Pending Bounties</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$250.00</p>
            <p className="text-xs text-amber-300 font-semibold mt-1">2 reviews in progress</p>
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
            <p className="text-3xl font-black text-white">1,850</p>
            <p className="text-xs text-primary font-semibold mt-1">Staked in Creator Node Pool</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">All-Time Earnings</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">$2,840.00</p>
            <p className="text-xs text-purple-300 font-semibold mt-1">Across 18 campaigns</p>
          </div>
        </div>
      </div>

      {/* 3. Deep Earnings Breakdown */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <CreatorEarningsTab />
      </div>
    </div>
  );
}

export default CreatorEarningsVault;
