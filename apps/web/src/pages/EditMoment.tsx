import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { ArrowLeft, Save, Loader2, Trash2, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import {
  momentCategories,
  venueCategories,
  momentArchetypes,
  conversionTypes,
} from "@/lib/moment-taxonomy";
import type { Tables } from "@/integrations/supabase/types";

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
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { uploadImage, uploading } = useImageUpload();

  type EditableMomentRecord = Tables<"moments"> & {
    venue_category?: string | null;
    moment_archetype?: string | null;
    conversion_type?: string | null;
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

      // Check ownership
      if (data.host_id !== user?.id) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own moments.",
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
          location: formData.location,
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
        title: "Moment updated! ✨",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["moment", id] });
      queryClient.invalidateQueries({ queryKey: ["hosted-moments"] });
      navigate(`/moments/${id}`);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Update failed",
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
        title: "Moment deleted",
        description: "Your moment has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["hosted-moments"] });
      navigate("/dashboard");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Delete failed",
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
          Back
        </Button>
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Moment Control</p>
        <h1 className="text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] text-foreground">
          Keep the moment sharp.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Update the promise, place, schedule, proof signal, and reward so participants know exactly why to show up and what their action unlocks.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Calendar, label: "Timing", copy: "Keep the room current" },
            { icon: ShieldCheck, label: "Proof", copy: "Protect verified value" },
            { icon: Sparkles, label: "Unlock", copy: "Clarify the reward path" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-black tracking-[-0.02em] text-foreground">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <Label className="mb-3 block">Display Picture</Label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url || "" })}
              onFileSelect={setImageFile}
              uploading={uploading}
              aspectRatio="video"
            />
            <p className="mt-2 text-sm text-muted-foreground">Used on cards, compact previews, and public listings.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <Label className="mb-3 block">Banner Image</Label>
            <ImageUpload
              value={formData.bannerImageUrl}
              onChange={(url) => setFormData({ ...formData, bannerImageUrl: url || "" })}
              onFileSelect={setBannerImageFile}
              uploading={uploading}
              aspectRatio="banner"
            />
            <p className="mt-2 text-sm text-muted-foreground">Wide image for the moment page hero and featured banners.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <Label className="mb-3 block">Supporting Moment Images</Label>
            <MediaGalleryUpload
              value={formData.galleryImages}
              onChange={(images) => setFormData({ ...formData, galleryImages: images })}
              onFilesSelect={handleGalleryFilesSelect}
              uploading={uploading}
            />
          </div>

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">Promise</h2>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
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
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="venueCategory">Venue Category</Label>
                <Select
                  value={formData.venueCategory}
                  onValueChange={(value) => setFormData({ ...formData, venueCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueCategories.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="momentArchetype">Moment Archetype</Label>
                <Select
                  value={formData.momentArchetype}
                  onValueChange={(value) => setFormData({ ...formData, momentArchetype: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select archetype" />
                  </SelectTrigger>
                  <SelectContent>
                    {momentArchetypes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="conversionType">Success Action</Label>
              <Select
                value={formData.conversionType}
                onValueChange={(value) => setFormData({ ...formData, conversionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select success action" />
                </SelectTrigger>
                <SelectContent>
                  {conversionTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">Place</h2>

            <div>
              <Label htmlFor="venueName">Venue Name</Label>
              <Input
                id="venueName"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Address *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">Timing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Start *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endsAt">End</Label>
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
                  <h3 className="font-semibold text-foreground">Recurring Schedule</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Convert this moment into a repeatable rhythm and adjust the schedule after creation.
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
                      <Label>Frequency</Label>
                      <Select
                        value={formData.recurrenceFrequency}
                        onValueChange={(value) => setFormData({ ...formData, recurrenceFrequency: value as RecurrenceFrequency })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editRecurrenceInterval">Repeat Every</Label>
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
                      <Label className="mb-3 block">Weekdays</Label>
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
                      <Label htmlFor="editRecurrenceDayOfMonth">Day of Month</Label>
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
                      <Label htmlFor="editRecurrenceUntil">Repeat Until</Label>
                      <Input
                        id="editRecurrenceUntil"
                        type="datetime-local"
                        value={formData.recurrenceUntil}
                        onChange={(e) => setFormData({ ...formData, recurrenceUntil: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editRecurrenceCount">Occurrence Cap</Label>
                      <Input
                        id="editRecurrenceCount"
                        type="number"
                        min={1}
                        value={formData.recurrenceCount}
                        onChange={(e) => setFormData({ ...formData, recurrenceCount: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-foreground">Proof, Capacity, Unlock</h2>

            <div>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <Label htmlFor="reward">Reward</Label>
              <Input
                id="reward"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="e.g., Free coffee, 10% discount"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this moment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the moment and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Moment"}
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
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
