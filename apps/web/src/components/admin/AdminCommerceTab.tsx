import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, BadgeCheck, EyeOff, Package, PauseCircle, Receipt, RefreshCw, ShieldCheck, ShoppingBag, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type ReceiptRow = {
  id: string;
  user_id: string;
  merchant_id?: string | null;
  receipt_type: string;
  status: string;
  amount: number | string;
  currency: string;
  redemption_code?: string | null;
  occurred_at: string;
  attribution?: Record<string, unknown> | null;
  merchant_products?: { name?: string | null; image_url?: string | null; category?: string | null; fulfillment_mode?: string | null } | null;
};

type ProductRow = {
  id: string;
  merchant_id?: string | null;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  price?: number | string | null;
  currency?: string | null;
  image_url?: string | null;
  visibility?: string | null;
  is_active?: boolean | null;
  total_sales?: number | null;
  revenue_generated?: number | string | null;
  created_at?: string | null;
};

type CommerceOverview = {
  receipts: ReceiptRow[];
  products: ProductRow[];
  automations: AutomationRow[];
  summary: Record<string, number>;
};

type AutomationRow = {
  id: string;
  action: string;
  status: "processing" | "completed" | "skipped" | "failed";
  source_type?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  error_message?: string | null;
  result?: Record<string, any> | null;
  created_at: string;
};

async function adminCommerceRequest<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api/admin/commerce${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.error || "Admin commerce request failed");
  return payload;
}

const money = (amount: number | string | null | undefined, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount || 0));

