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
  const pointsRecorded = Number(economy?.totalPointsEarned || 0);
  const recordedActions = Number(economy?.visitorCount || 0);
  const pointsPerAction = Number(economy?.yieldPerVisitor || 0);

  return (
    <div className="space-y-6">
      {/* 1. Recorded-results orientation */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Activity className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Recorded customer results</h2>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Read only what Promorang can support with recorded venue and transaction activity.
            </p>
          </div>
        </div>

        <p className="max-w-sm text-xs leading-5 text-white/45">A claim, arrival, sale, repeat visit, and payout are different records. This view does not infer one from another.</p>
      </div>

      {isError ? <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">Recorded results could not be loaded. No fallback figures are being shown.</div> : null}

      {/* 2. Evidence-backed metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy={isLoading}>
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Recorded points</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{isLoading ? "—" : pointsRecorded.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">From recorded Moment transactions</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Recorded actions</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{isLoading ? "—" : recordedActions.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">Not automatically labelled visits or sales</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Points per recorded action</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Gauge className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{isLoading || recordedActions === 0 ? "—" : pointsPerAction.toFixed(1)}</p>
            <p className="mt-1 text-xs text-white/45">A descriptive ratio, not financial yield</p>
          </div>
        </div>
      </div>

      {/* 3. Deep Sales & Revenue Graph Sub-Engine */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">Detailed Sales & Redemption Breakdown</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Historical ledger, tax categorization, and payment rail distributions.
            </p>
          </div>
        </div>

        <SalesAnalyticsDashboard />
      </div>
    </div>
  );
}

export default MerchantYieldAnalytics;
