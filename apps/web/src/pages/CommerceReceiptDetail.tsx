import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, BadgeCheck, Bookmark, CalendarClock, Copy, Gift, Receipt, ShieldCheck, ShoppingBag, Sparkles, TicketCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { resolveCommerceReceiptPresentation } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type CommerceReceipt = {
  id: string;
  receipt_type: string;
  status: string;
  amount?: number | string | null;
  currency?: string | null;
  redemption_code?: string | null;
  occurred_at?: string | null;
  attribution?: Record<string, any> | null;
  merchant_products?: {
    id?: string | null;
    name?: string | null;
    description?: string | null;
    image_url?: string | null;
    category?: string | null;
    fulfillment_mode?: string | null;
    merchant_id?: string | null;
  } | null;
};

type ReceiptTimelineItem = {
  label: string;
  at?: string | null;
  tone?: "complete" | "pending" | "stopped" | string;
  detail?: string | null;
};

type ReceiptPayload = {
  receipt: CommerceReceipt;
  timeline: ReceiptTimelineItem[];
  permissions?: {
    is_customer?: boolean;
    is_merchant?: boolean;
    is_admin?: boolean;
  };
};

const receiptIcon = {
  purchase: ShoppingBag,
  reservation: Bookmark,
  claim: Gift,
  redemption: TicketCheck,
  refund: Receipt,
} as const;

function money(receipt: CommerceReceipt | null | undefined, locale: string, noCashValue: string) {
  const amount = Number(receipt?.amount || 0);
  if (!amount) return noCashValue;
  return new Intl.NumberFormat(locale, { style: "currency", currency: receipt?.currency || "USD" }).format(amount);
}

function titleFor(receipt?: CommerceReceipt | null) {
  if (!receipt) return "Commerce receipt";
  if (receipt.merchant_products?.name) return receipt.merchant_products.name;
  if (receipt.receipt_type === "claim") return `Offer claimed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
  if (receipt.receipt_type === "redemption") return `Offer redeemed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
  return receipt.receipt_type.replaceAll("_", " ");
}

function statusTone(status?: string) {
  if (status === "fulfilled") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (status === "cancelled" || status === "refunded") return "border-destructive/25 bg-destructive/10 text-destructive";
  if (status === "pending" || status === "issued") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-border bg-muted text-muted-foreground";
}

function formatDate(value: string | null | undefined, locale: string, notRecorded: string) {
  if (!value) return notRecorded;
  return new Date(value).toLocaleString(locale);
}

