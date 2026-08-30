import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    icon: MapPin,
    title: "Find a participating place",
    copy: "See the exact offer and minimum purchase before you go.",
  },
  {
    icon: QrCode,
    title: "Use your PromoCard",
    copy: "Apply promotional balance, then pay the remainder normally.",
  },
  {
    icon: RefreshCw,
    title: "Recharge through action",
    copy: "Verified check-ins, reviews, Moments and shares can reload value.",
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
              Promorang’s member spending benefit
            </div>
            <h1 className="mt-4 max-w-2xl font-serif text-[clamp(3.2rem,15vw,6.4rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] sm:mt-5 sm:font-sans sm:leading-[0.86] sm:tracking-[-0.07em]">
              Spend less.<br />
              <span className="text-primary">Do more.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-white/68 sm:text-lg sm:leading-8">
              PromoCard gives members promotional spending balance at participating restaurants, events and local businesses.
            </p>

            <div className="mt-5 border-l-2 border-emerald-300/60 pl-3 sm:mt-6 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.04] sm:p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="text-sm font-bold">Not a loan. No cash repayment.</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    Each participating merchant sets its own offer, minimum purchase and availability. Eligible promotional value is shown before checkout.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-2.5 sm:flex sm:gap-3">
              <Link
                to={user ? "/wallet" : "/auth?mode=signup&next=/wallet"}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-[0_18px_50px_rgba(255,85,0,0.28)] transition hover:bg-orange-600 active:scale-[0.98]"
              >
                <WalletCards className="h-4 w-4" />
                {user ? "Open my PromoCard" : "Get my PromoCard"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop?from=promocard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-amber-300/40 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <Store className="h-4 w-4 text-amber-300" />
                See where to use it
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
                    <p className="text-sm font-black uppercase tracking-[0.12em]">PromoCard</p>
                    <p className="text-[11px] text-white/45">Promotional spending balance</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/65">
                  Example
                </span>
              </div>

              <div className="my-6 sm:my-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Example member benefit</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-black tracking-[-0.05em] text-amber-200">Up to $50</span>
                  <span className="pb-1 text-xs text-white/45">subject to eligibility</span>
                </div>
              </div>

              <div className="hidden gap-2.5 sm:grid sm:grid-cols-3">
                {steps.map((step) => (
                  <div key={step.title} className="rounded-xl border border-white/10 bg-black/30 p-3.5">
                    <step.icon className="h-4 w-4 text-amber-300" />
                    <p className="mt-2 text-xs font-bold">{step.title}</p>
                    <p className="mt-1 text-[10px] leading-4 text-white/45">{step.copy}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3 sm:hidden">
                {[
                  [MapPin, "Find"],
                  [QrCode, "Use"],
                  [RefreshCw, "Recharge"],
                ].map(([Icon, label]) => {
                  const StepIcon = Icon as typeof MapPin;
                  return <div key={label as string} className="flex flex-col items-center gap-1.5 text-[10px] font-bold text-white/65"><StepIcon className="h-4 w-4 text-amber-300" />{label as string}</div>;
                })}
              </div>

              <div className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-white/45 sm:mt-5 sm:border-t sm:border-white/10 sm:pt-4">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                Promotional balances, recharge amounts and participating locations vary. Your account shows the value currently available to you.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
