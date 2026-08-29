import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock3, Compass, Lightbulb, Sparkles, Store, Users, Zap } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { SwipeRail } from "@/components/ui/SwipeRail";
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
  personaBadge: string;
  outputPreview: string;
  personaTone: string;
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
    personaBadge: "Attendees",
    outputPreview: "Scene Match & Top 3 Rooms",
    personaTone: "border-sky-400/25 bg-sky-400/10 text-sky-300",
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
    personaBadge: "Hosts & Orgs",
    outputPreview: "Moment Score & Sponsor Pitch",
    personaTone: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
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
    personaBadge: "Venues & Food",
    outputPreview: "Nearby Demand & Offer Simulator",
    personaTone: "border-amber-400/25 bg-amber-400/10 text-amber-300",
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
    personaBadge: "Creators",
    outputPreview: "Audience Audit & Action Formats",
    personaTone: "border-violet-400/25 bg-violet-400/10 text-violet-300",
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
    personaBadge: "Brands & Agencies",
    outputPreview: "Activation Brief & ROI Proof Model",
    personaTone: "border-orange-400/25 bg-orange-400/10 text-orange-300",
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
              <span className={`grid h-14 w-14 place-items-center rounded-2xl border ${tool.personaTone}`}>
                <Icon className="h-6 w-6"/>
              </span>
              <div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${tool.personaTone}`}>
                  {tool.personaBadge}
                </span>
                <p className={`mt-1.5 text-xs font-medium ${dark ? "text-white/50" : "text-muted-foreground"}`}>{tool.number} · {t("leadMagnet.timeEstimate")}</p>
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t(tool.eyebrowKey)}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">{t(tool.titleKey)}</h2>
              <p className={`mt-3 max-w-2xl text-sm leading-6 ${dark ? "text-white/60" : "text-muted-foreground"}`}>{t(tool.promiseKey)}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80">
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Output: {tool.outputPreview}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t p-6 lg:border-l lg:border-t-0">
              <Link to={tool.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90">
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
      <div className="container px-5 py-14 md:px-6 md:py-28">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("leadMagnet.sectionEyebrow")}</p>
            <h2 className="mt-3 max-w-xl font-serif text-3xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-4xl md:mt-4 md:text-6xl md:leading-[0.95] md:tracking-[-0.04em]">{t("leadMagnet.sectionTitle")}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/60 lg:justify-self-end">{t("leadMagnet.sectionCopy")}</p>
        </div>

        {/* Elevated 5-Column Interactive Cards Grid */}
        <SwipeRail collapseAt="sm" fadeFrom="from-[#0a0a0a]" className="-mx-5 mt-8 px-5 sm:mx-0 sm:mt-12 sm:px-0" scrollerClassName="gap-3 pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {toolsConfig.map(tool => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.audience}
                to={tool.href}
                className="group relative flex w-[82vw] max-w-[19rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-white/[0.06] hover:shadow-[0_12px_32px_-12px_rgba(255,107,0,0.2)] sm:w-auto sm:max-w-none"
              >
                {/* Subtle Card Accent Glow on Hover */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

                {/* Top Section: Number + Persona Badge + Icon */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black tracking-wider text-white/40 group-hover:text-primary transition">{tool.number}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider ${tool.personaTone}`}>
                        {tool.personaBadge}
                      </span>
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${tool.personaTone} transition group-hover:scale-105`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Eyebrow & Title */}
                  <p className="mt-6 text-[9px] font-black uppercase tracking-[0.16em] text-white/40 transition group-hover:text-white/70">{t(tool.eyebrowKey)}</p>
                  <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug text-white transition group-hover:text-primary-foreground">{t(tool.titleKey)}</h3>

                  {/* Promise Copy */}
                  <p className="mt-2.5 text-xs leading-5 text-white/50 transition group-hover:text-white/80">{t(tool.promiseKey)}</p>

                  {/* Concrete Output Preview Chip */}
                  <div className="mt-4 rounded-xl border border-white/8 bg-black/40 p-2.5 transition group-hover:border-white/15">
                    <p className="text-[8.5px] font-black uppercase tracking-wider text-primary">Instant Output</p>
                    <p className="mt-0.5 text-[11px] font-semibold leading-tight text-white/90">{tool.outputPreview}</p>
                  </div>
                </div>

                {/* Card Footer: Time & CTA Button */}
                <div className="mt-6 pt-3 border-t border-white/8 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/40">
                    <Clock3 className="h-3 w-3 text-primary/80" /> 2 min
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-primary transition group-hover:translate-x-0.5 group-hover:text-white">
                    {t(tool.ctaKey)}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </SwipeRail>

        {/* Bottom Banner */}
        <div className="mt-8 flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
            <Lightbulb className="h-4.5 w-4.5" />
          </div>
          <p className="text-xs leading-6 text-white/50">
            <b className="text-white font-semibold">{t("leadMagnet.noAccount")}</b> {t("leadMagnet.noAccountCopy")}
          </p>
        </div>
      </div>
    </section>
  );
}
