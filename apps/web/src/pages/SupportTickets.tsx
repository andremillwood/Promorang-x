import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowRight, Inbox, LifeBuoy, Loader2, Plus } from "lucide-react";

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

export default function SupportTickets() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    subject: "",
    category: "other",
    message: "",
    priority: "medium",
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
        throw new Error(payload.error || "Failed to load support tickets");
      }
      setTickets(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/support`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || "Failed to submit support ticket");
      }

      toast({
        title: "Support request submitted",
        description: "Your ticket is now in the support queue.",
      });

      setForm({
        subject: "",
        category: "other",
        message: "",
        priority: "medium",
      });

      await fetchTickets();

      if (payload.ticketId) {
        navigate(`/support/tickets/${payload.ticketId}`);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit support ticket");
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
      <SEO title="Support Tickets | Promorang" description="View and create support tickets for your Promorang account." />

      <main className="pt-24 pb-20 px-6">
        <div className="container max-w-6xl mx-auto space-y-10">
          <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl font-bold">Support tickets</h1>
              <p className="mt-3 text-muted-foreground">
                Track account issues, payout questions, and operational problems in one place.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/contact">General contact</Link>
            </Button>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border border-border bg-card rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Your queue</h2>
                  <p className="text-sm text-muted-foreground">Open the exact ticket linked from support emails.</p>
                </div>
                <LifeBuoy className="h-5 w-5 text-primary" />
              </div>

              {loading ? (
                <div className="flex min-h-[240px] items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading tickets
                </div>
              ) : error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : orderedTickets.length === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                  <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">No tickets yet</p>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Submit a support request here instead of sending fragmented email threads.
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
                            {new Date(ticket.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[ticket.status] || "bg-muted text-foreground border-border"}`}>
                          {ticket.status.replace("_", " ")}
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
                  <h2 className="text-xl font-semibold">New support request</h2>
                  <p className="text-sm text-muted-foreground">Use this for account-specific issues that need follow-up.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    placeholder="What needs attention?"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="account">Account</option>
                      <option value="billing">Billing</option>
                      <option value="content_report">Content report</option>
                      <option value="feature_request">Feature request</option>
                      <option value="bug">Bug</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <select
                      id="priority"
                      value={form.priority}
                      onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Details</label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    placeholder="Include the affected Moment, payout, merchant, or approximate time so support can trace it."
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
                  {submitting ? "Submitting" : "Submit ticket"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
