import { Link } from "react-router-dom";
import {
  presentBenefitDescription,
  presentBenefitHeadline,
  type PromoCardBenefit,
} from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { localizedBenefitCta, localizedBenefitScarcity } from "@/i18n/localize";
import { OpportunityCard } from "@/components/promorang-v2";

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
    issuer: {
      id: null,
      type: "merchant",
      name: perk.issuer?.name || perk.merchantName || participatingPlace,
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

function formatValue(perk: LivePerkLike) {
  if (!perk.valueAmount) return null;
  const currency = perk.valueCurrency || "JMD";
  if (currency.toUpperCase() === "JMD") return `J$${Number(perk.valueAmount).toLocaleString()}`;
  return `${currency.toUpperCase()} ${Number(perk.valueAmount).toLocaleString()}`;
}

export function LivePerkCard({
  perk,
  intent = "claim",
}: {
  perk: LivePerkLike;
  intent?: "claim" | "share";
}) {
  const { t, formatDate } = useI18n();
  const href = livePerkHref(perk, intent);
  const benefit = asBenefit(perk, t("perk.participatingPlace"));
  const headline = presentBenefitHeadline(benefit);
  const description = presentBenefitDescription(benefit);
  const issuer = benefit.issuer.name;
  const used = Boolean(perk.redemption?.recorded || perk.fulfillmentState === "redeemed");
  const scarcity = used ? undefined : localizedBenefitScarcity(benefit, t, formatDate);
  const action = localizedBenefitCta(benefit, t, {
    used,
    hasCode: Boolean(perk.redemption?.code),
    intent,
  });
  const location = perk.availability === "anywhere"
    ? perk.locationLabel || t("discover.anywhere")
    : perk.locationLabel || t("perk.nearYou");
  const proof = used
    ? "Recorded use"
    : perk.redemption?.code
      ? "Credential ready"
      : "Merchant validates use";

  return (
    <OpportunityCard
      context={issuer}
      status={used ? "Used" : location}
      title={headline}
      description={description || undefined}
      value={formatValue(perk) || scarcity || undefined}
      proof={proof}
      action={
        <Link
          to={href}
          className="pr-v2-focusable inline-flex min-h-11 items-center justify-center rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-4 text-sm font-bold text-black"
        >
          {action}
        </Link>
      }
      footer={perk.sharedBy?.name ? t("perk.sharedBy", { name: perk.sharedBy.name }) : undefined}
    />
  );
}
