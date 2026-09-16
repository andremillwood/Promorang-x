import { FileCheck2, Scale } from "lucide-react";
import { O2OAnalyticsPanel } from "@/components/analytics/O2OAnalyticsPanel";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";

export default function BrandEvidencePack() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-black"><FileCheck2 className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Brand Next · Evidence Pack</p>
            <h2 className="mt-2 text-2xl font-black text-white">Separate what was observed, attributed and verified before deciding what deserves more budget.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">This pack uses the existing authenticated O2O analytics and campaign records. It does not add modeled ROI, projected footfall or unsupported financial yield.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-black text-white"><FileCheck2 className="h-4 w-4 text-primary" />Evidence</div>
        <O2OAnalyticsPanel audience="brand" />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-black text-white"><Scale className="h-4 w-4 text-primary" />Decision context</div>
        <BrandIntelligenceConsole />
      </section>
    </div>
  );
}
