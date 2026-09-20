import { Link } from "react-router-dom";
import { ArrowRight, Inbox, Radio, Search, Users } from "lucide-react";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";
import type { DemandRole } from "@/lib/discovery-demand";

function responseFor(role: DemandRole) {
  switch (role) {
    case "merchant":
      return { href: "/give", label: "Make something available", note: "Answer the want with something real, limited and clear." };
    case "brand":
      return { href: "/dashboard?view=studio&tab=campaigns", label: "Answer with an activation", note: "Choose what you can make possible and what you want people to do next." };
    case "host":
      return { href: "/create/moment", label: "Make something happen", note: "Turn the want into a real time, place and reason to show up." };
    default:
      return { href: "/create?intent=answer", label: "Move this forward", note: "Give people a next move they can actually take." };
  }
}

function responseHref(baseHref: string, demandId: string, want: string, city: string) {
  const [pathname, existing = ""] = baseHref.split("?");
  const params = new URLSearchParams(existing);
  params.set("from", "want");
  params.set("demand_id", demandId);
  params.set("want", want);
  params.set("city", city);
  return `${pathname}?${params.toString()}`;
}

export function MarketOpportunityInbox({ role }: { role: DemandRole }) {
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const response = responseFor(role);

  if (isLoading) return <p className="py-8 text-sm text-white/40">Listening to what people want…</p>;

  return (
    <div className="space-y-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_.65fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Market pulse · {inbox.city}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">People are telling you what they want. Decide what you can make possible.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Use these wants and voices as a starting point. Look for a real fit with your audience, capacity and goals before you answer.</p>
        </div>
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">What people are leaning toward</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div><p className="font-mono text-2xl font-black">{inbox.namedAskCount}</p><p className="mt-1 text-[10px] text-white/35">WANTS</p></div>
            <div><p className="font-mono text-2xl font-black">{inbox.liveVoteCount}</p><p className="mt-1 text-[10px] text-white/35">VOICES</p></div>
            <div><p className="font-mono text-2xl font-black">{inbox.questions.length}</p><p className="mt-1 text-[10px] text-white/35">LIVE WANTS</p></div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 border-b border-white/10 pb-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">Still looking</p>
          <h3 className="mt-2 font-serif text-3xl font-bold">Things people want that have not gathered into a live want yet.</h3>
        </div>
        {inbox.misses.length ? <div className="grid gap-3 sm:grid-cols-2">{inbox.misses.map((ask) => (
          <article key={ask.query} className="rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-start justify-between gap-4"><Search className="mt-1 h-4 w-4 text-primary" /><span className="font-mono text-sm font-black text-white/45">{ask.count}</span></div>
            <p className="mt-4 font-serif text-2xl font-bold">“{ask.query}”</p>
            <p className="mt-2 text-xs leading-5 text-white/40">Asked for {ask.count} time{ask.count === 1 ? "" : "s"}. No live want matches it yet.</p>
          </article>
        ))}</div> : <div className="rounded-[1.4rem] border border-dashed border-white/10 p-6"><Inbox className="h-5 w-5 text-primary" /><p className="mt-3 font-serif text-2xl font-bold">Nothing is waiting without an answer here right now.</p></div>}
      </section>

      <section>
        <div className="mb-5 border-b border-white/10 pb-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">People are gathering around</p>
          <h3 className="mt-2 font-serif text-3xl font-bold">Wants with enough shape for you to decide whether to respond.</h3>
        </div>
        {inbox.questions.length ? <div className="space-y-4">{inbox.questions.map((question) => {
          const href = discoveryHref(question.poll);
          const thresholdMet = question.votesRemaining === 0;
          const answerHref = responseHref(response.href, question.poll.id, question.poll.question, inbox.city);
          return (
            <article key={question.poll.id} className="grid gap-5 rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                  <Radio className="h-3.5 w-3.5 text-primary" />
                  Want · {question.poll.totalVotes || 0} voices
                  {thresholdMet ? " · target met" : question.poll.thresholdForMoment ? ` · ${question.votesRemaining} more voices to target` : ""}
                </div>
                <h4 className="mt-3 font-serif text-2xl font-bold">{question.poll.question}</h4>
                {question.leading ? <p className="mt-2 text-sm text-white/50">Most people are leaning toward: <strong className="text-white/75">{question.leading.text}</strong> · {question.leading.votes} voices</p> : null}
                {question.matchedAsks.length ? <p className="mt-2 text-xs text-white/38">Related want: “{question.matchedAsks[0]}”</p> : null}
                <p className="mt-3 text-[11px] leading-5 text-white/35">{response.note}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                <Link to={href} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-xs font-black">See the want <ArrowRight className="h-3.5 w-3.5" /></Link>
                <Link to={answerHref} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-black">{response.label} <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </article>
          );
        })}</div> : <div className="rounded-[1.4rem] border border-dashed border-white/10 p-6"><Users className="h-5 w-5 text-primary" /><p className="mt-3 font-serif text-2xl font-bold">Nothing is gathering yet.</p><p className="mt-2 text-sm text-white/40">When people start leaning the same way, it will show up here.</p></div>}
      </section>
    </div>
  );
}

export default MarketOpportunityInbox;
