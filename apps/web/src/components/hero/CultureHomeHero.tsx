import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { HeroFloatingBadges } from "@/components/hero/HeroFloatingBadges";
import {
  HERO_LAYER_IDS,
  INITIAL_HERO_LAYER,
  buildKeepRelic,
  buildProofReceipt,
  nextHeroLayer,
  previousHeroLayer,
  type HeroLayerId,
  type LiveHeroCard,
  type LiveHeroMoment,
} from "@/components/hero/cultureHomeHero";
import { OpsTheatreStatusPill } from "@/components/theater/OpsTheatreStatusPill";
import {
  CollectibleRelic,
  PlainEnglish,
  PromoCardFace,
  PaperReceipt,
  RoleLens,
  TicketPass,
} from "@/components/promorang/SignatureObjects";
import { LivingSceneAuraCard } from "@/components/ui/LivingSceneAuraCard";
import { ProofStampCard } from "@/components/ui/ProofStampCard";
import { TactileButton } from "@/components/ui/TactileButton";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { rememberMarketingIntent } from "@/lib/marketing-attribution";
import { useI18n } from "@/i18n/I18nContext";
import heroImage from "@/assets/hero-moments.jpg";

const LAYER_ROTATE_MS = 7000;

type CultureHomeHeroProps = {
  featuredMoment?: LiveHeroMoment | null;
  card?: LiveHeroCard | null;
  signedIn?: boolean;
  onOpenOrientation: () => void;
};

