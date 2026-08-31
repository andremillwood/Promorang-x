import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowRight, Inbox, LifeBuoy, Loader2, Plus } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
};

const apiBase = import.meta.env.VITE_API_URL || "https://api.promorang.co";

const statusTone: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  in_progress: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  closed: "bg-zinc-500/10 text-zinc-700 border-zinc-500/20",
};

const statusKeys: Record<string, TranslationKey> = {
  open: "support.statusOpen",
  in_progress: "support.statusProgress",
  resolved: "support.statusResolved",
  closed: "support.statusClosed",
};

export default function SupportTickets() {
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiptId = searchParams.get("receipt");
  const receiptProduct = searchParams.get("product");
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    subject: receiptProduct ? t("support.problemWith", { product: receiptProduct }) : "",
    category: "other",
    message: "",
    priority: "medium",
    reason: "reward_not_honoured",
  });

  useEffect(() => {
    void fetchTickets();
  }, []);

  async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token || ""}`,
    };
  }

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/support/my-tickets`, {
        headers: await getAuthHeaders(),
      });
      const payload = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(payload.error || t("support.loadFail"));
      }
      setTickets(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : t("support.loadFail"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/support${receiptId ? "/commerce-cases" : ""}`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(receiptId ? { receipt_id: receiptId, reason: form.reason, message: form.message, evidence: [] } : form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || t("support.submitFail"));
      }

      toast({
        title: t("support.submitted"),
        description: t("support.submittedCopy"),
      });

      setForm({
        subject: "",
        category: "other",
        message: "",
        priority: "medium",
        reason: "reward_not_honoured",
      });

      await fetchTickets();

      if (payload.ticketId) {
        navigate(`/support/tickets/${payload.ticketId}`);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("support.submitFail"));
    } finally {
      setSubmitting(false);
    }
  }

  const orderedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [tickets],
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("support.seoTitle")} description={t("support.seoCopy")} />

      <main className="pt-24 pb-20 px-6">
        <div className="container max-w-6xl mx-auto space-y-10">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl font-bold">{t("support.title")}</h1>
              <p className="mt-3 text-muted-foreground">
                {t("support.copy")}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/contact">{t("support.generalContact")}</Link>
            </Button>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border border-border bg-card rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{t("support.yourQueue")}</h2>
                  <p className="text-sm text-muted-foreground">{t("support.queueCopy")}</p>
                </div>
                <LifeBuoy className="h-5 w-5 text-primary" />
              </div>

              {loading ? (
                <div className="flex min-h-[240px] items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("support.loading")}
                </div>
              ) : error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : orderedTickets.length === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                  <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">{t("support.empty")}</p>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {t("support.emptyCopy")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderedTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/support/tickets/${ticket.id}`}
                      className="block rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">#{ticket.id.slice(0, 8)}</p>
                          <h3 className="truncate font-semibold">{ticket.subject}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDate(ticket.created_at, { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[ticket.status] || "bg-muted text-foreground border-border"}`}>
                          {statusKeys[ticket.status] ? t(statusKeys[ticket.status]) : ticket.status.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border bg-card rounded-xl p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{receiptId ? t("support.reportCommerce") : t("support.newRequest")}</h2>
                  <p className="text-sm text-muted-foreground">{receiptId ? t("support.commerceCopy", { product: receiptProduct || t("support.yourReceipt") }) : t("support.accountCopy")}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {receiptId ? (
                  <div className="space-y-2">
                    <label htmlFor="reason" className="text-sm font-medium">{t("support.whatWrong")}</label>
                    <select id="reason" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="reward_not_honoured">{t("support.reasonReward")}</option>
                      <option value="code_failed">{t("support.reasonCode")}</option>
                      <option value="merchant_closed">{t("support.reasonClosed")}</option>
                      <option value="offer_differed">{t("support.reasonDiffered")}</option>
                      <option value="purchase_problem">{t("support.reasonPurchase")}</option>
                      <option value="other">{t("support.reasonOther")}</option>
                    </select>
                    <p className="text-xs text-muted-foreground">{t("support.receiptDue", { id: receiptId.slice(0, 8) })}</p>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">{t("support.subject")}</label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    placeholder={t("support.subjectPh")}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">{t("support.category")}</label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="account">{t("support.catAccount")}</option>
                      <option value="billing">{t("support.catBilling")}</option>
                      <option value="content_report">{t("support.catContent")}</option>
                      <option value="feature_request">{t("support.catFeature")}</option>
                      <option value="bug">{t("support.catBug")}</option>
                      <option value="other">{t("support.catOther")}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">{t("support.priority")}</label>
                    <select
                      id="priority"
                      value={form.priority}
                      onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="low">{t("support.low")}</option>
                      <option value="medium">{t("support.medium")}</option>
                      <option value="high">{t("support.high")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">{t("support.details")}</label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    placeholder={t("support.detailsPh")}
                    className="min-h-[180px]"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {submitting ? t("support.submitting") : t("support.submit")}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
