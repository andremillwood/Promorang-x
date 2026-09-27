import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Compass, CreditCard, Sparkles, X } from "lucide-react";
import { firstGivenName } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { consumeWelcomeBack } from "@/lib/auth-journey";

const roleJourneys: Record<string, { eyebrow: string; title: string; copy: string; actions: Array<{ label: string; href: string }> }> = {
  participant: { eyebrow: "Your Promorang today", title: "Something worth doing is waiting.", copy: "Start with what is moving nearby, then keep anything useful on your PromoCard.", actions: [{ label: "Open today", href: "/home" }, { label: "Explore nearby", href: "/discover" }, { label: "Open PromoCard", href: "/card" }] },
  creator: { eyebrow: "Creator workspace", title: "Turn your next release into movement.", copy: "Continue in Studio, publish a release, or check the real-world activity it created.", actions: [{ label: "Open Studio", href: "/dashboard?view=studio" }, { label: "Publish a release", href: "/content-drops" }, { label: "View activity", href: "/activity" }] },
  host: { eyebrow: "Host workspace", title: "Make the next room worth showing up for.", copy: "Continue planning, create a Moment, or prepare the door for arrivals.", actions: [{ label: "Open Studio", href: "/dashboard?view=studio" }, { label: "Create a Moment", href: "/create/moment" }, { label: "Open door tools", href: "/staff/scanner" }] },
  merchant: { eyebrow: "Merchant workspace", title: "Put something real on the card.", copy: "Manage your live supply, share a perk, or validate a customer at the counter.", actions: [{ label: "Open Studio", href: "/dashboard?view=studio" }, { label: "Manage inventory", href: "/stock" }, { label: "Validate a code", href: "/staff/scanner" }] },
  brand: { eyebrow: "Brand workspace", title: "Fund action you can prove.", copy: "Return to your programme, shape a new activation, or review the movement it produced.", actions: [{ label: "Open Studio", href: "/dashboard?view=studio" }, { label: "Start a programme", href: "/business/start" }, { label: "View activity", href: "/activity" }] },
  agency: { eyebrow: "Agency workspace", title: "Keep every client outcome moving.", copy: "Return to Studio, begin a client programme, or review active work.", actions: [{ label: "Open Studio", href: "/dashboard?view=studio" }, { label: "Start a programme", href: "/business/start" }, { label: "View proposals", href: "/dashboard/proposals" }] },
};

export function WelcomeBackBrief() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const queued = consumeWelcomeBack();
    if (queued) setRole(queued.role);
  }, [location.key]);

  useEffect(() => {
    if (!role) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRole(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [role]);

  const name = firstGivenName({
    displayName: profile?.full_name || profile?.display_name,
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name,
    email: user?.email,
    fallback: "there",
  });

  if (!role || !user) return null;
  const journey = roleJourneys[role] || roleJourneys.participant;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="welcome-back-title">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#090909] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,.72)] sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ff6500]/20 blur-3xl" />
        <button ref={closeButtonRef} type="button" onClick={() => setRole(null)} aria-label="Close welcome" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6500]"><X className="h-4 w-4" /></button>
        <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#ff8a45]">{journey.eyebrow}</p>
        <h1 id="welcome-back-title" className="mt-5 max-w-xl font-serif text-4xl font-bold leading-[.96] tracking-[-.04em] sm:text-5xl">Welcome back, {name}.</h1>
        <h2 className="mt-5 text-xl font-black tracking-[-.02em] text-white">{journey.title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/62">{journey.copy}</p>
        <div className="mt-7 grid gap-2 sm:grid-cols-3">
          {journey.actions.map((action, index) => {
            const Icon = index === 0 ? Sparkles : index === 1 ? Compass : CreditCard;
            return <Link key={action.href} to={action.href} onClick={() => setRole(null)} className={index === 0 ? "group flex min-h-14 items-center justify-between rounded-xl bg-[#ff6500] px-4 text-sm font-black text-black transition hover:bg-[#ff7a20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" : "group flex min-h-14 items-center justify-between rounded-xl border border-white/14 bg-white/[.04] px-4 text-sm font-bold text-white transition hover:bg-white/[.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6500]"}><span className="flex items-center gap-2"><Icon className="h-4 w-4" />{action.label}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>;
          })}
        </div>
      </section>
    </div>
  );
}
