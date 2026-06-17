import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConceptKey = "keys" | "pieces" | "network";
type IconType = typeof KeyRound;

type RoleValue = {
  role: string;
  why: string;
  outcome: string;
  action: string;
  href: string;
  icon: IconType;
};

type StepValue = {
  label: string;
  title: string;
  text: string;
};

type ProofValue = {
  label: string;
  value: string;
  helper: string;
};

const routes = [
  { icon: Ticket, title: "Find moments", href: "/explore/moments", text: "See where the mechanic becomes useful in real participation." },
  { icon: WalletCards, title: "Open wallet", href: "/wallet", text: "Track balances, access, and value connected to your activity." },
  { icon: Sparkles, title: "Create a moment", href: "/moments/create", text: "Turn a gathering, mission, or offer into a live surface." },
];

const concepts: Record<ConceptKey, {
  eyebrow: string;
  title: string;
  description: string;
  stake: string;
  icon: IconType;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  proof: ProofValue[];
  roles: RoleValue[];
  steps: StepValue[];
  receipts: string[];
  closing: string;
}> = {
  keys: {
    eyebrow: "Access",
    title: "Keys make limited access feel earned, not arbitrary.",
    description:
      "When capacity, rewards, or intent matter, Keys help Promorang decide who should get through the door without turning the experience into a cold application process.",
    stake:
      "The value is not the key itself. The value is a better room: fewer empty claims, more qualified attendance, and funded access that goes to people likely to show up.",
    icon: KeyRound,
    primaryCta: "Find gated moments",
    primaryHref: "/explore/moments",
    secondaryCta: "Open wallet",
    secondaryHref: "/wallet",
    proof: [
      { label: "Participant value", value: "Access", helper: "Use earned history to reach limited moments and offers." },
      { label: "Host value", value: "Intent", helper: "Protect capacity for people with stronger signals." },
      { label: "Brand value", value: "Quality", helper: "Put budget behind people more likely to follow through." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You need a way to prove you are more than a casual click.",
        outcome: "Keys can move you from browsing to priority access when a moment, reward, or room is limited.",
        action: "Build access history",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "A full RSVP list is not the same as a full room.",
        outcome: "Keys add light friction so scarce space goes to people with better intent and participation history.",
        action: "Create a gated moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "Sponsored access should not feel like a random giveaway.",
        outcome: "Keys make access feel earned, improving signal quality before perks, samples, or VIP inventory are released.",
        action: "Fund better access",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your best rooms need people who will participate, share, and return.",
        outcome: "Keys help creator-led drops and missions protect momentum without making the invitation feel closed off.",
        action: "Build with Promorang",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Show up", text: "Join real moments and leave Marks that record participation." },
      { label: "02", title: "Earn signal", text: "Consistent activity can translate into Keys and stronger access standing." },
      { label: "03", title: "Unlock", text: "Use Keys when a room, reward, offer, or opportunity has limited capacity." },
    ],
    receipts: ["Limited moments", "Funded rewards", "Capacity control", "Priority access", "Higher-intent rooms"],
    closing: "Keys matter when openness alone would weaken the moment.",
  },
  pieces: {
    eyebrow: "Lasting Upside",
    title: "Pieces give meaningful participation somewhere to live.",
    description:
      "A good moment should not disappear the second it ends. Pieces turn early contribution, strong signal, and cultural memory into something people can return to.",
    stake:
      "The value is continuity. Participants get remembered, hosts get identity, and sponsors get a story connected to actual movement instead of a campaign that evaporates.",
    icon: Sparkles,
    primaryCta: "Open vault",
    primaryHref: "/vault",
    secondaryCta: "View portfolio",
    secondaryHref: "/portfolio",
    proof: [
      { label: "Participant value", value: "Memory", helper: "Participation can become visible beyond one night." },
      { label: "Host value", value: "Identity", helper: "Recurring moments can develop a durable profile." },
      { label: "Brand value", value: "Story", helper: "Sponsorship can attach to proof people revisit." },
    ],
    roles: [
      {
        role: "Participants",
        why: "Being early, consistent, or helpful should not vanish after the event ends.",
        outcome: "Pieces can make your strongest participation easier to remember, revisit, and connect to future value.",
        action: "Open your vault",
        href: "/vault",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "Recurring rooms need identity, not just another listing.",
        outcome: "Pieces help a moment, venue, or community build a durable surface around proof, memory, and return behavior.",
        action: "Create a recurring moment",
        href: "/moments/create",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "The best sponsorships leave evidence people can point back to.",
        outcome: "Pieces can connect funded participation, content, and community proof to a story that keeps working after launch.",
        action: "Explore brand use",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your creative labor needs a place to compound.",
        outcome: "Pieces can give missions, drops, and cultural moments a visible home that credits participation and keeps momentum alive.",
        action: "Explore creator use",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "Moment happens", text: "People show up, create, refer, verify, or contribute signal." },
      { label: "02", title: "Proof collects", text: "Marks, content, and activity create a stronger record around the moment." },
      { label: "03", title: "Piece persists", text: "The best signal can live in a profile, vault, or portfolio instead of disappearing." },
    ],
    receipts: ["Early participation", "Creator missions", "Moment identity", "Vault memory", "Portfolio signal"],
    closing: "Pieces matter when a moment deserves a life after the feed.",
  },
  network: {
    eyebrow: "Network Value",
    title: "The people around a moment can make it worth more.",
    description:
      "Promorang is not only about one person earning something. It is about rooms getting stronger when people return, bring friends, create content, and help a place become part of their life.",
    stake:
      "The value is compounding behavior: repeat visits, trusted referrals, creator proof, and community rhythm that make a moment more useful to everyone involved.",
    icon: Users,
    primaryCta: "Explore communities",
    primaryHref: "/for-communities",
    secondaryCta: "See PromoShare",
    secondaryHref: "/promoshare",
    proof: [
      { label: "Participant value", value: "Standing", helper: "Your relationships and repeat behavior can become visible." },
      { label: "Host value", value: "Return", helper: "A good room becomes easier to rebuild." },
      { label: "Brand value", value: "Movement", helper: "Campaigns gain value when people carry them forward." },
    ],
    roles: [
      {
        role: "Participants",
        why: "You often create value by bringing people, posting proof, and returning.",
        outcome: "Network value helps that contribution become part of your standing instead of invisible background labor.",
        action: "Find your next room",
        href: "/explore/moments",
        icon: Users,
      },
      {
        role: "Hosts and venues",
        why: "The hardest part is not one turnout. It is getting the right people to come back.",
        outcome: "Network value helps identify repeat movement, trusted crews, and the relationships that make rooms easier to grow.",
        action: "Build a community loop",
        href: "/for-communities",
        icon: MapPin,
      },
      {
        role: "Brands",
        why: "Impressions are weak if no one carries the experience forward.",
        outcome: "Network value links sponsorship to referral, attendance, content, and public proof instead of one-time exposure.",
        action: "Design a movement",
        href: "/for-brands",
        icon: Building2,
      },
      {
        role: "Creators",
        why: "Your audience is not just reach. It is a group that can move.",
        outcome: "Network value helps creators turn content and attendance into a stronger graph around moments and places.",
        action: "Connect content to moments",
        href: "/for-creators",
        icon: PlayCircle,
      },
    ],
    steps: [
      { label: "01", title: "People gather", text: "A room forms around a moment, place, creator, brand, or community." },
      { label: "02", title: "Signal spreads", text: "Referrals, content, repeat visits, and Marks show what is actually moving." },
      { label: "03", title: "Value compounds", text: "Better rooms, stronger offers, PromoShare relevance, and future access become easier to justify." },
    ],
    receipts: ["Referrals", "Repeat visits", "Creator content", "PromoShare relevance", "Community rhythm"],
    closing: "Network value matters when the people around a moment are part of the product.",
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
    <div className="min-h-screen bg-[#f7f3ed] text-foreground">
      <SEO title={`${data.eyebrow} - Promorang`} description={data.description} />

      <section className="relative overflow-hidden border-b border-black/10 bg-[#1e1e1d] pb-12 pt-28 text-white md:pb-16 md:pt-32">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,113,16,0.22),transparent_55%)]" />
        <div className="container relative z-10 px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge className="border-primary/25 bg-primary/15 text-primary">
                {data.eyebrow}
              </Badge>
              <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-gradient-primary text-primary-foreground shadow-2xl shadow-primary/25">
                <Icon className="h-9 w-9" />
              </div>
              <h1 className="mt-8 max-w-4xl font-serif text-4xl font-bold leading-[0.95] md:text-6xl">
                {data.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                {data.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Why stakeholders should care</p>
              <p className="mt-4 text-2xl font-semibold leading-snug text-white md:text-3xl">
                {data.stake}
              </p>
              <div className="mt-6 grid gap-3">
                {data.proof.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
                        <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
                      </div>
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{item.helper}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Stakeholder matrix</p>
              <h2 className="mt-3 max-w-md font-serif text-4xl font-bold leading-tight">
                What changes for each person in the system?
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
                A mechanic only matters if it helps someone make a better decision: join, host, fund, create, return, or trust the room.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {data.roles.map((role) => (
                <Link
                  key={role.role}
                  to={role.href}
                  className="group flex min-h-[17rem] flex-col rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <role.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-bold">{role.role}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-foreground">{role.why}</p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{role.outcome}</p>
                  <span className="mt-5 text-sm font-bold text-primary">{role.action}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-black/10 bg-[#242321] p-5 text-white md:p-8">
            <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">Operating model</p>
                <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">How the value moves</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{data.closing}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {data.steps.map((step) => (
                  <div key={step.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-primary">{step.label}</span>
                    <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Where this shows up</p>
                  <h2 className="mt-3 font-serif text-3xl font-bold">Signals users can recognize</h2>
                </div>
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {data.receipts.map((item) => (
                  <span key={item} className="rounded-full border border-black/10 bg-[#f7f3ed] px-4 py-2 text-sm font-semibold text-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-primary/25 bg-primary/10 p-6 md:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold">The page should not end in explanation.</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The next move is always practical: join something, create something, fund something, or inspect the value record.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {routes.map((route) => (
              <Link
                key={route.title}
                to={route.href}
                className="group rounded-[1.25rem] border border-black/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <route.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{route.title}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{route.text}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
