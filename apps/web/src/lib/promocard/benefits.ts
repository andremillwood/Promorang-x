export type CardPerk = {
  id: string;
  offerId?: string;
  issuerId?: string | null;
  issuerName?: string | null;
  title: string;
  detail?: string;
  terms?: string | null;
  status: string;
  ready?: boolean;
  section?: "ready" | "pending" | "history";
  redemptionCode?: string | null;
  expiresAt?: string | null;
  redeemedAt?: string | null;
  fulfillmentType?: string | null;
};

export function canPresentPerk(perk: CardPerk, now = Date.now()): boolean {
  const expiry = perk.expiresAt ? Date.parse(perk.expiresAt) : null;
  return perk.status === "claimed"
    && (expiry === null || (Number.isFinite(expiry) && expiry > now))
    && ["code", "merchant_validation"].includes(perk.fulfillmentType || "code")
    && Boolean(perk.redemptionCode);
}

export function perkSection(perk: CardPerk, now = Date.now()): "ready" | "pending" | "history" {
  if (canPresentPerk(perk, now)) return "ready";
  const expiry = perk.expiresAt ? Date.parse(perk.expiresAt) : null;
  if (expiry !== null && (!Number.isFinite(expiry) || expiry <= now)) return "history";
  return ["issued", "claimed", "fulfillment_pending"].includes(perk.status) ? "pending" : "history";
}
