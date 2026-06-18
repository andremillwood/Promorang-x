import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MomentValuePath } from "@/components/moments/MomentValuePath";

const actionCards = [
  {
    eyebrow: "Explore",
    title: "Find a moment",
    copy: "For participants: choose a real thing to attend, save, or check into.",
    href: "/explore/moments",
    cta: "Browse moments",
    Icon: MapPin,
  },
  {
    eyebrow: "Create",
    title: "Create a reason to show up",
    copy: "For hosts, creators, and venues: turn a gathering, drop, route, or ritual into a moment.",
    href: "/create/moment",
    cta: "Create moment",
    Icon: CalendarPlus,
  },
  {
    eyebrow: "Unlock",
    title: "Make action count",
    copy: "For everyone: let proof become access, rewards, memory, and stronger future invitations.",
    href: "/promoshare",
    cta: "See value",
    Icon: Sparkles,
  },
];

export function HomeActionStrip() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-10">
      <div className="container px-6">
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">What happens here</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
              One simple loop, different reasons to use it.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Find something worth doing, prove the real-world action, then keep the value that came from showing up.
            </p>
            <MomentValuePath
              variant="detail"
              className="mt-5"
              steps={[
                { label: "Action", detail: "Join, visit, buy, attend" },
                { label: "Proof", detail: "Code, GPS, media, host" },
                { label: "Unlock", detail: "Mark, reward, access" },
              ]}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {actionCards.map((card) => (
              <Link
                key={card.title}
                to={card.href}
                className="group flex min-h-56 flex-col rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <card.Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-primary/80">{card.eyebrow}</p>
                <h3 className="mt-1 font-serif text-xl font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{card.copy}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-primary/15 bg-primary/5 p-5 md:hidden">
            <Button asChild>
              <Link to="/explore/moments">Find moments</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/create/moment">Create moment</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeActionStrip;
