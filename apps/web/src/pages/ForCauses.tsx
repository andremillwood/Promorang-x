import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForCauses() {
  const { t: webT } = useWebI18n();
  return (
    <MarketRoleLanding
      role="cause"
      seoTitle="PROMORANG for Causes — Mobilize around real needs"
      seoDescription="See what communities care about, give people a meaningful way to respond, and understand what participation followed."
      eyebrow="FOR CAUSES + PUBLIC-INTEREST INITIATIVES"
      title={webT("marketing.causeTitle")}
      intro={webT("marketing.causeIntro")}
      primaryCta={{ label: "Discuss a cause response", href: "/contact" }}
      secondaryCta={{ label: webT("compression.seeDemand"), href: "/demand" }}
      roleJob="Make the need clear, give people a useful way to respond, and report participation without turning every click into impact."
      discoveryUse="Use Discoveries to understand the places, organizations, issues and opportunities already present in the community."
      demandUse="Use questions, votes and asks to understand what people say they need or are willing to support before you design the response."
      responseTitle="Create a real participation path"
      responseDetail="Create a Moment, mission, volunteer action, resource offer or fundraiser that your team is actually prepared to deliver."
      responseStub="ACT"
      proofTitle="See who actually took part"
      proofDetail="Use attendance, completed actions and other confirmed participation to understand what happened beyond reach and intent."
      promoCardDetail={webT("marketing.cardCopy")}
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
