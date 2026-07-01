import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, MapPin, RotateCcw, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type PioneerReviewEvent = {
  id: string;
  event_type: string;
  contributor_type: string;
  points: number;
  status: "pending" | "verified" | "rejected" | "reversed";
  occurred_at: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  venue?: { id: string; name: string; address: string; image_url?: string | null } | null;
};

async function adminRequest(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload;
}

export function AdminPioneerReviewTab() {
  const [status, setStatus] = useState("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const query = useQuery<{ events: PioneerReviewEvent[]; total: number }>({
    queryKey: ["admin", "pioneer-events", status],
    queryFn: () => adminRequest(`/admin/pioneer-events?status=${status}`),
  });
  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: string }) =>
      adminRequest(`/admin/pioneer-events/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ decision, reason: reasons[id] || null }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pioneer-events"] });
      toast({ title: `Receipt ${variables.decision}`, description: "The audited Pioneer record has been updated." });
    },
    onError: (error: Error) => toast({ title: "Review failed", description: error.message, variant: "destructive" }),
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Genesis integrity</p><h2 className="mt-1 text-3xl font-black">Pioneer receipt review</h2><p className="mt-2 text-sm text-muted-foreground">Confirm the source and identity behind every contribution before it enters the verified record.</p></div>
        <div className="flex rounded-xl border border-border p-1">
          {["pending", "verified", "rejected", "reversed"].map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize ${status === item ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{item}</button>)}
        </div>
      </div>

      {query.isLoading && <div className="h-48 animate-pulse rounded-2xl bg-muted" />}
      {query.error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">{(query.error as Error).message}</div>}
      {!query.isLoading && !query.data?.events.length && <div className="rounded-2xl border border-dashed border-border p-10 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-primary" /><p className="mt-3 font-black">No {status} receipts</p><p className="mt-1 text-sm text-muted-foreground">The queue is clear.</p></div>}

      <div className="space-y-3">
        {query.data?.events.map((event) => (
          <article key={event.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div className="flex gap-4">
                {event.venue?.image_url ? <img src={event.venue.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"><MapPin className="text-primary" /></div>}
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="font-black">{event.venue?.name || event.metadata?.venue_name as string || "Pioneer contribution"}</p><span className="rounded-full bg-amber-400/10 px-2 py-1 text-[9px] font-black uppercase text-amber-600">{event.status}</span></div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.venue?.address || "User contribution"} · {event.event_type.replaceAll("_", " ")}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs"><span className="font-black text-primary">+{Number(event.points).toLocaleString()} points</span><span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="h-3 w-3" />{new Date(event.occurred_at).toLocaleString()}</span></div>
                  {event.reason && <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">Reason: {event.reason}</p>}
                </div>
              </div>
              {event.status === "pending" && <div className="space-y-3">
                <Textarea aria-label="Reason for rejection" placeholder="Reason required only when rejecting…" value={reasons[event.id] || ""} onChange={(e) => setReasons((current) => ({ ...current, [event.id]: e.target.value }))} />
                <div className="flex gap-2"><Button className="flex-1" onClick={() => review.mutate({ id: event.id, decision: "verified" })} disabled={review.isPending}><Check className="mr-2 h-4 w-4" />Verify</Button><Button variant="outline" onClick={() => review.mutate({ id: event.id, decision: "rejected" })} disabled={review.isPending || !reasons[event.id]?.trim()}><X className="mr-2 h-4 w-4" />Reject</Button></div>
              </div>}
              {event.status === "verified" && <div className="space-y-3"><Textarea aria-label="Reason for reversal" placeholder="Required reason for reversal…" value={reasons[event.id] || ""} onChange={(e) => setReasons((current) => ({ ...current, [event.id]: e.target.value }))} /><Button variant="destructive" className="w-full" onClick={() => review.mutate({ id: event.id, decision: "reversed" })} disabled={review.isPending || !reasons[event.id]?.trim()}><RotateCcw className="mr-2 h-4 w-4" />Reverse receipt</Button></div>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
