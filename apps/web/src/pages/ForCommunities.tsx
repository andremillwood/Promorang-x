import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForCommunities() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for communities — Turn shared interest into a living Scene"
      seoDescription="Use Discoveries, recorded demand, Scenes and verified Moments to help a community express what matters and keep a durable record of what it actually does."
      eyebrow="For communities & Scene leads"
      title="Give shared interest somewhere to live—and somewhere to go next."
      intro="A Scene is persistent context, not a one-night event. Community leaders can help people discover what belongs, make recurring demand legible, and coordinate real responses without pretending membership automatically means attendance or activity."
      primaryCta={{ label: "Propose a community response", href: "/propose" }}
      secondaryCta={{ label: "Explore Scenes", href: "/scenes" }}
      roleJob="Your job is to create continuity around a real interest, place or cultural pattern: what the community knows, what it wants, what it chooses to do and what members actually keep from participating."
      discoveryUse="Approved Discoveries give a Scene useful local knowledge: places, people, patterns and opportunities members should know about."
      demandUse="Demand shows what members are asking for or moving toward. It can inform programming and partnerships, but membership and votes do not prove attendance."
      responseTitle="Turn recurring interest into a legitimate community response"
      responseDetail="A Scene can lead into a Moment, Offer, person-led action or another concrete response when someone is prepared to stand behind the supply."
      responseStub="GATHER"
      proofTitle="Let real participation become community history"
      proofDetail="Verified attendance and other approved consequences can become retained history. The Scene grows from what happened, not from inflated member counts or assumed participation."
      promoCardDetail="PromoCard lets each member keep their own access, proof and returns while still belonging to the larger Scene, so community memory does not have to live only in a feed."
      truthGates={[
        "Scene ≠ Moment",
        "Scene membership ≠ attendance",
        "Vote ≠ attendance",
        "Proposal ≠ approval",
      ]}
    />
  );
}
