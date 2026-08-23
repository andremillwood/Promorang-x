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
  Building2,
  Percent,
} from "lucide-react";
import { MomentLineupBuilder, Collaborator } from "@/components/moments/MomentLineupBuilder";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useMarket } from "@/contexts/MarketContext";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const categories: Array<{ labelKey: TranslationKey; value: string }> = [
  { labelKey: "createMoment.categories.music", value: "Music & Parties" },
  { labelKey: "createMoment.categories.food", value: "Food & Beverage" },
  { labelKey: "createMoment.categories.arts", value: "Arts & Culture" },
  { labelKey: "createMoment.categories.sports", value: "Sports & Fitness" },
  { labelKey: "createMoment.categories.workshops", value: "Workshops & Learning" },
  { labelKey: "createMoment.categories.community", value: "Community Gathering" },
];

const CreateMoment = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const { country } = useMarket();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Music & Parties");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

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
  const [reward, setReward] = useState("");

  // Query registered Promorang venues
  const { data: registeredVenues } = useQuery({
    queryKey: ["registered-venues-dropdown"],
    queryFn: async () => {
      const { data } = await supabase
        .from("view_public_venue_directory")
        .select("id, name, location, address, city, venue_type, capacity, latitude, longitude")
        .limit(30);
      return data || [];
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">{t("createMoment.unauthTitle")}</h1>
          <p className="text-white/60 text-sm">{t("createMoment.unauthCopy")}</p>
          <Button onClick={() => navigate("/auth")} className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6">
            {t("createMoment.unauthButton")}
          </Button>
        </div>
      </div>
    );
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startsAt || !location) {
      toast({ title: t("createMoment.toastMissingFields"), description: t("createMoment.toastMissingFieldsDesc"), variant: "destructive" });
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

      // Insert Collaborators / Lineup into moment_collaborators
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

        const { error: collabError } = await (supabase as any)
          .from("moment_collaborators")
          .insert(collabRows);

        if (collabError) {
          console.warn("Could not save all collaborators", collabError);
        }
      }

      toast({
        title: t("createMoment.toastPublished"),
        description: t("createMoment.toastPublishedDesc"),
      });

      navigate(`/moments/${newMoment.id}`);
    } catch (error: any) {
      console.error("Error creating moment:", error);
      toast({
        title: t("createMoment.toastFailed"),
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalSplit = collaborators.reduce((acc, curr) => acc + (Number(curr.splitPercentage) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white">
      <SEO title={t("createMoment.seoTitle")} description={t("createMoment.seoDesc")} />

      <main className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Wizard Steps Header */}
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white/60 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("createMoment.cancel")}
            </Button>
            <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wider">{t("createMoment.stepOf", { step: step.toString() })}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{t("createMoment.title")}</h1>

          {/* Progress Indicator */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { num: 1, title: t("createMoment.step1Title") },
              { num: 2, title: t("createMoment.step2Title") },
              { num: 3, title: t("createMoment.step3Title") },
              { num: 4, title: t("createMoment.step4Title") },
            ].map((s) => (
              <div
                key={s.num}
                className={`rounded-2xl p-2.5 sm:p-3 border transition-all ${
                  step === s.num
                    ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                    : step > s.num
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-white/5 text-white/40"
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block">{t("createMoment.stepOf", { step: s.num.toString() })}</span>
                <span className="text-[11px] sm:text-xs font-bold truncate block">{s.title}</span>
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
                <Label htmlFor="title" className="text-xs uppercase font-bold text-white/70">{t("createMoment.eventTitleLabel")}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("createMoment.eventTitlePlaceholder")}
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-white/70">{t("createMoment.categoryLabel")}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-2xl h-12">
                    <SelectValue placeholder={t("createMoment.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-white/10 text-white">
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{t(c.labelKey)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase font-bold text-white/70">{t("createMoment.descriptionLabel")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("createMoment.descriptionPlaceholder")}
                  className="bg-white/5 border-white/15 text-white rounded-2xl min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-white/70">{t("createMoment.coverImageLabel")}</Label>
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
                  {t("createMoment.nextDateVenue")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & VENUE */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt" className="text-xs uppercase font-bold text-white/70">{t("createMoment.startDateLabel")}</Label>
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
                  <Label htmlFor="endsAt" className="text-xs uppercase font-bold text-white/70">{t("createMoment.endDateLabel")}</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                  />
                </div>
              </div>

              {/* Registered Venues Picker */}
              {registeredVenues && registeredVenues.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <Label className="text-xs uppercase font-bold text-primary flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {t("createMoment.chooseVenueLabel")}
                  </Label>
                  <Select value={selectedVenueId} onValueChange={handleSelectRegisteredVenue}>
                    <SelectTrigger className="bg-white/5 border-white/15 text-white rounded-xl h-11">
                      <SelectValue placeholder={t("createMoment.selectVenuePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10 text-white max-h-56">
                      {registeredVenues.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({v.city || ""})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="venueName" className="text-xs uppercase font-bold text-white/70">{t("createMoment.venueNameLabel")}</Label>
                <Input
                  id="venueName"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder={t("createMoment.venueNamePlaceholder")}
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-white/70">{t("createMoment.locationLabel")}</Label>
                <LocationAutocomplete
                  defaultValue={location}
                  onPlaceSelect={(place) => {
                    setLocation(place.address);
                    if (place.name && !venueName) setVenueName(place.name);
                    setLatitude(place.lat);
                    setLongitude(place.lng);
                  }}
                  placeholder={t("createMoment.locationPlaceholder")}
                />
                {latitude && longitude && (
                  <p className="text-[11px] font-semibold text-emerald-400">
                    {t("createMoment.geocodedPin", { lat: latitude.toFixed(4), lng: longitude.toFixed(4) })}
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-2xl border-white/20 text-white">
                  {t("createMoment.back")}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!startsAt || !location}
                  className="rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6"
                >
                  {t("createMoment.nextLineup")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: LINEUP, TALENT & PRODUCTION SQUAD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <MomentLineupBuilder
                collaborators={collaborators}
                onChange={setCollaborators}
              />

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-2xl border-white/20 text-white">
                  {t("createMoment.back")}
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6"
                >
                  {t("createMoment.nextTickets")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: TICKETS, PERKS & SMART SPLITS */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label className="text-xs uppercase font-bold text-white/70">{t("createMoment.admissionPrice")}</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant={isFree ? "default" : "outline"}
                    onClick={() => { setIsFree(true); setEntryFee(0); }}
                    className={`rounded-2xl font-bold px-6 py-4 ${isFree ? "bg-[#ff5500] text-white" : "border-white/20 text-white"}`}
                  >
                    {t("createMoment.freeAdmission")}
                  </Button>
                  <Button
                    type="button"
                    variant={!isFree ? "default" : "outline"}
                    onClick={() => setIsFree(false)}
                    className={`rounded-2xl font-bold px-6 py-4 ${!isFree ? "bg-[#ff5500] text-white" : "border-white/20 text-white"}`}
                  >
                    {t("createMoment.paidTicket")}
                  </Button>
                </div>

                {!isFree && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="entryFee" className="text-xs uppercase font-bold text-white/70">{t("createMoment.ticketPriceLabel", { currency: country.currency })}</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={entryFee}
                      onChange={(e) => setEntryFee(Number(e.target.value))}
                      placeholder={t("createMoment.ticketPricePlaceholder")}
                      className="bg-white/5 border-white/15 text-white rounded-2xl h-12 max-w-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-xs uppercase font-bold text-white/70">{t("createMoment.capacityLabel")}</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  placeholder={t("createMoment.capacityPlaceholder")}
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12 max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward" className="text-xs uppercase font-bold text-white/70">{t("createMoment.rewardLabel")}</Label>
                <Input
                  id="reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder={t("createMoment.rewardPlaceholder")}
                  className="bg-white/5 border-white/15 text-white rounded-2xl h-12"
                />
                <p className="text-xs text-white/40">{t("createMoment.rewardCopy")}</p>
              </div>

              {/* Co-ownership / Revenue Summary */}
              {collaborators.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 text-primary">
                      <Percent className="h-4 w-4" /> {t("createMoment.coOwnershipSummary")}
                    </span>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                      {t("createMoment.squadPartnersCount", { count: collaborators.length.toString() })}
                    </Badge>
                  </div>
                  <div className="text-xs text-white/60 space-y-1 pt-1">
                    <p>{t("createMoment.squadAllocation")} <strong className="text-white">{totalSplit}%</strong></p>
                    <p>{t("createMoment.hostRetainedPool")} <strong className="text-emerald-400">{Math.max(0, 100 - totalSplit)}%</strong></p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="rounded-2xl border-white/20 text-white">
                  {t("createMoment.back")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || uploading}
                  className="rounded-2xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6 shadow-xl shadow-[#ff5500]/25"
                >
                  {submitting || uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>{t("createMoment.publishButton")} <Sparkles className="ml-2 h-5 w-5" /></>
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
