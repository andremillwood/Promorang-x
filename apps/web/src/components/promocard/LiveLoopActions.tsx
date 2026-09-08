import { Link } from "react-router-dom";
import { firstActionsForRole, getStakeholderLens, type FirstAction } from "@promorang/shared";

export function LiveLoopActions({
  role,
  actions,
  title = "First hour",
}: {
  role?: string | null;
  actions?: FirstAction[];
  title?: string;
}) {
  const items = actions || firstActionsForRole(role);
  const lens = getStakeholderLens(role);
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{title}</p>
      <p className="mt-1 text-sm text-white/55">
        {lens.promise}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {items.map((action, index) => (
          <Link
            key={action.id}
            to={action.href}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 hover:border-primary/40"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              {index + 1}. {action.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/60">{action.why}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
