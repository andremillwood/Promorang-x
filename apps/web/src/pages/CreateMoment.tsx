import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authEntryHref, resolveCreateIntent } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Eye,
  Gift,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { MomentLineupBuilder, type Collaborator } from "@/components/moments/MomentLineupBuilder";
import { SmartVenuePicker } from "@/components/venues/SmartVenuePicker";
import { useI18n } from "@/i18n/I18nContext";
import { readLocalFoundListings } from "@/lib/discovery-found";

const categories = [
  "Music & Parties",
  "Food & Beverage",
  "Arts & Culture",
  "Sports & Fitness",
  "Workshops & Learning",
  "Community Gathering",
];

const STOCK_COVERS = [
  { label: "Nightlife", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" },
  { label: "Food & dining", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" },
  { label: "Stage & culture", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80" },
  { label: "Outdoor", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
];

export function CreateMoment() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const createIntent = resolveCreateIntent(params.get("intent"));
  const fromPeopleFlow = Boolean(params.get("intent"));
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Job-first intent. These fields answer who, what, and why before configuration.
  const [audience, setAudience] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Community Gathering");
  const [description, setDescription] = useState("");

  // Optional visual treatment. Nothing is selected by default.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedStockUrl, setSelectedStockUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Truthful defaults: no capacity or funded perk is asserted until the host supplies one.
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [reward, setReward] = useState("");

  const foundId = params.get("found");
  const foundListing = foundId
    ? readLocalFoundListings().find((row) => row.id === foundId) || {
        id: foundId,
        title: params.get("title") || "",
        whereHint: params.get("where") || "",
        words: params.get("title") || "",
        perkToFinder: "",
      }
    : null;

  useEffect(() => {
    if (!foundListing) return;
    if (foundListing.title) setTitle((current) => current || foundListing.title);
    if (foundListing.whereHint) setLocation((current) => current || foundListing.whereHint || "");
    if (foundListing.words) {
      setDescription((current) => current || `People already asked for “${foundListing.words}”. Explain why this Moment is worth showing up for.`);
    }
  }, [foundId, foundListing]);

  if (!user && !foundId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0b] p-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">
            {fromPeopleFlow ? `Sign in to ${createIntent.label.toLowerCase()}` : "Sign in to create a Moment"}
          </h1>
          <p className="text-sm text-white/60">
            {fromPeopleFlow
              ? createIntent.prompt
              : "A Promorang account is required so attendance, proof, and any later rewards stay attached to the correct host."}
          </p>
          <Button
            onClick={() => navigate(authEntryHref({ mode: "login", role: "host", next: "/create/moment" }))}
            className="rounded-full bg-primary px-8 py-6 font-bold text-white hover:bg-primary/90"
          >
            Sign in / Register
          </Button>
        </div>
      </div>
    );
  }

  const handleCustomImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setSelectedStockUrl("");
  };

  const handleSelectStockCover = (url: string) => {
    setSelectedStockUrl(url);
    setImageFile(null);
    setImagePreviewUrl(url);
  };

  const handlePresetDate = (daysAhead: number, defaultHour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(defaultHour, 0, 0, 0);
    const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setStartsAt(localIso);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      navigate(authEntryHref({ mode: "login", role: "host", next: "/create/moment" }));
      return;
    }

    if (!audience.trim() || !title.trim() || !description.trim() || !startsAt || !location.trim()) {
      toast({
        title: "Complete the Moment brief",
        description: "Add the intended audience, title, reason to attend, start time, and location before publishing.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = selectedStockUrl || "";
      if (imageFile) {
        const uploaded = await uploadImage(imageFile, "moments");
        if (uploaded) finalImageUrl = uploaded;
      }

      const savedDescription = [
        description.trim(),
        `Intended audience: ${audience.trim()}`,
        "Attendance proof: verified Promorang check-in.",
      ].join("\n\n");

      const { data: newMoment, error } = await supabase
        .from("moments")
        .insert([
          {
            title: title.trim(),
            category,
            description: savedDescription,
            image_url: finalImageUrl || undefined,
            starts_at: startsAt,
            ends_at: endsAt || null,
            venue_name: venueName || undefined,
            location: location.trim(),
            latitude: latitude ?? undefined,
            longitude: longitude ?? undefined,
            host_id: user.id,
            reward: reward.trim() || undefined,
            max_participants: maxParticipants ? Number(maxParticipants) : null,
            status: "published",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (collaborators.length > 0 && newMoment?.id) {
        const collabRows = collaborators.map((collaborator) => ({
          moment_id: newMoment.id,
          user_id: collaborator.userId || null,
          name: collaborator.name,
          stage_name: collaborator.stageName || null,
          role_type: collaborator.roleType,
          avatar_url: collaborator.avatarUrl || null,
          split_percentage: collaborator.splitPercentage || 0,
          bounty_fee_amount: collaborator.bountyFeeAmount || 0,
          custom_promo_code: collaborator.customPromoCode || null,
          status: "confirmed",
        }));

        await (supabase as any).from("moment_collaborators").insert(collabRows);
      }

      toast({
        title: "Moment published",
        description: reward.trim()
          ? "Your Moment is live. The configured perk should only be promoted if it is approved and available."
          : "Your Moment is live. Attach a real, approved perk only if you have one to offer.",
      });

      navigate(`/give?moment=${encodeURIComponent(newMoment.id)}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create Moment";
      console.error("Error creating Moment:", error);
      toast({ title: "Creation failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalSplit = collaborators.reduce((total, collaborator) => total + (Number(collaborator.splitPercentage) || 0), 0);
  const canLeaveStepOne = Boolean(audience.trim() && title.trim() && description.trim());
  const canLeaveStepTwo = Boolean(startsAt && location.trim());

  const proofSummary = "A verified Promorang check-in will count as attendance proof. RSVP alone is intent, not attendance.";

  return (
    <div className="min-h-screen bg-[#0a0a0b] pb-16 text-white selection:bg-primary selection:text-white">
      <SEO
        title={fromPeopleFlow ? `${createIntent.label} | Promorang` : "Create a Moment | Promorang"}
        description="Create a real experience around a clear audience outcome, then verify who actually showed up."
      />

      <main className="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-[#111216] to-[#0a0a0b] p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="border-primary/30 bg-primary/15 text-primary">
                  {foundListing ? "Claimed demand" : fromPeopleFlow ? createIntent.label : "Host workspace"}
                </Badge>
                <span className="text-xs text-white/45">Create the outcome before the event object.</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Give the right people a reason to show up — then prove who came.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
                Start with the audience and value of the experience. Time, venue, lineup, capacity, and perks only matter after the reason to participate is clear.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 lg:max-w-xs">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Proof contract</p>
              <p className="mt-2 text-sm font-bold text-white">Verified arrival, not RSVP alone</p>
              <p className="mt-1 text-xs leading-5 text-white/50">{proofSummary}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          {[
            { num: 1, title: "Outcome" },
            { num: 2, title: "Time & place" },
            { num: 3, title: "Team" },
            { num: 4, title: "Proof & capacity" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num)}
              className={`min-h-10 rounded-xl px-4 text-xs font-bold transition ${
                step === item.num ? "bg-primary text-black" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.num}. {item.title}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {step === 1 && (
              <section className="space-y-6 rounded-3xl border border-white/10 bg-[#111216] p-6 shadow-xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">1 · Outcome</p>
                  <h2 className="mt-2 text-xl font-black">Why should this Moment exist?</h2>
                  <p className="mt-2 text-sm leading-6 text-white/50">Do not start with ticket settings or reward mechanics. Define the people and the reason first.</p>
                </div>

                <label className="block space-y-1.5">
                  <Label className="text-xs font-bold text-white/80">Who should come? *</Label>
                  <Input
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    placeholder="e.g. food lovers curious about new Jamaican sauces"
                    className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </label>

                <label className="block space-y-1.5">
                  <Label className="text-xs font-bold text-white/80">What are you inviting them to? *</Label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Give the experience a clear name"
                    className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Category</Label>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 text-xs text-white outline-none focus:border-primary"
                    >
                      {categories.map((item) => <option key={item} value={item} className="bg-[#111216]">{item}</option>)}
                    </select>
                  </label>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">What will count as success?</Label>
                    <div className="flex h-11 items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 text-xs text-emerald-200">
                      <ShieldCheck className="mr-2 h-4 w-4" /> Verified attendee check-in
                    </div>
                  </div>
                </div>

                <label className="block space-y-1.5">
                  <Label className="text-xs font-bold text-white/80">Why is it worth showing up? *</Label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the experience and the value people receive by being there."
                    className="min-h-[110px] rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </label>

                <div className="space-y-2 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-xs font-bold text-white/80">Optional cover image</Label>
                    <span className="text-[10px] text-white/35">Stock images are visual examples only.</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {STOCK_COVERS.map((stock) => (
                      <button
                        key={stock.label}
                        type="button"
                        onClick={() => handleSelectStockCover(stock.url)}
                        className={`relative h-16 overflow-hidden rounded-xl border transition ${selectedStockUrl === stock.url && !imageFile ? "border-primary ring-2 ring-primary/30" : "border-white/10 opacity-60 hover:opacity-100"}`}
                      >
                        <img src={stock.url} alt="" className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/80 px-1 py-0.5 text-center text-[9px] font-bold">{stock.label}</span>
                      </button>
                    ))}
                  </div>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-3 text-xs font-semibold text-white/65 hover:bg-white/5">
                    <Upload className="h-4 w-4 text-primary" /> Upload your own artwork
                    <input type="file" accept="image/*" onChange={handleCustomImageChange} className="hidden" />
                  </label>
                </div>

                <Button
                  type="button"
                  disabled={!canLeaveStepOne}
                  onClick={() => setStep(2)}
                  className="h-11 w-full rounded-2xl font-black"
                >
                  Set time and place <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-6 rounded-3xl border border-white/10 bg-[#111216] p-6 shadow-xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">2 · Time & place</p>
                  <h2 className="mt-2 text-xl font-black">Where can the intended people actually participate?</h2>
                  <p className="mt-2 text-sm leading-6 text-white/50">Choose a real time and location. Promorang should never publish an invented venue as production data.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/80">Quick date helpers</Label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => handlePresetDate(0, 20)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/75 hover:bg-white/10">Tonight · 8 PM</button>
                    <button type="button" onClick={() => handlePresetDate(1, 20)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/75 hover:bg-white/10">Tomorrow · 8 PM</button>
                    <button type="button" onClick={() => handlePresetDate(5, 20)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/75 hover:bg-white/10">In 5 days · 8 PM</button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Starts at *</Label>
                    <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="h-11 rounded-2xl border-white/10 bg-white/5 text-white" />
                  </label>
                  <label className="block space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Ends at</Label>
                    <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="h-11 rounded-2xl border-white/10 bg-white/5 text-white" />
                  </label>
                </div>

                <SmartVenuePicker
                  selectedVenueName={venueName}
                  selectedAddress={location}
                  onSelectVenue={(venue) => {
                    setVenueName(venue.name);
                    setLocation(venue.location);
                    setLatitude(venue.latitude);
                    setLongitude(venue.longitude);
                    if (venue.capacity) setMaxParticipants(venue.capacity);
                  }}
                  onManualNameChange={setVenueName}
                  onManualAddressChange={setLocation}
                />

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-2xl border-white/10">Back</Button>
                  <Button type="button" disabled={!canLeaveStepTwo} onClick={() => setStep(3)} className="flex-1 rounded-2xl font-black">Add team <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6 rounded-3xl border border-white/10 bg-[#111216] p-6 shadow-xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">3 · Team</p>
                  <h2 className="mt-2 text-xl font-black">Who helps deliver this Moment?</h2>
                  <p className="mt-2 text-sm leading-6 text-white/50">Add collaborators only when they are actually part of the experience. Revenue split fields should reflect a real agreement, not a suggested default.</p>
                </div>

                <MomentLineupBuilder collaborators={collaborators} onChange={setCollaborators} />

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
                  <span className="text-white/55">Configured collaborator split</span>
                  <span className={`font-black ${totalSplit > 100 ? "text-red-400" : "text-emerald-400"}`}>{totalSplit}% / 100%</span>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-2xl border-white/10">Back</Button>
                  <Button type="button" onClick={() => setStep(4)} className="flex-1 rounded-2xl font-black">Set proof and capacity <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </section>
            )}

            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-[#111216] p-6 shadow-xl">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">4 · Proof & capacity</p>
                  <h2 className="mt-2 text-xl font-black">Define what is real before publishing.</h2>
                  <p className="mt-2 text-sm leading-6 text-white/50">Capacity and perks start empty. Add them only when they are true and approved.</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-sm font-black text-white">Attendance proof</p>
                      <p className="mt-1 text-xs leading-5 text-white/55">{proofSummary}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Real capacity, if known</Label>
                    <Input
                      type="number"
                      min="1"
                      value={maxParticipants}
                      onChange={(event) => setMaxParticipants(event.target.value ? Number(event.target.value) : "")}
                      placeholder="Leave blank if not confirmed"
                      className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/30"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Approved attendee perk, if any</Label>
                    <Input
                      value={reward}
                      onChange={(event) => setReward(event.target.value)}
                      placeholder="Leave blank unless the perk is real and available"
                      className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/30"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/55">
                  <strong className="text-white">After publishing:</strong> monitor RSVP as intent, verify attendance with check-in, then use the result to decide whether to repeat, change, or grow the Moment. If you have a real merchant perk, you can attach it after publication.
                </div>

                <div className="flex gap-3 border-t border-white/10 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="rounded-2xl border-white/10">Back</Button>
                  <Button type="submit" disabled={submitting || uploading} className="flex-1 rounded-2xl font-black">
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</> : <><Sparkles className="mr-2 h-4 w-4" />Publish Moment</>}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="sticky top-20 space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-primary"><Eye className="h-3.5 w-3.5" /> Draft preview</span>
              <span className="text-[10px] text-white/40">Not live until you publish</span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#111216] shadow-2xl">
              <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-black">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-white/35"><Upload className="mx-auto h-7 w-7" /><p className="mt-2 text-xs">Optional cover preview</p></div>
                )}
                {imagePreviewUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />}
                <Badge className="absolute left-3 top-3 border-white/10 bg-black/60 text-[10px] font-bold uppercase text-white">{category}</Badge>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{startsAt ? new Date(startsAt).toLocaleString() : "Time not set"}</span>
                </div>
                <h3 className="text-lg font-black leading-tight text-white">{title || "Moment title not set"}</h3>
                <p className="text-xs leading-relaxed text-white/55">{description || "Explain why this experience is worth attending."}</p>
                {audience && <p className="flex items-start gap-2 text-xs text-white/55"><Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /><span>For: {audience}</span></p>}
                <p className="flex items-center gap-1.5 text-xs text-white/55"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{venueName || location || "Location not set"}</span></p>
                {reward && <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300"><Gift className="h-3.5 w-3.5" />{reward}</div>}
                <div className="border-t border-white/10 pt-3 text-xs text-white/45"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" /> Success will be measured by verified attendee check-ins.</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CreateMoment;
