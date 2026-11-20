import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { importedClaimStatusLabel, importedListingCopy } from "@/i18n/imported-listing-copy";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseImportedListingClaimTarget, safeEvidenceUrl } from "@/lib/imported-listing-claims";
import { getImportedListingClaimTarget, listMyImportedListingClaims, requestImportedListingClaim } from "@/services/imported-listing-claims";

export function ImportedListingClaims() {
  const { user } = useAuth();
  const { locale, formatDate } = useI18n();
  const copy = importedListingCopy[locale];
  const { toast } = useToast();
  const [params] = useSearchParams();
  const selection = parseImportedListingClaimTarget(params);
  const hasSelection = params.has("entity_type") || params.has("entity_id");
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setNote(""); setEvidenceUrl(""); }, [selection?.entityType, selection?.entityId]);

  const claims = useQuery({
    queryKey: ["my-imported-listing-claims", user?.id],
    queryFn: listMyImportedListingClaims,
    enabled: Boolean(user),
  });
  const target = useQuery({
    queryKey: ["imported-listing-claim-target", selection?.entityType, selection?.entityId],
    queryFn: () => getImportedListingClaimTarget(selection!.entityType, selection!.entityId),
    enabled: Boolean(selection),
  });
  const existingClaim = claims.data?.find((claim) => claim.entity_type === selection?.entityType
    && claim.entity_id === selection?.entityId && ["pending", "requested", "approved"].includes(claim.status));
  const publicPath = target.data?.public_path;
  const canSubmit = Boolean(selection && target.data?.claimable && !existingClaim && !claims.isLoading && !claims.isError);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selection || !canSubmit) return;
    const safeUrl = safeEvidenceUrl(evidenceUrl);
    if (!note.trim() || !safeUrl) {
      toast({ title: copy.submitFailed, description: !note.trim() ? copy.noteRequired : copy.invalidLink, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await requestImportedListingClaim(selection.entityType, selection.entityId, note.trim(), safeUrl);
      await queryClient.invalidateQueries({ queryKey: ["my-imported-listing-claims"] });
      setNote("");
      setEvidenceUrl("");
      toast({ title: copy.submitted, description: copy.submittedCopy });
    } catch (error) {
      toast({ title: copy.submitFailed, description: error && typeof error === "object" && "message" in error ? String(error.message) : copy.loadFailed, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (!hasSelection && !claims.isError && !claims.data?.length) return null;

  return (
    <section className="mt-9 space-y-4" aria-live="polite">
      {hasSelection && <Card><CardContent className="space-y-4 p-5 sm:p-6">
        <div><h2 className="text-2xl font-bold">{copy.importedTitle}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.importedCopy}</p></div>
        {selection && target.isLoading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{copy.targetLoading}</p> : null}
        {!selection || target.isError || (!target.isLoading && !target.data) ? <p className="text-sm text-destructive">{copy.targetUnavailable}</p> : null}
        {target.data && <div className="rounded-lg border p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy[target.data.entity_type]}</p><h3 className="mt-1 text-xl font-bold">{target.data.display_name}</h3>{publicPath && /^\/(moments|venues)\//.test(publicPath) ? <Link className="mt-2 inline-block text-sm font-medium text-primary underline" to={publicPath}>{copy.targetView}</Link> : null}</div>}
        {existingClaim && <p className="text-sm text-muted-foreground">{existingClaim.status === "approved" ? copy.granted : copy.awaiting}</p>}
        {target.data && !target.data.claimable && !existingClaim ? <p className="text-sm text-muted-foreground">{copy.unavailable}</p> : null}
        {canSubmit && <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="imported-claim-note">{copy.noteLabel}</Label><Textarea id="imported-claim-note" required minLength={20} maxLength={4000} rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder={copy.notePlaceholder} /></div>
          <div className="space-y-2"><Label htmlFor="imported-claim-evidence">{copy.evidenceLabel}</Label><Input id="imported-claim-evidence" required type="url" maxLength={2048} value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder={copy.evidencePlaceholder} aria-describedby="imported-claim-evidence-help" /><p id="imported-claim-evidence-help" className="text-xs leading-5 text-muted-foreground">{copy.evidenceHelp}</p></div>
          <Button type="submit" disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{copy.submit}</Button>
        </form>}
      </CardContent></Card>}
      {claims.isError && <Card><CardContent className="space-y-3 p-5"><p role="alert" className="text-sm text-destructive">{copy.loadFailed}</p><Button type="button" variant="outline" onClick={() => claims.refetch()}>{copy.retry}</Button></CardContent></Card>}
      {Boolean(claims.data?.length) && <div className="space-y-3"><h2 className="text-xl font-bold">{copy.myClaims}</h2>{claims.data?.map((claim) => {
        const Icon = claim.entity_type === "moment" ? CalendarDays : MapPin;
        return <Card key={claim.id}><CardContent className="flex gap-4 p-5"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{copy[claim.entity_type]} · {importedClaimStatusLabel(claim.status, locale)}</p><h3 className="mt-1 text-lg font-bold">{claim.display_name}</h3><p className="mt-1 text-xs text-muted-foreground">{formatDate(claim.created_at, { month: "short", day: "numeric", year: "numeric" })}</p>{claim.review_note ? <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{claim.review_note}</p> : null}</div></CardContent></Card>;
      })}</div>}
    </section>
  );
}
