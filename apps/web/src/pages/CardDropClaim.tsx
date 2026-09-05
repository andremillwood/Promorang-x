import { Link } from "react-router-dom";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";

// Old amount/from/code links were never backed by an issued offer.
export default function CardDropClaim() {
  return (
    <ExperienceShell eyebrow="PromoCard" title="This gift link is unavailable">
      <QuietEmpty
        title="Ask for a new perk link"
        copy="This link does not identify a claimable perk. Ask the sender to share an offer from Give something."
        action={<Link to="/offers" className="text-sm font-bold text-primary">Browse available offers</Link>}
      />
      <Link to="/card" className="block text-center text-sm font-bold text-primary">Open your PromoCard</Link>
    </ExperienceShell>
  );
}
