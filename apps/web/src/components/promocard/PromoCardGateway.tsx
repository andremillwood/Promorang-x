import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, Ticket, WalletCards } from "lucide-react";
import {
  aimedEmptyPresentation,
  canUseBenefit,
  emptyPromoBenefitPresentation,
  inferPromoCardAim,
  presentPromoBenefit,
  PROMOCARD_AIMS,
  promoCardAimPath,
  promoCardUnlockHref,
  selectAimedBenefit,
  type PromoCardAim,
  type PromoCardBenefit,
} from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPromoCard, useNearbyBenefits } from "@/hooks/usePeopleExperience";
import { useVisitorLocation } from "@/hooks/useVisitorLocation";
import { ALL_CITY_HUBS } from "@/lib/city-hubs";
import { resolveStoredPromoCardAim, writePromoCardAim } from "@/lib/promocard-aim";
import { PromoBenefitCard } from "@/components/promocard/PromoBenefitCard";

function nearbyMarketLabel(visitorCity?: string | null) {
  const city = String(visitorCity || "").trim();
  if (!city || city === "Global") return null;
  const needle = city.toLowerCase();
  const known = ALL_CITY_HUBS.some((hub) => {
    const name = hub.name.toLowerCase();
    const slug = hub.id.replace(/-/g, " ");
    return name.includes(needle) || needle.includes(slug) || needle.includes(name.split("&")[0].trim());
  });
  return known ? city : null;
}

