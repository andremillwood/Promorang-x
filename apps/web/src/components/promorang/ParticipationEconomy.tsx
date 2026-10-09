import { useI18n } from "@/i18n/I18nContext";
import { ArrowRight, BadgeDollarSign, CheckCircle2, Gift, KeyRound, Megaphone, Share2, Sparkles, Target, Ticket, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { MASTER_KEY_RULES, masterKeyQualificationPercent, momentumNeeded, type MasterKeyProgress } from "@/lib/master-key";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import concert from "@/assets/moment-concert.jpg";
import boardGames from "@/assets/moments/board-games.jpg";
import openMic from "@/assets/moments/open-mic.jpg";
import streetArt from "@/assets/moments/street-art.jpg";

type ParticipationEconomyProps = {
  variant?: "public" | "participant" | "operator" | "card";
  points?: number | null;
  promoKeys?: number | null;
  masterKey?: MasterKeyProgress | null;
  className?: string;
};

export function ParticipationEconomy({ variant = "public", points = null, promoKeys = null, masterKey = null, className = "" }: ParticipationEconomyProps) {
  const { t, formatNumber } = useI18n();
const stages = [
  { label: t("commercial.desire.225"), title: t("commercial.what.do.you.want.226"), copy: t("commercial.taste.wants.and.the.things.you.keep.close.227"), icon: Sparkles },
  { label: t("commercial.motivation.228"), title: t("commercial.what.would.move.you.229"), copy: t("commercial.access.a.complimentary.extra.savings.points.a.key.230"), icon: Gift },
  { label: t("commercial.opportunity.231"), title: t("commercial.what.can.you.do.232"), copy: t("commercial.offers.moments.challenges.gigs.and.content.drops.turn.233"), icon: Target },
  { label: t("commercial.action.234"), title: t("commercial.what.did.you.actually.do.235"), copy: t("commercial.claim.reserve.visit.attend.create.distribute.buy.or.236"), icon: CheckCircle2 },
  { label: t("commercial.distribution.237"), title: t("commercial.what.can.you.help.move.238"), copy: t("commercial.share.refer.remix.or.distribute.things.worth.spreading.239"), icon: Share2 },
];

const opportunityTypes = [
  { label: t("commercial.challenges.240"), copy: t("commercial.structured.objectives.with.progress.proof.and.a.clear.241"), href: "/earn?kind=challenge", image: boardGames, icon: Trophy },
  { label: t("commercial.gigs.242"), copy: t("commercial.limited.compensated.work.with.a.deliverable.deadline.and.243"), href: "/earn?kind=gig", image: openMic, icon: BadgeDollarSign },
  { label: t("commercial.content.drops.244"), copy: t("commercial.content.released.for.people.to.watch.share.remix.245"), href: "/content-drops", image: concert, icon: Megaphone },
  { label: t("forMerchants.statOffers"), copy: t("commercial.real.value.that.can.be.claimed.or.used.247"), href: "/discover?tab=perks", image: cookingClass, icon: Gift },
  { label: t("economy.navMoments"), copy: t("commercial.things.happening.at.a.real.time.and.place.249"), href: "/discover?tab=moments", image: streetArt, icon: Ticket },
];

const createTypes = [
  { label: t("commercial.create.challenge.250"), copy: t("commercial.set.the.objective.proof.participant.value.and.completion.251"), href: "/create/campaign?participation=challenge", icon: Trophy },
  { label: t("commercial.create.gig.252"), copy: t("commercial.define.paid.work.deliverables.eligibility.slots.and.proof.253"), href: "/create/campaign?participation=gig", icon: BadgeDollarSign },
  { label: t("commercial.publish.content.drop.254"), copy: t("commercial.release.content.with.a.distribution.objective.attribution.and.255"), href: "/content-drops?tab=create", icon: Megaphone },
  { label: t("commercial.open.an.offer.256"), copy: t("commercial.make.real.inventory.or.access.available.under.clear.257"), href: "/give", icon: Gift },
  { label: t("how.creatorStep1Cta"), copy: t("commercial.give.people.a.real.time.place.and.reason.259"), href: "/create/moment", icon: Users },
];

  const operator = variant === "operator";
  const compact = variant === "card";
  const masterProgress = masterKey ? masterKeyQualificationPercent(masterKey) : null;
  const masterStatus = masterKey?.status || null;

  return (
    <section className={className || (compact ? "" : "border-b border-white/10 bg-[#070707] px-5 py-14 text-white sm:px-6 md:py-20")}>
      <div className={compact ? "" : "mx-auto max-w-[1440px]"}>
        <div className={compact ? "" : "grid gap-8 xl:grid-cols-[.7fr_1.3fr] xl:items-end"}>
          <div>
            <p className="marketing-kicker">{t("commercial.participation.economy.260")}</p>
            <h2 className={compact ? "font-serif text-3xl font-bold tracking-[-0.04em] text-white" : "mt-3 max-w-4xl text-4xl font-black sm:text-5xl"}>
              {t("commercial.desire.motivation.opportunity.action.distribution.261")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              {t("commercial.promorang.is.not.just.a.place.to.claim.262")}</p>
          </div>

          {!compact ? (
            <div className="grid gap-px overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-5">
              {stages.map((stage) => (
                <div key={stage.label} className="bg-[#0d0d0d] p-5">
                  <stage.icon className="h-5 w-5 text-orange-400" />
                  <p className="mt-5 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-orange-300">{stage.label}</p>
                  <h3 className="mt-2 text-sm font-black text-white">{stage.title}</h3>
                  <p className="mt-2 text-[11px] leading-5 text-white/42">{stage.copy}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className={compact ? "mt-6 grid gap-3 sm:grid-cols-2" : "mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5"}>
          {(operator ? createTypes : opportunityTypes).map((item) => (
            <Link key={item.label} to={item.href} className="group relative min-h-[220px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035]">
              {!operator && "image" in item ? <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
              <div className="relative flex min-h-[220px] flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-orange-300" />
                  <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">{item.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/52">{item.copy}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={compact ? "mt-6 grid gap-3 sm:grid-cols-2" : "mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4"}>
          <Link to="/wallet" className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">{t("promorangCrewPage.ladderPromoPoints")}</p><p className="mt-2 font-serif text-3xl font-bold text-white">{points == null ? t("commercial.participationEarned") : formatNumber(points)}</p></div>
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">{t("commercial.points.mark.useful.participation.and.progression.they.are.264")}</p>
          </Link>

          <Link to="/wallet" className="rounded-[1.4rem] border border-orange-300/20 bg-orange-300/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">{t("economy.navKeys")}</p><p className="mt-2 font-serif text-3xl font-bold text-white">{promoKeys == null ? t("commercial.keyAccess") : formatNumber(promoKeys)}</p></div>
              <KeyRound className="h-6 w-6 text-orange-300" />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">{t("commercial.a.key.should.mean.something.concrete.this.person.266")}</p>
          </Link>

          <Link to="/earn" className="rounded-[1.4rem] border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">{t("economy.navMasterKey")}</p>
                <p className="mt-2 font-serif text-3xl font-bold text-white">{masterStatus === "active" ? t("commercial.active") : masterStatus === "cooling" ? t("commercial.cooling") : masterStatus === "dormant" ? t("commercial.dormant") : masterProgress != null ? t("commercial.qualified", { percent: masterProgress }) : t("commercial.unlockEarning")}</p>
              </div>
              <BadgeDollarSign className="h-6 w-6 text-emerald-300" />
            </div>
            {masterKey ? (
              <>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-emerald-300" style={{ width: `${masterKey.earned ? Math.min(100, (masterKey.momentum / MASTER_KEY_RULES.activeMomentum) * 100) : masterProgress || 0}%` }} /></div>
                <p className="mt-3 text-xs leading-5 text-white/45">
                  {!masterKey.earned
                    ? t("commercial.qualification", { credits: masterKey.qualificationCredits, categories: masterKey.behaviourCategories, moves: masterKey.verifiedMoves, actions: masterKey.downstreamActions })
                    : masterStatus === "active"
                      ? t("commercial.momentumActive", { momentum: masterKey.momentum, minimum: MASTER_KEY_RULES.activeMomentum, days: MASTER_KEY_RULES.windowDays })
                      : masterStatus === "cooling"
                        ? t("commercial.momentumCooling", { momentum: masterKey.momentum, needed: momentumNeeded(masterKey) })
                        : t("commercial.momentumDormant")}
                </p>
              </>
            ) : <p className="mt-3 text-xs leading-5 text-white/45">{t("commercial.earn.the.master.key.through.varied.verified.participation.268")}</p>}
          </Link>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{t("commercial.how.value.circulates.269")}</p>
            <p className="mt-2 font-serif text-2xl font-bold text-white">{t("commercial.move.prove.earn.unlock.spread.return.270")}</p>
            <p className="mt-3 text-xs leading-5 text-white/45">{t("commercial.a.move.can.award.points.points.build.participation.271")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ParticipationEconomy;
