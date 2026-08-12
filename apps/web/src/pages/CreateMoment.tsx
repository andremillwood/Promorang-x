import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import SEO from "@/components/SEO";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Gift,
  Sparkles,
  Check,
  Loader2,
  Ticket,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const categories = [
  "Music & Parties",
  "Food & Beverage",
  "Arts & Culture",
  "Sports & Fitness",
  "Workshops & Learning",
  "Community Gathering",
];

const CreateMoment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Music & Parties");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isFree, setIsFree] = useState(true);
  const [entryFeeJmd, setEntryFeeJmd] = useState<number | "">(0);
  const [maxParticipants, setMaxParticipants] = useState<number | "">(100);
  const [reward, setReward] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">Sign in to Host an Event</h1>
          <p className="text-white/60 text-sm">Create moments, manage RSVPs, and offer guest perks.</p>
          <Button onClick={() => navigate("/auth")} className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startsAt || !location) {
      toast({ title: "Required Fields Missing", description: "Please complete title, date, and location.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const uploaded = await uploadImage(imageFile, "moments");
        if (uploaded) imageUrl = uploaded;
      }

      const { data: newMoment, error } = await supabase
        .from("moments")
        .insert([
          {
            title,
            category,
            description,
            image_url: imageUrl || undefined,
            starts_at: startsAt,
            ends_at: endsAt || null,
            venue_name: venueName || undefined,
            location,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            host_id: user.id,
            reward: reward || undefined,
            max_participants: maxParticipants ? Number(maxParticipants) : null,
            status: "published",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event Published! 🎉",
        description: "Your event is live and ready for RSVPs.",
      });

      navigate(`/moments/${newMoment.id}`);

    } catch (error: any) {
      console.error("Error creating moment:", error);
      toast({
        title: "Publication Failed",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white">
      <SEO title="Create an Event — Promorang" description="Launch a moment, manage RSVPs, and issue attendee perks." />

      <main className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Wizard Steps Header */}
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white/60 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wider">Step {step} of 3</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Create New Event</h1>

          {/* Progress Indicator */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: 1, title: "Basic Info" },
              { num: 2, title: "Date & Venue" },
              { num: 3, title: "Tickets & Perks" },
            ].map((s) => (
              <div
                key={s.num}
                className={`rounded-2xl p-3 border transition-all ${
                  step === s.num
                    ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                    : step > s.num
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-white/5 text-white/40"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block">Step {s.num}</span>
                <span className="text-xs font-bold truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-10 space-y-6">

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase font-bold text-white/70">Event Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. I LUV HIP HOP @ Fiction"
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-white/70">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-2xl h-12">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-white/10 text-white">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase font-bold text-white/70">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What can attendees expect? Mention music, vibes, and special guests..."
                  className="bg-white/5 border-white/15 text-white rounded-2xl min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-white/70">Cover Image</Label>
                <ImageUpload
                  onImageSelect={(file) => setImageFile(file)}
                  previewUrl={imageFile ? URL.createObjectURL(imageFile) : undefined}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!title}
                  className="rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6"
                >
                  Next: Date & Location <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & VENUE */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt" className="text-xs uppercase font-bold text-white/70">Start Date & Time *</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endsAt" className="text-xs uppercase font-bold text-white/70">End Time (Optional)</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueName" className="text-xs uppercase font-bold text-white/70">Venue Name</Label>
                <Input
                  id="venueName"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Fiction Nightclub"
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-white/70">Venue / Location Search (Google Places) *</Label>
                <LocationAutocomplete
                  defaultValue={location}
                  onPlaceSelect={(place) => {
                    setLocation(place.address);
                    if (place.name && !venueName) setVenueName(place.name);
                    setLatitude(place.lat);
                    setLongitude(place.lng);
                  }}
                  placeholder="Search venue name, street address, or city..."
                />
                {latitude && longitude && (
                  <p className="text-[11px] font-semibold text-emerald-400">
                    ✓ Pin Geocoded: ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-2xl border-white/20 text-white">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!startsAt || !location}
                  className="rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6"
                >
                  Next: Tickets & Perks <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: TICKETS & PERKS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label className="text-xs uppercase font-bold text-white/70">Admission Price</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant={isFree ? "default" : "outline"}
                    onClick={() => { setIsFree(true); setEntryFeeJmd(0); }}
                    className={`rounded-2xl font-bold px-6 py-4 ${isFree ? "bg-[#ff5500] text-white" : "border-white/20 text-white"}`}
                  >
                    Free Admission
                  </Button>
                  <Button
                    type="button"
                    variant={!isFree ? "default" : "outline"}
                    onClick={() => setIsFree(false)}
                    className={`rounded-2xl font-bold px-6 py-4 ${!isFree ? "bg-[#ff5500] text-white" : "border-white/20 text-white"}`}
                  >
                    Paid Ticket
                  </Button>
                </div>

                {!isFree && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="entryFee" className="text-xs uppercase font-bold text-white/70">Ticket Price (JMD)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={entryFeeJmd}
                      onChange={(e) => setEntryFeeJmd(Number(e.target.value))}
                      placeholder="e.g. 2500"
                      className="bg-white/5 border-white/15 text-white rounded-2xl h-12 max-w-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-xs uppercase font-bold text-white/70">Guest Capacity Limit</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12 max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward" className="text-xs uppercase font-bold text-white/70">Attendee Perk (Optional)</Label>
                <Input
                  id="reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="e.g. Complimentary Tequila Shot on Entrance"
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                />
                <p className="text-xs text-white/40">Guests who check in at the entrance will unlock this perk in their Vault.</p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-2xl border-white/20 text-white">
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || uploading}
                  className="rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6 shadow-xl shadow-[#ff5500]/25"
                >
                  {submitting || uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Publish Event Live <Sparkles className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default CreateMoment;
