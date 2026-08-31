import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Bookmark, Gift, PackageCheck, QrCode, Receipt, RefreshCw, ShoppingBag, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
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
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
};

const DIRECT_METHODS: Array<[string, TranslationKey]> = [
  ["cash_on_pickup", "merchOps.cashPickup"],
  ["card_terminal_pickup", "merchOps.cardPickup"],
  ["lynk_at_venue", "merchOps.lynkVenue"],
  ["bank_transfer", "merchOps.bankXfer"],
  ["merchant_payment_link", "merchOps.payLink"],
  ["cash_on_delivery", "merchOps.cashDelivery"],
];

export function MerchantCommerceConsole({ onOpenProducts, onOpenValidation }: { onOpenProducts?: () => void; onOpenValidation?: () => void }) {
  const { session } = useAuth();
  const { toast } = useToast();
  const { t, formatDate, formatTime } = useI18n();
  const queryClient = useQueryClient();

  const receiptLabel = (receipt: ReceiptRow) => {
    if (receipt.merchant_products?.name) return receipt.merchant_products.name;
    if (receipt.receipt_type === "claim") return `${t("merchOps.offerClaimed")}${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
    if (receipt.receipt_type === "redemption") return `${t("merchOps.offerRedeemed")}${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
    return receipt.receipt_type.replace("_", " ");
  };

  const salesQuery = useQuery({
    queryKey: ["merchant-sales-console"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/sales`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load merchant sales");
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
      if (!response.ok) throw new Error(data.error || "Could not load commerce receipts");
      return (data.receipts || []) as ReceiptRow[];
    },
  });

  const liveOpsQuery = useQuery({
    queryKey: ["merchant-live-ops"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/live-ops`, { headers: { Authorization: `Bearer ${session!.access_token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load live operations");
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
      if (!response.ok) throw new Error(data.error || "Could not load merchant-collected orders");
      return (data.orders || []) as MerchantPaymentOrder[];
    },
  });
  const directMethods = useQuery({
    queryKey: ["merchant-direct-payment-methods"],
    enabled: !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/merchant/commerce/direct-payment-methods`, { headers: { Authorization: `Bearer ${session!.access_token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load direct payment settings");
      return data.methods as Array<{ method_type: string; active: boolean; instructions?: string | null; payment_link?: string | null }>;
    },
  });
  const saveDirectMethod = useMutation({
    mutationFn: async ({ type, label, active }: { type: string; label: string; active: boolean }) => {
      const existing = directMethods.data?.find((method) => method.method_type === type);
      const instructions = active ? window.prompt(t("merchOps.instrPrompt", { label }), existing?.instructions || "") : existing?.instructions || "";
      if (active && instructions === null) throw new Error("Cancelled");
      const paymentLink = type === "merchant_payment_link" && active
        ? window.prompt(t("merchOps.linkPrompt"), existing?.payment_link || "") : existing?.payment_link || "";
      if (type === "merchant_payment_link" && active && !paymentLink) throw new Error(t("merchOps.linkRequired"));
      const response = await fetch(`${API_URL}/api/merchant/commerce/direct-payment-methods/${type}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: label, instructions, payment_link: paymentLink, active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save payment method");
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
      if (!response.ok) throw new Error(data.error || "Could not confirm payment");
      return data;
    },
    onSuccess: () => {
      toast({ title: t("merchOps.payConfirmed"), description: t("merchOps.payConfirmedCopy") });
      queryClient.invalidateQueries({ queryKey: ["merchant-payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-commerce-receipts"] });
    },
    onError: (error) => toast({ title: t("merchOps.payNotConfirmed"), description: error instanceof Error ? error.message : t("merchOps.tryAgain"), variant: "destructive" }),
  });
  const awaitingMerchantPayments = (merchantPaymentOrders.data || []).filter((order) =>
    order.payment_status === "requires_payment" && new Date(order.reservation_expires_at).getTime() > Date.now()
  );
  const casesQuery = useQuery({
    queryKey: ["merchant-commerce-cases"], enabled: !!session?.access_token,
    queryFn: async () => { const response = await fetch(`${API_URL}/api/support/merchant/commerce-cases`, { headers: { Authorization: `Bearer ${session!.access_token}` } }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not load cases"); return data.cases as Array<any>; },
  });
  const openCases = (casesQuery.data || []).filter((item) => ["open", "in_progress"].includes(item.status));
  const respondToCase = async (caseId: string) => {
    const message = window.prompt(t("merchOps.respPrompt"));
    if (!message?.trim()) return;
    const response = await fetch(`${API_URL}/api/support/merchant/commerce-cases/${caseId}/respond`, { method: "POST", headers: { Authorization: `Bearer ${session!.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await response.json();
    if (!response.ok) return toast({ title: t("merchOps.respFail"), description: data.error || t("merchOps.tryAgain"), variant: "destructive" });
    toast({ title: t("merchOps.respOk"), description: t("merchOps.respOkCopy") });
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
      if (!response.ok) throw new Error(data.error || "Could not update receipt");
      return data.receipt as ReceiptRow;
    },
    onSuccess: (_receipt, variables) => {
      toast({
        title: variables.status === "fulfilled" ? t("merchOps.fulfilledToast") : variables.status === "cancelled" ? t("merchOps.cancelledToast") : t("merchOps.refundedToast"),
        description: t("merchOps.queueUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-commerce-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-sales-console"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-live-ops"] });
    },
    onError: (error) => {
      toast({
        title: t("merchOps.updateFail"),
        description: error instanceof Error ? error.message : t("merchOps.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const changeReceiptStatus = (receipt: ReceiptRow, status: "fulfilled" | "cancelled" | "refunded") => {
    const action = status === "fulfilled" ? "mark this receipt fulfilled" : status === "cancelled" ? "cancel this receipt" : "mark this receipt refunded";
    if (status === "cancelled" && !window.confirm(t("merchOps.confirmCancel"))) return;
    if (status === "refunded" && !window.confirm(t("merchOps.confirmRefund"))) return;
    updateReceiptStatus.mutate({ id: receipt.id, status, note: `Merchant chose to ${action} from Commerce Console.` });
  };

  const sales = salesQuery.data || [];
  const receipts = receiptsQuery.data || [];
  const pendingSales = sales.filter((sale) => sale.status === "pending").slice(0, 6);
  const pendingReceipts = receipts.filter((receipt) => ["issued", "pending"].includes(receipt.status)).slice(0, 6);
  const fulfilledReceipts = receipts.filter((receipt) => receipt.status === "fulfilled");
  const paidRevenue = receipts
    .filter((receipt) => receipt.receipt_type === "purchase" && receipt.status === "fulfilled")
    .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);
  const recentActivity = receipts.slice(0, 8);
  const liveOps = summarizeMerchantLiveOps(liveOpsQuery.data?.listings || [], liveOpsQuery.data?.receipts || []);
  const liveMomentNames = (liveOpsQuery.data?.moments || []).filter((moment) => liveOpsQuery.data?.live_moment_ids.includes(moment.id)).map((moment) => moment.title);
  const pressuredListings = (liveOpsQuery.data?.listings || []).filter((item) => item.inventory_quantity != null && Number(item.inventory_quantity) <= 5).slice(0, 5);

  const stats = useMemo(() => [
    { label: t("merchOps.openRes"), value: pendingSales.length.toLocaleString(), icon: Bookmark, helper: t("merchOps.openResHelp") },
    { label: t("merchOps.fulfilledRec"), value: fulfilledReceipts.length.toLocaleString(), icon: BadgeCheck, helper: t("merchOps.fulfilledHelp") },
    { label: t("merchOps.paidRev"), value: money(paidRevenue), icon: ShoppingBag, helper: t("merchOps.paidRevHelp") },
    { label: t("merchOps.attention"), value: pendingReceipts.length.toLocaleString(), icon: QrCode, helper: t("merchOps.attentionHelp") },
  ], [fulfilledReceipts.length, paidRevenue, pendingReceipts.length, pendingSales.length, t]);

  const isLoading = salesQuery.isLoading || receiptsQuery.isLoading;

  return (
    <section className="space-y-4">
      <Card className="overflow-hidden border-orange-500/25 bg-[#11100e] text-white">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-orange-400">{t("merchOps.liveOps")}</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{liveMomentNames.length ? liveMomentNames.join(" · ") : t("merchOps.counterNow")}</h2><p className="mt-2 max-w-xl text-sm text-white/55">{t("merchOps.counterCopy")}</p></div>
            <Button onClick={onOpenValidation} className="bg-orange-500 text-black hover:bg-orange-400"><QrCode className="mr-2 h-4 w-4" />{t("merchOps.openScanner", { count: liveOps.needsAction })}</Button>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[[t("merchOps.available"),liveOps.activeListings],[t("merchOps.lowStock"),liveOps.lowStock],[t("merchOps.soldOut"),liveOps.soldOut],[t("merchOps.needsAction"),liveOps.needsAction],[t("merchOps.fulfilled"),liveOps.fulfilled],[t("merchOps.attributed"),money(liveOps.attributedRevenue)]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><p className="text-xl font-black">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{label}</p></div>)}
          </div>
          {pressuredListings.length ? <div className="mt-4 flex flex-wrap gap-2" aria-label={t("merchOps.stockAria")}>{pressuredListings.map((item)=><button key={item.id} type="button" onClick={onOpenProducts} className={`rounded-full border px-3 py-2 text-xs font-bold ${Number(item.inventory_quantity) === 0 ? "border-red-400/30 bg-red-400/10 text-red-300" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>{item.name} · {Number(item.inventory_quantity) === 0 ? t("merchOps.soldOutTag") : t("merchOps.left", { count: Number(item.inventory_quantity) })}</button>)}</div> : null}
        </CardContent>
      </Card>
      {openCases.length ? <Card className="border-red-500/25 bg-red-500/[.04]"><CardContent className="p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-red-500">{t("merchOps.cases")}</p><h3 className="mt-1 text-xl font-black">{t("merchOps.needResponse", { count: openCases.length })}</h3></div><Badge variant="destructive">{t("merchOps.clock")}</Badge></div><div className="mt-4 space-y-2">{openCases.slice(0,4).map((item)=><div key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{item.receipt?.merchant_products?.name || item.subject}</p><p className="mt-1 text-xs text-muted-foreground">{String(item.commerce_reason || t("merchOps.issueFallback")).replaceAll("_"," ")} · {t("merchOps.due", { when: item.merchant_response_due_at ? formatDate(item.merchant_response_due_at, { dateStyle: "short", timeStyle: "short" }) : t("merchOps.soon") })}</p></div><Button size="sm" onClick={()=>respondToCase(item.id)}>{t("merchOps.respond")}</Button></div>)}</div></CardContent></Card> : null}
      {awaitingMerchantPayments.length ? <Card className="border-amber-500/25 bg-amber-500/[.05]"><CardContent className="p-5"><p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-600">{t("merchOps.paidDirect")}</p><h3 className="mt-1 text-xl font-black">{t("merchOps.awaitingPay", { count: awaitingMerchantPayments.length })}</h3><p className="mt-2 text-sm text-muted-foreground">{t("merchOps.verifyMoney")}</p><div className="mt-4 space-y-2">{awaitingMerchantPayments.map((order)=><div key={order.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{order.commerce_order_items?.map((item)=>`${item.quantity}× ${item.product_name}`).join(", ") || t("merchOps.merchantOrder")}</p><p className="mt-1 text-xs text-muted-foreground">{order.metadata?.merchant_payment_display_name || t("merchOps.directPay")} · {t("merchOps.expires", { when: formatTime(order.reservation_expires_at) })}</p></div><div className="flex items-center gap-3"><strong>{money(order.total_amount, order.currency)}</strong><Button size="sm" disabled={confirmMerchantPayment.isPending} onClick={()=>{const reference=window.prompt(t("merchOps.refPrompt")); if(reference?.trim()) confirmMerchantPayment.mutate({orderId:order.id,reference:reference.trim()});}}>{t("merchOps.confirmMoney")}</Button></div></div>)}</div></CardContent></Card> : null}
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-primary/5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">{t("merchOps.badge")}</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">{t("merchOps.title")}</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {t("merchOps.copy")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { salesQuery.refetch(); receiptsQuery.refetch(); liveOpsQuery.refetch(); }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("merchOps.refresh")}
              </Button>
              <Button onClick={onOpenValidation} className="bg-emerald-600 hover:bg-emerald-700">
                <QrCode className="mr-2 h-4 w-4" />
                {t("merchOps.validate")}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-emerald-600" />
                  <Badge variant="outline" className="text-[10px]">{t("merchOps.live")}</Badge>
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
          <h3 className="font-black">{t("merchOps.payByYou")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("merchOps.payByYouCopy")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DIRECT_METHODS.map(([type,labelKey])=>{const label=t(labelKey);const enabled=Boolean(directMethods.data?.find((method)=>method.method_type===type)?.active);return <button key={type} type="button" disabled={saveDirectMethod.isPending} onClick={()=>saveDirectMethod.mutate({type,label,active:!enabled})} className={`rounded-2xl border p-4 text-left ${enabled?"border-emerald-500/30 bg-emerald-500/10":"bg-card"}`}><p className="font-bold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{enabled?t("merchOps.enabled"):t("merchOps.configure")}</p></button>})}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black">{t("merchOps.queue")}</h3>
                <p className="text-sm text-muted-foreground">{t("merchOps.queueCopy")}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onOpenValidation}>
                {t("merchOps.scanner")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}</div>
            ) : pendingSales.length === 0 && pendingReceipts.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("merchOps.queueEmpty")}
              </div>
            ) : (
              <div className="space-y-2">
                {pendingSales.map((sale) => (
                  <div key={`sale-${sale.id}`} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                    <div className="min-w-0">
                      <Badge variant="secondary" className="mb-2 capitalize">{sale.sale_type || t("merchOps.reservation")}</Badge>
                      <p className="truncate font-bold">{sale.merchant_products?.name || t("merchOps.reserved")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(sale.created_at, { dateStyle: "short", timeStyle: "short" })} · {sale.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-black">{sale.redemption_code || t("merchOps.noCode")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{money(sale.amount_paid || 0)}</p>
                    </div>
                  </div>
                ))}
                {pendingReceipts.map((receipt) => (
                  <div key={`receipt-${receipt.id}`} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="mb-2 capitalize">{receipt.receipt_type}</Badge>
                      <p className="truncate font-bold">{receiptLabel(receipt)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(receipt.occurred_at, { dateStyle: "short", timeStyle: "short" })} · {receipt.status}</p>
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
                        {t("merchOps.fulfill")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateReceiptStatus.isPending}
                        onClick={() => changeReceiptStatus(receipt, "cancelled")}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {t("merchOps.cancel")}
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/receipts/${receipt.id}`}>{t("merchOps.view")}</Link>
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
                <h3 className="font-black">{t("merchOps.recent")}</h3>
                <p className="text-sm text-muted-foreground">{t("merchOps.recentCopy")}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onOpenProducts}>
                {t("merchOps.catalog")}
                <PackageCheck className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-16 rounded-xl" />)}</div>
            ) : recentActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("merchOps.recentEmpty")}
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
                        <p className="truncate text-sm font-bold capitalize">{receiptLabel(receipt)}</p>
                        <p className="text-xs text-muted-foreground">{receipt.receipt_type} · {receipt.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black">{Number(receipt.amount || 0) > 0 ? money(receipt.amount, receipt.currency) : receipt.redemption_code || "—"}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 opacity-0 transition group-hover:opacity-100">{t("merchOps.view")}</p>
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
