import { useAuth } from "@/contexts/AuthContext";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { MarketOpportunityInbox } from "@/components/market/MarketOpportunityInbox";
import { resolveDemandRole } from "@/lib/discovery-demand";

export default function DemandInbox() {
  const { activeRole } = useAuth();
  const role = resolveDemandRole(activeRole);

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
