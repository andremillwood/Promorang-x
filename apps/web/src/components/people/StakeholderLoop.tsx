import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStakeholderHowLead,
  getStakeholderLens,
  getStakeholderSetup,
  type StakeholderHowSurface,
} from "@promorang/shared";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { TicketPass } from "@/components/promorang/SignatureObjects";

const SETUP_SEEN_KEY = "promorang.setup-seen";

export function StakeholderLoopTrail({ role }: { role?: string | null }) {
  const lens = getStakeholderLens(role);
  const to = useExperiencePath();
  const steps = lens.destinations.filter((item) => item.id !== "today");

  return (
    <section aria-labelledby="stakeholder-loop-heading">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">What you can do</p>
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

export function StakeholderSetupPlaybook({ role }: { role?: string | null }) {
  const playbook = getStakeholderSetup(role);
  const to = useExperiencePath();
  const storageKey = `${SETUP_SEEN_KEY}.${playbook.role}`;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(storageKey) === "1");
    } catch {
      setHidden(false);
    }
  }, [storageKey]);

  if (hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  return (
    <section aria-labelledby="stakeholder-setup-heading">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{playbook.kicker}</p>
        <button
          type="button"
          onClick={dismiss}
          className="text-[11px] font-bold text-white/40 hover:text-white/70"
        >
          Hide this
        </button>
      </div>
      <h2 id="stakeholder-setup-heading" className="mt-2 font-serif text-2xl font-bold">
        {playbook.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/60">{playbook.why}</p>
      <ol className="mt-5">
        {playbook.steps.map((step, index) => (
          <li key={step.id} className="relative border-l border-white/10 pl-5">
            <span className="absolute -left-2 top-4 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black">
              {index + 1}
            </span>
            <Link
              to={to(step.href)}
              className="experience-interactive block rounded-2xl px-1 py-4 hover:bg-white/[0.03]"
            >
              <p className="text-[11px] font-bold tracking-[0.16em] text-amber-200/80">{step.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                <span className="text-white/40">You put in · </span>
                {step.youPutIn}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                <span className="text-white/40">Others · </span>
                {step.othersDo}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/60">
                <span className="text-white/40">You get · </span>
                {step.youGet}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StakeholderHowLead({
  role,
  surface,
  variant = "dark",
}: {
  role?: string | null;
  surface: StakeholderHowSurface;
  variant?: "dark" | "light";
}) {
  const lead = getStakeholderHowLead(role, surface);
  const to = useExperiencePath();
  const light = variant === "light";

  return (
    <aside
      className={`rounded-[1.4rem] border px-4 py-4 ${
        light ? "border-black/15 bg-white/70 text-[#191816]" : "border-white/10 bg-white/[0.03] text-white"
      }`}
    >
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${light ? "text-[#d85b24]" : "text-primary"}`}>
        {lead.eyebrow}
      </p>
      <p className="mt-2 font-serif text-xl font-bold">{lead.title}</p>
      <p className={`mt-2 text-sm leading-6 ${light ? "text-black/60" : "text-white/65"}`}>{lead.body}</p>
      {lead.nextHref && lead.nextLabel ? (
        <Link
          to={to(lead.nextHref)}
          className={`experience-interactive mt-3 inline-flex min-h-11 items-center text-sm font-bold ${
            light ? "text-[#d85b24]" : "text-primary"
          }`}
        >
          {lead.nextLabel}
        </Link>
      ) : null}
    </aside>
  );
}
