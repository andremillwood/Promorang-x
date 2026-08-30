import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { usePromoCard } from "@/hooks/usePromoCard";
import { useI18n } from "@/i18n/I18nContext";
import { isSampleCommerceListing } from "@/lib/commerce-provenance";
import { PromoCardService } from "@/lib/promocard";
import {
  isPreviewPartnerListing,
  isPromoCardShopIntent,
  listingMatchesShopLens,
  partnerOfferTerms,
  resolveShopLens,
  shopIndexHref,
  shopListingHref,
  shopListingsForSurface,
  SHOP_PLACE_LENSES,
  type ShopPlaceLens,
} from "@/lib/shop/partner-offer";
import { KINGSTON_EXPERIENCE_LISTINGS, type CommerceListing } from "@/lib/shop/preview-partners";
import { PartnerPlaceCard } from "@/components/shop/PartnerPlaceCard";
import { ShopAccountLoop } from "@/components/shop/ShopAccountLoop";
import { ShopLoopContinue } from "@/components/shop/ShopLoopContinue";
import { ShopPromoHero } from "@/components/shop/ShopPromoHero";

export type { CommerceListing };
export { KINGSTON_EXPERIENCE_LISTINGS };

const LENS_LABEL_KEYS: Record<ShopPlaceLens, "market.lensAll" | "market.lensFood" | "market.lensNights" | "market.lensExperiences" | "market.lensServices"> = {
  all: "market.lensAll",
  food: "market.lensFood",
  nights: "market.lensNights",
  experiences: "market.lensExperiences",
  services: "market.lensServices",
};

const Marketplace = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { category: categoryParam } = useParams();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const from = searchParams.get("from");
  const fromCard = isPromoCardShopIntent(from);
  const activeLens = resolveShopLens(categoryParam, searchParams.get("lens"));

  const cardQuery = usePromoCard(user?.id);
  const previewCard = PromoCardService.getCardSummary(user?.id);
  const card = cardQuery.data || previewCard;
  const cardIsPreview = !cardQuery.data;

  const commerceQuery = useQuery({
    queryKey: ["marketplace-commerce-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_commerce_directory")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(80);

      if (error) throw error;
      return (data || []) as CommerceListing[];
    },
  });

  const momentsQuery = useQuery({
    queryKey: ["shop-nearby-moments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("id,title,location,venue_name,starts_at")
        .eq("is_active", true)
        .order("starts_at", { ascending: true, nullsFirst: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });

  const realListings = useMemo(
    () => (commerceQuery.data || []).filter((listing) => !isSampleCommerceListing(listing)),
    [commerceQuery.data],
  );
  const sampleListings = useMemo(() => {
    const dbSamples = (commerceQuery.data || []).filter(isSampleCommerceListing);
    return dbSamples.length > 0 ? dbSamples : KINGSTON_EXPERIENCE_LISTINGS;
  }, [commerceQuery.data]);
  const { listings: sourceListings, showingPreviews } = shopListingsForSurface(realListings, sampleListings);

  const listings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sourceListings.filter((listing) => {
      const matchesSearch =
        !query ||
        [
          listing.name,
          listing.description,
          listing.category,
          listing.merchant_name,
          listing.venue_name,
          listing.city,
          listing.location,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesSearch && listingMatchesShopLens(listing, activeLens);
    });
  }, [sourceListings, searchQuery, activeLens]);

  const nearbyMoment = momentsQuery.data?.[0];
  const walletHref = user ? "/wallet" : "/auth?mode=signup&next=/wallet";

  return (
    <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-16 pt-4 animate-in fade-in duration-700 sm:px-6 lg:px-8">
      <ShopPromoHero
        fromCard={fromCard}
        signedIn={Boolean(user)}
        available={card.availableBalance}
        limit={card.monthlyLimit}
        holder={card.cardHolderName}
        placesLabel={
          showingPreviews
            ? t("market.previewPlacesLabel")
            : t("market.livePlacesLabel", { count: String(realListings.length || card.acceptedLocationsCount || 0) })
        }
        cardNumber={card.cardNumber}
        preview={cardIsPreview}
        walletHref={walletHref}
      />

      <ShopAccountLoop signedIn={Boolean(user)} walletHref={walletHref} />

      <div id="shop-places" className="space-y-4 scroll-mt-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav aria-label={t("market.placeLenses")} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SHOP_PLACE_LENSES.map((lens) => (
              <Link
                key={lens}
                to={shopIndexHref({ from, lens })}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black transition ${
                  activeLens === lens
                    ? "border-primary bg-primary text-white"
                    : "border-white/10 bg-white/[0.05] text-white/65 hover:border-primary/50 hover:text-white"
                }`}
              >
                {t(LENS_LABEL_KEYS[lens])}
              </Link>
            ))}
          </nav>
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("market.searchPlaces")}
              className="rounded-xl border-border/40 bg-card pl-10 focus:ring-primary/20"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {showingPreviews ? (
          <p className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100">
            {t("market.previewBanner")}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {commerceQuery.isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-[1.6rem] border border-white/10 bg-white/[0.04]" />
              ))
            : listings.length === 0
              ? (
                  <div className="col-span-full rounded-[1.6rem] border border-dashed border-white/15 px-6 py-16 text-center">
                    <h2 className="font-serif text-2xl font-black text-white">{t("market.noPlaces")}</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-white/50">{t("market.noPlacesCopy")}</p>
                  </div>
                )
              : listings.map((listing) => {
                  const terms = partnerOfferTerms(listing, card.availableBalance);
                  return (
                    <PartnerPlaceCard
                      key={listing.listing_id}
                      href={shopListingHref(listing.listing_id || listing.source_id || "", from)}
                      name={listing.name || t("market.localMerchant")}
                      place={listing.venue_name || listing.merchant_name || listing.city || t("market.localMerchant")}
                      image={listing.image_url}
                      preview={isPreviewPartnerListing(listing)}
                      terms={terms}
                    />
                  );
                })}
        </div>
      </div>

      <ShopLoopContinue
        showingPreviews={showingPreviews || realListings.length === 0}
        signedIn={Boolean(user)}
        nearbyMoment={
          nearbyMoment
            ? {
                id: nearbyMoment.id,
                title: nearbyMoment.title || t("market.nearbyFallback"),
                place: nearbyMoment.venue_name || nearbyMoment.location || t("market.placesNearby"),
                href: `/moments/${nearbyMoment.id}`,
              }
            : null
        }
      />
    </main>
  );
};

export default Marketplace;
