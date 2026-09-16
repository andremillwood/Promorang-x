import React from "react";
import {
  Activity,
  Users,
  Gauge,
} from "lucide-react";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";

export function MerchantYieldAnalytics() {
  const { data: economy, isLoading, isError } = useMerchantEconomy();
  const loyaltyPointsRecorded = Number(economy?.totalPointsEarned || 0);
  const recordedActions = Number(economy?.visitorCount || 0);
  const pointsPerAction = Number(economy?.yieldPerVisitor || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-black shadow-lg shadow-emerald-500/20">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Recorded customer results</h2>
            <p className="mt-1 text-xs text-white/60">
              Only activity Promorang can support with recorded customer and transaction evidence appears here.
            </p>
          </div>
        </div>

        <p className="max-w-sm text-xs leading-5 text-white/45">
          A claim, verified redemption, sale, repeat visit, and payout are different records. Promorang does not infer one from another.
        </p>
      </div>

      {isError ? (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          Recorded results could not be loaded. No fallback figures are being shown.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-busy={isLoading}>
        <div className="flex flex-col justify-between space-y-3 rounded-3xl border border-white/10 bg-[#0e1015] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white/50">Recorded customer activity</span>
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{isLoading ? "—" : recordedActions.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">Activity records only; not automatically labelled sales or visits</p>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-3 rounded-3xl border border-white/10 bg-[#0e1015] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white/50">Loyalty points recorded</span>
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{isLoading ? "—" : loyaltyPointsRecorded.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">Secondary loyalty activity, not revenue</p>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-3 rounded-3xl border border-white/10 bg-[#0e1015] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white/50">Points per activity record</span>
            <span className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
              <Gauge className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{isLoading || recordedActions === 0 ? "—" : pointsPerAction.toFixed(1)}</p>
            <p className="mt-1 text-xs text-white/45">A descriptive loyalty ratio, not financial yield</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0e1015] p-6">
        <div>
          <h3 className="text-lg font-black text-white">Sales and redemption details</h3>
          <p className="mt-0.5 text-xs text-white/50">
            Revenue, purchases, customers, redemptions, and historical performance when those records are available.
          </p>
        </div>

        <SalesAnalyticsDashboard />
      </div>
    </div>
  );
}

export default MerchantYieldAnalytics;
