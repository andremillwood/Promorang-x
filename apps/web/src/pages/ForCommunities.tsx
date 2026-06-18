import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Gift,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const communityLoop = [
  {
    icon: Users,
    title: "Gather people intentionally",
    description: "Create rooms, rituals, and repeatable moments that feel worth returning to.",
  },
  {
    icon: Sparkles,
    title: "Let attendance become visible",
    description: "Marks and verified check-ins turn community participation into something measurable and useful.",
  },
  {
    icon: TrendingUp,
    title: "Build trusted momentum",
    description: "Repeat participation, referrals, and better rooms create signal that grows your standing over time.",
  },
  {
    icon: Gift,
    title: "Unlock better support",
    description: "Once the pattern is real, partner opportunities, PromoShare relevance, and funded rewards become easier to justify.",
  },
];

const levels = [
  {
    name: "Seeker",
    icon: Sparkles,
    description: "Starting to gather and create a visible pattern.",
  },
  {
    name: "Herald",
    icon: Flame,
    description: "A trusted voice who brings people into the right rooms.",
  },
  {
    name: "Luminary",
    icon: TrendingUp,
    description: "Known for consistency, quality, and repeat movement.",
  },
  {
    name: "Eminence",
    icon: ShieldCheck,
    description: "A pillar whose community signal is strong enough to attract backing.",
  },
];

const networkPoints = [
  "Inviting the right people matters more than broadcasting to everyone.",
  "Referrals and repeat attendance can improve standing, Pieces relevance, and PromoShare weight.",
  "The best communities do not just fill rooms once. They create trusted return behavior.",
];

const communityValue = [
  "A clearer record of who actually shows up",
  "More reasons for members to return",
  "A stronger story for brands, venues, and collaborators",
  "A network that compounds instead of resetting every event",
];

const ForCommunities = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promorang for Communities - Build a Scene People Return To"
        description="Create repeatable moments, turn attendance into real signal, and grow a community whose momentum can unlock trust, PromoShare relevance, and partner opportunity."
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-20 pt-24 text-white sm:pt-28 md:pb-32 md:pt-40">
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-[120px] -top-12 -right-12" />
        <div className="container relative z-10 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Community Growth</span>
            </div>

            <h1 className="mx-auto mb-6 max-w-[18rem] break-words font-serif text-[1.8rem] font-bold italic leading-tight sm:max-w-4xl sm:text-5xl md:text-7xl">
              Build a scene <span className="text-primary italic">people return to.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-[22rem] text-base leading-relaxed text-white/60 sm:max-w-2xl sm:text-lg md:text-xl">
              Promorang helps communities do more than host gatherings. It turns real participation into Marks, standing,
              network value, PromoShare relevance, and a stronger case for future backing.
            </p>

            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/propose">
                  Create Your First Moment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5" size="lg" asChild>
                <Link to="/explore/moments">See Community Moments</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-20 md:py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              The Community Loop
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              Community growth should be visible, not vague.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The strongest communities create repeat movement. Promorang gives that movement a structure people can feel and partners can understand.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {communityLoop.map((step) => (
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
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary" variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                Community Levels
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                Reputation compounds for the people holding the room together.
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                Community leadership is earned through consistency. The more you create spaces people trust and return to,
                the more your standing deepens across the platform.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {levels.map((level) => (
                <div key={level.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary">
                    <level.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{level.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <Badge className="mb-4" variant="outline">
                <Users className="mr-1 h-3 w-3" />
                Network Growth
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                Your crew should create stronger signal, not just bigger numbers.
              </h2>
              <div className="mt-6 space-y-3">
                {networkPoints.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-sm leading-7 text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">What compounds</p>
              <div className="mt-6 space-y-4">
                {communityValue.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-background p-4">
                    <p className="text-sm font-medium leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl font-bold md:text-5xl">
            Start with a room worth remembering.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            The best communities are built one trusted return at a time. Promorang gives that return pattern a system people can grow inside.
          </p>
          <Button variant="hero" size="xl" className="mt-10" asChild>
            <Link to="/propose">
              Create Your First Moment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ForCommunities;
