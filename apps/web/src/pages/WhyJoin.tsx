import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Gem,
  Gift,
  Key,
  MapPin,
  Sparkles,
  Star,
  Target,
  Ticket,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const journeySteps = [
  {
    icon: Ticket,
    title: "Find a moment",
    description: "Discover tastings, creator missions, rituals, drops, classes, and gatherings worth showing up for.",
  },
  {
    icon: MapPin,
    title: "Leave a Mark",
    description: "Check in when you arrive so the moment counts as real participation, not passive browsing.",
  },
  {
    icon: Sparkles,
    title: "Unlock layered value",
    description: "One real-world action can open Points, Keys, Pieces, PromoShare eligibility, and future Gems utility.",
  },
  {
    icon: Users,
    title: "Build standing",
    description: "Repeat movement, referrals, and trusted participation make places, hosts, and communities remember you.",
  },
];

const valueLayers = [
  {
    icon: Star,
    title: "Points",
    description: "Your always-on progression layer for joining, checking in, sharing, and returning.",
  },
  {
    icon: Key,
    title: "Keys",
    description: "Your access layer for better invites, limited seats, funded moments, and tier movement.",
  },
  {
    icon: Sparkles,
    title: "Pieces",
    description: "Complementary upside tied to early participation or strong performance inside a moment or content arc.",
  },
  {
    icon: Gift,
    title: "PromoShare",
    description: "The recurring qualified reward system that tracks which verified participants stay relevant over time.",
  },
  {
    icon: Gem,
    title: "Gems",
    description: "Promorang's spendable value unit for marketplace, rewards, and funded platform activity.",
  },
];

const participantPaths = [
  {
    title: "Early participants",
    description: "Show up early, verify into the right moments, and qualify first for better access, stronger recognition, and complementary Pieces where available.",
    bullets: ["First access", "Complementary pieces", "Better seat at the table"],
  },
  {
    title: "Power performers",
    description: "Move other people, create repeat momentum, and build a stronger graph around the places and creators you support.",
    bullets: ["Referral weight", "PromoShare relevance", "Performance-linked upside"],
  },
];

const reasons = [
  "You want better plans, not more noise.",
  "You want your regular habits to count for something.",
  "You want access, belonging, and progression in the places you actually care about.",
  "You want a network that compounds instead of disappearing into generic social metrics.",
];

export default function WhyJoin() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Why Join Promorang - Because Real Life Should Add Up"
        description="Promorang helps you find better moments, leave Marks when you show up, unlock Points, Keys, Pieces, PromoShare eligibility, Gems, and stronger local standing."
      />

      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-24 md:pb-28 md:pt-36">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary" variant="outline">
              <Sparkles className="mr-1 h-3 w-3" />
              Participant Guide
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Real life should
              <span className="text-gradient-primary"> add up for you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              Promorang is for people who want more from showing up. Find moments worth joining, leave Marks when you arrive,
              and turn real participation into access, Pieces, PromoShare eligibility, Gems, and stronger local standing.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button size="xl" variant="hero" asChild>
                <Link to="/explore/moments">
                  Find Your First Moment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/wallet">See Your Wallet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-20 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <Target className="mr-1 h-3 w-3" />
              The Loop
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              How Promorang works
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              The system is simple on purpose. One real action can start a longer chain of useful outcomes.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {journeySteps.map((step) => (
              <Card key={step.title} className="border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary" variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                What A Mark Means
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                A Mark means you were really there.
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                A Mark is how Promorang remembers the places, hosts, creators, and communities you keep choosing.
                It turns real-world participation into something the platform can reward, the community can recognize,
                and your future opportunities can build on.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Marks make repeat participation visible.",
                  "Marks help unlock progression, access, and standing.",
                  "Marks can increase your eligibility for Pieces and PromoShare.",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {valueLayers.map((layer) => (
                <div key={layer.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{layer.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{layer.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="container px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <Trophy className="mr-1 h-3 w-3" />
              Two Fastest Paths
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              Early participants and power performers can compound fastest.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Promorang is built to reward both the people who get there early and the people who create real momentum around a moment.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {participantPaths.map((path) => (
              <Card key={path.title} className="overflow-hidden border-border bg-card shadow-sm">
                <CardContent className="p-7">
                  <h3 className="font-serif text-2xl font-bold">{path.title}</h3>
                  <p className="mt-4 text-base leading-8 text-muted-foreground">{path.description}</p>
                  <div className="mt-6 space-y-3">
                    {path.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-20 md:py-24">
        <div className="container px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <Badge className="mb-4" variant="outline">
                <Users className="mr-1 h-3 w-3" />
                Why Join
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                This is for people whose real habits should become useful.
              </h2>
              <div className="mt-6 grid gap-3">
                {reasons.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-sm leading-7 text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary" variant="outline">
                <Gift className="mr-1 h-3 w-3" />
                Why PromoShare and Gems Exist
              </Badge>
              <h3 className="font-serif text-2xl font-bold md:text-3xl">
                Rewards should be structured, not vague.
              </h3>
              <p className="mt-4 leading-8 text-muted-foreground">
                PromoShare is the qualified recurring reward layer. Gems are the spendable unit that keeps value moving inside the platform.
                Together they let Promorang reward verified contribution without pretending every action is instant cash.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "PromoShare tracks recurring eligibility.",
                  "Gems keep funded value legible and usable.",
                  "Qualified rewards protect the system from spam and empty promises.",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-muted/40 p-4">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold md:text-5xl">
            Start with one moment.
            <span className="text-gradient-primary"> Let the rest compound.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            You do not need to understand every layer on day one. You just need to show up somewhere worth remembering.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Button size="xl" variant="hero" asChild>
              <Link to="/explore/moments">
                Find Moments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/promoshare">See PromoShare</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
