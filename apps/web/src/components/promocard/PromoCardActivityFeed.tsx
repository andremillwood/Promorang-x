import { useState } from "react";
import { Link } from "react-router-dom";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import {
  usePromoCardLedger,
  type PromoCardLedgerEntryType,
} from "@/hooks/usePromoCard";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const entryLabels: Record<PromoCardLedgerEntryType, TranslationKey> = {
  spend: "web.cardActivity.spend",
  payout_credit: "web.cardActivity.payoutCredit",
  recharge: "web.cardActivity.recharge",
  cycle_reset: "web.cardActivity.cycleReset",
  reversal_refund: "web.cardActivity.reversalRefund",
  admin_adjustment: "web.cardActivity.adminAdjustment",
};

function nightDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function PromoCardActivityFeed({ userId, limit = 8 }: { userId?: string; limit?: number }) {
  const { t, formatNumber, formatDate } = useI18n();
  const activity = usePromoCardLedger(userId);
  const [expanded, setExpanded] = useState(false);
  if (!userId) return null;

  const entries = activity.data || [];
  const visible = expanded ? entries : entries.slice(0, limit);
  const money = (amount: number, currency: string) => formatNumber(amount, { style: "currency", currency: currency || "USD" });

  return (
    <section className="grid gap-4" aria-label={t("web.cardActivity.aria")} data-promocard-activity="transactions">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("web.cardActivity.kicker")}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] text-white">{t("web.cardActivity.heading")}</h2>
      </div>
      {activity.isLoading && !activity.data ? (
        <p role="status" className="text-sm text-white/60">{t("web.cardActivity.loading")}</p>
      ) : activity.isError ? (
        <div className="border-y border-white/10 py-4">
          <p role="alert" className="text-sm text-amber-100">{t("web.cardActivity.error")}</p>
          <button type="button" className="mt-3 min-h-11 text-sm font-bold text-primary" onClick={() => void activity.refetch()}>{t("web.cardActivity.retry")}</button>
        </div>
      ) : entries.length === 0 ? (
        <p className="border-y border-white/10 py-5 text-sm leading-6 text-white/55">{t("web.cardActivity.empty")}</p>
      ) : (
        <ul className="grid gap-4">
          {visible.map((entry) => {
            const kind = t(entryLabels[entry.entryType]);
            const heading = entry.isTest ? `${entry.title || kind} · ${t("web.cardActivity.test")}` : (entry.title || kind);
            const night = entry.businessNight ? nightDate(entry.businessNight) : null;
            const recorded = formatDate(entry.createdAt, { dateStyle: "medium", timeStyle: "short" });
            return (
              <li key={entry.id}>
                <PaperReceipt
                  heading={heading}
                  lines={[
                    { label: t("web.cardActivity.change"), value: money(entry.amount, entry.currency), strong: true },
                    ...(entry.title ? [{ label: t("web.cardActivity.kind"), value: kind }] : []),
                    ...(night ? [{ label: t("web.cardActivity.night"), value: formatDate(night, { dateStyle: "medium" }) }] : []),
                    { label: t("web.cardActivity.balance"), value: money(entry.balanceAfter, entry.currency) },
                  ]}
                  footer={recorded ? t("web.cardActivity.recorded", { when: recorded }) : undefined}
                />
                {entry.momentId ? (
                  <Link to={`/moments/${entry.momentId}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-primary">
                    {t("web.cardActivity.openNight")}
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {!expanded && entries.length > limit ? (
        <button type="button" className="min-h-11 justify-self-start text-sm font-bold text-primary" onClick={() => setExpanded(true)}>
          {t("web.cardActivity.more")}
        </button>
      ) : null}
    </section>
  );
}
