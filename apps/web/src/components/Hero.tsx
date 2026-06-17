import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Gift, KeyRound, MapPin, PlayCircle, ShieldCheck, Sparkles, Star, Ticket, Trophy, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { demoMoments } from "@/data/demo-moments";
import heroImage from "@/assets/hero-moments.jpg";

const heroMarks = [
  { icon: MapPin, label: "Find a Moment", detail: "Pop-ups, rituals, drops, gatherings" },
  { icon: Star, label: "Leave your Mark", detail: "Check in when you show up" },
  { icon: Gift, label: "Unlock more", detail: "Perks, access, pieces, PromoShare" },
];

const valueSignals = [
  { icon: Ticket, label: "PromoShare reward cycles" },
  { icon: KeyRound, label: "Keys and pieces unlock better access" },
  { icon: Users, label: "Grow your network and local standing" },
];

type HeroSlide = {
  id: string;
  category: string;
  title: string;
  place: string;
  reward: string;
  marks: string;
  href: string;
  icon: typeof CalendarDays;
  imageUrl?: string | null;
};

const fallbackMomentSlides: HeroSlide[] = [
  {
    id: "fallback-moment-1",
    category: "Tonight",
    title: "Sunset Table at Golden Hour",
    place: "Harbor House",
    reward: "+50 pts, cafe perk, early piece eligibility",
    marks: "18 Marks left",
    href: "/explore/moments",
    icon: CalendarDays,
  },
  {
    id: "fallback-moment-2",
    category: "Drop",
    title: "Founder's Rack Preview",
    place: "North Block Supply",
    reward: "Early access, sample credit, PromoShare progress",
    marks: "12 invites",
    href: "/explore/moments",
    icon: Ticket,
  },
  {
    id: "fallback-moment-3",
    category: "Power Up",
    title: "Coffee Regular Challenge",
    place: "Roast Yard",
    reward: "Become known, unlock a private tasting",
    marks: "3 visits to unlock",
    href: "/explore/moments",
    icon: Trophy,
  },
];

const fallbackContentSlides: HeroSlide[] = [
  {
    id: "fallback-content-1",
    category: "Watch & Unlock",
    title: "Hidden Roast Route",
    place: "Creator story to Central Cafe",
    reward: "Watch, visit, check in, unlock Founder Roast",
    marks: "Story-led mission",
    href: "/watch-unlock",
    icon: PlayCircle,
  },
  {
    id: "fallback-content-2",
    category: "Creator Mission",
    title: "Plaza Sessions Episode 04",
    place: "Maya Stone x Fountain Plaza",
    reward: "Unlock the codeword, verify on site, mint the memory",
    marks: "O2O unlock",
    href: "/watch-unlock",
    icon: PlayCircle,
  },
  {
    id: "fallback-content-3",
    category: "Content Drop",
    title: "Skincare Route Reveal",
    place: "Creator story to The Glow House",
    reward: "Watch the route, book the service window, earn perks",
    marks: "Content to place",
    href: "/watch-unlock",
    icon: PlayCircle,
  },
];

