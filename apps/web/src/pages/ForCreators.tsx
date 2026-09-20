import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";
import { authPathForReturn } from "@/lib/post-auth-next";

export default function ForCreators() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for creators — Turn attention into movement people can feel"
      seoDescription="Find what your audience cares about, share what is worth moving, and build a reputation around what happens next."
      eyebrow="For creators & tastemakers"
      title="Don't just create attention. Help people find something worth moving toward."
      intro="Creators can surface what is worth knowing, rally people around a Moment or offer, and see what moves through their audience. PROMORANG helps make that influence visible without reducing it to views."
      primaryCta={{ label: "Open creator workspace", href: authPathForReturn("/dashboard?view=studio", { mode: "signup", role: "creator" }) }}
      secondaryCta={{ label: "Explore what is moving", href: "/discover" }}
      roleJob="Help the right people notice something worth caring about—and give them a next move."
      discoveryUse="Use Discoveries as material: places, people, patterns and things worth knowing that deserve attention."
      demandUse="Demand shows where curiosity or desire is already forming. Use it to decide what deserves your voice."
      responseTitle="Create the story, Moment or invitation people can act on"
      responseDetail="Introduce a place, lead people into a Moment, support an offer or product, or rally your audience around something people can actually join, reserve or buy. If commerce is involved, the Merchant still owns price, stock, payment and fulfillment."
      responseStub="MOVE"
      proofTitle="See what moved after you shared it"
      proofDetail="Shares and clicks show reach. Check-ins, claims or purchases show deeper movement when they happen."
      promoCardDetail="When someone keeps following, claims access or joins something you helped move, PromoCard gives that relationship somewhere to continue."
      truthGates={[
        "Views are not participation",
        "Sharing is not the same as showing up",
        "Credit follows the governing attributed action—not views alone",
        "Creator is not automatically the seller",
        "Interest does not mean availability",
      ]}
    />
  );
}
