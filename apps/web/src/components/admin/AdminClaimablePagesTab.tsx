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
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const pageTypes = [
  { id: "scene", labelKey: "claimPg.scene" as const, hintKey: "claimPg.sceneHint" as const, icon: Users },
  { id: "moment", labelKey: "claimPg.moment" as const, hintKey: "claimPg.momentHint" as const, icon: CalendarDays },
  { id: "venue", labelKey: "claimPg.venue" as const, hintKey: "claimPg.venueHint" as const, icon: MapPin },
  { id: "brand", labelKey: "claimPg.brand" as const, hintKey: "claimPg.brandHint" as const, icon: Building2 },
] as const satisfies ReadonlyArray<{ id: string; labelKey: TranslationKey; hintKey: TranslationKey; icon: typeof Users }>;

type PageType = (typeof pageTypes)[number]["id"];

export function AdminClaimablePagesTab() {
  const { t } = useI18n();
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
        title: t("claimPg.toastCreated", { type: t(pageTypes.find((item) => item.id === type)!.labelKey) }),
        description: t("claimPg.toastCreatedBody", { name: data?.name || form.name, email: form.ownerEmail.trim() }),
      });
      setForm({ name: "", ownerEmail: "", description: "", location: "", startsAt: "", website: "" });
    } catch (error) {
      toast({ title: t("claimPg.toastFail"), description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
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
      toast({ title: decision === "approved" ? t("claimPg.toastGranted") : t("claimPg.toastRejected"), description: t("claimPg.toastReviewed") });
    } catch (error) {
      toast({ title: t("claimPg.toastReviewFail"), description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t("claimPg.createEyebrow")}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">{t("claimPg.createTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("claimPg.createCopy")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4" role="radiogroup" aria-label={t("claimPg.typeAria")}>
        {pageTypes.map((item) => {
          const Icon = item.icon;
          const selected = type === item.id;
          return (
            <button key={item.id} type="button" role="radio" aria-checked={selected} onClick={() => setType(item.id)}
              className={`rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/40"}`}>
              <Icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
              <strong className="mt-3 block">{t(item.labelKey)}</strong>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t(item.hintKey)}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit}>
        <Card>
          <CardHeader><CardTitle>{t("claimPg.details", { type: t(pageTypes.find((item) => item.id === type)!.labelKey) })}</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="claim-page-name">{t("claimPg.pageName")}</Label><Input id="claim-page-name" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("claimPg.pageNamePh")} /></div>
            <div className="space-y-2"><Label htmlFor="claim-owner-email">{t("claimPg.ownerEmail")}</Label><Input id="claim-owner-email" required type="email" value={form.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)} placeholder="owner@example.com" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="claim-description">{t("claimPg.description")}</Label><Textarea id="claim-description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder={t("claimPg.descPh")} rows={4} /></div>
            {(type === "scene" || type === "moment" || type === "venue") && <div className="space-y-2"><Label htmlFor="claim-location">{type === "scene" ? t("claimPg.city") : t("claimPg.location")}</Label><Input id="claim-location" value={form.location} onChange={(e) => update("location", e.target.value)} /></div>}
            {type === "moment" && <div className="space-y-2"><Label htmlFor="claim-start">{t("claimPg.startsAt")}</Label><Input id="claim-start" type="datetime-local" value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} /></div>}
            {(type === "brand" || type === "venue") && <div className="space-y-2"><Label htmlFor="claim-website">{t("claimPg.website")}</Label><Input id="claim-website" type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" /></div>}
            <div className="flex items-center justify-end sm:col-span-2"><Button disabled={busy} className="min-w-44">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{t("claimPg.createBtn")}</Button></div>
          </CardContent>
        </Card>
      </form>

      <section className="space-y-4">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t("claimPg.reviewEyebrow")}</p><h2 className="mt-2 font-serif text-3xl font-bold">{t("claimPg.reviewTitle")}</h2></div>
        {requests.isLoading && <p className="text-sm text-muted-foreground">{t("claimPg.loading")}</p>}
        {requests.data?.map((request) => (
          <Card key={request.id}>
            <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_16rem]">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{request.entity_type}</p><h3 className="mt-1 text-xl font-bold">{request.display_name}</h3><p className="mt-1 text-sm text-muted-foreground">{request.intended_owner_email}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{request.claimant_note || t("claimPg.noNote")}</p>{Array.isArray((request.claimant_evidence as { supporting_links?: string[] } | null)?.supporting_links) && <div className="mt-4 space-y-1">{(request.claimant_evidence as { supporting_links: string[] }).supporting_links.map((link) => <a key={link} href={link} target="_blank" rel="noreferrer" className="block break-all text-sm font-medium text-primary underline">{link}</a>)}</div>}</div>
              <div className="space-y-3"><label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("claimPg.verify")}<select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm normal-case tracking-normal" value={verificationMethods[request.id] || ""} onChange={(event) => setVerificationMethods((current) => ({ ...current, [request.id]: event.target.value }))}><option value="">{t("claimPg.verifyPending")}</option><option value="company_domain_email">{t("claimPg.vmDomain")}</option><option value="website_control">{t("claimPg.vmWebsite")}</option><option value="official_social_account">{t("claimPg.vmSocial")}</option><option value="business_documentation">{t("claimPg.vmDocs")}</option><option value="manual_admin_review">{t("claimPg.vmManual")}</option></select></label><Textarea value={reviewNotes[request.id] || ""} onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value }))} placeholder={t("claimPg.reviewPh")} rows={3} /><div className="grid grid-cols-2 gap-2"><Button type="button" disabled={reviewing === request.id} onClick={() => review(request.id, "approved")}>{t("claimPg.approve")}</Button><Button type="button" variant="destructive" disabled={reviewing === request.id} onClick={() => review(request.id, "rejected")}>{t("claimPg.reject")}</Button></div></div>
            </CardContent>
          </Card>
        ))}
        {!requests.isLoading && !requests.data?.length && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{t("claimPg.empty")}</CardContent></Card>}
      </section>
    </div>
  );
}
