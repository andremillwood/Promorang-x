import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, Loader2, MapPin, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const pageTypes = [
  { id: "scene", label: "Scene", icon: Users, hint: "A living community people can return to." },
  { id: "moment", label: "Moment", icon: CalendarDays, hint: "A scheduled gathering or activation." },
  { id: "venue", label: "Venue", icon: MapPin, hint: "A place that hosts people and experiences." },
  { id: "brand", label: "Brand", icon: Building2, hint: "An organization profile and workspace." },
] as const;

type PageType = (typeof pageTypes)[number]["id"];

export function AdminClaimablePagesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [type, setType] = useState<PageType>("scene");
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [verificationMethods, setVerificationMethods] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "", ownerEmail: "", description: "", location: "", startsAt: "", website: "",
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const requests = useQuery({
    queryKey: ["admin-page-ownership-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_ownership_claims")
        .select("id,entity_type,display_name,intended_owner_email,claimant_note,claimant_evidence,requested_at,status")
        .eq("status", "requested")
        .order("requested_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: form.name.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        city: type === "scene" ? form.location.trim() || null : null,
        address: type === "venue" ? form.location.trim() || null : null,
        location: type === "moment" ? form.location.trim() || null : null,
        starts_at: type === "moment" && form.startsAt ? new Date(form.startsAt).toISOString() : null,
        website: type === "brand" || type === "venue" ? form.website.trim() || null : null,
      };
      const { data, error } = await supabase.rpc("admin_create_claimable_page", {
        p_entity_type: type,
        p_owner_email: form.ownerEmail.trim(),
        p_payload: payload,
      });
      if (error) throw error;
      toast({
        title: `${pageTypes.find((item) => item.id === type)?.label} created`,
        description: `${data?.name || form.name} can now be claimed by ${form.ownerEmail.trim()}.`,
      });
      setForm({ name: "", ownerEmail: "", description: "", location: "", startsAt: "", website: "" });
    } catch (error) {
      toast({ title: "Could not create page", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const review = async (claimId: string, decision: "approved" | "rejected") => {
    setReviewing(claimId);
    try {
      const { error } = await supabase.rpc("admin_review_page_ownership", {
        p_claim_id: claimId,
        p_decision: decision,
        p_review_note: reviewNotes[claimId]?.trim() || null,
        p_verification_method: decision === "approved" ? verificationMethods[claimId] || null : null,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["admin-page-ownership-requests"] });
      toast({ title: decision === "approved" ? "Ownership granted" : "Claim rejected", description: "The claimant’s request has been reviewed." });
    } catch (error) {
      toast({ title: "Review failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.18),transparent_38%),hsl(var(--card))] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary p-3 text-primary-foreground"><Sparkles className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Create on behalf of an owner</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Seed the page. Let its owner take it home.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">The page goes live under temporary platform stewardship. Only the signed-in account matching the owner email can claim it.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Page type">
        {pageTypes.map((item) => {
          const Icon = item.icon;
          const selected = type === item.id;
          return (
            <button key={item.id} type="button" role="radio" aria-checked={selected} onClick={() => setType(item.id)}
              className={`rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/40"}`}>
              <Icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
              <strong className="mt-3 block">{item.label}</strong>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.hint}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit}>
        <Card>
          <CardHeader><CardTitle>{pageTypes.find((item) => item.id === type)?.label} details</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="claim-page-name">Page name</Label><Input id="claim-page-name" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Name people will recognize" /></div>
            <div className="space-y-2"><Label htmlFor="claim-owner-email">Owner email</Label><Input id="claim-owner-email" required type="email" value={form.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} placeholder="owner@example.com" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="claim-description">Description</Label><Textarea id="claim-description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What should people know about this page?" rows={4} /></div>
            {(type === "scene" || type === "moment" || type === "venue") && <div className="space-y-2"><Label htmlFor="claim-location">{type === "scene" ? "City" : "Location"}</Label><Input id="claim-location" value={form.location} onChange={(e) => update("location", e.target.value)} /></div>}
            {type === "moment" && <div className="space-y-2"><Label htmlFor="claim-start">Starts at</Label><Input id="claim-start" type="datetime-local" value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} /></div>}
            {(type === "brand" || type === "venue") && <div className="space-y-2"><Label htmlFor="claim-website">Website</Label><Input id="claim-website" type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" /></div>}
            <div className="flex items-center justify-end sm:col-span-2"><Button disabled={busy} className="min-w-44">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create claimable page</Button></div>
          </CardContent>
        </Card>
      </form>

      <section className="space-y-4">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Ownership review</p><h2 className="mt-2 font-serif text-3xl font-bold">Claims awaiting a decision</h2></div>
        {requests.isLoading && <p className="text-sm text-muted-foreground">Loading ownership requests…</p>}
        {requests.data?.map((request) => (
          <Card key={request.id}>
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_16rem]">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{request.entity_type}</p><h3 className="mt-1 text-xl font-bold">{request.display_name}</h3><p className="mt-1 text-sm text-muted-foreground">{request.intended_owner_email}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{request.claimant_note || "No supporting note was provided."}</p>{Array.isArray((request.claimant_evidence as { supporting_links?: string[] } | null)?.supporting_links) && <div className="mt-4 space-y-1">{(request.claimant_evidence as { supporting_links: string[] }).supporting_links.map((link) => <a key={link} href={link} target="_blank" rel="noreferrer" className="block break-all text-sm font-medium text-primary underline">{link}</a>)}</div>}</div>
              <div className="space-y-3"><label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification method<select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm normal-case tracking-normal" value={verificationMethods[request.id] || ""} onChange={(event) => setVerificationMethods((current) => ({ ...current, [request.id]: event.target.value }))}><option value="">Ownership only · verification pending</option><option value="company_domain_email">Company-domain email</option><option value="website_control">Website control</option><option value="official_social_account">Official social account</option><option value="business_documentation">Business documentation</option><option value="manual_admin_review">Manual admin review</option></select></label><Textarea value={reviewNotes[request.id] || ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Review note (required for rejection)" rows={3} /><div className="grid grid-cols-2 gap-2"><Button type="button" disabled={reviewing === request.id} onClick={() => review(request.id, "approved")}>Approve</Button><Button type="button" variant="destructive" disabled={reviewing === request.id} onClick={() => review(request.id, "rejected")}>Reject</Button></div></div>
            </CardContent>
          </Card>
        ))}
        {!requests.isLoading && !requests.data?.length && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No ownership claims are awaiting review.</CardContent></Card>}
      </section>
    </div>
  );
}
