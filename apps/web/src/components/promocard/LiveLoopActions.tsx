import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { Link } from "react-router-dom";
import { Check, Circle, Clock3 } from "lucide-react";
import { firstActionsForRole, getStakeholderLens, type FirstAction } from "@promorang/shared";

const roleOutcome: Record<string, string> = {
  creator: "Turn a release into attributed visits, claims, and verified use.",
  host: "Turn a gathering into a room people enter and a result you can see.",
  merchant: "Turn one real benefit into attributable visits and validated redemptions.",
  brand: "Turn funded value into recorded use you can verify.",
  participant: "Find something useful, put it on your card, and use it when it matters.",
};

export function LiveLoopActions({
  role,
  actions,
  title = "First hour",
  completedActionIds = [],
}: {
  role?: string | null;
  actions?: FirstAction[];
  title?: string;
  completedActionIds?: string[];
}) {
  const { t: webT } = useWebI18n();
  const items = actions || firstActionsForRole(role);
  const lens = getStakeholderLens(role);
  const completed = new Set(completedActionIds);
  const nextAction = items.find((item) => !completed.has(item.id));
  const completedCount = items.filter((item) => completed.has(item.id)).length;
  const allComplete = completedCount === items.length;

  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{allComplete ? "Loop active" : nextAction ? "Needs your attention" : title}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white">{lens.workspaceLabel} priorities</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{roleOutcome[lens.role] || lens.promise}</p>
        </div>
        <div className="text-right">
          <p className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-white/45">{completedCount} {webT("web.of")} {items.length} complete</p>
          <p className="mt-2 text-[10px] text-white/30">Based on recorded activity</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {items.map((action) => {
          const isComplete = completed.has(action.id);
          const isNext = nextAction?.id === action.id;
          const Icon = isComplete ? Check : isNext ? Clock3 : Circle;
          return (
            <Link
              key={action.id}
              to={action.href}
              data-state={isComplete ? "complete" : isNext ? "next" : "upcoming"}
              className={`rounded-2xl border px-4 py-4 transition hover:border-primary/50 ${isNext ? "border-primary/40 bg-primary/[.08]" : isComplete ? "border-emerald-300/20 bg-emerald-300/[.045]" : "border-white/10 bg-white/[0.04]"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${isNext ? "text-primary" : isComplete ? "text-emerald-200" : "text-white/40"}`}>{isComplete ? webT("web.completed") : isNext ? "Do this next" : "After that"}</p>
                <Icon className={`h-4 w-4 ${isNext ? "text-primary" : isComplete ? "text-emerald-200" : "text-white/25"}`} />
              </div>
              <p className="mt-3 text-sm font-black text-white/85">{action.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{action.why}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