export function PromoCardGateway() {
  const { user } = useAuth();
  const nearby = useNearbyBenefits();
  const card = useMyPromoCard();
  const visitorCity = useVisitorLocation();
  const [searchParams] = useSearchParams();
  const [aim, setAim] = useState<PromoCardAim | null>(() => resolveStoredPromoCardAim(searchParams));

  const useThis = (card.data?.useThis || null) as PromoCardBenefit | null;
  const nearbyBenefits = ((nearby.data || []) as PromoCardBenefit[]).filter(Boolean);
  const nextBenefit = (card.data?.nextBenefit || nearbyBenefits[0] || null) as PromoCardBenefit | null;
  const featured = selectAimedBenefit({ aim, useThis, nearby: nearbyBenefits, nextBenefit });
  const claimed = Boolean(featured && useThis && featured.id === useThis.id && canUseBenefit(useThis));
  const loading = nearby.isLoading || Boolean(user && card.isLoading && !card.data && !nearby.data);
  const unlockAim = aim || inferPromoCardAim(featured);
  const unlockHref = promoCardUnlockHref({
    authenticated: Boolean(user),
    aim: unlockAim,
    next: promoCardAimPath(unlockAim),
  });
  const presented = featured
    ? {
        ...presentPromoBenefit(featured, {
          authenticated: Boolean(user),
          claimed,
          unlock: !user,
        })!,
        href: user ? featured.href || promoCardAimPath(unlockAim) : unlockHref,
      }
    : aim
      ? aimedEmptyPresentation({
          aim,
          authenticated: Boolean(user),
          href: unlockHref,
        })
      : emptyPromoBenefitPresentation({
          authenticated: Boolean(user),
          href: user ? "/card" : promoCardUnlockHref({ next: "/card" }),
        });

  const marketLabel = nearbyMarketLabel(visitorCity);
  const nearbyLabel = marketLabel
    ? `See What’s Available in ${marketLabel}`
    : "See What’s Available Nearby";

  const canUnlock = Boolean(aim || featured);
  const primaryHref = user ? (claimed ? "/card" : promoCardAimPath(aim)) : unlockHref;
  const primaryLabel = user
    ? claimed
      ? presented?.ctaLabel || "View My PromoCard"
      : aim
        ? "Unlock this"
        : "View My PromoCard"
    : canUnlock
      ? "Unlock this"
      : "Get My PromoCard";

  function chooseAim(next: PromoCardAim) {
    writePromoCardAim(next);
    setAim(next);
  }

  const moreCount = Math.max(0, nearbyBenefits.filter((item) => item.id !== featured?.id).length);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(255,85,0,0.2),transparent_30%),radial-gradient(circle_at_18%_82%,rgba(214,178,90,0.12),transparent_32%)]" />
      <div className={`container relative px-5 pt-[5.25rem] sm:px-6 sm:pb-20 sm:pt-28 lg:pt-32 ${user ? "pb-10" : "pb-24"}`}>
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">PromoCard</p>
            <h1 className="mt-3 max-w-2xl font-serif text-[clamp(2.5rem,12vw,6.2rem)] font-black uppercase leading-[0.84] tracking-[-0.065em] sm:mt-4 sm:font-sans sm:leading-[0.86] sm:tracking-[-0.07em]">
              There’s something<br />
              <span className="text-primary">for you.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-white/68 sm:mt-5 sm:text-lg sm:leading-8">
              Your PromoCard unlocks offers around you — plus shop drops, digital events, and new music that work anywhere.
            </p>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                What should your card open?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROMOCARD_AIMS.map((item) => {
                  const active = aim?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseAim(item)}
                      className={`min-h-10 rounded-full border px-3.5 text-sm font-bold transition active:scale-[0.98] ${
                        active
                          ? "border-amber-300 bg-amber-300 text-black"
                          : "border-white/15 bg-white/[0.04] text-white hover:border-amber-300/40 hover:bg-white/[0.08]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:mt-6 sm:flex sm:gap-3">
              <Link
                to={primaryHref}
                className={`${user ? "inline-flex" : "hidden sm:inline-flex"} min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-[0_18px_50px_rgba(255,85,0,0.28)] transition hover:bg-orange-600 active:scale-[0.98]`}
              >
                <Ticket className="h-4 w-4" />
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-primary/40 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <MapPin className="h-4 w-4 text-amber-300" />
                {nearbyLabel}
              </Link>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Use it. More comes back.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-[radial-gradient(circle,rgba(255,85,0,0.22),rgba(214,178,90,0.1),transparent_70%)] blur-3xl" />
            <div className="relative">
              {loading && !featured ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black p-5 sm:rounded-[1.75rem] sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">PromoCard</p>
                      <p className="text-sm text-white/45">Looking for live benefits…</p>
                    </div>
                  </div>
                  <div className="mt-6 h-16 rounded-lg bg-white/5" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-white/5" />
                </div>
              ) : presented ? (
                <PromoBenefitCard
                  presentation={presented}
                  moreCount={moreCount}
                  showLoopLine={!presented.empty}
                />
              ) : null}
            </div>
            <p className="relative mt-4 flex items-start gap-2 text-[10px] leading-4 text-white/45">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
              Payment, gift activation and recharge are not customer completions. The merchant’s recorded redemption is.
            </p>
          </div>
        </div>

        <details className="group relative mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-black/30 px-4 py-3 lg:mx-0 lg:max-w-md">
          <summary className="cursor-pointer list-none text-sm font-bold text-white/75 [&::-webkit-details-marker]:hidden">
            How PromoCard works
            <span className="ml-2 text-xs font-medium text-white/40 group-open:hidden">Show</span>
            <span className="ml-2 hidden text-xs font-medium text-white/40 group-open:inline">Hide</span>
          </summary>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-white/60">
            <li>1. Claim a benefit.</li>
            <li>2. Use it at the participating business.</li>
            <li>3. The business confirms the redemption.</li>
            <li>4. New opportunities continue to appear.</li>
          </ol>
          <p className="mt-3 text-[11px] leading-5 text-white/40">
            A completed merchant redemption is what qualifies — not payment, gift activation, or a recharge.
          </p>
        </details>
      </div>

      {!user ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#070707]/95 px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-2">
            <Link
              to={primaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(255,85,0,0.28)] active:scale-[0.98]"
            >
              <WalletCards className="h-4 w-4" />
              {canUnlock ? "Unlock this" : "Get My PromoCard"}
            </Link>
            <Link
              to="/discover"
              aria-label={nearbyLabel}
              className="grid min-h-12 min-w-12 place-items-center rounded-xl border border-white/15 bg-white text-black active:bg-white/90"
            >
              <MapPin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
