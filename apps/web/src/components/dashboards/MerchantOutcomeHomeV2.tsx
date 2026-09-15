import { ArrowRight, BarChart3, CalendarClock, CheckCircle2, Repeat2, ShoppingBag, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerOffers, type Offer } from "@/hooks/useOffers";
import { useMerchantVenues } from "@/hooks/useVenues";
import {
  EvidencePair,
  NextMove,
  OutcomeProgress,
  OutcomeSurface,
  PageLead,
} from "@/components/promorang-v2";

type MerchantGoal = {
  title: string;
  copy: string;
  icon: typeof Store;
  href: string;
};

const goals: MerchantGoal[] = [
  {
    title: "Get more customers",
    copy: "Give new customers a clear reason to visit or buy.",
    icon: Users,
    href: "/dashboard?tab=promotions",
  },
  {
    title: "Bring customers back",
    copy: "Create a reason for a previous customer to return.",
    icon: Repeat2,
    href: "/dashboard?tab=promotions",
  },
  {
    title: "Promote something",
    copy: "Move a specific product, service, menu item, or package.",
    icon: ShoppingBag,
    href: "/dashboard?tab=promotions",
  },
  {
    title: "Fill a slow period",
    copy: "Create demand for the days or hours that need it most.",
    icon: CalendarClock,
    href: "/dashboard?tab=promotions",
  },
];

