import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCommerceActions } from "./useCommerceActions";
import { withI18n } from "@/test/withI18n";
import { translations } from "@/i18n/translations";

const mocks = vi.hoisted(() => ({ toast: vi.fn(), fetch: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "test-only" } } }) } } }));
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", mocks.fetch); });
afterEach(() => vi.unstubAllGlobals());

describe.each(["en", "es-419", "pt-BR"] as const)("commerce feedback in %s", locale => {
  const wrapper = ({ children }: { children: ReactNode }) => withI18n(children, locale);
  it("localizes a reservation receipt without changing request IDs, method or credential", async () => {
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ redemption_code: "RECEIPT-123" }) });
    const { result } = renderHook(useCommerceActions, { wrapper });
    await act(async () => { await result.current.purchase("product-original", 12, "reservation"); });
    const body = JSON.parse(mocks.fetch.mock.calls[0][1].body);
    expect(body).toMatchObject({ product_id: "product-original", sale_type: "reservation", amount_paid: 0, points_paid: 0 });
    expect(mocks.toast).toHaveBeenCalledWith({ title: translations[locale]["web.receiptReady"], description: translations[locale]["web.redemptionCode"].replace("{{code}}", "RECEIPT-123") });
  });
  it("localizes the saved-offer receipt and preserves its code", async () => {
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: { redemption: { redemption_code: "OFFER-123" } } }) });
    const { result } = renderHook(useCommerceActions, { wrapper });
    await act(async () => { await result.current.claim("offer-original", "unified"); });
    expect(mocks.fetch.mock.calls[0][0]).toContain("/offers/offer-original/claim");
    expect(mocks.toast).toHaveBeenCalledWith({ title: translations[locale]["web.offerSavedCard"], description: translations[locale]["web.redemptionCode"].replace("{{code}}", "OFFER-123") });
  });
  it("does not expose an English server failure as the localized toast", async () => {
    mocks.fetch.mockResolvedValue({ ok: false, json: async () => ({ error: "Internal database failure" }) });
    const { result } = renderHook(useCommerceActions, { wrapper });
    await act(async () => { await expect(result.current.purchase("product-original", 12)).rejects.toThrow(); });
    expect(mocks.toast).toHaveBeenCalledWith({ title: translations[locale]["web.couldNotComplete"], description: translations[locale]["web.tryAgain"], variant: "destructive" });
  });
});
