import { ArrowRight, CheckCircle2, MapPin, Sparkles, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

type PoweredParticipationProps = {
  momentId: string;
  momentTitle: string;
  venueName?: string | null;
  reward?: string | null;
  moneySource?: "entry" | "host" | "event" | "platform" | "content" | "hybrid" | null;
  hasLinkedContent?: boolean;
  missionId?: string | null;
  isHost?: boolean;
};

const sourceCopy = {
  entry: "Participant access helps fund this experience.",
  host: "The host is funding this experience.",
  event: "A venue or campaign partner is supporting this experience.",
  platform: "Promorang is supporting this experience.",
  content: "Creator content is helping support this experience.",
  hybrid: "The host and participating partners are supporting this experience.",
} as const;

export function PoweredParticipation({
  momentId,
  momentTitle,
  venueName,
  reward,
  moneySource,
  hasLinkedContent,
  missionId,
  isHost,
}: PoweredParticipationProps) {
  const plan = [
    {
      label: "Join",
      detail: "Save your place and get the access details.",
      Icon: Ticket,
    },
    {
      label: "Show up",
      detail: venueName ? `Check in at ${venueName} when you arrive.` : "Check in when you arrive.",
      Icon: MapPin,
    },
    {
      label: "Keep",
      detail: reward || "A verified memory of being there.",
      Icon: CheckCircle2,
    },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex flex-col gap-4 border-b border-border bg-[radial-gradient(circle_at_88%_0%,hsl(var(--primary)/0.13),transparent_34%)] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Your plan for this Moment</p>
          <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            Join. Show up. Keep what you unlock.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Everything you need to take part in {momentTitle}, in three steps.
          </p>
        </div>
        {reward ? (
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {reward}
          </div>
        ) : null}
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-3">
        {plan.map(({ label, detail, Icon }, index) => (
          <div key={label} className="bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">0{index + 1}</p>
                <h3 className="text-sm font-bold text-foreground">{label}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-background/45 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{sourceCopy[moneySource || "hybrid"]}</p>
        <div className="flex flex-wrap gap-2">
          {missionId ? (
            <Link to={`/missions/${missionId}`} className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline">
              Open linked story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : hasLinkedContent ? (
            <Link to={`/missions?moment=${momentId}`} className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline">
              See linked content <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
          {isHost ? (
            <Link to={`/dashboard?tab=moments&moment=${momentId}`} className="font-bold text-foreground hover:text-primary">
              Manage setup
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
