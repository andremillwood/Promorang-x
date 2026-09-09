import { Link } from "react-router-dom";
import {
  benefitCtaLabel,
  benefitScarcityLabel,
  presentBenefitDescription,
  presentBenefitHeadline,
  type PromoCardBenefit,
} from "@promorang/shared";

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

function asBenefit(perk: LivePerkLike): PromoCardBenefit {
  const remaining = perk.availableQuantity ?? perk.remainingQuantity ?? null;
  return {
    id: perk.id,
    offerId: perk.offerId || null,
    issuanceId: null,
    dropId: perk.dropSlug || null,
    title: perk.title,
    detail: perk.detail || perk.description || "",
    issuer: {
      id: null,
      type: "merchant",
      name: perk.issuer?.name || perk.merchantName || "Participating place",
    },
    eligibility: {
      who: "everyone",
      perUserLimit: null,
      startsAt: null,
      endsAt: null,
      remaining,
    },
    availableQuantity: remaining,
    budget: null,
    expiresAt: perk.expiresAt || null,
    fulfillmentState: (perk.fulfillmentState as PromoCardBenefit["fulfillmentState"]) || "available",
    fulfillmentType: "merchant_validation",
    redemption: {
      recorded: Boolean(perk.redemption?.recorded),
      code: perk.redemption?.code || null,
      redeemedAt: null,
      redeemedBy: null,
    },
    sharedBy: perk.sharedBy?.name ? { id: null, name: perk.sharedBy.name } : null,
    href: perk.href || "/discover",
    rewardType: perk.rewardType,
    valueAmount: perk.valueAmount,
    valueCurrency: perk.valueCurrency,
    locationLabel: perk.locationLabel,
  };
}

export function LivePerkCard({
  perk,
  intent = "claim",
}: {
  perk: LivePerkLike;
  intent?: "claim" | "share";
}) {
  const href = livePerkHref(perk, intent);
  const benefit = asBenefit(perk);
  const headline = presentBenefitHeadline(benefit);
  const description = presentBenefitDescription(benefit);
  const issuer = benefit.issuer.name;
  const used = perk.redemption?.recorded || perk.fulfillmentState === "redeemed";
  const scarcity = used ? undefined : benefitScarcityLabel(benefit);
  const action = used
    ? "Already used"
    : perk.redemption?.code
      ? "Redeem Benefit"
      : intent === "share"
        ? "Share this perk"
        : benefitCtaLabel(benefit);

  return (
    <Link
      to={href}
      className="block rounded-3xl border border-white/10 bg-white/[0.04] p-5 hover:border-emerald-400/40"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{issuer}</p>
      <p className="mt-1 text-xs text-white/45">
        {perk.availability === "anywhere"
          ? perk.locationLabel || "Anywhere"
          : perk.locationLabel || "Near you"}
      </p>
      <h4 className="mt-2 font-serif text-2xl font-bold uppercase tracking-tight text-white">{headline}</h4>
      {description ? <p className="mt-2 text-sm text-white/55">{description}</p> : null}
      {scarcity || perk.sharedBy?.name ? (
        <p className="mt-4 text-xs text-white/45">
          {[scarcity, perk.sharedBy?.name ? `Shared by ${perk.sharedBy.name}` : null].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      <p className="mt-4 text-sm font-black text-emerald-400">{action}</p>
    </Link>
  );
}
