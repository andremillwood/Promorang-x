import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { HomeFeedToggle } from "@/components/feed/HomeFeedToggle";
import { NextMoveStrip } from "@/components/journey/NextMoveStrip";
import { getMemberNextMove } from "@/lib/member-next-move";
import { NightTrail, TicketPass } from "@/components/promorang/SignatureObjects";
import { PromoShareOperator } from "@/components/promoshare/PromoShareOperator";
import { WeeklyMomentDrop } from "@/components/moments/WeeklyMomentDrop";

export default function Today() {
  const { t } = useI18n();
  const { user, activeRole } = useAuth();
  const nextMove = getMemberNextMove({ signedIn: Boolean(user), canCreate: Boolean(user) });
  const workspaceRole = activeRole && activeRole !== "participant" ? activeRole : null;

  return (
    <main className="min-h-screen bg-[#0D0D0E] pb-24 text-white">
      <SEO title={t("todayPage.seoTitle")} description={t("todayPage.seoDescription")} />
      {user ? <HomeFeedToggle /> : null}

      <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF5500]">
          {t("todayPage.eyebrow")}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-6xl">
          {t("dest.todayQuestion")}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">{t("todayPage.copy")}</p>

        <div className="mt-6">
          <NextMoveStrip move={nextMove} />
        </div>

        {workspaceRole ? (
          <Link
            to="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/25"
          >
            Open your dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch">
          <Link to={nextMove.href} className="group block">
            <TicketPass
              kicker={t("todayPage.ticketKicker")}
              title={t(nextMove.titleKey, nextMove.vars)}
              detail={t(nextMove.whyKey, nextMove.vars)}
              stub={t("todayPage.ticketStub")}
              stubLabel={t(nextMove.ctaKey, nextMove.vars)}
              className="h-full transition group-hover:-translate-y-0.5"
            />
          </Link>
          <Link
            to="/discover"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-primary/40"
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-amber-200/70">{t("dest.discover")}</p>
            <h2 className="mt-2 font-serif text-xl font-bold">{t("todayPage.afterTitle")}</h2>
            <p className="mt-1.5 text-sm leading-5 text-white/55">{t("todayPage.afterDetail")}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
              {t("todayPage.afterCta")} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        {user ? (
          <div className="mt-8">
            <PromoShareOperator variant="rail" />
          </div>
        ) : null}

        <div className="mt-12">
          <NightTrail
            eyebrow={t("todayPage.pathEyebrow")}
            title={t("todayPage.pathTitle")}
            steps={[
              {
                label: t("todayPage.noticeLabel"),
                title: t("todayPage.noticeTitle"),
                text: t("todayPage.noticeText"),
              },
              {
                label: t("todayPage.moveLabel"),
                title: t("todayPage.moveTitle"),
                text: t("todayPage.moveText"),
              },
              {
                label: t("todayPage.proveLabel"),
                title: t("todayPage.proveTitle"),
                text: t("todayPage.proveText"),
              },
              {
                label: t("todayPage.unlockLabel"),
                title: t("todayPage.unlockTitle"),
                text: t("todayPage.unlockText"),
              },
            ]}
          />
        </div>

        <div className="mt-12">
          <WeeklyMomentDrop />
        </div>
      </section>
    </main>
  );
}
