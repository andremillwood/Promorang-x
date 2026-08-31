import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUpload } from "@/components/ImageUpload";
import { MediaGalleryUpload, type GalleryImage } from "@/components/MediaGalleryUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardWorkspaceNav } from "@/components/dashboard/DashboardWorkspaceNav";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Loader2, Trash2, Calendar, ShieldCheck, Sparkles, Image as ImageIcon, MapPin } from "lucide-react";
import {
  momentCategories,
  venueCategories,
  momentArchetypes,
  conversionTypes,
} from "@/lib/moment-taxonomy";
import { LOCAL_DROP_PROOF_OPTIONS, resolvePlaceGeo, toMomentProofEnum } from "@/lib/jamaica-geo";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const recurrenceWeekdayOptions = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

type RecurrenceFrequency = "daily" | "weekly" | "monthly";

const EditMoment = () => {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState("story");
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadImage, uploading } = useImageUpload();

  type EditableMomentRecord = Tables<"moments"> & {
    venue_category?: string | null;
    moment_archetype?: string | null;
    conversion_type?: string | null;
    proof_type?: string | null;
    city?: string | null;
    country?: string | null;
    country_code?: string | null;
    recurrence_enabled?: boolean;
    recurrence_frequency?: RecurrenceFrequency | null;
    recurrence_interval?: number | null;
    recurrence_by_weekday?: number[] | null;
    recurrence_day_of_month?: number | null;
    recurrence_timezone?: string | null;
    recurrence_until?: string | null;
    recurrence_count?: number | null;
    banner_image_url?: string | null;
    gallery_images?: GalleryImage[] | null;
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venueCategory: "",
    momentArchetype: "",
    conversionType: "check_in",
    proofType: "Screenshot",
    location: "",
    venueName: "",
    startsAt: "",
    endsAt: "",
    maxParticipants: "",
    reward: "",
    imageUrl: "",
    bannerImageUrl: "",
    galleryImages: [] as GalleryImage[],
    isActive: true,
    recurrenceEnabled: false,
    recurrenceFrequency: "weekly" as RecurrenceFrequency,
    recurrenceInterval: "1",
    recurrenceByWeekday: [] as number[],
    recurrenceDayOfMonth: "",
    recurrenceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    recurrenceUntil: "",
    recurrenceCount: "",
  });

  // Fetch moment data
  const { isLoading } = useQuery({
    queryKey: ["moment-edit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check ownership. Platform admins can edit any moment.
      if (!isAdmin && data.host_id !== user?.id && data.organizer_id !== user?.id) {
        toast({
          title: t("editMoment.unauthorized"),
          description: t("editMoment.unauthorizedDesc"),
          variant: "destructive",
        });
        navigate("/dashboard");
        return null;
      }

      const recurrenceData = data as EditableMomentRecord;

      setFormData({
        title: data.title,
        description: data.description || "",
        category: data.category,
        venueCategory: recurrenceData.venue_category || "",
        momentArchetype: recurrenceData.moment_archetype || "",
        conversionType: recurrenceData.conversion_type || "check_in",
        proofType: toMomentProofEnum(recurrenceData.proof_type || "Screenshot"),
        location: data.location,
        venueName: data.venue_name || "",
        startsAt: data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : "",
        endsAt: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : "",
        maxParticipants: data.max_participants?.toString() || "",
        reward: data.reward || "",
        imageUrl: data.image_url || "",
        bannerImageUrl: recurrenceData.banner_image_url || "",
        galleryImages: Array.isArray(recurrenceData.gallery_images) ? recurrenceData.gallery_images : [],
        isActive: data.is_active,
        recurrenceEnabled: recurrenceData.recurrence_enabled || false,
        recurrenceFrequency: (recurrenceData.recurrence_frequency || "weekly") as RecurrenceFrequency,
        recurrenceInterval: String(recurrenceData.recurrence_interval || 1),
        recurrenceByWeekday: Array.isArray(recurrenceData.recurrence_by_weekday) ? recurrenceData.recurrence_by_weekday : [],
        recurrenceDayOfMonth: recurrenceData.recurrence_day_of_month?.toString() || "",
        recurrenceTimezone: recurrenceData.recurrence_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        recurrenceUntil: recurrenceData.recurrence_until ? new Date(recurrenceData.recurrence_until).toISOString().slice(0, 16) : "",
        recurrenceCount: recurrenceData.recurrence_count?.toString() || "",
      });

      return data;
    },
    enabled: !!id && !!user,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = formData.imageUrl;
      let bannerImageUrl = formData.bannerImageUrl;
      let galleryImages = formData.galleryImages || [];

      if (imageFile && user) {
        const uploadedUrl = await uploadImage(imageFile, "moment-images", user.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      if (bannerImageFile && user) {
        const uploadedUrl = await uploadImage(bannerImageFile, "moment-images", user.id);
        if (uploadedUrl) {
          bannerImageUrl = uploadedUrl;
        }
      }

      if (galleryFiles.length > 0 && user) {
        const uploadedGallery = await Promise.all(
          galleryFiles.map((file) => uploadImage(file, "moment-images", user.id))
        );
        let uploadIndex = 0;
        galleryImages = galleryImages.map((image) => {
          if (!image.url.startsWith("data:")) return image;
          const uploadedUrl = uploadedGallery[uploadIndex++];
          return uploadedUrl ? { ...image, url: uploadedUrl, media_type: "image" as const } : image;
        });
      }

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error("Authentication session expired");

      const response = await fetch(`${API_URL}/api/moment-economy/moments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          venue_category: formData.venueCategory || null,
          moment_archetype: formData.momentArchetype || null,
          conversion_type: formData.conversionType || null,
          proof_type: toMomentProofEnum(formData.proofType || "Screenshot"),
          location: formData.location,
          city: resolvePlaceGeo({ location: formData.location }).city,
          country: resolvePlaceGeo({ location: formData.location }).country,
          country_code: resolvePlaceGeo({ location: formData.location }).country_code,
          venue_name: formData.venueName || null,
          starts_at: new Date(formData.startsAt).toISOString(),
          ends_at: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
          max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          reward: formData.reward || null,
          image_url: imageUrl || null,
          banner_image_url: bannerImageUrl || null,
          gallery_images: galleryImages,
          is_active: formData.isActive,
          recurrence_enabled: formData.recurrenceEnabled,
          recurrence_frequency: formData.recurrenceEnabled ? formData.recurrenceFrequency : null,
          recurrence_interval: formData.recurrenceEnabled ? Number(formData.recurrenceInterval || 1) : 1,
          recurrence_by_weekday: formData.recurrenceEnabled ? formData.recurrenceByWeekday : [],
          recurrence_day_of_month:
            formData.recurrenceEnabled && formData.recurrenceFrequency === "monthly" && formData.recurrenceDayOfMonth
              ? Number(formData.recurrenceDayOfMonth)
              : null,
          recurrence_timezone: formData.recurrenceTimezone,
          recurrence_until:
            formData.recurrenceEnabled && formData.recurrenceUntil
              ? new Date(formData.recurrenceUntil).toISOString()
              : null,
          recurrence_count:
            formData.recurrenceEnabled && formData.recurrenceCount
              ? Number(formData.recurrenceCount)
              : null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to update moment");
    },
    onSuccess: () => {
      toast({
        title: t("editMoment.toastUpdated"),
        description: t("editMoment.toastUpdatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["moment", id] });
      queryClient.invalidateQueries({ queryKey: ["hosted-moments"] });
      navigate(`/moments/${id}`);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: t("editMoment.toastUpdateFailed"),
        description: message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("moments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t("editMoment.toastDeleted"),
        description: t("editMoment.toastDeletedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["hosted-moments"] });
      navigate("/dashboard");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: t("editMoment.toastDeleteFailed"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleGalleryFilesSelect = async (files: File[]) => {
    setGalleryFiles((prev) => [...prev, ...files]);
    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise<GalleryImage>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ url: reader.result as string, alt: file.name, caption: "" });
            reader.readAsDataURL(file);
          })
      )
    );
    setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, ...previews] }));
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-6 shadow-soft">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("editMoment.back")}
        </Button>
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("editMoment.badge")}</p>
        <h1 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] text-foreground">
          {t("editMoment.title")}
        </h1>
        <GuidanceDisclosure
          id="edit-moment:control-context"
          eyebrow={t("editMoment.guideEyebrow")}
          title={t("editMoment.guideTitle")}
          summary={t("editMoment.guideSummary")}
          className="mt-4 max-w-2xl"
          tone="light"
        >
          <p className="text-base leading-7 text-muted-foreground">
            {t("editMoment.guideCopy")}
          </p>
        </GuidanceDisclosure>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Calendar, label: t("editMoment.timingLabel"), copy: t("editMoment.timingCopy") },
            { icon: ShieldCheck, label: t("editMoment.proofLabel"), copy: t("editMoment.proofCopy") },
            { icon: Sparkles, label: t("editMoment.unlockLabel"), copy: t("editMoment.unlockCopy") },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-black tracking-[-0.02em] text-foreground">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>

      <DashboardWorkspaceNav
        eyebrow={t("editMoment.navEyebrow")}
        title={t("editMoment.navTitle")}
        activeValue={activeSection}
        onValueChange={setActiveSection}
        anchorId="edit-moment-workspace"
        items={[
          { value: "story", label: t("editMoment.tabPromise"), icon: Sparkles },
          { value: "place", label: t("editMoment.tabPlace"), icon: MapPin },
          { value: "proof", label: t("editMoment.tabProof"), icon: ShieldCheck },
          { value: "media", label: t("editMoment.tabMedia"), icon: ImageIcon },
        ]}
      />

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <form id="edit-moment-workspace" onSubmit={handleSubmit} className="scroll-mt-28 space-y-6">
          {/* Cover Image */}
          <div className={`${activeSection === "media" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6`}>
            <Label className="mb-3 block">{t("editMoment.displayPictureLabel")}</Label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url || "" })}
              onFileSelect={setImageFile}
              uploading={uploading}
              aspectRatio="video"
            />
            <p className="mt-2 text-sm text-muted-foreground">{t("editMoment.displayPictureCopy")}</p>
          </div>

          <div className={`${activeSection === "media" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6`}>
            <Label className="mb-3 block">{t("editMoment.bannerImageLabel")}</Label>
            <ImageUpload
              value={formData.bannerImageUrl}
              onChange={(url) => setFormData({ ...formData, bannerImageUrl: url || "" })}
              onFileSelect={setBannerImageFile}
              uploading={uploading}
              aspectRatio="banner"
            />
            <p className="mt-2 text-sm text-muted-foreground">{t("editMoment.bannerImageCopy")}</p>
          </div>

          <div className={`${activeSection === "media" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6`}>
            <Label className="mb-3 block">{t("editMoment.supportingImagesLabel")}</Label>
            <MediaGalleryUpload
              value={formData.galleryImages}
              onChange={(images) => setFormData({ ...formData, galleryImages: images })}
              onFilesSelect={handleGalleryFilesSelect}
              uploading={uploading}
            />
          </div>

          {/* Basic Info */}
          <div className={`${activeSection === "story" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6 space-y-4`}>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">{t("editMoment.promiseHeading")}</h2>

            <div>
              <Label htmlFor="title">{t("editMoment.titleLabel")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">{t("editMoment.descLabel")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">{t("editMoment.categoryLabel")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {momentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {t(`tax.moment.${cat.value}` as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="venueCategory">{t("editMoment.venueCategoryLabel")}</Label>
                <Select
                  value={formData.venueCategory}
                  onValueChange={(value) => setFormData({ ...formData, venueCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("editMoment.venueCategoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {venueCategories.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t((`tax.venue.${item.value}`) as TranslationKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="momentArchetype">{t("editMoment.archetypeLabel")}</Label>
                <Select
                  value={formData.momentArchetype}
                  onValueChange={(value) => setFormData({ ...formData, momentArchetype: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("editMoment.archetypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {momentArchetypes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t((`tax.arch.${item.value}`) as TranslationKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="conversionType">{t("editMoment.conversionTypeLabel")}</Label>
              <Select
                value={formData.conversionType}
                onValueChange={(value) => setFormData({ ...formData, conversionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("editMoment.conversionTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {conversionTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {t((`tax.conv.${item.value}`) as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className={`${activeSection === "place" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6 space-y-4`}>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">{t("editMoment.placeHeading")}</h2>

            <div>
              <Label htmlFor="venueName">{t("editMoment.venueNameLabel")}</Label>
              <Input
                id="venueName"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">{t("editMoment.addressLabel")}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className={`${activeSection === "place" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6 space-y-4`}>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">{t("editMoment.timingHeading")}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">{t("editMoment.startLabel")}</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endsAt">{t("editMoment.endLabel")}</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{t("editMoment.recurringScheduleTitle")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("editMoment.recurringScheduleCopy")}
                  </p>
                </div>
                <Switch
                  checked={formData.recurrenceEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, recurrenceEnabled: checked })}
                />
              </div>

              {formData.recurrenceEnabled && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>{t("editMoment.frequencyLabel")}</Label>
                      <Select
                        value={formData.recurrenceFrequency}
                        onValueChange={(value) => setFormData({ ...formData, recurrenceFrequency: value as RecurrenceFrequency })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t("editMoment.freqDaily")}</SelectItem>
                          <SelectItem value="weekly">{t("editMoment.freqWeekly")}</SelectItem>
                          <SelectItem value="monthly">{t("editMoment.freqMonthly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editRecurrenceInterval">{t("editMoment.repeatEveryLabel")}</Label>
                      <Input
                        id="editRecurrenceInterval"
                        type="number"
                        min={1}
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData({ ...formData, recurrenceInterval: e.target.value || "1" })}
                      />
                    </div>
                  </div>

                  {formData.recurrenceFrequency === "weekly" && (
                    <div>
                      <Label className="mb-3 block">{t("editMoment.weekdaysLabel")}</Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                        {recurrenceWeekdayOptions.map((day) => {
                          const checked = formData.recurrenceByWeekday.includes(day.value);
                          return (
                            <label key={day.value} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(nextChecked) =>
                                  setFormData({
                                    ...formData,
                                    recurrenceByWeekday: nextChecked
                                      ? [...formData.recurrenceByWeekday, day.value].sort((a, b) => a - b)
                                      : formData.recurrenceByWeekday.filter((value) => value !== day.value),
                                  })
                                }
                              />
                              <span>{day.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.recurrenceFrequency === "monthly" && (
                    <div>
                      <Label htmlFor="editRecurrenceDayOfMonth">{t("editMoment.dayOfMonthLabel")}</Label>
                      <Input
                        id="editRecurrenceDayOfMonth"
                        type="number"
                        min={1}
                        max={31}
                        value={formData.recurrenceDayOfMonth}
                        onChange={(e) => setFormData({ ...formData, recurrenceDayOfMonth: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="editRecurrenceUntil">{t("editMoment.repeatUntilLabel")}</Label>
                      <Input
                        id="editRecurrenceUntil"
                        type="datetime-local"
                        value={formData.recurrenceUntil}
                        onChange={(e) => setFormData({ ...formData, recurrenceUntil: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editRecurrenceCount">{t("editMoment.occurrenceCapLabel")}</Label>
                      <Input
                        id="editRecurrenceCount"
                        type="number"
                        min={1}
                        value={formData.recurrenceCount}
                        onChange={(e) => setFormData({ ...formData, recurrenceCount: e.target.value })}
                        placeholder={t("editMoment.occurrenceCapPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className={`${activeSection === "proof" ? "" : "hidden"} bg-card border border-border rounded-2xl p-6 space-y-4`}>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">{t("editMoment.proofHeading")}</h2>

            <div>
              <Label htmlFor="proofType">{t("editMoment.proofTypeLabel")}</Label>
              <Select
                value={formData.proofType}
                onValueChange={(value) => setFormData({ ...formData, proofType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("editMoment.proofTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {LOCAL_DROP_PROOF_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("editMoment.proofTypeCopy")}
              </p>
            </div>

            <div>
              <Label htmlFor="maxParticipants">{t("editMoment.maxParticipantsLabel")}</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder={t("editMoment.maxParticipantsPlaceholder")}
              />
            </div>

            <div>
              <Label htmlFor="reward">{t("editMoment.rewardLabel")}</Label>
              <Input
                id="reward"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder={t("editMoment.rewardPlaceholder")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-3 z-20 flex gap-4 rounded-2xl border border-border/80 bg-background/90 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("editMoment.deleteButton")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("editMoment.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("editMoment.deleteConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("editMoment.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? t("editMoment.deleting") : t("editMoment.deleteAction")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={updateMutation.isPending || uploading}
            >
              {updateMutation.isPending || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("editMoment.saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("editMoment.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditMoment;
