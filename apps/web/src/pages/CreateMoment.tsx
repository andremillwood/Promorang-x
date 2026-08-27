import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SEO from "@/components/SEO";
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
  Building2,
  Percent,
  Flame,
  Upload,
  Eye,
  Zap,
} from "lucide-react";
import { MomentLineupBuilder, Collaborator } from "@/components/moments/MomentLineupBuilder";
import { SmartVenuePicker } from "@/components/venues/SmartVenuePicker";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";
import { PromoCardService } from "@/lib/promocard";

const categories = [
  "Music & Parties",
  "Food & Beverage",
  "Arts & Culture",
  "Sports & Fitness",
  "Workshops & Learning",
  "Community Gathering",
];

const STARTER_TEMPLATES = [
  {
    id: "dj-clash",
    label: "Live DJ Sound Clash",
    icon: "🎵",
    category: "Music & Parties",
    title: "Kingston Skyline Sound Clash: Live Vinyl & Dub Sessions",
    description: "An open-air roots and dancehall experience featuring live dub mixing, guest DJs, and cold local drinks under the stars.",
    reward: "100 Points + VIP Balcony Key",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    venueName: "Kingston Dub Club",
    location: "Skyline Dr, Jack's Hill",
  },
  {
    id: "food-popup",
    label: "Culinary Pop-Up",
    icon: "🍹",
    category: "Food & Beverage",
    title: "Rasta Pasta & Jerk Tasting Lab @ Red Hills",
    description: "Sample signature fusion dishes, house-made sauces, and fresh tropical cocktails prepared live by local guest chefs.",
    reward: "Free Tasting Sample with RSVP",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    venueName: "PriceSmart Culinary Studio",
    location: "111 Red Hills Rd, Kingston",
  },
  {
    id: "vip-session",
    label: "Creator Masterclass",
    icon: "👑",
    category: "Arts & Culture",
    title: "Creator Masterclass: Sovereign Music & Visual IP",
    description: "An intimate workshop for producers, filmmakers, and digital creators on owning sovereign IP and building verified community standing.",
    reward: "Verified Creator Mark + PromoKey",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    venueName: "Sovereign Cultural Centre",
    location: "Liguanea, Kingston",
  },
  {
    id: "beach-fete",
    label: "Beach Day Fete",
    icon: "🌴",
    category: "Community Gathering",
    title: "Summer Finale Sunset Beach Fete @ Ocho Rios",
    description: "Sun, sand, sound system, and coolers on the coast. RSVP for door admission and squad check-in points.",
    reward: "50 Gems ($0.50) + Door Pass",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    venueName: "Plantation Cove Beach",
    location: "Ocho Rios, St. Ann",
  },
];