const isActiveOffer = (offer: Offer) => {
  if (offer.status !== "active") return false;
  if (!offer.ends_at) return true;
  const end = new Date(offer.ends_at).getTime();
  return Number.isNaN(end) || end >= Date.now();
};

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

  const venueCount = venues?.length || 0;
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const businessName = activeOrg?.name || user?.user_metadata?.company_name || user?.user_metadata?.full_name || "Your business";

  const nextMove = venueCount === 0
    ? {
        title: "Add the place where customers will redeem promotions.",
        description: "Once the business location is ready, PROMORANG can connect promotions to verified in-person activity.",
        label: "Set up business",
        href: "/dashboard?tab=business",
      }
    : offers.length === 0
      ? {
          title: "Launch your first customer promotion.",
          description: "Start with the business result. Advanced channels, proof rules and fulfilment mechanics stay behind the promotion workflow.",
          label: "Create promotion",
          href: "/dashboard?tab=promotions",
        }
      : totalRedemptions === 0
        ? {
            title: "Get the live promotion in front of customers.",
            description: "Your next proof point is the first verified redemption. Make sure staff can validate the promotion when a customer arrives.",
            label: "Open verification tools",
            href: "/dashboard?tab=business",
          }
        : {
            title: "Give verified customers a reason to return.",
            description: "You already have proof of customer activity. The next meaningful step is a second verified customer action, not another dashboard metric.",
            label: "Bring customers back",
            href: "/dashboard?tab=promotions",
          };

  const stages = [
    { id: "ready", label: "Business ready", status: venueCount > 0 ? "complete" as const : "current" as const },
    { id: "live", label: "Promotion live", status: activeOffers.length > 0 ? "complete" as const : venueCount > 0 ? "current" as const : "upcoming" as const },
    { id: "customer", label: "First verified customer", status: totalRedemptions > 0 ? "complete" as const : activeOffers.length > 0 ? "current" as const : "upcoming" as const },
    { id: "value", label: "Business value", status: totalRedemptions > 0 ? "current" as const : "upcoming" as const },
    { id: "repeat", label: "Repeat customer", status: "upcoming" as const },
    { id: "economics", label: "Positive economics", status: "upcoming" as const },
  ];

  return (
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)]" data-role="merchant">
      <div className="pr-v2-page space-y-10 py-2 sm:py-4">
        <PageLead
          eyebrow="Merchant · Home"
          title={businessName}
          description="Get customers, bring them back, and see what PROMORANG can actually prove for the business."
          action={
            <Link
              to="/dashboard?tab=promotions"
              className="pr-v2-focusable inline-flex min-h-11 items-center justify-center rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black"
            >
              Create promotion
            </Link>
          }
        />

        <NextMove
          title={nextMove.title}
          description={nextMove.description}
          reason="PROMORANG is using your current business setup and verified customer activity to choose the next useful step."
          action={
            <Link
              to={nextMove.href}
              className="pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black"
            >
              {nextMove.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <section aria-labelledby="merchant-goals" className="space-y-4">
          <div>
            <p className="pr-v2-eyebrow">Choose the outcome</p>
            <h2 id="merchant-goals" className="pr-v2-heading mt-2">What would you like to improve?</h2>
          </div>
          <div className="grid gap-x-8 border-y border-white/10 sm:grid-cols-2">
            {goals.map((goal) => {
              const Icon = goal.icon;
              return (
                <Link
                  key={goal.title}
                  to={goal.href}
                  className="pr-v2-focusable group grid min-h-[128px] grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-3 border-b border-white/10 py-5 sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <span className="grid size-10 place-items-center rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role)/0.12)] text-[hsl(var(--pr-v2-active-role))]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-[hsl(var(--pr-v2-text-1))]">{goal.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{goal.copy}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 text-[hsl(var(--pr-v2-text-3))] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
          <Link to="/dashboard?tab=promotions" className="pr-v2-focusable inline-flex min-h-11 items-center text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">
            More business goals
          </Link>
        </section>

        <OutcomeProgress stages={stages} />

        <EvidencePair
          proof={{
            value: ownerOffers.isLoading ? "…" : totalRedemptions,
            label: "Verified customer actions",
            description: "Confirmed promotion redemptions only. Claims and impressions are not counted as visits.",
          }}
          value={{
            value: "—",
            label: "Attributed sales",
            description: "PROMORANG will show transaction value only when it has actually been captured and attributed.",
          }}
        />

        <section aria-labelledby="merchant-live" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="pr-v2-eyebrow">Right now</p>
              <h2 id="merchant-live" className="pr-v2-heading mt-2">What customers can use now</h2>
            </div>
            <Link to="/dashboard?tab=promotions" className="pr-v2-focusable min-h-11 py-3 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">View promotions</Link>
          </div>

          {ownerOffers.isLoading ? (
            <div role="status" className="h-28 animate-pulse rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-white/[0.03]" aria-label="Loading promotions" />
          ) : activeOffers.length === 0 ? (
            <OutcomeSurface>
              <p className="font-semibold">No live promotion yet.</p>
              <p className="mt-2 text-sm text-[hsl(var(--pr-v2-text-2))]">Choose a customer outcome and publish the first useful reason to act.</p>
              <Link to="/dashboard?tab=promotions" className="pr-v2-focusable mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">Create promotion</Link>
            </OutcomeSurface>
          ) : (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {activeOffers.slice(0, 4).map((offer) => (
                <div key={offer.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[hsl(var(--pr-v2-text-1))]">{offer.title}</p>
                      <span className="rounded-full bg-[hsl(var(--pr-v2-active-role)/0.12)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--pr-v2-active-role))]">Live</span>
                    </div>
                    {offer.description ? <p className="mt-1 text-sm text-[hsl(var(--pr-v2-text-2))]">{offer.description}</p> : null}
                    <p className="mt-2 text-xs text-[hsl(var(--pr-v2-text-3))]">
                      {offer.quantity_redeemed || 0} redeemed · {offer.offer_issuances?.length || offer.quantity_reserved || 0} claimed
                    </p>
                  </div>
                  <Link to="/dashboard?tab=results" className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">
                    View results <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[hsl(var(--pr-v2-text-3))]">Claims</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{ownerOffers.isLoading ? "…" : totalClaims.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--pr-v2-text-3))]">Verified redemptions</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{ownerOffers.isLoading ? "…" : totalRedemptions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--pr-v2-text-3))]">Active promotions</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{ownerOffers.isLoading ? "…" : activeOffers.length.toLocaleString()}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
