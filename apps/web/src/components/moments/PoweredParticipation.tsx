import { ArrowRight, Building2, Camera, CheckCircle2, MapPin, Store, Users } from "lucide-react";
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
  entry: "Participant access helps fund this Moment and what it returns.",
  host: "The host is funding the experience and its participant value.",
  event: "A venue or campaign partner is funding this Moment around a defined outcome.",
  platform: "Promorang is backing this Moment to grow verified participation.",
  content: "Creator content performance is helping fund and move this Moment.",
  hybrid: "The host, partners, content, and Promorang can combine support around one verified outcome.",
} as const;

const steps = [
  {
    label: "Content creates the reason",
    detail: "A creator story, invitation, or recommendation gives people context and one clear next step.",
    Icon: Camera,
  },
  {
    label: "The Moment creates the action",
    detail: "People visit, attend, participate, buy, share, or contribute in a way that matters to the host and venue.",
    Icon: MapPin,
  },
  {
    label: "Showing up makes it count",
    detail: "A check-in, scan, contribution, or visit lets the people involved recognize what happened.",
    Icon: CheckCircle2,
  },
  {
    label: "New doors open",
    detail: "People meet, creators get noticed, hosts grow a returning crowd, and partners see what they helped make possible.",
    Icon: Users,
  },
];

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
  const fundingCopy = sourceCopy[moneySource || "hybrid"];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0c] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_86%_10%,rgba(255,106,26,0.18),transparent_32%)] p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">How this Moment is powered</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">A story draws people in. Showing up changes what happens next.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              {fundingCopy} The goal is not a ticket or a draw—it is helping something real happen around {momentTitle}, then making sure the people who contributed are seen and included in what opens next.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Participant unlock</p>
            <p className="mt-1 max-w-[15rem] text-sm font-semibold text-white">{reward || "Verified memory, progress, and any funded reward"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ label, detail, Icon }, index) => (
          <div key={label} className="bg-[#111110] p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary"><Icon className="h-4 w-4" /></span>
              <span className="font-mono text-[10px] text-white/35">0{index + 1}</span>
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">{label}</h3>
            <p className="mt-2 text-xs leading-5 text-white/50">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {venueName ? <Store className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Who is powering this</p>
              <p className="mt-1 font-semibold text-white">{venueName || "The host and participating partners"}</p>
              <p className="mt-2 text-xs leading-5 text-white/55">
                Brands and merchants contribute budget, access, products, or rewards around an outcome such as attendance, visits, content, referrals, or sales. Their support should make the experience better and create a reason for people to care, return, and choose them.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Content in this journey</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {hasLinkedContent ? "This Moment has a linked creator story or mission." : "Content can invite, explain, and move people into this Moment."}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/55">
            PromoShare shows what a creator's story set in motion: who visited, joined, returned, or acted. Draw entries can be one optional reward; they are not the purpose of the system.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {missionId ? (
              <Link to={`/missions/${missionId}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-black">
                Open creator story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link to={`/missions?moment=${momentId}`} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white hover:border-primary/50 hover:text-primary">
                See linked content <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {isHost ? (
              <Link to={`/dashboard?tab=moments&moment=${momentId}`} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white hover:border-primary/50 hover:text-primary">
                Manage partners
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
