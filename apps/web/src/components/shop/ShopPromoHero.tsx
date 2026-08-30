import { Link } from "react-router-dom";
import { ArrowDown, WalletCards } from "lucide-react";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";
import { formatShopMoney } from "@/lib/shop/partner-offer";

type ShopPromoHeroProps = {
  fromCard: boolean;
  signedIn: boolean;
  available?: number;
  limit?: number;
  holder?: string;
  placesLabel?: string;
  cardNumber?: string;
  preview?: boolean;
  walletHref: string;
};

export function ShopPromoHero({
  fromCard,
  signedIn,
  available,
  limit,
  holder,
  placesLabel,
  cardNumber,
  preview,
  walletHref,
}: ShopPromoHeroProps) {
  const { t, locale } = useI18n();
  const availableLabel = formatShopMoney(available ?? 50, "USD", locale);
  const limitLabel = formatShopMoney(limit ?? 50, "USD", locale);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),linear-gradient(135deg,#0a0a0a,#14110e)] p-5 shadow-2xl md:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">
            {fromCard ? t("market.placesEyebrowFromCard") : t("market.placesEyebrow")}
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl font-black leading-[0.92] tracking-[-0.04em] text-white md:text-6xl">
            {fromCard ? t("market.placesTitleFromCard") : t("market.placesTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 md:text-base">
            {fromCard ? t("market.placesCopyFromCard") : t("market.placesCopy")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <TactileButton variant="primary" size="lg" asChild>
              <a href="#shop-places">
                {t("market.seePlaces")}
                <ArrowDown className="h-4 w-4" />
              </a>
            </TactileButton>
            <TactileButton variant="obsidian" size="lg" asChild>
              <Link to={walletHref}>
                <WalletCards className="h-4 w-4" />
                {signedIn ? t("market.openCard") : t("market.getCard")}
              </Link>
            </TactileButton>
          </div>
        </div>
        <PromoCardFace
          className="mx-auto w-full"
          available={availableLabel}
          limit={limitLabel}
          holder={holder || (signedIn ? t("market.memberCard") : t("market.guestCard"))}
          places={placesLabel || t("market.placesNearby")}
          cardNumber={cardNumber}
          preview={preview}
        />
      </div>
    </section>
  );
}
