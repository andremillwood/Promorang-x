import { useState } from "react";
import { ArrowRight, Check, Radio, Share2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { trackGrowthEvent } from "@/lib/marketing-attribution";
import { useI18n } from "@/i18n/I18nContext";

type DemandSignalState = "early" | "warming" | "near_threshold" | "threshold_met";

type DemandSignalObjectProps = {
  city: string;
  title: string;
  leadingOption?: string | null;
  demandCount: number;
  threshold?: number | null;
  matchedAsk?: string | null;
  responseLabel?: string | null;
  benefitLabel?: string | null;
  href: string;
  shareHref?: string;
  actionLabel?: string;
  state?: DemandSignalState;
  className?: string;
};

const stateCopy: Record<DemandSignalState, string> = {
  early: "clarity.stateEarly",
  warming: "clarity.stateWarming",
  near_threshold: "clarity.stateNear",
  threshold_met: "clarity.stateMet",
};

export function DemandSignalObject({
  city,
  title,
  leadingOption,
  demandCount,
  threshold,
  matchedAsk,
  responseLabel,
  benefitLabel,
  href,
  shareHref,
  actionLabel = "Open Want",
  state = "early",
  className,
}: DemandSignalObjectProps) {
  const { t, formatNumber } = useI18n();
  const [shared, setShared] = useState(false);
  const remaining = Math.max((threshold || 0) - demandCount, 0);
  const progress = threshold ? Math.min(100, Math.round((demandCount / Math.max(threshold, 1)) * 100)) : null;

  async function shareWant() {
    const url = new URL(shareHref || href, window.location.origin).toString();
    const text = t("clarity.shareWantText", { title });
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 2500);
      void trackGrowthEvent({
        eventName: "demand_signal_shared",
        journey: "participant",
        stage: "amplified",
        entityType: "demand",
        properties: { title, href: shareHref || href },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-[#1a120c]/15 bg-[#f4ead6] text-[#1a120c] shadow-[0_24px_80px_rgba(0,0,0,.26)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,#1a120c_0,#1a120c_10px,transparent_10px,transparent_17px)] opacity-20" />
      <div className="grid min-h-[19rem] sm:grid-cols-[minmax(0,1fr)_104px]">
        <div className="flex min-w-0 flex-col p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#1a120c]/20 pb-4">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a6554]">
              <Radio className="h-3.5 w-3.5 text-orange-700" />
              {t("clarity.peopleWantThis", { city })}
            </div>
            <span className="rounded-full border border-[#1a120c]/15 bg-white/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#5f4b3d]">
              {t(stateCopy[state])}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between py-5">
            <div>
              {matchedAsk ? (
                <p className="mb-2 text-xs font-semibold text-orange-800">{t("clarity.alsoAsking", { want: matchedAsk })}</p>
              ) : null}
              <h3 className="max-w-2xl font-serif text-3xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-4xl">
                {title}
              </h3>
              {leadingOption ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5a493d]">
                  {t("clarity.mostPeopleSay")} <span className="font-bold text-[#1a120c]">{leadingOption}</span>
                </p>
              ) : null}
              {responseLabel ? (
                <div className="mt-4 rounded-xl border border-orange-900/15 bg-orange-50/55 px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-800">
                    <Sparkles className="h-3.5 w-3.5" /> {t("clarity.whatCouldOpenForYou")}
                  </div>
                  <p className="mt-1.5 text-sm font-bold leading-6 text-[#1a120c]">{responseLabel}</p>
                </div>
              ) : benefitLabel ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5a493d]">{benefitLabel}</p>
              ) : null}
            </div>

            <div className="mt-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#5a493d]">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.12em]">{t("clarity.people")}</span>
                  </div>
                  <p className="mt-1 font-mono text-4xl font-black tracking-[-0.06em]">{formatNumber(demandCount)}</p>
                </div>
                {threshold ? (
                  <div className="text-right">
                    <p className="font-mono text-sm font-black">{remaining === 0 ? t("clarity.stateMet") : t("clarity.moreToTarget", { count: formatNumber(remaining) })}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a6554]">{t("clarity.targetCount", { count: formatNumber(threshold) })}</p>
                  </div>
                ) : null}
              </div>

              {progress !== null ? (
                <div className="mt-4 h-2 overflow-hidden rounded-full border border-[#1a120c]/10 bg-[#d9cdb9]">
                  <div className="h-full rounded-full bg-orange-600 transition-[width] duration-500" style={{ width: `${progress}%` }} />
                </div>
              ) : null}
              <p className="mt-3 text-[10px] font-medium leading-4 text-[#7a6554]">{responseLabel ? t("clarity.responseBenefitExplanation") : t("clarity.signalExplanation")}</p>
              <button
                type="button"
                onClick={() => void shareWant()}
                className="mt-4 inline-flex min-h-10 items-center gap-2 border-t border-[#1a120c]/15 pt-3 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-orange-800 transition hover:text-orange-950"
                aria-label={t("clarity.shareWantLabel", { title })}
              >
                {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {shared ? t("clarity.readyToShare") : t("clarity.knowSomeone")}
              </button>
            </div>
          </div>
        </div>

        <Link
          to={href}
          className="relative flex min-h-24 items-center justify-between gap-3 border-t border-dashed border-[#1a120c]/25 bg-[#eadcc4] px-6 py-5 transition hover:bg-[#e2d0b2] sm:min-h-full sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-3 sm:text-center"
          aria-label={`${actionLabel}: ${title}`}
        >
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-orange-800 sm:[writing-mode:vertical-rl] sm:rotate-180">
            {actionLabel}
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 sm:rotate-90 sm:group-hover:translate-x-0 sm:group-hover:translate-y-1" />
        </Link>
      </div>
    </article>
  );
}

export default DemandSignalObject;
