import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";
import { authPathForReturn } from "@/lib/post-auth-next";

export default function ForCreators() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for creators — Turn attention into accountable movement"
      seoDescription="Use approved Discoveries and recorded demand to decide what is worth amplifying, then connect creator-led responses to verifiable participant action."
      eyebrow="For creators & tastemakers"
      title="Don't just create attention. Help people find something worth moving toward."
      intro="Creators can surface Discoveries, make demand easier to see, and lead people toward a real Moment, Offer or other response. PROMORANG keeps the signal, the response and the verified outcome separate so influence can be understood without pretending every view became action."
      primaryCta={{ label: "Open creator workspace", href: authPathForReturn("/dashboard?view=studio", { mode: "signup", role: "creator" }) }}
      secondaryCta={{ label: "Explore what is moving", href: "/discover" }}
      roleJob="Your job is not to manufacture hype. It is to help the right people discover, understand and act on something that is actually there—or help make visible what people are asking for."
      discoveryUse="Use approved Discoveries as source material: places, patterns and things worth knowing that PROMORANG is willing to publish as real."
      demandUse="Recorded demand tells you where curiosity or desire already exists. A vote or signal is interest, not proof that your audience attended or bought anything."
      responseTitle="Create the story, Moment or invitation people can act on"
      responseDetail="A creator response can introduce a real place, lead people into a Moment, support an Offer or recruit participation around a legitimate opportunity. The response must exist separately from the demand that inspired it."
      responseStub="MOVE"
      proofTitle="Keep attribution downstream of verified action"
      proofDetail="Shares, clicks and creator links can establish a route. Attendance, purchase, validation or another claimed outcome still needs the corresponding recorded proof before PROMORANG presents it as verified impact."
      promoCardDetail="When a participant keeps following, claims access or completes a verified action, PromoCard can carry that issued consequence forward instead of reducing the relationship to a one-off campaign click."
      truthGates={[
        "Attention ≠ action",
        "Share intent ≠ attributed action",
        "Attributed action ≠ verified eligibility",
        "Demand ≠ supply",
      ]}
    />
  );
}
