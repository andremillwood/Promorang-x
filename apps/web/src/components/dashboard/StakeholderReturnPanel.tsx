import {
  ACTIVATION_REVIEW_NEXT_DECISIONS,
  ACTIVATION_REVIEW_SUMMARY,
  STAKEHOLDER_RETURN_BLUEPRINTS,
  STAKEHOLDER_RETURN_METRICS,
  type StakeholderReturnMetricId,
  type StakeholderReturnRole,
} from "@promorang/shared";
import { ArrowRight, Gem, HeartHandshake, Sparkles, Store, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { useStakeholderReturn } from "@/hooks/useStakeholderReturn";
import { cn } from "@/lib/utils";

type StakeholderReturnPanelProps = {
  role: StakeholderReturnRole;
  className?: string;
};

const toneClass = {
  primary: "text-primary",
  pink: "text-fuchsia-300",
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  amber: "text-amber-300",
} as const;

const metricIcons = {
  accessOpened: Ticket,
  gemsEarned: Gem,
  doorsOpened: Sparkles,
  peopleAroundIt: Users,
  visitsMoved: Users,
  returns: HeartHandshake,
  redemptions: Ticket,
  valueMoved: Store,
  peopleReached: Users,
  storiesCreated: Sparkles,
  collaborations: HeartHandshake,
  gemsMoved: Gem,
} as const;

export function StakeholderReturnPanel({ role, className }: StakeholderReturnPanelProps) {
  const { data, isLoading } = useStakeholderReturn(role);
  const copy = STAKEHOLDER_RETURN_BLUEPRINTS[role];
  const tone = toneClass[copy.tone];
  const totals = data?.totals;
  const metricValue: Record<StakeholderReturnMetricId, number> = {
    accessOpened: data?.accessCount || 0,
    gemsEarned: data?.gemsEarned || 0,
    doorsOpened: data?.openings.length || 0,
    peopleAroundIt: totals?.peopleJoined || totals?.peopleShowedUp || 0,
    visitsMoved: totals?.peopleShowedUp || 0,
    returns: totals?.peopleReturned || 0,
    redemptions: totals?.redemptions || 0,
    valueMoved: totals?.grossValue || 0,
    peopleReached: totals?.peopleReached || totals?.peopleJoined || 0,
    storiesCreated: totals?.storiesCreated || 0,
    collaborations: totals?.collaborationsOpened || data?.acceptedCollaborations || 0,
    gemsMoved: Math.max(data?.gemsEarned || 0, data?.gemsUsed || 0),
  };
  const metrics = copy.metrics.map((id) => ({ ...STAKEHOLDER_RETURN_METRICS[id], value: metricValue[id], icon: metricIcons[id] }));

  return (
    <section className={cn("overflow-hidden rounded-2xl border border-white/10 bg-[#111110] text-white", className)}>
      <div className="grid gap-5 p-5 sm:p-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
        <div className="min-w-0">
          <p className={cn("text-[10px] font-black uppercase tracking-[0.22em]", tone)}>{data?.title || copy.title}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">{copy.headline}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{copy.body}</p>
          <div className="mt-4 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr))]">
            <ReturnStatement label="Social return" value={copy.socialReturn} />
            <ReturnStatement label="Commercial return" value={copy.commercialReturn} />
          </div>
          <div className="mt-5 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr))]">
            {metrics.map((metric) => (
              <div key={metric.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <metric.icon className={cn("h-4 w-4", tone)} />
                <p className="mt-3 text-xl font-black">{isLoading ? "..." : Number(metric.value || 0).toLocaleString()}</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/35">{metric.label}</p>
                <p className="mt-2 text-[10px] leading-4 text-white/35">{metric.humanMeaning}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">What this opened</p>
          <p className="mt-3 text-sm leading-6 text-white/62">
            {data?.latestHuman || data?.latestCommercial || "Once Moments are reviewed, this will show the human and commercial return in plain language."}
          </p>
          {(data?.latestContentReturn || data?.latestGemsReturn || data?.latestSceneLearning || data?.latestParticipantValue) && (
            <div className="mt-4 grid gap-2">
              {data.latestParticipantValue && <ReturnSignal label="Participant value" value={data.latestParticipantValue} />}
              {data.latestContentReturn && <ReturnSignal label="Content return" value={data.latestContentReturn} />}
              {data.latestGemsReturn && <ReturnSignal label="Gems moved" value={data.latestGemsReturn} />}
              {data.latestSceneLearning && <ReturnSignal label="Scene learning" value={data.latestSceneLearning} />}
            </div>
          )}
          <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.06] p-3">
            <p className={cn("text-[9px] font-black uppercase tracking-[0.16em]", tone)}>{data?.latestDecision ? `Next decision: ${data.latestDecision}` : ACTIVATION_REVIEW_SUMMARY.cta}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">{data?.latestDecisionNote || "Every reviewed Moment should help decide whether to repeat, improve, invite, fund, or close."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ACTIVATION_REVIEW_NEXT_DECISIONS.map((decision) => (
                <span key={decision.id} title={decision.meaning} className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/55">
                  {decision.label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(data?.openings || []).slice(0, 3).map((opening) => (
              <div key={opening.id} className="rounded-xl bg-black/35 p-3">
                <p className="text-sm font-bold">{opening.title}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/35">{opening.type} · {opening.status}</p>
              </div>
            ))}
            {!data?.openings?.length && (
              <div className="rounded-xl bg-black/35 p-3 text-xs leading-5 text-white/45">
                Invitations, access, creator work, return visits, and funded next moves will collect here.
              </div>
            )}
          </div>
          <Link to="/wallet" className={cn("mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]", tone)}>
            See Gem movement <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReturnStatement({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/30">{label}</p>
      <p className="mt-2 text-xs leading-5 text-white/55">{value}</p>
    </div>
  );
}

function ReturnSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/30">{label}</p>
      <p className="mt-1 text-xs leading-5 text-white/55">{value}</p>
    </div>
  );
}
