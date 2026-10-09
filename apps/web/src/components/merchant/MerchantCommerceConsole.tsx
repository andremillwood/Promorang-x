import { commerceStatus, commerceReceiptType } from "@/i18n/commerce-status";
import type { TranslationKey } from "@/i18n/translations";
import { currentUiLocale } from "@/i18n/geo-locale";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Bookmark, Gift, PackageCheck, QrCode, Receipt, RefreshCw, ShoppingBag, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { summarizeMerchantLiveOps, type MerchantLiveOpsListing } from "@promorang/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type Sale = {
  id: string;
  sale_type?: string | null;
  status: string;
  amount_paid?: number | string | null;
  points_paid?: number | string | null;
  redemption_code?: string | null;
  created_at: string;
  merchant_products?: {
    name?: string | null;
    category?: string | null;
  } | null;
};

type ReceiptRow = {
  id: string;
  receipt_type: string;
  status: string;
  amount: number | string;
  currency: string;
  redemption_code?: string | null;
  occurred_at: string;
  attribution?: {
    source?: string;
    coupon_code?: string;
    payment_method?: string;
    [key: string]: unknown;
  } | null;
  merchant_products?: {
    name?: string | null;
    image_url?: string | null;
    category?: string | null;
    fulfillment_mode?: string | null;
  } | null;
};

type MerchantPaymentOrder = {
  id: string;
  payment_status: string;
  total_amount: number | string;
  currency: string;
  reservation_expires_at: string;
  merchant_payment_reference?: string | null;
  metadata?: { merchant_payment_display_name?: string; merchant_payment_instructions?: string } | null;
  commerce_order_items?: Array<{ product_name: string; quantity: number }>;
};

