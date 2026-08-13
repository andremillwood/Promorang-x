import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { amiService } from "@/services/ami";
import { useImageUpload } from "@/hooks/useImageUpload";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
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
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Gift, Check, Eye, Lock, UserPlus, Sparkles, Repeat2, GitBranch, Megaphone, Store, Clapperboard, Route, Target } from "lucide-react";
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
import { LOCAL_DROP_PROOF_OPTIONS, resolvePlaceGeo, toMoveProofType } from "@/lib/jamaica-geo";

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
  moneySource: z.enum(["entry", "host", "event", "platform", "content", "hybrid"]),
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
type CreationTypeId = typeof creationTypes[number]["id"];

const visibilityOptions = [
  { value: "open", label: "Open", description: "Anyone can discover and join", icon: Eye },
  { value: "invite", label: "Invite Only", description: "Only people you invite can join", icon: UserPlus },
  { value: "private", label: "Private", description: "Hidden from discovery", icon: Lock },
];

const moneySourceOptions = [
  {
    value: "platform",
    label: "Promorang may allocate Gems from a platform program",
    shortLabel: "Promorang-backed",
    description: "Request a Promorang Gem allocation. Nothing is funded until that allocation is approved and secured.",
  },
  {
    value: "content",
    label: "A creator or content program may allocate the Gems",
    shortLabel: "Content-backed",
    description: "Use this when a creator or content program will secure the participant reserve after approval.",
  },
  {
    value: "host",
    label: "I will secure the Gems",
    shortLabel: "Host funded",
    description: "Use this when you or your organization will fund the activation reserve with Gems.",
  },
  {
    value: "event",
    label: "A partner will secure the Gems",
    shortLabel: "Event budget",
    description: "Use this when a sponsor, venue, or event partner will fund the activation reserve.",
  },
  {
    value: "entry",
    label: "People pay to enter",
    shortLabel: "Entry funded",
    description: "Use this when secured entry Gems contribute to the participant reserve.",
  },
  {
    value: "hybrid",
    label: "A mix of host and entry Gems",
    shortLabel: "Mixed funding",
    description: "Use this when more than one Gem source will fund the reserve.",
  },
] as const;

const payoutRuleOptions = [
  {
    value: "per_action",
    label: "Pay every approved person",
    description: "Best for check-ins, samples, visits, or any action where everyone who proves it earns the same amount.",
  },
  {
    value: "first_n",
    label: "Pay the first people who qualify",
    description: "Best for limited drops, early arrivals, or first-come rewards.",
  },
  {
    value: "milestone",
    label: "Pay when a target is reached",
    description: "Best when participants need to hit a count, streak, or completion target.",
  },
  {
    value: "leaderboard",
    label: "Pay based on rank",
    description: "Best for competitions where top performers earn more.",
  },
  {
    value: "judged",
    label: "Pay after manual selection",
    description: "Best when a host, sponsor, or reviewer chooses winners after looking at proof.",
  },
] as const;

const steps = [
  { id: 1, title: "Story & outcome", icon: Sparkles },
  { id: 2, title: "Room & people", icon: MapPin },
  { id: 3, title: "Proof & shared value", icon: Users },
  { id: 4, title: "Review", icon: Check },
];

const DEFAULT_MOMENT_TYPE = "community";

