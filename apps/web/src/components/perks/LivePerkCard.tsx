import { Link } from "react-router-dom";

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
};

export function livePerkHref(perk: LivePerkLike, intent: "claim" | "share" = "claim") {
  if (perk.redemption?.recorded || perk.fulfillmentState === "redeemed") return "/card";
  if (perk.redemption?.code) return "/card";
  if (intent === "share" && perk.offerId) return `/give?offer=${encodeURIComponent(perk.offerId)}`;
  if (perk.href) return perk.href;
  if (perk.dropSlug) return `/drop/${perk.dropSlug}`;
  if (perk.offerId) return intent === "share" ? `/give?offer=${encodeURIComponent(perk.offerId)}` : "/earn";
  return "/earn";
}

export function LivePerkCard({
  perk,
  intent = "claim",
}: {
  perk: LivePerkLike;
  intent?: "claim" | "share";
}) {
  const href = livePerkHref(perk, intent);
  const issuer = perk.issuer?.name || perk.merchantName || "Participating business";
  const remaining = perk.availableQuantity ?? perk.remainingQuantity;
  const used = perk.redemption?.recorded || perk.fulfillmentState === "redeemed";
  const action = used
    ? "Already used"
    : perk.redemption?.code
      ? "Use this on PromoCard"
      : intent === "share"
        ? "Share this perk"
        : perk.dropSlug
          ? "Claim this drop"
          : "Take this opportunity";

  return (
    <Link
      to={href}
      className="block rounded-3xl border border-white/10 bg-white/[0.04] p-5 hover:border-emerald-400/40"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{issuer}</p>
      <h4 className="mt-2 font-serif text-2xl font-bold text-white">{perk.title}</h4>
      {perk.detail || perk.description ? (
        <p className="mt-2 text-sm text-white/55">{perk.detail || perk.description}</p>
      ) : null}
      <p className="mt-4 text-xs text-white/45">
        {used
          ? "Merchant already recorded this"
          : remaining != null
            ? `${remaining} remaining`
            : "Open inventory"}
        {perk.sharedBy?.name ? ` · Shared by ${perk.sharedBy.name}` : ""}
      </p>
      <p className="mt-4 text-sm font-black text-emerald-400">{action}</p>
    </Link>
  );
}
