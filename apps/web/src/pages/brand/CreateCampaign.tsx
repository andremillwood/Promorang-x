import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, DollarSign, Target, Users } from "lucide-react";
import { CommercialProofLoop } from "@/components/commercial/CommercialProofLoop";

const CATEGORIES = [
  { value: "social", label: "Social Gathering" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "food", label: "Food & Drink" },
  { value: "music", label: "Music & Entertainment" },
  { value: "networking", label: "Networking" },
  { value: "outdoor", label: "Outdoor Adventure" },
  { value: "arts", label: "Arts & Culture" },
];

const GOALS = [
  { value: "content", label: "Content Proof" },
  { value: "purchase", label: "Purchase Proof" },
  { value: "sampling", label: "Sampling" },
  { value: "signup", label: "Scan + Signup" },
  { value: "attendance", label: "Attendance" },
];

const steps = [
  { id: 1, title: "Moment Link", icon: Target },
  { id: 2, title: "Budget", icon: DollarSign },
  { id: 3, title: "Distribution Zone", icon: Users },
  { id: 4, title: "Review", icon: Check },
];

interface CampaignFormData {
  title: string;
  description: string;
  goals: string[];
  budgetUsd: number;
  durationDays: number;
  categories: string[];
  momentId: string;
  geoLabel: string;
  geoRadiusMeters: number;
  distributionStart: string;
  distributionEnd: string;
  entryMode: "moment_direct" | "qr" | "ad_link" | "direct_link";
  entryEndpoint: string;
  channels: string[];
  creatorRewardPerVerifiedActionJmd: number;
  payoutPerScanSignupJmd: number;
  payoutPerVerifiedPostJmd: number;
  payoutPerPurchaseProofJmd: number;
}

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    goals: [],
    budgetUsd: 1000,
    durationDays: 30,
    categories: [],
    momentId: "",
    geoLabel: "",
    geoRadiusMeters: 1000,
    distributionStart: "",
    distributionEnd: "",
    entryMode: "moment_direct",
    entryEndpoint: "",
    channels: ["qr", "ad_link", "direct_link"],
    creatorRewardPerVerifiedActionJmd: 50,
    payoutPerScanSignupJmd: 20,
    payoutPerVerifiedPostJmd: 50,
    payoutPerPurchaseProofJmd: 100,
  });

  const updateField = <K extends keyof CampaignFormData>(field: K, value: CampaignFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title || formData.title.length < 5) {
        nextErrors.title = "Title must be at least 5 characters";
      }
      if (!formData.momentId || formData.momentId.length < 10) {
        nextErrors.momentId = "Link this PromoPush to a specific Moment ID";
      }
      if (!formData.description || formData.description.length < 20) {
        nextErrors.description = "Description must be at least 20 characters";
      }
      if (formData.goals.length === 0) {
        nextErrors.goals = "Select the verified outcome this distribution should drive";
      }
    }

    if (step === 2) {
      if (formData.budgetUsd < 100) {
        nextErrors.budgetUsd = "Minimum budget is $100";
      }
      if (formData.durationDays < 1) {
        nextErrors.durationDays = "Minimum duration is 1 day";
      }
      if (!formData.entryEndpoint) {
        nextErrors.entryEndpoint = "Every PromoPush needs a single Moment entry endpoint";
      }
    }

    if (step === 3) {
      if (!formData.geoLabel || formData.geoLabel.length < 3) {
        nextErrors.geoLabel = "Name the active distribution zone";
      }
      if (formData.geoRadiusMeters < 100) {
        nextErrors.geoRadiusMeters = "Geo radius must be at least 100 meters";
      }
      if (!formData.distributionStart || !formData.distributionEnd) {
        nextErrors.distributionWindow = "Set a start and end time for the live zone";
      }
      if (
        formData.distributionStart &&
        formData.distributionEnd &&
        formData.distributionStart >= formData.distributionEnd
      ) {
        nextErrors.distributionWindow = "Distribution end time must be after start time";
      }
      if (formData.categories.length === 0) {
        nextErrors.categories = "Select at least one category";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await createCampaign.mutateAsync({
        title: formData.title,
        description: formData.description,
        budget: formData.budgetUsd,
        reward_type: "points",
        reward_value: `${formData.payoutPerVerifiedPostJmd} JMD per verified post`,
        target_categories: formData.categories,
        start_date: formData.distributionStart,
        end_date: formData.distributionEnd,
        system_module: "promopush",
        moment_id: formData.momentId,
        objective_type: formData.goals[0] as "content" | "purchase" | "sampling" | "signup" | "attendance",
        geo_label: formData.geoLabel,
        geo_radius_meters: formData.geoRadiusMeters,
        distribution_starts_at: formData.distributionStart,
        distribution_ends_at: formData.distributionEnd,
        entry_mode: formData.entryMode,
        entry_endpoint: formData.entryEndpoint,
        distribution_channels: formData.channels,
        creator_reward_per_verified_action_jmd: formData.creatorRewardPerVerifiedActionJmd,
        payout_per_scan_signup_jmd: formData.payoutPerScanSignupJmd,
        payout_per_verified_post_jmd: formData.payoutPerVerifiedPostJmd,
        payout_per_purchase_proof_jmd: formData.payoutPerPurchaseProofJmd,
        compiler_metadata: {
          product: "PromoPush",
          participantFlow: ["click_or_scan", "join_moment", "execute_action", "submit_proof", "receive_reward"],
          categories: formData.categories,
          duration_days: formData.durationDays,
        },
      });

      navigate("/dashboard?tab=campaigns");
    } catch {
      return;
    }
  };

  const toggleArrayValue = (field: "goals" | "categories", value: string) => {
    const currentArray = formData[field];
    const nextArray = currentArray.includes(value)
      ? currentArray.filter((entry) => entry !== value)
      : [...currentArray, value];
    updateField(field, nextArray);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">PromoPush Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Friday Night Entry Burst"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="momentId">Moment ID *</Label>
              <Input
                id="momentId"
                value={formData.momentId}
                onChange={(e) => updateField("momentId", e.target.value)}
                placeholder="Paste the Moment ID this distribution should feed"
                className={errors.momentId ? "border-destructive" : ""}
              />
              {errors.momentId && <p className="mt-1 text-sm text-destructive">{errors.momentId}</p>}
            </div>

            <div>
              <Label htmlFor="description">Distribution Thesis *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the attention source, the Moment it routes into, and the single action users should complete."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
            </div>

            <div>
              <Label className="mb-3 block">Primary Objective *</Label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleArrayValue("goals", goal.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      formData.goals.includes(goal.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{goal.label}</p>
                  </button>
                ))}
              </div>
              {errors.goals && <p className="mt-1 text-sm text-destructive">{errors.goals}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="budgetUsd">Distribution Budget (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budgetUsd"
                  type="number"
                  min="100"
                  step="100"
                  value={formData.budgetUsd}
                  onChange={(e) => updateField("budgetUsd", parseFloat(e.target.value))}
                  className={`pl-10 ${errors.budgetUsd ? "border-destructive" : ""}`}
                />
              </div>
              {errors.budgetUsd && <p className="mt-1 text-sm text-destructive">{errors.budgetUsd}</p>}
            </div>

            <div>
              <Label htmlFor="durationDays">Duration (days) *</Label>
              <Input
                id="durationDays"
                type="number"
                min="1"
                max="365"
                value={formData.durationDays}
                onChange={(e) => updateField("durationDays", parseInt(e.target.value, 10))}
                className={errors.durationDays ? "border-destructive" : ""}
              />
              {errors.durationDays && <p className="mt-1 text-sm text-destructive">{errors.durationDays}</p>}
            </div>

            <div>
              <Label htmlFor="entryMode">Primary Entry Channel *</Label>
              <Select value={formData.entryMode} onValueChange={(value) => updateField("entryMode", value as CampaignFormData["entryMode"])}>
                <SelectTrigger id="entryMode">
                  <SelectValue placeholder="Select an entry mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moment_direct">Direct Moment Entry</SelectItem>
                  <SelectItem value="qr">QR Code</SelectItem>
                  <SelectItem value="ad_link">Ad Link</SelectItem>
                  <SelectItem value="direct_link">Direct Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entryEndpoint">Moment Entry Endpoint *</Label>
              <Input
                id="entryEndpoint"
                value={formData.entryEndpoint}
                onChange={(e) => updateField("entryEndpoint", e.target.value)}
                placeholder="/moments/{id} or deep link"
                className={errors.entryEndpoint ? "border-destructive" : ""}
              />
              {errors.entryEndpoint && <p className="mt-1 text-sm text-destructive">{errors.entryEndpoint}</p>}
              <p className="mt-1 text-sm text-muted-foreground">
                All ads, QR codes, and direct links should resolve to one Moment entry endpoint.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="payoutPerScanSignupJmd">Payout per Scan + Signup (JMD)</Label>
                <Input
                  id="payoutPerScanSignupJmd"
                  type="number"
                  min="0"
                  value={formData.payoutPerScanSignupJmd}
                  onChange={(e) => updateField("payoutPerScanSignupJmd", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="payoutPerVerifiedPostJmd">Payout per Verified Post (JMD)</Label>
                <Input
                  id="payoutPerVerifiedPostJmd"
                  type="number"
                  min="0"
                  value={formData.payoutPerVerifiedPostJmd}
                  onChange={(e) => updateField("payoutPerVerifiedPostJmd", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="payoutPerPurchaseProofJmd">Payout per Purchase Proof (JMD)</Label>
                <Input
                  id="payoutPerPurchaseProofJmd"
                  type="number"
                  min="0"
                  value={formData.payoutPerPurchaseProofJmd}
                  onChange={(e) => updateField("payoutPerPurchaseProofJmd", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="creatorRewardPerVerifiedActionJmd">Creator Reward per Verified Action (JMD)</Label>
                <Input
                  id="creatorRewardPerVerifiedActionJmd"
                  type="number"
                  min="0"
                  value={formData.creatorRewardPerVerifiedActionJmd}
                  onChange={(e) => updateField("creatorRewardPerVerifiedActionJmd", parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="geoLabel">Active Distribution Zone *</Label>
              <Input
                id="geoLabel"
                value={formData.geoLabel}
                onChange={(e) => updateField("geoLabel", e.target.value)}
                placeholder="e.g., 1km around Sabina Park"
                className={errors.geoLabel ? "border-destructive" : ""}
              />
              {errors.geoLabel && <p className="mt-1 text-sm text-destructive">{errors.geoLabel}</p>}
            </div>

            <div>
              <Label htmlFor="geoRadiusMeters">Geo Radius (meters) *</Label>
              <Input
                id="geoRadiusMeters"
                type="number"
                min="100"
                value={formData.geoRadiusMeters}
                onChange={(e) => updateField("geoRadiusMeters", parseInt(e.target.value, 10))}
                className={errors.geoRadiusMeters ? "border-destructive" : ""}
              />
              {errors.geoRadiusMeters && <p className="mt-1 text-sm text-destructive">{errors.geoRadiusMeters}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="distributionStart">Start Time *</Label>
                <Input
                  id="distributionStart"
                  type="datetime-local"
                  value={formData.distributionStart}
                  onChange={(e) => updateField("distributionStart", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="distributionEnd">End Time *</Label>
                <Input
                  id="distributionEnd"
                  type="datetime-local"
                  value={formData.distributionEnd}
                  onChange={(e) => updateField("distributionEnd", e.target.value)}
                />
              </div>
            </div>
            {errors.distributionWindow && <p className="-mt-2 text-sm text-destructive">{errors.distributionWindow}</p>}

            <div>
              <Label className="mb-3 block">Moment Categories *</Label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => toggleArrayValue("categories", category.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      formData.categories.includes(category.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{category.label}</p>
                  </button>
                ))}
              </div>
              {errors.categories && <p className="mt-1 text-sm text-destructive">{errors.categories}</p>}
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              PromoPush inside this zone should follow one path: click or scan, join the Moment, execute one action, submit proof, receive reward.
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-serif text-xl font-semibold">{formData.title}</h3>
              <p className="mb-4 text-muted-foreground">{formData.description}</p>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Moment</p>
                  <p className="break-all text-sm font-bold">{formData.momentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="text-lg font-bold">{formData.geoLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold">${formData.budgetUsd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Radius</p>
                  <p className="text-lg font-bold">{formData.geoRadiusMeters}m</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Objectives</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {formData.goals.map((goal) => (
                      <span key={goal} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                        {GOALS.find((entry) => entry.value === goal)?.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Entry Endpoint</p>
                  <p className="break-all text-sm text-muted-foreground">{formData.entryEndpoint}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
              This launches a PromoPush, not a generic campaign: one Moment, one entry endpoint, one geo-aware proof loop.
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="font-serif text-3xl font-bold text-foreground">Create PromoPush</h1>
        <p className="mt-2 text-muted-foreground">
          Build the geo-triggered input pipe that feeds a single Moment.
        </p>
      </div>

      <div className="mb-8">
        <CommercialProofLoop
          eyebrow="PromoPush Framing"
          title="Distribution should resolve into one Moment and one proof loop"
          action="Define the live Moment and the single action the participant should complete after entry."
          verification="Use geofence, QR, attendance, receipt, or media proof to verify the action happened."
          outcome="Track the commercial result as a closed loop: impression, entry, move, proof, reward."
          repeatability="If the zone, entry path, and reward model work once, they should scale into the next geo campaign."
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  currentStep >= step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-[60px] ${currentStep > step.id ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-xs ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6">{renderStepContent()}</div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button variant="hero" onClick={handleNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="hero" onClick={handleSubmit} disabled={createCampaign.isPending}>
            {createCampaign.isPending ? "Creating..." : "Launch PromoPush"}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;
