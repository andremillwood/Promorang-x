import { ArrowRight, BarChart3, CalendarClock, Repeat2, ShoppingBag, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerOffers, type Offer } from "@/hooks/useOffers";
import { useMerchantVenues } from "@/hooks/useVenues";
import { OutcomeProgress, OutcomeSurface } from "@/components/promorang-v2";
import { resolveMerchantNextMove, resolveMerchantOutcomeStages } from "@/lib/merchant-outcome";

type MerchantGoal = {
  title: string;
  copy: string;
  icon: typeof Store;
  href: string;
};

const goals: MerchantGoal[] = [
  { title: "Get more customers", copy: "Put your business in front of people with a reason to act.", icon: Users, href: "/dashboard?tab=promotions" },
  { title: "Bring customers back", copy: "Turn a first visit into a real reason to return.", icon: Repeat2, href: "/dashboard?tab=promotions" },
  { title: "Promote something", copy: "Move a product, service, menu item or package.", icon: ShoppingBag, href: "/dashboard?tab=promotions" },
  { title: "Fill a slow period", copy: "Create demand when you need it most.", icon: CalendarClock, href: "/dashboard?tab=promotions" },
];

const isActiveOffer = (offer: Offer) => {
  if (offer.status !== "active") return false;
  if (!offer.ends_at) return true;
  const end = new Date(offer.ends_at).getTime();
  return Number.isNaN(end) || end >= Date.now();
};

const nextMoveCopy = {
  setup: { description: "Get the business location ready so PROMORANG can connect promotions to verified activity.", label: "Set up business" },
  launch: { description: "Choose the customer result first. PROMORANG can handle the mechanics underneath it.", label: "Create promotion" },
  verify: { description: "Your next proof point is the first verified redemption. Make sure staff can validate it when the customer arrives.", label: "Open verification tools" },
  repeat: { description: "You already have proof of customer activity. The next meaningful move is getting someone to come back.", label: "Bring customers back" },
} as const;

