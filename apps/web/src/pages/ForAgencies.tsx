import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForAgencies() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for agencies — Turn market signals into clearer client action"
      seoDescription="See what people want, coordinate the right client response, and report what happened next with more clarity."
      eyebrow="For agencies & client operators"
      title="Give clients a clearer line from market signal to action."
      intro="Agencies can see what people are discovering and asking for, help clients decide where to respond, and show what happened afterward without turning reach, interest and conversion into one vague number."
      primaryCta={{ label: "Open agency path", href: "/auth?mode=signup&role=brand&next=/dashboard" }}
      secondaryCta={{ label: "See the brand lens", href: "/for-brands" }}
      roleJob="Read the market, shape the response, coordinate the moving parts, and give the client a result story they can understand."
      discoveryUse="Discoveries give planners and creatives context about places, people, patterns and opportunities already in the market."
      demandUse="Demand gives clients a clearer view of what people are asking for before they spend, helping shape targeting, offers and activation design."
      responseTitle="Translate demand into a client response with a clear owner"
      responseDetail="Turn the signal into a campaign, offer, Moment, creator brief or merchant action with a clear owner, terms and next step."
      responseStub="ORCH"
      proofTitle="Show the client what happened next"
      proofDetail="Separate reach, attributed actions and confirmed outcomes so the client can see what changed without overstating ROI."
      promoCardDetail="PromoCard gives the participant something to carry forward after the activation, so the relationship can continue beyond the agency report."
      truthGates={[
        "Reach is not conversion",
        "Results need context before they become ROI",
        "Interest is not availability",
        "Approval and settlement are different steps",
      ]}
    />
  );
}
