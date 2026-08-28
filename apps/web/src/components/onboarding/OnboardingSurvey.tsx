import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, MapPin, Heart, Clock, User, Gamepad2, Store, Users, PlayCircle, CheckCircle2, CircleDot, Briefcase, Bell, Smartphone } from "lucide-react";
import { useCreateUserPreferences, UserPreferencesInput } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { DeviceNotificationStep } from "./DeviceNotificationStep";
import type { TranslationKey } from "@/i18n/translations";

const CATEGORIES = [
  { value: "social", label: "Social Gatherings", emoji: "🎉" },
  { value: "food", label: "Food & Drink", emoji: "🍽️" },
  { value: "fitness", label: "Fitness & Wellness", emoji: "🧘" },
  { value: "music", label: "Music & Entertainment", emoji: "🎵" },
  { value: "arts", label: "Arts & Culture", emoji: "🎨" },
  { value: "outdoor", label: "Outdoor Adventures", emoji: "🏕️" },
  { value: "networking", label: "Networking", emoji: "🤝" },
  { value: "workshop", label: "Workshops & Learning", emoji: "📚" },
];

const LIFESTYLE_TAGS = [
  { value: "active", label: "Active Lifestyle", emoji: "⚡" },
  { value: "foodie", label: "Foodie", emoji: "🍕" },
  { value: "creative", label: "Creative Soul", emoji: "🎭" },
  { value: "social", label: "Social Butterfly", emoji: "🦋" },
  { value: "professional", label: "Career Focused", emoji: "💼" },
  { value: "mindful", label: "Mindful & Wellness", emoji: "🧘" },
  { value: "adventurous", label: "Adventure Seeker", emoji: "🏔️" },
  { value: "homebody", label: "Cozy Homebody", emoji: "🏠" },
];

const AGE_RANGES = [
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55+", label: "55+" },
];

const PREFERRED_TIMES = [
  { value: "morning", label: "Mornings", icon: "☀️" },
  { value: "afternoon", label: "Afternoons", icon: "🌤️" },
  { value: "evening", label: "Evenings", icon: "🌙" },
  { value: "weekend", label: "Weekends", icon: "🎉" },
];

interface OnboardingSurveyProps {
  onComplete: (persona?: string) => void;
}

