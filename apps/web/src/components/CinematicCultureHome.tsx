import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { HeroFloatingBadges } from "@/components/hero/HeroFloatingBadges";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Heart,
  MapPin,
  Martini,
  Mountain,
  Music2,
  Trophy,
  Users,
  Utensils,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Coins,
  KeyRound,
  Gift,
  Building2,
  Gem,
  PlayCircle,
  ShieldCheck,
  Store,
  ShoppingBag,
  Tag,
  Compass,
  Flame,
  Sparkles,
  Share2,
} from "lucide-react";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { HomeFeedToggle } from "@/components/feed/HomeFeedToggle";
import { DiscoveriesFeedSection } from "@/components/discovery/DiscoveriesFeedSection";
import { MobilePromoHome, PromoCardGateway } from "@/components/promocard";
import { cultureEvents, cultureScenes } from "@/data/culture-demo";
import { SampleContentNotice } from "@/components/content/ContentProvenance";
import { possessiveLocation, useVisitorLocation } from "@/hooks/useVisitorLocation";
import heroImage from "@/assets/hero-moments.jpg";
import momentConcert from "@/assets/moment-concert.jpg";
import momentFoodFestival from "@/assets/moment-food-festival.jpg";
import momentCoffee from "@/assets/moment-coffee-meetup.jpg";
import momentYoga from "@/assets/moment-yoga.jpg";
import momentArt from "@/assets/moment-art-workshop.jpg";
import hiking from "@/assets/moments/hiking.jpg";
import jazzNight from "@/assets/moments/jazz-night.jpg";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import openMic from "@/assets/moments/open-mic.jpg";
import streetArt from "@/assets/moments/street-art.jpg";
import pottery from "@/assets/moments/pottery.jpg";
import sunsetPhoto from "@/assets/moments/sunset-photo.jpg";
import { MISSION_ARCHETYPES, type MissionArchetype } from "@/lib/mission-archetypes";
import { rememberMarketingIntent } from "@/lib/marketing-attribution";
import { isSampleCommerceListing } from "@/lib/commerce-provenance";
import { getSafeMediaUrl } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { resolveMomentOccurrence } from "@/lib/moment-recurrence";
import { LeadMagnetGateway } from "@/components/LeadMagnetGateway";
import { useI18n } from "@/i18n/I18nContext";
import { OpsTheatreStatusPill } from "@/components/theater/OpsTheatreStatusPill";
import { OpsTheatreOrientationModal } from "@/components/onboarding/OpsTheatreOrientationModal";
import { BrandCaseStudies } from "@/components/brands/BrandCaseStudies";
import { useAuth } from "@/contexts/AuthContext";

type PublicMoment = Tables<"moments"> & { participant_count?: number | null };
type PublicCommerceListing = Tables<"view_public_commerce_directory">;
type PublicContent = Tables<"view_public_content_directory">;
type PublicMission = Pick<Tables<"moment_bounties">, "id" | "title" | "description" | "payout_amount" | "target_category" | "expires_at">;

const vibeCards = [
  { label: "Music Lover", icon: Music2, image: momentConcert, href: "/discover/moments?category=music" },
  { label: "Nightlife", icon: Martini, image: jazzNight, href: "/discover/moments?category=social" },
  { label: "Sports Fan", icon: Trophy, image: openMic, href: "/discover/moments?category=outdoor" },
  { label: "Foodie", icon: Utensils, image: cookingClass, href: "/discover/moments?category=food" },
  { label: "Creative", icon: Camera, image: streetArt, href: "/discover/moments?category=arts" },
  { label: "Networking", icon: Users, image: momentCoffee, href: "/discover/moments?category=networking" },
  { label: "Fitness", icon: Heart, image: momentYoga, href: "/discover/moments?category=fitness" },
  { label: "Outdoor", icon: Mountain, image: hiking, href: "/discover/moments?category=outdoor" },
];

const trendingCards = cultureEvents;

const storyCards = [
  { quote: "Met my girlfriend at Joyride.", name: "Jason T.", handle: "@jason_876", image: momentCoffee },
  { quote: "Found my DJ crew through Promorang.", name: "Nate D.", handle: "@natemix", image: openMic },
  { quote: "Got booked for 8 gigs.", name: "Kemar P.", handle: "@kemarpromo", image: momentConcert },
  { quote: "Found my scene.", name: "Teila R.", handle: "@teilarchie", image: streetArt },
];

const scenes = cultureScenes;
const liveNow = cultureEvents.slice(0, 4);

const commerceFallback = [
  {
    id: "devon-house-tasting-passport",
    kind: "Experience Pass",
    title: "Devon House Tasting Passport (I Scream, Tacbar & Bakery)",
    merchant: "Devon House Courtyard Merchants",
    price: "$18.50 / 250 pts",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800",
    href: "/shop/devon-house-tasting-passport",
  },
  {
    id: "fat-wednesday-vip-pack",
    kind: "VIP Perk",
    title: "FAT Wednesday Jerk Platter & Craft Drink Pack",
    merchant: "Usain Bolt's Tracks & Records",
    price: "$24.00 / 320 pts",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    href: "/shop/fat-wednesday-vip-pack",
  },
  {
    id: "blue-mountain-coffee-flight",
    kind: "Tasting Flight",
    title: "Blue Mountain Grade 1 Coffee & Artisan Pastry Flight",
    merchant: "Cafe Blue & Strawberry Hill",
    price: "$16.00 / 220 pts",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
    href: "/shop/blue-mountain-coffee-flight",
  },
  {
    id: "downtown-artwalk-reggae-pass",
    kind: "Cultural Pass",
    title: "Downtown Artwalk Murals & Bob Marley Museum Pass",
    merchant: "Kingston Creative & Heritage Guild",
    price: "$28.00 / 380 pts",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
    href: "/shop/downtown-artwalk-reggae-pass",
  },
];

const formatCommercePrice = (listing: PublicCommerceListing) => {
  if (listing.discount_value && listing.discount_type?.includes("percentage")) {
    return `${listing.discount_value}% off`;
  }

  if (typeof listing.price === "number") {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: listing.currency || "USD",
      maximumFractionDigits: 2,
    }).format(listing.price);
  }

  if (listing.points_cost) return `${listing.points_cost.toLocaleString()} points`;
  return listing.listing_kind === "service" ? "View service" : "View offer";
};

