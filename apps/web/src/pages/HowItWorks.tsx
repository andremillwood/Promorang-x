import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  Coins,
  Compass,
  Flame,
  Gem,
  Gift,
  HelpCircle,
  KeyRound,
  LineChart,
  Lock,
  MapPin,
  Megaphone,
  QrCode,
  Repeat2,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { PromoCardEconomyExplainer } from "@/components/promocard";

type RoleId = "member" | "creator" | "merchant" | "brand" | "promoter";

const valueTypes: Array<{
  icon: typeof WalletCards;
  label: TranslationKey;
  sub: TranslationKey;
  detail: TranslationKey;
  badge: TranslationKey;
  accent: string;
  badgeColor: string;
}> = [
  {
    icon: WalletCards,
    label: "how.value1Label",
    sub: "how.value1Sub",
    detail: "how.value1Detail",
    badge: "how.value1Badge",
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  {
    icon: Repeat2,
    label: "how.value2Label",
    sub: "how.value2Sub",
    detail: "how.value2Detail",
    badge: "how.value2Badge",
    accent: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  {
    icon: Ticket,
    label: "how.value3Label",
    sub: "how.value3Sub",
    detail: "how.value3Detail",
    badge: "how.value3Badge",
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  },
  {
    icon: Trophy,
    label: "how.value4Label",
    sub: "how.value4Sub",
    detail: "how.value4Detail",
    badge: "how.value4Badge",
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  },
  {
    icon: Gem,
    label: "how.value5Label",
    sub: "how.value5Sub",
    detail: "how.value5Detail",
    badge: "how.value5Badge",
    accent: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
];

const roleStep = (role: RoleId, n: 1 | 2 | 3 | 4, href: string, stepNum: string) => ({
  stepNum,
  title: `how.${role}Step${n}Title` as TranslationKey,
  detail: `how.${role}Step${n}Detail` as TranslationKey,
  href,
  cta: `how.${role}Step${n}Cta` as TranslationKey,
  badgeText: `how.${role}Step${n}Badge` as TranslationKey,
});

const rolesData: Record<
  RoleId,
  {
    id: RoleId;
    label: TranslationKey;
    icon: typeof Users;
    tagline: TranslationKey;
    promise: TranslationKey;
    previewMock: {
      tag: TranslationKey;
      title: TranslationKey;
      subtitle: TranslationKey;
      stat: TranslationKey;
      statLabel: TranslationKey;
    };
    steps: Array<{
      stepNum: string;
      title: TranslationKey;
      detail: TranslationKey;
      href: string;
      cta: TranslationKey;
      badgeText: TranslationKey;
    }>;
  }
> = {
  member: {
    id: "member",
    label: "how.memberLabel",
    icon: Users,
    tagline: "how.memberTagline",
    promise: "how.memberPromise",
    previewMock: {
      tag: "how.memberPreviewTag",
      title: "how.memberPreviewTitle",
      subtitle: "how.memberPreviewSubtitle",
      stat: "how.memberPreviewStat",
      statLabel: "how.memberPreviewStatLabel",
    },
    steps: [
      roleStep("member", 1, "/radar?tab=discover", "01"),
      roleStep("member", 2, "/discover", "02"),
      roleStep("member", 3, "/missions", "03"),
      roleStep("member", 4, "/wallet", "04"),
    ],
  },
  creator: {
    id: "creator",
    label: "how.creatorLabel",
    icon: Sparkles,
    tagline: "how.creatorTagline",
    promise: "how.creatorPromise",
    previewMock: {
      tag: "how.creatorPreviewTag",
      title: "how.creatorPreviewTitle",
      subtitle: "how.creatorPreviewSubtitle",
      stat: "how.creatorPreviewStat",
      statLabel: "how.creatorPreviewStatLabel",
    },
    steps: [
      roleStep("creator", 1, "/create/moment", "01"),
      roleStep("creator", 2, "/content-drops", "02"),
      roleStep("creator", 3, "/promopush/creator", "03"),
      roleStep("creator", 4, "/portfolio", "04"),
    ],
  },
  merchant: {
    id: "merchant",
    label: "how.merchantLabel",
    icon: Building2,
    tagline: "how.merchantTagline",
    promise: "how.merchantPromise",
    previewMock: {
      tag: "how.merchantPreviewTag",
      title: "how.merchantPreviewTitle",
      subtitle: "how.merchantPreviewSubtitle",
      stat: "how.merchantPreviewStat",
      statLabel: "how.merchantPreviewStatLabel",
    },
    steps: [
      roleStep("merchant", 1, "/dashboard/venues", "01"),
      roleStep("merchant", 2, "/marketplace", "02"),
      roleStep("merchant", 3, "/create/moment", "03"),
      roleStep("merchant", 4, "/dashboard/analytics", "04"),
    ],
  },
  brand: {
    id: "brand",
    label: "how.brandLabel",
    icon: Megaphone,
    tagline: "how.brandTagline",
    promise: "how.brandPromise",
    previewMock: {
      tag: "how.brandPreviewTag",
      title: "how.brandPreviewTitle",
      subtitle: "how.brandPreviewSubtitle",
      stat: "how.brandPreviewStat",
      statLabel: "how.brandPreviewStatLabel",
    },
    steps: [
      roleStep("brand", 1, "/create/campaign", "01"),
      roleStep("brand", 2, "/dashboard/campaigns", "02"),
      roleStep("brand", 3, "/promopush", "03"),
      roleStep("brand", 4, "/dashboard/analytics", "04"),
    ],
  },
  promoter: {
    id: "promoter",
    label: "how.promoterLabel",
    icon: Rocket,
    tagline: "how.promoterTagline",
    promise: "how.promoterPromise",
    previewMock: {
      tag: "how.promoterPreviewTag",
      title: "how.promoterPreviewTitle",
      subtitle: "how.promoterPreviewSubtitle",
      stat: "how.promoterPreviewStat",
      statLabel: "how.promoterPreviewStatLabel",
    },
    steps: [
      roleStep("promoter", 1, "/growth", "01"),
      roleStep("promoter", 2, "/promopush/promoter", "02"),
      roleStep("promoter", 3, "/discover", "03"),
      roleStep("promoter", 4, "/wallet", "04"),
    ],
  },
};

const systemLayers = [
  {
    number: "01",
    icon: Compass,
    title: "how.layer1Title" as const,
    question: "how.layer1Question" as const,
    detail: "how.layer1Detail" as const,
    links: [
      ["how.layer1Link1", "/discover"],
      ["how.layer1Link2", "/discover/venues"],
      ["how.layer1Link3", "/marketplace"],
    ] as Array<[TranslationKey, string]>,
  },
  {
    number: "02",
    icon: BadgeCheck,
    title: "how.layer2Title" as const,
    question: "how.layer2Question" as const,
    detail: "how.layer2Detail" as const,
    links: [
      ["how.layer2Link1", "/missions"],
      ["how.layer2Link2", "/dashboard"],
    ] as Array<[TranslationKey, string]>,
  },
  {
    number: "03",
    icon: WalletCards,
    title: "how.layer3Title" as const,
    question: "how.layer3Question" as const,
    detail: "how.layer3Detail" as const,
    links: [
      ["how.layer3Link1", "/wallet"],
      ["how.layer3Link2", "/rewards"],
      ["how.layer3Link3", "/vault"],
    ] as Array<[TranslationKey, string]>,
  },
  {
    number: "04",
    icon: LineChart,
    title: "how.layer4Title" as const,
    question: "how.layer4Question" as const,
    detail: "how.layer4Detail" as const,
    links: [
      ["how.layer4Link1", "/portfolio"],
      ["how.layer4Link2", "/trading"],
      ["how.layer4Link3", "/liquidity"],
    ] as Array<[TranslationKey, string]>,
  },
  {
    number: "05",
    icon: Rocket,
    title: "how.layer5Title" as const,
    question: "how.layer5Question" as const,
    detail: "how.layer5Detail" as const,
    links: [
      ["how.layer5Link1", "/growth"],
      ["how.layer5Link2", "/promoshare"],
      ["how.layer5Link3", "/promopush"],
    ] as Array<[TranslationKey, string]>,
  },
];

const valuePillars = [
  { icon: ShieldCheck, title: "how.pillar1Title" as const, detail: "how.pillar1Detail" as const },
  { icon: Lock, title: "how.pillar2Title" as const, detail: "how.pillar2Detail" as const },
  { icon: Sparkles, title: "how.pillar3Title" as const, detail: "how.pillar3Detail" as const },
  { icon: Coins, title: "how.pillar4Title" as const, detail: "how.pillar4Detail" as const },
];

const faqs: Array<{ q: TranslationKey; a: TranslationKey }> = [
  { q: "how.faq1Q", a: "how.faq1A" },
  { q: "how.faq2Q", a: "how.faq2A" },
  { q: "how.faq3Q", a: "how.faq3A" },
  { q: "how.faq4Q", a: "how.faq4A" },
  { q: "how.faq5Q", a: "how.faq5A" },
  { q: "how.faq6Q", a: "how.faq6A" },
  { q: "how.faq7Q", a: "how.faq7A" },
];

export default function HowItWorks() {
  const { t } = useI18n();
  const [activeRole, setActiveRole] = useState<RoleId>("member");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentRole = rolesData[activeRole];

  return (
    <main className="marketing-refined min-h-screen bg-[#070707] text-white selection:bg-primary selection:text-black">
      <SEO
        title={t("how.seoTitle")}
        description={t("how.seoCopy")}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-20 pt-28 md:pt-36">
        {/* Glow gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,107,0,0.22),transparent_35%),radial-gradient(circle_at_20%_50%,rgba(147,51,234,0.12),transparent_35%),linear-gradient(180deg,#121212_0%,#070707_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("how.heroBadge")}</span>
            </div>

            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-6xl lg:text-[5.5rem]">
              {t("how.heroLine1")}
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-primary bg-clip-text text-transparent">
                {t("how.heroLine2")}
              </span>
              <br />
              {t("how.heroLine3")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              {t("how.heroBody")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/radar?tab=discover"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-500 px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/40 active:scale-[0.98]"
              >
                <span>{t("how.getCard")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/economy/promocard"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-black text-white transition-all duration-200 hover:border-primary/60 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <span>{t("how.seeValueFlow")}</span>
                <Flame className="h-4 w-4 text-primary" />
              </Link>
            </div>
          </div>

          {/* 7-Day Interactive Card */}
          <aside className="rounded-3xl border border-orange-500/30 bg-black/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-400">{t("how.cycle")}</h3>
              </div>
              <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-black text-orange-400 border border-orange-500/20">
                {t("how.weeklyLoop")}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { step: "01", day: "how.day1Title" as const, desc: "how.day1Desc" as const, active: true },
                { step: "02", day: "how.day2Title" as const, desc: "how.day2Desc" as const, active: false },
                { step: "03", day: "how.day3Title" as const, desc: "how.day3Desc" as const, active: false },
                { step: "04", day: "how.day4Title" as const, desc: "how.day4Desc" as const, active: false },
                { step: "05", day: "how.day5Title" as const, desc: "how.day5Desc" as const, active: false },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                    item.active
                      ? "border-orange-500/40 bg-orange-500/10 shadow-sm"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      item.active ? "bg-orange-500 text-black font-black" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {item.step}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{t(item.day)}</div>
                    <div className="text-[11px] leading-relaxed text-white/60">{t(item.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <PromoCardEconomyExplainer audience="member" />

      {/* 5 Ways You Get Rewarded (Benefit-First) */}
      <section className="border-b border-white/10 px-5 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                {t("how.valueEyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl">
                {t("how.reasons")}
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/60">
              {t("how.valueCopy")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {valueTypes.map((item, idx) => (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${item.badgeColor}`}>
                      {t(item.badge)}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black text-white">{t(item.label)}</h3>
                  <div className="text-xs font-bold opacity-80">{t(item.sub)}</div>
                  <p className="mt-3 text-xs leading-relaxed text-white/65">{t(item.detail)}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Journey Interactive Stepper */}
      <section className="px-5 py-16 md:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">{t("how.journeyEyebrow")}</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {t("how.journey")}
              </h2>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md">
              {(Object.keys(rolesData) as RoleId[]).map((roleKey) => {
                const role = rolesData[roleKey];
                const isActive = activeRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setActiveRole(roleKey)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-200 active:scale-[0.97] ${
                      isActive ? "text-black font-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeRoleTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-orange-500 shadow-md shadow-primary/20"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <role.icon className="h-3.5 w-3.5" />
                      {t(role.label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Stepper & Live Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 shadow-2xl"
            >
              {/* Header Promise Banner */}
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t(currentRole.tagline)}
                  </div>
                  <p className="mt-2 text-xl font-bold leading-relaxed text-white/90 md:text-2xl">
                    {t(currentRole.promise)}
                  </p>
                </div>

                {/* Simulated Screen Preview Badge */}
                <div className="shrink-0 rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      {t(currentRole.previewMock.tag)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-black text-white">{t(currentRole.previewMock.title)}</div>
                  <div className="text-[11px] text-white/60">{t(currentRole.previewMock.subtitle)}</div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-xs">
                    <span className="font-black text-emerald-400">{t(currentRole.previewMock.stat)}</span>
                    <span className="text-[10px] text-white/50">{t(currentRole.previewMock.statLabel)}</span>
                  </div>
                </div>
              </div>

              {/* 4 Connected Step Cards */}
              <div className="grid divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
                {currentRole.steps.map((step, idx) => (
                  <article
                    key={step.stepNum}
                    className="group relative flex flex-col justify-between p-6 transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-primary">{step.stepNum}</span>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50 border border-white/10">
                          {t(step.badgeText)}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-black text-white">{t(step.title)}</h3>
                      <p className="mt-3 text-xs leading-relaxed text-white/60 min-h-[50px]">{t(step.detail)}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <Link
                        to={step.href}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-primary transition-transform duration-150 group-hover:translate-x-1"
                      >
                        <span>{t(step.cta)}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 5 Integrated System Layers */}
      <section className="border-y border-white/10 bg-[#0c0c0c] px-5 py-16 md:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">{t("how.layersEyebrow")}</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              {t("how.layersTitleNew")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {t("how.layersCopy")}
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {systemLayers.map((layer) => (
              <article
                key={layer.number}
                className="group grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 transition-all duration-200 hover:border-white/20 hover:bg-black/60 md:grid-cols-[60px_240px_1fr_auto] md:items-center"
              >
                <div className="flex items-center gap-3 md:block">
                  <span className="text-xs font-black text-white/30">{layer.number}</span>
                  <layer.icon className="h-5 w-5 text-primary md:mt-2" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{t(layer.title)}</h3>
                  <p className="mt-0.5 text-xs font-bold text-primary">{t(layer.question)}</p>
                </div>
                <p className="text-xs leading-relaxed text-white/60">{t(layer.detail)}</p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {layer.links.map(([label, href]) => (
                    <Link
                      key={href}
                      to={href}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/70 transition-colors duration-150 hover:border-primary/50 hover:text-primary active:scale-[0.97]"
                    >
                      {t(label)}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Value Engine (Replacing raw Liquidity jargon) */}
      <section className="px-5 py-16 md:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">{t("how.liquidityEyebrow")}</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {t("how.liquidityTitleNew")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {t("how.liquidityCopyNew")}
              </p>
            </div>
            <Link
              to="/liquidity"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white transition-all duration-200 hover:border-primary/60 hover:text-primary"
            >
              <span>{t("how.liquidityCtaNew")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {valuePillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-200 hover:border-orange-500/30 hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-black text-white">{t(pillar.title)}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{t(pillar.detail)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="border-t border-white/10 bg-[#0a0a0a] px-5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t("how.faqEyebrow")}</span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              {t("how.faqTitle")}
            </h2>
            <p className="mt-3 text-sm text-white/60">
              {t("how.faqCopy")}
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 transition-colors duration-200 hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-base font-bold text-white transition-colors duration-150 focus:outline-none"
                  >
                    <span>{t(faq.q)}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="border-t border-white/5 p-5 pt-0 text-xs leading-relaxed text-white/65">
                          {t(faq.a)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dual CTA Footer Deck */}
      <section className="border-t border-white/10 px-5 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {/* For Explorers */}
          <article className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-black to-black p-8 md:p-10 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("how.explorerEyebrow")}</span>
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              {t("how.explorerTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {t("how.explorerCopy")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>{t("how.startExploring")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/radar"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-black text-white hover:border-primary/60 active:scale-[0.98]"
              >
                <span>{t("how.voteDiscoveries")}</span>
              </Link>
            </div>
          </article>

          {/* For Venues & Creators */}
          <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-black to-black p-8 md:p-10 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-orange-400">
              <Building2 className="h-3.5 w-3.5" />
              <span>{t("how.venueEyebrow")}</span>
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              {t("how.venueTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {t("how.venueCopy")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/for-merchants"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>{t("how.partnerVenue")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/for-creators"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-black text-white hover:border-white/40 active:scale-[0.98]"
              >
                <span>{t("how.creatorHub")}</span>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
