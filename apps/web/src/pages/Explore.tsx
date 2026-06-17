import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Compass, Film, Gift, MapPin, Sparkles } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

const exploreSections = [
  {
    title: "Moments",
    description: "Browse upcoming moments, creator missions, and public activations in a compare-friendly listing.",
    href: "/explore/moments",
    icon: Compass,
    cta: "Browse moments",
  },
  {
    title: "Venues",
    description: "See the places and operators hosting activity across nightlife, retail, wellness, and everyday commerce.",
    href: "/explore/venues",
    icon: MapPin,
    cta: "Browse venues",
  },
  {
    title: "Rewards",
    description: "Understand the reward loops available across proofs, offers, missions, and wallet-linked claims.",
    href: "/explore/rewards",
    icon: Gift,
    cta: "Browse rewards",
  },
  {
    title: "Content",
    description: "Browse creator media tied to moments, venues, and public discovery archives rather than only seeing it inside the feed.",
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
          <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6 shadow-soft sm:p-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Discovery Surfaces
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Explore what is live, local, and worth acting on.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Use the feed when you want ranked recommendations. Use Explore when you want a clean catalog of moments, venues, and reward opportunities.
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
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {exploreSections.map((section) => (
              <Card key={section.title} className="border-border/70 shadow-soft transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="font-serif text-2xl">{section.title}</CardTitle>
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
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">How to use this split</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">For You</p>
                  <p className="mt-2">Personalized, ranked, and scroll-first. Best when you want the system to surface what matters now.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">Explore</p>
                  <p className="mt-2">Filterable and compare-friendly. Best when you know the category, place, or format you want.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">Rewards</p>
                  <p className="mt-2">Learn which actions unlock value and where proof, offers, and claims fit into the product loop.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Also browse</CardTitle>
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
