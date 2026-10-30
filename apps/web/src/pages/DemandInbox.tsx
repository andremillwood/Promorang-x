import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMarket } from "@/contexts/MarketContext";
import { FindOrAskEntry } from "@/components/discovery/FindOrAskEntry";
import { FindOrAskDemandRail } from "@/components/discovery/FindOrAskDemandRail";
import { useAuth } from "@/contexts/AuthContext";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { MarketOpportunityInbox } from "@/components/market/MarketOpportunityInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";

export default function DemandInbox() {
  const { activeRole } = useAuth();
  const role = resolveDemandRole(activeRole);
  const { city } = useMarket();
  const [params] = useSearchParams();
  useEffect(() => { if (params.get("ask") === "1") document.getElementById("find-or-ask-home")?.focus(); }, [params]);
  if (!activeRole || activeRole === "participant") return <ExperienceShell title={`${city.name} wants`} description="What would you love to see in your city? Move an idea, or add your own." backTo="/today"><section id="ask-city" className="participant-wants"><FindOrAskEntry source="home" city={city.name} /><div className="mt-8"><FindOrAskDemandRail city={city.name} showEmpty /></div></section></ExperienceShell>;

  return (
    <ExperienceShell
      eyebrow="MARKET OPPORTUNITIES"
      title="What is the market asking for?"
      description="See what people are asking for before you decide whether and how to respond. Interest can guide a decision, but it is not a promise of conversion."
      backTo="/dashboard"
    >
      <MarketOpportunityInbox role={role} />
    </ExperienceShell>
  );
}
