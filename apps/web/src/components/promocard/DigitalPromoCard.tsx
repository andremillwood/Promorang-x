import React from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { firstGivenName, issuanceFromPromoCardPerk, isPresentablePass, resolvePromoCardFace, type PromoCardPerk } from "@promorang/shared";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { PromoCardActions } from "@/components/promocard/PromoCardActions";
import { OfferIssuancePass } from "@/components/offers/OfferIssuancePass";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { useAuth } from "@/contexts/AuthContext";
import type { OfferIssuance } from "@/hooks/useOffers";

interface DigitalPromoCardProps {
  onCardUpdate?: (card: Record<string, unknown>) => void;
  isPreviewData?: boolean;
}

export const DigitalPromoCard: React.FC<DigitalPromoCardProps> = ({ isPreviewData }) => {
  const { user, profile } = useAuth();
  const cardQuery = useMyPromoCard();
  const data = cardQuery.data;
  const isPreview = isPreviewData ?? !data;
  const useThis = data?.useThis || null;
  const nearby = data?.nearby || [];
  const nextBenefit = data?.nextBenefit || nearby[0] || null;
  const holder = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName: profile?.full_name || profile?.display_name || user?.user_metadata?.full_name,
    username: profile?.username,
    email: user?.email,
    fallback: "there",
  });
  const livePasses = ((data?.perks || []) as PromoCardPerk[])
    .map((perk) => issuanceFromPromoCardPerk(perk))
    .filter((issuance): issuance is NonNullable<typeof issuance> =>
      Boolean(issuance && isPresentablePass(issuance.offers.fulfillment_type, issuance.status)),
    );
  const otherJourneys = ((data?.perks || []) as PromoCardPerk[])
    .map((perk) => issuanceFromPromoCardPerk(perk))
    .filter((issuance): issuance is NonNullable<typeof issuance> =>
      Boolean(issuance && !isPresentablePass(issuance.offers.fulfillment_type, issuance.status)),
    );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      {isPreview ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3.5 py-3 text-xs leading-5 text-amber-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            <strong>Live card only:</strong> {user ? "claim a merchant benefit to put something on this card." : "sign in to see perks you can actually use."} There is no preview balance, recharge, or gift activation.
          </p>
        </div>
      ) : null}

      <PromoCardFace
        model={resolvePromoCardFace({
          holder: holder === "there" ? "Your card" : holder,
          useThis,
          nearbyCount: nearby.length,
          nextBenefitTitle: nextBenefit?.title,
        })}
      />

      <PromoCardActions useThis={useThis} nearbyCount={nearby.length} nextBenefit={nextBenefit} />

      {useThis?.redemption?.code ? (
        <section className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Use this</p>
          <p className="mt-2 font-serif text-2xl font-bold text-white">{useThis.title}</p>
          <code className="mt-3 block text-2xl font-black tracking-[0.16em] text-white">{useThis.redemption.code}</code>
          <p className="mt-2 text-sm text-white/60">The merchant records this. A toast or local balance change is not a redemption.</p>
        </section>
      ) : (
        <Link to="/discover" className="block rounded-2xl border border-white/10 px-5 py-4 text-sm text-white/65">
          Available nearby — claim a benefit from a participating business, then bring it back here to use.
        </Link>
      )}

      {livePasses.length || otherJourneys.length ? (
        <section className="space-y-4">
          {livePasses.map((issuance) => (
            <OfferIssuancePass key={issuance.id} issuance={issuance as OfferIssuance} />
          ))}
          {otherJourneys.map((issuance) => (
            <OfferIssuancePass key={issuance.id} issuance={issuance as OfferIssuance} />
          ))}
        </section>
      ) : null}

      <p className="text-xs text-white/40">
        Points and tiers stay below the actions. {Number(data?.points || 0).toLocaleString()} PromoPoints after verified use.
      </p>
    </div>
  );
};
