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
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const CATEGORIES: { value: string; labelKey: TranslationKey }[] = [
  { value: "social", labelKey: "brandCreate.catSocial" },
  { value: "fitness", labelKey: "brandCreate.catFitness" },
  { value: "food", labelKey: "brandCreate.catFood" },
  { value: "music", labelKey: "brandCreate.catMusic" },
  { value: "networking", labelKey: "brandCreate.catNetwork" },
  { value: "outdoor", labelKey: "brandCreate.catOutdoor" },
  { value: "arts", labelKey: "brandCreate.catArts" },
];

const GOALS: { value: string; labelKey: TranslationKey }[] = [
  { value: "content", labelKey: "brandCreate.goalContent" },
  { value: "purchase", labelKey: "brandCreate.goalPurchase" },
  { value: "sampling", labelKey: "brandCreate.goalSampling" },
  { value: "signup", labelKey: "brandCreate.goalSignup" },
  { value: "attendance", labelKey: "brandCreate.goalAttendance" },
];

const steps: { id: number; titleKey: TranslationKey; icon: typeof Target }[] = [
  { id: 1, titleKey: "brandCreate.stepLink", icon: Target },
  { id: 2, titleKey: "brandCreate.stepBudget", icon: DollarSign },
  { id: 3, titleKey: "brandCreate.stepZone", icon: Users },
  { id: 4, titleKey: "brandCreate.stepReview", icon: Check },
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
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, TranslationKey>>({});

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
    const nextErrors: Record<string, TranslationKey> = {};

    if (step === 1) {
      if (!formData.title || formData.title.length < 5) {
        nextErrors.title = "brandCreate.errTitle";
      }
      if (!formData.momentId || formData.momentId.length < 10) {
        nextErrors.momentId = "brandCreate.errMoment";
      }
      if (!formData.description || formData.description.length < 20) {
        nextErrors.description = "brandCreate.errDesc";
      }
      if (formData.goals.length === 0) {
        nextErrors.goals = "brandCreate.errGoals";
      }
    }

    if (step === 2) {
      if (formData.budgetUsd < 100) {
        nextErrors.budgetUsd = "brandCreate.errBudget";
      }
      if (formData.durationDays < 1) {
        nextErrors.durationDays = "brandCreate.errDuration";
      }
      if (!formData.entryEndpoint) {
        nextErrors.entryEndpoint = "brandCreate.errEndpoint";
      }
    }

    if (step === 3) {
      if (!formData.geoLabel || formData.geoLabel.length < 3) {
        nextErrors.geoLabel = "brandCreate.errZone";
      }
      if (formData.geoRadiusMeters < 100) {
        nextErrors.geoRadiusMeters = "brandCreate.errRadius";
      }
      if (!formData.distributionStart || !formData.distributionEnd) {
        nextErrors.distributionWindow = "brandCreate.errWindow";
      }
      if (
        formData.distributionStart &&
        formData.distributionEnd &&
        formData.distributionStart >= formData.distributionEnd
      ) {
        nextErrors.distributionWindow = "brandCreate.errWindowOrder";
      }
      if (formData.categories.length === 0) {
        nextErrors.categories = "brandCreate.errCats";
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
        budget: null,
        reward_type: "gems",
        reward_value: `${formData.payoutPerVerifiedPostJmd} Gems proposed per verified post`,
        is_active: false,
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
          planned_budget_gems: formData.budgetUsd,
          planned_reward_per_verified_post_gems: formData.payoutPerVerifiedPostJmd,
          value_unit: "GEM",
          funding_status: "unfunded",
          activation_status: "draft",
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
              <Label htmlFor="title">{t("brandCreate.name")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={t("brandCreate.namePh")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="mt-1 text-sm text-destructive">{t(errors.title)}</p>}
            </div>

            <div>
              <Label htmlFor="momentId">{t("brandCreate.momentId")}</Label>
              <Input
                id="momentId"
                value={formData.momentId}
                onChange={(e) => updateField("momentId", e.target.value)}
                placeholder={t("brandCreate.momentIdPh")}
                className={errors.momentId ? "border-destructive" : ""}
              />
              {errors.momentId && <p className="mt-1 text-sm text-destructive">{t(errors.momentId)}</p>}
            </div>

            <div>
              <Label htmlFor="description">{t("brandCreate.thesis")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder={t("brandCreate.thesisPh")}
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="mt-1 text-sm text-destructive">{t(errors.description)}</p>}
            </div>

            <div>
              <Label className="mb-3 block">{t("brandCreate.objective")}</Label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleArrayValue("goals", goal.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                      formData.goals.includes(goal.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{t(goal.labelKey)}</p>
                  </button>
                ))}
              </div>
              {errors.goals && <p className="mt-1 text-sm text-destructive">{t(errors.goals)}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="budgetUsd">{t("brandCreate.budget")}</Label>
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
              {errors.budgetUsd && <p className="mt-1 text-sm text-destructive">{t(errors.budgetUsd)}</p>}
            </div>

            <div>
              <Label htmlFor="durationDays">{t("brandCreate.duration")}</Label>
              <Input
                id="durationDays"
                type="number"
                min="1"
                max="365"
                value={formData.durationDays}
                onChange={(e) => updateField("durationDays", parseInt(e.target.value, 10))}
                className={errors.durationDays ? "border-destructive" : ""}
              />
              {errors.durationDays && <p className="mt-1 text-sm text-destructive">{t(errors.durationDays)}</p>}
            </div>

            <div>
              <Label htmlFor="entryMode">{t("brandCreate.entryChannel")}</Label>
              <Select value={formData.entryMode} onValueChange={(value) => updateField("entryMode", value as CampaignFormData["entryMode"])}>
                <SelectTrigger id="entryMode">
                  <SelectValue placeholder={t("brandCreate.entryPh")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moment_direct">{t("brandCreate.entryMoment")}</SelectItem>
                  <SelectItem value="qr">{t("brandCreate.entryQr")}</SelectItem>
                  <SelectItem value="ad_link">{t("brandCreate.entryAd")}</SelectItem>
                  <SelectItem value="direct_link">{t("brandCreate.entryLink")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entryEndpoint">{t("brandCreate.endpoint")}</Label>
              <Input
                id="entryEndpoint"
                value={formData.entryEndpoint}
                onChange={(e) => updateField("entryEndpoint", e.target.value)}
                placeholder={t("brandCreate.endpointPh")}
                className={errors.entryEndpoint ? "border-destructive" : ""}
              />
              {errors.entryEndpoint && <p className="mt-1 text-sm text-destructive">{t(errors.entryEndpoint)}</p>}
              <p className="mt-1 text-sm text-muted-foreground">
                {t("brandCreate.endpointHint")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="payoutPerScanSignupJmd">{t("brandCreate.payoutScan")}</Label>
                <Input
                  id="payoutPerScanSignupJmd"
                  type="number"
                  min="0"
                  value={formData.payoutPerScanSignupJmd}
                  onChange={(e) => updateField("payoutPerScanSignupJmd", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="payoutPerVerifiedPostJmd">{t("brandCreate.payoutPost")}</Label>
                <Input
                  id="payoutPerVerifiedPostJmd"
                  type="number"
                  min="0"
                  value={formData.payoutPerVerifiedPostJmd}
                  onChange={(e) => updateField("payoutPerVerifiedPostJmd", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="payoutPerPurchaseProofJmd">{t("brandCreate.payoutPurchase")}</Label>
                <Input
                  id="payoutPerPurchaseProofJmd"
                  type="number"
                  min="0"
                  value={formData.payoutPerPurchaseProofJmd}
                  onChange={(e) => updateField("payoutPerPurchaseProofJmd", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="creatorRewardPerVerifiedActionJmd">{t("brandCreate.payoutCreator")}</Label>
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
              <Label htmlFor="geoLabel">{t("brandCreate.zone")}</Label>
              <Input
                id="geoLabel"
                value={formData.geoLabel}
                onChange={(e) => updateField("geoLabel", e.target.value)}
                placeholder={t("brandCreate.zonePh")}
                className={errors.geoLabel ? "border-destructive" : ""}
              />
              {errors.geoLabel && <p className="mt-1 text-sm text-destructive">{t(errors.geoLabel)}</p>}
            </div>

            <div>
              <Label htmlFor="geoRadiusMeters">{t("brandCreate.radius")}</Label>
              <Input
                id="geoRadiusMeters"
                type="number"
                min="100"
                value={formData.geoRadiusMeters}
                onChange={(e) => updateField("geoRadiusMeters", parseInt(e.target.value, 10))}
                className={errors.geoRadiusMeters ? "border-destructive" : ""}
              />
              {errors.geoRadiusMeters && <p className="mt-1 text-sm text-destructive">{t(errors.geoRadiusMeters)}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="distributionStart">{t("brandCreate.start")}</Label>
                <Input
                  id="distributionStart"
                  type="datetime-local"
                  value={formData.distributionStart}
                  onChange={(e) => updateField("distributionStart", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="distributionEnd">{t("brandCreate.end")}</Label>
                <Input
                  id="distributionEnd"
                  type="datetime-local"
                  value={formData.distributionEnd}
                  onChange={(e) => updateField("distributionEnd", e.target.value)}
                />
              </div>
            </div>
            {errors.distributionWindow && <p className="-mt-2 text-sm text-destructive">{t(errors.distributionWindow)}</p>}

            <div>
              <Label className="mb-3 block">{t("brandCreate.cats")}</Label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => toggleArrayValue("categories", category.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                      formData.categories.includes(category.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-sm font-medium">{t(category.labelKey)}</p>
                  </button>
                ))}
              </div>
              {errors.categories && <p className="mt-1 text-sm text-destructive">{t(errors.categories)}</p>}
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              {t("brandCreate.pathHint")}
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
                  <p className="text-sm text-muted-foreground">{t("brandCreate.reviewMoment")}</p>
                  <p className="break-all text-sm font-bold">{formData.momentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("brandCreate.reviewZone")}</p>
                  <p className="text-lg font-bold">{formData.geoLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("brandCreate.reviewBudget")}</p>
                  <p className="text-lg font-bold">${formData.budgetUsd.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("brandCreate.reviewRadiusLabel")}</p>
                  <p className="text-lg font-bold">{t("brandCreate.reviewRadius", { meters: formData.geoRadiusMeters })}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{t("brandCreate.reviewObjectives")}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {formData.goals.map((goal) => {
                      const match = GOALS.find((entry) => entry.value === goal);
                      return (
                        <span key={goal} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                          {match ? t(match.labelKey) : goal}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">{t("brandCreate.reviewEndpoint")}</p>
                  <p className="break-all text-sm text-muted-foreground">{formData.entryEndpoint}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
              {t("brandCreate.reviewNote")}
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 text-white/70 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("brandCreate.backDash")}
        </Button>

        {/* Unified Hero Container */}
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-[#1F140E] via-[#0D0D0E] to-[#120B07] p-6 sm:p-10 shadow-2xl text-white">
          <div className="flex items-center space-x-2 bg-primary/20 border border-primary/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary w-fit mb-4">
            <Target className="w-4 h-4" />
            <span>{t("brandCreate.badge")}</span>
          </div>

          <h1 className="max-w-4xl font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95]">
            {t("brandCreate.titleLead")} <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">{t("brandCreate.titleAccent")}</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/75">
            {t("brandCreate.lede")}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-primary/90">
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">📸 {t("brandCreate.chipStory")}</span>
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">📊 {t("brandCreate.chipActions")}</span>
            <span className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-1">🎯 {t("brandCreate.chipBudget")}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <CommercialProofLoop
          eyebrow={t("brandCreate.proofEyebrow")}
          title={t("brandCreate.proofTitle")}
          action={t("brandCreate.proofAction")}
          verification={t("brandCreate.proofVerification")}
          outcome={t("brandCreate.proofOutcome")}
          repeatability={t("brandCreate.proofRepeat")}
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
              {t(step.titleKey)}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6">{renderStepContent()}</div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("brandCreate.back")}
        </Button>

        {currentStep < 4 ? (
          <Button variant="hero" onClick={handleNext}>
            {t("brandCreate.continue")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="hero" onClick={handleSubmit} disabled={createCampaign.isPending}>
            {createCampaign.isPending ? t("brandCreate.creating") : t("brandCreate.launch")}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateCampaign;
