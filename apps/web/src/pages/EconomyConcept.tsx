import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, Gem, KeyRound, Layers, Sparkles, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConceptKey = "keys" | "pieces" | "network";

const concepts: Record<ConceptKey, {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof KeyRound;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  sections: Array<{ title: string; text: string }>;
  receipts: string[];
}> = {
  keys: {
    eyebrow: "Access",
    title: "Keys help protect the moments people actually care about.",
    description:
      "Some moments should stay open. Some need a little friction because the room is small, the reward is funded, or the host wants people with real intent. Keys are how Promorang handles that without making the experience feel cold.",
    icon: KeyRound,
    primaryCta: "Find Moments",
    primaryHref: "/explore/moments",
    secondaryCta: "Open Wallet",
    secondaryHref: "/wallet",
    sections: [
      {
        title: "For participants",
        text: "Keys turn your activity into access. Show up, earn, and use them when a moment, reward, or offer is limited.",
      },
      {
        title: "For hosts and venues",
        text: "Keys help filter for people who are more likely to show up, respect capacity, and follow through.",
      },
      {
        title: "For brands",
        text: "Keys make sponsored access feel earned instead of random, so budget goes toward higher-intent participation.",
      },
    ],
    receipts: ["Limited moments", "Funded rewards", "Requires Plus", "Unlocked access"],
  },
  pieces: {
    eyebrow: "Lasting Upside",
    title: "Pieces give meaningful participation somewhere to live.",
    description:
      "A good moment should not disappear the second it ends. Pieces are the layer for early contribution, strong signal, and memories that deserve a lasting profile inside Promorang.",
    icon: Sparkles,
    primaryCta: "Open Vault",
    primaryHref: "/vault",
    secondaryCta: "View Portfolio",
    secondaryHref: "/portfolio",
    sections: [
      {
        title: "For participants",
        text: "Pieces can make your early or high-signal participation feel remembered, visible, and connected to future value.",
      },
      {
        title: "For hosts and creators",
        text: "Pieces help recurring moments, creator missions, and strong community patterns develop an identity beyond one event.",
      },
      {
        title: "For brands and venues",
        text: "Pieces can connect sponsorship, place, and participation to a story people can revisit instead of a campaign they forget.",
      },
    ],
    receipts: ["Early participation", "Creator missions", "Moment identity", "Vault memory"],
  },
  network: {
    eyebrow: "Network Value",
    title: "The people around a moment can make it worth more.",
    description:
      "Promorang is not just about one person earning something. It is about the room getting stronger when people return, bring friends, create content, and help a place or moment become part of their life.",
    icon: Users,
    primaryCta: "Explore Communities",
    primaryHref: "/for-communities",
    secondaryCta: "See PromoShare",
    secondaryHref: "/promoshare",
    sections: [
      {
        title: "For participants",
        text: "Your crew, referrals, repeat attendance, and content can help you become part of the moments you keep supporting.",
      },
      {
        title: "For hosts and venues",
        text: "Network value is what turns one turnout into a rhythm: people who come back, bring others, and make the room feel alive.",
      },
      {
        title: "For brands",
        text: "A campaign is stronger when it creates movement people carry with them, not just a one-time impression.",
      },
    ],
    receipts: ["Referrals", "Repeat visits", "Creator content", "PromoShare relevance"],
  },
};

export default function EconomyConcept() {
  const { concept } = useParams();
  const data = concepts[concept as ConceptKey];

  if (!data) {
    return <Navigate to="/" replace />;
  }

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${data.eyebrow} - Promorang`}
        description={data.description}
      />

      <section className="relative overflow-hidden border-b border-border bg-charcoal pb-20 pt-28 text-white md:pb-28 md:pt-36">
        <div className="absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="container relative z-10 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="border-primary/20 bg-primary/15 text-primary">
              {data.eyebrow}
            </Badge>
            <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Icon className="h-9 w-9" />
            </div>
            <h1 className="mx-auto mt-8 max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl">
              {data.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              {data.description}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to={data.primaryHref}>
                  {data.primaryCta}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to={data.secondaryHref}>{data.secondaryCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {data.sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-foreground">{section.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-border/60 bg-muted/20 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">What it touches</p>
                <h2 className="mt-3 font-serif text-3xl font-bold">Where this shows up</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {data.receipts.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: Ticket, title: "Moments", href: "/explore/moments" },
              { icon: Layers, title: "Vault", href: "/vault" },
              { icon: Gem, title: "PromoShare", href: "/promoshare" },
            ].map((route) => (
              <Link key={route.title} to={route.href} className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <route.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{route.title}</p>
                    <p className="text-sm text-muted-foreground">Open this part of Promorang</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
