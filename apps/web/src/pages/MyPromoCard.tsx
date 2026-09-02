import { Link, useLocation } from "react-router-dom";
import { PROMOCARD_COPY, offerFromOpportunity, resolvePromoCardSurface } from "@promorang/shared";
import { useMyPromoCard, useOpportunities } from "@/hooks/usePeopleExperience";
import { useMarket } from "@/contexts/MarketContext";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { PromoCardPresent } from "@/components/promocard/PromoCardPresent";

export default function MyPromoCard() {
  const card = useMyPromoCard();
  const opportunities = useOpportunities();
  const { country } = useMarket();
  const location = useLocation();
  const data = card.data;
  const previewPresent = location.pathname.startsWith("/app-preview")
    && new URLSearchParams(location.search).get("demo") === "present";

  const surface = resolvePromoCardSurface({
    holder: previewPresent ? "Andre Millwood" : data?.name || "Member",
    spendable: previewPresent ? 16 : Number(data?.spendable ?? data?.card?.available_balance ?? 0),
    limit: previewPresent ? 40 : Number(data?.limit ?? data?.card?.monthly_limit ?? 0),
    cardNumber: previewPresent ? "8842" : data?.cardNumber || data?.card?.card_number,
    currency: country.currency,
    perks: previewPresent
      ? [{ id: "preview-perk", title: "2-for-1 Friday", detail: "Show this with your PromoCard." }]
      : data?.perks || [],
    nextOffer: data?.nextOffer?.title
      ? data.nextOffer
      : offerFromOpportunity(opportunities.data?.[0]),
  });

  const copy = surface.mode === "present" ? PROMOCARD_COPY.present : PROMOCARD_COPY.offer;

  if (card.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <ExperienceShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      backTo="/dashboard"
    >
      <PromoCardPresent surface={surface} />

      {surface.mode === "offer" ? (
        <p className="text-center text-sm text-white/40">
          <Link to="/wallet" className="font-bold text-white/60 hover:text-white">
            Refill lives in the wallet
          </Link>
          — Points and Keys, not the card face.
        </p>
      ) : data?.memberships?.length ? (
        <section>
          <h2 className="font-serif text-2xl font-bold">Rooms you belong to</h2>
          <div className="mt-3 space-y-2">
            {data.memberships.map((item: { id: string; slug?: string; title: string; role?: string }) => (
              <Link
                key={item.id}
                to={item.slug ? `/scenes/${item.slug}` : "/scenes"}
                className="block rounded-[1.4rem] border border-white/10 px-4 py-4"
              >
                <p className="font-serif text-xl font-bold">{item.title}</p>
                <p className="text-xs uppercase tracking-widest text-white/40">{item.role}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </ExperienceShell>
  );
}