export default function CommerceReceiptDetail() {
  const { t, locale } = useI18n();
  const { id } = useParams();
  const { session } = useAuth();
  const { toast } = useToast();

  const query = useQuery<ReceiptPayload>({
    queryKey: ["commerce-receipt-detail", id],
    enabled: Boolean(id && session?.access_token),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/commerce/receipts/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load receipt");
      return data;
    },
  });

  const receipt = query.data?.receipt;
  const Icon = receiptIcon[receipt?.receipt_type as keyof typeof receiptIcon] || Receipt;
  const safeCode = receipt?.redemption_code || receipt?.attribution?.coupon_code || receipt?.id;
  const presentation = receipt ? resolveCommerceReceiptPresentation({ receiptType: receipt.receipt_type, status: receipt.status, productName: receipt.merchant_products?.name, attribution: receipt.attribution }) : null;

  const copyValue = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast({ title: t("receipt.copied", { label }), description: t("receipt.clipboard") });
  };

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl">
        <Card className="rounded-3xl border-dashed">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">{t("receipt.signInTitle")}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t("receipt.signInCopy")}</p>
            <Button asChild className="mt-5" variant="hero"><Link to="/auth">{t("wallet.signIn")}</Link></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <Button asChild variant="ghost" className="gap-2">
        <Link to="/vault"><ArrowLeft className="h-4 w-4" /> {t("receipt.back")}</Link>
      </Button>

      {query.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.75fr]">
          <Skeleton className="h-[460px] rounded-[2rem]" />
          <Skeleton className="h-[460px] rounded-[2rem]" />
        </div>
      ) : query.error ? (
        <Card className="rounded-3xl border-destructive/20 bg-destructive/5">
          <CardContent className="p-8">
            <h1 className="text-3xl font-black tracking-[-0.05em]">{t("receipt.unavailable")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{(query.error as Error).message}</p>
          </CardContent>
        </Card>
      ) : receipt ? (
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.75fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black p-6 text-white shadow-card sm:p-8">
            {receipt.merchant_products?.image_url ? (
              <img src={receipt.merchant_products.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,126,51,0.34),transparent_35%),linear-gradient(135deg,rgba(0,0,0,0.96),rgba(0,0,0,0.68))]" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-white/15 bg-white/10 text-white hover:bg-white/10">
                  <Icon className="mr-1.5 h-3.5 w-3.5" /> {receipt.receipt_type}
                </Badge>
                <Badge className={`rounded-full capitalize ${statusTone(receipt.status)}`}>{receipt.status}</Badge>
                {query.data?.permissions?.is_admin ? <Badge className="rounded-full bg-primary text-primary-foreground">Admin view</Badge> : null}
                {query.data?.permissions?.is_merchant ? <Badge className="rounded-full bg-white text-black">Merchant view</Badge> : null}
              </div>

              <div className="mt-7 border-y border-dashed border-black/25 bg-[#f4ead8] p-5 text-[#19140f] shadow-2xl sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{presentation?.eyebrow}</p>
                <h1 className="mt-2 font-serif text-5xl font-black uppercase leading-none tracking-[-0.055em] sm:text-7xl">{presentation?.headline}</h1>
                <p className="mt-2 text-lg font-black capitalize">{presentation?.title || titleFor(receipt)}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{presentation?.explanation}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">{presentation?.outcomes.map((outcome) => <div key={outcome.id} className="flex items-center justify-between gap-5 border-b border-black/10 py-2 text-xs"><span className="text-black/50">{outcome.label}</span><span className="font-black capitalize">{outcome.value}</span></div>)}</div>
                <div className="mt-5 flex items-center gap-2 border-t border-dashed border-black/20 pt-4 text-[10px] font-black uppercase tracking-[.2em]"><BadgeCheck className="h-4 w-4 text-primary" />{t("receipt.saved")}</div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/45">{t("receipt.value")}</p>
                  <p className="mt-1 text-2xl font-black">{money(receipt, locale, t("receipt.noCash"))}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/45">{t("receipt.issued")}</p>
                  <p className="mt-1 text-sm font-bold">{formatDate(receipt.occurred_at, locale, t("receipt.notRecorded"))}</p>
                </div>
                <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/10 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-primary-light">{t("receipt.code")}</p>
                  <button className="mt-1 break-all text-left font-mono text-sm font-black text-white" onClick={() => safeCode && copyValue(String(safeCode), "Code")}>
                    {safeCode}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <Card className="rounded-[2rem]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-black tracking-[-0.04em]">{t("receipt.timeline")}</h2>
                </div>
                <div className="mt-5 space-y-3">
                  {(query.data?.timeline || []).map((item, index) => (
                    <div key={`${item.label}-${index}`} className="rounded-2xl border bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone === "stopped" ? "bg-destructive" : item.tone === "pending" ? "bg-amber-500" : "bg-emerald-500"}`} />
                        <div>
                          <p className="font-bold">{item.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.at, locale, t("receipt.notRecorded"))}</p>
                          {item.detail ? <p className="mt-2 break-all text-xs text-muted-foreground">{item.detail}</p> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-black tracking-[-0.04em]">{t("receipt.connected")}</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <p className="text-muted-foreground">{t("receipt.product")}: <span className="font-semibold text-foreground">{receipt.merchant_products?.name || t("receipt.notAttached")}</span></p>
                  <p className="text-muted-foreground">{t("receipt.fulfillment")}: <span className="font-semibold text-foreground">{receipt.merchant_products?.fulfillment_mode || receipt.attribution?.fulfillment_mode || t("receipt.notSpecified")}</span></p>
                  <p className="text-muted-foreground">{t("receipt.source")}: <span className="font-semibold text-foreground">{receipt.attribution?.source || "Promorang commerce"}</span></p>
                  {receipt.attribution?.stripe_payment_intent_id ? (
                    <p className="break-all text-muted-foreground">Stripe intent: <span className="font-mono text-xs text-foreground">{receipt.attribution.stripe_payment_intent_id}</span></p>
                  ) : null}
                  {receipt.attribution?.stripe_refund_id ? (
                    <p className="break-all text-muted-foreground">Stripe refund: <span className="font-mono text-xs text-foreground">{receipt.attribution.stripe_refund_id}</span></p>
                  ) : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyValue(receipt.id, "Receipt ID")}>
                    <Copy className="mr-2 h-4 w-4" /> {t("receipt.copyId")}
                  </Button>
                  {receipt.merchant_products?.id ? (
                    <Button asChild size="sm" variant="secondary">
                      <Link to={`/shop/${receipt.merchant_products.id}`}>{t("receipt.viewProduct")}</Link>
                    </Button>
                  ) : null}
                  {query.data?.permissions?.is_customer && !["cancelled", "refunded"].includes(receipt.status) ? <Button asChild size="sm" variant="ghost" className="text-destructive"><Link to={`/support/tickets?receipt=${encodeURIComponent(receipt.id)}&product=${encodeURIComponent(titleFor(receipt))}`}><AlertTriangle className="mr-2 h-4 w-4" />{t("receipt.report")}</Link></Button> : null}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
