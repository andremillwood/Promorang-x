import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Link2, MapPin, Sparkles, TrendingUp, ArrowRight, DollarSign } from "lucide-react";

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
    icon: DollarSign,
    title: "Earn Momentum Yield",
    description: "Track creator earnings from attributed joins, verified unlocks, memory issuance, and catalytic influence.",
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
              Promorang gives creators a way to convert attention into verified action. Publish a story, attach it to a boutique,
              cafe, salon, studio, grocery mission, or live gathering, and track exactly how your audience turns digital intent into
              physical presence and memory.
            </p>

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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="py-24 bg-charcoal text-white overflow-hidden relative">
        <div className="container px-6 relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-black uppercase tracking-widest text-[10px]">
                <Sparkles className="w-3 h-3" />
                Creator Value
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 italic">
                Your Audience Becomes a <span className="text-primary italic">Verified Signal.</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Brands and agencies do not just want views. They want proof that your story caused people to move.
                Promorang gives you the attribution layer to show joins, check-ins, service unlocks, store visits, and memories from the same mission.
              </p>
              <div className="space-y-4">
                {[
                  "Watch & Unlock participant feed",
                  "Mission linking between content and real-world moments",
                  "Creator O2O conversion analytics",
                  "Creator earnings and momentum yield tracking",
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
                  and unlock a co-branded memory. You keep the conversion data.
                </p>
                <Button variant="hero" size="lg" className="mt-8 w-full" asChild>
                  <Link to="/auth?role=creator">Open Creator Studio</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForCreators;
