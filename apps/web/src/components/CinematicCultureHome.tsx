import { Link } from "react-router-dom";
import type { ReactNode } from "react";
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
} from "lucide-react";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { cultureEvents, cultureScenes } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";
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

function SectionHeader({
  eyebrow,
  title,
  accent,
  action,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  action?: string;
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
        <Link to="/discover" className="hidden shrink-0 items-center gap-2 text-sm font-bold text-white/60 transition hover:text-primary sm:inline-flex">
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

export default function CinematicCultureHome() {
  const visitorLocation = useVisitorLocation();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-[92svh] overflow-hidden border-b border-white/10">
        <img src={heroImage} alt="People gathered around a live culture moment" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.2),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.82)_42%,rgba(0,0,0,0.92)_100%)] md:bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.18),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.72)_45%,rgba(0,0,0,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="container relative z-10 flex min-h-[92svh] flex-col justify-center px-6 pb-16 pt-24 md:justify-start md:pt-44 lg:pt-52">
          <div className="w-full max-w-[calc(100vw-3rem)] md:max-w-4xl">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-white/80" aria-live="polite">
              {visitorLocation === "Global" ? "Global culture" : `${possessiveLocation(visitorLocation)} culture`}. Your moment.
            </p>
            <h1 className="max-w-4xl font-sans text-[clamp(2.95rem,10vw,8.2rem)] font-black uppercase leading-[0.78] tracking-[-0.085em] text-white md:leading-[0.75]">
              <span className="block">Show up to</span>
              <span className="block text-primary drop-shadow-[0_12px_35px_rgba(255,106,0,0.35)]">something</span>
              <span className="block text-primary drop-shadow-[0_12px_35px_rgba(255,106,0,0.35)]">bigger</span>
            </h1>
            <p className="mt-7 max-w-[calc(100vw-3rem)] text-base leading-7 text-white/80 md:max-w-xl md:text-lg">
              Discover moments, scenes, creators, and culture happening around you. Show up, prove the moment, and unlock what comes next.
            </p>
            <div className="mt-9 flex w-full max-w-[calc(100vw-3rem)] flex-col gap-3 sm:max-w-xl sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex min-w-0 max-w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-4 text-xs font-black uppercase tracking-[-0.01em] text-white shadow-[0_20px_60px_rgba(255,106,0,0.25)] transition hover:bg-primary/90 sm:px-6 sm:text-sm"
              >
                Join the movement
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/discover/moments"
                className="inline-flex min-w-0 max-w-full items-center justify-center gap-3 rounded-xl border border-white/25 bg-black/30 px-5 py-4 text-xs font-black uppercase tracking-[-0.01em] text-white transition hover:border-primary hover:text-primary sm:px-6 sm:text-sm"
              >
                Discover moments
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-12 w-full max-w-xs border-l border-white/20 pl-5 text-sm text-white/75 lg:absolute lg:bottom-28 lg:right-16">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Preview what can trend</p>
              <ContentProvenanceBadge compact />
            </div>
            {trendingCards.map((item) => (
              <Link key={item.slug} to={`/events/${item.slug}`} className="flex items-center gap-2 py-1.5 transition hover:text-primary">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                {item.shortTitle}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-primary/20 bg-[#0b0907]">
        <Link to="/pioneers" className="container group grid gap-5 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Genesis Season · Now recording</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] md:text-3xl">Your early contribution should not disappear.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">Create, host, welcome, participate, or bring the right people. Pioneer Points keep the verified receipt.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-black text-primary">Enter Genesis Season<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
        </Link>
      </section>

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

      <section className="relative mt-10 overflow-hidden border-y border-white/10 bg-white/[0.03]">
        <img src={momentConcert} alt="" className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-45 md:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
        <div className="container relative z-10 grid gap-10 px-6 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">For organizers</p>
            <h2 className="max-w-md text-4xl font-black leading-[0.9] tracking-[-0.06em] md:text-6xl">
              Build it. <br />We'll help you <span className="text-primary">make it happen.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">Create moments. Build scenes. Grow your brand. All in one place.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {organizerTools.map((tool) => (
              <div key={tool.title} className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
                <tool.icon className="mb-4 h-7 w-7 text-white" />
                <h3 className="text-sm font-black">{tool.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/55">{tool.text}</p>
              </div>
            ))}
          </div>
          <div className="md:col-start-2">
            <Link to="/create/moment" className="inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-4 text-sm font-black uppercase text-white transition hover:bg-primary/90">
              Get started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
