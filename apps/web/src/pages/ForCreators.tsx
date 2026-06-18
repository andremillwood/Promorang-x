import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import { PlayCircle, Link2, MapPin, Sparkles, TrendingUp, ArrowRight, Gem, Users, Camera, Store, CalendarCheck, BadgeDollarSign, ShieldCheck, BarChart3, CheckCircle2 } from "lucide-react";

const creatorBenefits = [
  {
    icon: PlayCircle,
    title: "Publish Content Moments",
    description: "Turn your stories, drops, and episodes into missions people can actually act on in the real world.",
  },
    {
      icon: Link2,
      title: "Unlock Real Places",
      description: "Attach your content to a venue or live moment so participants can watch, join, and check in through your narrative.",
  },
  {
    icon: TrendingUp,
    title: "Prove O2O Conversion",
    description: "Show brands and agencies that your audience does more than watch. They move, verify, and return.",
  },
  {
    icon: Gem,
    title: "Earn In Gems, Not Vague Hype",
    description: "Track creator rewards through attributed joins, verified unlocks, PromoShare relevance, and platform-safe Gems payouts.",
  },
  {
    icon: Users,
    title: "Grow a Real Network",
    description: "Treat your audience like a crew. Referrals, repeat attendance, and verified movement should deepen your graph, not disappear into vanity metrics.",
  },
];

const creatorUseCases = [
  {
    icon: Camera,
    title: "UGC and lifestyle creators",
    description: "Turn recommendations into real visits, trials, and bookings instead of screenshots and DMs you cannot prove.",
  },
  {
    icon: Store,
    title: "Retail and local discovery creators",
    description: "Link founder drops, product routes, tastings, and in-store experiences directly to your content.",
  },
  {
    icon: CalendarCheck,
    title: "Event and culture creators",
    description: "Bring people from story to door for launch nights, sessions, classes, creator tables, and live gatherings.",
  },
];

const creatorEconomics = [
  "Attributed joins and verified unlocks",
  "PromoShare relevance and campaign participation",
  "Repeat movement across linked missions",
  "Performance history you can show to brands and agencies",
];

const creatorFaqs = [
  {
    question: "Is this only for large influencers?",
    answer: "No. The model is better for creators with trust than creators with inflated reach. A smaller audience that actually moves is more valuable here than passive views.",
  },
  {
    question: "What makes this different from affiliate links?",
    answer: "Affiliate links mostly stop at clicks and purchases. Promorang is designed for place-based action too: visits, check-ins, bookings, attendance, and repeat movement.",
  },
  {
    question: "What do brands get out of this?",
    answer: "A creator they can measure. Instead of vague awareness, they can see who joined, redeemed, visited, returned, and participated in the mission loop.",
  },
];