const OnboardingSurvey = ({ onComplete }: OnboardingSurveyProps) => {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferencesInput>({
    preferred_categories: [],
    lifestyle_tags: [],
    age_range: null,
    preferred_times: [],
    city: "",
    state: "",
    location_sharing_enabled: false,
  });
  const [persona, setPersona] = useState<"explorer" | "creator" | "mayor" | "merchant" | "brand" | "agency" | null>(null);

  const { setActiveRole } = useAuth();
  const createPreferences = useCreateUserPreferences();

  const steps = [
    {
        title: t("onboarding.pathTitle"),
        subtitle: t("onboarding.pathSubtitle"),
        icon: <User className="w-6 h-6" />,
    },
    {
      title: t("onboarding.interestsTitle"),
      subtitle: t("onboarding.interestsSubtitle"),
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: t("onboarding.aboutTitle"),
      subtitle: t("onboarding.aboutSubtitle"),
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      title: t("onboarding.timeTitle"),
      subtitle: t("onboarding.timeSubtitle"),
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: t("onboarding.locationTitle"),
      subtitle: t("onboarding.locationSubtitle"),
      icon: <MapPin className="w-6 h-6" />,
    },
    {
      title: "Activate Alerts",
      subtitle: "Live door passes, nearby deals & Gem rewards",
      icon: <Bell className="w-6 h-6" />,
    },
  ];

  const roleGuides = {
    explorer: {
      nextTitle: t("guide.explorerTitle"),
      nextSubtitle: t("guide.explorerSubtitle"),
      checklist: [t("guide.explorer1"), t("guide.explorer2"), t("guide.explorer3")],
    },
    creator: {
      nextTitle: t("guide.creatorTitle"),
      nextSubtitle: t("guide.creatorSubtitle"),
      checklist: [t("guide.creator1"), t("guide.creator2"), t("guide.creator3")],
    },
    mayor: {
      nextTitle: t("guide.mayorTitle"),
      nextSubtitle: t("guide.mayorSubtitle"),
      checklist: [t("guide.mayor1"), t("guide.mayor2"), t("guide.mayor3")],
    },
    merchant: {
      nextTitle: t("guide.merchantTitle"),
      nextSubtitle: t("guide.merchantSubtitle"),
      checklist: [t("guide.merchant1"), t("guide.merchant2"), t("guide.merchant3")],
    },
    brand: {
      nextTitle: t("guide.brandTitle"),
      nextSubtitle: t("guide.brandSubtitle"),
      checklist: [t("guide.brand1"), t("guide.brand2"), t("guide.brand3")],
    },
    agency: {
      nextTitle: t("guide.agencyTitle"),
      nextSubtitle: t("guide.agencySubtitle"),
      checklist: [t("guide.agency1"), t("guide.agency2"), t("guide.agency3")],
    },
  } as const;

  const progress = ((step + 1) / steps.length) * 100;

  const toggleArrayItem = (key: keyof UserPreferencesInput, value: string) => {
    setPreferences((prev) => {
      const arr = (prev[key] as string[]) || [];
      const newArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...prev, [key]: newArr };
    });
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      if (step === 0 && persona === "agency") {
          setStep(4); 
      } else if (step === 4) {
        try {
          await createPreferences.mutateAsync(preferences);
        } catch {
          // ignore save error
        }
        setStep(5);
      } else {
        setStep(step + 1);
      }
    } else {
      try {
        await createPreferences.mutateAsync(preferences);
      } catch {
        // ignore save error
      }
      onComplete(persona || undefined);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return persona !== null;
      case 1:
        return (preferences.preferred_categories?.length ?? 0) > 0;
      case 2:
        return (preferences.lifestyle_tags?.length ?? 0) > 0;
      case 3:
        return (preferences.preferred_times?.length ?? 0) > 0;
      case 4:
        return true; // Location is optional
      default:
        return false;
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPreferences((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location_sharing_enabled: true,
          }));
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  };

  return (
    <div className="onboarding-mobile min-h-screen min-h-dvh bg-[#f3efe6] flex items-start justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 text-[#171512] sm:items-center sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-5 sm:mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#171512]/10 rounded-[1.4rem] p-5 shadow-[0_18px_50px_rgba(46,31,17,.1)] sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-left mb-6 sm:text-center sm:mb-8">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary sm:mx-auto sm:h-14 sm:w-14">
                  {steps[step].icon}
                </div>
                <h1 className="font-serif text-[2rem] leading-none md:text-3xl font-black mb-2">
                  {steps[step].title}
                </h1>
                <p className="text-muted-foreground">{steps[step].subtitle}</p>
              </div>

              {/* Step Content */}
              {step === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => {
                            setPersona("explorer");
                            setActiveRole("participant");
                        }}
                        className={`p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] flex items-center gap-6 text-left ${
                            persona === "explorer"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                            <Gamepad2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("onboarding.explorer")}</h3>
                            <p className="text-sm text-muted-foreground">{t("persona.explorerDesc")}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                            setPersona("creator");
                            setActiveRole("creator");
                        }}
                        className={`p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] flex items-center gap-6 text-left ${
                            persona === "creator"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-600 shrink-0">
                            <PlayCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("onboarding.creator")}</h3>
                            <p className="text-sm text-muted-foreground">{t("persona.creatorDesc")}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                            setPersona("mayor");
                            setActiveRole("host");
                        }}
                        className={`p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] flex items-center gap-6 text-left ${
                            persona === "mayor"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("onboarding.mayor")}</h3>
                            <p className="text-sm text-muted-foreground">{t("persona.mayorDesc")}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                            setPersona("merchant");
                            setActiveRole("merchant");
                        }}
                        className={`p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] flex items-center gap-6 text-left ${
                            persona === "merchant"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("onboarding.merchant")}</h3>
                            <p className="text-sm text-muted-foreground">{t("persona.merchantDesc")}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                            setPersona("brand");
                            setActiveRole("brand");
                        }}
                        className={`p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] flex items-center gap-6 text-left ${
                            persona === "brand"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("onboarding.brand")}</h3>
                            <p className="text-sm text-muted-foreground">{t("persona.brandDesc")}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                            setPersona("agency");
                            setActiveRole("brand");
                        }}
                        className={`p-6 rounded-2xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] flex items-center gap-6 text-left ${
                            persona === "agency"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        <div className="h-16 w-16 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("onboarding.agency")}</h3>
                            <p className="text-sm text-muted-foreground">{t("persona.agencyDesc")}</p>
                        </div>
                      </button>
                    </div>

                    {persona && (
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CircleDot className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/80">{t("onboarding.firstPlan")}</p>
                            <h3 className="mt-2 font-serif text-xl font-bold text-foreground">
                              {roleGuides[persona].nextTitle}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {roleGuides[persona].nextSubtitle}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          {roleGuides[persona].checklist.map((item, index) => (
                            <div key={item} className="rounded-xl border border-border/60 bg-background/80 p-3">
                              <div className="mb-2 flex items-center gap-2 text-primary">
                                {index === 0 ? <CircleDot className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 opacity-60" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                                  {index === 0 ? t("onboarding.startHere") : t("onboarding.then")}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => toggleArrayItem("preferred_categories", category.value)}
                      className={`p-4 rounded-xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] text-center ${
                        preferences.preferred_categories?.includes(category.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <span className="text-2xl block mb-2">{category.emoji}</span>
                      <span className="text-sm font-medium">{t(`category.${category.value}` as TranslationKey)}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Lifestyle Tags */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      {t("onboarding.describe")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {LIFESTYLE_TAGS.map((tag) => (
                        <button
                          key={tag.value}
                          onClick={() => toggleArrayItem("lifestyle_tags", tag.value)}
                          className={`p-3 rounded-xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] text-center ${
                            preferences.lifestyle_tags?.includes(tag.value)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          <span className="text-xl block mb-1">{tag.emoji}</span>
                          <span className="text-xs font-medium">{t(`lifestyle.${tag.value}` as TranslationKey)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      {t("onboarding.age")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_RANGES.map((age) => (
                        <button
                          key={age.value}
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              age_range: prev.age_range === age.value ? null : age.value,
                            }))
                          }
                          className={`px-4 py-2 rounded-full border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                            preferences.age_range === age.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  {PREFERRED_TIMES.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => toggleArrayItem("preferred_times", time.value)}
                      className={`p-6 rounded-xl border-2 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] text-center ${
                        preferences.preferred_times?.includes(time.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <span className="text-3xl block mb-2">{time.icon}</span>
                      <span className="font-medium">{t(`time.${time.value}` as TranslationKey)}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  {/* Location sharing */}
                  <div className="text-center">
                    <Button
                      variant={preferences.location_sharing_enabled ? "default" : "outline"}
                      size="lg"
                      onClick={requestLocation}
                      className="mb-4"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {preferences.location_sharing_enabled
                        ? t("onboarding.locationEnabled")
                        : t("onboarding.enableLocation")}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {t("onboarding.manualLocation")}
                    </p>
                  </div>

                  {/* Manual city/state */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("onboarding.city")}</label>
                      <input
                        type="text"
                        placeholder="e.g., Austin"
                        value={preferences.city || ""}
                        onChange={(e) =>
                          setPreferences((prev) => ({ ...prev, city: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("onboarding.state")}</label>
                      <input
                        type="text"
                        placeholder="e.g., TX"
                        value={preferences.state || ""}
                        onChange={(e) =>
                          setPreferences((prev) => ({ ...prev, state: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Device Notification & QR Bridge */}
              {step === 5 && (
                <DeviceNotificationStep
                  onComplete={() => onComplete(persona || undefined)}
                  personaChoice={persona || undefined}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation (Only show for steps 0 to 4) */}
          {step < 5 && (
            <div className="sticky bottom-0 -mx-5 mt-8 flex justify-between border-t border-[#171512]/10 bg-white/95 px-5 pb-1 pt-4 backdrop-blur sm:static sm:mx-0 sm:mt-10 sm:border-0 sm:bg-transparent sm:p-0">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                className={step === 0 ? "invisible" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("onboarding.back")}
              </Button>

              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!canProceed() || createPreferences.isPending}
              >
                {step === 4 ? (
                  createPreferences.isPending ? (
                    t("onboarding.saving")
                  ) : (
                    <>
                      <span>Continue to Alerts</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )
                ) : (
                  <>
                    {t("onboarding.next")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {t("onboarding.skip")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;
