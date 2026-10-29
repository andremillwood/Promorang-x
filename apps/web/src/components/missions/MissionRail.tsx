import { useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Check, Clock3, ExternalLink, Gift, Loader2, LockKeyhole, ShieldCheck, Target, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { type ContentMission, type MissionParticipation, useContentMissions } from "@/hooks/useContentMissions";
import { CAMERA_CONSENT, MISSION_ARCHETYPES } from "@/lib/mission-archetypes";

type Props = {
  momentId: string;
  signedIn: boolean;
  onSignIn: () => void;
};

const statusCopy: Record<MissionParticipation["status"], string> = {
  joined: "Ready to submit",
  submitted: "Contribution in review",
  verified: "Contribution counted",
  rejected: "Needs another look",
  rewarded: "Reward unlocked",
};

export function MissionRail({ momentId, signedIn, onSignIn }: Props) {
  const { toast } = useToast();
  const { missions, progress, join, submit } = useContentMissions(momentId, signedIn);
  const [selected, setSelected] = useState<ContentMission | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const submitting = useRef(false);
  const validProof = (() => { try { const url = new URL(proofUrl.trim()); return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname); } catch { return false; } })();
  const participationFor = (id: string) => progress.data?.find((item) => item.mission_id === id);

  const joinMission = async (mission: ContentMission) => {
    if (!signedIn) return onSignIn();
    try {
      await join.mutateAsync(mission.id);
      toast({ title: "Mission joined", description: "Your next move is ready. Submit your contribution when you have completed it." });
    } catch (error) {
      toast({ title: "Could not join", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    }
  };

  const submitProof = async () => {
    if (!selected || !validProof || submitting.current) return;
    submitting.current = true;
    setSubmitError("");
    try {
      await submit.mutateAsync({ missionId: selected.id, proofUrl: proofUrl.trim(), note: note.trim() });
      setConfirmation("Contribution received. It is now awaiting review.");
      setSelected(null);
      setProofUrl("");
      setNote("");
      toast({ title: "Contribution received", description: "It is now in review. We will update the mission when it has counted." });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your contribution was not sent. Try again.");
      toast({ title: "Could not submit proof", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally { submitting.current = false; }
  };

  if (missions.isLoading) {
    return <div className="flex gap-3 overflow-hidden"><Skeleton className="h-72 min-w-[82%] rounded-3xl sm:min-w-[390px]" /><Skeleton className="hidden h-72 min-w-[390px] rounded-3xl sm:block" /></div>;
  }
  if (missions.isError) return <div role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm"><p>Missions could not be loaded.</p><Button variant="outline" className="mt-3" disabled={missions.isFetching} onClick={() => void missions.refetch()}>Try again</Button></div>;
  if (!missions.data?.length) return null;

  return (
    <section aria-labelledby="content-missions-title" className="overflow-hidden rounded-[2rem] border border-white/10 bg-black text-white">
      <div className="flex items-end justify-between gap-5 px-5 pb-4 pt-6 sm:px-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Worth doing now</p>
          <h2 id="content-missions-title" className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">Move the moment</h2>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-white/45 sm:block">Simple actions. Visible contribution. Value you can keep.</p>
      </div>

      {confirmation ? <p role="status" className="px-5 pb-4 text-sm text-emerald-300">{confirmation}</p> : null}
      {signedIn && progress.isError ? <div role="alert" className="mx-5 mb-4 rounded-xl border border-destructive/30 p-4 text-sm"><p>Your mission progress could not be loaded.</p><Button variant="outline" className="mt-3" disabled={progress.isFetching} onClick={() => void progress.refetch()}>Try again</Button></div> : null}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-6 sm:px-7">
        {missions.data.map((mission, index) => {
          const participation = participationFor(mission.id);
          const submitted = participation && ["submitted", "verified", "rewarded"].includes(participation.status);
          const archetype = MISSION_ARCHETYPES[mission.archetype || "side_quest"];
          const ArchetypeIcon = archetype.icon;
          return (
            <article key={mission.id} className="group min-w-[88%] snap-start overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 sm:min-w-[400px] sm:max-w-[430px]">
              <div className="relative border-b border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950/50 p-5">
                <span className="absolute right-5 top-5 text-5xl font-black tracking-[-0.08em] text-white/[0.04]">0{index + 1}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    <Target className="h-3.5 w-3.5" /> Mission
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${archetype.tone}`}>
                    <ArchetypeIcon className="h-3 w-3" /> {archetype.label}
                  </span>
                </div>
                <h3 className="mt-8 max-w-[18rem] text-2xl font-black leading-[0.95] tracking-[-0.04em]">{mission.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">{mission.action_text}</p>
                <p className="mt-3 text-xs font-bold text-white/80">{archetype.verb}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white/50">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {mission.due_at ? `Due ${formatDistanceToNow(new Date(mission.due_at), { addSuffix: true })}` : "Complete during the moment"}
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2" aria-label="Action, contribution and reward">
                  {[
                    { label: "Act", detail: mission.proof_type === "referral" ? "Share" : "Create", active: !participation },
                    { label: "Count", detail: mission.proof_type, active: participation?.status === "joined" },
                    { label: "Unlock", detail: mission.reward_value, active: submitted },
                  ].map((step, stepIndex) => (
                    <div className="contents" key={step.label}>
                      <div className={`min-w-0 rounded-xl p-2.5 ${step.active ? "bg-primary text-primary-foreground" : "bg-white/[0.055]"}`}>
                        <p className="text-[8px] font-black uppercase tracking-[0.16em] opacity-60">{step.label}</p>
                        <p className="mt-1 truncate text-xs font-black capitalize">{step.detail}</p>
                      </div>
                      {stepIndex < 2 ? <ArrowRight className="h-3.5 w-3.5 text-white/20" /> : null}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/35"><Gift className="h-3 w-3" /> Reward</p>
                    <p className="mt-1 truncate text-sm font-bold">{mission.reward_value}</p>
                  </div>
                  {participation?.status === "joined" ? (
                    <Button onClick={() => { setSelected(mission); setSubmitError(""); }} disabled={progress.isError} size="sm"><Upload className="mr-2 h-4 w-4" />Submit contribution</Button>
                  ) : participation?.status === "rejected" ? <span className="text-sm text-amber-300">Contribution needs review. Contact the host.</span> : submitted ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
                      <Check className="h-3.5 w-3.5" />{statusCopy[participation.status]}
                    </span>
                  ) : (
                    <Button onClick={() => joinMission(mission)} size="sm" disabled={join.isPending || (signedIn && (progress.isLoading || progress.isError))}>
                      {join.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}Join mission
                    </Button>
                  )}
                </div>
                <details className="mt-4 border-t border-white/10 pt-3 text-xs text-white/45">
                  <summary className="cursor-pointer font-bold text-white/60">What qualifies</summary>
                  <p className="mt-2 leading-5">{mission.qualification_text}</p>
                  <p className="mt-2 flex items-center gap-1.5"><ExternalLink className="h-3 w-3" />{mission.publish_destination}</p>
                  {mission.camera_consent ? (
                    <p className="mt-2 flex items-center gap-1.5 text-white/65">
                      <ShieldCheck className="h-3 w-3 text-emerald-300" />
                      Camera: {CAMERA_CONSENT[mission.camera_consent]}
                    </p>
                  ) : null}
                </details>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !submitting.current) setSelected(null); }}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white overscroll-contain sm:max-w-lg" onEscapeKeyDown={(event) => { if (submitting.current) event.preventDefault(); }} onPointerDownOutside={(event) => { if (submitting.current) event.preventDefault(); }}>
          <DialogHeader>

            <DialogTitle className="break-words pr-8 font-sans text-xl font-semibold">{selected?.title}</DialogTitle>
            <DialogDescription className="text-white/50">Paste your public post link. The host will review it against the mission requirements.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void submitProof(); }} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="mission-proof-url">Public post link</Label>
              <Input id="mission-proof-url" disabled={submit.isPending} type="url" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="https://instagram.com/..." className="min-h-11 border-white/10 bg-white/5 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mission-proof-note">Short note <span className="text-white/35">(optional)</span></Label>
              <Textarea id="mission-proof-note" disabled={submit.isPending} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="Anything the reviewer should know?" className="min-h-11 border-white/10 bg-white/5 text-base" />
            </div>
            {submitError ? <p role="alert" className="text-sm text-red-200">{submitError}</p> : null}
            <Button type="submit" className="min-h-11 w-full" disabled={!validProof || submit.isPending}>
              {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Send contribution for review
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