const ForCreators = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promorang for Creators - Turn Content Into Real-World Momentum"
        description="Publish creator-led missions, drive verified foot traffic, and measure how your stories convert into real-world action."
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-20 pt-24 text-white sm:pt-28 md:pb-32 md:pt-40">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -top-12 -right-12" />
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
              <PlayCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Creator Missions</span>
            </div>

            <h1 className="mx-auto mb-6 max-w-[18rem] break-words font-serif text-[1.8rem] font-bold italic leading-tight sm:max-w-4xl sm:text-5xl md:text-7xl">
              Turn Stories Into <span className="text-primary italic">Movement.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
              Promorang gives creators a way to turn attention into places people actually go. Publish a story, attach it to a boutique,
              cafe, salon, studio, grocery mission, or live gathering, and let your audience unlock a real-world experience through your narrative.
            </p>

            <MarketingPromiseStrip
              variant="dark"
              className="mx-auto mb-8 max-w-5xl text-left"
              items={[
                { label: "Situation", text: "Views prove attention, but they rarely prove that your taste moved anyone." },
                { label: "Promorang makes possible", text: "Stories become missions people can join, verify, and turn into rewardable action." },
                { label: "Next move", text: "Publish one creator mission tied to a place, product, or gathering." },
              ]}
            />

            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?role=creator">
                  Start as a Creator
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/5" size="lg" asChild>
                <Link to="/watch-unlock">See Watch & Unlock</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
              {[
                ["Story", "Publish a mission people can follow."],
                ["Place", "Attach it to a real venue or moment."],
                ["Unlock", "Let your audience move, join, and earn."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background border-b border-border">
        <div className="container px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 italic">
              The Creator <span className="text-primary">Loop.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Publish the story, unlock the place, prove the movement, and keep the memory.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {creatorBenefits.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border bg-card p-6 transition-all hover:border-primary/30">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30 py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="border-primary/20 bg-primary/10 text-primary">Who This Is For</Badge>
            <h2 className="mt-6 font-serif text-3xl font-bold italic md:text-5xl">
              Built for creators who want more than views.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              If your audience trusts your taste, follows your routes, copies your rituals, or shows up where you show up, this is your lane.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {creatorUseCases.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border bg-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-charcoal text-white overflow-hidden relative">
        <div className="container px-6 relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-black uppercase tracking-widest text-[10px]">
                <Sparkles className="w-3 h-3" />
                Creator Value
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 italic">
                Your Audience Becomes a <span className="text-primary italic">Real-World Movement.</span>
              </h2>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Brands and agencies do not just want views. They want stories that get people to try, visit, book, return, and talk.
                Promorang gives you the layer to connect content with joins, check-ins, service unlocks, store visits, complementary pieces, PromoShare entries, and memories from the same mission.
              </p>
              <div className="space-y-4">
                {[
                  "Watch & Unlock participant feed",
                  "Mission linking between content and real-world moments",
                  "Creator O2O conversion analytics",
                  "Early participant and power performer piece eligibility",
                  "Creator earnings, PromoShare, and Gems tracking",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative rounded-[3rem] border border-white/10 bg-white/5 p-8 md:p-12">
                <Badge className="bg-primary/15 text-primary border border-primary/20">O2O Attribution</Badge>
                <h3 className="mt-6 text-2xl font-serif font-bold italic">A Story That Sends People Somewhere</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  Publish a mission like “Watch the hidden skincare route, then book the Glow House service window,” or
                  “Find the founder rack at North Block Supply.” Participants enter through your story, verify in person,
                  and unlock a co-branded memory. Early participants can qualify for complementary pieces, power performers can deepen their upside, and you keep the conversion data.
                </p>
                <Button variant="hero" size="lg" className="mt-8 w-full" asChild>
                  <Link to="/auth?role=creator">Open Creator Studio</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-24">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                <BadgeDollarSign className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.18em]">Creator Economics</span>
              </div>
              <h2 className="mt-6 font-serif text-3xl font-bold italic md:text-5xl">
                Earn from measurable movement, not soft promises.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                The point is not to make creators sound like media kits. The point is to give them a record:
                one that shows what their stories caused in the real world and lets that performance compound.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {creatorEconomics.map((item) => (
                  <div key={item} className="rounded-2xl border border-border/70 bg-background p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="border-primary/20 bg-primary/10 text-primary">How It Works</Badge>
            <h2 className="mt-6 font-serif text-3xl font-bold italic md:text-5xl">
              A creator workflow brands can actually understand.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                icon: PlayCircle,
                title: "1. Publish",
                description: "Create a story, drop, or mission with a clear action for your audience.",
              },
              {
                icon: Link2,
                title: "2. Link",
                description: "Attach it to a venue, event, retail route, or service unlock path.",
              },
              {
                icon: ShieldCheck,
                title: "3. Verify",
                description: "Track joins, check-ins, unlocks, bookings, and repeat movement.",
              },
              {
                icon: BarChart3,
                title: "4. Prove",
                description: "Use the conversion layer to win better deals, better partnerships, and stronger repeat campaigns.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border bg-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/20 py-24">
        <div className="container px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <Badge className="border-primary/20 bg-primary/10 text-primary">FAQ</Badge>
              <h2 className="mt-6 font-serif text-3xl font-bold italic md:text-5xl">
                Common creator objections, answered.
              </h2>
            </div>
            <div className="mt-12 grid gap-6">
              {creatorFaqs.map((item) => (
                <div key={item.question} className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
                  <h3 className="text-lg font-bold text-foreground">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-24 text-white">
        <div className="container px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-bold">Creator CTA</span>
            </div>
            <h2 className="mt-6 font-serif text-3xl font-bold italic md:text-5xl">
              If your audience moves, your business model can grow with it.
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-300">
              Start publishing creator-led missions, link them to real-world unlocks, and build a proof layer around what your stories actually do.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?role=creator">
                  Start as a Creator
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/watch-unlock">Browse Creator Missions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForCreators;
