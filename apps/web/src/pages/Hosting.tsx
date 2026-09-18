import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";
import { authPathForReturn } from "@/lib/post-auth-next";

export default function Hosting() {
  return (
    <MarketRoleLanding
      seoTitle="Host with PROMORANG — Turn demand into real Moments"
      seoDescription="See what people are asking for, decide whether it deserves a Moment, and turn interest into an experience people actually show up for."
      eyebrow="For hosts & organizers"
      title="Don't start with an event. Start with a reason people might move."
      intro="Hosts can use Discoveries and demand to understand what people care about before creating a Moment. Then PROMORANG helps you move from interest to RSVPs, attendance and a reason to return."
      primaryCta={{ label: "Propose a Moment", href: authPathForReturn("/propose/new?from=hosting&role=host", { mode: "signup", role: "host" }) }}
      secondaryCta={{ label: "See what people want", href: "/#wanted" }}
      roleJob="Decide when the interest is strong enough to deserve a real experience—then make the place, time, capacity and access clear."
      discoveryUse="Discoveries help you understand what already exists around a place, audience or cultural pattern before you add another Moment."
      demandUse="Demand shows what people say they want and how quickly interest is forming, helping you decide whether it is time to move."
      responseTitle="Create the Moment you are actually prepared to host"
      responseDetail="Set the place, time, capacity and access clearly. Give people everything they need to decide whether to show up."
      responseStub="HOST"
      proofTitle="Know who actually showed up"
      proofDetail="RSVPs show intent. Check-in or the configured attendance method shows who actually made it into the room."
      promoCardDetail="PromoCard can carry access before the Moment and give participants a reason to return afterward."
      truthGates={[
        "RSVP is not attendance",
        "A strong signal does not create an event by itself",
        "Submitted proof still needs confirmation",
        "A claim is not the same as confirmation",
      ]}
    />
  );
}