function receiptLabel(receipt: ReceiptRow) {
  if (receipt.merchant_products?.name) return receipt.merchant_products.name;
  if (receipt.receipt_type === "claim") return `Offer claim${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
  if (receipt.receipt_type === "redemption") return `Offer redemption${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ""}`;
  return receipt.receipt_type.replace("_", " ");
}

function statusClass(status: string) {
  if (status === "fulfilled") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700";
  if (["issued", "pending"].includes(status)) return "border-amber-500/25 bg-amber-500/10 text-amber-700";
  if (["cancelled", "refunded"].includes(status)) return "border-destructive/25 bg-destructive/10 text-destructive";
  return "border-border bg-muted/40 text-muted-foreground";
}

export function AdminCommerceTab() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const overview = useQuery({
    queryKey: ["admin-commerce-overview"],
    enabled: !!session?.access_token,
    queryFn: () => adminCommerceRequest<CommerceOverview>("/overview", session?.access_token),
  });

  const receiptStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminCommerceRequest(`/receipts/${id}/status`, session?.access_token, {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      }),
    onSuccess: (_payload, variables) => {
      toast({
        title: variables.status === "refunded" ? "Refund processed" : "Receipt updated",
        description: variables.status === "refunded" ? "Stripe was refunded when a Stripe payment intent was attached; otherwise the receipt was marked refunded." : undefined,
      });
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-overview"] });
    },
    onError: (error: any) => toast({ title: "Receipt update failed", description: error.message, variant: "destructive" }),
  });

  const productModeration = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "pause" | "hide" | "archive" }) =>
      adminCommerceRequest(`/products/${id}/moderate`, session?.access_token, {
        method: "PATCH",
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      toast({ title: "Product moderation updated" });
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
    },
    onError: (error: any) => toast({ title: "Product moderation failed", description: error.message, variant: "destructive" }),
  });

  const retryAutomation = useMutation({
    mutationFn: (id: string) => adminCommerceRequest(`/automations/${id}/retry`, session?.access_token, {
      method: "POST",
      body: JSON.stringify({ reason: reason || "Admin recovery retry" }),
    }),
    onSuccess: () => {
      toast({ title: "Automation retried", description: "The verified proof was evaluated again without duplicating completed rewards." });
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-overview"] });
    },
    onError: (error: any) => toast({ title: "Retry failed", description: error.message, variant: "destructive" }),
  });

  const reconcileAutomations = useMutation({
    mutationFn: () => adminCommerceRequest<{ summary: Record<string, number> }>("/automations/reconcile", session?.access_token, {
      method: "POST",
      body: JSON.stringify({ limit: 200, reason: reason || "Reconcile historical verified proofs" }),
    }),
    onSuccess: (payload) => {
      toast({ title: "Verified proofs reconciled", description: `${payload.summary.proofs_checked || 0} proofs checked; completed rewards were not duplicated.` });
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-overview"] });
    },
    onError: (error: any) => toast({ title: "Reconciliation failed", description: error.message, variant: "destructive" }),
  });

  const receipts = overview.data?.receipts || [];
  const products = overview.data?.products || [];
  const automations = overview.data?.automations || [];
  const summary = overview.data?.summary || {};
  const attentionReceipts = useMemo(() => receipts.filter((receipt) => ["issued", "pending"].includes(receipt.status)), [receipts]);
  const questionableProducts = useMemo(() => products.filter((product) => product.is_active === false || product.visibility === "hidden" || !product.image_url), [products]);

  if (overview.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">Commerce Trust Control</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Keep marketplace value safe, visible, and reversible.</h2>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Review paid receipts, issued claims, hidden listings, and merchant products that shape feed commerce.
              </p>
            </div>
            <Button variant="outline" onClick={() => overview.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Issued / pending", value: summary.issued_or_pending || 0, icon: AlertTriangle },
              { label: "Fulfilled", value: summary.fulfilled || 0, icon: BadgeCheck },
              { label: "Paid revenue", value: money(summary.paid_revenue || 0), icon: ShoppingBag },
              { label: "Automation attention", value: summary.automation_failures || 0, icon: WandSparkles },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border bg-background/75 p-4">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-2xl font-black">{item.value}</p>
                <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-semibold">Admin intervention reason</p>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required for cancellations, refunds, hides, pauses, and archives. Refunds with Stripe payment intents will execute a Stripe refund." />
        </CardContent>
      </Card>

      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts" className="gap-2"><Receipt className="h-4 w-4" /> Receipts</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> Listings</TabsTrigger>
          <TabsTrigger value="automations" className="gap-2"><WandSparkles className="h-4 w-4" /> Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-3">
          {(attentionReceipts.length ? attentionReceipts : receipts).slice(0, 80).map((receipt) => (
            <Card key={receipt.id}>
              <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={statusClass(receipt.status)}>{receipt.status}</Badge>
                    <Badge variant="secondary" className="capitalize">{receipt.receipt_type}</Badge>
                  </div>
                  <h3 className="truncate font-black capitalize">{receiptLabel(receipt)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(receipt.occurred_at).toLocaleString()} · User {receipt.user_id.slice(0, 8)} · Merchant {receipt.merchant_id?.slice(0, 8) || "none"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{receipt.redemption_code || money(receipt.amount, receipt.currency)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/receipts/${receipt.id}`}>View receipt</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => receiptStatus.mutate({ id: receipt.id, status: "fulfilled" })} disabled={receiptStatus.isPending}>
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Fulfill
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => receiptStatus.mutate({ id: receipt.id, status: "cancelled" })} disabled={receiptStatus.isPending}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => receiptStatus.mutate({ id: receipt.id, status: "refunded" })} disabled={receiptStatus.isPending}>
                    Execute refund
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!receipts.length ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No commerce receipts found.</div> : null}
        </TabsContent>

        <TabsContent value="products" className="grid gap-4 lg:grid-cols-2">
          {(questionableProducts.length ? questionableProducts : products).slice(0, 80).map((product) => (
            <Card key={product.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                    {product.image_url ? <img src={product.image_url} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className={product.is_active === false ? statusClass("cancelled") : statusClass("fulfilled")}>{product.is_active === false ? "inactive" : "active"}</Badge>
                      <Badge variant="secondary">{product.visibility || "public"}</Badge>
                    </div>
                    <h3 className="truncate font-black">{product.name || "Untitled listing"}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description || product.category || "No description"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Merchant {product.merchant_id?.slice(0, 8) || "none"} · {money(product.price || 0, product.currency || "USD")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => productModeration.mutate({ id: product.id, action: "approve" })} disabled={productModeration.isPending}>
                    <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => productModeration.mutate({ id: product.id, action: "pause" })} disabled={productModeration.isPending}>
                    <PauseCircle className="mr-1 h-3.5 w-3.5" /> Pause
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => productModeration.mutate({ id: product.id, action: "hide" })} disabled={productModeration.isPending}>
                    <EyeOff className="mr-1 h-3.5 w-3.5" /> Hide
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!products.length ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground lg:col-span-2">No merchant listings found.</div> : null}
        </TabsContent>

        <TabsContent value="automations" className="space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black">Historical proof reconciliation</p>
              <p className="mt-1 text-xs text-muted-foreground">Check verified proofs from before automation launched and deliver only missing connected rewards.</p>
            </div>
            <Button variant="outline" onClick={() => reconcileAutomations.mutate()} disabled={reconcileAutomations.isPending}>
              <WandSparkles className="mr-2 h-4 w-4" /> {reconcileAutomations.isPending ? "Reconciling…" : "Reconcile proofs"}
            </Button>
          </div>
          {automations.slice().sort((a, b) => Number(a.status !== "failed") - Number(b.status !== "failed")).map((automation) => (
            <Card key={automation.id} className={automation.status === "failed" ? "border-destructive/30" : undefined}>
              <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={automation.status === "completed" ? statusClass("fulfilled") : automation.status === "failed" ? statusClass("cancelled") : statusClass("pending")}>{automation.status}</Badge>
                    <Badge variant="secondary" className="capitalize">{automation.action.replaceAll("_", " ")}</Badge>
                  </div>
                  <h3 className="font-black capitalize">{automation.source_type || "Experience"} → {automation.target_type || "reward"}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(automation.created_at).toLocaleString()} · Target {automation.target_id?.slice(0, 8) || "recorded"}</p>
                  <p className={`mt-2 text-sm ${automation.status === "failed" ? "text-destructive" : "text-muted-foreground"}`}>
                    {automation.error_message || (automation.status === "completed" ? "Reward or eligibility was delivered and attributed." : "Automation is being evaluated.")}
                  </p>
                </div>
                {automation.status === "failed" ? (
                  <Button onClick={() => retryAutomation.mutate(automation.id)} disabled={retryAutomation.isPending}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Retry safely
                  </Button>
                ) : automation.result?.receipt_id ? (
                  <Button asChild variant="secondary"><Link to={`/receipts/${automation.result.receipt_id}`}>View receipt</Link></Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {!automations.length ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No proof-triggered automations have run yet.</div> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
