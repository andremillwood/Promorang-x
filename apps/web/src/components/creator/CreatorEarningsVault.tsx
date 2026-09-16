import { Coins } from "lucide-react";
import { CreatorEarningsTab } from "@/components/dashboards/host/CreatorEarningsTab";

export function CreatorEarningsVault() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-purple-500/20 bg-purple-950/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-500 text-white"><Coins className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Creator Next · Value Ledger</p>
            <h2 className="mt-2 text-2xl font-black text-white">Track attributed, approved and settled creator value without pretending it has already been paid.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">This view is backed by the creator earnings ledger. It does not show a withdrawal button, wallet balance, staking yield or payout rail unless the underlying payment flow can prove those states.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 shadow-xl sm:p-6">
        <CreatorEarningsTab />
      </section>
    </div>
  );
}

export default CreatorEarningsVault;
