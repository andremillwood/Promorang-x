import { ShieldCheck } from "lucide-react";
import { HostProofReviewPanel } from "@/components/host/HostProofReviewPanel";

export function HostProofReviewConsole() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-500/20 bg-amber-950/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-black">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Host Next · Proof Close</p>
            <h2 className="mt-2 text-2xl font-black text-white">Close the record only when the evidence supports it.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Review real pending submissions and their audit trail. Approval can release downstream value; rejection records a reason. No sample proof cards or blanket verification scores are shown here.
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 shadow-xl sm:p-6">
        <HostProofReviewPanel />
      </div>
    </div>
  );
}

export default HostProofReviewConsole;
