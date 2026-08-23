import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader2, MapPin, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

type ReviewItem = {
  id: string;
  contributor_id: string;
  contributor_name: string | null;
  contributor_username: string | null;
  proposed_value: { value?: string } | string | null;
  proof: Array<{ type?: string; url?: string; submitted_at?: string }> | null;
  contributor_notes: string | null;
  submitted_at: string;
  field_key: string;
  title: string;
  instructions: string;
  reward_points: number;
  venue_name: string;
  venue_slug: string;
  city: string;
};

function displayValue(value: ReviewItem["proposed_value"]) {
  if (!value) return "No text value supplied";
  if (typeof value === "string") return value;
  return value.value || JSON.stringify(value);
}

export function AdminEnrichmentReviewTab() {
  const { t, formatNumber } = useI18n();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const queue = useQuery({
    queryKey: ["enrichment-review-queue"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("view_enrichment_review_queue")
        .select("*")
        .order("submitted_at", { ascending: true });
      if (error) throw error;
      return (data || []) as ReviewItem[];
    },
  });
  const review = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approved" | "rejected" }) => {
      const { data, error } = await (supabase as any).rpc("review_listing_enrichment", {
        p_claim_id: id,
        p_decision: decision,
        p_reviewer_notes: notes[id]?.trim() || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (result: any) => {
      toast.success(result?.status === "approved" ? `Proof approved · ${result.points} points settled` : "Proof returned to the open queue");
      await queryClient.invalidateQueries({ queryKey: ["enrichment-review-queue"] });
    },
    onError: (error: any) => toast.error(error.message || "Review could not be completed"),
  });

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t("adminEnrich.eyebrow")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">{t("adminEnrich.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("adminEnrich.subtitle")}</p>
        </div>
        <Badge variant="outline" className="w-fit">{t("adminEnrich.awaiting", { count: formatNumber(queue.data?.length || 0) })}</Badge>
      </div>

      <div className="mt-7 space-y-5">
        {queue.isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading submissions…</div> : null}
        {queue.isError ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{(queue.error as Error).message}</div> : null}
        {!queue.isLoading && !queue.data?.length ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-emerald-500" />
            <h3 className="mt-3 text-xl font-bold">{t("adminEnrich.emptyTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("adminEnrich.emptySubtitle")}</p>
          </div>
        ) : null}
        {queue.data?.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/30 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><Badge>{item.field_key.replace(/_/g, " ")}</Badge><span className="text-xs text-muted-foreground">Submitted {new Date(item.submitted_at).toLocaleString()}</span></div>
                  <h3 className="mt-3 text-2xl font-bold">{item.title}</h3>
                  <Link to={`/venues/${item.venue_slug}`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><MapPin className="h-3.5 w-3.5" />{item.venue_name} · {item.city}</Link>
                </div>
                <div className="rounded-2xl bg-amber-500/10 px-4 py-3 text-right"><p className="text-xs font-bold uppercase tracking-wider text-amber-600">Approval reward</p><p className="text-2xl font-black text-amber-600">{item.reward_points} pts</p></div>
              </div>
            </div>
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Submitted value</p>
                <p className="mt-2 break-words rounded-xl border border-border bg-background p-4 font-medium">{displayValue(item.proposed_value)}</p>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Scout notes</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{item.contributor_notes || "No additional field notes."}</p>
                <p className="mt-5 text-xs text-muted-foreground">Contributor: {item.contributor_name || item.contributor_username || item.contributor_id}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Evidence</p>
                <div className="mt-2 space-y-2">
                  {item.proof?.length ? item.proof.map((proof, index) => proof.url ? (
                    <a key={`${proof.url}-${index}`} href={proof.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-border p-3 text-sm font-semibold hover:bg-muted"><span>Open evidence {index + 1}</span><ExternalLink className="h-4 w-4" /></a>
                  ) : null) : <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">No media attached; assess the written value and notes.</p>}
                </div>
              </div>
            </div>
            <div className="border-t border-border p-5 sm:p-6">
              <Textarea value={notes[item.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Reviewer note: why this evidence was accepted or what must be corrected" />
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: item.id, decision: "rejected" })}><XCircle className="mr-2 h-4 w-4" />{t("adminEnrich.reject")}</Button>
                <Button disabled={review.isPending} onClick={() => review.mutate({ id: item.id, decision: "approved" })}>{review.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{t("adminEnrich.approve")}</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
