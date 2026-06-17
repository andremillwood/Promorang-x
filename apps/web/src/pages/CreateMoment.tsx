import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { amiService } from "@/services/ami";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ImageUpload";
import { MediaGalleryUpload, type GalleryImage } from "@/components/MediaGalleryUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Gift, Check, Eye, Lock, UserPlus, Sparkles } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { MatchmakingSuggestions } from "@/components/matchmaking/MatchmakingSuggestions";
import { z } from "zod";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";
import {
  momentCategories,
  venueCategories,
  momentArchetypes,
  conversionTypes,
  getTaxonomyLabel,
} from "@/lib/moment-taxonomy";

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

const momentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  category: z.string().min(1, "Please select a category"),
  venueCategory: z.string().optional(),
  momentArchetype: z.string().optional(),
  conversionType: z.string().optional(),
  location: z.string().min(5, "Please enter a valid address"),
  venueName: z.string().optional(),
  startsAt: z.string().min(1, "Please select a start date and time"),
  endsAt: z.string().optional(),
  maxParticipants: z.number().min(2).max(500).optional(),
  reward: z.string().optional(),
  imageUrl: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  galleryImages: z.array(z.object({
    url: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    media_type: z.enum(["image", "video"]).optional(),
  })).optional(),
  visibility: z.enum(["open", "invite", "private"]).default("open"),
  proofType: z.string().optional(),
  evidenceRequirements: z.unknown().optional(),
  expectedActionUnit: z.string().optional(),
  moneySource: z.enum(["entry", "host", "event", "hybrid"]),
  entryFeeJmd: z.number().optional(),
  totalFundedJmd: z.number().optional(),
  rewardPoolJmd: z.number().min(0),
  hostMarginJmd: z.number().min(0).optional(),
  platformFeeJmd: z.number().min(0).optional(),
  opsBufferJmd: z.number().min(0).optional(),
  fundingReference: z.string().optional(),
  moveTitle: z.string().min(1, "Move title is required"),
  moveDescription: z.string().optional(),
  moveRewardAmountJmd: z.number().min(0),
  moveMaxCompletions: z.number().min(1),
  payoutRuleType: z.enum(["first_n", "per_action", "leaderboard", "milestone", "judged"]),
  payoutAmountJmd: z.number().min(0),
  payoutCapJmd: z.number().min(0).optional(),
});

type MomentFormData = z.infer<typeof momentSchema>;
type RecurrenceFormState = {
  recurrenceEnabled: boolean;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceInterval: number;
  recurrenceByWeekday: number[];
  recurrenceDayOfMonth: number | "";
  recurrenceTimezone: string;
  recurrenceUntil: string;
  recurrenceCount: number | "";
};

const visibilityOptions = [
  { value: "open", label: "Open", description: "Anyone can discover and join", icon: Eye },
  { value: "invite", label: "Invite Only", description: "Only people you invite can join", icon: UserPlus },
  { value: "private", label: "Private", description: "Hidden from discovery", icon: Lock },
];

const steps = [
  { id: 1, title: "Basic Info", icon: Calendar },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Details", icon: Users },
  { id: 4, title: "Review", icon: Check },
];

const DEFAULT_MOMENT_TYPE = "community";

type MechanicTemplate = {
  name: string;
  description: string;
  category: string;
  proof_type?: string | null;
  evidence_requirements?: unknown;
  expected_action_unit?: string | null;
};

