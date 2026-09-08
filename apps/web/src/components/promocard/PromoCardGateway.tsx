import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  Ticket,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { promoCardGatewayCopy as copy } from "./promoCardGatewayCopy";

export type GatewayPlace = {
  id: string;
  name: string;
  href: string;
};

const stepIcons = [Ticket, MapPin, Sparkles];

export function PromoCardGateway({ places = [] }: { places?: GatewayPlace[] }) {
  const { user } = useAuth();
  const nearby = places.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(245,158,11,0.2),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(255,85,0,0.14),transparent_32%)]" />
      <div className="container relative px-5 pb-10 pt-[5.25rem] sm:px-6 sm:pb-20 sm:pt-28 lg:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <div className="inline-flex max-w-full items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200 sm:rounded-full sm:border sm:border-amber-300/25 sm:bg-amber-300/10 sm:px-3 sm:py-1.5 sm:text-[10px]">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </div>
            <h1 className="mt-4 max-w-2xl font-serif text-[clamp(3.2rem,15vw,6.4rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] sm:mt-5 sm:font-sans sm:leading-[0.86] sm:tracking-[-0.07em]">
              {copy.headlineLead}<br />
              {copy.headlineWhere}<br />
              <span className="text-primary">{copy.headlineReturn}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-white/68 sm:text-lg sm:leading-8">
              {copy.body}
            </p>

            <div className="mt-6 grid gap-2.5 sm:flex sm:gap-3">
              <Link
                to={user ? "/card" : "/auth?mode=signup&next=/card"}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-[0_18px_50px_rgba(255,85,0,0.28)] transition hover:bg-orange-600 active:scale-[0.98]"
              >
                <Ticket className="h-4 w-4" />
                {user ? copy.signedInCta : copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-amber-300/40 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <MapPin className="h-4 w-4 text-amber-300" />
                {copy.nearbyCta}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-amber-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black p-5 shadow-[0_32px_100px_rgba(0,0,0,0.65)] sm:rounded-[1.75rem] sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-500 text-black">
                    <WalletCards className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.12em]">{copy.cardName}</p>
                    <p className="text-[11px] text-white/45">{copy.cardPromise}</p>
                  </div>
                </div>
              </div>

              <div className="my-6 sm:my-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{copy.onTheCard}</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-black tracking-[-0.05em] text-amber-200">{copy.faceAction}</span>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{copy.placesLabel}</p>
                {nearby.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {nearby.map((place) => (
                      <li key={place.id}>
                        <Link
                          to={place.href}
                          className="flex items-center justify-between gap-3 text-sm font-bold text-white/85 transition hover:text-amber-200"
                        >
                          <span className="truncate">{place.name}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-5 text-white/50">{copy.placesEmpty}</p>
                )}
              </div>

              <div className="hidden gap-2.5 sm:grid sm:grid-cols-3">
                {copy.steps.map((step, index) => {
                  const Icon = stepIcons[index];
                  return (
                    <div key={step.title} className="rounded-xl border border-white/10 bg-black/30 p-3.5">
                      <Icon className="h-4 w-4 text-amber-300" />
                      <p className="mt-2 text-xs font-bold">{step.title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-white/45">{step.copy}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-white/45 sm:mt-5 sm:border-t sm:border-white/10 sm:pt-4">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                {copy.completion}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
