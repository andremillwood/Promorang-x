import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Building2, ChevronLeft, ChevronRight, Compass, Pause, Play, Store, WalletCards } from "lucide-react";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { HeroFloatingBadges } from "@/components/hero/HeroFloatingBadges";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { OpsTheatreStatusPill } from "@/components/theater/OpsTheatreStatusPill";
import { useAuth } from "@/contexts/AuthContext";
import { usePromoCard } from "@/hooks/usePromoCard";
import { useI18n } from "@/i18n/I18nContext";
import { rememberMarketingIntent } from "@/lib/marketing-attribution";
import heroImage from "@/assets/hero-moments.jpg";

export type HomeSuperHeroItem = {
  id: string;
  kind: string;
  title: string;
  image: string | null;
  detail: string;
  value: string;
  href: string;
  action: string;
};

type HomeSuperHeroProps = {
  livePulse: string;
  heroItems: HomeSuperHeroItem[];
  activeHeroItem: HomeSuperHeroItem | undefined;
  heroPaused: boolean;
  reducedMotion?: boolean;
  onOpenOrientation?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  onHoverChange: (hovered: boolean) => void;
};

function formatCardMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function HomeSuperHero({
  livePulse,
  heroItems,
  activeHeroItem,
  heroPaused,
  reducedMotion = false,
  onOpenOrientation,
  onPrev,
  onNext,
  onTogglePause,
  onHoverChange,
}: HomeSuperHeroProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: card } = usePromoCard(user?.id);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const cardHref = user ? "/wallet" : "/auth?mode=signup&next=/wallet";
  const signedInWithCard = Boolean(user && card);
  const spendable = Number(card?.availableBalance ?? 0);
  const limit = Number(card?.monthlyLimit ?? 0);
  const placesCount = card?.acceptedLocationsCount ?? 0;

  return (
    <section
      ref={heroRef}
      className="relative isolate min-h-[92svh] overflow-hidden bg-[#05070b] text-white"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: reducedMotion ? 0 : heroY, scale: reducedMotion ? 1 : heroScale }}
      >
        <img
          src={heroImage}
          alt=""
          className="h-full w-full object-cover object-[62%_center] opacity-75"
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.22),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.72)_42%,rgba(5,7,11,0.96)_100%)] md:bg-[radial-gradient(circle_at_72%_18%,rgba(255,106,0,0.2),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.58)_46%,rgba(0,0,0,0.28)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05070b] to-transparent" />

      <div className="hidden md:block">
        <HeroFloatingBadges scrollYProgress={scrollYProgress} reducedMotion={reducedMotion} />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[92svh] w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] md:px-8 lg:px-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">
            {t("home.promoEyebrow")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              <span className="line-clamp-2 normal-case tracking-normal">{livePulse}</span>
            </span>
            <OpsTheatreStatusPill onOpenOrientation={onOpenOrientation} showDetails />
          </div>

          <h1 className="mt-5 max-w-xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            {t("home.promoHeroLine1")}
            <br />
            <span className="text-primary drop-shadow-[0_12px_35px_rgba(255,85,0,0.4)]">
              {t("home.promoHeroLine2")}
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/78 sm:text-lg">
            {t("home.promoHeroCopy")}
          </p>
          <p className="mt-3 text-sm text-white/55">{t("home.promoHeroRhythm")}</p>

          <div className="mt-6 rounded-2xl border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">{t("home.promoHeroTrust")}</p>
            <p className="mt-1 text-xs leading-5 text-white/60">{t("home.promoHeroTrustDetail")}</p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={cardHref}
              onClick={() => rememberMarketingIntent("hero_promocard", cardHref, "participant")}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(255,85,0,0.3)] transition hover:bg-orange-600"
            >
              <WalletCards className="mr-2 h-4 w-4" />
              {user ? t("home.promoHeroCtaIn") : t("home.promoHeroCta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/shop"
              onClick={() => rememberMarketingIntent("hero_promocard_where", "/shop", "participant")}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/14"
            >
              <Store className="mr-2 h-4 w-4 text-amber-300" />
              {t("home.promoHeroWhere")}
            </Link>
          </div>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {t("home.promoAlso")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/discover"
              onClick={() => rememberMarketingIntent("hero_explore_discover", "/discover", "participant")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/12"
            >
              <Compass className="h-3.5 w-3.5" />
              {t("home.exploreMoments")}
            </Link>
            <Link
              to="/hosting"
              onClick={() => rememberMarketingIntent("hero_host_moment", "/hosting", "host")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/12"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              {t("home.promoAlsoHost")}
            </Link>
            <Link
              to="/for-brands"
              onClick={() => rememberMarketingIntent("hero_brands", "/for-brands", "brand")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/12"
            >
              <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              {t("home.promoAlsoBrands")}
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <TiltCard3D className="w-full max-w-[360px]" maxTilt={reducedMotion ? 0 : 10}>
            <Link to={cardHref} className="block" aria-label={t("home.promoHeroCta")}>
              <PromoCardFace
                available={signedInWithCard ? formatCardMoney(spendable) : "$50.00"}
                limit={signedInWithCard && limit > 0 ? formatCardMoney(limit) : "$50.00"}
                holder={signedInWithCard ? t("home.promoCardHolder") : t("home.promoCardExample")}
                places={
                  placesCount > 0
                    ? t("home.promoCardPlacesLive", { count: placesCount })
                    : t("home.promoCardPlaces")
                }
                className="w-full max-w-full shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
              />
            </Link>
          </TiltCard3D>
          {!signedInWithCard ? (
            <p className="mt-3 text-center text-[11px] text-white/45 md:text-right">
              {t("home.promoCardExampleLimit")}
            </p>
          ) : null}

          <div className="mt-5 grid w-full max-w-[360px] grid-cols-3 gap-2 text-center">
            {[
              ["01", t("home.promoStepFind")],
              ["02", t("home.promoStepUse")],
              ["03", t("home.promoStepRefill")],
            ].map(([step, label]) => (
              <div
                key={step}
                className="rounded-xl border border-white/12 bg-black/30 px-2 py-2.5 backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                  {step}
                </p>
                <p className="mt-1 text-xs font-semibold text-white">{label}</p>
              </div>
            ))}
          </div>

          {activeHeroItem ? (
            <div
              className="mt-5 w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/12 bg-black/35 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-md"
              onMouseEnter={() => onHoverChange(true)}
              onMouseLeave={() => onHoverChange(false)}
            >
              <p className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {t("home.promoUseHere")}
              </p>
              <Link to={activeHeroItem.href} className="block px-4 pb-4 pt-2">
                {activeHeroItem.image ? (
                  <img
                    src={activeHeroItem.image}
                    alt=""
                    className="mb-3 h-28 w-full rounded-xl object-cover"
                  />
                ) : null}
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {t("home.live")} · {activeHeroItem.kind}
                </p>
                <p className="mt-1 font-display text-lg font-semibold leading-tight text-white">
                  {activeHeroItem.title}
                </p>
                <p className="mt-1 text-sm text-white/65">{activeHeroItem.detail}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-white/55">
                  <span>{activeHeroItem.value}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    {activeHeroItem.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
              {heroItems.length > 1 ? (
                <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                  <button type="button" onClick={onPrev} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label={t("home.previous")}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={onTogglePause} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label={heroPaused ? t("home.resume") : t("home.pause")} aria-pressed={heroPaused}>
                    {heroPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={onNext} className="rounded-full p-1.5 text-white/70 hover:bg-white/10" aria-label={t("home.next")}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
