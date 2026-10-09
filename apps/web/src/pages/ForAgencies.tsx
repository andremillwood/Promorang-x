import { useI18n } from "@/i18n/I18nContext";
import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForAgencies() {
  const { t } = useI18n();
  return (
    <MarketRoleLanding
      seoTitle={t("commercial.promorang.for.agencies.turn.market.signals.into.clearer.25")}
      seoDescription={t("commercial.see.what.people.want.coordinate.the.right.client.26")}
      eyebrow={t("commercial.for.agencies.client.operators.27")}
      title={t("compression.role.ForAgencies")}
      intro={t("compression.agencyIntro")}
      primaryCta={{ label: t("compression.agencyCta"), href: "/auth?mode=signup&role=brand&next=/dashboard" }}
      secondaryCta={{ label: t("commercial.see.the.brand.lens.28"), href: "/for-brands" }}
      roleJob={t("commercial.read.the.market.shape.the.response.coordinate.the.29")}
      discoveryUse="Discoveries give planners and creatives context about places, people, patterns and opportunities already in the market."
      demandUse="Demand gives clients a clearer view of what people are asking for before they spend, helping shape targeting, offers and activation design."
      responseTitle={t("commercial.translate.demand.into.a.client.response.with.a.30")}
      responseDetail={t("commercial.turn.the.signal.into.a.campaign.offer.moment.31")}
      responseStub="ORCH"
      proofTitle={t("commercial.show.the.client.what.happened.next.32")}
      proofDetail={t("commercial.separate.reach.attributed.actions.and.confirmed.outcomes.so.33")}
      promoCardDetail="PromoCard gives the participant something to carry forward after the activation, so the relationship can continue beyond the agency report."
      truthGates={[
        t("commercial.reach.is.not.conversion.34"),
        t("commercial.results.need.context.before.they.become.roi.35"),
        t("commercial.interest.is.not.availability.36"),
        t("commercial.approval.and.settlement.are.different.steps.37"),
      ]}
    />
  );
}