export function CultureHomeHero({
  featuredMoment,
  card,
  signedIn = false,
  onOpenOrientation,
}: CultureHomeHeroProps) {
  const { t } = useI18n();
  const [layer, setLayer] = useState<HeroLayerId>(INITIAL_HERO_LAYER);
  const [roleIndex, setRoleIndex] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const ambientY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-28px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.28]);
  const stageY = useTransform(scrollYProgress, [0, 1], ["0px", "36px"]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShouldReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (rotationPaused || interactionPaused || shouldReduceMotion || !pageVisible) return;
    const timer = window.setInterval(() => setLayer((current) => nextHeroLayer(current)), LAYER_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [interactionPaused, pageVisible, rotationPaused, shouldReduceMotion]);

  const receipt = buildProofReceipt(featuredMoment);
  const relic = buildKeepRelic(featuredMoment);
  const spendHref = signedIn ? "/wallet" : "/auth?mode=signup&next=/wallet";

  const roles = [
    {
      role: t("home.heroWhoSpend"),
      why: t("home.heroWhoSpendWhy"),
      outcome: t("home.heroWhoSpendOutcome"),
      action: signedIn ? t("home.heroCardCtaSignedIn") : t("home.heroCardCta"),
      href: spendHref,
    },
    {
      role: t("home.heroWhoJoin"),
      why: t("home.heroWhoJoinWhy"),
      outcome: t("home.heroWhoJoinOutcome"),
      action: t("home.exploreMoments"),
      href: "/discover",
    },
    {
      role: t("home.heroWhoHost"),
      why: t("home.heroWhoHostWhy"),
      outcome: t("home.heroWhoHostOutcome"),
      action: t("home.hostOrDeal"),
      href: "/hosting",
    },
    {
      role: t("home.heroWhoBrand"),
      why: t("home.heroWhoBrandWhy"),
      outcome: t("home.heroWhoBrandOutcome"),
      action: t("home.heroWhoBrandAction"),
      href: "/for-brands",
    },
  ];

  const layerMeta: Record<HeroLayerId, { label: string; href: string; action: string; audience: string }> = {
    tonight: {
      label: t("home.layerTonight"),
      href: featuredMoment?.href || "/discover/moments",
      action: t("home.heroTonightCta"),
      audience: "participant",
    },
    spend: {
      label: t("home.layerSpend"),
      href: spendHref,
      action: signedIn ? t("home.heroCardCtaSignedIn") : t("home.heroCardCta"),
      audience: "participant",
    },
    proof: {
      label: t("home.layerProof"),
      href: "/economy",
      action: t("home.heroProofCta"),
      audience: "participant",
    },
    keep: {
      label: t("home.layerKeep"),
      href: "/wallet",
      action: t("home.heroKeepCta"),
      audience: "participant",
    },
  };

  const pauseForPointer = () => setInteractionPaused(true);
  const resumeFromPointer = () => setInteractionPaused(false);

  return (
    <section ref={heroRef} className="relative overflow-hidden border-b border-white/10 md:min-h-[92svh]">
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : bgY, scale: shouldReduceMotion ? 1 : bgScale }}
        className="absolute inset-0 h-full w-full will-change-transform"
      >
        <img src={heroImage} alt="People gathered around a live culture moment" className="h-full w-full object-cover object-[62%_center]" />
      </motion.div>

      <motion.div
        style={{ y: shouldReduceMotion ? 0 : ambientY }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_16%,rgba(255,106,0,0.24),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.84)_48%,rgba(0,0,0,0.94)_100%)] md:bg-[radial-gradient(circle_at_72%_18%,rgba(255,106,0,0.22),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.7)_46%,rgba(0,0,0,0.22)_100%)]"
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

      <div className="hidden md:block">
        <HeroFloatingBadges scrollYProgress={scrollYProgress} reducedMotion={shouldReduceMotion} />
      </div>

      <div className="container relative z-10 grid gap-6 px-5 pb-16 pt-24 md:min-h-[92svh] md:grid-cols-[minmax(0,1.05fr)_minmax(17rem,22rem)] md:items-start md:gap-x-10 md:gap-y-6 md:px-6 md:pb-16 md:pt-40 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,26rem)] lg:pt-48">
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : contentY, opacity: shouldReduceMotion ? 1 : contentOpacity }}
          className="min-w-0 space-y-4 will-change-transform md:space-y-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex max-w-full items-center space-x-2 rounded-full border border-orange-500/40 bg-orange-500/20 px-3 py-1.5 text-[11px] font-black leading-4 text-orange-300 md:px-3.5 md:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              <span className="line-clamp-2">{t("home.pulse")}</span>
            </div>
            <OpsTheatreStatusPill onOpenOrientation={onOpenOrientation} showDetails />
          </div>

          <h1 className="max-w-4xl font-sans text-[clamp(2.35rem,11vw,6.8rem)] font-black uppercase leading-[0.86] tracking-[-0.065em] text-white md:leading-[0.82] md:tracking-[-0.075em]">
            <span className="block">{t("home.heroLine1")}</span>
            <span className="block text-primary drop-shadow-[0_12px_35px_rgba(255,85,0,0.4)]">{t("home.heroLine2")}</span>
            <span className="block">{t("home.heroLine3")}</span>
          </h1>

          <p className="max-w-xl text-sm leading-6 text-white/75 md:text-lg md:leading-7">{t("home.heroCopy")}</p>

          <PlainEnglish>{t("home.heroPlain")}</PlainEnglish>

          <HeroRhythmRail />
        </motion.div>

        <motion.div
          style={{ y: shouldReduceMotion ? 0 : stageY }}
          className="relative z-20 w-full will-change-transform md:sticky md:top-28 md:row-span-2"
          onMouseEnter={pauseForPointer}
          onMouseLeave={resumeFromPointer}
          onFocusCapture={pauseForPointer}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resumeFromPointer();
          }}
        >
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label={t("home.heroObjectLabel")}>
            {HERO_LAYER_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={layer === id}
                onClick={() => {
                  setLayer(id);
                  setRotationPaused(true);
                }}
                className={`min-h-10 shrink-0 rounded-full px-3.5 text-[11px] font-black uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  layer === id
                    ? "bg-white text-black"
                    : "border border-white/15 bg-black/45 text-white/70 hover:text-white"
                }`}
              >
                {layerMeta[id].label}
              </button>
            ))}
          </div>

          <TiltCard3D maxTilt={shouldReduceMotion ? 0 : 10} scaleOnHover={1.02}>
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/18 bg-black/55 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("home.live")}</p>
              <div className="relative" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={layer}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <HeroObjectStage
                      layer={layer}
                      moment={featuredMoment}
                      card={card}
                      receipt={receipt}
                      relic={relic}
                      fallbackTitle={t("home.heroTonightFallbackTitle")}
                      fallbackDetail={t("home.heroTonightFallbackDetail")}
                      ticketKicker={t("home.heroTonightKicker")}
                      ticketStub={t("home.heroTonightStub")}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <TactileButton
                  variant="primary"
                  size="sm"
                  asChild
                  className="min-h-11"
                >
                  <Link
                    to={layerMeta[layer].href}
                    onClick={() => rememberMarketingIntent(`hero_object_${layer}`, layerMeta[layer].href, layerMeta[layer].audience)}
                  >
                    {layerMeta[layer].action}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </TactileButton>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    aria-label={t("home.previous")}
                    onClick={() => {
                      setLayer((current) => previousHeroLayer(current));
                      setRotationPaused(true);
                    }}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-primary hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={rotationPaused ? t("home.resume") : t("home.pause")}
                    aria-pressed={rotationPaused}
                    onClick={() => setRotationPaused((paused) => !paused)}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-primary hover:text-primary"
                  >
                    {rotationPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    aria-label={t("home.next")}
                    onClick={() => {
                      setLayer((current) => nextHeroLayer(current));
                      setRotationPaused(true);
                    }}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-primary hover:text-primary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        <div className="min-w-0 md:col-start-1">
          <RoleLens
            roles={roles}
            selectedIndex={roleIndex}
            onSelect={(index) => {
              setRoleIndex(index);
              const picked = roles[index];
              if (picked) rememberMarketingIntent(`hero_role_${index + 1}`, picked.href, ["participant", "participant", "host", "brand"][index]);
            }}
          />
        </div>
      </div>
    </section>
  );
}

