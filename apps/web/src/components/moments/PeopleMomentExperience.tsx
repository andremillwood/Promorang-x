import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Check, Loader2, Share2, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaUploadDialog } from "@/components/participant/MediaUploadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMomentMedia } from "@/hooks/useUGC";
import { useContentMissions } from "@/hooks/useContentMissions";
import {
  useAttachMomentPerk,
  useClaimMoment,
  useClaimMomentPerk,
  useInviteToMoment,
  useJoinPeopleMoment,
  useMomentDemand,
  useMomentParticipants,
  useMomentPerks,
} from "@/hooks/usePeopleMoments";
import {
  canAttachPerk,
  claimStatusLabel,
  isPeopleFirstOrigin,
  originTypeLabel,
  sharePathForMoment,
} from "@promorang/shared";

type PeopleMomentExperienceProps = {
  momentId: string;
  title: string;
  originType?: string | null;
  claimStatus?: string | null;
  claimedByStakeholderId?: string | null;
  hereNow?: boolean | null;
  isHost?: boolean;
  isJoined?: boolean;
  invitedBy?: string | null;
  referralCode?: string | null;
  source?: string | null;
  onJoined?: () => void;
};

export function PeopleMomentExperience({
  momentId,
  title,
  originType,
  claimStatus,
  claimedByStakeholderId,
  hereNow,
  isHost,
  isJoined,
  invitedBy,
  referralCode,
  source,
  onJoined,
}: PeopleMomentExperienceProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const join = useJoinPeopleMoment(momentId);
  const invite = useInviteToMoment();
  const claim = useClaimMoment(momentId);
  const attachPerk = useAttachMomentPerk(momentId);
  const takePerk = useClaimMomentPerk(momentId);
  const participants = useMomentParticipants(momentId);
  const demand = useMomentDemand(momentId);
  const perks = useMomentPerks(momentId);
  const media = useMomentMedia(momentId);
  const missions = useContentMissions(momentId, Boolean(user));
  const [perkTitle, setPerkTitle] = useState("");
  const [note, setNote] = useState("");

  const peopleFirst = isPeopleFirstOrigin(originType) || Boolean(hereNow);
  const canPerk = canAttachPerk({
    originType,
    claimStatus,
    claimedByStakeholderId,
    isHost,
  });

  const participantNames = useMemo(
    () =>
      ((participants.data || []) as Array<{ display_name?: string }>).map(
        (person) => person.display_name || "Someone",
      ),
    [participants.data],
  );

  const handleJoin = async () => {
    if (!user) {
      navigate(`/auth?next=/moments/${momentId}`);
      return;
    }
    await join.mutateAsync({
      invited_by_user_id: invitedBy,
      referral_code: referralCode,
      source: source || "moment_page",
    });
    onJoined?.();
    toast({ title: "You're in", description: "See who else showed up, then invite someone." });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${sharePathForMoment(momentId, user?.id)}`;
    try {
      await invite.mutateAsync({
        target_type: "moment",
        moment_id: momentId,
        source: "moment_share",
        referral_code: referralCode,
      });
    } catch {
      // Keep native share even if the ledger is down.
    }
    if (navigator.share) {
      await navigator.share({ title, url, text: `Join me: ${title}` });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Invite link copied" });
    }
  };

  return (
    <section className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5500]">
            {hereNow ? "Here now" : originTypeLabel(originType)}
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-[-0.05em]">Tonight's people</h2>
          <p className="mt-1 text-sm text-white/55">
            {participantNames.length
              ? `${participantNames.slice(0, 4).join(", ")}${participantNames.length > 4 ? ` +${participantNames.length - 4}` : ""}`
              : "Be the first to join."}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
          {claimStatusLabel(claimStatus)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!isJoined && !isHost && (
          <Button
            onClick={handleJoin}
            disabled={join.isPending}
            className="h-12 rounded-2xl bg-[#FF5500] font-black"
          >
            {join.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            Join Moment
          </Button>
        )}
        {(isJoined || isHost) && (
          <Button disabled className="h-12 rounded-2xl bg-emerald-500/15 text-emerald-300">
            <Check className="mr-2 h-4 w-4" /> You're in
          </Button>
        )}
        <Button onClick={handleShare} className="h-12 rounded-2xl bg-white/10 font-bold">
          <Share2 className="mr-2 h-4 w-4" /> Invite
        </Button>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">The story so far</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(media.data || []).slice(0, 6).map((item) => (
            <img
              key={item.id}
              src={item.media_url}
              alt={item.caption || title}
              className="h-24 w-full rounded-2xl object-cover"
            />
          ))}
          {!media.data?.length && (
            <div className="col-span-3 rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
              No photos yet. That's the first proof.
            </div>
          )}
        </div>
        {(isJoined || isHost) && (
          <div className="mt-3">
            <MediaUploadDialog
              momentId={momentId}
              trigger={
                <Button className="h-11 w-full rounded-2xl bg-white/10">
                  <Camera className="mr-2 h-4 w-4" /> Add to the story
                </Button>
              }
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Tonight's crowd is doing</p>
        <div className="mt-3 space-y-2">
          {(missions.missions.data || []).map((mission) => (
            <Link
              key={mission.id}
              to={`/missions/${mission.id}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <p className="font-bold">{mission.title}</p>
              <p className="text-xs text-white/50">{mission.action_text}</p>
            </Link>
          ))}
          {!missions.missions.data?.length && (
            <p className="text-sm text-white/45">Optional prompts will show once this Moment is live.</p>
          )}
        </div>
      </div>

      {!!perks.data?.length && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Perks</p>
          <div className="mt-3 space-y-2">
            {perks.data.map((perk: { id: string; title: string; value_label?: string }) => (
              <div key={perk.id} className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
                <div>
                  <p className="font-bold">{perk.title}</p>
                  {perk.value_label && <p className="text-xs text-white/50">{perk.value_label}</p>}
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-[#FF5500]"
                  onClick={() => takePerk.mutate(perk.id)}
                >
                  Claim
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {demand.data && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Joined", demand.data.participant_count],
            ["Invites", demand.data.invite_count],
            ["Stories", demand.data.submission_count],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-white/10 bg-black/20 px-2 py-3">
              <p className="text-xl font-black">{Number(value || 0)}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{label}</p>
            </div>
          ))}
        </div>
      )}

      {peopleFirst && claimStatus !== "verified" && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-bold">This place already has people.</p>
          <p className="mt-1 text-xs text-white/50">
            A venue or organizer can claim the relationship and add a perk. They do not own the photos or the crowd.
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="We run this venue / night"
              className="h-11 rounded-2xl border-white/10 bg-white/5"
            />
            <Button
              onClick={() => claim.mutate({ note })}
              className="h-11 rounded-2xl bg-white/10"
            >
              Claim
            </Button>
          </div>
        </div>
      )}

      {canPerk && (
        <div className="rounded-2xl border border-[#FF5500]/30 bg-[#FF5500]/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4" /> Add a perk
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              value={perkTitle}
              onChange={(event) => setPerkTitle(event.target.value)}
              placeholder="Free drink, 10% off, early entry"
              className="h-11 rounded-2xl border-white/10 bg-black/20"
            />
            <Button
              disabled={!perkTitle.trim()}
              onClick={() => {
                attachPerk.mutate({ title: perkTitle.trim(), perk_kind: "offer" });
                setPerkTitle("");
              }}
              className="h-11 rounded-2xl bg-[#FF5500]"
            >
              Attach
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
