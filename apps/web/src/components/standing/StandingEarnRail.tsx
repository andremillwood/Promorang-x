import { Link } from "react-router-dom";
import { Gift, Users } from "lucide-react";
import { MEMBERSHIP_TIERS, type MembershipStanding } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

type Props = {
  standing: MembershipStanding;
  onOpenPackage?: () => void;
};

export function StandingEarnRail({ standing, onOpenPackage }: Props) {
  const { t } = useI18n();
  const current = MEMBERSHIP_TIERS[standing.currentTier];
  const target = standing.nextTarget ? MEMBERSHIP_TIERS[standing.nextTarget] : null;

  return (
    <section id="standing-package" className="overflow-hidden rounded-[1.6rem] border border-amber-200/20 bg-[#0c0b09] text-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">{t("standing.eyebrow")}</p>
          <h2 className="mt-1 text-lg font-black">{t("standing.title")}</h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-white/55">{t("standing.copy")}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black uppercase tracking-wider">
          {t("standing.current", { tier: current.label })}
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          {target ? (
            <>
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm font-bold">
                  {t("standing.goal", { tier: target.label, amount: standing.nextGoalUsd.toFixed(2) })}
                </p>
                <p className="text-xs text-white/50">
                  {t("standing.earned", { amount: standing.pot.earnedUsd.toFixed(2) })}
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500" style={{ width: `${standing.progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/55">
                {t("standing.remaining", { amount: standing.remainingUsd.toFixed(2) })}
                {standing.activesNeededForNext > 0
                  ? ` · ${t("standing.activesNeeded", { count: String(standing.activesNeededForNext) })}`
                  : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-white/70">{t("standing.topTier")}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
            <span className="rounded-full border border-white/10 px-2.5 py-1">
              {standing.pot.activatedReferrals} {t("standing.active")}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1">
              {standing.pot.pendingReferrals} {t("standing.pending")}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-1">
              ${standing.pot.commissionUsd.toFixed(2)} {t("standing.commissions")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {standing.nextPackage ? (
            <button
              type="button"
              onClick={onOpenPackage}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black"
            >
              <Gift className="h-4 w-4" />
              {t("standing.openCrate")}
            </button>
          ) : null}
          <Link
            to="/referrals"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold"
          >
            <Users className="h-4 w-4 text-amber-300" />
            {t("standing.invite")}
          </Link>
        </div>
      </div>
    </section>
  );
}
