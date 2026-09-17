import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";
import { authPathForReturn } from "@/lib/post-auth-next";

export default function Hosting() {
  return (
    <MarketRoleLanding
      seoTitle="Host with PROMORANG — Turn demand into real Moments"
      seoDescription="See what people are asking for, decide whether it deserves a response, create a real Moment and keep attendance distinct from RSVP intent until proof exists."
      eyebrow="For hosts & organizers"
      title="Don't start with an event. Start with a reason people might move."
      intro="Hosts can use Discoveries and recorded demand to understand context before creating a Moment. When you respond, PROMORANG keeps the Moment, RSVP intent, submitted proof and verified attendance as separate states so your audience picture stays honest."
      primaryCta={{ label: "Propose a Moment", href: authPathForReturn("/propose/new?from=hosting&role=host", { mode: "signup", role: "host" }) }}
      secondaryCta={{ label: "See recorded demand", href: "/#wanted" }}
      roleJob="Your job is to decide when a signal is strong enough to justify putting a real experience into the market—and then make the actual capacity, access and proof path clear."
      discoveryUse="Discoveries help you understand what already exists around a place, audience or cultural pattern before you create another event competing for the same attention."
      demandUse="Recorded demand can show what people say they want and how quickly interest is forming. A threshold is evidence for a decision, not an automatic event."
      responseTitle="Create the Moment you are actually prepared to host"
      responseDetail="Set the real place, time, capacity, access and proof requirements. The Moment becomes supply only when it exists as its own recorded object."
      responseStub="HOST"
      proofTitle="Close the loop with verified attendance"
      proofDetail="RSVPs describe intent. Submitted proof is still a claim. PROMORANG should only present attendance and downstream consequences after the required verification transition occurs."
      promoCardDetail="PromoCard can carry issued access before the Moment and verified returns after it, giving a participant continuity without turning an RSVP into a false attendance record."
      truthGates={[
        "RSVP intent ≠ attendance",
        "Threshold ≠ automatic Moment",
        "Proof submission ≠ attendance",
        "Claim ≠ verification",
      ]}
    />
  );
}