const CreateMoment = () => {
  const { user, activeOrgId } = useAuth();
  const { startTour, isTourCompleted } = useTour();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mechanicId = searchParams.get('mechanic_id');
  const sourceContentId = searchParams.get('sourceContentId');
  const sourceContentTitle = searchParams.get('sourceContentTitle');
  const parentMomentId = searchParams.get('parentMomentId');
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceFormState>({
    recurrenceEnabled: false,
    recurrenceFrequency: "weekly",
    recurrenceInterval: 1,
    recurrenceByWeekday: [],
    recurrenceDayOfMonth: "",
    recurrenceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    recurrenceUntil: "",
    recurrenceCount: "",
  });

  // Auto-start create moment tour for new users
  useEffect(() => {
    if (user && !isTourCompleted('create-moment')) {
      const timer = setTimeout(() => {
        startTour('create-moment');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isTourCompleted, startTour]);

  const [formData, setFormData] = useState<MomentFormData>({
    title: sourceContentTitle ? `${sourceContentTitle} Launch` : "",
    description: sourceContentTitle
      ? `A moment built around "${sourceContentTitle}". Watch the story, show up, and leave a verified Mark.`
      : "",
    category: "",
    venueCategory: "",
    momentArchetype: sourceContentId ? "content" : "",
    conversionType: "check_in",
    location: "",
    venueName: "",
    startsAt: "",
    endsAt: "",
    maxParticipants: undefined,
    reward: "",
    imageUrl: "",
    bannerImageUrl: "",
    galleryImages: [],
    visibility: "open",
    proofType: "QR",
    evidenceRequirements: [],
    expectedActionUnit: "Check-in",
    moneySource: "host",
    entryFeeJmd: undefined,
    totalFundedJmd: 0,
    rewardPoolJmd: 0,
    hostMarginJmd: 0,
    platformFeeJmd: 0,
    opsBufferJmd: 0,
    fundingReference: "",
    moveTitle: sourceContentId ? "Watch, arrive, and leave a Mark" : "Check in and prove attendance",
    moveDescription: sourceContentId ? "Engage with the story, attend the launch moment, and complete the on-site proof." : "",
    moveRewardAmountJmd: 0,
    moveMaxCompletions: 25,
    payoutRuleType: "per_action",
    payoutAmountJmd: 0,
    payoutCapJmd: undefined,
  });
  // Pre-fill from Mechanic
  useEffect(() => {
    const nextExpectedAction =
      formData.conversionType === "purchase" ? "Purchase" :
      formData.conversionType === "appointment" ? "Appointment" :
      formData.conversionType === "booking" ? "Booking" :
      formData.conversionType === "sample" ? "Sample Claim" :
      formData.conversionType === "try_on" ? "Try-on" :
      formData.conversionType === "referral" ? "Referral" :
      formData.conversionType === "repeat_visit" ? "Repeat Visit" :
      "Check-in";

    const nextProofType =
      formData.conversionType === "purchase" ? "Photo" :
      formData.conversionType === "sample" ? "QR" :
      formData.conversionType === "try_on" ? "Photo" :
      formData.conversionType === "appointment" || formData.conversionType === "booking" ? "Code" :
      formData.momentArchetype === "content" ? "QR" :
      formData.momentArchetype === "service" ? "Code" :
      formData.momentArchetype === "visit" ? "GPS" :
      "QR";

    setFormData((prev) => {
      if (prev.expectedActionUnit === nextExpectedAction && prev.proofType === nextProofType) {
        return prev;
      }
      return {
        ...prev,
        expectedActionUnit: nextExpectedAction,
        proofType: nextProofType,
      };
    });
  }, [formData.conversionType, formData.momentArchetype]);

  useEffect(() => {
    if (!formData.startsAt) return;

    const startDate = new Date(formData.startsAt);
    if (Number.isNaN(startDate.getTime())) return;

    setRecurrence((prev) => ({
      ...prev,
      recurrenceByWeekday:
        prev.recurrenceByWeekday.length > 0 ? prev.recurrenceByWeekday : [startDate.getDay()],
      recurrenceDayOfMonth:
        prev.recurrenceDayOfMonth !== "" ? prev.recurrenceDayOfMonth : startDate.getDate(),
    }));
  }, [formData.startsAt]);

  useEffect(() => {
    if (mechanicId) {
      const fetchMechanic = async () => {
        try {
          const mechanic = await amiService.getMechanicById(mechanicId) as MechanicTemplate | null;
          if (mechanic) {
            setFormData(prev => ({
              ...prev,
              title: `${mechanic.name} (Instance)`,
              description: mechanic.description,
              category: mechanic.category.toLowerCase(), // Map simplistic logic
              proofType: mechanic.proof_type,
              evidenceRequirements: Array.isArray(mechanic.evidence_requirements)
                ? mechanic.evidence_requirements
                : [],
              expectedActionUnit: mechanic.expected_action_unit || "Action",
            }));
          }
        } catch (error) {
          console.error("Error fetching mechanic:", error);
          toast({
            title: "Error loading mechanic",
            description: "Could not load the selected mechanic template.",
            variant: "destructive",
          });
        }
      };
      fetchMechanic();
    }
  }, [mechanicId, toast]);
  const updateField = <K extends keyof MomentFormData>(
    field: K,
    value: MomentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title || formData.title.length < 5) {
        newErrors.title = "Title must be at least 5 characters";
      }
      if (!formData.description || formData.description.length < 20) {
        newErrors.description = "Description must be at least 20 characters";
      }
      if (!formData.category) {
        newErrors.category = "Please select a category";
      }
    }

    if (step === 2) {
      if (!formData.location || formData.location.length < 5) {
        newErrors.location = "Please enter a valid address";
      }
    }

    if (step === 3) {
      if (!formData.startsAt) {
        newErrors.startsAt = "Please select a start date and time";
      }
      if (formData.moneySource === "entry" && !formData.entryFeeJmd) {
        newErrors.entryFeeJmd = "Entry fee is required for Sprint Moments";
      }
      if (formData.rewardPoolJmd > 0 && formData.moneySource !== "entry" && (formData.totalFundedJmd || 0) < formData.rewardPoolJmd) {
        newErrors.totalFundedJmd = "Funding must cover the reward pool";
      }
      if (!formData.moveTitle) {
        newErrors.moveTitle = "At least one Move is required";
      }
      if (recurrence.recurrenceEnabled && recurrence.recurrenceFrequency === "weekly" && recurrence.recurrenceByWeekday.length === 0) {
        newErrors.recurrenceByWeekday = "Pick at least one weekday for recurring moments";
      }
      if ((formData.moveRewardAmountJmd || 0) * (formData.moveMaxCompletions || 0) > (formData.rewardPoolJmd || 0)) {
        newErrors.moveRewardAmountJmd = "Reward pool must cover max Move liability";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
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
    updateField("galleryImages", [...(formData.galleryImages || []), ...previews]);
  };

  const updateRecurrence = <K extends keyof RecurrenceFormState>(field: K, value: RecurrenceFormState[K]) => {
    setRecurrence((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const parsed = momentSchema.safeParse(formData);
    if (!parsed.success) {
      toast({
        title: "Moment setup is incomplete",
        description: parsed.error.errors[0]?.message || "Please review the moment details before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;
      let bannerImageUrl = formData.bannerImageUrl;
      let galleryImages = formData.galleryImages || [];

      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, "moment-images", user.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      if (bannerImageFile) {
        const uploadedUrl = await uploadImage(bannerImageFile, "moment-images", user.id);
        if (uploadedUrl) {
          bannerImageUrl = uploadedUrl;
        }
      }

      if (galleryFiles.length > 0) {
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

      // Generate a random 6-character check-in code
      const checkInCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error("Authentication session expired");

      const proofTypeMap: Record<string, string> = {
        QR: "code",
        Code: "code",
        Photo: "photo",
        Video: "video",
        GPS: "code",
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/moment-economy/moments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
        host_id: user.id,
        organization_id: activeOrgId || null,
        parent_moment_id: parentMomentId || null,
        creative_owner_id: user.id,
        content_origin: "stakeholder_created",
        title: formData.title,
        description: formData.description,
        type: DEFAULT_MOMENT_TYPE,
        category: formData.category,
        venue_category: formData.venueCategory || null,
        moment_archetype: formData.momentArchetype || null,
        conversion_type: formData.conversionType || null,
        location: formData.location,
        venue_name: formData.venueName || null,
        starts_at: new Date(formData.startsAt).toISOString(),
        ends_at: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        max_participants: formData.maxParticipants || null,
        reward: formData.reward || null,
        image_url: imageUrl || null,
        banner_image_url: bannerImageUrl || null,
        gallery_images: galleryImages,
        is_active: true,
        visibility: formData.visibility,
        mechanic_id: mechanicId || null, // Link to AMI
        proof_type: formData.proofType || 'QR',
        evidence_requirements: formData.evidenceRequirements || [],
        expected_action_unit: formData.expectedActionUnit || 'Action',
        check_in_code: checkInCode,
        money_source: formData.moneySource,
        entry_fee_jmd: formData.moneySource === "entry" ? formData.entryFeeJmd || 0 : null,
        total_funded_jmd: formData.moneySource === "entry" ? 0 : formData.totalFundedJmd || 0,
        reward_pool_jmd: formData.rewardPoolJmd || 0,
        host_margin_jmd: formData.hostMarginJmd || 0,
        platform_fee_jmd: formData.platformFeeJmd || 0,
        ops_buffer_jmd: formData.opsBufferJmd || 0,
        funding_reference: formData.fundingReference || null,
        recurrence_enabled: recurrence.recurrenceEnabled,
        recurrence_frequency: recurrence.recurrenceEnabled ? recurrence.recurrenceFrequency : null,
        recurrence_interval: recurrence.recurrenceEnabled ? recurrence.recurrenceInterval : 1,
        recurrence_by_weekday: recurrence.recurrenceEnabled ? recurrence.recurrenceByWeekday : [],
        recurrence_day_of_month:
          recurrence.recurrenceEnabled && recurrence.recurrenceFrequency === "monthly" && recurrence.recurrenceDayOfMonth !== ""
            ? recurrence.recurrenceDayOfMonth
            : null,
        recurrence_timezone: recurrence.recurrenceTimezone,
        recurrence_until: recurrence.recurrenceEnabled && recurrence.recurrenceUntil
          ? new Date(recurrence.recurrenceUntil).toISOString()
          : null,
        recurrence_count:
          recurrence.recurrenceEnabled && recurrence.recurrenceCount !== ""
            ? recurrence.recurrenceCount
            : null,
        moves: [{
          title: formData.moveTitle,
          description: formData.moveDescription || null,
          proof_type: proofTypeMap[formData.proofType || "QR"] || "code",
          reward_amount_jmd: formData.moveRewardAmountJmd || formData.payoutAmountJmd || 0,
          max_completions: formData.moveMaxCompletions,
          requires_unique: true,
          sort_order: 0,
        }],
        payout_rules: [{
          rule_type: formData.payoutRuleType,
          amount_jmd: formData.payoutAmountJmd || formData.moveRewardAmountJmd || 0,
          cap_jmd: formData.payoutCapJmd || formData.rewardPoolJmd || 0,
          rank_start: formData.payoutRuleType === "first_n" ? 1 : null,
          rank_end: formData.payoutRuleType === "first_n" ? formData.moveMaxCompletions : null,
          criteria_json: {},
        }],
      }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Error creating Moment");

      const createdMomentId = payload?.moment?.id;
      if (sourceContentId && createdMomentId) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/o2o/links`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              content_item_id: sourceContentId,
              moment_id: createdMomentId,
              entry_action_types: ["watch", "join", "check_in"],
              physical_unlock_rules: {
                summary: "Watch the story, join the launch moment, and check in to leave a verified Mark.",
              },
            }),
          });
        } catch (linkError) {
          console.warn("[CreateMoment] Content-to-moment link skipped:", linkError);
        }
      }

      toast({
        title: "Moment Created",
        description: sourceContentId
          ? "Your story now has a launch moment and a mission link."
          : formData.moneySource === "entry"
            ? "Entry payments can now fund this Sprint."
            : "Funded pool locked and ready for verified payouts.",
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error creating moment",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-serif italic mb-2">Step 1</p>
            <h2 className="text-2xl font-bold text-foreground mb-4">Basic Info</h2>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="title">Moment Title *</Label>
                <InfoTooltip content="Give your moment a catchy, descriptive name that reflects the experience." />
              </div>
              <Input
                id="title"
                data-tour="create-moment-title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Morning Yoga in the Park"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-destructive text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                data-tour="create-moment-description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Tell people what to expect from this moment..."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">{errors.description}</p>
              )}
                <p className="mt-1 break-words text-sm text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="category">Category *</Label>
                <InfoTooltip content="Helps participants find your moment when browsing by interests." />
              </div>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField("category", value)}
              >
                <SelectTrigger className={errors.category ? "border-destructive" : ""} data-tour="create-moment-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {momentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-destructive text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Label htmlFor="venueCategory">Venue Category</Label>
                  <InfoTooltip content="Define the kind of place this moment belongs to so Promorang can support retail, grocery, service, and wellness flows properly." />
                </div>
                <Select
                  value={formData.venueCategory || ""}
                  onValueChange={(value) => updateField("venueCategory", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Label htmlFor="momentArchetype">Moment Archetype</Label>
                  <InfoTooltip content="Choose whether this is a gathering, visit, service ritual, drop, referral, founder unlock, or other operating pattern." />
                </div>
                <Select
                  value={formData.momentArchetype || ""}
                  onValueChange={(value) => updateField("momentArchetype", value)}
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
                {formData.momentArchetype && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {momentArchetypes.find((item) => item.value === formData.momentArchetype)?.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="conversionType">Success Action</Label>
                <InfoTooltip content="Tell Promorang what counts as success for this moment: check-in, purchase, appointment, sample, try-on, referral, or repeat visit." />
              </div>
              <Select
                value={formData.conversionType || "check_in"}
                onValueChange={(value) => updateField("conversionType", value)}
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="venueName">Venue Name (Optional)</Label>
                <InfoTooltip content="If your moment is hosted at a specific venue, business, or landmark, specify it here." />
              </div>
              <Input
                id="venueName"
                value={formData.venueName}
                onChange={(e) => updateField("venueName", e.target.value)}
                placeholder="e.g., Central Park, The Coffee House"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="location">Address *</Label>
                <InfoTooltip content="The exact address or meeting point where participants should gather for your moment." />
              </div>
              <Input
                id="location"
                data-tour="create-moment-location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g., 123 Main Street, New York, NY"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-destructive text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                📍 Make sure the address is accurate so participants can find your moment easily.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <Label className="mb-3 block">Display Picture (Optional)</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => updateField("imageUrl", url || "")}
                onFileSelect={handleImageSelect}
                uploading={uploading}
                aspectRatio="video"
              />
              <p className="text-muted-foreground text-sm mt-2">
                Used on cards, compact previews, and discovery surfaces.
              </p>
            </div>

            <div>
              <Label className="mb-3 block">Banner Image (Optional)</Label>
              <ImageUpload
                value={formData.bannerImageUrl}
                onChange={(url) => updateField("bannerImageUrl", url || "")}
                onFileSelect={setBannerImageFile}
                uploading={uploading}
                aspectRatio="banner"
              />
              <p className="text-muted-foreground text-sm mt-2">
                Wide image for the moment detail hero and featured banners.
              </p>
            </div>

            <div>
              <Label className="mb-3 block">Supporting Event Images</Label>
              <MediaGalleryUpload
                value={formData.galleryImages || []}
                onChange={(images) => updateField("galleryImages", images)}
                onFilesSelect={handleGalleryFilesSelect}
                uploading={uploading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startsAt">Start Date & Time *</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => updateField("startsAt", e.target.value)}
                  className={errors.startsAt ? "border-destructive" : ""}
                />
                {errors.startsAt && (
                  <p className="text-destructive text-sm mt-1">{errors.startsAt}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endsAt">End Date & Time (Optional)</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => updateField("endsAt", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80">Recurring</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">Turn this into a repeatable moment</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use this when the same gathering, service, activation, or host loop should happen on a schedule.
                  </p>
                </div>
                <Switch
                  checked={recurrence.recurrenceEnabled}
                  onCheckedChange={(checked) => updateRecurrence("recurrenceEnabled", checked)}
                />
              </div>

              {recurrence.recurrenceEnabled && (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Frequency</Label>
                      <Select
                        value={recurrence.recurrenceFrequency}
                        onValueChange={(value) => updateRecurrence("recurrenceFrequency", value as RecurrenceFrequency)}
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
                      <Label htmlFor="recurrenceInterval">Repeat Every</Label>
                      <Input
                        id="recurrenceInterval"
                        type="number"
                        min={1}
                        value={recurrence.recurrenceInterval}
                        onChange={(e) => updateRecurrence("recurrenceInterval", Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                  </div>

                  {recurrence.recurrenceFrequency === "weekly" && (
                    <div>
                      <Label className="mb-3 block">Weekdays</Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                        {recurrenceWeekdayOptions.map((day) => {
                          const checked = recurrence.recurrenceByWeekday.includes(day.value);
                          return (
                            <label key={day.value} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-sm">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                  updateRecurrence(
                                    "recurrenceByWeekday",
                                    nextChecked
                                      ? [...recurrence.recurrenceByWeekday, day.value].sort((a, b) => a - b)
                                      : recurrence.recurrenceByWeekday.filter((value) => value !== day.value)
                                  );
                                }}
                              />
                              <span>{day.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.recurrenceByWeekday && (
                        <p className="mt-2 text-sm text-destructive">{errors.recurrenceByWeekday}</p>
                      )}
                    </div>
                  )}

                  {recurrence.recurrenceFrequency === "monthly" && (
                    <div>
                      <Label htmlFor="recurrenceDayOfMonth">Day of Month</Label>
                      <Input
                        id="recurrenceDayOfMonth"
                        type="number"
                        min={1}
                        max={31}
                        value={recurrence.recurrenceDayOfMonth}
                        onChange={(e) =>
                          updateRecurrence(
                            "recurrenceDayOfMonth",
                            e.target.value ? Math.min(31, Math.max(1, Number(e.target.value))) : ""
                          )
                        }
                      />
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="recurrenceUntil">Repeat Until (Optional)</Label>
                      <Input
                        id="recurrenceUntil"
                        type="datetime-local"
                        value={recurrence.recurrenceUntil}
                        onChange={(e) => updateRecurrence("recurrenceUntil", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recurrenceCount">Occurrence Cap (Optional)</Label>
                      <Input
                        id="recurrenceCount"
                        type="number"
                        min={1}
                        value={recurrence.recurrenceCount}
                        onChange={(e) => updateRecurrence("recurrenceCount", e.target.value ? Math.max(1, Number(e.target.value)) : "")}
                        placeholder="Leave empty to keep running until the end date"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
                <InfoTooltip content="Set a limit to keep the experience intimate or manage resources. Leave empty for unlimited." />
              </div>
              <Input
                id="maxParticipants"
                data-tour="create-moment-capacity"
                type="number"
                min={2}
                max={500}
                value={formData.maxParticipants || ""}
                onChange={(e) =>
                  updateField(
                    "maxParticipants",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="reward">Reward (Optional)</Label>
                <InfoTooltip content="An optional incentive like a free drink or discount to encourage participation." />
              </div>
              <Input
                id="reward"
                data-tour="create-moment-reward"
                value={formData.reward}
                onChange={(e) => updateField("reward", e.target.value)}
                placeholder="e.g., Free coffee, 10% discount, Exclusive merch"
              />
              <p className="text-muted-foreground text-sm mt-1">
                <Gift className="w-3 h-3 inline mr-1" />
                Rewards attract more participants!
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Moment Economy</h3>
                <p className="text-sm text-muted-foreground">Required for reward-bearing Moments. Money in, rules, money out.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Money Source *</Label>
                  <Select value={formData.moneySource} onValueChange={(value) => updateField("moneySource", value as MomentFormData["moneySource"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="host">Host-funded</SelectItem>
                      <SelectItem value="event">Event-funded</SelectItem>
                      <SelectItem value="entry">Entry-based Sprint</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.moneySource === "entry" && (
                  <div>
                    <Label>Entry Fee (JMD) *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.entryFeeJmd || ""}
                      onChange={(e) => updateField("entryFeeJmd", e.target.value ? Number(e.target.value) : undefined)}
                      className={errors.entryFeeJmd ? "border-destructive" : ""}
                    />
                    {errors.entryFeeJmd && <p className="text-destructive text-sm mt-1">{errors.entryFeeJmd}</p>}
                  </div>
                )}

                <div>
                  <Label>Reward Pool (JMD) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.rewardPoolJmd}
                    onChange={(e) => updateField("rewardPoolJmd", Number(e.target.value) || 0)}
                  />
                </div>

                {formData.moneySource !== "entry" && (
                  <div>
                    <Label>Initial Funding (JMD) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.totalFundedJmd || ""}
                      onChange={(e) => updateField("totalFundedJmd", Number(e.target.value) || 0)}
                      className={errors.totalFundedJmd ? "border-destructive" : ""}
                    />
                    {errors.totalFundedJmd && <p className="text-destructive text-sm mt-1">{errors.totalFundedJmd}</p>}
                  </div>
                )}

                <div>
                  <Label>Funding Reference</Label>
                  <Input
                    value={formData.fundingReference || ""}
                    onChange={(e) => updateField("fundingReference", e.target.value)}
                    placeholder="Bank transfer, receipt, Stripe reference"
                  />
                </div>

                <div>
                  <Label>Platform Fee (JMD)</Label>
                  <Input type="number" min={0} value={formData.platformFeeJmd || ""} onChange={(e) => updateField("platformFeeJmd", Number(e.target.value) || 0)} />
                </div>

                <div>
                  <Label>Host Margin (JMD)</Label>
                  <Input type="number" min={0} value={formData.hostMarginJmd || ""} onChange={(e) => updateField("hostMarginJmd", Number(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Move 1</h3>
                <p className="text-sm text-muted-foreground">V1 requires at least one paid/verified action.</p>
              </div>

              <div>
                <Label>Move Title *</Label>
                <Input
                  value={formData.moveTitle}
                  onChange={(e) => updateField("moveTitle", e.target.value)}
                  className={errors.moveTitle ? "border-destructive" : ""}
                />
                {errors.moveTitle && <p className="text-destructive text-sm mt-1">{errors.moveTitle}</p>}
              </div>

              <div>
                <Label>Move Description</Label>
                <Textarea
                  rows={2}
                  value={formData.moveDescription || ""}
                  onChange={(e) => updateField("moveDescription", e.target.value)}
                  placeholder="Tell participants exactly what proof is required."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Reward Per Verified Move (JMD)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.moveRewardAmountJmd}
                    onChange={(e) => updateField("moveRewardAmountJmd", Number(e.target.value) || 0)}
                    className={errors.moveRewardAmountJmd ? "border-destructive" : ""}
                  />
                  {errors.moveRewardAmountJmd && <p className="text-destructive text-sm mt-1">{errors.moveRewardAmountJmd}</p>}
                </div>

                <div>
                  <Label>Max Completions *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.moveMaxCompletions}
                    onChange={(e) => updateField("moveMaxCompletions", Number(e.target.value) || 1)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Payout Rule</h3>
                <p className="text-sm text-muted-foreground">Manual payout fallback is queued after proof approval.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Rule Type *</Label>
                  <Select value={formData.payoutRuleType} onValueChange={(value) => updateField("payoutRuleType", value as MomentFormData["payoutRuleType"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_action">Per Action</SelectItem>
                      <SelectItem value="first_n">First N</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="leaderboard">Leaderboard</SelectItem>
                      <SelectItem value="judged">Judged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payout Amount (JMD)</Label>
                  <Input type="number" min={0} value={formData.payoutAmountJmd} onChange={(e) => updateField("payoutAmountJmd", Number(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Rule Cap (JMD)</Label>
                  <Input type="number" min={0} value={formData.payoutCapJmd || ""} onChange={(e) => updateField("payoutCapJmd", Number(e.target.value) || undefined)} />
                </div>
              </div>
            </div>

            {/* Visibility Selection */}
            <div data-tour="create-moment-visibility">
              <div className="flex items-center gap-1.5 mb-3">
                <Label>Visibility</Label>
                <InfoTooltip content="Control who can see and join your moment." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {visibilityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("visibility", option.value as "open" | "invite" | "private")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.visibility === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <option.icon className={`w-5 h-5 mb-2 ${formData.visibility === option.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                    <p className="font-medium text-foreground text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-serif text-xl font-semibold mb-4">{formData.title}</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">When</p>
                    <p className="text-muted-foreground text-sm">
                      {formData.startsAt
                        ? new Date(formData.startsAt).toLocaleString()
                        : "Not set"}
                      {formData.endsAt && ` - ${new Date(formData.endsAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Where</p>
                    <p className="text-muted-foreground text-sm">
                      {formData.venueName && `${formData.venueName}, `}
                      {formData.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-muted-foreground text-sm">
                      {formData.maxParticipants
                        ? `Up to ${formData.maxParticipants} participants`
                        : "Unlimited"}
                    </p>
                  </div>
                </div>

                {formData.reward && (
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Reward</p>
                      <p className="text-muted-foreground text-sm">{formData.reward}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">{formData.description}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {momentCategories.find((c) => c.value === formData.category)?.label}
                </span>
                {formData.venueCategory && (
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 text-sm rounded-full">
                    {getTaxonomyLabel(venueCategories, formData.venueCategory)}
                  </span>
                )}
                {formData.momentArchetype && (
                  <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-600 text-sm rounded-full">
                    {getTaxonomyLabel(momentArchetypes, formData.momentArchetype)}
                  </span>
                )}
                {formData.conversionType && (
                  <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 text-sm rounded-full">
                    {getTaxonomyLabel(conversionTypes, formData.conversionType)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                  {formData.visibility === "open" && <Eye className="w-3 h-3" />}
                  {formData.visibility === "invite" && <UserPlus className="w-3 h-3" />}
                  {formData.visibility === "private" && <Lock className="w-3 h-3" />}
                  {visibilityOptions.find((v) => v.value === formData.visibility)?.label}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
              <p className="text-sm">
                {formData.visibility === "open"
                  ? "✨ Your moment will go live immediately after creation. Participants can discover and join it right away!"
                  : formData.visibility === "invite"
                    ? "🔗 Your moment will be visible only to people you share the link with."
                    : "🔒 Your moment will be private and hidden from discovery."}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
          Create a Moment
        </h1>
        <p className="text-muted-foreground mt-2">
          Bring people together for an unforgettable experience
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 touch-pan-x">
          {steps.map((step, index) => (
            <div key={step.id} className="flex shrink-0 items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep >= step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
                  }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 ${currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  style={{ width: "clamp(28px, 10vw, 60px)" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`min-w-0 text-center text-[10px] sm:text-xs ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-border bg-card p-4 sm:p-6">
            {renderStepContent()}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {currentStep === 4 && (
            <>
              <div className="animate-in rounded-2xl border border-primary/20 bg-primary/5 p-4 slide-in-from-right-4 sm:p-6">
                <MatchmakingSuggestions
                  role="brand"
                  category={formData.category}
                  title="Suggested Sponsors"
                  onSelect={(id, name) => {
                    toast({
                      title: "Partnership Request Drafted",
                      description: `We'll notify ${name} once your moment is live!`,
                    });
                  }}
                />
              </div>
              <div className="animate-in rounded-2xl border border-accent/20 bg-accent/5 p-4 slide-in-from-right-8 sm:p-6">
                <MatchmakingSuggestions
                  role="merchant"
                  category={formData.category}
                  location={formData.location.split(',')[0]} // Simple city extract
                  title="Recommended Venues"
                  onSelect={(id, name) => {
                    updateField("venueName", name);
                    toast({
                      title: "Venue Selected",
                      description: `Context updated with ${name} as the preferred venue.`,
                    });
                  }}
                />
              </div>
            </>
          )}

          {currentStep < 4 && (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-6 text-center sm:min-h-[300px] sm:p-8">
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Ecosystem Intelligence</h4>
              <p className="text-xs text-muted-foreground px-4">
                Finish your details to unlock category-specific sponsor and venue matches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button variant="hero" onClick={handleNext}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-tour="create-moment-publish"
          >
            {isSubmitting ? "Creating..." : "Create Moment"}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Product Tour */}
      <ProductTour tourId="create-moment" />
    </div>
  );
};

export default CreateMoment;