function HeroRhythmRail() {
  const { t } = useI18n();
  const steps = [
    { day: t("home.rhythmMon"), title: t("home.rhythmMonTitle") },
    { day: t("home.rhythmWed"), title: t("home.rhythmWedTitle") },
    { day: t("home.rhythmFri"), title: t("home.rhythmFriTitle") },
    { day: t("home.rhythmSun"), title: t("home.rhythmSunTitle") },
  ];

  return (
    <ol className="grid grid-cols-4 gap-1.5 sm:gap-2" aria-label={t("home.heroRhythm")}>
      {steps.map((step, index) => (
        <li key={step.day} className="relative rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-2.5 sm:px-3">
          {index < steps.length - 1 ? (
            <span className="pointer-events-none absolute -right-1.5 top-1/2 hidden h-px w-3 bg-primary/50 sm:block" aria-hidden />
          ) : null}
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-200/80">{step.day}</p>
          <p className="mt-1 text-[11px] font-bold leading-tight text-white sm:text-xs">{step.title}</p>
        </li>
      ))}
    </ol>
  );
}

function HeroObjectStage({
  layer,
  moment,
  card,
  receipt,
  relic,
  fallbackTitle,
  fallbackDetail,
  ticketKicker,
  ticketStub,
}: {
  layer: HeroLayerId;
  moment?: LiveHeroMoment | null;
  card?: LiveHeroCard | null;
  receipt: ReturnType<typeof buildProofReceipt>;
  relic: ReturnType<typeof buildKeepRelic>;
  fallbackTitle: string;
  fallbackDetail: string;
  ticketKicker: string;
  ticketStub: string;
}) {
  if (layer === "tonight" && moment?.image) {
    return (
      <LivingSceneAuraCard
        title={moment.title}
        location={moment.detail}
        imageUrl={moment.image}
        checkInCount={moment.checkIns ?? 0}
        energyLevel={moment.checkIns && moment.checkIns > 20 ? "peak" : "trending"}
        perkText={moment.value}
      />
    );
  }

  if (layer === "tonight") {
    return (
      <TicketPass
        kicker={ticketKicker}
        title={moment?.title || fallbackTitle}
        detail={moment?.detail || fallbackDetail}
        stub={moment?.value || "FRI"}
        stubLabel={ticketStub}
      />
    );
  }

  if (layer === "spend") {
    return (
      <PromoCardFace
        available={card?.available || "$24.00"}
        limit={card?.limit || "$40.00"}
        holder={card?.holder || "Member card"}
        places={card?.places || "Partner shops nearby"}
        className="max-w-none"
      />
    );
  }

  if (layer === "proof") {
    if (moment?.image) {
      return (
        <ProofStampCard
          mediaUrl={moment.image}
          momentTitle={moment.title}
          sceneName={moment.detail}
          verifiedAt={moment.value}
        />
      );
    }
    return <PaperReceipt heading={receipt.heading} lines={receipt.lines} footer={receipt.footer} />;
  }

  return <CollectibleRelic serial={relic.serial} title={relic.title} origin={relic.origin} perk={relic.perk} />;
}
