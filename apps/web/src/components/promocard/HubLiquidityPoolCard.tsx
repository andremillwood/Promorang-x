import React from "react";
import {
  Layers,
  Store,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MarginPoolService } from "@/lib/promocard";
import { B2BBulkPassModal } from "./B2BBulkPassModal";

interface HubLiquidityPoolCardProps {
  hubName?: string;
  seasonTitle?: string;
  operatorSharePercent?: number;
}

export const HubLiquidityPoolCard: React.FC<HubLiquidityPoolCardProps> = ({
  hubName = "Downtown Culture & Dining Hub",
  seasonTitle = "Season 1: Spring Revival",
  operatorSharePercent = 80,
}) => {
  const [showBulkPassModal, setShowBulkPassModal] = React.useState(false);
  const pools = MarginPoolService.getAllPools();
  const totalMerchants = pools.length;
  const totalBuyingPower = pools.reduce((acc, p) => acc + p.totalMarginCommitted, 0);
  const totalCashVolume = pools.reduce((acc, p) => acc + p.totalCashEarned, 0);
  const estimatedPlatformFee = totalCashVolume * 0.05;
  const operatorEarnings = estimatedPlatformFee * (operatorSharePercent / 100);

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 blur-3xl pointer-events-none" />

      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 text-[10px] uppercase">
                {seasonTitle}
              </Badge>
              <span className="text-xs text-zinc-400 font-medium">Operator Franchise Hub</span>
            </div>
            <CardTitle className="text-xl font-bold mt-1">{hubName}</CardTitle>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              onClick={() => setShowBulkPassModal(true)}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl shadow-sm"
            >
              Issue Corporate / Bulk Passes
            </Button>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              {operatorSharePercent}% Operator Split
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Total Hub Buying Power</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">
              ${totalBuyingPower.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5 block">Aggregated across {totalMerchants} partner merchants</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Settled Gross Cash Flow</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              ${totalCashVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-zinc-500 mt-0.5 block">Total customer fiat spent</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Your 80% Operator Split</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              ${operatorEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-500/80 mt-0.5 block">Direct cash commission yield</span>
          </div>
        </div>

        {/* Participating Merchants Liquidity Snapshot */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Store className="h-4 w-4 text-amber-400" />
            Active Margin Pools in this Hub
          </h4>

          <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            {pools.map((p) => (
              <div key={p.merchantId} className="flex items-center justify-between p-3 text-xs">
                <div>
                  <p className="font-semibold text-white">{p.merchantName}</p>
                  <p className="text-[11px] text-zinc-400">{p.category} • ${p.allowancePerUser} off ${p.minBasketSize}+</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">${p.totalMarginCommitted.toFixed(0)} Liquidity</p>
                  <p className="text-[11px] text-emerald-400 font-medium">{p.currentRedemptionsCount} sales settled</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <B2BBulkPassModal
        isOpen={showBulkPassModal}
        onClose={() => setShowBulkPassModal(false)}
        hubName={hubName}
      />
    </Card>
  );
};
