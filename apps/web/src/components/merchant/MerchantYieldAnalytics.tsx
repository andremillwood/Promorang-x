import { currentUiLocale } from "@/i18n/geo-locale";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Gauge,
} from "lucide-react";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";

export function MerchantYieldAnalytics() {
  const { data: economy, isLoading, isError, isFetching, refetch } = useMerchantEconomy();
  const pointsRecorded = Number(economy?.totalPointsEarned || 0);
  const recordedActions = Number(economy?.visitorCount || 0);
  const pointsPerAction = Number(economy?.yieldPerVisitor || 0);

  return (
    <div className="space-y-6">
      {/* 1. Recorded-results orientation */}
      <div className="p-5 rounded-sm  bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden">
            <Activity className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-2xl font-black text-white">Customer activity</h2>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Points and actions recorded at your events.
            </p>
          </div>
        </div>

        <p className="max-w-sm text-xs leading-5 text-white/45">Claims, arrivals and purchases are counted separately.</p>
      </div>

      {isError ? <div role="alert" className="rounded-sm border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100"><p>Customer activity could not be loaded.</p><Button variant="outline" className="mt-3" disabled={isFetching} onClick={() => void refetch()}>Try again</Button></div> : null}

      {/* 2. Evidence-backed metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy={isLoading}>
        <div className="p-5 rounded-sm  bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Recorded points</span>
            <span className="p-2 rounded-sm bg-emerald-500/10 text-emerald-400">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="break-words text-3xl font-semibold tabular-nums text-white">{isLoading || isError ? "—" : pointsRecorded.toLocaleString(currentUiLocale())}</p>
            <p className="mt-1 text-xs text-white/45">From recorded Moment transactions</p>
          </div>
        </div>

        <div className="p-5 rounded-sm  bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Recorded actions</span>
            <span className="p-2 rounded-sm bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="break-words text-3xl font-semibold tabular-nums text-white">{isLoading || isError ? "—" : recordedActions.toLocaleString(currentUiLocale())}</p>
            <p className="mt-1 text-xs text-white/45">Not automatically labelled visits or sales</p>
          </div>
        </div>

        <div className="p-5 rounded-sm  bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Points per recorded action</span>
            <span className="p-2 rounded-sm bg-cyan-500/10 text-cyan-400">
              <Gauge className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="break-words text-3xl font-semibold tabular-nums text-white">{isLoading || isError || recordedActions === 0 ? "—" : pointsPerAction.toFixed(1)}</p>
            <p className="mt-1 text-xs text-white/45">A descriptive ratio, not financial yield</p>
          </div>
        </div>
      </div>

      {/* 3. Deep Sales & Revenue Graph Sub-Engine */}
      <div className="rounded-sm  bg-[#0e1015] min-w-0 p-4 sm:p-6 space-y-4">
        <SalesAnalyticsDashboard />
      </div>
    </div>
  );
}

export default MerchantYieldAnalytics;
