import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForEnterprise() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for enterprise — Govern demand, response and verified participation across markets"
      seoDescription="Use one governed market model across teams, locations and partners while keeping approved knowledge, demand, supply, proof and retained participant history distinct."
      eyebrow="For enterprise & multi-market programs"
      title="One market model across teams, locations and partners."
      intro="Enterprise programs need more than activation tooling. PROMORANG can give multiple teams a shared way to read approved market context, understand recorded demand, authorize responses and preserve evidence without allowing local dashboards to rewrite the underlying truth."
      primaryCta={{ label: "Talk about an enterprise pilot", href: "/contact" }}
      secondaryCta={{ label: "See how PROMORANG works", href: "/how-it-works" }}
      roleJob="Your job is governance: make it possible for many operators to act locally while the organization keeps consistent definitions for what was proposed, approved, supplied, claimed, verified and retained."
      discoveryUse="Approved Discoveries provide a governed knowledge layer across locations without allowing every local submission to become public truth automatically."
      demandUse="Recorded demand can be compared across markets and teams while remaining distinct from inventory, conversion or forecasted revenue."
      responseTitle="Authorize the right local response without losing the shared model"
      responseDetail="Teams can create Moments, Offers and other supply in their own operating context while enterprise policy, ownership and evidence boundaries remain consistent."
      responseStub="GOVERN"
      proofTitle="Preserve a source-backed history across the program"
      proofDetail="Claims, approvals, validations, settlements and retained consequences should remain traceable as different states so reporting can be audited instead of reconstructed from presentation-layer totals."
      promoCardDetail="PromoCard provides a participant-side continuity layer across eligible programs and locations, while enterprise systems retain control over what access or consequence was actually issued."
      truthGates={[
        "Proposal ≠ approval",
        "Demand ≠ supply",
        "Submission ≠ approval ≠ settlement",
        "Local client state ≠ durable history",
      ]}
    />
  );
}
