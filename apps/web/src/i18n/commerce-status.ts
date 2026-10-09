import type { TranslationKey } from "./translations";
const statuses = new Set(["pending", "processing", "paid", "failed", "cancelled", "refunded", "partially_refunded", "unfulfilled", "fulfilled", "pending_payment", "shipped", "ready"]);
export function commerceStatus(t: (key: TranslationKey) => string, value?: string) {
  if (value === "issued" || value === "requires_payment") return t(`web.status.${value}`);
  return t((statuses.has(value || "") ? `cart.status.${value}` : "cart.status.unknown") as TranslationKey);
}

/** Technical receipt types are protocol values; only their presentation is translated. */
export function commerceReceiptType(t: (key: TranslationKey) => string, value?: string) {
  switch (value) {
    case "claim": return t("web.receiptType.claim");
    case "redemption": return t("web.receiptType.redemption");
    case "purchase": return t("web.receiptType.purchase");
    case "reservation": return t("web.receiptType.reservation");
    default: return t("web.receiptType.receipt");
  }
}
