import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Circle, Sparkles } from "lucide-react";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";

type StoryBeat = {
  label: string;
  detail: string;
  icon: LucideIcon;
  tone?: "complete" | "current" | "quiet";
};

type StudioJourneyStoryProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  beats: [StoryBeat, StoryBeat, StoryBeat];
  signalLabel: string;
  signalValue: string;
  guidanceId?: string;
};

export function StudioJourneyStory({ eyebrow, title, introduction, beats, signalLabel, signalValue, guidanceId }: StudioJourneyStoryProps) {
  const story = (
    <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--muted)/.32)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
      <div className="grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="flex min-h-64 flex-col justify-between border-b border-border/60 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
            <h2 className="mt-4 max-w-lg font-serif text-3xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{introduction}</p>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4 border-t border-border/50 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{signalLabel}</p>
            <p className="font-serif text-3xl font-semibold tracking-tight">{signalValue}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3">
          {beats.map((beat, index) => (
            <article key={beat.label} className="group relative min-h-56 border-b border-border/60 p-6 last:border-b-0 sm:min-h-64 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:p-7">
              <div className="flex items-center justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${beat.tone === "complete" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600" : beat.tone === "current" ? "border-orange-500/30 bg-orange-500/10 text-orange-500" : "border-border bg-background/50 text-muted-foreground"}`}>
                  <beat.icon className="h-4 w-4" />
                </span>
                {beat.tone === "current" ? <Sparkles className="h-4 w-4 text-orange-500" /> : beat.tone === "complete" ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <Circle className="h-3 w-3 text-border" />}
              </div>
              <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{index === 0 ? "What happened" : index === 1 ? "Needs attention" : "Decision next"}</p>
              <h3 className="mt-3 font-serif text-xl font-semibold leading-tight">{beat.label}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{beat.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  if (!guidanceId) return story;

  return (
    <GuidanceDisclosure
      id={guidanceId}
      eyebrow={eyebrow}
      title={title}
      summary={introduction}
      className="mt-0"
    >
      {story}
    </GuidanceDisclosure>
  );
}
