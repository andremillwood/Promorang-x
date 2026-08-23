import { Link } from "react-router-dom";
import { ArrowRight, Building2, Compass, Lightbulb, Sparkles, Store, Users } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

export type GatewayAudience = "all" | "participant" | "host" | "merchant" | "creator" | "brand";

const toolsConfig: Array<{
  audience: Exclude<GatewayAudience, "all">;
  number: string;
  icon: typeof Compass;
  eyebrowKey: TranslationKey;
  titleKey: TranslationKey;
  promiseKey: TranslationKey;
  ctaKey: TranslationKey;
  href: string;
  campaign: string;
  campaignLabelKey: TranslationKey;
}> = [
  {
    audience: "participant",
    number: "01",
    icon: Compass,
    eyebrowKey: "leadMagnet.participant.eyebrow",
    titleKey: "leadMagnet.participant.title",
    promiseKey: "leadMagnet.participant.promise",
    ctaKey: "leadMagnet.participant.cta",
    href: "/free/scene",
    campaign: "/campaigns/kingston-comes-alive",
    campaignLabelKey: "leadMagnet.participant.campaignLabel",
  },
  {
    audience: "host",
    number: "02",
    icon: Users,
    eyebrowKey: "leadMagnet.host.eyebrow",
    titleKey: "leadMagnet.host.title",
    promiseKey: "leadMagnet.host.promise",
    ctaKey: "leadMagnet.host.cta",
    href: "/free/moment",
    campaign: "/campaigns/moment-lab",
    campaignLabelKey: "leadMagnet.host.campaignLabel",
  },
  {
    audience: "merchant",
    number: "03",
    icon: Store,
    eyebrowKey: "leadMagnet.merchant.eyebrow",
    titleKey: "leadMagnet.merchant.title",
    promiseKey: "leadMagnet.merchant.promise",
    ctaKey: "leadMagnet.merchant.cta",
    href: "/free/demand",
    campaign: "/campaigns/quiet-hours",
    campaignLabelKey: "leadMagnet.merchant.campaignLabel",
  },
  {
    audience: "creator",
    number: "04",
    icon: Sparkles,
    eyebrowKey: "leadMagnet.creator.eyebrow",
    titleKey: "leadMagnet.creator.title",
    promiseKey: "leadMagnet.creator.promise",
    ctaKey: "leadMagnet.creator.cta",
    href: "/free/creator",
    campaign: "/campaigns/creators-who-move",
    campaignLabelKey: "leadMagnet.creator.campaignLabel",
  },
  {
    audience: "brand",
    number: "05",
    icon: Building2,
    eyebrowKey: "leadMagnet.brand.eyebrow",
    titleKey: "leadMagnet.brand.title",
    promiseKey: "leadMagnet.brand.promise",
    ctaKey: "leadMagnet.brand.cta",
    href: "/free/sponsor",
    campaign: "/campaigns/sponsor-kingston",
    campaignLabelKey: "leadMagnet.brand.campaignLabel",
  },
];

export function LeadMagnetGateway({ audience="all", dark=false }: { audience?:GatewayAudience; dark?:boolean }) {
  const { t } = useI18n();
  const selected = audience === "all" ? toolsConfig : toolsConfig.filter(tool=>tool.audience===audience);

  if (audience !== "all") {
    const tool = selected[0];
    const Icon = tool.icon;
    return (
      <section className={dark ? "border-y border-white/10 bg-[#080808] text-white" : "border-y border-border bg-secondary/25"}>
        <div className="container px-6 py-14 md:py-20">
          <div className={`grid overflow-hidden rounded-[2rem] border ${dark ? "border-white/10 bg-white/[.04]" : "border-border bg-card"} lg:grid-cols-[.8fr_1.6fr_.8fr]`}>
            <div className="flex items-center gap-4 border-b p-6 lg:border-b-0 lg:border-r">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
                <Icon className="h-6 w-6"/>
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("leadMagnet.reportBadge")}</p>
                <p className={`mt-1 text-xs ${dark ? "text-white/45" : "text-muted-foreground"}`}>{tool.number} · {t("leadMagnet.timeEstimate")}</p>
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t(tool.eyebrowKey)}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">{t(tool.titleKey)}</h2>
              <p className={`mt-3 max-w-2xl text-sm leading-6 ${dark ? "text-white/55" : "text-muted-foreground"}`}>{t(tool.promiseKey)}</p>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t p-6 lg:border-l lg:border-t-0">
              <Link to={tool.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white transition hover:-translate-y-0.5">
                {t(tool.ctaKey)}<ArrowRight className="h-4 w-4"/>
              </Link>
              <Link to={tool.campaign} className={`inline-flex items-center justify-center gap-2 text-xs font-bold ${dark ? "text-white/55 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>
                {t(tool.campaignLabelKey)}<ArrowRight className="h-3 w-3"/>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-white/10 bg-[#0a0a0a] text-white">
      <div className="container px-6 py-20 md:py-28">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-primary">{t("leadMagnet.sectionEyebrow")}</p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-[.95] tracking-[-.04em] md:text-6xl">{t("leadMagnet.sectionTitle")}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/52 lg:justify-self-end">{t("leadMagnet.sectionCopy")}</p>
        </div>
        <div className="mt-12 grid border-l border-t border-white/10 md:grid-cols-2 xl:grid-cols-5">
          {toolsConfig.map(tool => {
            const Icon = tool.icon;
            return (
              <Link key={tool.audience} to={tool.href} className="group flex flex-col justify-between border-b border-r border-white/10 p-6 transition hover:bg-primary">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-[.2em] text-primary transition group-hover:text-white">{tool.number}</span>
                    <Icon className="h-5 w-5 text-white/35 transition group-hover:text-white"/>
                  </div>
                  <p className="mt-8 text-[10px] font-black uppercase tracking-[.16em] text-white/40 transition group-hover:text-white/70">{t(tool.eyebrowKey)}</p>
                  <h3 className="mt-3 font-serif text-2xl font-bold leading-tight">{t(tool.titleKey)}</h3>
                  <p className="mt-3 text-xs leading-6 text-white/46 transition group-hover:text-white/80">{t(tool.promiseKey)}</p>
                </div>
                <div className="mt-8 pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-black text-primary transition group-hover:text-white">{t(tool.ctaKey)}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-5">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary"/>
          <p className="text-xs leading-6 text-white/45">
            <b className="text-white">{t("leadMagnet.noAccount")}</b> {t("leadMagnet.noAccountCopy")}
          </p>
        </div>
      </div>
    </section>
  );
}
