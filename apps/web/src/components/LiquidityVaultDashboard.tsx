import { Link } from "react-router-dom";
import { Gem, Info, LockKeyhole, ShieldCheck } from "lucide-react";
import { usePromoShareRail } from "@/hooks/usePromoShareRail";

export const LiquidityVaultDashboard = () => {
  const { balances } = usePromoShareRail();
  const availableGems = Number(balances.gems || 0);

  return (
    <section className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-300">
            <ShieldCheck className="h-4 w-4" /> Economy integrity
          </div>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Community reserve is not active.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            PROMORANG does not currently present a simulated liquidity pool, APY, protocol TVL, reserve share, or financial yield as a live product. Those concepts require a real ledger, settlement model, legal/compliance review, and auditable economics before they can be offered here.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Your recorded Gems</p>
          <p className="mt-1 text-2xl font-black text-white">{availableGems.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-500">Shown from your current PROMORANG balance only.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <Gem className="h-5 w-5 text-blue-300" />
          <h3 className="mt-3 text-sm font-black">Gems are account value records</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">Use the Wallet and current economy rules to understand what your recorded balance can actually do.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <LockKeyhole className="h-5 w-5 text-amber-300" />
          <h3 className="mt-3 text-sm font-black">No simulated staking</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">Gems are not moved into a local browser “stake” and no annual return is promised or modeled here.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <Info className="h-5 w-5 text-emerald-300" />
          <h3 className="mt-3 text-sm font-black">Future products need proof too</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">If a reserve or co-production instrument is launched later, balances, rights, risks, settlement, and returns must come from real records and disclosed terms.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/wallet" className="inline-flex min-h-11 items-center rounded-xl bg-blue-500 px-5 text-sm font-black text-white hover:bg-blue-400">
          Open Wallet
        </Link>
        <Link to="/missions" className="inline-flex min-h-11 items-center rounded-xl border border-slate-700 px-5 text-sm font-black text-white hover:bg-slate-900">
          Find verified ways to earn value
        </Link>
      </div>
    </section>
  );
};

export default LiquidityVaultDashboard;
