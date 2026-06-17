import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft, Clock3, Loader2, MessageSquareText } from "lucide-react";

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
};

const apiBase = import.meta.env.VITE_API_URL || "https://api.promorang.co";

export default function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        throw new Error(payload.error || "Failed to load ticket");
      }

      setTicket(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Support Ticket | Promorang" description="Review the status of your Promorang support request." />

      <main className="pt-24 pb-20 px-6">
        <div className="container max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" asChild className="px-0">
              <Link to="/support/tickets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to tickets
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">General contact</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading ticket
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : !ticket ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="font-medium">Ticket not found</p>
            </div>
          ) : (
            <>
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket #{ticket.id}</p>
                    <h1 className="mt-2 text-3xl font-semibold">{ticket.subject}</h1>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium capitalize">
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
                    <p className="mt-2 font-medium capitalize">{ticket.category.replace("_", " ")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Priority</p>
                    <p className="mt-2 font-medium capitalize">{ticket.priority}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated</p>
                    <p className="mt-2 font-medium">{new Date(ticket.updated_at || ticket.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Your request</h2>
                </div>
                <p className="whitespace-pre-wrap leading-7 text-foreground/90">{ticket.message}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Submitted {new Date(ticket.created_at).toLocaleString()}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Support response</h2>
                </div>
                {ticket.admin_notes ? (
                  <p className="whitespace-pre-wrap leading-7 text-foreground/90">{ticket.admin_notes}</p>
                ) : (
                  <p className="text-muted-foreground">
                    No reply has been posted yet. Support updates will also reach the email on your account.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
