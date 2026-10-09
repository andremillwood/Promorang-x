import type { TranslationKey } from "./translations";
const statuses = new Set(["pending", "processing", "paid", "failed", "cancelled", "refunded", "partially_refunded", "unfulfilled", "fulfilled", "pending_payment", "shipped", "ready"]);
export function commerceStatus(t: (key: TranslationKey) => string, value?: string) {
  return t((statuses.has(value || "") ? `cart.status.${value}` : "cart.status.unknown") as TranslationKey);
}
