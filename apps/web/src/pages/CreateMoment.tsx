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
import { ImageUpload } from "@/components/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Gift, Check, Image, Eye, Lock, UserPlus, Sparkles } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { MatchmakingSuggestions } from "@/components/matchmaking/MatchmakingSuggestions";
import { z } from "zod";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";

const categories = [
  { value: "social", label: "Social Gathering" },
  { value: "workshop", label: "Workshop" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "food", label: "Food & Drink" },
  { value: "music", label: "Music & Entertainment" },
  { value: "networking", label: "Networking" },
  { value: "outdoor", label: "Outdoor Adventure" },
  { value: "arts", label: "Arts & Culture" },
];

const momentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(5, "Please enter a valid address"),
  venueName: z.string().optional(),
  startsAt: z.string().min(1, "Please select a start date and time"),
  endsAt: z.string().optional(),
  maxParticipants: z.number().min(2).max(500).optional(),
  reward: z.string().optional(),
  imageUrl: z.string().optional(),
  visibility: z.enum(["open", "invite", "private"]).default("open"),
  proofType: z.string().optional(),
  evidenceRequirements: z.any().optional(),
  expectedActionUnit: z.string().optional(),
});

type MomentFormData = z.infer<typeof momentSchema>;

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

const CreateMoment = () => {
  const { user, roles } = useAuth();
  const { startTour, isTourCompleted } = useTour();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mechanicId = searchParams.get('mechanic_id');
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    title: "",
    description: "",
    category: "",
    location: "",
    venueName: "",
    startsAt: "",
    endsAt: "",
    maxParticipants: undefined,
    reward: "",
    imageUrl: "",
    visibility: "open",
    proofType: "QR",
    evidenceRequirements: [],
    expectedActionUnit: "Check-in",
  });
  // Pre-fill from Mechanic
  const [mechanicData, setMechanicData] = useState<any>(null);

  useEffect(() => {
    if (mechanicId) {
      const fetchMechanic = async () => {
        try {
          const mechanic = await amiService.getMechanicById(mechanicId);
          if (mechanic) {
            setMechanicData(mechanic);
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
  const primaryRole = roles[0] || "participant";

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

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, "moment-images", user.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const { error } = await supabase.from("moments").insert({
        host_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        venue_name: formData.venueName || null,
        starts_at: new Date(formData.startsAt).toISOString(),
        ends_at: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        max_participants: formData.maxParticipants || null,
        reward: formData.reward || null,
        image_url: imageUrl || null,
        is_active: true,
        visibility: formData.visibility,
        mechanic_id: mechanicId || null, // Link to AMI
        proof_type: formData.proofType || 'QR',
        evidence_requirements: formData.evidenceRequirements || [],
        expected_action_unit: formData.expectedActionUnit || 'Action',
      });

      if (error) throw error;

      toast({
        title: "Moment Created! 🎉",
        description: "Your moment is now live and ready for participants.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error creating moment",
        description: error.message,
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
              <p className="text-muted-foreground text-sm mt-1">
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
                  {categories.map((cat) => (
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
              <Label className="mb-3 block">Cover Image (Optional)</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => updateField("imageUrl", url || "")}
                onFileSelect={handleImageSelect}
                uploading={uploading}
                aspectRatio="video"
              />
              <p className="text-muted-foreground text-sm mt-2">
                A great cover image attracts more participants!
              </p>
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
                  {categories.find((c) => c.value === formData.category)?.label}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                  {formData.visibility === "open" && <Eye className="w-3 h-3" />}
                  {formData.visibility === "invite" && <UserPlus className="w-3 h-3" />}
                  {formData.visibility === "private" && <Lock className="w-3 h-3" />}
                  {visibilityOptions.find((v) => v.value === formData.visibility)?.label}
                </span>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
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
    <div className="max-w-2xl mx-auto">
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
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Create a Moment
        </h1>
        <p className="text-muted-foreground mt-2">
          Bring people together for an unforgettable experience
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
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
                  className={`w-full h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  style={{ width: "60px" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-xs ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 h-full">
            {renderStepContent()}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {currentStep === 4 && (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 animate-in slide-in-from-right-4">
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
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 animate-in slide-in-from-right-8">
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
            <div className="bg-muted/30 border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
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
      <div className="flex justify-between">
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