const commerceKind = (listing: PublicCommerceListing) => {
  if (listing.discount_type || listing.discount_value) return "Deal";
  if (listing.listing_kind === "service") return "Service";
  return "Product";
};

const feedItems = [
  { user: "@thepromoqueen", time: "2m ago", image: momentArt },
  { user: "@iluvhiphopja", time: "5m ago", image: jazzNight },
  { user: "@joyride", time: "12m ago", image: sunsetPhoto },
  { user: "@bmac_876", time: "19m ago", image: pottery },
  { user: "@originja", time: "30m ago", image: momentCoffee },
  { user: "@streetfood", time: "33m ago", image: cookingClass },
];

const creators = [
  { name: "DJ Mac", handle: "djmac876", role: "DJ", followers: "12.4K", image: momentConcert },
  { name: "VisualsByRay", handle: "visualsbyray", role: "Photographer", followers: "8.7K", image: streetArt },
  { name: "ShotByKai", handle: "shotbykai", role: "Videographer", followers: "6.1K", image: openMic },
  { name: "ZJ Chromatic", handle: "zjchromatic", role: "Host", followers: "10.2K", image: jazzNight },
  { name: "NateDawg", handle: "djmac876", role: "Promoter", followers: "5.3K", image: momentCoffee },
  { name: "StyledByTric", handle: "visualsbyray", role: "Designer", followers: "4.3K", image: momentArt },
];

const organizerTools = [
  { icon: CalendarDays, title: "Sell Tickets", text: "Seamless ticketing and payouts." },
  { icon: Heart, title: "Build Scenes", text: "Grow belonging around repeatable moments." },
  { icon: Users, title: "Manage Teams", text: "Organize staff and ambassadors." },
  { icon: Zap, title: "Track Performance", text: "Real-time insight that helps you grow." },
];

const participationTrail = [
  { number: "01", label: "Notice", title: "You see a reason to care.", text: "A creator, place, product, or moment catches your attention." },
  { number: "02", label: "Move", title: "Promorang gives you one clear next step.", text: "Share it, make something, visit, refer, buy, host, or help it happen." },
  { number: "03", label: "Prove", title: "Promorang records what you contributed.", text: "Check-ins, links, submissions, referrals, and verified actions create a receipt." },
  { number: "04", label: "Keep", title: "Your contribution can unlock value.", text: "Build status, earn funded rewards, get better invitations, and qualify for future work." },
];

const roleOffers = [
  {
    icon: Users,
    eyebrow: "I want in",
    title: "Find something worth doing",
    promise: "Start with an open action. See what to do, what counts as proof, and what you may unlock before you join.",
    value: ["Free to begin", "Build a visible record", "Unlock better opportunities"],
    cta: "Find my first action",
    href: "/missions",
    footnote: "No subscription required",
  },
  {
    icon: PlayCircle,
    eyebrow: "I make things",
    title: "Turn attention into movement",
    promise: "Give your audience a next step and collect proof that your work creates action.",
    value: ["Publish creator prompts", "Reward useful supporters", "Show brands what moved"],
    cta: "Build as a creator",
    href: "/auth?mode=signup&role=creator&next=%2Fdashboard%3Ftab%3Dpublish",
    footnote: "Start with one piece of content",
  },
  {
    icon: Store,
    eyebrow: "I host people",
    title: "Make the room easier to fill",
    promise: "Turn a slow hour, launch, event, or repeat ritual into a trackable Moment.",
    value: ["Verify visits", "Prompt customer content", "Give people a reason to return"],
    cta: "Create a Moment",
    href: "/auth?mode=signup&role=merchant&next=/create/moment",
    footnote: "A first Moment can start free",
  },
  {
    icon: Building2,
    eyebrow: "I need an outcome",
    title: "Fund action you can verify",
    promise: "Set the result, fund the pool, and see who created the visits, content, referrals, or sales.",
    value: ["Choose one outcome", "Set a clear budget", "Pay around verified activity"],
    cta: "Plan a brand activation",
    href: "/auth?mode=signup&role=brand&next=%2Foffers%3Ftemplate%3Dpromoshare-funded-cycle",
    footnote: "Scale after the first result",
  },
];

