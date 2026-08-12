export type MerchantLiveOpsListing = {
  id: string;
  name: string;
  linked_moment_id?: string | null;
  inventory_quantity?: number | null;
  is_active?: boolean | null;
};

export type MerchantLiveOpsReceipt = {
  id: string;
  status: string;
  receipt_type: string;
  amount?: number | string | null;
  currency?: string | null;
  attribution?: Record<string, unknown> | null;
};

export type MerchantLiveOpsSummary = {
  activeListings: number;
  lowStock: number;
  soldOut: number;
  needsAction: number;
  fulfilled: number;
  attributedRevenue: number;
};

export function summarizeMerchantLiveOps(listings: MerchantLiveOpsListing[], receipts: MerchantLiveOpsReceipt[]): MerchantLiveOpsSummary {
  const active = listings.filter((item) => item.is_active !== false);
  const quantity = (item: MerchantLiveOpsListing) => item.inventory_quantity == null ? null : Number(item.inventory_quantity);
  return {
    activeListings: active.length,
    lowStock: active.filter((item) => { const value = quantity(item); return value != null && value > 0 && value <= 5; }).length,
    soldOut: active.filter((item) => quantity(item) === 0).length,
    needsAction: receipts.filter((receipt) => ["issued", "pending"].includes(receipt.status)).length,
    fulfilled: receipts.filter((receipt) => receipt.status === "fulfilled").length,
    attributedRevenue: receipts.filter((receipt) => receipt.status === "fulfilled" && receipt.receipt_type === "purchase").reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0),
  };
}
