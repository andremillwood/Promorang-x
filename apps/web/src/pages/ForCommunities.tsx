import { useI18n } from "@/i18n/I18nContext";
import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";

export default function ForCommunities() {
  const { t } = useI18n();
  return (
    <MarketRoleLanding
      seoTitle={t("commercial.promorang.for.communities.turn.shared.interest.into.a.38")}
      seoDescription={t("commercial.give.shared.interests.a.home.help.people.find.39")}
      eyebrow={t("commercial.for.communities.scene.leads.40")}
      title={t("compression.role.ForCommunities")}
      intro={t("compression.communityIntro")}
      primaryCta={{ label: t("compression.communityCta"), href: "/propose" }}
      secondaryCta={{ label: t("compression.communityExplore"), href: "/scenes" }}
      roleJob={t("commercial.give.the.community.a.place.to.belong.a.41")}
      discoveryUse="Discoveries help the Scene surface places, people, patterns and opportunities members should know about."
      demandUse="Demand shows what members are asking for or moving toward, helping you shape programming, partnerships and the next Moment."
      responseTitle={t("commercial.turn.recurring.interest.into.something.people.can.join.42")}
      responseDetail={t("commercial.a.scene.can.lead.into.a.moment.offer.43")}
      responseStub="GATHER"
      proofTitle={t("commercial.let.real.participation.become.community.history.44")}
      proofDetail={t("commercial.attendance.and.completed.actions.can.become.part.of.45")}
      promoCardDetail="PromoCard lets each member keep their access, activity and return paths while still belonging to the larger Scene."
      truthGates={[
        t("commercial.a.scene.is.bigger.than.one.moment.46"),
        t("commercial.joining.a.scene.is.not.attendance.47"),
        t("commercial.votes.show.interest.not.turnout.48"),
        t("commercial.ideas.become.public.when.they.are.ready.49"),
      ]}
    />
  );
}
