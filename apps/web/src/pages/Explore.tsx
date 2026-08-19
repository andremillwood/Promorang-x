import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { ArrowRight, Compass, Film, Gift, MapPin, Sparkles } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

const exploreSections = [
  {
    title: "Moments",
    description: "Find rooms, rituals, drops, and activations where your action can create proof.",
    href: "/explore/moments",
    icon: Compass,
    cta: "Browse moments",
  },
  {
    title: "Places",
    description: "See the venues and operators hosting movement across nightlife, retail, wellness, and everyday commerce.",
    href: "/explore/venues",
    icon: MapPin,
    cta: "Browse venues",
  },
  {
    title: "Rewards",
    description: "See offers, claims, and reward loops connected to proof, Wallet value, and status.",
    href: "/explore/rewards",
    icon: Gift,
    cta: "Browse rewards",
  },
  {
    title: "Content",
    description: "Browse creator media tied to Moments, places, Scenes, and public stories worth moving.",
    href: "/explore/content",
    icon: Film,
    cta: "Browse content",
  },
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Promorang"
        description="Browse moments, venues, and reward paths across Promorang."
        url={getSiteUrl("/explore")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Explore Promorang",
          description: "Browse moments, venues, and reward paths across Promorang.",
        }}
      />

      <section className="px-4 pb-12 pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),linear-gradient(135deg,rgba(9,9,9,0.98),rgba(21,21,21,0.94))] p-6 shadow-2xl sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Explore Promorang
                </div>
                <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">
                  Choose your way into the culture market.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  Explore is the deliberate path: choose a Moment, place, reward, creator signal, or Scene when you know the kind of value you want to move toward.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link to="/for-you">Open For You</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/explore/moments">Start with moments</Link>
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ["Orientation", "Pick the category that matches your intent."],
                  ["First value", "Open one listing with a clear action path."],
                  ["Unlock", "Save, join, claim, prove, or share into future upside."],
                ].map(([label, body]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {exploreSections.map((section) => (
              <Card key={section.title} className="border-border/70 shadow-soft transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-[-0.03em]">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="group -ml-3 px-3">
                    <Link to={section.href}>
                      {section.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr,0.7fr]">
            <GuidanceDisclosure
              id="explore:how-to-choose"
              eyebrow="Discovery guide"
              title="How to choose where to browse"
              summary="For You, Explore, and Rewards each answer a different discovery need."
              className="mt-0"
              tone="light"
            >
              <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">For You</p>
                  <p className="mt-2">Personalized, ranked, and scroll-first. Best when you want the system to surface what matters now.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">Explore</p>
                  <p className="mt-2">Intent-first and compare-friendly. Best when you know the category, place, or format you want.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">Rewards</p>
                  <p className="mt-2">See which actions unlock value and where proof, offers, claims, and Wallet signals fit.</p>
                </div>
              </div>
            </GuidanceDisclosure>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-black tracking-[-0.03em]">Also browse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/brands">
                    Brands
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/hosts">
                    Hosts
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/search">
                    Global Search
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explore;
