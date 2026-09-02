import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CREATE_INTENTS,
  createIntentStaysInPeople,
  gatheringFormCopy,
  isGatheringIntent,
  selectedCreateIntent,
} from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { TicketPass } from "@/components/promorang/SignatureObjects";
import { useToast } from "@/hooks/use-toast";

export default function CreateSomething() {
  const [params] = useSearchParams();
  const { ask, gather } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const selected = selectedCreateIntent(params.get("intent"));
  const form = gatheringFormCopy(selected?.intent);
  const [question, setQuestion] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [when, setWhen] = useState("");
  const [made, setMade] = useState<{ kind: "ask" | "gather"; title: string; href?: string } | null>(null);

  const defaultWhen = () => {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    date.setHours(20, 0, 0, 0);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const submitAsk = async () => {
    try {
      await ask.mutateAsync({
        question,
        sceneId: params.get("hub") || undefined,
        category: selected?.intent === "post" ? "share" : "community",
      });
      setMade({ kind: "ask", title: question });
      toast({ title: "Asked", description: "Your people can answer this now." });
    } catch (error) {
      toast({ title: "Could not ask that yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  const submitGather = async () => {
    try {
      const moment = await gather.mutateAsync({
        intent: selected?.intent,
        title,
        place,
        location: place,
        startsAt: when ? new Date(when).toISOString() : new Date(defaultWhen()).toISOString(),
        sceneId: params.get("hub") || undefined,
      });
      setMade({
        kind: "gather",
        title,
        href: moment?.id ? `/moments/${moment.id}` : undefined,
      });
      toast({ title: "It’s on the calendar", description: "Send it to your people. They don’t need the studio." });
    } catch (error) {
      toast({ title: "Could not put that up yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (made) {
    return (
      <ExperienceShell
        eyebrow="It’s live"
        title="Send this to your people."
        description="They should understand the ask without any PROMORANG words."
        backTo="/create"
        backLabel="Create another"
      >
        <TicketPass
          kicker={made.kind === "ask" ? "Answer this" : form.ticketKicker}
          title={made.title}
          detail={place ? `${place}${when ? ` · ${new Date(when).toLocaleString()}` : ""}` : "Your people can do this now."}
          stub="GO"
          stubLabel="Keep"
        />
        <Link to={to("/happened")} className="block rounded-[1.6rem] bg-primary px-5 py-5 text-black">
          <p className="font-serif text-2xl font-bold">Watch who shows up</p>
          <p className="mt-1 text-sm">What happened prints like a receipt — not a dashboard.</p>
        </Link>
        {made.href ? (
          <Link to={made.href} className="block text-center text-sm text-white/45">
            Open the gathering
          </Link>
        ) : null}
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow="Create something"
      title="What do you want your people to do?"
      description="You choose the behaviour. PROMORANG picks the right tool underneath."
      backTo="/dashboard"
    >
      <div className="grid gap-2">
        {CREATE_INTENTS.map((item) => (
          <Link
            key={item.intent}
            to={(() => {
              const [path, qs] = item.href.split("?");
              const dest = createIntentStaysInPeople(path) ? to(path) : path;
              return qs ? `${dest}?${qs}` : dest;
            })()}
            className={`rounded-[1.5rem] border px-4 py-4 ${selected?.intent === item.intent ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04]"}`}
          >
            <p className="font-serif text-2xl font-bold">{item.label}</p>
            <p className="mt-1 text-sm text-white/50">{item.prompt}</p>
          </Link>
        ))}
      </div>

      {selected?.intent === "answer" || selected?.intent === "post" ? (
        <section className="space-y-4">
          <TicketPass
            kicker={form.ticketKicker}
            title={question || form.heading}
            detail={selected.prompt}
            stub="ASK"
            stubLabel="Keep"
          />
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{form.heading}</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={4}
              placeholder={form.titlePlaceholder}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
            />
          </label>
          <button
            type="button"
            disabled={!question.trim() || ask.isPending}
            onClick={submitAsk}
            className="min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
          >
            {ask.isPending ? "Asking…" : form.action}
          </button>
        </section>
      ) : null}

      {selected && isGatheringIntent(selected.intent) ? (
        <section className="space-y-4">
          <TicketPass
            kicker={form.ticketKicker}
            title={title || form.heading}
            detail={place || selected.prompt}
            stub="IN"
            stubLabel="Keep"
          />
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{form.heading}</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={form.titlePlaceholder}
              className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Where?</span>
            <input
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder={form.placePlaceholder}
              className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">When?</span>
            <input
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
            />
          </label>
          <button
            type="button"
            disabled={!title.trim() || !place.trim() || gather.isPending}
            onClick={submitGather}
            className="min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
          >
            {gather.isPending ? "Putting it up…" : form.action}
          </button>
          <p className="text-center text-xs text-white/35">
            Need tickets, a lineup or splits?{" "}
            <Link to={`/create/moment?intent=${selected.intent}`} className="text-white/55 underline underline-offset-2">
              Open the older studio
            </Link>
          </p>
        </section>
      ) : null}

      {!selected ? (
        <p className="text-sm text-white/45">Pick one. You stay here — no studio, no campaign language.</p>
      ) : null}
    </ExperienceShell>
  );
}