export default function MerchantOutcomeHomeV2() {
  const { user, organizations, activeOrgId } = useAuth();
  const ownerOffers = useOwnerOffers();
  const { data: venues } = useMerchantVenues();

  const offers = ownerOffers.data || [];
  const activeOffers = useMemo(() => offers.filter(isActiveOffer), [offers]);
  const totalRedemptions = useMemo(
    () => offers.reduce((sum, offer) => sum + (offer.quantity_redeemed || offer.offer_issuances?.filter((item) => item.status === "redeemed").length || 0), 0),
    [offers],
  );
  const totalClaims = useMemo(
    () => offers.reduce((sum, offer) => sum + (offer.offer_issuances?.length || offer.quantity_reserved || 0), 0),
    [offers],
  );

  const facts = {
    venueCount: venues?.length || 0,
    offerCount: offers.length,
    activeOfferCount: activeOffers.length,
    totalRedemptions,
  };
  const resolvedNextMove = resolveMerchantNextMove(facts);
  const nextMove = { ...resolvedNextMove, ...nextMoveCopy[resolvedNextMove.id] };
  const stages = resolveMerchantOutcomeStages(facts);
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const businessName = activeOrg?.name || user?.user_metadata?.company_name || user?.user_metadata?.full_name || "Your business";
  const featured = activeOffers[0];

  return (
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)]" data-role="merchant">
      <div className="pr-v2-page space-y-9 py-3 sm:py-5">
        <header className="pr-v2-cinematic-hero px-5 py-7 sm:px-8 sm:py-9">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="pr-v2-kicker">Merchant · {businessName}</p>
              <h1 className="pr-v2-editorial-title mt-4 max-w-[13ch] text-white">What do you want to improve?</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/58">Choose a business outcome. PROMORANG should make the system complexity disappear behind that choice.</p>
            </div>
            <Link to="/dashboard?tab=promotions" className="pr-v2-focusable pr-v2-primary-cta inline-flex items-center justify-center gap-2 px-6">
              Create promotion <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <Link key={goal.title} to={goal.href} className={`pr-v2-focusable group rounded-[var(--pr-v2-radius-module)] border p-5 transition ${index === 0 ? "border-[#ff874f]/55 bg-[#ff6b35]/9 shadow-[0_0_28px_rgba(255,107,53,.08)]" : "border-white/10 bg-black/18 hover:border-white/20"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className={`grid size-10 place-items-center rounded-full ${index === 0 ? "bg-[#ff6b35]/15 text-[#ff8a60]" : "bg-white/[.055] text-white/60"}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/28 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 font-serif text-xl font-semibold tracking-[-.03em] text-white">{goal.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/48">{goal.copy}</p>
                </Link>
              );
            })}
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(270px,.65fr)]">
          <div className="pr-v2-object-frame overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#ff814f]/25 bg-[#ff6b35]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[.15em] text-[#ff895e]">{featured ? "Live now" : "Your next move"}</span>
              <span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/34">PROMORANG business signal</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-.045em] text-white sm:text-4xl">{featured?.title || nextMove.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">{featured?.description || nextMove.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to={featured ? "/dashboard?tab=results" : nextMove.href} className="pr-v2-focusable pr-v2-primary-cta inline-flex items-center justify-center gap-2 px-6">
                {featured ? "View live promotion" : nextMove.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <span className="text-xs leading-5 text-white/35">PROMORANG is using actual setup and verified customer activity—not impression counts—to choose this.</span>
            </div>
          </div>

          <div className="pr-v2-object-frame divide-y divide-white/10 p-5 sm:p-6">
            <div className="pb-4">
              <p className="pr-v2-kicker">Verified activity</p>
              <p className="mt-2 text-4xl font-semibold tracking-[-.045em] text-white">{ownerOffers.isLoading ? "…" : totalRedemptions.toLocaleString()}</p>
              <p className="mt-1 text-sm text-white/42">confirmed redemptions</p>
            </div>
            <div className="py-4">
              <p className="text-xs text-white/38">Claims</p>
              <p className="mt-1 text-2xl font-semibold text-white">{ownerOffers.isLoading ? "…" : totalClaims.toLocaleString()}</p>
            </div>
            <div className="pt-4">
              <p className="text-xs text-white/38">Attributed sales</p>
              <p className="mt-1 text-2xl font-semibold text-white/35">—</p>
              <p className="mt-1 text-[11px] leading-5 text-white/30">Connect transaction evidence before PROMORANG claims revenue.</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="pr-v2-kicker">Your business progression</p>
              <h2 className="pr-v2-editorial-heading mt-2 text-white">What has actually been proven</h2>
            </div>
            <Link to="/dashboard?tab=results" className="pr-v2-focusable min-h-11 py-3 text-xs font-black uppercase tracking-[.14em] text-[#d6ad69]">How it works</Link>
          </div>
          <div className="pr-v2-object-frame p-5 sm:p-6">
            <OutcomeProgress stages={stages} label="" />
          </div>
        </section>

        <section aria-labelledby="merchant-live" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="pr-v2-kicker">Customer-facing now</p>
              <h2 id="merchant-live" className="pr-v2-editorial-heading mt-2 text-white">Live promotions</h2>
            </div>
            <Link to="/dashboard?tab=promotions" className="pr-v2-focusable min-h-11 py-3 text-xs font-black uppercase tracking-[.14em] text-[#d6ad69]">See all</Link>
          </div>

          {ownerOffers.isLoading ? (
            <div role="status" className="h-32 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" aria-label="Loading promotions" />
          ) : activeOffers.length === 0 ? (
            <OutcomeSurface>
              <p className="font-semibold">No live promotion yet.</p>
              <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">Choose a customer outcome and publish the first useful reason to act.</p>
              <Link to="/dashboard?tab=promotions" className="pr-v2-focusable mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">Create promotion</Link>
            </OutcomeSurface>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {activeOffers.slice(0, 4).map((offer) => (
                <article key={offer.id} className="pr-v2-world-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.13em] text-emerald-300">Live</span>
                        <span className="text-[10px] uppercase tracking-[.13em] text-white/30">Promotion</span>
                      </div>
                      <h3 className="mt-3 font-serif text-2xl font-semibold tracking-[-.035em] text-white">{offer.title}</h3>
                      {offer.description ? <p className="mt-2 text-sm leading-6 text-white/45">{offer.description}</p> : null}
                    </div>
                    <BarChart3 className="h-5 w-5 shrink-0 text-[#d6ad69]" aria-hidden="true" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div><p className="text-[10px] uppercase tracking-[.12em] text-white/30">Redeemed</p><p className="mt-1 text-xl font-semibold text-white">{offer.quantity_redeemed || 0}</p></div>
                    <div><p className="text-[10px] uppercase tracking-[.12em] text-white/30">Claimed</p><p className="mt-1 text-xl font-semibold text-white">{offer.offer_issuances?.length || offer.quantity_reserved || 0}</p></div>
                  </div>
                  <Link to="/dashboard?tab=results" className="pr-v2-focusable mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#ff895e]">View results <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
