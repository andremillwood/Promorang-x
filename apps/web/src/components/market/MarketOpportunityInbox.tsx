import { Link } from "react-router-dom";
import { ArrowRight, Inbox, Radio, Search, Users } from "lucide-react";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";
import type { DemandRole } from "@/lib/discovery-demand";

function responseFor(role: DemandRole) {
  switch (role) {
    case "merchant": return { href: "/give", label: "Put up an offer or inventory", note: "A merchant response is separate supply." };
    case "brand": return { href: "/dashboard?view=studio&tab=campaigns", label: "Design a brand response", note: "Funded response ≠ verified outcome." };
    case "host": return { href: "/create/moment", label: "Create a Moment", note: "A Moment is a separate actionable record." };
    default: return { href: "/create?intent=answer", label: "Create a response", note: "Attention becomes useful only when it points to a real object." };
  }
}

export function MarketOpportunityInbox({ role }: { role: DemandRole }) {
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const response = responseFor(role);

  if (isLoading) return <p className="py-8 text-sm text-white/40">Loading recorded market signals…</p>;

  return (
    <div className="space-y-10">
      <section className="grid gap-4 lg:grid-cols-[1fr_.65fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Opportunity inbox · {inbox.city}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">Demand you may choose to respond to.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">This is not a lead guarantee. It is a view of recorded asks and Demand questions. Your job is to decide whether the signal merits a distinct response.</p>
        </div>
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Current market evidence</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div><p className="font-mono text-2xl font-black">{inbox.namedAskCount}</p><p className="mt-1 text-[10px] text-white/35">ASKS</p></div>
            <div><p className="font-mono text-2xl font-black">{inbox.liveVoteCount}</p><p className="mt-1 text-[10px] text-white/35">VOTES</p></div>
            <div><p className="font-mono text-2xl font-black">{inbox.questions.length}</p><p className="mt-1 text-[10px] text-white/35">QUESTIONS</p></div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 border-b border-white/10 pb-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">Unresolved asks</p>
          <h3 className="mt-2 font-serif text-3xl font-bold">Things people asked for that do not yet match a live Demand question.</h3>
        </div>
        {inbox.misses.length ? <div className="grid gap-3 sm:grid-cols-2">{inbox.misses.map((ask) => (
          <article key={ask.query} className="rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-start justify-between gap-4"><Search className="mt-1 h-4 w-4 text-primary" /><span className="font-mono text-sm font-black text-white/45">{ask.count}</span></div>
            <p className="mt-4 font-serif text-2xl font-bold">“{ask.query}”</p>
            <p className="mt-2 text-xs leading-5 text-white/40">{ask.count} recorded ask{ask.count === 1 ? "" : "s"}. No live matched question means PROMORANG should not imply supply exists.</p>
          </article>
        ))}</div> : <div className="rounded-[1.4rem] border border-dashed border-white/10 p-6"><Inbox className="h-5 w-5 text-primary" /><p className="mt-3 font-serif text-2xl font-bold">No unresolved asks in this market view.</p></div>}
      </section>

      <section>
        <div className="mb-5 border-b border-white/10 pb-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-primary">Recorded Demand questions</p>
          <h3 className="mt-2 font-serif text-3xl font-bold">Signals with an authoritative question and recorded votes.</h3>
        </div>
        {inbox.questions.length ? <div className="space-y-4">{inbox.questions.map((question) => {
          const href = discoveryHref(question.poll);
          const thresholdMet = question.votesRemaining === 0;
          return (
            <article key={question.poll.id} className="grid gap-5 rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/35"><Radio className="h-3.5 w-3.5 text-primary" />Recorded Demand · {question.poll.totalVotes || 0} votes {thresholdMet ? "· threshold met" : question.poll.thresholdForMoment ? `· ${question.votesRemaining} to configured threshold` : ""}</div>
                <h4 className="mt-3 font-serif text-2xl font-bold">{question.poll.question}</h4>
                {question.leading ? <p className="mt-2 text-sm text-white/50">Leading response: <strong className="text-white/75">{question.leading.text}</strong> · {question.leading.votes} votes</p> : null}
                {question.matchedAsks.length ? <p className="mt-2 text-xs text-white/38">Related ask: “{question.matchedAsks[0]}”</p> : null}
                <p className="mt-3 text-[11px] leading-5 text-white/35">Demand ≠ supply. Threshold ≠ Moment. Response ≠ purchase. {response.note}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                <Link to={href} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-xs font-black">Inspect signal <ArrowRight className="h-3.5 w-3.5" /></Link>
                <Link to={response.href} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-black">{response.label} <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </article>
          );
        })}</div> : <div className="rounded-[1.4rem] border border-dashed border-white/10 p-6"><Users className="h-5 w-5 text-primary" /><p className="mt-3 font-serif text-2xl font-bold">No live Demand questions yet.</p><p className="mt-2 text-sm text-white/40">Do not substitute seeded activity. An empty opportunity inbox is valid market information.</p></div>}
      </section>
    </div>
  );
}

export default MarketOpportunityInbox;
