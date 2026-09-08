import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";

const steps = [
  {
    icon: Ticket,
    title: "Use this",
    copy: "Show the claimed perk. The merchant records it.",
  },
  {
    icon: MapPin,
    title: "Available nearby",
    copy: "Only participating businesses with live inventory.",
  },
  {
    icon: Sparkles,
    title: "Get your next benefit",
    copy: "After a real redemption, come back for the next one.",
  },
];

export function PromoCardGateway() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(245,158,11,0.2),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(255,85,0,0.14),transparent_32%)]" />
      <div className="container relative px-5 pb-10 pt-[5.25rem] sm:px-6 sm:pb-20 sm:pt-28 lg:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200 sm:rounded-full sm:border sm:border-amber-300/25 sm:bg-amber-300/10 sm:px-3 sm:py-1.5 sm:text-[10px]">
              <Sparkles className="h-3.5 w-3.5" />
              Ambassador audience → verified customers
            </div>
            <h1 className="mt-4 max-w-2xl font-serif text-[clamp(3.2rem,15vw,6.4rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] sm:mt-5 sm:font-sans sm:leading-[0.86] sm:tracking-[-0.07em]">
              Use this.<br />
              <span className="text-primary">Come back.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-white/68 sm:text-lg sm:leading-8">
              A merchant supplies a benefit. An ambassador shares it. You claim it. The merchant validates it. That recorded use is the only completion.
            </p>

            <div className="mt-6 grid gap-2.5 sm:flex sm:gap-3">
              <Link
                to={user ? "/card" : "/auth?mode=signup&next=/card"}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-[0_18px_50px_rgba(255,85,0,0.28)] transition hover:bg-orange-600 active:scale-[0.98]"
              >
                <Ticket className="h-4 w-4" />
                {user ? "Use this" : "Get my PromoCard"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-amber-300/40 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <MapPin className="h-4 w-4 text-amber-300" />
                Available nearby
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-primary/20 blur-3xl" />
            <PromoCardFace
              className="relative max-w-none"
              holder="Your card"
              available="Use this"
              limit="A live perk"
              places="Participating businesses"
              action="Use this"
            />
            <div className="relative mt-4 hidden gap-2.5 sm:grid sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="rounded-xl border border-white/10 bg-black/30 p-3.5">
                  <step.icon className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-bold">{step.title}</p>
                  <p className="mt-1 text-[10px] leading-4 text-white/45">{step.copy}</p>
                </div>
              ))}
            </div>
            <p className="relative mt-4 flex items-start gap-2 text-[10px] leading-4 text-white/45">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
              Payment, gift activation and recharge are not customer completions. The merchant’s recorded redemption is.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
