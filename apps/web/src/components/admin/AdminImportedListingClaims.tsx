import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/I18nContext";
import { importedListingCopy } from "@/i18n/imported-listing-copy";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { safeEvidenceUrl } from "@/lib/imported-listing-claims";
import { listAdminImportedListingClaims, reviewImportedListingClaim } from "@/services/imported-listing-claims";

export function AdminImportedListingClaims() {
  const { locale, formatDate } = useI18n();
  const copy = importedListingCopy[locale];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const requests = useQuery({ queryKey: ["admin-imported-listing-claims"], queryFn: listAdminImportedListingClaims });
  const pending = requests.data?.filter((claim) => ["pending", "requested"].includes(claim.status)) || [];

  const review = async (claimId: string, decision: "approved" | "rejected") => {
    const reviewNote = notes[claimId]?.trim();
    if (!reviewNote) return;
    setBusy(claimId);
    try {
      await reviewImportedListingClaim(claimId, decision, reviewNote);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-imported-listing-claims"] }),
        queryClient.invalidateQueries({ queryKey: ["my-imported-listing-claims"] }),
        queryClient.invalidateQueries({ queryKey: ["imported-listing-claim-target"] }),
        queryClient.invalidateQueries({ queryKey: ["venue-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["canonical-moment-feed"] }),
        queryClient.invalidateQueries({ queryKey: ["public-moment-detail"] }),
      ]);
      toast({ title: copy.reviewed });
    } catch (error) {
      toast({ title: copy.reviewFailed, description: error && typeof error === "object" && "message" in error ? String(error.message) : copy.loadFailed, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return <section className="space-y-4">
    <div><h2 className="font-serif text-3xl font-bold">{copy.reviewTitle}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.reviewCopy}</p></div>
    {requests.isLoading ? <p className="text-sm text-muted-foreground">{copy.loading}</p> : null}
    {requests.isError ? <Card><CardContent className="space-y-3 p-5"><p role="alert" className="text-sm text-destructive">{copy.loadFailed}</p><Button type="button" variant="outline" onClick={() => requests.refetch()}>{copy.retry}</Button></CardContent></Card> : null}
    {pending.map((claim) => {
      const evidenceUrl = safeEvidenceUrl(claim.evidence_url);
      return <Card key={claim.id}><CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_18rem]">
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{copy[claim.entity_type]}</p><h3 className="mt-1 text-xl font-bold">{claim.display_name}</h3><p className="mt-2 break-all text-xs text-muted-foreground">{copy.claimant}: {claim.claimant_id}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(claim.created_at, { month: "short", day: "numeric", year: "numeric" })}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{claim.claimant_note}</p>{evidenceUrl ? <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block break-all text-sm font-medium text-primary underline">{evidenceUrl}</a> : null}</div>
        <div className="space-y-3"><Label htmlFor={`imported-review-${claim.id}`}>{copy.reviewNote}</Label><Textarea id={`imported-review-${claim.id}`} rows={4} maxLength={4000} value={notes[claim.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [claim.id]: event.target.value }))} placeholder={copy.reviewNotePlaceholder} /><div className="grid gap-2"><Button type="button" disabled={Boolean(busy) || !notes[claim.id]?.trim()} onClick={() => review(claim.id, "approved")}>{copy.approve}</Button><Button type="button" variant="destructive" disabled={Boolean(busy) || !notes[claim.id]?.trim()} onClick={() => review(claim.id, "rejected")}>{copy.reject}</Button></div></div>
      </CardContent></Card>;
    })}
    {!requests.isLoading && !requests.isError && !pending.length ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{copy.noPending}</CardContent></Card> : null}
  </section>;
}
