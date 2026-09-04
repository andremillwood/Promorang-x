import {
  TrendingUp,
  DollarSign,
  Gem,
  Users,
  Repeat,
} from "lucide-react";
import { useMerchantSalesAnalytics } from "@/hooks/useMerchantSalesAnalytics";
import { formatPayoutDate } from "@/lib/payout-calendar";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";

export function MerchantYieldAnalytics() {
  const analytics = useMerchantSalesAnalytics();
  const funnel = analytics.data;
  const payoutLabel = formatPayoutDate(funnel?.nextPayoutAt);
  const money = (value?: number) =>
    value == null ? "—" : `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <TrendingUp className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">What came back this cycle</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                Next payout {payoutLabel}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Issued, claimed, redeemed — from your sales. Friday is when settlement lands.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Redeemed in place</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{money(funnel?.cameBack)}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              {funnel?.redeemed ?? 0} verified visits
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Passes still held</span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Gem className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{funnel ? Math.max(0, funnel.claimed - funnel.redeemed) : "—"}</p>
            <p className="text-xs text-primary font-semibold mt-1">Claimed, not yet scanned</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">People who came</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{funnel?.uniqueCustomers ?? "—"}</p>
            <p className="text-xs text-cyan-300 font-semibold mt-1">Unique guests this window</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/10 bg-[#0e1015] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-white/50">Came back again</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Repeat className="h-4 w-4" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">
              {funnel ? `${funnel.repeatCustomerRate}%` : "—"}
            </p>
            <p className="text-xs text-amber-300 font-semibold mt-1">Repeat guests, not a projected rate</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-white">Sales and redemptions</h3>
          <p className="text-xs text-white/50 mt-0.5">Live ledger. Empty until a guest redeems.</p>
        </div>
        <SalesAnalyticsDashboard />
      </div>
    </div>
  );
}

export default MerchantYieldAnalytics;
