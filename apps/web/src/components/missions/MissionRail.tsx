import { useState } from "react";
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
import { ARCHETYPE_I18N, CAMERA_CONSENT_KEYS, MISSION_ARCHETYPES } from "@/lib/mission-archetypes";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

type Props = {
  momentId: string;
  signedIn: boolean;
  onSignIn: () => void;
};

export function MissionRail({ momentId, signedIn, onSignIn }: Props) {
  const { t } = useI18n();
  const { toast } = useToast();
  const statusCopy: Record<MissionParticipation["status"], string> = {
    joined: t("missRail.ready"),
    submitted: t("missRail.inReview"),
    verified: t("missRail.counted"),
    rejected: t("missRail.needsLook"),
    rewarded: t("missRail.unlocked"),
  };
  const { missions, progress, join, submit } = useContentMissions(momentId, signedIn);
  const [selected, setSelected] = useState<ContentMission | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const participationFor = (id: string) => progress.data?.find((item) => item.mission_id === id);

  const joinMission = async (mission: ContentMission) => {
    if (!signedIn) return onSignIn();
    try {
      await join.mutateAsync(mission.id);
      toast({ title: t("missRail.joinedTitle"), description: t("missRail.joinedDesc") });
    } catch (error) {
      toast({ title: t("missRail.joinFail"), description: error instanceof Error ? error.message : t("missRail.tryAgain"), variant: "destructive" });
    }
  };

  const submitProof = async () => {
    if (!selected) return;
    try {
      await submit.mutateAsync({ missionId: selected.id, proofUrl, note });
      setSelected(null);
      setProofUrl("");
      setNote("");
      toast({ title: t("missRail.receivedTitle"), description: t("missRail.receivedDesc") });
    } catch (error) {
      toast({ title: t("missRail.submitFail"), description: error instanceof Error ? error.message : t("missRail.tryAgain"), variant: "destructive" });
    }
  };

  if (missions.isLoading) {
    return <div className="flex gap-3 overflow-hidden"><Skeleton className="h-72 min-w-[82%] rounded-3xl sm:min-w-[390px]" /><Skeleton className="hidden h-72 min-w-[390px] rounded-3xl sm:block" /></div>;
  }
  if (missions.isError || !missions.data?.length) return null;

  return (
    <section aria-labelledby="content-missions-title" className="overflow-hidden rounded-[2rem] border border-white/10 bg-black text-white">
      <div className="flex items-end justify-between gap-5 px-5 pb-4 pt-6 sm:px-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("missRail.worthDoing")}</p>
          <h2 id="content-missions-title" className="mt-2 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">{t("missRail.moveMoment")}</h2>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-white/45 sm:block">{t("missRail.simpleActions")}</p>
      </div>

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
                    <Target className="h-3.5 w-3.5" /> {t("missRail.mission")}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${archetype.tone}`}>
                    <ArchetypeIcon className="h-3 w-3" /> {t(ARCHETYPE_I18N[mission.archetype || "side_quest"].labelKey as TranslationKey)}
                  </span>
                </div>
                <h3 className="mt-8 max-w-[18rem] text-2xl font-black leading-[0.95] tracking-[-0.04em]">{mission.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">{mission.action_text}</p>
                <p className="mt-3 text-xs font-bold text-white/80">{t(ARCHETYPE_I18N[mission.archetype || "side_quest"].verbKey as TranslationKey)}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white/50">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {mission.due_at ? t("missRail.due", { when: formatDistanceToNow(new Date(mission.due_at), { addSuffix: true }) }) : t("missRail.during")}
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2" aria-label={t("missRail.stepsAria")}>
                  {[
                    { label: t("missRail.act"), detail: mission.proof_type === "referral" ? t("missRail.share") : t("missRail.create"), active: !participation },
                    { label: t("missRail.count"), detail: mission.proof_type, active: participation?.status === "joined" },
                    { label: t("missRail.unlock"), detail: mission.reward_value, active: submitted },
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

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/35"><Gift className="h-3 w-3" /> {t("missRail.reward")}</p>
                    <p className="mt-1 truncate text-sm font-bold">{mission.reward_value}</p>
                  </div>
                  {participation?.status === "joined" ? (
                    <Button onClick={() => setSelected(mission)} size="sm"><Upload className="mr-2 h-4 w-4" />{t("missRail.submit")}</Button>
                  ) : submitted ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
                      <Check className="h-3.5 w-3.5" />{statusCopy[participation.status]}
                    </span>
                  ) : (
                    <Button onClick={() => joinMission(mission)} size="sm" disabled={join.isPending}>
                      {join.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}{t("missRail.join")}
                    </Button>
                  )}
                </div>
                <details className="mt-4 border-t border-white/10 pt-3 text-xs text-white/45">
                  <summary className="cursor-pointer font-bold text-white/60">{t("missRail.qualifies")}</summary>
                  <p className="mt-2 leading-5">{mission.qualification_text}</p>
                  <p className="mt-2 flex items-center gap-1.5"><ExternalLink className="h-3 w-3" />{mission.publish_destination}</p>
                  {mission.camera_consent ? (
                    <p className="mt-2 flex items-center gap-1.5 text-white/65">
                      <ShieldCheck className="h-3 w-3 text-emerald-300" />
                      {t("missRail.camera")} {t(CAMERA_CONSENT_KEYS[mission.camera_consent] as TranslationKey)}
                    </p>
                  ) : null}
                </details>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-lg">
          <DialogHeader>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("missRail.contribKicker")}</p>
            <DialogTitle className="text-2xl font-black">{selected?.title}</DialogTitle>
            <DialogDescription className="text-white/50">{t("missRail.dialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="mission-proof-url">{t("missRail.publicLink")}</Label>
              <Input id="mission-proof-url" type="url" value={proofUrl} onChange={(event) => setProofUrl(event.target.value)} placeholder="https://instagram.com/..." className="border-white/10 bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mission-proof-note">{t("missRail.shortNote")} <span className="text-white/35">{t("missRail.optional")}</span></Label>
              <Textarea id="mission-proof-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder={t("missRail.notePh")} className="border-white/10 bg-white/5" />
            </div>
            <Button className="w-full" onClick={submitProof} disabled={!/^https?:\/\/\S+$/i.test(proofUrl) || submit.isPending}>
              {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}{t("missRail.send")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
