import { Link } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { MarketOpportunityInbox } from "@/components/market/MarketOpportunityInbox";
import type { DemandRole } from "@/lib/discovery-demand";

export function DiscoveryDemandInbox({
  role,
  variant = "full",
}: {
  role: DemandRole;
  variant?: "full" | "peek";
}) {
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );

  if (variant === "full") return <MarketOpportunityInbox role={role} />;

  const topQuestion = inbox.questions[0];
  const topMiss = inbox.misses[0];

  return (
    <Link to="/demand" className="group block rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-primary/30">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Market pulse · {inbox.city}</p>
        <Radio className="h-4 w-4 text-primary" />
      </div>
      {isLoading ? (
        <p className="mt-3 text-sm text-white/40">Loading what people want…</p>
      ) : topMiss ? (
        <>
          <p className="mt-3 font-serif text-2xl font-bold text-white">“{topMiss.query}”</p>
          <p className="mt-2 text-sm text-white/45">Asked for {topMiss.count} time{topMiss.count === 1 ? "" : "s"}. No live want matches it yet.</p>
        </>
      ) : topQuestion ? (
        <>
          <p className="mt-3 font-serif text-2xl font-bold text-white">{topQuestion.poll.question}</p>
          <p className="mt-2 text-sm text-white/45">{topQuestion.poll.totalVotes || 0} voice{topQuestion.poll.totalVotes === 1 ? "" : "s"}. Decide whether you can make something real happen.</p>
        </>
      ) : (
        <>
          <p className="mt-3 font-serif text-2xl font-bold text-white">Nothing is gathering here yet.</p>
          <p className="mt-2 text-sm text-white/45">When people start leaning the same way, PROMORANG will bring it here.</p>
        </>
      )}
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">Open market pulse <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
    </Link>
  );
}

export default DiscoveryDemandInbox;
