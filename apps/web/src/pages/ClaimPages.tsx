import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, CheckCircle2, Loader2, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ClaimablePage = { claim_id: string; entity_type: "scene" | "moment" | "venue" | "brand"; entity_id: string; display_name: string; status: string; created_at: string; requested_at: string | null; review_note: string | null };
const icons = { scene: Users, moment: CalendarDays, venue: MapPin, brand: Building2 };

export default function ClaimPages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const query = useQuery({
    queryKey: ["my-claimable-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_my_page_ownership_claims");
      if (error) throw error;
      return (data || []) as ClaimablePage[];
    },
  });

  const claim = async (item: ClaimablePage) => {
    setBusy(item.claim_id);
    try {
      const { error } = await supabase.rpc("request_page_ownership", {
        p_claim_id: item.claim_id,
        p_note: notes[item.claim_id]?.trim() || null,
        p_evidence: { supporting_links: (evidence[item.claim_id] || "").split(/\s+/).filter(Boolean) },
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-claimable-pages"] });
      toast({ title: "Claim submitted", description: `An admin will review your request for ${item.display_name}.` });
    } catch (error) {
      toast({ title: "Could not claim page", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-10 sm:py-16">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Ownership</p>
      <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Pages waiting for you</h1>
      <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">These pages were prepared for your verified email address. Tell us how you are connected to the page, then an admin will review and grant ownership.</p>

      <div className="mt-9 space-y-3" aria-live="polite">
        {query.isLoading && <div className="flex items-center gap-2 py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Checking for pages…</div>}
        {query.data?.map((item) => {
          const Icon = icons[item.entity_type];
          return <Card key={item.claim_id}><CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
            <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.entity_type} · {item.status}</p><h2 className="truncate text-xl font-bold">{item.display_name}</h2><p className="mt-1 text-xs text-muted-foreground">Prepared {new Date(item.created_at).toLocaleDateString()}</p>
              {(item.status === "available" || item.status === "rejected") && <Textarea className="mt-4" value={notes[item.claim_id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item.claim_id]: event.target.value }))} placeholder="Explain your relationship to this page and include any helpful verification details." rows={3} />}
              {(item.status === "available" || item.status === "rejected") && <Input className="mt-2" value={evidence[item.claim_id] || ""} onChange={(event) => setEvidence((current) => ({ ...current, [item.claim_id]: event.target.value }))} placeholder="Supporting website, social profile, or document link" />}
              {item.status === "requested" && <p className="mt-3 text-sm text-amber-600">Your request is awaiting admin review.</p>}
              {item.status === "approved" && <p className="mt-3 text-sm text-emerald-600">Ownership has been granted to your account.</p>}
              {item.status === "rejected" && item.review_note && <p className="mt-3 text-sm text-destructive">Admin note: {item.review_note}</p>}
            </div>
            {(item.status === "available" || item.status === "rejected") && <Button disabled={busy === item.claim_id} onClick={() => claim(item)}>{busy === item.claim_id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}Submit claim</Button>}
          </CardContent></Card>;
        })}
        {!query.isLoading && !query.data?.length && <Card><CardContent className="p-10 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-primary" /><h2 className="mt-4 text-xl font-bold">No ownership invitations</h2><p className="mt-2 text-sm text-muted-foreground">If an admin prepares a page for you, sign in with the same email they used and it will appear here.</p><Button asChild variant="outline" className="mt-5"><Link to="/dashboard">Return to dashboard</Link></Button></CardContent></Card>}
      </div>
    </main>
  );
}
