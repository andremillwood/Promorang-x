import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForAgencies() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for agencies — Manage demand, response and proof without collapsing them"
      seoDescription="Give clients a clearer view of what people want, what the client actually put into market, and what later became verified action."
      eyebrow="For agencies & client operators"
      title="Give clients a chain of evidence—not a prettier dashboard."
      intro="Agencies can read approved Discoveries and recorded demand across markets, help clients decide how to respond, then keep the response and verified outcome separate. That creates a cleaner client story than turning reach, intent and conversion into one blended performance number."
      primaryCta={{ label: "Open agency path", href: "/auth?mode=signup&role=brand&next=/dashboard" }}
      secondaryCta={{ label: "See the brand lens", href: "/for-brands" }}
      roleJob="Your job is orchestration: know what the market is saying, recommend a defensible response, coordinate the participant path, and report what the records can actually support."
      discoveryUse="Discoveries provide approved market context that can inform planning and creative without being presented as customer demand."
      demandUse="Recorded demand gives clients an evidence layer before they spend. It can inform targeting, inventory and activation design without being overstated as guaranteed conversion."
      responseTitle="Translate demand into a client response with a clear owner"
      responseDetail="A campaign, Offer, Moment, creator brief or merchant action should exist as its own response record with explicit supply and responsibility—not as an implied consequence of a demand threshold."
      responseStub="ORCH"
      proofTitle="Build the client result pack from source-backed outcomes"
      proofDetail="Observed, attributed and verified events should remain distinct. ROI and incrementality claims belong only where the supporting records actually exist."
      promoCardDetail="PromoCard can carry the participant-side consequence of a managed activation, helping the relationship persist beyond the agency report while keeping issuance and verification source-backed."
      truthGates={[
        "Observed ≠ attributed ≠ verified ≠ value",
        "Evidence ≠ ROI without supporting records",
        "Demand ≠ supply",
        "Approval ≠ settlement",
      ]}
    />
  );
}
