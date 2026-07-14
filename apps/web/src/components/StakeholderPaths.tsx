import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarPlus,
  Megaphone,
  PlayCircle,
  Store,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const paths = [
  {
    id: "participant",
    label: "I want things to do",
    audience: "Explorer",
    headline: "Find good reasons to go out.",
    copy: "Discover nearby experiences, check in when you arrive, and build a record of the places and communities you support. Showing up can lead to perks, invitations, recognition, and earning opportunities.",
    cta: "Find Moments",
    href: "/explore/moments",
    signupHref: "/auth?role=participant",
    icon: Ticket,
    metric: "Mark",
    metricLabel: "a verified check-in",
    valueNow: "See what is worth doing near you",
    whyItMatters: "Your first check-in starts a record that can unlock access, perks, and invitations.",
    outcomes: ["Find better plans", "Unlock useful rewards", "Get invited back"],
  },
  {
    id: "host",
    label: "I bring people together",
    audience: "Host",
    headline: "Build the room people return to.",
    copy: "Create experiences for your community, manage attendance, and show venues or sponsors that people genuinely turn up and return.",
    cta: "Start Hosting",
    href: "/host",
    signupHref: "/auth?role=host",
    icon: CalendarPlus,
    metric: "Room",
    metricLabel: "a community you grow",
    valueNow: "Create a moment people can join",
    whyItMatters: "Verified turnout gives you proof, repeat attendance, and sponsor-ready momentum.",
    outcomes: ["Fill the room", "Build community trust", "Become sponsor-ready"],
  },
  {
    id: "venue",
    label: "I run a place or shop",
    audience: "Venue / Merchant",
    headline: "Turn your space into somewhere people come back to.",
    copy: "Create tastings, drops, special events, and repeat-visit rewards that bring people through the door and give them a reason to come back.",
    cta: "Register Your Spot",
    href: "/for-merchants",
    signupHref: "/auth?role=merchant",
    icon: Store,
    metric: "Visit",
    metricLabel: "a real customer visit",
    valueNow: "Turn your place into a destination",
    whyItMatters: "Moments give customers a reason to visit, verify, return, and remember you.",
    outcomes: ["Bring in more visits", "Reward good customers", "Encourage repeat business"],
  },
  {
    id: "brand",
    label: "I represent a brand",
    audience: "Brand",
    headline: "Become the reason people show up.",
    copy: "Support experiences and rewards people actually want, then measure who attended, redeemed, created content, and stayed engaged after the campaign.",
    cta: "Sponsor a Moment",
    href: "/for-brands",
    signupHref: "/auth?role=brand",
    icon: Building2,
    metric: "Proof",
    metricLabel: "of real-world action",
    valueNow: "Sponsor real-world action",
    whyItMatters: "You get proof of attendance, redemption, content, and community lift.",
    outcomes: ["Reach real communities", "Measure real outcomes", "Build lasting goodwill"],
  },
  {
    id: "creator",
    label: "I create content",
    audience: "Creator",
    headline: "Turn stories into movement.",
    copy: "Connect your content to real places and experiences so your audience can watch, join, unlock rewards, and turn attention into measurable action.",
    cta: "Create a Prompt",
    href: "/for-creators",
    signupHref: "/auth?role=creator",
    icon: PlayCircle,
    metric: "Action",
    metricLabel: "when content moves people",
    valueNow: "Turn attention into activity",
    whyItMatters: "Your audience can move from watching to showing up, proving action, and earning with you.",
    outcomes: ["Create audience prompts", "Drive place visits", "Unlock creator earnings"],
  },
];

export function StakeholderPaths() {
  const [activePath, setActivePath] = useState(paths[0]);

  return (
    <section id="choose-your-path" className="relative overflow-hidden bg-background py-14 md:py-20">
      <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-primary/10 blur-[110px]" />
      <div className="absolute right-0 bottom-10 h-80 w-80 rounded-full bg-accent/10 blur-[110px]" />
      <div className="container relative z-10 px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
            <Megaphone className="h-4 w-4" />
            <span className="text-sm font-bold">Start with what you need</span>
          </div>
          <h2 className="font-serif text-3xl font-bold leading-tight md:text-5xl">
            What brings you to Promorang?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Choose the role closest to your real problem. The next step becomes clearer when Promorang starts with the outcome you already want.
          </p>
        </div>

        <div className="-mx-6 mb-8 overflow-x-auto px-6 pb-2 md:hidden">
          <div className="flex min-w-max gap-3">
            {paths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => setActivePath(path)}
                className={cn(
                  "w-48 rounded-2xl border p-4 text-left transition-all",
                  activePath.id === path.id
                    ? "border-primary bg-primary text-primary-foreground shadow-glow"
                    : "border-border bg-card text-card-foreground shadow-sm",
                )}
              >
                <path.icon className="mb-4 h-6 w-6" />
                <p className="font-bold">{path.label}</p>
                <p className={cn("mt-1 text-xs", activePath.id === path.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {path.audience}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <div className="hidden rounded-3xl border border-border bg-card p-3 shadow-card md:grid md:grid-cols-5 lg:grid-cols-1 lg:self-stretch">
            {paths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => setActivePath(path)}
                className={cn(
                  "flex min-h-20 items-center gap-3 rounded-2xl p-4 text-left transition-all lg:min-h-0",
                  activePath.id === path.id
                    ? "bg-charcoal text-white shadow-card"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    activePath.id === path.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  <path.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold">{path.label}</p>
                  <p className={cn("text-xs", activePath.id === path.id ? "text-zinc-300" : "text-muted-foreground")}>{path.audience}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-charcoal p-6 text-white shadow-elevated md:p-8">
            <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
            <div className="relative z-10">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-primary">
                    <activePath.icon className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.18em]">{activePath.audience}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-zinc-200">
                    <span className="font-serif text-base font-bold text-primary">{activePath.metric}</span>
                    <span className="text-xs font-semibold">{activePath.metricLabel}</span>
                  </div>
                </div>
                <h3 className="max-w-2xl font-serif text-3xl font-bold leading-tight md:text-5xl">
                  {activePath.headline}
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Value now</p>
                    <p className="mt-2 font-serif text-xl font-bold text-white">{activePath.valueNow}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Why it matters</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-200">{activePath.whyItMatters}</p>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
                  {activePath.copy}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {activePath.outcomes.map((outcome) => (
                    <span key={outcome} className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-2 text-sm text-zinc-200">
                      {outcome}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button variant="hero" size="lg" asChild>
                    <Link to={activePath.signupHref}>
                      Start as {activePath.audience}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white" asChild>
                    <Link to={activePath.href}>
                      {activePath.cta}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StakeholderPaths;
