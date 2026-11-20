import { describe, expect, it } from "vitest";
import { isPromoCardLedgerUnavailable, mapPromoCardLedgerRow, type PromoCardLedgerRow } from "./usePromoCard";

const row: PromoCardLedgerRow = {
  id: "entry-1",
  entry_type: "spend",
  amount: "-10.00",
  currency: "USD",
  balance_after: "35.00",
  business_night: "2026-11-20",
  cycle_id: "2026-11",
  moment_id: "11111111-1111-4111-8111-111111111111",
  order_id: "22222222-2222-4222-8222-222222222222",
  created_at: "2026-11-21T06:30:00.000Z",
  is_test: false,
  metadata: { promocard_title: " Coffee on us " },
};

describe("PromoCard ledger rows", () => {
  it("maps a spend into the activity a member can read", () => {
    expect(mapPromoCardLedgerRow(row)).toEqual({
      id: "entry-1",
      entryType: "spend",
      amount: -10,
      currency: "USD",
      balanceAfter: 35,
      businessNight: "2026-11-20",
      cycleId: "2026-11",
      momentId: "11111111-1111-4111-8111-111111111111",
      orderId: "22222222-2222-4222-8222-222222222222",
      createdAt: "2026-11-21T06:30:00.000Z",
      isTest: false,
      title: "Coffee on us",
    });
  });

  it("treats a missing ledger table as not yet available", () => {
    expect(isPromoCardLedgerUnavailable({ code: "PGRST205", message: "Could not find the table public.promocard_ledger in the schema cache" })).toBe(true);
    expect(isPromoCardLedgerUnavailable({ code: "42501", message: "permission denied for table promocard_ledger" })).toBe(false);
  });

  it("keeps a blank benefit title empty", () => {
    expect(mapPromoCardLedgerRow({ ...row, metadata: { promocard_title: "  " }, is_test: true }).title).toBeNull();
    expect(mapPromoCardLedgerRow({ ...row, metadata: null, is_test: true }).isTest).toBe(true);
  });
});
