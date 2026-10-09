import { useI18n } from "@/i18n/I18nContext";
import MarketRoleLanding from "@/components/marketing/MarketRoleLanding";
import { authPathForReturn } from "@/lib/post-auth-next";

export default function ForCreators() {
  const { t } = useI18n();
  return (
    <MarketRoleLanding
      seoTitle={t("commercial.promorang.for.creators.turn.attention.into.movement.people.12")}
      seoDescription={t("commercial.find.what.your.audience.cares.about.share.what.13")}
      eyebrow={t("commercial.for.creators.tastemakers.14")}
      title={t("compression.role.ForCreators")}
      intro={t("compression.creatorIntro")}
      primaryCta={{ label: t("compression.creatorCta"), href: authPathForReturn("/dashboard?view=studio", { mode: "signup", role: "creator" }) }}
      secondaryCta={{ label: t("commercial.explore.what.is.moving.15"), href: "/discover" }}
      roleJob={t("commercial.help.the.right.people.notice.something.worth.caring.16")}
      discoveryUse="Use Discoveries as material: places, people, patterns and things worth knowing that deserve attention."
      demandUse="Demand shows where curiosity or desire is already forming. Use it to decide what deserves your voice."
      responseTitle={t("commercial.create.the.story.moment.or.invitation.people.can.17")}
      responseDetail={t("commercial.introduce.a.place.lead.people.into.a.moment.18")}
      responseStub="MOVE"
      proofTitle={t("commercial.see.what.moved.after.you.shared.it.19")}
      proofDetail={t("commercial.shares.and.clicks.show.reach.check.ins.claims.20")}
      promoCardDetail="When someone keeps following, claims access or joins something you helped move, PromoCard gives that relationship somewhere to continue."
      truthGates={[
        t("commercial.views.are.not.participation.21"),
        t("commercial.sharing.is.not.the.same.as.showing.up.22"),
        t("commercial.credit.follows.confirmed.actions.23"),
        t("commercial.interest.does.not.mean.availability.24"),
      ]}
    />
  );
}
