import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, CreditCard, RefreshCw, Store, WalletCards } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

type Audience = "member" | "merchant" | "brand" | "creator" | "community" | "agency";

const audienceKeys: Record<Audience, { eyebrow: TranslationKey; title: TranslationKey; copy: TranslationKey; outcome: TranslationKey }> = {
  member: {
    eyebrow: "promoCardExplainer.memberEyebrow",
    title: "promoCardExplainer.memberTitle",
    copy: "promoCardExplainer.memberCopy",
    outcome: "promoCardExplainer.memberOutcome",
  },
  merchant: {
    eyebrow: "promoCardExplainer.merchantEyebrow",
    title: "promoCardExplainer.merchantTitle",
    copy: "promoCardExplainer.merchantCopy",
    outcome: "promoCardExplainer.merchantOutcome",
  },
  brand: {
    eyebrow: "promoCardExplainer.brandEyebrow",
    title: "promoCardExplainer.brandTitle",
    copy: "promoCardExplainer.brandCopy",
    outcome: "promoCardExplainer.brandOutcome",
  },
  creator: {
    eyebrow: "promoCardExplainer.creatorEyebrow",
    title: "promoCardExplainer.creatorTitle",
    copy: "promoCardExplainer.creatorCopy",
    outcome: "promoCardExplainer.creatorOutcome",
  },
  community: {
    eyebrow: "promoCardExplainer.communityEyebrow",
    title: "promoCardExplainer.communityTitle",
    copy: "promoCardExplainer.communityCopy",
    outcome: "promoCardExplainer.communityOutcome",
  },
  agency: {
    eyebrow: "promoCardExplainer.agencyEyebrow",
    title: "promoCardExplainer.agencyTitle",
    copy: "promoCardExplainer.agencyCopy",
    outcome: "promoCardExplainer.agencyOutcome",
  },
};

const stepMeta = [
  { icon: CreditCard, number: "01", title: "promoCardExplainer.step1Title" as const, text: "promoCardExplainer.step1Text" as const },
  { icon: Store, number: "02", title: "promoCardExplainer.step2Title" as const, text: "promoCardExplainer.step2Text" as const },
  { icon: WalletCards, number: "03", title: "promoCardExplainer.step3Title" as const, text: "promoCardExplainer.step3Text" as const },
  { icon: RefreshCw, number: "04", title: "promoCardExplainer.step4Title" as const, text: "promoCardExplainer.step4Text" as const },
];

export function PromoCardEconomyExplainer({ audience = "member", compact = false }: { audience?: Audience; compact?: boolean }) {
  const { t } = useI18n();
  const content = audienceKeys[audience];

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#090909] py-16 text-white md:py-24" aria-labelledby={`promocard-${audience}-title`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(249,115,22,0.16),transparent_34%),radial-gradient(circle_at_86%_80%,rgba(16,185,129,0.10),transparent_32%)]" />
      <div className="container relative px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <BadgeCheck className="h-4 w-4" /> {t(content.eyebrow)}
            </div>
            <h2 id={`promocard-${audience}-title`} className="mt-5 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-6xl">
              {t(content.title)}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/60">{t(content.copy)}</p>
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
              {t(content.outcome)}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]">
                {t("promoCardExplainer.getCard")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/promocard" className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {t("promoCardExplainer.seeMoneyFlow")}
              </Link>
            </div>
          </div>

          <div className={`grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
            {stepMeta.map((step) => (
              <article key={step.number} className="group min-h-56 bg-[#111] p-6 transition-colors hover:bg-[#151515] md:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{step.number}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/75 transition group-hover:border-primary/40 group-hover:text-primary">
                    <step.icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-black tracking-[-0.02em]">{t(step.title)}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{t(step.text)}</p>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-white/35">
          {t("promoCardExplainer.disclaimer")}
        </p>
      </div>
    </section>
  );
}
