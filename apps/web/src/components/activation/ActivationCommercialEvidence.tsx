import { BarChart3, CircleDollarSign, Radio, ReceiptText, ShieldCheck } from "lucide-react";

import type {
  CommercialAllocation,
  CommercialEvidence,
  CommercialRule,
  PromoPushEvent,
} from "@/hooks/useActivationOperations";
import { useI18n } from "@/i18n/I18nContext";

type Props = {
  evidence?: CommercialEvidence | null;
  rules?: CommercialRule[];
  allocations?: CommercialAllocation[];
  distributionEvents?: PromoPushEvent[];
};

export function ActivationCommercialEvidence({ evidence, rules = [], allocations = [], distributionEvents = [] }: Props) {
  const { t, locale, formatNumber } = useI18n();
  const currency = evidence?.currency || null;
  const money = (value: number) => currency
    ? new Intl.NumberFormat(locale, { style: "currency", currency }).format(value)
    : t("activationCommerce.notRecorded");
  const fundedRules = rules.filter((rule) => rule.active && rule.funded);
  const earned = allocations.filter((allocation) => allocation.status === "earned");
  const pendingAmount = earned.reduce((sum, allocation) => sum + Number(allocation.amount || 0), 0);
  const eventCounts = distributionEvents.reduce<Record<string, number>>((counts, event) => {
    counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    return counts;
  }, {});

  const metrics = [
    [t("activationCommerce.reservations"), evidence?.reservations],
    [t("activationCommerce.purchases"), evidence?.purchases],
    [t("activationCommerce.fulfilled"), evidence?.fulfilled],
    [t("activationCommerce.refunds"), evidence?.refunds],
    [t("activationCommerce.gross"), evidence ? money(Number(evidence.gross_amount || 0)) : undefined],
    [t("activationCommerce.attributedChannels"), evidence?.attributed_channels],
  ] as const;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.14),transparent_34%),#111110]">
      <div className="border-b border-white/10 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/12"><BarChart3 className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">{t("activationCommerce.eyebrow")}</p>
            <h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">{t("activationCommerce.title")}</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">{t("activationCommerce.description")}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="bg-[#0b0b0a] p-4">
              <dt className="text-[8px] font-black uppercase tracking-[0.14em] text-white/35">{label}</dt>
              <dd className="mt-2 font-serif text-2xl font-bold">{value == null ? t("activationCommerce.notRecorded") : typeof value === "number" ? formatNumber(value) : value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-px bg-white/10 lg:grid-cols-2">
        <div className="bg-[#0d0d0c] p-6 sm:p-8">
          <div className="flex items-center gap-3"><Radio className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl font-bold">{t("activationCommerce.distribution")}</h3></div>
          {distributionEvents.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(eventCounts).map(([event, count]) => <span key={event} className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-bold text-white/65">{formatNumber(count)} {event.replaceAll("_", " ")}</span>)}
            </div>
          ) : <p className="mt-4 text-sm leading-6 text-white/40">{t("activationCommerce.distributionEmpty")}</p>}
        </div>
        <div className="bg-[#0d0d0c] p-6 sm:p-8">
          <div className="flex items-center gap-3"><CircleDollarSign className="h-4 w-4 text-primary" /><h3 className="font-serif text-xl font-bold">{t("activationCommerce.economics")}</h3></div>
          {fundedRules.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <EvidenceCount icon={ShieldCheck} value={formatNumber(fundedRules.length)} label={t("activationCommerce.rules")} />
              <EvidenceCount icon={ReceiptText} value={formatNumber(allocations.length)} label={t("activationCommerce.allocations")} />
              <EvidenceCount icon={CircleDollarSign} value={pendingAmount > 0 && currency ? money(pendingAmount) : formatNumber(earned.length)} label={t("activationCommerce.pending")} />
            </div>
          ) : <p className="mt-4 text-sm leading-6 text-white/40">{t("activationCommerce.economicsEmpty")}</p>}
        </div>
      </div>
      <p className="border-t border-white/10 px-6 py-4 text-[10px] leading-5 text-white/30 sm:px-8">{t("activationCommerce.sourceNote")}</p>
    </section>
  );
}

function EvidenceCount({ icon: Icon, value, label }: { icon: typeof ShieldCheck; value: string; label: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-3 font-serif text-xl font-bold">{value}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/35">{label}</p></div>;
}
