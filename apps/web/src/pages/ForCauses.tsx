import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForCauses() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for Causes — Mobilize around real needs"
      seoDescription="Use approved context and recorded community demand to create a distinct cause response, then verify participation without inflating intent into impact."
      eyebrow="FOR CAUSES + PUBLIC-INTEREST INITIATIVES"
      title="Make the need visible. Then give people a real way to respond."
      intro="A cause does not need another vanity campaign. PROMORANG can help separate what the community says it needs, what your initiative actually offers people to do, and what participation can be verified afterward."
      primaryCta={{ label: "Discuss a cause response", href: "/contact" }}
      secondaryCta={{ label: "See recorded demand", href: "/demand" }}
      roleJob="Your job is not to manufacture urgency or call every click impact. Start with credible context, create a legitimate response, and keep proof separate from the story you want to tell."
      discoveryUse="Use approved Discoveries to establish the places, organizations, issues and opportunities that are actually present in the market."
      demandUse="Use recorded questions, votes and asks to understand what people say they need or are willing to support. Interest is not participation."
      responseTitle="Create a real participation path"
      responseDetail="Put a distinct Moment, mission, volunteer action, resource offer, fundraiser or other supported object into market only when the operating capacity behind it is real."
      responseStub="ACT"
      proofTitle="Verify the participation you can actually prove"
      proofDetail="Attendance, submitted evidence, completed actions and retained history should advance only through their authoritative proof paths. Reach or intent should not be renamed impact."
      promoCardDetail="A participant can watch relevant market objects and retain legitimate issued access or verified history without PROMORANG pretending that interest itself was a contribution."
      truthGates={[
        "Need ≠ campaign claim",
        "Interest ≠ participation",
        "Participation ≠ verified impact",
        "Donation intent ≠ settled donation",
        "Story ≠ evidence",
      ]}
    />
  );
}