function SectionHeader({
  eyebrow,
  title,
  accent,
  action,
  actionHref = "/discover",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">{eyebrow}</p> : null}
        <h2 className="text-2xl font-black leading-tight tracking-[-0.04em] text-white md:text-4xl">
          {title} {accent ? <span className="text-primary">{accent}</span> : null}
        </h2>
      </div>
      {action ? (
        <Link to={actionHref} className="hidden shrink-0 items-center gap-2 text-sm font-bold text-white/60 transition hover:text-primary sm:inline-flex">
          {action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function ImageCard({
  image,
  children,
  className = "",
}: {
  image: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${className}`}>
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end p-4">{children}</div>
    </div>
  );
}

function SampleOptIn({ onShow, noun, loading = false }: { onShow: () => void; noun: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-10 text-center">
      <p className="text-lg font-black text-white">
        {loading ? `Looking for live ${noun.toLowerCase()}…` : `No live ${noun.toLowerCase()} are available yet.`}
      </p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/50">
        {loading
          ? "This section will update as soon as the live directory responds."
          : "We keep examples separate so it is always clear what is live. You can view labeled samples if you would like to see how this section works."}
      </p>
      {!loading ? (
        <button
          type="button"
          onClick={onShow}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:border-primary hover:text-primary"
        >
          <PlayCircle className="h-4 w-4" />
          Show sample previews
        </button>
      ) : null}
    </div>
  );
}

export default function CinematicCultureHome() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showSamples, setShowSamples] = useState(false);
  const [heroItemIndex, setHeroItemIndex] = useState(0);
  const [heroRotationPaused, setHeroRotationPaused] = useState(false);
  const [heroInteractionPaused, setHeroInteractionPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [selectedRoleArchetype, setSelectedRoleArchetype] = useState<MissionArchetype>("aura");
  const visitorLocation = useVisitorLocation();
  const discoveryQuery = useQuery({
    queryKey: ["homepage-public-discovery"],
    queryFn: async () => {
      const [momentsResult, commerceResult, contentResult, missionsResult] = await Promise.all([
        supabase
          .from("moments")
          .select("*")
          .eq("is_active", true)
          .eq("content_origin", "stakeholder_created")
          .order("starts_at", { ascending: true, nullsFirst: false })
          .limit(4),
        supabase
          .from("view_public_commerce_directory")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false, nullsFirst: false })
          .limit(24),
        supabase
          .from("view_public_content_directory")
          .select("*")
          .order("posted_at", { ascending: false, nullsFirst: false })
          .limit(3),
        supabase
          .from("moment_bounties")
          .select("id,title,description,payout_amount,target_category,expires_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      if (momentsResult.error) throw momentsResult.error;
      if (commerceResult.error) throw commerceResult.error;

      return {
        moments: (momentsResult.data || []) as PublicMoment[],
        commerce: (commerceResult.data || []) as PublicCommerceListing[],
        content: (contentResult.data || []) as PublicContent[],
        missions: (missionsResult.data || []) as PublicMission[],
      };
    },
    staleTime: 60_000,
  });

  const liveCommerceListings = (discoveryQuery.data?.commerce || []).filter((listing) => !isSampleCommerceListing(listing));
  const sampleCommerceListings = (discoveryQuery.data?.commerce || []).filter(isSampleCommerceListing);
  const hasLiveMoments = Boolean(discoveryQuery.data?.moments?.length);
  const hasLiveCommerce = liveCommerceListings.length > 0;

  const homepageMoments = hasLiveMoments
    ? discoveryQuery.data.moments.map((moment, index) => ({
        id: moment.id || `moment-${index}`,
        title: moment.title || "Promorang Moment",
        image: moment.image_url || trendingCards[index % trendingCards.length].image,
        location: moment.venue_name || moment.city || moment.location || "Nearby",
        date: moment.starts_at
          ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "America/Jamaica" }).format(new Date(resolveMomentOccurrence(moment).startsAt))
          : "Coming up",
        reward: moment.reward || `${moment.participant_count || 0} joined`,
        href: `/moments/${moment.id}`,
        isSample: false,
      }))
    : showSamples ? trendingCards.slice(0, 4).map((moment) => ({
        id: moment.momentId,
        title: moment.shortTitle,
        image: moment.image,
        location: moment.place,
        date: moment.date,
        reward: moment.reward || moment.proof,
        href: `/events/${moment.slug}`,
        isSample: true,
      })) : [];

  const homepageCommerce = hasLiveCommerce
    ? liveCommerceListings.slice(0, 4).map((listing, index) => ({
        id: listing.listing_id || listing.source_id || `listing-${index}`,
        kind: commerceKind(listing),
        title: listing.name || "Local offer",
        merchant: listing.merchant_name || listing.venue_name || "Promorang merchant",
        price: formatCommercePrice(listing),
        image: listing.image_url || "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800",
        href: listing.listing_id ? `/shop/${listing.listing_id}` : (listing.source_id ? `/shop/${listing.source_id}` : "/shop"),
        isSample: false,
      }))
    : [];

  const heroItems = [
    ...(discoveryQuery.data?.moments || []).map((moment) => ({
      id: `moment-${moment.id}`, kind: "Moment", title: moment.title || "Live Moment", image: moment.image_url,
      detail: moment.venue_name || moment.city || moment.location || "Location coming soon",
      value: moment.starts_at ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Jamaica" }).format(new Date(resolveMomentOccurrence(moment).startsAt)) : "Coming up",
      href: `/moments/${moment.id}`, action: "View Moment",
    })),
    ...liveCommerceListings.map((listing) => ({
      id: `commerce-${listing.listing_id || listing.source_id}`, kind: commerceKind(listing), title: listing.name || "Local offer", image: listing.image_url,
      detail: listing.merchant_name || listing.venue_name || "Promorang merchant", value: formatCommercePrice(listing),
      href: listing.listing_id ? `/shop/${listing.listing_id}` : "/shop", action: listing.listing_kind === "service" ? "View service" : "View offer",
    })),
    ...(discoveryQuery.data?.content || []).map((content) => ({
      id: `content-${content.id}`, kind: "Content", title: content.title || "Creator signal", image: getSafeMediaUrl(content.media_url),
      detail: content.venue_name || content.platform || "Promorang creator", value: "Worth sharing",
      href: content.slug ? `/content/${content.slug}` : "/content-drops", action: "View content",
    })),
    ...(discoveryQuery.data?.missions || []).map((mission) => ({
      id: `mission-${mission.id}`, kind: "Mission", title: mission.title, image: null,
      detail: mission.target_category || "Open mission", value: mission.payout_amount ? `$${mission.payout_amount} funded` : "Open action",
      href: "/missions", action: "View mission",
    })),
  ].slice(0, 10);
  const activeHeroItem = heroItems[heroItemIndex % Math.max(heroItems.length, 1)];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setShouldReduceMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (heroItems.length < 2 || heroRotationPaused || heroInteractionPaused || shouldReduceMotion || !pageVisible) return;
    const timer = window.setInterval(() => setHeroItemIndex((index) => (index + 1) % heroItems.length), 7000);
    return () => window.clearInterval(timer);
  }, [heroItems.length, heroInteractionPaused, heroRotationPaused, pageVisible, shouldReduceMotion]);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const ambientY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-35px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);
  const cardParallaxY = useTransform(scrollYProgress, [0, 1], ["0px", "45px"]);

  return (
    <main className="min-h-screen bg-black text-white">
      {user ? <HomeFeedToggle /> : null}
      <PromoCardGateway />
      <MobilePromoHome offers={homepageCommerce} moments={homepageMoments} />
      <div className="hidden md:block">
      <section ref={heroRef} className="relative overflow-hidden border-b border-white/10 md:min-h-[92svh]">
        {/* Parallax Background Layer */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : bgY, scale: shouldReduceMotion ? 1 : bgScale }}
          className="absolute inset-0 h-full w-full will-change-transform"
        >
          <img src={heroImage} alt="People gathered around a live culture moment" className="h-full w-full object-cover object-[62%_center]" />
        </motion.div>

        {/* Ambient Gradient Glows with Parallax Motion */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : ambientY }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.22),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.82)_42%,rgba(0,0,0,0.92)_100%)] md:bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.22),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.2)_100%)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        {/* 3D Floating Ecosystem Badges */}
        <div className="hidden md:block">
          <HeroFloatingBadges scrollYProgress={scrollYProgress} reducedMotion={shouldReduceMotion} />
        </div>

        <div className="container relative z-10 flex flex-col px-5 pb-24 pt-24 md:min-h-[92svh] md:justify-start md:px-6 md:pb-16 md:pt-44 lg:pt-52">
          <motion.div
            style={{ y: shouldReduceMotion ? 0 : contentY, opacity: shouldReduceMotion ? 1 : contentOpacity }}
            className="w-full max-w-full space-y-3 will-change-transform md:max-w-4xl md:space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <OpsTheatreStatusPill onOpenOrientation={() => setOrientationOpen(true)} showDetails />
            </div>

            <h2 className="max-w-4xl font-sans text-[clamp(2.45rem,11.5vw,7.5rem)] font-black uppercase leading-[0.86] tracking-[-0.065em] text-white md:leading-[0.82] md:tracking-[-0.075em]">
              <span className="block">{t("home.heroLine1")}</span>
              <span className="block text-primary drop-shadow-[0_12px_35px_rgba(255,85,0,0.4)]">{t("home.heroLine2")}</span>
              <span className="block">{t("home.heroLine3")}</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 md:mt-5 md:text-lg md:leading-7">
              {t("home.heroCopy")}
            </p>
            <p className="hidden mt-3 max-w-xl text-xs font-black uppercase tracking-[0.16em] text-primary sm:block">
              {t("home.heroRhythm")}
            </p>
            <div className="mt-5 grid w-full grid-cols-2 gap-2.5 sm:mt-7 sm:flex sm:max-w-2xl sm:flex-wrap sm:gap-3">
              <Link
                to="/discover"
                onClick={() => rememberMarketingIntent("hero_explore_discover", "/discover", "participant")}
                className="col-span-2 inline-flex min-h-12 min-w-0 items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_16px_40px_rgba(255,85,0,0.3)] transition-all hover:bg-orange-600 active:scale-[0.98] sm:col-auto sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm"
              >
                <Compass className="h-4 w-4" />
                <span>{t("home.exploreMoments")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/hosting"
                onClick={() => rememberMarketingIntent("hero_host_moment", "/hosting", "host")}
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md transition-all hover:border-primary/50 hover:bg-white/[0.1] active:scale-[0.98] sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm sm:tracking-wider"
              >
                <Store className="h-4 w-4 text-amber-400" />
                <span>Host / Venue Pass</span>
              </Link>
              <Link
                to="/for-brands"
                onClick={() => rememberMarketingIntent("hero_brands", "/for-brands", "brand")}
                className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md transition-all hover:border-primary/50 hover:bg-white/[0.1] active:scale-[0.98] sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm sm:tracking-wider"
              >
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>Brands &amp; Retail</span>
              </Link>
            </div>

            {/* Live Social Proof & Outcomes Ticker */}
            <div className="hidden pt-2 flex-wrap items-center gap-3 text-xs sm:flex">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-bold text-white">0 ➔ 230+</span>
                <span className="text-zinc-400">Nightlife Footfall</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">
                <Camera className="w-3.5 h-3.5 text-pink-400" />
                <span className="font-bold text-white">800+</span>
                <span className="text-zinc-400">Expo UGC Signups</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-zinc-400">Proven by</span>
                <span className="font-bold text-white">Lifespan &amp; Sunshine Snacks</span>
              </div>
            </div>
          </motion.div>

          {activeHeroItem ? (
            <motion.div
              style={{ y: shouldReduceMotion ? 0 : cardParallaxY }}
              className="mt-7 w-full max-w-sm md:mt-12 lg:absolute lg:bottom-16 lg:right-6 xl:right-8 will-change-transform z-20"
            >
              <TiltCard3D
                maxTilt={shouldReduceMotion ? 0 : 12}
                scaleOnHover={1.03}
                onMouseEnter={() => setHeroInteractionPaused(true)}
                onMouseLeave={() => setHeroInteractionPaused(false)}
                onFocusCapture={() => setHeroInteractionPaused(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeroInteractionPaused(false);
                }}
              >
                <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/25 bg-black/80 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300">
                  {activeHeroItem.image ? (
                    <img src={activeHeroItem.image} alt="" className="h-28 w-full object-cover sm:h-36" />
                  ) : (
                    <div className="h-24 bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.35),transparent_38%),linear-gradient(135deg,#28160b,#080808)]" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("home.live")}</p>
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300">{activeHeroItem.kind}</span>
                    </div>
                    <Link to={activeHeroItem.href} className="group block">
                      <h2 className="mt-3 text-2xl font-black leading-none tracking-[-0.04em] text-white transition group-hover:text-primary">{activeHeroItem.title}</h2>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                        <span className="min-w-0 truncate text-white/50">{activeHeroItem.detail}</span>
                        <span className="shrink-0 font-bold text-white/80">{activeHeroItem.value}</span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-primary">{activeHeroItem.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                    </Link>
                    {heroItems.length > 1 ? (
                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-[10px] font-bold text-white/35">{heroItemIndex % heroItems.length + 1} / {heroItems.length}</span>
                        <div className="flex gap-2">
                          <button type="button" aria-label={t("home.previous")} onClick={() => setHeroItemIndex((index) => (index - 1 + heroItems.length) % heroItems.length)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-150 hover:border-primary hover:text-primary"><ChevronLeft className="h-4 w-4" /></button>
                          <button type="button" aria-label={heroRotationPaused ? t("home.resume") : t("home.pause")} aria-pressed={heroRotationPaused} onClick={() => setHeroRotationPaused((paused) => !paused)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-150 hover:border-primary hover:text-primary">{heroRotationPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
                          <button type="button" aria-label={t("home.next")} onClick={() => setHeroItemIndex((index) => (index + 1) % heroItems.length)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-150 hover:border-primary hover:text-primary"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </TiltCard3D>
            </motion.div>
          ) : null}
        </div>
      </section>

      <LeadMagnetGateway />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#070707]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,106,0,0.16),transparent_32%)]" />
        <div className="container relative px-6 py-14 md:py-20">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("home.exploreNow")}</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.88] tracking-[-0.06em] md:text-6xl">
                {t("home.gatewayTitle")} <span className="text-primary">{t("home.gatewayAccent")}</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                {t("home.gatewayCopy")}
              </p>
            </div>
            <nav aria-label="Homepage discovery shortcuts" className="flex flex-wrap gap-2">
              {[
                [CalendarDays, t("home.shortcutMoments"), "/discover/moments"],
                [Flame, t("home.shortcutPolls"), "/discover?tab=discoveries"],
                [Compass, t("home.shortcutSpots"), "/discover"],
                [Tag, t("home.shortcutRewards"), "/rewards"],
                [Store, t("home.shortcutMerchants"), "/merchants"],
                [ShoppingBag, t("home.shortcutProducts"), "/shop"],
              ].map(([Icon, label, href]) => {
                const ShortcutIcon = Icon as typeof CalendarDays;
                return (
                  <Link key={href as string} to={href as string} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-4 py-2.5 text-xs font-black text-white/72 transition hover:border-primary/60 hover:bg-primary/10 hover:text-white">
                    <ShortcutIcon className="h-4 w-4 text-primary" />
                    {label as string}
                  </Link>
                );
              })}
            </nav>
          </div>

          <DiscoveriesFeedSection />

          {/* 4 CORE ECOSYSTEM PILLARS */}
          <div className="my-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">The Ecosystem Architecture</p>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">4 Pillars of Promorang</h3>
              </div>
              <span className="hidden sm:inline-block text-xs font-medium text-white/50">From Culture to Shared Wealth</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Moments & Passes */}
              <Link
                to="/discover/moments"
                className="group p-5 rounded-3xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 via-zinc-950 to-zinc-950 hover:border-orange-500 transition-all shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-[10px] font-black uppercase tracking-wider">
                      1. Moments &amp; Passes
                    </span>
                    <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-black text-white group-hover:text-orange-300 transition-colors leading-snug">
                    Access Dope Nights &amp; Fill Venues
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Exclusive guestlist passes, Kingston DJ nights, beach fetes, and dead-night venue revival from 0 to 230+ guests.
                  </p>
                </div>
                <div className="pt-2 text-xs font-black text-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform border-t border-white/5">
                  <span>Explore Moments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Pillar 2: PromoCard & Margin Clearinghouse */}
              <Link
                to="/shop"
                className="group p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-zinc-950 to-zinc-950 hover:border-emerald-500 transition-all shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider">
                      2. PromoCard &amp; Margin
                    </span>
                    <Store className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    Split-Tender Perks at Partner Spots
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Restore promotional spending balance through verified actions and apply eligible value to food, drinks, and retail purchases.
                  </p>
                </div>
                <div className="pt-2 text-xs font-black text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform border-t border-white/5">
                  <span>View Member Perks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Pillar 3: PromoShare & Sponsor Draws */}
              <Link
                to="/promoshare"
                className="group p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 via-zinc-950 to-zinc-950 hover:border-purple-500 transition-all shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-black uppercase tracking-wider">
                      3. PromoShare &amp; Draws
                    </span>
                    <Share2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors leading-snug">
                    WhatsApp Loops &amp; Cash Commissions
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Share drops with 1 tap. Earn instant cash per RSVP and enter sponsor-funded jackpot cycle draws.
                  </p>
                </div>
                <div className="pt-2 text-xs font-black text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform border-t border-white/5">
                  <span>Open PromoShare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Pillar 4: Pieces & AMM Dividends */}
              <Link
                to="/wallet"
                className="group p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 via-zinc-950 to-zinc-950 hover:border-cyan-500 transition-all shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-black uppercase tracking-wider">
                      4. Pieces &amp; Equity
                    </span>
                    <Coins className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    Own a Slice &amp; Collect Dividends
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Hold fractional Pieces of recurring events, media drops, and cultural IP. Earn automated quarterly cash dividends.
                  </p>
                </div>
                <div className="pt-2 text-xs font-black text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform border-t border-white/5">
                  <span>View Pieces Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-9">
            <SectionHeader eyebrow={t("home.secMomentsEyebrow")} title={t("home.secMomentsTitle")} accent={t("home.secMomentsAccent")} action={t("home.secMomentsAction")} actionHref="/discover/moments" />
            {homepageMoments.length ? <div className="grid grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto pb-3 scrollbar-none sm:auto-cols-[45%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
              {homepageMoments.map((moment) => (
                <Link key={moment.id} to={moment.href} className="group">
                  <ImageCard image={moment.image} className="h-72">
                    <div className="mb-auto flex items-start justify-between gap-3">
                      <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">{moment.date}</span>
                      {moment.isSample ? <span className="rounded-md border border-white/15 bg-black/55 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white/55">Preview</span> : null}
                    </div>
                    <h3 className="text-2xl font-black uppercase leading-[0.9] tracking-[-0.055em] transition group-hover:text-primary">{moment.title}</h3>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-3 text-xs text-white/65">
                      <span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> {moment.location}</span>
                      <span className="shrink-0 font-bold text-white">{moment.reward}</span>
                    </div>
                  </ImageCard>
                </Link>
              ))}
            </div> : <SampleOptIn onShow={() => setShowSamples(true)} noun="Moments" loading={discoveryQuery.isLoading} />}
          </div>

          <div className="pt-12">
            <SectionHeader eyebrow={t("home.secDealsEyebrow")} title={t("home.secDealsTitle")} accent={t("home.secDealsAccent")} action={t("home.secDealsAction")} actionHref="/shop" />
            {homepageCommerce.length ? (
              <div className="grid grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto pb-3 scrollbar-none sm:auto-cols-[45%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
                {homepageCommerce.map((listing) => (
                  <Link key={listing.id} to={listing.href} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:-translate-y-1 hover:border-primary/45">
                    <div className="relative h-44 overflow-hidden">
                      <img src={listing.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">{listing.kind}</span>
                      {listing.isSample ? <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/60 px-2 py-1 text-[9px] font-bold uppercase text-white/55">Preview</span> : null}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{listing.merchant}</p>
                      <h3 className="mt-2 text-lg font-black leading-tight text-white transition group-hover:text-primary">{listing.title}</h3>
                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-sm font-bold text-white/75">{listing.price}</span>
                        <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-8 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-4">
                  <Store className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black text-white">Live merchant drops coming soon</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm text-white/60">
                  Verified local merchants, restaurants, and venues are onboarding exclusive passes and special perks.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/for-merchants"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-black transition hover:bg-primary/90"
                  >
                    Claim a Merchant Profile <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/merchants"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Explore Directory
                  </Link>
                </div>
              </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link to="/merchants" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-primary/45">
                <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15"><Store className="h-5 w-5 text-primary" /></span><span><strong className="block text-sm">{t("home.meetMerchantsTitle")}</strong><span className="text-xs text-white/45">{t("home.meetMerchantsDesc")}</span></span></span>
                <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
              </Link>
              <Link to="/rewards" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-primary/45">
                <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15"><Gift className="h-5 w-5 text-primary" /></span><span><strong className="block text-sm">{t("home.claimPerksTitle")}</strong><span className="text-xs text-white/45">{t("home.claimPerksDesc")}</span></span></span>
                <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-primary/20 bg-[#0b0907]">
        <Link to="/pioneers" className="container group grid gap-5 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("home.genesisEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] md:text-3xl">{t("home.genesisTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">{t("home.genesisCopy")}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-primary">{t("home.genesisCta")}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
        </Link>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-zinc-950">
        <img src={momentArt} alt="" className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-20 md:w-1/2 md:opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/50" />
        <div className="container relative z-10 grid gap-10 px-6 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("home.actionsEyebrow")}</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black uppercase leading-[0.88] tracking-[-0.06em] md:text-6xl">
              {t("home.actionsTitle")} <span className="text-primary">{t("home.actionsAccent")}</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 md:text-base">
              {t("home.actionsCopy")}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/missions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-primary/90">
                {t("home.actionsBrowse")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-6 py-4 text-sm font-black uppercase text-white transition hover:border-primary">
                {t("home.actionsJoin")}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            {[
              { icon: CheckCircle2, eyebrow: t("home.act01Eyebrow"), title: t("home.act01Title"), text: t("home.act01Text") },
              { icon: Coins, eyebrow: t("home.act02Eyebrow"), title: t("home.act02Title"), text: t("home.act02Text") },
              { icon: KeyRound, eyebrow: t("home.act03Eyebrow"), title: t("home.act03Title"), text: t("home.act03Text") },
            ].map((step, index) => (
              <div className="contents" key={step.title}>
                <div className={`min-w-0 rounded-2xl border p-4 backdrop-blur md:p-5 ${index === 2 ? "border-primary/35 bg-primary/10" : "border-white/10 bg-black/45"}`}>
                  <step.icon className={`h-5 w-5 ${index === 2 ? "text-primary" : "text-white/50"}`} />
                  <p className="mt-8 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{step.eyebrow}</p>
                  <h3 className="mt-2 text-sm font-black leading-tight md:text-lg">{step.title}</h3>
                  <p className="mt-3 hidden text-xs leading-5 text-white/45 sm:block">{step.text}</p>
                </div>
                {index < 2 ? <ArrowRight className="self-center h-4 w-4 text-white/20" /> : null}
              </div>
            ))}
          </div>

          <div className="lg:col-start-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs text-white/55">
              <Gift className="h-4 w-4 text-primary" />
              {t("home.actionsFreeNotice")}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0a0908]">
        <div className="container px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("home.outcomesEyebrow")}</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] md:text-6xl">
              {t("home.outcomesTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">
              {t("home.outcomesCopy")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Users,
                eyebrow: t("home.roleMemberEyebrow"),
                title: t("home.roleMemberTitle"),
                promise: t("home.roleMemberPromise"),
                value: ["Free to begin", "Build a visible record", "Unlock better opportunities"],
                cta: t("home.roleMemberCta"),
                href: "/missions",
                footnote: t("home.roleMemberFootnote"),
              },
              {
                icon: PlayCircle,
                eyebrow: t("home.roleCreatorEyebrow"),
                title: t("home.roleCreatorTitle"),
                promise: t("home.roleCreatorPromise"),
                value: ["Publish creator prompts", "Reward useful supporters", "Show brands what moved"],
                cta: t("home.roleCreatorCta"),
                href: "/auth?mode=signup&role=creator&next=%2Fdashboard%3Ftab%3Dpublish",
                footnote: t("home.roleCreatorFootnote"),
              },
              {
                icon: Store,
                eyebrow: t("home.roleHostEyebrow"),
                title: t("home.roleHostTitle"),
                promise: t("home.roleHostPromise"),
                value: ["Verify visits", "Prompt customer content", "Give people a reason to return"],
                cta: t("home.roleHostCta"),
                href: "/auth?mode=signup&role=merchant&next=/create/moment",
                footnote: t("home.roleHostFootnote"),
              },
              {
                icon: Building2,
                eyebrow: t("home.roleBrandEyebrow"),
                title: t("home.roleBrandTitle"),
                promise: t("home.roleBrandPromise"),
                value: ["Choose one outcome", "Set a clear budget", "Pay around verified activity"],
                cta: t("home.roleBrandCta"),
                href: "/auth?mode=signup&role=brand&next=%2Foffers%3Ftemplate%3Dpromoshare-funded-cycle",
                footnote: t("home.roleBrandFootnote"),
              },
            ].map((offer, index) => (
              <article
                key={offer.title}
                className={`flex min-h-[430px] flex-col rounded-3xl border p-5 ${
                  index === 0
                    ? "border-primary/45 bg-gradient-to-b from-primary/16 to-white/[0.035] shadow-[0_28px_80px_rgba(255,106,0,0.08)]"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/35">
                    <offer.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">{offer.eyebrow}</span>
                </div>
                <h3 className="mt-8 text-2xl font-black leading-tight tracking-[-0.035em]">{offer.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{offer.promise}</p>
                <ul className="mt-6 space-y-3">
                  {offer.value.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link
                    to={offer.href}
                    onClick={() => rememberMarketingIntent(`role_offer_${index + 1}`, offer.href, ["participant", "creator", "merchant", "brand"][index])}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-xs font-black uppercase transition ${index === 0 ? "bg-primary text-white hover:bg-primary/90" : "border border-white/18 bg-black/30 text-white hover:border-primary hover:text-primary"}`}
                  >
                    {offer.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/28">{offer.footnote}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROVEN TRACK RECORD & ENTERPRISE CASE STUDIES */}
      <BrandCaseStudies />

      <section className="border-b border-white/10 bg-black">
        <div className="container px-6 py-12 md:py-16">
          <SectionHeader eyebrow={t("home.archetypeEyebrow")} title={t("home.archetypeTitle")} accent={t("home.archetypeAccent")} />
          <p className="-mt-2 mb-7 max-w-2xl text-sm leading-6 text-white/50">
            {t("home.archetypeCopy")}
          </p>

          {/* Interactive Role Tab Bar */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
            {(Object.keys(MISSION_ARCHETYPES) as MissionArchetype[]).map((key) => {
              const role = MISSION_ARCHETYPES[key];
              const Icon = role.icon;
              const isSelected = selectedRoleArchetype === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRoleArchetype(key)}
                  className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition shrink-0 ${
                    isSelected
                      ? "border-primary bg-primary/15 text-white ring-1 ring-primary/40 shadow-glow-sm"
                      : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition ${isSelected ? "text-primary scale-110" : "text-white/40 group-hover:text-white/70"}`} />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Spotlight Active Archetype Deep-Dive Card */}
          {(() => {
            const activeRole = MISSION_ARCHETYPES[selectedRoleArchetype] || MISSION_ARCHETYPES.aura;
            const ActiveIcon = activeRole.icon;
            const isAura = selectedRoleArchetype === "aura";

            return (
              <div
                className={`relative mt-2 overflow-hidden rounded-3xl border p-6 md:p-8 transition-all ${
                  isAura
                    ? "border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/10 via-black to-primary/10"
                    : "border-white/15 bg-gradient-to-br from-white/[0.06] via-black to-white/[0.02]"
                }`}
              >
                {/* Background Ambient Glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

                <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                  {/* Left Column: Role Identity & Core Purpose */}
                  <div className="space-y-4 lg:col-span-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${activeRole.tone}`}>
                        <ActiveIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{activeRole.verb}</span>
                        <h3 className="text-3xl font-black uppercase tracking-[-0.04em] text-white">{activeRole.label}</h3>
                      </div>
                    </div>

                    <p className="text-base font-medium leading-relaxed text-white/85">
                      {activeRole.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/80">
                        <Tag className="h-3 w-3 text-primary" /> {activeRole.actionType}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                        <Coins className="h-3 w-3" /> {activeRole.rewardRange}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/60">
                        <Users className="h-3 w-3 text-white/40" /> {activeRole.targetPersona}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Concrete Action & Verification Box */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-6">
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Real-World Action Example</p>
                        <p className="mt-1 text-sm font-semibold text-white/95">{activeRole.exampleAction}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 border-t border-white/10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Proof Method</p>
                          <p className="mt-0.5 font-medium text-white/80">{activeRole.proofMethod}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Privacy Policy</p>
                          <p className="mt-0.5 inline-flex items-center gap-1 font-medium text-white/80">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{activeRole.cameraPrivacy}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                          <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                          <span>Earn Points to unlock exclusive Key opportunities</span>
                        </div>
                        <Link
                          to={`/missions?role=${selectedRoleArchetype}`}
                          onClick={() => rememberMarketingIntent(`archetype_spotlight_${selectedRoleArchetype}`, `/missions?role=${selectedRoleArchetype}`, "participant")}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-primary/90 hover:scale-[1.02]"
                        >
                          Explore {activeRole.label} Missions
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick-Cards Rail for Direct Role Browsing */}
          <div className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none">
            {Object.entries(MISSION_ARCHETYPES).map(([id, role]) => {
              const RoleIcon = role.icon;
              const isCurrent = selectedRoleArchetype === id;
              const aura = id === "aura";
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRoleArchetype(id as MissionArchetype)}
                  className={`group text-left relative min-w-[70%] sm:min-w-[240px] md:min-w-[260px] snap-start overflow-hidden rounded-2xl border p-4 transition ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-glow-sm ring-1 ring-primary/40"
                      : aura
                      ? "border-fuchsia-400/30 bg-white/[0.04] hover:border-fuchsia-400/60"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="relative flex items-start justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${role.tone}`}>
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300/90">{role.rewardRange}</span>
                  </div>
                  <p className="relative mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/35">{role.verb}</p>
                  <h3 className="relative mt-0.5 text-xl font-black uppercase tracking-[-0.03em] text-white">{role.label}</h3>
                  <p className="relative mt-2 line-clamp-2 text-[11px] leading-4 text-white/50">{role.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {showSamples ? <>
      <div className="container px-6 py-12 md:py-16">
        <SampleContentNotice noun="moments, scenes, and activity" className="mb-8" />
        <SectionHeader eyebrow="Find your vibe" title="What are you" accent="into?" />
        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
          {vibeCards.map((vibe) => (
            <Link key={vibe.label} to={vibe.href} className="group min-w-[132px] md:min-w-[168px]">
              <ImageCard image={vibe.image} className="h-36 md:h-44">
                <vibe.icon className="mb-5 h-8 w-8 text-white drop-shadow" />
                <p className="text-sm font-black text-white">{vibe.label}</p>
              </ImageCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="container px-6 py-6 md:py-10">
        <SectionHeader eyebrow="The cultural pulse" title="Trending" accent="this week" action="View all" />
        <div className="grid grid-flow-col auto-cols-[72%] gap-4 overflow-x-auto pb-3 scrollbar-none sm:auto-cols-[42%] lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible">
          {trendingCards.map((card) => (
            <Link key={card.slug} to={`/events/${card.slug}`}>
              <ImageCard image={card.image} className="h-56">
                <span className="mb-auto w-fit rounded-md bg-red-600 px-2 py-1 text-[10px] font-black uppercase">{card.date}</span>
                <h3 className="text-3xl font-black uppercase leading-[0.82] tracking-[-0.06em]">{card.shortTitle}</h3>
                <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/70">
                  <span>{card.city}</span>
                  <span className="text-primary">{card.proof}</span>
                </div>
              </ImageCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="container px-6 py-6 md:py-10">
        <SectionHeader eyebrow="Real people. Real stories." title="This is why we show up." />
        <div className="grid grid-flow-col auto-cols-[82%] gap-4 overflow-x-auto pb-3 scrollbar-none md:auto-cols-[38%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
          {storyCards.map((story) => (
            <ImageCard key={story.name} image={story.image} className="h-44">
              <p className="max-w-[14rem] text-xl font-black leading-tight">"{story.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-primary/30" />
                <div>
                  <p className="text-sm font-bold">{story.name}</p>
                  <p className="text-xs text-white/60">{story.handle}</p>
                </div>
              </div>
            </ImageCard>
          ))}
        </div>
      </div>

      <div className="container px-6 py-6 md:py-10">
        <SectionHeader eyebrow="Scenes" title="More than moments. Find your" accent="scene." action="Explore all scenes" />
        <div className="grid grid-flow-col auto-cols-[48%] gap-3 overflow-x-auto pb-3 scrollbar-none md:auto-cols-[24%] lg:grid-flow-row lg:grid-cols-7 lg:overflow-visible">
          {scenes.map((scene) => (
            <Link key={scene.slug} to={`/scenes/${scene.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition hover:border-primary/50">
              <ImageCard image={scene.image} className="h-28 rounded-xl">
                <h3 className="text-xl font-black uppercase leading-none tracking-[-0.05em]">{scene.title}</h3>
              </ImageCard>
              <p className="mt-2 text-center text-xs font-bold text-white/70">{scene.momentsHosted} moments</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="container px-6 py-6 md:py-10">
        <SectionHeader eyebrow="Live right now" title="Happening in" accent="Kingston" action="View all live moments" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {liveNow.map((item) => (
            <Link key={item.slug} to={`/events/${item.slug}`}>
              <ImageCard image={item.image} className="h-52">
                <span className="mb-auto w-fit rounded-md bg-red-600 px-2 py-1 text-[10px] font-black uppercase">Live</span>
                <h3 className="text-3xl font-black uppercase leading-none tracking-[-0.06em]">{item.shortTitle}</h3>
                <p className="mt-2 text-sm text-white/75">
                  <span className="text-2xl font-black text-white">{item.attending}</span> people in motion
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/60"><MapPin className="h-3 w-3 text-primary" /> {item.city}</p>
              </ImageCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="container px-6 py-6 md:py-10">
        <SectionHeader eyebrow="The feed" title="Every" accent="moment. All in one place." action="Explore the feed" />
        <div className="grid grid-flow-col auto-cols-[42%] gap-4 overflow-x-auto pb-3 scrollbar-none md:auto-cols-[22%] lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
          {feedItems.map((item) => (
            <Link key={item.user} to="/pulse">
              <ImageCard image={item.image} className="aspect-[4/5]">
                <div className="mb-auto ml-auto rounded-full bg-black/50 p-2">
                  <Camera className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold">{item.user}</p>
                <p className="text-xs text-white/60">{item.time}</p>
              </ImageCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="container px-6 py-6 md:py-10">
        <SectionHeader eyebrow="Creators" title="The culture" accent="makers." action="Discover more creators" />
        <div className="grid grid-flow-col auto-cols-[72%] gap-3 overflow-x-auto pb-3 scrollbar-none md:auto-cols-[28%] lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
          {creators.map((creator) => (
            <Link key={creator.name} to={`/creators/${creator.handle}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 transition hover:border-primary/50">
              <img src={creator.image} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{creator.name}</p>
                <p className="truncate text-xs text-white/60">{creator.role}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{creator.followers} followers</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          ))}
        </div>
      </div>

      </> : null}

      <section className="container px-6 py-16 md:py-24">
        <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-10 lg:p-14">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("home.faqEyebrow")}</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-6xl">
              {t("home.faqTitle")}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/52">
              {t("home.faqCopy")}
            </p>
            <Link
              to="/economy"
              onClick={() => rememberMarketingIntent("objection_economy_explainer", "/economy")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/18 px-5 py-3 text-sm font-black transition hover:border-primary hover:text-primary"
            >
              {t("home.faqReadGuide")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/10 border-t border-white/10 bg-white/[0.025] lg:border-l lg:border-t-0">
            {[
              [t("home.faq1Q"), t("home.faq1A")],
              [t("home.faq2Q"), t("home.faq2A")],
              [t("home.faq3Q"), t("home.faq3A")],
              [t("home.faq4Q"), t("home.faq4A")],
            ].map(([question, answer]) => (
              <details key={question} className="group p-5 open:bg-white/[0.025] md:p-7">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">
                  {question}
                  <span className="text-xl font-light text-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/48">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-10 overflow-hidden border-y border-white/10 bg-white/[0.03]">
        <img src={momentConcert} alt="" className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-45 md:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
        <div className="container relative z-10 grid gap-10 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">{t("home.orgEyebrow")}</p>
            <h2 className="max-w-md text-4xl font-black leading-[0.9] tracking-[-0.06em] md:text-6xl">
              {t("home.orgTitle")} <br />{t("home.orgLine2")} <span className="text-primary">{t("home.orgAccent")}</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">{t("home.orgCopy")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: CalendarDays, title: t("home.orgTool1Title"), text: t("home.orgTool1Text") },
              { icon: Heart, title: t("home.orgTool2Title"), text: t("home.orgTool2Text") },
              { icon: Users, title: t("home.orgTool3Title"), text: t("home.orgTool3Text") },
              { icon: Zap, title: t("home.orgTool4Title"), text: t("home.orgTool4Text") },
            ].map((tool) => (
              <div key={tool.title} className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                <tool.icon className="mb-4 h-7 w-7 text-white" />
                <h3 className="text-sm font-black">{tool.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/55">{tool.text}</p>
              </div>
            ))}
          </div>
          <div className="md:col-start-2">
            <Link
              to="/auth?mode=signup&role=host&next=/create/moment"
              onClick={() => rememberMarketingIntent("organizer_create_moment", "/create/moment", "host")}
              className="inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-4 text-sm font-black uppercase text-white transition hover:bg-primary/90"
            >
              {t("home.orgCta")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      </div>

      {user ? <MobileBottomNav /> : null}

      {/* Ops Theatre Stakeholder Orientation Modal */}
      <OpsTheatreOrientationModal
        isOpen={orientationOpen}
        onClose={() => setOrientationOpen(false)}
      />
    </main>
  );
}
