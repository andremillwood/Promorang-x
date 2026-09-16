import { ArrowRight, BadgeCheck, Circle, Crown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getStakeholderSuccessContract } from "@promorang/shared/stakeholder-success";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoleSuccessProgress } from "@/hooks/useRoleSuccessProgress";
import { useI18n } from "@/i18n/I18nContext";

const ROLE_TITLES: Record<string, string> = {
  participant: "Your outcome loop",
  creator: "Creator outcome loop",
  host: "Host outcome loop",
  merchant: "Customer outcome loop",
  brand: "Brand outcome loop",
  agency: "Client outcome loop",
};

export function RoleSuccessProgram({ role }: { role: string }) {
  const { t } = useI18n();
  const contract = getStakeholderSuccessContract(role);
  const { data: progress, isLoading } = useRoleSuccessProgress(role);

  if (!contract) return null;

  const nextAction = progress?.nextAction || {
    label: contract.steps[0]?.label || "Start",
    href: contract.steps[0]?.nextHref || "/dashboard",
  };
  const completed = progress?.milestones?.filter((milestone) => milestone.complete) || [];
  const waiting = progress?.milestones?.filter((milestone) => !milestone.complete) || [];
  const latestChange = completed.at(-1)?.label;
  const attention = waiting[0]?.label;
  const metric = progress?.successStage
    ? `Stage ${progress.successStage.current} of ${progress.successStage.total}`
    : contract.northStarMetric;

  return (
    <section className="mb-8 overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-[#1F140E] via-[#0D0D0E] to-[#120B07] text-white shadow-2xl">
      <div className="relative p-6 sm:p-9 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,85,0,0.25),transparent_42%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/40 bg-primary/20 text-primary hover:bg-primary/20 font-bold px-3 py-1">
                <Crown className="mr-1.5 h-3.5 w-3.5" /> Outcome progression
              </Badge>
            </div>
            <h2 className="mt-4 font-sans text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              {ROLE_TITLES[contract.role] || "Outcome loop"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">{contract.purpose}</p>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/50">North star: {contract.northStarMetric}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary font-black text-white hover:bg-primary/90 shadow-[0_12px_35px_rgba(255,85,0,0.35)] px-6">
                <Link to={nextAction.href}>{nextAction.label}<ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3 lg:border-l lg:border-t-0">
            {[
              { eyebrow: "Proven", title: latestChange || "First verified outcome awaits", detail: progress?.sourceLabel || "No verified activity yet.", state: "done" },
              { eyebrow: "Current stage", title: attention || contract.nextIfWorks, detail: metric, state: "waiting" },
              { eyebrow: t("roleSuccess.yourMove"), title: nextAction.label, detail: `Success means: ${contract.outcome}`, state: "next" },
            ].map((item) => (
              <div key={item.eyebrow} className="min-h-48 border-b border-white/10 px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : item.state === "done" ? <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className={`h-3.5 w-3.5 ${item.state === "next" ? "fill-primary text-primary" : "text-white/30"}`} />}
                  {item.eyebrow}
                </div>
                <p className="mt-6 font-sans text-xl font-bold leading-snug text-white">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
