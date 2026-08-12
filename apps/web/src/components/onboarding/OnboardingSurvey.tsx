import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, MapPin, Heart, Clock, User, Gamepad2, Store, Users, PlayCircle, CheckCircle2, CircleDot, Briefcase } from "lucide-react";
import { useCreateUserPreferences, UserPreferencesInput } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";

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
  onComplete: () => void;
}

const OnboardingSurvey = ({ onComplete }: OnboardingSurveyProps) => {
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
        title: "Choose Your Path",
        subtitle: "How will you use Promorang?",
        icon: <User className="w-6 h-6" />,
    },
    {
      title: "What moments interest you?",
      subtitle: "Select categories you'd like to explore",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "Tell us about yourself",
      subtitle: "Help us personalize your experience",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      title: "When do you like to connect?",
      subtitle: "Choose your preferred times for moments",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "Where are you located?",
      subtitle: "Find moments near you",
      icon: <MapPin className="w-6 h-6" />,
    },
  ];

  const roleGuides = {
    explorer: {
      nextTitle: "You’ll start as a participant.",
      nextSubtitle: "First join a moment, then check in, then open your vault for the first memory.",
      checklist: ["Join your first moment", "Check in on location", "Unlock your first memory"],
    },
    creator: {
      nextTitle: "You’ll start as a creator.",
      nextSubtitle: "Publish one story, link it to one mission, then watch for the first real conversion.",
      checklist: ["Publish your first content drop", "Attach it to a real mission", "View your first conversion"],
    },
    mayor: {
      nextTitle: "You’ll start as a host.",
      nextSubtitle: "Create a moment, monitor whether it is forming, then review proof so the loop closes.",
      checklist: ["Create your first moment", "Monitor pulse formation", "Review your first proof"],
    },
    merchant: {
      nextTitle: "You’ll start as a merchant.",
      nextSubtitle: "Register one place, make it ready for moments or offers, then validate the first visit that comes through the door.",
      checklist: ["Register your first venue", "Enable a moment or offer", "Validate the first check-in"],
    },
    brand: {
      nextTitle: "You’ll start as a brand.",
      nextSubtitle: "Fund one clear action, connect the right creators or places, then read the proof before you scale.",
      checklist: ["Create your first campaign", "Connect creators or venues", "Review the first outcome"],
    },
    agency: {
      nextTitle: "You’ll start as an agency operator.",
      nextSubtitle: "Connect the first client, launch the first activation, then report the first outcome.",
      checklist: ["Add your first client", "Launch your first activation", "Review the first impact result"],
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
          // Agencies go straight to city/location or direct to dashboard? 
          // Let's at least get their location then finish.
          setStep(4); 
      } else {
        setStep(step + 1);
      }
    } else {
      // Complete onboarding
      await createPreferences.mutateAsync(preferences);
      onComplete();
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-elevated">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {steps[step].icon}
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">
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
                            <h3 className="font-bold text-lg">The Explorer</h3>
                            <p className="text-sm text-muted-foreground">Find gatherings, retail drops, service rituals, and local unlocks that turn everyday movement into rewards.</p>
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
                            <h3 className="font-bold text-lg">The Creator</h3>
                            <p className="text-sm text-muted-foreground">Publish story-led missions for stores, salons, studios, cafes, and local spaces, then earn from verified movement.</p>
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
                            <h3 className="font-bold text-lg">The Mayor</h3>
                            <p className="text-sm text-muted-foreground">Own your local niche. Run gatherings, drops, rituals, and founder moments that make places feel alive.</p>
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
                            <h3 className="font-bold text-lg">The Merchant</h3>
                            <p className="text-sm text-muted-foreground">Bring verified visits, redemptions, and repeat movement into a real place people already care about.</p>
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
                            <h3 className="font-bold text-lg">The Brand</h3>
                            <p className="text-sm text-muted-foreground">Fund moments, creator missions, and local offers that people can join, prove, remember, and return from.</p>
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
                            <h3 className="font-bold text-lg">The Agency</h3>
                            <p className="text-sm text-muted-foreground">Manage client ROI across retail, grocery, service, and creator-driven campaigns with verified real-world outcomes.</p>
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
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/80">First Session Plan</p>
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
                                  {index === 0 ? "Start here" : "Then"}
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
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Lifestyle Tags */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      What describes you?
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
                          <span className="text-xs font-medium">{tag.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Age range (optional)
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
                      <span className="font-medium">{time.label}</span>
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
                        ? "Location enabled ✓"
                        : "Enable location"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Or enter your city manually below
                    </p>
                  </div>

                  {/* Manual city/state */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">City</label>
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
                      <label className="text-sm font-medium mb-2 block">State</label>
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
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className={step === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed() || createPreferences.isPending}
            >
              {step === steps.length - 1 ? (
                createPreferences.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    Get Started
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;
