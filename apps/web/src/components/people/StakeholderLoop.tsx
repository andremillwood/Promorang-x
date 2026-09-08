import { Link } from "react-router-dom";
import { getStakeholderLens } from "@promorang/shared";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { TicketPass } from "@/components/promorang/SignatureObjects";

export function StakeholderLoopTrail({ role }: { role?: string | null }) {
  const lens = getStakeholderLens(role);
  const to = useExperiencePath();
  const steps = lens.destinations.filter((item) => item.id !== "today");

  return (
    <section aria-labelledby="stakeholder-loop-heading">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your loop</p>
      <h2 id="stakeholder-loop-heading" className="mt-2 font-serif text-2xl font-bold">
        {lens.workspaceLabel}
      </h2>
      <ol className="mt-5">
        {steps.map((step, index) => (
          <li key={step.id} className="relative border-l border-white/10 pl-5">
            <span className="absolute -left-2 top-4 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black">
              {index + 1}
            </span>
            <Link
              to={to(step.href)}
              className="experience-interactive block rounded-2xl px-1 py-4 hover:bg-white/[0.03]"
            >
              <p className="text-[11px] font-bold tracking-[0.16em] text-amber-200/80">{step.label}</p>
              <p className="mt-1 text-sm leading-6 text-white/70">{step.meaning}</p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StakeholderPutInPass({ role }: { role?: string | null }) {
  const lens = getStakeholderLens(role);
  const to = useExperiencePath();
  return (
    <Link to={to(lens.putIn.href)} className="block">
      <TicketPass
        kicker="What to put in"
        title={lens.putIn.label}
        detail={lens.putIn.detail}
        stub={lens.putIn.stub}
        stubLabel="In"
      />
    </Link>
  );
}

export function StakeholderSurfaceLead({
  role,
  surface,
}: {
  role?: string | null;
  surface: "world" | "promoCard" | "activity";
}) {
  const lens = getStakeholderLens(role);
  const to = useExperiencePath();
  const object =
    surface === "world"
      ? lens.world
      : surface === "activity"
        ? lens.activity
        : { label: "Card", meaning: lens.promoCard.meaning, href: "/card" };

  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{object.label}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">{object.meaning}</p>
      <Link
        to={to(lens.putIn.href)}
        className="experience-interactive mt-3 inline-flex min-h-11 items-center text-sm font-bold text-primary"
      >
        {lens.putIn.label}: {lens.putIn.detail}
      </Link>
    </div>
  );
}
