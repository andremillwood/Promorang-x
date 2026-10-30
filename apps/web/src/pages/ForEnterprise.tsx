import { useI18n } from "@/i18n/I18nContext";
import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForEnterprise() {
  const { t } = useI18n();
  return (
    <MarketRoleLanding
      role="enterprise"
      seoTitle="PROMORANG for enterprise — Coordinate market action across teams and locations"
      seoDescription="Give teams and locations one way to see market demand, coordinate responses, and understand what happened across the program."
      eyebrow="For enterprise & multi-market programs"
      title={t("marketing.enterpriseTitle")}
      intro={t("marketing.enterpriseIntro")}
      primaryCta={{ label: "Talk about an enterprise pilot", href: "/contact" }}
      secondaryCta={{ label: "See how PROMORANG works", href: "/how-it-works" }}
      roleJob="Give local teams room to act while keeping roles, approvals, reporting and accountability consistent across the organization."
      discoveryUse="Discoveries give teams shared context about places, people, patterns and opportunities across locations."
      demandUse="Demand helps compare what people are asking for across markets and teams before you decide where to invest."
      responseTitle="Let local teams respond without losing consistency"
      responseDetail="Teams can create Moments, offers and other responses locally while shared roles, approvals and reporting stay consistent."
      responseStub="GOVERN"
      proofTitle="See what happened across the program"
      proofDetail="Keep claims, approvals, validations and settlements traceable so leaders can review results without rebuilding the story from scattered reports."
      promoCardDetail={t("marketing.cardCopy")}
      truthGates={[
        "Proposal is not approval",
        "Interest is not availability",
        "Submission, approval and settlement are different steps",
        "Only completed actions become lasting history",
      ]}
    />
  );
}
