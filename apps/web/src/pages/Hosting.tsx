import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Gift,
  Handshake,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const hostLoop = [
  {
    icon: Calendar,
    title: "Create repeatable moments",
    description: "Host a rhythm people can come back to instead of one-off noise that disappears after the weekend.",
  },
  {
    icon: MapPin,
    title: "Turn attendance into signal",
    description: "Marks, check-ins, and repeat participation make your momentum measurable to the platform and future partners.",
  },
  {
    icon: BarChart3,
    title: "Build proof over time",
    description: "Promorang gives hosts a better story than RSVPs alone: who showed up, who returned, and what actually moved.",
  },
  {
    icon: Gift,
    title: "Unlock funded support",
    description: "When your scene becomes real and repeatable, sponsors and partners can fund reward pools, access, and moments through you.",
  },
];

const hostBenefits = [
  {
    icon: ShieldCheck,
    title: "Verified participation",
    description: "Use QR or in-person check-ins so attendance is more than a guess.",
  },
  {
    icon: Users,
    title: "Community memory",
    description: "Promorang helps your regulars become visible and gives return behavior more meaning.",
  },
  {
    icon: Sparkles,
    title: "Reward design",
    description: "Create moments that lead into access, perks, PromoShare relevance, and complementary Pieces where appropriate.",
  },
  {
    icon: Handshake,
    title: "Sponsor readiness",
    description: "Build a stronger case for brand support once your participation patterns become trustworthy.",
  },
];

const unlocks = [
  "Consistent attendance around your scene",
  "Clearer proof for sponsors and partners",
  "Better repeat behavior from participants",
  "Reward loops that feel local and intentional",
];

const metrics = [
  { value: "3+", label: "repeat moments to build signal" },
  { value: "50+", label: "verified participants that start to matter commercially" },
  { value: "1", label: "coherent host story brands can actually understand" },
];

const tools = [
  {
    icon: Calendar,
    title: "Moment creation",
    description: "Set up gatherings, drops, rituals, and recurring formats without turning the experience into admin work.",
  },
  {
    icon: QrCode,
    title: "Check-in systems",
    description: "Use simple verification so Promorang can separate real movement from soft intent.",
  },
  {
    icon: TrendingUp,
    title: "Host signal",
    description: "Track rhythm, return behavior, and local gravity instead of only counting vanity attendance.",
  },
  {
    icon: BarChart3,
    title: "Analytics and sponsor proof",
    description: "Show what your moments created across joins, returns, and community activity.",
  },
];

const Hosting = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Host on Promorang - Build the Room People Return To"
        description="Promorang helps hosts create repeatable moments, turn participation into real signal, and unlock sponsor support when community momentum becomes measurable."
        type="website"
      />

      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-24 md:pb-28 md:pt-36">
        <div className="absolute left-8 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative z-10 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary" variant="outline">
              <Sparkles className="mr-1 h-3 w-3" />
              Host Signal
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Host the room
              <span className="text-gradient-primary"> people return to.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              Promorang is not just for creating events. It helps hosts build repeatable scenes, turn participation into real signal,
              and unlock sponsor support when their community momentum becomes measurable and trusted.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?role=host">
                  Start Hosting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/for-brands">See Sponsor Logic</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-20 md:py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              The Host Loop
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              Hosting on Promorang is a progression system.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The goal is not to post random events. The goal is to become known for a scene people trust, return to, and tell others about.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {hostLoop.map((step) => (
              <Card key={step.title} className="border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary" variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                Why It Matters
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                Marks turn hosting into something sponsors can understand.
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                A host becomes more valuable when participation is visible over time. Marks, repeat attendance, and real check-ins
                create a better operating story than vague hype. That is what makes funded moments, reward pools, and partner interest more feasible.
              </p>
              <div className="mt-8 grid gap-3">
                {unlocks.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Host thresholds</p>
              <div className="mt-6 grid gap-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
                    <p className="font-serif text-4xl font-bold text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-zinc-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <BarChart3 className="mr-1 h-3 w-3" />
              Host Tools
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              Practical tools, but tied to a bigger story.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Promorang gives hosts practical tools and a stronger record of what those tools help prove over time.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {tools.map((tool) => (
              <Card key={tool.title} className="border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tool.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-20 md:py-24">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <Badge className="mb-4" variant="outline">
                <Gift className="mr-1 h-3 w-3" />
                Funded Moments
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                Reward loops become stronger when brands can fund what already works.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                The right sponsor model is not interruptive advertising. It is helping hosts extend moments people already care about
                through better perks, access, PromoShare cycles, and locally meaningful incentives.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <div className="space-y-4">
                {hostBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4 rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-6 text-center">
          <h2 className="font-serif text-3xl font-bold md:text-5xl">
            Build the scene first.
            <span className="text-gradient-primary"> Let support follow the signal.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            The best host outcome is not a dashboard. It is a repeatable room, trusted people, and a stronger case for why your moments deserve backing.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?role=host">
                Start Hosting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hosting;
