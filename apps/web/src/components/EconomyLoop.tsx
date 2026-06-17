import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gem, Gift, KeyRound, MapPin, Sparkles, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Ticket,
    eyebrow: "1",
    title: "Find your kind of moment",
    description: "Browse drops, tastings, service rituals, creator missions, and neighborhood gatherings that match how you like to spend real time.",
    action: "Browse live moments",
    unlock: "A clear reason to go somewhere now",
    proof: "Intent",
    cta: "Explore moments",
    href: "/explore/moments",
  },
  {
    icon: MapPin,
    eyebrow: "2",
    title: "Show up and leave a Mark",
    description: "Arrive, check in, and let the moment count. Your Mark starts the reward loop without making the night feel like paperwork.",
    action: "Check in on-site",
    unlock: "A verified memory and standing signal",
    proof: "Mark",
    cta: "See check-in flow",
    href: "/moments",
  },
  {
    icon: Sparkles,
    eyebrow: "3",
    title: "Earn standing and access",
    description: "Real participation can become Points, Keys, better access, stronger standing, and eligibility for the moments that fill up first.",
    action: "Build repeat participation",
    unlock: "Early access, Keys, and stronger rank",
    proof: "Standing",
    cta: "View rewards",
    href: "/rewards",
  },
  {
    icon: Gift,
    eyebrow: "4",
    title: "Unlock deeper value",
    description: "Pieces, PromoShare, Gems, rewards, and sponsor-backed perks can follow when your activity helps a moment, place, or campaign grow.",
    action: "Contribute value to the room",
    unlock: "Pieces, Gems, reward eligibility",
    proof: "Outcome",
    cta: "Open PromoShare",
    href: "/promoshare",
  },
  {
    icon: Gem,
    eyebrow: "5",
    title: "Come back with more history",
    description: "The more you return, refer, create, and verify, the more Promorang remembers what you helped make happen.",
    action: "Return, refer, or create",
    unlock: "A stronger profile people can trust",
    proof: "History",
    cta: "Create a moment",
    href: "/create-moment",
  },
];

const explainerCards = [
  {
    icon: KeyRound,
    title: "Keys",
    text: "Keys help open moments, rewards, and offers where space or value is limited.",
    href: "/economy/keys",
  },
  {
    icon: Sparkles,
    title: "Pieces",
    text: "Pieces give early, consistent, or high-signal participation a lasting place to live.",
    href: "/economy/pieces",
  },
  {
    icon: Users,
    title: "Network value",
    text: "Your crew, referrals, content, and repeat movement can make moments stronger over time.",
    href: "/economy/network",
  },
];

export function EconomyLoop() {
  const [activeStep, setActiveStep] = useState(0);
  const selectedStep = steps[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute left-0 top-8 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="container relative z-10 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/80">How The Economy Works</p>
          <h2 className="mt-4 font-serif text-3xl font-bold md:text-5xl">
            Simple enough for a night out. Built to remember what you helped create.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Promorang starts with people finding things worth showing up for. From there, Marks, Keys, Pieces, PromoShare, Gems, and your network help the value stick around after the moment ends.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated">
          <div className="grid lg:grid-cols-[0.42fr_0.58fr]">
            <div className="border-b border-border bg-background/70 p-4 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Choose an action</p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{activeStep + 1} / {steps.length}</span>
              </div>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                      activeStep === index
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-transparent bg-card hover:border-border hover:bg-secondary"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        activeStep === index ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      )}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Step {step.eyebrow}</p>
                      <p className="font-semibold leading-tight">{step.action}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden bg-charcoal p-6 text-white sm:p-8 lg:p-10">
              <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
              <div className="relative z-10">
                <div className="mb-7 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-primary">
                      <selectedStep.icon className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-[0.18em]">{selectedStep.proof}</span>
                    </div>
                    <h3 className="font-serif text-3xl font-bold leading-tight md:text-5xl">{selectedStep.title}</h3>
                    <p className="mt-5 text-base leading-8 text-zinc-300">{selectedStep.description}</p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/15 bg-white/[0.08] p-5 lg:w-72">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Unlocks</p>
                    <p className="mt-3 font-serif text-2xl font-bold text-white">{selectedStep.unlock}</p>
                    <Button variant="hero" className="mt-6 w-full" asChild>
                      <Link to={selectedStep.href}>
                        {selectedStep.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {explainerCards.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-all hover:border-primary/40 hover:bg-white/[0.1]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/25 text-primary">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{item.text}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-16 overflow-hidden rounded-3xl bg-charcoal p-8 text-center shadow-elevated md:p-14">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-accent/20" />
          <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-primary/30 blur-[90px]" />
          <div className="relative z-10">
            <h3 className="font-serif text-3xl font-bold italic text-white md:text-4xl">
              Ready to find your first Mark?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-zinc-200">
              Start with one moment. Let the night, the people, and the proof become something you can come back to.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="xl" className="rounded-2xl px-10 font-bold uppercase tracking-widest shadow-glow" asChild>
                <Link to="/explore/moments">Find Moments</Link>
              </Button>
              <Button variant="ghost" size="lg" className="font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/economy/keys">See What Keys Do</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EconomyLoop;
