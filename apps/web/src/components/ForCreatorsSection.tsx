import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gem, MapPin, PlayCircle, TrendingUp } from "lucide-react";

const creatorSignals = [
  {
    icon: PlayCircle,
    title: "Publish a mission",
    text: "Turn a story, drop, or episode into a guided action your audience can actually follow.",
  },
  {
    icon: MapPin,
    title: "Send people somewhere",
    text: "Attach content to a venue, service window, event, or live ritual with a real unlock path.",
  },
  {
    icon: TrendingUp,
    title: "Prove the movement",
    text: "Show brands, hosts, and agencies that your audience visits, joins, books, and returns.",
  },
  {
    icon: Gem,
    title: "Keep the upside",
    text: "Track creator earnings, PromoShare relevance, Gems, and repeat momentum from one loop.",
  },
];

const ForCreatorsSection = () => {
  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-20 md:py-32">
      <div className="absolute left-0 top-16 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
      <div className="absolute right-0 bottom-12 h-72 w-72 rounded-full bg-accent/10 blur-[110px]" />
      <div className="container relative z-10 px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm font-bold">For Creators</span>
            </div>
            <h2 className="mt-6 font-serif text-3xl font-bold leading-tight text-foreground md:text-5xl">
              Stop posting into the void.
              <span className="text-primary"> Move people in real life.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Promorang gives creators an operating layer between attention and action. Publish the story, link the place,
              measure the movement, and build a repeatable creator business around what your audience actually does.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/for-creators">
                  Explore Creator Marketing
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth?role=creator">Start as a Creator</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              {creatorSignals.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-background p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForCreatorsSection;
