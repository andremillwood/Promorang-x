import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

type Item = {
  id: string;
  event_title: string;
  mission_type: string;
  title: string;
  instructions: string;
  reward_points: number;
  proposed_start: string | null;
  proposed_venue: string | null;
  source_url: string | null;
  proposed_value: any;
  proof: any[];
  contributor_notes: string | null;
  submitted_at: string;
};

export function AdminEventVerificationReviewTab() {
  const { t } = useI18n();
  const client = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const queue = useQuery({
    queryKey: ["event-verification-review"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("view_event_verification_review_queue")
        .select("*")
        .order("submitted_at");
      if (error) throw error;
      return (data || []) as Item[];
    },
  });

  const review = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: string }) => {
      const { data, error } = await (supabase as any).rpc("review_event_verification", {
        p_claim_id: id,
        p_decision: decision,
        p_reviewer_notes: notes[id]?.trim() || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      toast.success(data.status === "approved" ? `Evidence approved · ${data.points} points settled` : "Evidence rejected and mission reopened");
      await client.invalidateQueries({ queryKey: ["event-verification-review"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <section>
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-primary">{t("adminEvents.eyebrow")}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">{t("adminEvents.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("adminEvents.subtitle")}</p>
      </div>
      <div className="mt-6 space-y-4">
        {queue.isLoading ? <Loader2 className="animate-spin" /> : queue.data?.map((item) => (
          <article key={item.id} className="rounded-3xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge>{item.mission_type}</Badge>
                <h3 className="mt-3 text-2xl font-bold">{item.event_title}</h3>
                <p className="text-sm text-muted-foreground">{item.proposed_venue || "Venue unresolved"} · {item.proposed_start ? new Date(item.proposed_start).toLocaleDateString() : "Date unresolved"}</p>
              </div>
              <span className="font-bold text-amber-500">{item.reward_points} pts</span>
            </div>
            <div className="mt-5 rounded-xl border bg-background p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Submitted evidence</p>
              <p className="mt-2 break-words">{item.proposed_value?.value || JSON.stringify(item.proposed_value) || "Media proof only"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.contributor_notes}</p>
              {item.proof?.map((p, i) => p.url ? <a key={i} href={p.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary">Open proof <ExternalLink className="h-3 w-3" /></a> : null)}
              {item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer" className="ml-4 inline-flex items-center gap-1 text-sm text-primary">Compare source <ExternalLink className="h-3 w-3" /></a> : null}
            </div>
            <Textarea className="mt-4" value={notes[item.id] || ""} onChange={(e) => setNotes((v) => ({ ...v, [item.id]: e.target.value }))} placeholder="Reviewer rationale" />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: item.id, decision: "rejected" })}>{t("adminEvents.reject")}</Button>
              <Button disabled={review.isPending} onClick={() => review.mutate({ id: item.id, decision: "approved" })}>{t("adminEvents.approve")}</Button>
            </div>
          </article>
        ))}
        {!queue.isLoading && !queue.data?.length ? <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">{t("adminEvents.empty")}</div> : null}
      </div>
    </section>
  );
}