const creationTypes = [
  {
    id: "moment",
    label: "Moment",
    eyebrow: "One-time or dated",
    description: "A gathering, drop, visit, or activity people can join and prove.",
    icon: Calendar,
    archetype: "",
    conversionType: "check_in",
    recurring: false,
    moveTitle: "Check in and prove attendance",
  },
  {
    id: "local_drop",
    label: "Local Drop",
    eyebrow: "Jamaica share + proof",
    description: "A Kingston food, beverage, or nightlife drop proved by screenshot, share, or link. QR is optional.",
    icon: Gift,
    archetype: "drop",
    conversionType: "check_in",
    recurring: false,
    moveTitle: "Share proof of the drop",
  },
  {
    id: "recurring",
    label: "Recurring Moment",
    eyebrow: "Weekly or repeatable",
    description: "A repeat ritual that should build return behavior and standing over time.",
    icon: Repeat2,
    archetype: "gathering",
    conversionType: "repeat_visit",
    recurring: true,
    moveTitle: "Return, check in, and build standing",
  },
  {
    id: "submoment",
    label: "Sub-moment",
    eyebrow: "Inside a larger moment",
    description: "A creative or activity layer with its own owner inside a parent moment.",
    icon: GitBranch,
    archetype: "activation",
    conversionType: "check_in",
    recurring: false,
    moveTitle: "Complete the sub-moment action",
  },
  {
    id: "creator",
    label: "Creator Mission",
    eyebrow: "Content to attendance",
    description: "Turn a story, creator drop, or media artifact into a physical action.",
    icon: Clapperboard,
    archetype: "content",
    conversionType: "check_in",
    recurring: false,
    moveTitle: "Watch, arrive, and leave a Mark",
  },
  {
    id: "merchant",
    label: "Merchant Activation",
    eyebrow: "Visit, sample, buy",
    description: "Drive verified visits, samples, appointments, purchases, or repeat behavior.",
    icon: Store,
    archetype: "visit",
    conversionType: "purchase",
    recurring: false,
    moveTitle: "Visit and complete the verified action",
  },
  {
    id: "campaign",
    label: "Brand Campaign",
    eyebrow: "Sponsored movement",
    description: "Coordinate a funded activation with proof, caps, and reward logic.",
    icon: Megaphone,
    archetype: "activation",
    conversionType: "sample",
    recurring: false,
    moveTitle: "Complete the campaign proof",
  },
] as const;

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
  const returnTo = searchParams.get('returnTo');
  const activationId = searchParams.get('activationId');
  const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
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
  const [creationType, setCreationType] = useState<CreationTypeId>(
    parentMomentId ? "submoment" : sourceContentId ? "creator" : "moment"
  );

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
    proofType: "screenshot",
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
  useEffect(() => {
    if (!activationId) return;
    let cancelled = false;
    const loadActivationContext = async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("title,description,funding_goal_gems,metadata,scene_id")
        .eq("id", activationId)
        .single();
      if (error || !data || cancelled) return;
      const metadata = (data.metadata || {}) as Record<string, unknown>;
      const participantValue = Array.isArray(metadata.participant_value)
        ? metadata.participant_value.join(", ")
        : "";
      setCreationType("campaign");
      setFormData((current) => ({
        ...current,
        title: current.title || data.title || "",
        description: current.description || String(metadata.outcome_detail || data.description || ""),
        location: current.location || String(metadata.location || ""),
        momentArchetype: current.momentArchetype || "activation",
        moveTitle: String(metadata.what_counts || current.moveTitle),
        moveDescription: current.moveDescription || (participantValue
          ? `Complete the agreed action. Participant value: ${participantValue}.`
          : ""),
        moneySource: "platform",
        rewardPoolJmd: Number(data.funding_goal_gems || current.rewardPoolJmd || 0),
      }));
    };
    void loadActivationContext();
    return () => { cancelled = true; };
  }, [activationId]);
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
      formData.momentArchetype === "drop" ? "screenshot" :
      formData.conversionType === "purchase" ? "screenshot" :
      formData.conversionType === "sample" ? "screenshot" :
      formData.conversionType === "try_on" ? "screenshot" :
      formData.conversionType === "appointment" || formData.conversionType === "booking" ? "Code" :
      formData.momentArchetype === "content" ? "share" :
      formData.momentArchetype === "service" ? "Code" :
      formData.momentArchetype === "visit" ? "GPS" :
      "screenshot";

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

  const selectedCreationType = creationTypes.find((type) => type.id === creationType) || creationTypes[0];
  const selectedMoneySource = moneySourceOptions.find((option) => option.value === formData.moneySource);
  const selectedPayoutRule = payoutRuleOptions.find((option) => option.value === formData.payoutRuleType);
  const totalRewardExposure = (formData.moveRewardAmountJmd || 0) * (formData.moveMaxCompletions || 0);
  const remainingRewardPool = (formData.rewardPoolJmd || 0) - totalRewardExposure;
  const fundingOnHand = formData.moneySource === "entry" ? 0 : formData.totalFundedJmd || 0;
  const isPlatformAllocatedSource = ["platform", "content"].includes(formData.moneySource);

  const handleCreationTypeSelect = (typeId: CreationTypeId) => {
    const nextType = creationTypes.find((type) => type.id === typeId) || creationTypes[0];
    setCreationType(typeId);
    setFormData((prev) => ({
      ...prev,
      momentArchetype: nextType.archetype || prev.momentArchetype,
      conversionType: nextType.conversionType || prev.conversionType,
      moveTitle: nextType.moveTitle,
      moneySource: typeId === "creator" ? "content" : typeId === "campaign" ? "platform" : prev.moneySource,
      rewardPoolJmd: typeId === "campaign" && prev.rewardPoolJmd === 0 ? 5000 : prev.rewardPoolJmd,
      totalFundedJmd: typeId === "campaign" ? 0 : prev.totalFundedJmd,
      venueCategory: typeId === "local_drop" ? (prev.venueCategory || "food_beverage") : prev.venueCategory,
      proofType: typeId === "local_drop" ? "screenshot" : prev.proofType,
    }));
    setRecurrence((prev) => ({
      ...prev,
      recurrenceEnabled: nextType.recurring || prev.recurrenceEnabled,
    }));
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
        newErrors.entryFeeJmd = "Set the Gems required for paid entry";
      }
      const requiresUpfrontFunding = !["entry", "platform", "content"].includes(formData.moneySource);
      if (formData.rewardPoolJmd > 0 && requiresUpfrontFunding && (formData.totalFundedJmd || 0) < formData.rewardPoolJmd) {
        newErrors.totalFundedJmd = "The secured Gems must cover the participant reserve";
      }
      if (!formData.moveTitle) {
        newErrors.moveTitle = "Tell people the action they need to take";
      }
      if (recurrence.recurrenceEnabled && recurrence.recurrenceFrequency === "weekly" && recurrence.recurrenceByWeekday.length === 0) {
        newErrors.recurrenceByWeekday = "Pick at least one weekday for recurring moments";
      }
      if ((formData.moveRewardAmountJmd || 0) * (formData.moveMaxCompletions || 0) > (formData.rewardPoolJmd || 0)) {
        newErrors.moveRewardAmountJmd = "The participant reserve must cover every promised Gem return";
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

  const handleMoneySourceChange = (value: MomentFormData["moneySource"]) => {
    setFormData((prev) => ({
      ...prev,
      moneySource: value,
      entryFeeJmd: value === "entry" ? prev.entryFeeJmd : undefined,
      totalFundedJmd: ["entry", "platform", "content"].includes(value) ? 0 : prev.totalFundedJmd,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.moneySource;
      delete next.entryFeeJmd;
      delete next.totalFundedJmd;
      return next;
    });
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

      const momentGeo = resolvePlaceGeo({ location: formData.location });
      const productProofType = formData.proofType || "screenshot";

      const response = await fetch(`${API_BASE_URL}/moment-economy/moments`, {
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
        proof_type: productProofType,
        city: momentGeo.city,
        country: momentGeo.country,
        country_code: momentGeo.country_code,
        evidence_requirements: formData.evidenceRequirements || [],
        expected_action_unit: formData.expectedActionUnit || 'Action',
        check_in_code: checkInCode,
        money_source: formData.moneySource,
        value_unit: "GEM",
        entry_fee_gems: formData.moneySource === "entry" ? formData.entryFeeJmd || 0 : null,
        total_funded_gems: ["entry", "platform", "content"].includes(formData.moneySource) ? 0 : formData.totalFundedJmd || 0,
        reward_pool_gems: formData.rewardPoolJmd || 0,
        host_margin_gems: formData.hostMarginJmd || 0,
        platform_fee_gems: formData.platformFeeJmd || 0,
        ops_buffer_gems: formData.opsBufferJmd || 0,
        entry_fee_jmd: formData.moneySource === "entry" ? formData.entryFeeJmd || 0 : null,
        total_funded_jmd: ["entry", "platform", "content"].includes(formData.moneySource) ? 0 : formData.totalFundedJmd || 0,
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
          proof_type: toMoveProofType(productProofType),
          reward_amount_jmd: formData.moveRewardAmountJmd || formData.payoutAmountJmd || 0,
          reward_amount_gems: formData.moveRewardAmountJmd || formData.payoutAmountJmd || 0,
          max_completions: formData.moveMaxCompletions,
          requires_unique: true,
          sort_order: 0,
        }],
        payout_rules: [{
          rule_type: formData.payoutRuleType,
          amount_jmd: formData.payoutAmountJmd || formData.moveRewardAmountJmd || 0,
          cap_jmd: formData.payoutCapJmd || formData.rewardPoolJmd || 0,
          amount_gems: formData.payoutAmountJmd || formData.moveRewardAmountJmd || 0,
          cap_gems: formData.payoutCapJmd || formData.rewardPoolJmd || 0,
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
          await fetch(`${API_BASE_URL}/o2o/links`, {
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
        title: "Your Moment is ready",
        description: sourceContentId
          ? "Your story now has a launch moment and a mission link."
          : formData.moneySource === "entry"
            ? "Paid access will open when the required entry Gems are secured."
            : formData.rewardPoolJmd > 0
              ? "The Moment is created. Paid returns open after the activation Gems are secured."
              : "The invitation is ready. You can now welcome people into the Moment.",
      });

      navigate(safeReturnTo && createdMomentId
        ? `${safeReturnTo}${safeReturnTo.includes("?") ? "&" : "?"}attachMoment=${encodeURIComponent(createdMomentId)}`
        : "/dashboard");
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
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">Story and desired outcome</p>
            <h2 className="mb-4 font-serif text-4xl font-semibold leading-[.98] tracking-[-.04em] text-foreground">What should people feel—and what should change?</h2>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="title">What will people call this Moment? *</Label>
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
              <Label htmlFor="description">Why will it be worth showing up? *</Label>
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
                  <InfoTooltip content="Jamaica Local Drops use Food & Beverage or Nightlife. Other venue types remain available." />
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
            <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Room and people</p><h2 className="mt-2 font-serif text-4xl font-semibold leading-[.98] tracking-[-.04em]">Where will people gather?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Make arrival feel certain: name the place and give people an address they can trust.</p></div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Label htmlFor="venueName">What is the place called? (Optional)</Label>
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
                <Label htmlFor="location">Where should people arrive? *</Label>
                <InfoTooltip content="The exact address or meeting point where participants should gather for your moment." />
              </div>
              <Input
                id="location"
                data-tour="create-moment-location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g., 12 Hope Road, Kingston, Jamaica"
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-destructive text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <GuidanceDisclosure
              id="create-moment:arrival-point"
              title="Why the arrival point matters"
              summary="An accurate arrival point protects the experience before the Moment begins."
              className="mt-0"
            >
              <p className="text-sm text-muted-foreground">
                People decide whether to trust a Moment before they arrive. A clear place name, address, or meeting point reduces confusion, late arrivals, support issues, and failed proof.
              </p>
            </GuidanceDisclosure>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Story, proof, and shared value</p><h2 className="mt-2 font-serif text-4xl font-semibold leading-[.98] tracking-[-.04em]">What will people see, do, and leave with?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Shape the invitation, make what counts clear, and define the value that follows trusted participation.</p></div>
            {/* Cover Image */}
            <div>
              <Label className="mb-3 block">The image people meet first (Optional)</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => updateField("imageUrl", url || "")}
                onFileSelect={handleImageSelect}
                uploading={uploading}
                aspectRatio="video"
              />
              <p className="text-muted-foreground text-sm mt-2">
                Used on cards, compact previews, and public listings.
              </p>
            </div>

            <div>
              <Label className="mb-3 block">A wider image for the Moment (Optional)</Label>
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
              <Label className="mb-3 block">Supporting Moment Images</Label>
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
                A reward should deepen the experience, not replace the reason to take part.
              </p>
            </div>

            <div className="space-y-6 rounded-[2rem] border border-border/60 bg-background/45 p-5 sm:p-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <GuidanceDisclosure
                  id="create-moment:shared-value"
                  eyebrow="Shared value"
                  title="What value follows participation?"
                  summary="Use Gems only when verified participation earns platform value, and keep commitments inside the secured reserve."
                  className="mt-0 flex-1"
                >
                  <p className="text-sm leading-6 text-muted-foreground">
                    Add Gems only when verified participation earns platform value. Name who makes that value possible and keep every commitment within the secured reserve.
                  </p>
                </GuidanceDisclosure>
                <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Maximum return:</span>{" "}
                  <span className="font-semibold text-foreground">{totalRewardExposure.toLocaleString()} Gems</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Who makes the participant value possible? *</Label>
                  <Select value={formData.moneySource} onValueChange={(value) => handleMoneySourceChange(value as MomentFormData["moneySource"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moneySourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedMoneySource?.description}
                  </p>
                </div>

                {formData.moneySource === "entry" && (
                  <div>
                    <Label>How many Gems are needed for entry? *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.entryFeeJmd || ""}
                      onChange={(e) => updateField("entryFeeJmd", e.target.value ? Number(e.target.value) : undefined)}
                      className={errors.entryFeeJmd ? "border-destructive" : ""}
                      placeholder="e.g., 500"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">Paid access is issued only after these Gems are secured.</p>
                    {errors.entryFeeJmd && <p className="text-destructive text-sm mt-1">{errors.entryFeeJmd}</p>}
                  </div>
                )}

                <div>
                  <Label>Total Gems reserved for participant value *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.rewardPoolJmd}
                    onChange={(e) => updateField("rewardPoolJmd", Number(e.target.value) || 0)}
                    placeholder="e.g., 10000"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">The maximum platform value this Moment can return to participants.</p>
                </div>

                {formData.moneySource !== "entry" && !isPlatformAllocatedSource && (
                  <div>
                    <Label>Gems ready to secure for this Moment *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.totalFundedJmd || ""}
                      onChange={(e) => updateField("totalFundedJmd", Number(e.target.value) || 0)}
                      className={errors.totalFundedJmd ? "border-destructive" : ""}
                      placeholder="e.g., 10000"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">This must cover the participant reserve before paid rewards can open.</p>
                    {errors.totalFundedJmd && <p className="text-destructive text-sm mt-1">{errors.totalFundedJmd}</p>}
                  </div>
                )}

                <div>
                  <Label>Funding note or reserve reference</Label>
                  <Input
                    value={formData.fundingReference || ""}
                    onChange={(e) => updateField("fundingReference", e.target.value)}
                    placeholder={isPlatformAllocatedSource ? "e.g., creator cohort, sponsor pool, campaign note" : "e.g., Stripe receipt, bank transfer ID"}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isPlatformAllocatedSource
                      ? "Optional context for why this should receive Promorang-backed allocation."
                      : "Optional, but useful for finance review later."}
                  </p>
                </div>

                <div>
                  <Label>Promorang fee in Gems, if already known</Label>
                  <Input type="number" min={0} value={formData.platformFeeJmd || ""} onChange={(e) => updateField("platformFeeJmd", Number(e.target.value) || 0)} />
                  <p className="mt-1 text-sm text-muted-foreground">Leave blank if the platform will calculate this later.</p>
                </div>

                <div>
                  <Label>Host return in Gems, if any</Label>
                  <Input type="number" min={0} value={formData.hostMarginJmd || ""} onChange={(e) => updateField("hostMarginJmd", Number(e.target.value) || 0)} />
                  <p className="mt-1 text-sm text-muted-foreground">Use only when the budget includes a host share separate from rewards.</p>
                </div>
              </div>

              <div className={`rounded-xl border p-4 text-sm ${
                remainingRewardPool < 0
                  ? "border-destructive/40 bg-destructive/10"
                  : "border-primary/20 bg-primary/5"
              }`}>
                <p className="font-semibold text-foreground">Shared-value check</p>
                <p className="mt-1 text-muted-foreground">
                  At the current settings, up to {formData.moveMaxCompletions} approved completions can return {formData.moveRewardAmountJmd.toLocaleString()} Gems each, for a maximum of {totalRewardExposure.toLocaleString()} Gems.
                  {" "}
                  {remainingRewardPool < 0
                    ? "Increase the reward pool or lower the per-person reward before launch."
                    : `That leaves ${remainingRewardPool.toLocaleString()} Gems unassigned in the reserve.`}
                </p>
                {formData.moneySource !== "entry" && !isPlatformAllocatedSource && (
                  <p className="mt-1 text-muted-foreground">
                    Gems ready to secure: {fundingOnHand.toLocaleString()}.
                  </p>
                )}
                {isPlatformAllocatedSource && (
                  <p className="mt-1 text-muted-foreground">
                    This starts as an allocation request. Promorang must approve and secure Gems before paid returns can run.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-4 sm:p-5">
              <GuidanceDisclosure
                id="create-moment:participant-action"
                eyebrow="Participant action"
                title="What does someone need to do?"
                summary="Write the action like an instruction Promorang can verify before value is released."
                className="mt-0"
              >
                <p className="text-sm text-muted-foreground">
                  Write this like an instruction a participant will understand. This is the action Promorang will verify before a reward is paid.
                </p>
              </GuidanceDisclosure>

              <div>
                <Label>Action name *</Label>
                <Input
                  value={formData.moveTitle}
                  onChange={(e) => updateField("moveTitle", e.target.value)}
                  className={errors.moveTitle ? "border-destructive" : ""}
                  placeholder="e.g., Check in at the front desk"
                />
                {errors.moveTitle && <p className="text-destructive text-sm mt-1">{errors.moveTitle}</p>}
              </div>

              <div>
                <Label>Proof type</Label>
                <Select
                  value={formData.proofType || "screenshot"}
                  onValueChange={(value) => updateField("proofType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proof type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCAL_DROP_PROOF_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-sm text-muted-foreground">
                  {LOCAL_DROP_PROOF_OPTIONS.find((option) => option.value === formData.proofType)?.description
                    || "Local Drops default to screenshot, share, or link. QR is secondary."}
                </p>
              </div>

              <div>
                <Label>Proof instructions</Label>
                <Textarea
                  rows={2}
                  value={formData.moveDescription || ""}
                  onChange={(e) => updateField("moveDescription", e.target.value)}
                  placeholder="e.g., Scan the QR code at the counter and upload a photo of your receipt."
                />
                <p className="mt-1 text-sm text-muted-foreground">Be specific about QR codes, photos, receipts, staff approval, or any other proof needed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Gems returned to each approved person</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.moveRewardAmountJmd}
                    onChange={(e) => updateField("moveRewardAmountJmd", Number(e.target.value) || 0)}
                    className={errors.moveRewardAmountJmd ? "border-destructive" : ""}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">Set to 0 when the return is access, recognition, a memory, or another non-Gem benefit.</p>
                  {errors.moveRewardAmountJmd && <p className="text-destructive text-sm mt-1">{errors.moveRewardAmountJmd}</p>}
                </div>

                <div>
                  <Label>Maximum people who can earn this *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.moveMaxCompletions}
                    onChange={(e) => updateField("moveMaxCompletions", Number(e.target.value) || 1)}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">This protects the budget from paying more people than planned.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-4 sm:p-5">
              <GuidanceDisclosure
                id="create-moment:release-rule"
                eyebrow="Release rule"
                title="When should secured Gems be released?"
                summary="Choose the simplest rule that matches the Moment; Gems release after stated proof is approved."
                className="mt-0"
              >
                <p className="text-sm text-muted-foreground">
                  Choose the simplest rule that matches the Moment. Gems release only after the stated proof is approved.
                </p>
              </GuidanceDisclosure>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Label>How the value is released *</Label>
                  <Select value={formData.payoutRuleType} onValueChange={(value) => updateField("payoutRuleType", value as MomentFormData["payoutRuleType"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutRuleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedPayoutRule?.description}</p>
                </div>
                <div>
                  <Label>Gems this rule releases</Label>
                  <Input type="number" min={0} value={formData.payoutAmountJmd} onChange={(e) => updateField("payoutAmountJmd", Number(e.target.value) || 0)} />
                  <p className="mt-1 text-sm text-muted-foreground">Usually the same as the per-person reward above.</p>
                </div>
                <div>
                  <Label>Maximum Gems this rule can release</Label>
                  <Input type="number" min={0} value={formData.payoutCapJmd || ""} onChange={(e) => updateField("payoutCapJmd", Number(e.target.value) || undefined)} />
                  <p className="mt-1 text-sm text-muted-foreground">Leave blank to use the full reward pool as the cap.</p>
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
                    className={`p-4 rounded-xl border-2 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${formData.visibility === option.value
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
            <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-primary">The whole Moment</p>
              <h3 className="mb-4 font-serif text-4xl font-semibold leading-[.98] tracking-[-.04em] text-foreground">{formData.title}</h3>

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

              <div className="mt-7 grid border-y border-border/60 sm:grid-cols-3">
                {[
                  {
                    eyebrow: "People will",
                    title: formData.moveTitle || getTaxonomyLabel(conversionTypes, formData.conversionType) || "Take part",
                    detail: formData.moveDescription || "The participation instruction will appear here.",
                  },
                  {
                    eyebrow: "What counts",
                    title: formData.proofType ? `${formData.proofType} proof` : "Proof to be confirmed",
                    detail: "This is reviewed before any promised value is released.",
                  },
                  {
                    eyebrow: "What follows",
                    title: formData.moveRewardAmountJmd > 0 ? `${formData.moveRewardAmountJmd.toLocaleString()} Gems` : formData.reward || "A verified Mark",
                    detail: formData.moveRewardAmountJmd > 0 ? `Up to ${formData.moveMaxCompletions} people can receive this from the secured reserve.` : "The result stays connected to the participant and the Moment.",
                  },
                ].map((item) => (
                  <div key={item.eyebrow} className="border-b border-border/60 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{item.eyebrow}</p>
                    <p className="mt-3 font-serif text-xl font-semibold leading-tight">{item.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>

              {formData.rewardPoolJmd > 0 && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Activation reserve</p><p className="mt-1 text-sm text-muted-foreground">Paid returns open only after the required Gems are secured.</p></div>
                  <p className="font-serif text-2xl font-semibold">{formData.rewardPoolJmd.toLocaleString()} Gems</p>
                </div>
              )}

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
                  ? "Your moment will go live immediately after creation. Participants can discover it, choose it, act on it, and leave verified proof behind."
                  : formData.visibility === "invite"
                    ? "Your moment will be visible only to people you share the link with, giving you a more controlled proof loop."
                    : "Your moment will stay private and hidden from discovery until you are ready to open the room."}
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

  const SelectedCreationIcon = selectedCreationType.icon;

  return (
    <div className="mx-auto max-w-[100rem] pb-20">
      {/* Header */}
      <div className="mb-8 px-4 sm:px-0">
        <Button
          variant="ghost"
          onClick={() => navigate(safeReturnTo || "/dashboard")}
          className="mb-4 text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to your studio
        </Button>

        {/* Unified Hero Container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-[#1F140E] via-[#0D0D0E] to-[#120B07] p-6 sm:p-10 shadow-2xl text-white">
          <div className="flex items-center space-x-2 bg-primary/20 border border-primary/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary w-fit mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Merchant & Host Studio • Post a Perk or Treat</span>
          </div>

          <h1 className="max-w-4xl font-sans text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95]">
            Post a Perk, <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">Free Coffee Voucher, or Treat.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/75">
            Give people a real reason to show up. Offer a 30-second free perk or voucher drop, collect verified check-in proof, and turn quiet hours into loyal repeat customer visits.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-primary/90">
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">☕ Coffee & Food Drops</span>
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">🎟️ VIP Passes & Vouchers</span>
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">🚀 Zero Upfront Cash Needed</span>
          </div>
        </div>
      </div>

      <section className="mb-8 overflow-hidden rounded-[2rem] border border-border/60 bg-card/55 p-5 sm:p-8">
        <GuidanceDisclosure
          id="create-moment:invitation-shape"
          eyebrow="Shape of the invitation"
          title="What kind of gathering is this?"
          summary="Choose the closest shape. You can refine timing, participation, proof, and shared value as the story develops."
          className="mb-5 mt-0"
        >
          <p className="text-sm text-muted-foreground">
            Choose the closest shape. You can refine timing, participation, proof, and shared value as the story develops.
          </p>
        </GuidanceDisclosure>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {creationTypes.map((type) => {
            const Icon = type.icon;
            const active = creationType === type.id;
            const disabled = type.id === "submoment" && !parentMomentId;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => !disabled && handleCreationTypeSelect(type.id)}
                disabled={disabled}
                className={`group border-l-2 px-4 py-5 text-left transition ${
                  active
                    ? "border-primary bg-primary/5 text-foreground"
                    : disabled
                      ? "border-border bg-muted/20 text-muted-foreground opacity-75"
                      : "border-border text-foreground hover:border-primary/40 hover:bg-muted/25"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] opacity-75">{type.eyebrow}</span>
                    <span className="mt-1 block text-base font-bold">{type.label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {disabled ? "Open this from a parent moment to assign sub-moment ownership." : type.description}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Progress Steps */}
      <nav aria-label="Moment creation progress" className="mb-8 overflow-x-auto border-y border-border/60 touch-pan-x">
        <div className="flex min-w-max items-stretch">
          {steps.map((step) => (
            <div key={step.id} className={`flex min-w-48 items-center gap-3 border-r border-border/60 px-5 py-4 last:border-r-0 ${currentStep === step.id ? "bg-primary/5" : ""}`}>
              <span className={`font-serif text-lg ${currentStep >= step.id ? "text-primary" : "text-muted-foreground/40"}`}>0{step.id}</span>
              <span className={`text-xs font-bold ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Step Content */}
      <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div>
          <div className="h-full rounded-[2rem] border border-border/60 bg-card/55 p-5 sm:p-8 lg:p-10">
            {renderStepContent()}
          </div>
        </div>

        <div className="space-y-6">
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
            <aside className="h-full min-h-[300px] rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,.24)] xl:sticky xl:top-28">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                  <SelectedCreationIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-400">The Moment taking shape</p>
                  <h4 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.04em] text-white">{selectedCreationType.label}</h4>
                  <p className="mt-2 text-sm leading-6 text-white/45">{selectedCreationType.description}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
                  <div className="min-w-0">
                    <Route className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="truncate text-xs font-bold text-white">{getTaxonomyLabel(conversionTypes, formData.conversionType) || "Action"}</p>
                    <p className="text-[10px] text-muted-foreground">participant does</p>
                  </div>
                  <span className="h-px w-5 bg-border" />
                  <div className="min-w-0">
                    <Target className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="truncate text-xs font-bold text-white">{formData.proofType || "Proof"}</p>
                    <p className="text-[10px] text-muted-foreground">system verifies</p>
                  </div>
                  <span className="h-px w-5 bg-border" />
                  <div className="min-w-0">
                    <Sparkles className="mx-auto mb-1 h-4 w-4 text-primary" />
                    <p className="truncate text-xs font-bold text-white">{formData.reward ? "Reward" : "Mark"}</p>
                    <p className="text-[10px] text-muted-foreground">value unlocks</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 py-3">
                  <span className="text-white/40">Returns</span>
                  <span className="font-semibold text-white">{recurrence.recurrenceEnabled ? "Repeats" : "One time"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 py-3">
                  <span className="text-white/40">Care</span>
                  <span className="font-semibold text-white">{parentMomentId ? "Shared inside a Moment" : "You are hosting"}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-white/40">Status</span>
                  <span className="font-semibold text-white">Taking shape</span>
                </div>
              </div>

              {parentMomentId && (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-foreground">Sub-moment lineage</p>
                  <p className="mt-1 text-muted-foreground">
                    This will publish inside a parent moment while giving the creative/activity owner their own operating surface.
                  </p>
                </div>
              )}
            </aside>
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
