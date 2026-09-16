import { BarChart3, Calendar, CheckCircle2, RotateCcw, ShieldCheck, Users } from "lucide-react";
import { useHostedMoments } from "@/hooks/useMoments";
import { useRoleSuccessProgress } from "@/hooks/useRoleSuccessProgress";

export function HostImpactYieldConsole() {
  const momentsQuery = useHostedMoments();
  const progressQuery = useRoleSuccessProgress("host");

  const moments = momentsQuery.data || [];
  const progress = progressQuery.data;
  const verifiedParticipants = progress?.current || 0;
  const outcomeStage = progress?.successStage;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-amber-500/20 bg-amber-950/15 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Verified host results</p>
            <h2 className="mt-2 text-2xl font-black text-white">What actually happened?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              This view uses recorded Moments and verified participation. Retention, audience value, rankings, financial yield, or sponsor value should appear only after PROMORANG has evidence to calculate them.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Calendar className="h-4 w-4 text-amber-300" />
          <p className="mt-3 text-3xl font-black text-white">{momentsQuery.isLoading ? "—" : moments.length.toLocaleString()}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Recorded Moments</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <p className="mt-3 text-3xl font-black text-white">{progressQuery.isLoading ? "—" : verifiedParticipants.toLocaleString()}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Verified participants</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Users className="h-4 w-4 text-cyan-300" />
          <p className="mt-3 text-3xl font-black text-white">
            {progressQuery.isLoading
              ? "—"
              : outcomeStage?.complete
                ? "Complete"
                : outcomeStage
                  ? `${outcomeStage.current} / ${outcomeStage.total}`
                  : "—"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">Outcome stage</p>
          {outcomeStage?.label ? <p className="mt-2 text-xs text-white/50">{outcomeStage.label}</p> : null}
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Decision after proof</p>
        <h3 className="mt-2 text-xl font-black text-white">Use the evidence to improve the next Moment.</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              title: "Repeat what worked",
              copy: "If the right people attended and participated, preserve the parts that caused that behavior.",
            },
            {
              icon: RotateCcw,
              title: "Change what did not",
              copy: "Low or weak participation is a signal to adjust audience, offer, timing, place, or distribution—not to invent a success metric.",
            },
            {
              icon: ShieldCheck,
              title: "Measure return later",
              copy: "Repeat attendance and retention belong here only when the same verified people actually come back.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Icon className="h-4 w-4 text-amber-300" />
                <h4 className="mt-3 text-sm font-black text-white">{item.title}</h4>
                <p className="mt-2 text-xs leading-5 text-white/50">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-6 text-white/50">
        <strong className="text-white">Not measured yet:</strong> retention rate, participant monetary value, sponsor ROI, host ranking, liquidity yield, and geographic audience density. These should stay absent until a real data model and evidence source exist.
      </section>
    </div>
  );
}

export default HostImpactYieldConsole;
