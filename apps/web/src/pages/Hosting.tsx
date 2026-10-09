import { useI18n } from "@/i18n/I18nContext";
import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";
import { authPathForReturn } from "@/lib/post-auth-next";

export default function Hosting() {
  const { t } = useI18n();
  return (
    <MarketRoleLanding
      seoTitle={t("commercial.host.with.promorang.turn.demand.into.real.moments.0")}
      seoDescription={t("commercial.see.what.people.are.asking.for.decide.whether.1")}
      eyebrow={t("commercial.for.hosts.organizers.2")}
      title={t("compression.role.Hosting")}
      intro={t("compression.hostIntro")}
      primaryCta={{ label: t("compression.hostCta"), href: authPathForReturn("/propose/new?from=hosting&role=host", { mode: "signup", role: "host" }) }}
      secondaryCta={{ label: t("compression.seeDemand"), href: "/discover?tab=wants" }}
      roleJob={t("commercial.decide.when.the.interest.is.strong.enough.to.3")}
      discoveryUse="Discoveries help you understand what already exists around a place, audience or cultural pattern before you add another Moment."
      demandUse="Demand shows what people say they want and how quickly interest is forming, helping you decide whether it is time to move."
      responseTitle={t("commercial.create.the.moment.you.are.actually.prepared.to.4")}
      responseDetail={t("commercial.set.the.place.time.capacity.and.access.clearly.5")}
      responseStub="HOST"
      proofTitle={t("commercial.know.who.actually.showed.up.6")}
      proofDetail={t("commercial.rsvps.show.intent.check.in.or.the.configured.7")}
      promoCardDetail="PromoCard can carry access before the Moment and give participants a reason to return afterward."
      truthGates={[
        t("commercial.rsvp.is.not.attendance.8"),
        t("commercial.a.strong.signal.does.not.create.an.event.9"),
        t("commercial.submitted.proof.still.needs.confirmation.10"),
        t("commercial.a.claim.is.not.the.same.as.confirmation.11"),
      ]}
    />
  );
}
