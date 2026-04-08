import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, MapPin, Heart, Clock } from "lucide-react";
import { useCreateUserPreferences, UserPreferencesInput } from "@/hooks/useUserPreferences";

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

  const createPreferences = useCreateUserPreferences();

  const steps = [
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
      setStep(step + 1);
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
        return (preferences.preferred_categories?.length ?? 0) > 0;
      case 1:
        return (preferences.lifestyle_tags?.length ?? 0) > 0;
      case 2:
        return (preferences.preferred_times?.length ?? 0) > 0;
      case 3:
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => toggleArrayItem("preferred_categories", category.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
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

              {step === 1 && (
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
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
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
                          className={`px-4 py-2 rounded-full border-2 transition-all ${
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

              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {PREFERRED_TIMES.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => toggleArrayItem("preferred_times", time.value)}
                      className={`p-6 rounded-xl border-2 transition-all text-center ${
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

              {step === 3 && (
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
