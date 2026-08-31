import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft, Clock3, Loader2, MessageSquareText } from "lucide-react";
import { resolveCommerceCaseJourney } from "@promorang/shared";
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
  updated_at?: string | null;
  receipt_id?: string | null;
  merchant_response_due_at?: string | null;
  resolution?: { merchant_response?: string; proposed_resolution?: string; merchant_responded_at?: string; appealed_at?: string; remedy?: string; notes?: string; gems_credited?: number; reward_restored?: boolean } | null;
};

const apiBase = import.meta.env.VITE_API_URL || "https://api.promorang.co";

const statusKeys: Record<string, TranslationKey> = {
  open: "support.statusOpen",
  in_progress: "support.statusProgress",
  resolved: "support.statusResolved",
  closed: "support.statusClosed",
};

const categoryKeys: Record<string, TranslationKey> = {
  account: "support.catAccount",
  billing: "support.catBilling",
  content_report: "support.catContent",
  feature_request: "support.catFeature",
  bug: "support.catBug",
  other: "support.catOther",
};

const priorityKeys: Record<string, TranslationKey> = {
  low: "support.low",
  medium: "support.medium",
  high: "support.high",
};

export default function SupportTicketDetail() {
  const { t, formatDate } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appealText, setAppealText] = useState("");
  const [appealing, setAppealing] = useState(false);

  useEffect(() => {
    if (id) {
      void fetchTicket(id);
    }
  }, [id]);

  async function fetchTicket(ticketId: string) {
    setLoading(true);
    setError("");

    try {
      const { data } = await supabase.auth.getSession();
      const response = await fetch(`${apiBase}/api/support/my-tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${data.session?.access_token || ""}`,
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || t("support.loadTicketFail"));
      }

      setTicket(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : t("support.loadTicketFail"));
    } finally {
      setLoading(false);
    }
  }
  async function appeal() {
    if (!ticket || !appealText.trim()) return;
    setAppealing(true);
    try {
      const { data } = await supabase.auth.getSession();
      const response = await fetch(`${apiBase}/api/support/commerce-cases/${ticket.id}/appeal`, {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session?.access_token || ""}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: appealText.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("support.appealFail"));
      setTicket(payload.ticket);
      setAppealText("");
    } catch (appealError) {
      setError(appealError instanceof Error ? appealError.message : t("support.appealFail"));
    } finally {
      setAppealing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t("support.ticketSeoTitle")} description={t("support.ticketSeoCopy")} />

      <main className="pt-24 pb-20 px-6">
        <div className="container max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" asChild className="px-0">
              <Link to="/support/tickets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("support.backToTickets")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">{t("support.generalContact")}</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("support.loadingTicket")}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : !ticket ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="font-medium">{t("support.ticketNotFound")}</p>
            </div>
          ) : (
            <>
              {ticket.receipt_id ? (
                <section className="rounded-2xl border border-primary/20 bg-primary/[.04] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[.22em] text-primary">{t("support.commerceJourney")}</p>
                  <div className="relative mt-5 grid grid-cols-4 before:absolute before:left-[12%] before:right-[12%] before:top-3 before:h-px before:bg-border">
                    {resolveCommerceCaseJourney(ticket.status as any, Boolean(ticket.resolution?.merchant_response)).steps.map((step) => (
                      <div key={step.id} className="relative z-10 text-center">
                        <span className={`mx-auto block h-6 w-6 rounded-full border-4 border-background ${step.state === "complete" ? "bg-emerald-500" : step.state === "current" ? "bg-primary" : "bg-muted"}`} />
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{step.label}</p>
                      </div>
                    ))}
                  </div>
                  {ticket.merchant_response_due_at && !ticket.resolution?.merchant_response ? (
                    <p className="mt-5 text-xs text-muted-foreground">{t("support.merchantDue", { date: formatDate(ticket.merchant_response_due_at, { dateStyle: "medium", timeStyle: "short" }) })}</p>
                  ) : null}
                </section>
              ) : null}
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("support.ticketLabel", { id: ticket.id })}</p>
                    <h1 className="mt-2 text-3xl font-semibold">{ticket.subject}</h1>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium capitalize">
                    {statusKeys[ticket.status] ? t(statusKeys[ticket.status]) : ticket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("support.category")}</p>
                    <p className="mt-2 font-medium capitalize">{categoryKeys[ticket.category] ? t(categoryKeys[ticket.category]) : ticket.category.replace("_", " ")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("support.priority")}</p>
                    <p className="mt-2 font-medium capitalize">{priorityKeys[ticket.priority] ? t(priorityKeys[ticket.priority]) : ticket.priority}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("support.lastUpdated")}</p>
                    <p className="mt-2 font-medium">{formatDate(ticket.updated_at || ticket.created_at, { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{t("support.yourRequest")}</h2>
                </div>
                <p className="whitespace-pre-wrap leading-7 text-foreground/90">{ticket.message}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {t("support.submittedAt", { date: formatDate(ticket.created_at, { dateStyle: "medium", timeStyle: "short" }) })}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{t("support.response")}</h2>
                </div>
                {ticket.admin_notes ? (
                  <p className="whitespace-pre-wrap leading-7 text-foreground/90">{ticket.admin_notes}</p>
                ) : (
                  ticket.resolution?.merchant_response ? (
                    <div>
                      <p className="font-semibold">{t("support.merchantResponse")}</p>
                      <p className="mt-2 whitespace-pre-wrap leading-7 text-foreground/90">{ticket.resolution.merchant_response}</p>
                      {ticket.resolution.proposed_resolution ? <p className="mt-3 text-sm text-muted-foreground">{t("support.proposedResolution", { resolution: ticket.resolution.proposed_resolution })}</p> : null}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t("support.noReply")}</p>
                  )
                )}
              </section>
              {ticket.receipt_id && ["resolved", "closed"].includes(ticket.status) && !ticket.resolution?.appealed_at ? (
                <section className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold">{t("support.outcomeWrong")}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{t("support.outcomeCopy")}</p>
                  <Textarea className="mt-4 min-h-28" value={appealText} onChange={(event) => setAppealText(event.target.value)} placeholder={t("support.appealPh")} />
                  <Button className="mt-3" variant="outline" disabled={!appealText.trim() || appealing} onClick={appeal}>
                    {appealing ? t("support.appealing") : t("support.appeal")}
                  </Button>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
