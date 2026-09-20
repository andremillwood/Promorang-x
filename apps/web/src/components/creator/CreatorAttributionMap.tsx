import { Link2 } from "lucide-react";
import { CreatorO2OSummaryPanel } from "@/components/host/CreatorO2OSummaryPanel";
import { O2OLinkManager } from "@/components/host/O2OLinkManager";

export function CreatorAttributionMap() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-purple-500/20 bg-purple-950/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-500 text-white"><Link2 className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Creator Next · Proof Dossier</p>
            <h2 className="mt-2 text-2xl font-black text-white">See what your work can actually be connected to.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Tracked links and O2O records can show observed and attributed movement. They do not automatically prove verified attendance, purchase or payout.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 shadow-xl sm:p-6">
        <O2OLinkManager />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 shadow-xl sm:p-6">
        <CreatorO2OSummaryPanel />
      </section>
    </div>
  );
}

export default CreatorAttributionMap;
