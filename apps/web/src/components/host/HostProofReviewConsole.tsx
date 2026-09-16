import { ShieldCheck } from "lucide-react";
import { HostProofReviewPanel } from "@/components/host/HostProofReviewPanel";

export function HostProofReviewConsole() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-amber-500/25 bg-[#0b0b0c] text-white shadow-xl">
        <div className="flex items-start gap-4 bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,.14),transparent_30%)] p-5 sm:p-7">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-black"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-300">Host proof review</p>
            <h2 className="mt-1 text-2xl font-black">Decide what counts as verified participation.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">Submitted evidence is not approved attendance. Approval can release downstream rewards, memories, Pieces or payouts, so each decision should remain auditable.</p>
          </div>
        </div>
        <div className="border-t border-white/10 bg-amber-950/10 px-5 py-4 text-xs leading-5 text-amber-100/75 sm:px-7">
          The legacy sample proof cards and blanket “100% Verified” metric have been removed. The queue below is sourced from the real proof-review endpoint and preserves pending, reviewed, rejected, reward and payout states.
        </div>
      </section>

      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-5 shadow-xl sm:p-6">
        <HostProofReviewPanel />
      </div>
    </div>
  );
}

export default HostProofReviewConsole;