function formatTimeLabel(startsAt?: string | null) {
  if (!startsAt) return "Mark-ready";

  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "Mark-ready";

  const today = new Date();
  const isToday = start.toDateString() === today.toDateString();
  const time = start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return isToday ? `Today ${time}` : start.toLocaleDateString([], { month: "short", day: "numeric" });
}

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideMode, setSlideMode] = useState<"moments" | "content">("moments");

  const { data: liveMomentSlides } = useQuery({
    queryKey: ["hero-power-moments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("id, title, location, venue_name, starts_at, max_participants, reward, category, moment_archetype, image_url, banner_image_url, is_active")
        .eq("is_active", true)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5);

      if (error) throw error;

      const moments = data || [];
      const participantCounts = new Map<string, number>();

      if (moments.length > 0) {
        const { data: participantRows, error: participantError } = await supabase
          .from("moment_participants")
          .select("moment_id");

        if (participantError) throw participantError;

        for (const row of participantRows || []) {
          participantCounts.set(row.moment_id, (participantCounts.get(row.moment_id) || 0) + 1);
        }
      }

      return moments.map((moment: any): HeroSlide => {
        const capacity = Number(moment.max_participants || 0);
        const participants = participantCounts.get(moment.id) || 0;
        const spotsLeft = capacity > 0 ? Math.max(capacity - participants, 0) : null;

        return {
          id: moment.id,
          category: moment.moment_archetype || moment.category || "Moment",
          title: moment.title,
          place: moment.venue_name || moment.location || "Promorang Moment",
    reward: moment.reward || "+50 pts, Mark progress, early piece eligibility",
          marks: spotsLeft !== null ? `${spotsLeft} spots left` : formatTimeLabel(moment.starts_at),
          href: `/moments/${moment.id}`,
          icon: CalendarDays,
          imageUrl: moment.banner_image_url || moment.image_url,
        };
      });
    },
    retry: 0,
  });

  const { data: contentSlides } = useQuery({
    queryKey: ["hero-content-missions"],
    queryFn: async () => {
      const client = supabase as any;
      const { data: links, error: linksError } = await client
        .from("content_moment_links")
        .select("id, content_item_id, moment_id, physical_unlock_rules, o2o_conversion_rate, is_sponsored, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (linksError) throw linksError;
      if (!links?.length) return [];

      const contentIds = [...new Set(links.map((link: any) => link.content_item_id).filter(Boolean))];
      const momentIds = [...new Set(links.map((link: any) => link.moment_id).filter(Boolean))];

      const [{ data: contentItems }, { data: moments }] = await Promise.all([
        client
          .from("content_items")
          .select("id, title, description, platform, creator_name, media_url, thumbnail_url, banner_image_url")
          .in("id", contentIds),
        client
          .from("moments")
          .select("id, title, venue_name, location, reward, image_url, banner_image_url")
          .in("id", momentIds),
      ]);

      return links
        .map((link: any): HeroSlide | null => {
          const content = (contentItems || []).find((item: any) => item.id === link.content_item_id);
          const moment = (moments || []).find((item: any) => item.id === link.moment_id);
          if (!content) return null;

          return {
            id: link.id,
            category: link.is_sponsored ? "Sponsored Story" : content.platform || "Content Mission",
            title: content.title || moment?.title || "Creator Mission",
            place: moment?.venue_name || moment?.location || content.creator_name || "Creator-led unlock",
            reward:
              link.physical_unlock_rules?.summary ||
              moment?.reward ||
              "Watch the story, move into the moment, unlock the reward loop",
            marks: link.o2o_conversion_rate ? `${Number(link.o2o_conversion_rate).toFixed(1)}% O2O` : "Watch & unlock",
            href: `/watch-unlock/${link.id}`,
            icon: PlayCircle,
            imageUrl: content.banner_image_url || content.thumbnail_url || content.media_url || moment?.banner_image_url || moment?.image_url,
          };
        })
        .filter(Boolean);
    },
    retry: 0,
  });

  const momentSlides = liveMomentSlides?.length
    ? liveMomentSlides
    : demoMoments.slice(0, 3).map((moment: any): HeroSlide => ({
      id: moment.id,
      category: moment.moment_archetype || moment.category || "Moment",
      title: moment.title,
      place: moment.venue_name || moment.location,
      reward: moment.reward || "+50 pts, Mark progress, early piece eligibility",
      marks: moment.max_participants ? `${Math.max(moment.max_participants - (moment.participant_count || 0), 0)} spots left` : "Mark-ready",
      href: `/moments/${moment.id}`,
      icon: CalendarDays,
      imageUrl: (moment as any).banner_image_url || moment.image_url,
    }));

  const slides = slideMode === "moments"
    ? (momentSlides.length ? momentSlides : fallbackMomentSlides)
    : (contentSlides?.length ? contentSlides : fallbackContentSlides);

  const activeMoment = slides[activeSlide] || slides[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setActiveSlide(0);
  }, [slideMode]);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-charcoal pt-20 text-white">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="People gathered at a real-world moment"
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,12,12,0.94)_0%,rgba(12,12,12,0.78)_46%,rgba(12,12,12,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="absolute left-1/2 top-24 z-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-16 right-0 z-0 h-96 w-96 rounded-full bg-accent/15 blur-[120px]" />

      <div className="container relative z-10 px-6 py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Real life has rewards now</span>
            </div>

            <h1 className="mb-6 max-w-4xl font-serif text-5xl font-bold leading-[0.98] text-white animate-slide-up md:text-7xl lg:text-8xl">
              Show up.
              <br />
              Get known.
              <br />
              <span className="text-primary">Unlock more.</span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-8 text-zinc-200 animate-slide-up md:text-xl" style={{ animationDelay: "0.1s" }}>
              Promorang helps you find real moments worth leaving the house for.
              Attend, leave your Mark, and turn showing up into perks, access,
              community standing, and qualified earnings.
            </p>

            <div className="mb-10 grid max-w-3xl gap-3 animate-slide-up sm:grid-cols-3" style={{ animationDelay: "0.15s" }}>
              {heroMarks.map((item, index) => (
                <div key={item.label} className="relative rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                  {index < heroMarks.length - 1 && (
                    <div className="absolute left-[calc(100%-0.25rem)] top-1/2 hidden h-px w-8 bg-primary/70 sm:block" />
                  )}
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-300">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 animate-slide-up sm:flex-row sm:items-center" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" asChild data-tour="discover-link">
                <Link to="/explore/moments">
                  Find Moments Near You
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/25 bg-white/5 text-white hover:bg-white/[0.12] hover:text-white" asChild>
                <Link to="/why-join">Why Join?</Link>
              </Button>
            </div>

            <div className="mt-10 flex max-w-3xl flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "0.35s" }}>
              {valueSignals.map((signal) => (
                <div key={signal.label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-sm text-zinc-200 backdrop-blur">
                  <signal.icon className="h-4 w-4 text-primary" />
                  {signal.label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-[70px]" />
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/45 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Power Moment</p>
                  <p className="mt-1 text-sm text-zinc-300">{slideMode === "moments" ? "Live moments opening next" : "Stories that unlock places"}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <activeMoment.icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-xl border border-white/10 bg-black/25 p-1">
                {(["moments", "content"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSlideMode(mode)}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${slideMode === mode ? "bg-primary text-primary-foreground" : "text-zinc-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    {mode === "moments" ? "Moments" : "Content"}
                  </button>
                ))}
              </div>

              <div className="relative min-h-[250px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                {activeMoment.imageUrl ? (
                  <img
                    src={activeMoment.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,8,3,0.72)_0%,rgba(18,8,3,0.64)_44%,rgba(18,8,3,0.9)_100%)]" />
                <div className="relative z-10">
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary backdrop-blur">
                      {activeMoment.category}
                    </span>
                    <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-bold text-zinc-200 backdrop-blur">{activeMoment.marks}</span>
                  </div>

                  <h2 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                    {activeMoment.title}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-zinc-200">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{activeMoment.place}</span>
                  </div>
                  <div className="mt-7 rounded-xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                    <div className="flex items-start gap-3">
                      <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300">Unlock path</p>
                        <p className="mt-1 text-sm font-semibold text-white">{activeMoment.reward}</p>
                        <Link to={activeMoment.href} className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary hover:text-primary/80">
                          Open {slideMode === "moments" ? "Moment" : "Mission"}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={`Show ${slide.title}`}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${activeSlide === index ? "w-8 bg-primary" : "w-2.5 bg-white/25 hover:bg-white/40"}`}
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-zinc-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Mark-ready
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-5xl border-t border-white/15 pt-6 md:mt-16">
          <div className="grid gap-4 text-zinc-300 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
              The Mark is the new RSVP
            </p>
            <p className="text-sm leading-6 md:text-base">
              For people, it means getting remembered, rewarded, and invited back.
              For hosts, venues, and brands, it becomes the signal that real community is forming.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