const STOCK_COVERS = [
  { label: "Nightlife & DJ", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" },
  { label: "Culinary & Dining", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" },
  { label: "Lounge & Stage", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80" },
  { label: "Beach & Coast", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
];

export function CreateMoment() {
  const { t } = useI18n();
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
  const [selectedStockUrl, setSelectedStockUrl] = useState<string>(STOCK_COVERS[0].url);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(STOCK_COVERS[0].url);

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [venueName, setVenueName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Lineup & Squad State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Admission & Perks
  const [isFree, setIsFree] = useState(true);
  const [entryFee, setEntryFee] = useState<number | "">(0);
  const [maxParticipants, setMaxParticipants] = useState<number | "">(100);
  const [reward, setReward] = useState("100 Points + Verified Mark");

  // Query registered Promorang venues
  const { data: registeredVenues } = useQuery({
    queryKey: ["registered-venues-dropdown"],
    queryFn: async () => {
      const { data } = await supabase
        .from("view_public_venue_directory" as never)
        .select("id, name, location, address, city, venue_type, capacity, latitude, longitude")
        .limit(30);
      return (data || []) as any[];
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">Sign in to Host a Moment</h1>
          <p className="text-white/60 text-sm">
            You need a verified Promorang account to create moments, publish tickets, and configure collaborator revenue splits.
          </p>
          <Button onClick={() => navigate("/auth")} className="rounded-full bg-primary text-white hover:bg-primary/90 font-bold px-8 py-6">
            Sign In / Register
          </Button>
        </div>
      </div>
    );
  }

  const handleApplyTemplate = (tmpl: typeof STARTER_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category);
    setDescription(tmpl.description);
    setReward(tmpl.reward);
    setSelectedStockUrl(tmpl.imageUrl);
    setImagePreviewUrl(tmpl.imageUrl);
    if (tmpl.venueName) setVenueName(tmpl.venueName);
    if (tmpl.location) setLocation(tmpl.location);

    toast({
      title: `${tmpl.label} Template Applied! ✨`,
      description: "Fields populated. You can customize the title, venue, and time.",
    });
  };

  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setSelectedStockUrl("");
    }
  };

  const handleSelectStockCover = (url: string) => {
    setSelectedStockUrl(url);
    setImageFile(null);
    setImagePreviewUrl(url);
  };

  const handleSelectRegisteredVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    const found = registeredVenues?.find((v) => v.id === venueId);
    if (found) {
      setVenueName(found.name || "");
      const addr = found.address || found.location || `${found.name}, ${found.city || ""}`;
      setLocation(addr);
      if (found.latitude) setLatitude(found.latitude);
      if (found.longitude) setLongitude(found.longitude);
      if (found.capacity) setMaxParticipants(found.capacity);
    }
  };

  const handlePresetDate = (daysAhead: number, defaultHour = 20) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(defaultHour, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setStartsAt(localIso);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startsAt || !location) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide a Title, Start Time, and Venue/Location.",
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

      const { data: newMoment, error } = await supabase
        .from("moments")
        .insert([
          {
            title,
            category,
            description,
            image_url: finalImageUrl || undefined,
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

      // Insert Collaborators into moment_collaborators
      if (collaborators.length > 0 && newMoment?.id) {
        const collabRows = collaborators.map((c) => ({
          moment_id: newMoment.id,
          user_id: c.userId || null,
          name: c.name,
          stage_name: c.stageName || null,
          role_type: c.roleType,
          avatar_url: c.avatarUrl || null,
          split_percentage: c.splitPercentage || 0,
          bounty_fee_amount: c.bountyFeeAmount || 0,
          custom_promo_code: c.customPromoCode || null,
          status: "confirmed",
        }));

        await (supabase as any).from("moment_collaborators").insert(collabRows);
      }

      // Trigger PromoCard Attention Recharge
      PromoCardService.rechargeCard(user.id, "moment_post", 15.0);

      toast({
        title: "⚡ Moment Published & Card Recharged!",
        description: "Your experience is live, and +$15.00 has been recharged to your Promorang Card!",
      });

      navigate(`/moments/${newMoment.id}`);
    } catch (error: any) {
      console.error("Error creating moment:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create moment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalSplit = collaborators.reduce((acc, curr) => acc + (Number(curr.splitPercentage) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white">
      <SEO
        title="Host a Moment — Creator & Experience Studio | Promorang"
        description="Publish real-world cultural moments, sound clashes, culinary pop-ups, and ticketed experiences in Kingston."
      />

      <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Wizard Stepper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white/60 hover:text-white h-7 px-2 -ml-2 text-xs"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                Creator Studio
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Host a Moment & Experience
            </h1>
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { num: 1, title: "1. Story" },
              { num: 2, title: "2. Date & Venue" },
              { num: 3, title: "3. Lineup" },
              { num: 4, title: "4. Passes" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  step === s.num
                    ? "bg-primary text-white shadow-md"
                    : step > s.num
                    ? "text-emerald-400 hover:bg-white/5"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Creator Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: The Interactive Studio Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: STORY, CATEGORY & COVER IMAGE */}
            {step === 1 && (
              <div className="p-6 rounded-3xl border border-white/10 bg-[#111216] space-y-6 shadow-xl">
                {/* 1-Click Starter Presets */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> 1-Click Cultural Starter Templates
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STARTER_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="p-2.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.05] transition text-left space-y-1 group"
                      >
                        <span className="text-base">{tmpl.icon}</span>
                        <p className="text-xs font-bold text-white group-hover:text-primary transition leading-tight truncate">
                          {tmpl.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Moment Title *</Label>
                    <Input
                      placeholder="e.g. Kingston Skyline Sound Clash: Live Vinyl & Dub Sessions"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-11"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Category *</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary h-11"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#111216] text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Description & Attendee Vibes</Label>
                    <Textarea
                      placeholder="What can attendees expect? Mention music genres, DJs, drink specials, tasting bites, and dress codes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs min-h-[90px]"
                    />
                  </div>

                  {/* Visual Cover Selector */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-white/80">Cover Image</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {STOCK_COVERS.map((stock) => (
                        <button
                          key={stock.label}
                          type="button"
                          onClick={() => handleSelectStockCover(stock.url)}
                          className={`relative rounded-xl overflow-hidden h-16 border transition-all ${
                            selectedStockUrl === stock.url && !imageFile
                              ? "border-primary ring-2 ring-primary/40 scale-105"
                              : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={stock.url} alt={stock.label} className="h-full w-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[9px] font-bold text-center py-0.5 truncate px-1">
                            {stock.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/5 transition cursor-pointer text-xs text-white/70 font-semibold">
                        <Upload className="h-4 w-4 text-primary" />
                        <span>Or upload your own custom artwork (JPG, PNG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/25"
                >
                  <span>Continue to Date & Venue</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* STEP 2: TIME & VENUE */}
            {step === 2 && (
              <div className="p-6 rounded-3xl border border-white/10 bg-[#111216] space-y-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-black text-white">When & Where is It Happening?</h3>
                  <p className="text-xs text-white/50">Select a verified partner venue in Kingston or enter a custom address.</p>
                </div>

                {/* Quick Date Shortcuts */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-white/80">Quick Date Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handlePresetDate(0, 20)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80"
                    >
                      Tonight (8 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetDate(1, 21)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80"
                    >
                      Tomorrow Night (9 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetDate(5, 22)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80"
                    >
                      This Friday (10 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetDate(6, 22)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80"
                    >
                      This Saturday (10 PM)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Starts At *</Label>
                    <Input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="rounded-2xl bg-white/5 border-white/10 text-white text-xs h-11"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Ends At (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="rounded-2xl bg-white/5 border-white/10 text-white text-xs h-11"
                    />
                  </div>
                </div>

                {/* Smart Venue Picker with Instant Autosuggest & Vibe Explorer */}
                <SmartVenuePicker
                  selectedVenueName={venueName}
                  selectedAddress={location}
                  onSelectVenue={(v) => {
                    setVenueName(v.name);
                    setLocation(v.location);
                    setLatitude(v.latitude);
                    setLongitude(v.longitude);
                    if (v.capacity) setMaxParticipants(v.capacity);
                  }}
                  onManualNameChange={(name) => setVenueName(name)}
                  onManualAddressChange={(addr) => setLocation(addr)}
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-2xl border-white/10 h-11 px-5 text-xs">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/25">
                    <span>Continue to Lineup & Squad</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: LINEUP & SQUAD REVENUE SPLITS */}
            {step === 3 && (
              <div className="p-6 rounded-3xl border border-white/10 bg-[#111216] space-y-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-black text-white">Lineup & Squad Revenue Splits</h3>
                  <p className="text-xs text-white/50">
                    Add resident DJs, guest performers, hosts, and promoters. Allocate transparent revenue splits on ticket sales.
                  </p>
                </div>

                <MomentLineupBuilder
                  collaborators={collaborators}
                  onChange={setCollaborators}
                />

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/60">Total Squad Revenue Split:</span>
                  <span className={`font-black ${totalSplit > 100 ? "text-red-400" : "text-emerald-400"}`}>
                    {totalSplit}% / 100%
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-2xl border-white/10 h-11 px-5 text-xs">
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/25">
                    <span>Continue to Passes & Rewards</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: PASSES & DOOR PERKS */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-white/10 bg-[#111216] space-y-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-black text-white">Passes, Admission & Door Perks</h3>
                  <p className="text-xs text-white/50">Configure attendee pricing and guaranteed reward perks on check-in.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Max Capacity</Label>
                    <Input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Number(e.target.value))}
                      className="rounded-2xl bg-white/5 border-white/10 text-white text-xs h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-white/80">Attendee Perk / Reward</Label>
                    <Input
                      placeholder="e.g. 100 Points + Free Welcome Drink"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-11"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button variant="outline" type="button" onClick={() => setStep(3)} className="rounded-2xl border-white/10 h-11 px-5 text-xs">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-[0_0_20px_rgba(255,106,0,0.35)]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Publishing Experience...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span>Publish Moment to Discovery Feed</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: Real-Time Live Moment Card Preview */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Live Discovery Preview
              </span>
              <span className="text-[10px] text-white/50">Updates in real time</span>
            </div>

            {/* Live Moment Card */}
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#111216] shadow-2xl transition duration-300">
              <div className="relative h-48 w-full overflow-hidden bg-black">
                <img
                  src={imagePreviewUrl}
                  alt={title || "Preview"}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold uppercase">
                  {category}
                </Badge>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Open Pass
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{startsAt ? new Date(startsAt).toLocaleString() : "Date & Time will appear here"}</span>
                  </div>

                  <h3 className="text-lg font-black text-white line-clamp-2 leading-tight">
                    {title || "Untitled Cultural Experience"}
                  </h3>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {description || "Add a description to tell attendees what music, performers, and special vibes to expect."}
                  </p>

                  <p className="text-xs text-white/60 flex items-center gap-1.5 pt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{venueName || location || "Venue Name, Kingston"}</span>
                  </p>
                </div>

                {reward && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                    <Gift className="h-3.5 w-3.5" /> <span>{reward}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                      {user?.user_metadata?.full_name?.charAt(0) || "H"}
                    </div>
                    <span className="text-xs text-white/70 font-semibold truncate max-w-[120px]">
                      {user?.user_metadata?.full_name || "You (Host)"}
                    </span>
                  </div>

                  <Button disabled size="sm" className="rounded-xl bg-primary text-white font-bold text-xs h-8">
                    RSVP & Reserve Spot
                  </Button>
                </div>
              </div>
            </div>

            {/* Lineup Preview Snippet */}
            {collaborators.length > 0 && (
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Confirmed Lineup ({collaborators.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {collaborators.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-1">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-primary">({c.roleType})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateMoment;