const money = (amount: number | string | null | undefined, currency = "USD") => {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(currentUiLocale(), { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
};

const receiptLabel = (receipt: ReceiptRow, t: (key: TranslationKey) => string) => {
  if (receipt.merchant_products?.name) return receipt.merchant_products.name;
  if (receipt.receipt_type === "claim") return `${t("web.offerClaimed")}${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
  if (receipt.receipt_type === "redemption") return `${t("web.offerRedeemed")}${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
  return commerceReceiptType(t, receipt.receipt_type);
};

const DIRECT_METHODS = [
  ["cash_on_pickup", "web.cashPickup"],
  ["card_terminal_pickup", "web.cardPickup"],
  ["lynk_at_venue", "web.lynkVenue"],
  ["bank_transfer", "web.bankTransfer"],
  ["merchant_payment_link", "web.merchantLink"],
  ["cash_on_delivery", "web.cashDelivery"],
] as const;

export function MerchantCommerceConsole({ onOpenProducts, onOpenValidation }: { onOpenProducts?: () => void; onOpenValidation?: () => void }) {
  const { t: webT, formatNumber } = useWebI18n();
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ["merchant-sales-console"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/sales`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.loadSalesError"));
      return data as Sale[];
    },
  });

  const receiptsQuery = useQuery({
    queryKey: ["merchant-commerce-receipts"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/receipts`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.loadReceiptsError"));
      return (data.receipts || []) as ReceiptRow[];
    },
  });

  const liveOpsQuery = useQuery({
    queryKey: ["merchant-live-ops"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/live-ops`, { headers: { Authorization: `Bearer ${session!.access_token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.loadOperationsError"));
      return data as { listings: MerchantLiveOpsListing[]; receipts: ReceiptRow[]; moments: Array<{ id: string; title: string }>; live_moment_ids: string[] };
    },
  });
  const merchantPaymentOrders = useQuery({
    queryKey: ["merchant-payment-orders"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/commerce/merchant-payment-orders`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.loadOrdersError"));
      return (data.orders || []) as MerchantPaymentOrder[];
    },
  });
  const directMethods = useQuery({
    queryKey: ["merchant-direct-payment-methods"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/commerce/direct-payment-methods`, { headers: { Authorization: `Bearer ${session!.access_token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.loadPaymentSettingsError"));
      return data.methods as Array<{ method_type: string; active: boolean; instructions?: string | null; payment_link?: string | null }>;
    },
  });
  const saveDirectMethod = useMutation({
    mutationFn: async ({ type, label, active }: { type: string; label: string; active: boolean }) => {
      const existing = directMethods.data?.find((method) => method.method_type === type);
      const instructions = active ? window.prompt(webT("web.paymentInstructions", { method: label }), existing?.instructions || "") : existing?.instructions || "";
      if (active && instructions === null) throw new Error(webT("web.cancelled"));
      const paymentLink = type === "merchant_payment_link" && active
        ? window.prompt(webT("web.pastePaymentLink"), existing?.payment_link || "") : existing?.payment_link || "";
      if (type === "merchant_payment_link" && active && !paymentLink) throw new Error(webT("web.paymentLinkRequired"));
      const response = await fetch(`${API_URL}/api/merchant/commerce/direct-payment-methods/${type}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: label, instructions, payment_link: paymentLink, active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.savePaymentError"));
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["merchant-direct-payment-methods"] }),
  });
  const confirmMerchantPayment = useMutation({
    mutationFn: async ({ orderId, reference }: { orderId: string; reference: string }) => {
      const response = await fetch(`${API_URL}/api/merchant/commerce/merchant-payment-orders/${orderId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.confirmPaymentError"));
      return data;
    },
    onSuccess: () => {
      toast({ title: webT("web.paymentConfirmed"), description: webT("web.paidReceiptIssued") });
      queryClient.invalidateQueries({ queryKey: ["merchant-payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-commerce-receipts"] });
    },
    onError: (error) => toast({ title: webT("web.paymentNotConfirmed"), description: webT("web.tryAgain"), variant: "destructive" }),
  });
  const awaitingMerchantPayments = (merchantPaymentOrders.data || []).filter((order) =>
    order.payment_status === "requires_payment" && new Date(order.reservation_expires_at).getTime() > Date.now()
  );
  const casesQuery = useQuery({
    queryKey: ["merchant-commerce-cases"], enabled: !!session?.access_token,
    queryFn: async () => { const response = await fetch(`${API_URL}/api/support/merchant/commerce-cases`, { headers: { Authorization: `Bearer ${session!.access_token}` } }); const data = await response.json(); if (!response.ok) throw new Error(webT("web.loadCasesError")); return data.cases as Array<any>; },
  });
  const openCases = (casesQuery.data || []).filter((item) => ["open", "in_progress"].includes(item.status));
  const respondToCase = async (caseId: string) => {
    const message = window.prompt(webT("web.merchantResponsePrompt"));
    if (!message?.trim()) return;
    const response = await fetch(`${API_URL}/api/support/merchant/commerce-cases/${caseId}/respond`, { method: "POST", headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await response.json();
    if (!response.ok) return toast({ title: webT("web.responseNotSent"), description: webT("web.tryAgain"), variant: "destructive" });
    toast({ title: webT("web.responseRecorded"), description: webT("web.reviewCase") });
    casesQuery.refetch();
  };

  const updateReceiptStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: "fulfilled" | "cancelled" | "refunded"; note?: string }) => {
      const response = await fetch(`${API_URL}/api/merchant/receipts/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(webT("web.updateReceiptError"));
      return data.receipt as ReceiptRow;
    },
    onSuccess: (_receipt, variables) => {
      toast({
        title: variables.status === "fulfilled" ? webT("web.receiptFulfilled") : variables.status === "cancelled" ? webT("web.receiptCancelled") : webT("web.receiptRefunded"),
        description: webT("web.queueUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-commerce-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-sales-console"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-live-ops"] });
    },
    onError: (error) => {
      toast({
        title: webT("web.updateReceiptError"),
        description: webT("web.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const changeReceiptStatus = (receipt: ReceiptRow, status: "fulfilled" | "cancelled" | "refunded") => {
    const action = status === "fulfilled" ? "mark this receipt fulfilled" : status === "cancelled" ? "cancel this receipt" : "mark this receipt refunded";
    if (status !== "fulfilled" && !window.confirm(webT(status === "cancelled" ? "web.confirmCancelReceipt" : "web.confirmRefundReceipt"))) return;
    updateReceiptStatus.mutate({ id: receipt.id, status, note: `Merchant chose to ${action} from Commerce Console.` });
  };

  const sales = salesQuery.data || [];
  const receipts = receiptsQuery.data || [];
  const pendingSales = sales.filter((sale) => sale.status === "pending").slice(0, 6);
  const pendingReceipts = receipts.filter((receipt) => ["issued", "pending"].includes(receipt.status)).slice(0, 6);
  const fulfilledReceipts = receipts.filter((receipt) => receipt.status === "fulfilled");
  const fulfilledPurchaseValue = receipts
    .filter((receipt) => receipt.receipt_type === "purchase" && receipt.status === "fulfilled")
    .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
  const recentActivity = receipts.slice(0, 8);
  const liveOps = summarizeMerchantLiveOps(liveOpsQuery.data?.listings || [], liveOpsQuery.data?.receipts || []);
  const liveMomentNames = (liveOpsQuery.data?.moments || []).filter((moment) => liveOpsQuery.data?.live_moment_ids.includes(moment.id)).map((moment) => moment.title);
  const pressuredListings = (liveOpsQuery.data?.listings || []).filter((item) => item.inventory_quantity != null && Number(item.inventory_quantity) <= 5).slice(0, 5);

  const stats = [
    { label: webT("web.openReservations"), value: pendingSales.length.toLocaleString(currentUiLocale()), icon: Bookmark, helper: webT("web.awaitingValidation") },
    { label: webT("web.fulfilledReceipts"), value: fulfilledReceipts.length.toLocaleString(currentUiLocale()), icon: BadgeCheck, helper: webT("web.completedPurchases") },
    { label: webT("web.fulfilledValue"), value: money(fulfilledPurchaseValue), icon: ShoppingBag, helper: webT("web.fulfilledValueHelp") },
    { label: webT("web.needsAttention"), value: pendingReceipts.length.toLocaleString(currentUiLocale()), icon: QrCode, helper: webT("web.issuedClaims") },
  ];

  const isLoading = salesQuery.isLoading || receiptsQuery.isLoading;

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden border-orange-500/25 bg-[#11100e] text-white">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-orange-400">{webT("web.liveOperations")}</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{liveMomentNames.length ? liveMomentNames.join(" · ") : webT("web.counterNow")}</h2><p className="mt-2 max-w-xl text-sm text-white/55">{webT("web.staffAttention")}</p></div>
            <Button onClick={onOpenValidation} className="bg-orange-500 text-black hover:bg-orange-400"><QrCode className="mr-2 h-4 w-4" />{webT("web.openScannerCount")} {liveOps.needsAction} {webT("web.waiting")}</Button>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[[webT("web.available"),liveOps.activeListings],[webT("web.lowStock"),liveOps.lowStock],[webT("web.soldOut"),liveOps.soldOut],[webT("web.needsAction"),liveOps.needsAction],[webT("web.fulfilled"),liveOps.fulfilled],[webT("web.attributed"),money(liveOps.attributedRevenue)]].map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><p className="text-xl font-black">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{label}</p></div>)}
          </div>
          {pressuredListings.length ? <div className="mt-4 flex flex-wrap gap-2" aria-label={webT("web.stockAttention")}>{pressuredListings.map((item)=><button key={item.id} type="button" onClick={onOpenProducts} className={`rounded-full border px-3 py-2 text-xs font-bold ${Number(item.inventory_quantity) === 0 ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>{item.name} · {Number(item.inventory_quantity) === 0 ? webT("web.soldOut") : webT("web.leftCount", { count: formatNumber(Number(item.inventory_quantity)) })}</button>)}</div> : null}
        </CardContent>
      </Card>
      {openCases.length ? <Card className="border-red-500/25 bg-red-500/[.04]"><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">{webT("web.customerCases")}</p><h3 className="mt-1 text-xl font-black">{openCases.length} {webT("web.needResponse")}</h3></div><Badge variant="destructive">{webT("web.responseClock")}</Badge></div><div className="mt-4 space-y-2">{openCases.slice(0,4).map((item)=><div key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{item.receipt?.merchant_products?.name || item.subject}</p><p className="mt-1 text-xs text-muted-foreground">{webT("web.commerceIssue")} {webT("web.due")} {item.merchant_response_due_at ? new Date(item.merchant_response_due_at).toLocaleString(currentUiLocale()) : webT("web.soon")}</p></div><Button size="sm" onClick={()=>respondToCase(item.id)}>{webT("commercial.respond.122")}</Button></div>)}</div></CardContent></Card> : null}
      {awaitingMerchantPayments.length ? <Card className="border-amber-500/25 bg-amber-500/[.05]"><CardContent className="p-5"><p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-600">{webT("web.paidDirectly")}</p><h3 className="mt-1 text-xl font-black">{awaitingMerchantPayments.length} {webT("web.awaitingConfirmation")}</h3><p className="mt-2 text-sm text-muted-foreground">{webT("web.verifyMoney")}</p><div className="mt-4 space-y-2">{awaitingMerchantPayments.map((order)=><div key={order.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{order.commerce_order_items?.map((item)=>`${item.quantity}× ${item.product_name}`).join(", ") || webT("web.merchantOrder")}</p><p className="mt-1 text-xs text-muted-foreground">{order.metadata?.merchant_payment_display_name || webT("web.directMerchantPayment")} {webT("web.expires")} {new Date(order.reservation_expires_at).toLocaleTimeString(currentUiLocale())}</p></div><div className="flex items-center gap-3"><strong>{money(order.total_amount, order.currency)}</strong><Button size="sm" disabled={confirmMerchantPayment.isPending} onClick={()=>{const reference=window.prompt(webT("web.paymentReferencePrompt")); if(reference?.trim()) confirmMerchantPayment.mutate({orderId:order.id,reference:reference.trim()});}}>{webT("web.confirmMoney")}</Button></div></div>)}</div></CardContent></Card> : null}
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-primary/5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">{webT("web.commerceConsole")}</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">{webT("web.runOrders")}</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {webT("web.counterExplanation")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { salesQuery.refetch(); receiptsQuery.refetch(); liveOpsQuery.refetch(); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {webT("common.refresh")}
              </Button>
              <Button onClick={onOpenValidation} className="bg-emerald-600 hover:bg-emerald-700">
                <QrCode className="mr-2 h-4 w-4" />
                {webT("web.validateCode")}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-emerald-600" />
                  <Badge variant="outline" className="text-[10px]">{webT("common.live")}</Badge>
                </div>
                <p className="mt-4 text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-semibold">{stat.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{stat.helper}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <h3 className="font-black">{webT("web.paymentByYou")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{webT("web.paymentMethodsExplanation")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DIRECT_METHODS.map(([type,labelKey])=>{const label = webT(labelKey); const enabled=Boolean(directMethods.data?.find((method)=>method.method_type===type)?.active);return <button key={type} type="button" disabled={saveDirectMethod.isPending} onClick={()=>saveDirectMethod.mutate({type,label,active:!enabled})} className={`rounded-2xl border p-4 text-left ${enabled?"border-emerald-500/30 bg-emerald-500/10":"bg-card"}`}><p className="font-bold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{enabled?webT("web.enabledDisable"):webT("web.clickConfigure")}</p></button>})}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">{webT("web.actionQueue")}</h3>
                <p className="text-sm text-muted-foreground">{webT("web.pendingReceipts")}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onOpenValidation}>
                {webT("web.scanner")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}</div>
            ) : pendingSales.length === 0 && pendingReceipts.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {webT("web.nothingWaiting")}
              </div>
            ) : (
              <div className="space-y-2">
                {pendingSales.map((sale) => (
                  <div key={`sale-${sale.id}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                    <div className="min-w-0">
                      <Badge variant="secondary" className="mb-2 capitalize">{commerceReceiptType(webT, sale.sale_type || "reservation")}</Badge>
                      <p className="truncate font-bold">{sale.merchant_products?.name || webT("web.reservedListing")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(sale.created_at).toLocaleString(currentUiLocale())} · {commerceStatus(webT, sale.status)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-black">{sale.redemption_code || webT("web.noCode")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{money(sale.amount_paid || 0)}</p>
                    </div>
                  </div>
                ))}
                {pendingReceipts.map((receipt) => (
                  <div key={`receipt-${receipt.id}`} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="mb-2 capitalize">{commerceReceiptType(webT, receipt.receipt_type)}</Badge>
                      <p className="truncate font-bold">{receiptLabel(receipt, webT)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(receipt.occurred_at).toLocaleString(currentUiLocale())} · {commerceStatus(webT, receipt.status)}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                      <p className="max-w-[140px] truncate font-mono text-xs font-black">{receipt.redemption_code || money(receipt.amount, receipt.currency)}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateReceiptStatus.isPending}
                        onClick={() => changeReceiptStatus(receipt, "fulfilled")}
                      >
                        <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                        {webT("web.fulfill")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateReceiptStatus.isPending}
                        onClick={() => changeReceiptStatus(receipt, "cancelled")}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {webT("findOrAsk.cancel")}
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/receipts/${receipt.id}`}>{webT("web.view")}</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">{webT("web.recentCommerce")}</h3>
                <p className="text-sm text-muted-foreground">{webT("web.purchasesList")}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onOpenProducts}>
                {webT("serviceCatalogPage.title")}
                <PackageCheck className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-16 rounded-xl" />)}</div>
            ) : recentActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {webT("web.noCommerce")}
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((receipt) => {
                  const Icon = receipt.receipt_type === "claim" ? Gift : receipt.receipt_type === "purchase" ? ShoppingBag : Receipt;
                  return (
                    <Link key={receipt.id} to={`/receipts/${receipt.id}`} className="group flex items-center gap-3 rounded-2xl border bg-card p-3 transition hover:border-emerald-500/30 hover:bg-emerald-500/5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold capitalize">{receiptLabel(receipt, webT)}</p>
                        <p className="text-xs text-muted-foreground">{commerceReceiptType(webT, receipt.receipt_type)} · {commerceStatus(webT, receipt.status)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black">{Number(receipt.amount || 0) > 0 ? money(receipt.amount, receipt.currency) : receipt.redemption_code || "—"}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 opacity-0 transition group-hover:opacity-100">{webT("web.view")}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
