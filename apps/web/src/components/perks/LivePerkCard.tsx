import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import {
  presentBenefitDescription,
  presentBenefitHeadline,
  type PromoCardBenefit,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { localizedBenefitCta, localizedBenefitScarcity } from "@/i18n/localize";

export type LivePerkLike = {
  id: string;
  title: string;
  detail?: string | null;
  description?: string | null;
  issuer?: { name?: string | null } | null;
  merchantName?: string | null;
  availableQuantity?: number | null;
  remainingQuantity?: number | null;
  dropSlug?: string | null;
  href?: string | null;
  offerId?: string | null;
  sharedBy?: { name?: string | null } | null;
  redemption?: { code?: string | null; recorded?: boolean } | null;
  fulfillmentState?: string | null;
  expiresAt?: string | null;
  rewardType?: string | null;
  valueAmount?: number | null;
  valueCurrency?: string | null;
  locationLabel?: string | null;
  availability?: "local" | "anywhere" | null;
  surface?: "place" | "commerce" | "digital" | "release" | null;
};

export function livePerkHref(perk: LivePerkLike, intent: "claim" | "share" = "claim") {
  if (perk.redemption?.recorded || perk.fulfillmentState === "redeemed") return "/card";
  if (perk.redemption?.code) return "/card";
  if (intent === "share" && perk.offerId) return `/give?offer=${encodeURIComponent(perk.offerId)}`;
  if (perk.href) return perk.href;
  if (perk.dropSlug) return `/drop/${perk.dropSlug}`;
  if (perk.offerId) return intent === "share" ? `/give?offer=${encodeURIComponent(perk.offerId)}` : "/discover?tab=perks";
  return "/discover?tab=perks";
}

function asBenefit(perk: LivePerkLike, participatingPlace: string): PromoCardBenefit {
  const remaining = perk.availableQuantity ?? perk.remainingQuantity ?? null;
  return {
    id: perk.id,
    offerId: perk.offerId || null,
    issuanceId: null,
    dropId: perk.dropSlug || null,
    title: perk.title,
    detail: perk.detail || perk.description || "",
    issuer: { id: null, type: "merchant", name: perk.issuer?.name || perk.merchantName || participatingPlace },
    eligibility: { who: "everyone", perUserLimit: null, startsAt: null, endsAt: null, remaining },
    availableQuantity: remaining,
    budget: null,
    expiresAt: perk.expiresAt || null,
    fulfillmentState: (perk.fulfillmentState as PromoCardBenefit["fulfillmentState"]) || "available",
    fulfillmentType: "merchant_validation",
    redemption: { recorded: Boolean(perk.redemption?.recorded), code: perk.redemption?.code || null, redeemedAt: null, redeemedBy: null },
    sharedBy: perk.sharedBy?.name ? { id: null, name: perk.sharedBy.name } : null,
    href: perk.href || "/discover",
    rewardType: perk.rewardType,
    valueAmount: perk.valueAmount,
    valueCurrency: perk.valueCurrency,
    locationLabel: perk.locationLabel,
  };
}

export function LivePerkCard({ perk, intent = "claim" }: { perk: LivePerkLike; intent?: "claim" | "share" }) {
  const { t, formatDate } = useI18n();
  const href = livePerkHref(perk, intent);
  const benefit = asBenefit(perk, t("perk.participatingPlace"));
  const headline = presentBenefitHeadline(benefit);
  const description = presentBenefitDescription(benefit);
  const issuer = benefit.issuer.name;
  const used = perk.redemption?.recorded || perk.fulfillmentState === "redeemed";
  const scarcity = used ? undefined : localizedBenefitScarcity(benefit, t, formatDate);
  const action = localizedBenefitCta(benefit, t, { used, hasCode: Boolean(perk.redemption?.code), intent });
  const place = perk.availability === "anywhere" ? perk.locationLabel || t("discover.anywhere") : perk.locationLabel || t("perk.nearYou");

  return (
    <Link to={href} className="pr-world-object group block min-h-[260px] p-5 sm:p-6">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="pr-world-kicker text-emerald-300">{issuer}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-white/34"><MapPin className="h-3.5 w-3.5" />{place}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] ${used ? "border-white/10 text-white/35" : "border-emerald-300/25 bg-emerald-300/[.06] text-emerald-200"}`}>{used ? "Used" : "Available"}</span>
          </div>

          <h4 className="mt-5 max-w-[92%] font-serif text-[2rem] font-bold leading-[.96] tracking-[-.045em] text-white transition group-hover:text-emerald-200">{headline}</h4>
          {description ? <p className="mt-3 max-w-xl text-sm leading-6 text-white/48">{description}</p> : null}
        </div>

        <div className="mt-7 border-t border-white/10 pt-4">
          {scarcity || perk.sharedBy?.name ? <p className="text-[10px] leading-5 text-white/35">{[scarcity, perk.sharedBy?.name ? t("perk.sharedBy", { name: perk.sharedBy.name }) : null].filter(Boolean).join(" · ")}</p> : null}
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs font-black text-emerald-300">{action}</span>
            <ArrowRight className="h-4 w-4 text-emerald-300 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
