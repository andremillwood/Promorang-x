import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForCauses() {
  return (
    <MarketRoleLanding
      seoTitle="PROMORANG for Causes — Mobilize around real needs"
      seoDescription="See what communities care about, give people a meaningful way to respond, and understand what participation followed."
      eyebrow="FOR CAUSES + PUBLIC-INTEREST INITIATIVES"
      title="Make the need visible. Then give people a real way to respond."
      intro="A cause does not need another vanity campaign. PROMORANG can help you understand what a community cares about, give people a meaningful next move, and see what participation followed."
      primaryCta={{ label: "Discuss a cause response", href: "/contact" }}
      secondaryCta={{ label: "See what people want", href: "/demand" }}
      roleJob="Make the need clear, give people a useful way to respond, and report participation without turning every click into impact."
      discoveryUse="Use Discoveries to understand the places, organizations, issues and opportunities already present in the community."
      demandUse="Use questions, votes and asks to understand what people say they need or are willing to support before you design the response."
      responseTitle="Create a real participation path"
      responseDetail="Create a Moment, mission, volunteer action, resource offer or fundraiser that your team is actually prepared to deliver."
      responseStub="ACT"
      proofTitle="See who actually took part"
      proofDetail="Use attendance, completed actions and other confirmed participation to understand what happened beyond reach and intent."
      promoCardDetail="Participants can keep causes, access and completed activity on PromoCard so the relationship can continue after one campaign."
      truthGates={[
        "Need should come before campaign language",
        "Interest is not participation",
        "Participation needs context before it becomes impact",
        "Donation intent is not a completed donation",
        "A story is not the whole result",
      ]}
    />
  );
}
