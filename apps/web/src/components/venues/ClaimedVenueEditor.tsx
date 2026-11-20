import { useId, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { claimedVenueCopy } from "@/i18n/claimed-venue-copy";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getMyClaimedVenueProfile,
  updateClaimedVenueProfile,
  ClaimedVenueError,
  type ClaimedVenueProfile,
  type ClaimedVenueProfileUpdate,
} from "@/services/claimed-venue-profile";

function normalizeWebsite(value: string): string | null {
  if (!value.trim()) return null;
  const url = new URL(value.trim());
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new ClaimedVenueError("CLAIMED_VENUE_INVALID_WEBSITE");
  return url.href;
}

export function ClaimedVenueEditor({ venueId }: { venueId: string }) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const copy = claimedVenueCopy[locale];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formId = useId();
  const [draft, setDraft] = useState<ClaimedVenueProfile | null>(null);
  const ownerProfile = useQuery({
    queryKey: ["my-claimed-venue-profile", user?.id, venueId],
    queryFn: () => getMyClaimedVenueProfile(venueId),
    enabled: Boolean(user && venueId),
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const save = useMutation({
    mutationFn: (input: { venueId: string; ownerId: string; update: ClaimedVenueProfileUpdate }) => updateClaimedVenueProfile(input.venueId, input.update),
    onSuccess: async (profile, input) => {
      queryClient.setQueryData(["my-claimed-venue-profile", input.ownerId, input.venueId], profile);
      setDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["venue-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["explore-venues"] }),
        queryClient.invalidateQueries({ queryKey: ["merchant-venues"] }),
        queryClient.invalidateQueries({ queryKey: ["canonical-moment-feed"] }),
        queryClient.invalidateQueries({ queryKey: ["imported-listing-claim-target"] }),
      ]);
      toast({ title: copy.saved });
    },
    onError: (error) => {
      toast({
        title: copy.saveFailed,
        description: error && typeof error === "object" && "message" in error && !String(error.message).startsWith("CLAIMED_VENUE_") ? String(error.message) : copy.failed,
        variant: "destructive",
      });
    },
  });

  // The lookup returns null unless the signed-in person has an approved claim
  // and still owns the canonical row. A client role alone never opens editing.
  if (!user || !ownerProfile.data) return null;
  const profile = draft?.id === venueId ? draft : ownerProfile.data;
  const dirty = draft?.id === venueId;
  const change = (key: keyof ClaimedVenueProfileUpdate, value: string) => setDraft({ ...profile, [key]: value });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (save.isPending || !dirty || ownerProfile.isError) return;
    const name = profile.name.trim();
    if (name.length < 2 || name.length > 200) {
      toast({ title: copy.saveFailed, description: copy.invalidName, variant: "destructive" });
      return;
    }
    let website: string | null;
    try {
      website = normalizeWebsite(profile.website || "");
    } catch {
      toast({ title: copy.saveFailed, description: copy.invalidWebsite, variant: "destructive" });
      return;
    }
    save.mutate({ venueId, ownerId: user.id, update: { name, description: profile.description?.trim() || null, website, phone: profile.phone?.trim() || null } });
  };

  return <section aria-labelledby={`${formId}-heading`} className="mx-auto max-w-[1320px] px-5 py-8 sm:px-6">
    <Card className="border-primary/25"><CardContent className="space-y-5 p-5 sm:p-6">
      <div><h2 id={`${formId}-heading`} className="text-2xl font-bold">{copy.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.description}</p></div>
      {ownerProfile.isError ? <div role="alert" className="space-y-2"><p className="text-sm text-destructive">{copy.loadFailed}</p><Button type="button" variant="outline" onClick={() => ownerProfile.refetch()} disabled={ownerProfile.isFetching}>{copy.retry}</Button></div> : null}
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={save.isPending || ownerProfile.isError} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor={`${formId}-name`}>{copy.name}</Label><Input id={`${formId}-name`} required minLength={2} maxLength={200} value={profile.name} onChange={(event) => change("name", event.target.value)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor={`${formId}-description`}>{copy.about}</Label><Textarea id={`${formId}-description`} maxLength={4000} rows={4} value={profile.description || ""} onChange={(event) => change("description", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor={`${formId}-website`}>{copy.website}</Label><Input id={`${formId}-website`} type="url" maxLength={2048} value={profile.website || ""} onChange={(event) => change("website", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor={`${formId}-phone`}>{copy.phone}</Label><Input id={`${formId}-phone`} type="tel" maxLength={100} value={profile.phone || ""} onChange={(event) => change("phone", event.target.value)} /></div>
        </fieldset>
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={!dirty || save.isPending || ownerProfile.isError}>{save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{copy.save}</Button>{dirty ? <Button type="button" variant="outline" disabled={save.isPending} onClick={() => setDraft(null)}>{copy.discard}</Button> : null}</div>
      </form>
    </CardContent></Card>
  </section>;
}
