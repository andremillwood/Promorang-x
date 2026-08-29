import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, RefreshCw, Users, WalletCards } from "lucide-react";
import {
  describePromoCardLoop,
  getPromoCardMomentImpacts,
  PROMOCARD_MOMENT_LOOP,
  type PromoCardMomentStakeholder,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { PromoCardNextMove } from "@/components/promocard/PromoCardNextMove";

type Props = {
  isJoined: boolean;
  isHost: boolean;
  cardBalance?: number | null;
  cycleLimit?: number | null;
  spentThisCycle?: number | null;
  hasLiveCard?: boolean;
  points?: number;
  promoKeys?: number;
};

const stageKeys = {
  before: {
    label: "promoCardMoment.beforeLabel",
    title: "promoCardMoment.beforeTitle",
    meaning: "promoCardMoment.beforeMeaning",
  },
  during: {
    label: "promoCardMoment.duringLabel",
    title: "promoCardMoment.duringTitle",
    meaning: "promoCardMoment.duringMeaning",
  },
  after: {
    label: "promoCardMoment.afterLabel",
    title: "promoCardMoment.afterTitle",
    meaning: "promoCardMoment.afterMeaning",
  },
} as const;

const roleKeys: Record<PromoCardMomentStakeholder, { label: TranslationKey; value: TranslationKey; outcome: TranslationKey; signal: TranslationKey }> = {
  participant: {
    label: "promoCardMoment.participantLabel",
    value: "promoCardMoment.participantValue",
    outcome: "promoCardMoment.participantOutcome",
    signal: "promoCardMoment.participantSignal",
  },
  host: {
    label: "promoCardMoment.hostLabel",
    value: "promoCardMoment.hostValue",
    outcome: "promoCardMoment.hostOutcome",
    signal: "promoCardMoment.hostSignal",
  },
  creator: {
    label: "promoCardMoment.creatorLabel",
    value: "promoCardMoment.creatorValue",
    outcome: "promoCardMoment.creatorOutcome",
    signal: "promoCardMoment.creatorSignal",
  },
  merchant: {
    label: "promoCardMoment.merchantLabel",
    value: "promoCardMoment.merchantValue",
    outcome: "promoCardMoment.merchantOutcome",
    signal: "promoCardMoment.merchantSignal",
  },
  venue: {
    label: "promoCardMoment.venueLabel",
    value: "promoCardMoment.venueValue",
    outcome: "promoCardMoment.venueOutcome",
    signal: "promoCardMoment.venueSignal",
  },
  brand: {
    label: "promoCardMoment.brandLabel",
    value: "promoCardMoment.brandValue",
    outcome: "promoCardMoment.brandOutcome",
    signal: "promoCardMoment.brandSignal",
  },
  community: {
    label: "promoCardMoment.communityLabel",
    value: "promoCardMoment.communityValue",
    outcome: "promoCardMoment.communityOutcome",
    signal: "promoCardMoment.communitySignal",
  },
};

export function PromoCardMomentLoop({
  isJoined,
  isHost,
  cardBalance,
  cycleLimit,
  spentThisCycle,
  hasLiveCard,
  points = 0,
  promoKeys = 0,
}: Props) {
  const { t } = useI18n();
  const primaryRole: PromoCardMomentStakeholder = isHost ? "host" : "participant";
  const impacts = getPromoCardMomentImpacts(primaryRole);
  const primary = impacts[0];
  const primaryCopy = roleKeys[primary.role];
  const loop = describePromoCardLoop({
    hasLiveCard: Boolean(hasLiveCard),
    availableBalance: cardBalance ?? undefined,
    monthlyLimit: cycleLimit ?? undefined,
    spentThisCycle: spentThisCycle ?? undefined,
    points,
    promoKeys,
  });

  return (
    <section className="overflow-hidden rounded-3xl border border-amber-300/20 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_35%),#121215] shadow-xl">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              <WalletCards className="h-4 w-4" /> {t("promoCardMoment.kicker")}
            </p>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{t("promoCardMoment.title")}</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {t("promoCardMoment.copy")}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-200/70">
              {hasLiveCard ? t("promoCardLoop.readyLabel") : t("promoCardLoop.prospectiveLabel")}
            </p>
            <p className="mt-1 text-2xl font-black text-amber-200">${(hasLiveCard ? loop.credit.readyToSpend : loop.credit.cycleCredit).toFixed(2)}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-100/60">
              {loop.instruments.points} {t("promoCardLoop.points")} · {loop.instruments.promoKeys} {t("promoCardLoop.keys")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {PROMOCARD_MOMENT_LOOP.map((step, index) => {
            const copy = stageKeys[step.stage];
            return (
              <article key={step.stage} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">{t(copy.label)}</span>
                  <span className="text-xs font-black text-white/25">0{index + 1}</span>
                </div>
                <h3 className="mt-3 text-sm font-black text-white">{t(copy.title)}</h3>
                <p className="mt-2 text-xs leading-5 text-white/55">{t(copy.meaning)}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">{t("promoCardMoment.meansFor", { role: t(primaryCopy.label).toLowerCase() })}</p>
            <h3 className="mt-2 text-lg font-black text-white">{t(primaryCopy.value)}</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">{t(primaryCopy.outcome)}</p>
            <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/45">{t("promoCardMoment.visibleThrough", { signal: t(primaryCopy.signal) })}</p>
            <Link to="/wallet" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-amber-300 hover:text-amber-200">
              {isHost ? t("promoCardMoment.hostCta") : t("promoCardMoment.openCard")}<ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/55" />
              <h3 className="text-sm font-black text-white">{t("promoCardMoment.sharedTitle")}</h3>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {impacts.slice(1).map((impact) => {
                const copy = roleKeys[impact.role];
                return (
                  <div key={impact.role} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <div>
                        <p className="text-xs font-black text-white">{t(copy.label)}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/50">{t(copy.value)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isJoined ? (
          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <p className="text-xs leading-5 text-white/65"><strong className="text-white">{t("promoCardMoment.inLoopTitle")}</strong> {t("promoCardMoment.inLoopCopy")}</p>
            </div>
            <PromoCardNextMove
              id={loop.next.id}
              href={loop.next.href}
              creditHint={loop.next.creditHint}
              pointsHint={loop.next.pointsHint}
              keysHint={loop.next.keysHint}
            />
          </div>
        ) : (
          <div className="mt-5">
            <PromoCardNextMove
              id={loop.next.id}
              href={loop.next.href}
              creditHint={loop.next.creditHint}
              pointsHint={loop.next.pointsHint}
              keysHint={loop.next.keysHint}
            />
          </div>
        )}
      </div>
    </section>
  );
}
