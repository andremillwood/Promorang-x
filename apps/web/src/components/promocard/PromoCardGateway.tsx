import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Store, WalletCards } from "lucide-react";
import { PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { useAuth } from "@/contexts/AuthContext";
import {
  FALLBACK_MEMBERSHIP_HIGHLIGHTS,
  MEMBERSHIP_LANES,
  membershipHighlightKicker,
  type MembershipHighlight,
} from "@/lib/promocard/membership-hero";
import { promoCardActionHref } from "@/lib/promocard/public-path";

type PromoCardGatewayProps = {
  highlights?: MembershipHighlight[];
};

export function PromoCardGateway({ highlights }: PromoCardGatewayProps) {
  const { user } = useAuth();
  const primaryHref = promoCardActionHref(Boolean(user));
  const membershipHighlights = highlights?.length ? highlights : FALLBACK_MEMBERSHIP_HIGHLIGHTS;
  const [activeHighlight, setActiveHighlight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const highlight = membershipHighlights[activeHighlight % membershipHighlights.length];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || membershipHighlights.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveHighlight((current) => (current + 1) % membershipHighlights.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [membershipHighlights.length, reduceMotion]);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(245,158,11,0.2),transparent_30%),radial-gradient(circle_at_15%_85%,rgba(255,85,0,0.14),transparent_32%)]" />
      <div className="container relative px-5 pb-10 pt-[5.25rem] sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-amber-200 sm:rounded-full sm:border sm:border-amber-300/25 sm:bg-amber-300/10 sm:px-3 sm:py-1.5 sm:text-[10px]">
              <WalletCards className="h-3.5 w-3.5" />
              Promorang membership · led by PromoCard
            </div>
            <h1 className="mt-4 max-w-2xl font-serif text-[clamp(3.2rem,15vw,6.4rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] sm:mt-5 sm:font-sans sm:leading-[0.86] sm:tracking-[-0.07em]">
              Spend less.<br />
              <span className="text-primary">Do more.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-white/68 sm:text-lg sm:leading-8">
              Membership starts with promotional spend at participating places. Moments, shares and access refill the card so the next outing costs less.
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
                to={primaryHref}
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
            <div className="relative space-y-4">
              <PromoCardFace
                className="mx-auto w-full max-w-none"
                available="$50.00"
                limit="$50.00"
                holder={user ? "Member card" : "Guest preview"}
                places="Partner places, Moments, shares"
                cardNumber="PR · MEMBER"
                preview={!user}
              />

              <Link to={highlight.href} className="block transition hover:-translate-y-0.5">
                <TicketPass
                  kicker={membershipHighlightKicker(highlight.kind)}
                  title={highlight.title}
                  detail={highlight.detail}
                  stub={highlight.stub}
                  stubLabel={highlight.kind === "place" ? "Card" : highlight.kind === "share" ? "Share" : "Go"}
                />
              </Link>

              {membershipHighlights.length > 1 ? (
                <div className="flex items-center justify-between gap-3 px-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                    Also open with membership
                  </p>
                  <div className="flex gap-1.5">
                    {membershipHighlights.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`Show ${item.title}`}
                        aria-current={activeHighlight === index}
                        onClick={() => setActiveHighlight(index)}
                        className={`h-2.5 rounded-full transition ${activeHighlight === index ? "w-7 bg-primary" : "w-2.5 bg-white/25 hover:bg-white/45"}`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="px-1 text-[10px] leading-4 text-white/40">
                Example member benefit. Promotional balances, recharge amounts and participating locations vary.
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="What membership also opens" className="mt-8 border-t border-white/10 pt-6 sm:mt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/80">
            PromoCard first. The rest of Promorang comes with it.
          </p>
          <ol className="mt-5 grid gap-0 md:grid-cols-4">
            {MEMBERSHIP_LANES.map((lane, index) => (
              <li
                key={lane.kicker}
                className="relative border-l border-white/10 px-4 py-3 md:border-l-0 md:border-t md:px-3 md:pt-7"
              >
                <span className="absolute -left-2 top-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black md:-top-2 md:left-3">
                  {index + 1}
                </span>
                <Link to={lane.href} className="group block">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-amber-200/80">{lane.kicker}</p>
                  <p className="mt-1.5 font-serif text-lg font-bold leading-tight text-white group-hover:text-amber-100">
                    {lane.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-white/55">{lane.detail}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black text-primary">
                    {lane.stub}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
