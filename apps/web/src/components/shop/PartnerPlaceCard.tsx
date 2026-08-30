import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";
import { formatShopGems, formatShopMoney, type PartnerOfferTerms } from "@/lib/shop/partner-offer";

type PartnerPlaceCardProps = {
  href: string;
  name: string;
  place: string;
  image?: string | null;
  preview?: boolean;
  terms: PartnerOfferTerms;
};

export function PartnerPlaceCard({ href, name, place, image, preview, terms }: PartnerPlaceCardProps) {
  const { t, locale } = useI18n();
  const gemPrice = formatShopGems(terms.gemPrice, locale);
  const shopKeeps = formatShopMoney(terms.shopNets, terms.currency, locale);
  const fundedBy = terms.funding === "brand" ? t("market.fundedByBrand") : t("market.fundedByShop");

  return (
    <article className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#12100d]">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-white/[0.04]">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-white/20">
            <MapPin className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
        <span className="absolute left-3 top-3 rounded-full bg-[#f3efe6]/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#3d2a1e]">
          {preview ? t("market.previewPlace") : t("market.gemPlace")}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-100">
          {fundedBy}
        </span>
      </Link>
      <div className="p-5">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          <MapPin className="h-3 w-3" />
          {place}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-tight text-white">
          <Link to={href}>{name}</Link>
        </h2>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-white/10 py-3 text-center">
          <div>
            <dt className="text-[9px] font-black uppercase tracking-wider text-white/40">{t("market.payWithGems")}</dt>
            <dd className="mt-1 text-sm font-black text-amber-200">{gemPrice}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-black uppercase tracking-wider text-white/40">{t("market.shopKeeps")}</dt>
            <dd className="mt-1 text-sm font-black text-emerald-200">{shopKeeps}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-black uppercase tracking-wider text-white/40">{t("market.platformFee")}</dt>
            <dd className="mt-1 text-sm font-black text-white">{formatShopMoney(terms.platformFee, terms.currency, locale)}</dd>
          </div>
        </dl>
        <TactileButton variant="primary" className="mt-4 w-full" asChild>
          <Link to={href}>{t("market.useHere")}</Link>
        </TactileButton>
      </div>
    </article>
  );
}
