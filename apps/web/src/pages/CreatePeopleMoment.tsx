import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Clock, Link2, Loader2, MapPin, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useScenes } from "@/hooks/useScenes";
import { useCreatePeopleMoment } from "@/hooks/usePeopleMoments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MomentPrivacy } from "@promorang/shared";

const PRIVACY_OPTIONS: Array<{ value: MomentPrivacy; label: string; hint: string }> = [
  { value: "public", label: "Public", hint: "Anyone can join" },
  { value: "invite_only", label: "Friends", hint: "Invited people" },
  { value: "unlisted", label: "Link only", hint: "Unlisted share" },
];

export default function CreatePeopleMoment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const createMoment = useCreatePeopleMoment();
  const { data: scenes } = useScenes({ limit: 8 });

  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [hereNow, setHereNow] = useState(searchParams.get("when") !== "later");
  const [startsAt, setStartsAt] = useState("");
  const [privacy, setPrivacy] = useState<MomentPrivacy>("public");
  const [description, setDescription] = useState("");
  const [sceneId, setSceneId] = useState("");
  const [officialHost, setOfficialHost] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const canSubmit = useMemo(
    () => Boolean(user && title.trim() && location.trim() && (hereNow || startsAt)),
    [user, title, location, hereNow, startsAt],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = (await uploadImage(imageFile, "moments")) || undefined;
      }

      const result = await createMoment.mutateAsync({
        title: title.trim(),
        location: location.trim(),
        here_now: hereNow,
        starts_at: hereNow ? undefined : startsAt,
        privacy,
        official_host: officialHost,
        description: description.trim() || undefined,
        scene_id: sceneId || undefined,
        image_url: imageUrl,
        source: "create_people_moment",
      });

      toast({
        title: hereNow ? "You're live" : "Moment started",
        description: "Invite people. That's the whole move.",
      });
      navigate(`/moments/${result.moment.id}`);
    } catch (error) {
      toast({
        title: "Couldn't start this yet",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100svh] bg-[#0D0D0E] px-5 py-16 text-white">
        <div className="mx-auto max-w-md space-y-5 text-center">
          <h1 className="text-4xl font-black uppercase tracking-[-0.06em]">Already out?</h1>
          <p className="text-sm text-white/60">Sign in and turn what you're doing into a Moment.</p>
          <Button asChild className="h-12 w-full rounded-full bg-[#FF5500] text-white">
            <Link to="/auth?next=/create/moment">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#0D0D0E] text-white">
      <SEO
        title="Start a Moment | Promorang"
        description="Turn what you and your people are already doing into a Promorang Moment."
      />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Link to="/create/plan" className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5500]">
            Start a Plan
          </Link>
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF5500]">Don't invent a night</p>
        <h1 className="mt-2 text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em]">
          What are you doing?
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Post it like a story. People can join, show proof, and invite friends. A business can claim it later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-xs font-bold text-white/70">What are you doing?</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sunset link-up at Devon House"
              className="h-14 rounded-2xl border-white/10 bg-white/5 text-base"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold text-white/70">Where?</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF5500]" />
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Dulce, New Kingston"
                className="h-14 rounded-2xl border-white/10 bg-white/5 pl-10 text-base"
                required
              />
            </div>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold text-white/70">When?</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHereNow(true)}
                className={`min-h-14 rounded-2xl border px-4 text-left text-sm font-bold ${
                  hereNow ? "border-[#FF5500] bg-[#FF5500]/15 text-white" : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                <Clock className="mb-1 h-4 w-4 text-[#FF5500]" />
                Here now
              </button>
              <button
                type="button"
                onClick={() => setHereNow(false)}
                className={`min-h-14 rounded-2xl border px-4 text-left text-sm font-bold ${
                  !hereNow ? "border-[#FF5500] bg-[#FF5500]/15 text-white" : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                Later
              </button>
            </div>
            {!hereNow && (
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                className="h-12 rounded-2xl border-white/10 bg-white/5"
                required={!hereNow}
              />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-white/70">Who can join?</span>
            <div className="grid grid-cols-3 gap-2">
              {PRIVACY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrivacy(option.value)}
                  className={`min-h-16 rounded-2xl border px-2 py-2 text-center ${
                    privacy === option.value
                      ? "border-[#FF5500] bg-[#FF5500]/15"
                      : "border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span className="mt-1 block text-[10px] text-white/50">{option.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-bold text-white/70">Optional note</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Who's already here, what to bring, the vibe."
              className="min-h-[88px] rounded-2xl border-white/10 bg-white/5"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold text-white/70">Optional photo</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="h-12 rounded-2xl border-white/10 bg-white/5 file:text-white"
            />
          </label>

          {scenes && scenes.length > 0 && (
            <label className="block space-y-2">
              <span className="text-xs font-bold text-white/70">Optional scene</span>
              <select
                value={sceneId}
                onChange={(event) => setSceneId(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm"
              >
                <option value="">No scene</option>
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id} className="bg-[#111216]">
                    {scene.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm">
            <input
              type="checkbox"
              checked={officialHost}
              onChange={(event) => setOfficialHost(event.target.checked)}
              className="h-5 w-5 accent-[#FF5500]"
            />
            I'm hosting this officially
          </label>

          <Button
            type="submit"
            disabled={!canSubmit || createMoment.isPending || uploading}
            className="h-14 w-full rounded-full bg-[#FF5500] text-base font-black text-white hover:bg-[#e04b00]"
          >
            {createMoment.isPending || uploading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : hereNow ? (
              <Users className="mr-2 h-5 w-5" />
            ) : (
              <Link2 className="mr-2 h-5 w-5" />
            )}
            {hereNow ? "Start this Moment" : "Create Moment"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Hosting tickets, lineup, and splits?{" "}
          <Link to="/create/hosted" className="font-bold text-white/70 underline">
            Use the host studio
          </Link>
        </p>
      </main>
    </div>
  );
}
