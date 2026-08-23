import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
import {
  User,
  MapPin,
  FileText,
  Camera,
  Save,
  Loader2,
  Trash2,
  CreditCard,
  Bell,
  Shield,
  Sparkles,
  Compass,
  Check,
  ArrowRight,
  LockKeyhole,
  Smartphone,
  Send
} from "lucide-react";
import { z } from "zod";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { GuidanceDensity, useGuidancePreferences } from "@/hooks/useGuidancePreferences";
import { cultureImages } from "@/data/culture-demo";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

const discoveryCategories = ["Music", "Food", "Nightlife", "Fitness", "Arts", "Fashion", "Wellness", "Community"];
const preferredTimes = ["Weekday mornings", "Weekday evenings", "Friday nights", "Weekends"];
const guidanceDensityOptions: Array<{ value: GuidanceDensity; label: string; description: string }> = [
  { value: "guided", label: "Guided", description: "Open guides the first time you visit a feature." },
  { value: "compact", label: "Compact", description: "Collapse guides by default, with short context visible." },
  { value: "minimal", label: "Minimal", description: "Keep guidance behind a small guide button." },
];

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Settings = () => {
  const { t, formatNumber } = useI18n();
  const categoryLabels: Record<string, string> = { Music: t("settings.catMusic"), Food: t("settings.catFood"), Nightlife: t("settings.catNightlife"), Fitness: t("settings.catFitness"), Arts: t("settings.catArts"), Fashion: t("settings.catFashion"), Wellness: t("settings.catWellness"), Community: t("settings.catCommunity") };
  const timeLabels: Record<string, string> = { "Weekday mornings": t("settings.timeMornings"), "Weekday evenings": t("settings.timeEvenings"), "Friday nights": t("settings.timeFriday"), Weekends: t("settings.timeWeekends") };
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const { density: guidanceDensity, setDensity: setGuidanceDensity } = useGuidancePreferences();
  const pushState = usePushNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [locationSharing, setLocationSharing] = useState(false);

  // Profile Form Data
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    bio: "",
    location: "",
  });

  // Payout Form Data
  const [payoutInfo, setPayoutInfo] = useState<string>("");

  // Notification toggles
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    marketing: false,
    security: true,
    moment_updates: true,
    payouts: true,
    low_stock: true,
    budget_alerts: true
  });

  const primaryRole = roles[0] || "participant";
  const completionItems = [
    Boolean(avatarUrl),
    Boolean(formData.fullName?.trim()),
    Boolean(formData.location?.trim()),
    Boolean(formData.bio?.trim()),
    selectedCategories.length > 0,
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  useEffect(() => {
    if (!preferences) return;
    setSelectedCategories(preferences.preferred_categories || []);
    setSelectedTimes(preferences.preferred_times || []);
    setLocationSharing(preferences.location_sharing_enabled || false);
  }, [preferences]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotificationPreferences();
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.preferences) {
        setNotifications(data.preferences as Record<string, boolean>);
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    }
  };

  const updateNotificationPreference = async (key: string, value: boolean) => {
    if (!user) return;
    const newPrefs = { ...notifications, [key]: value };
    setNotifications(newPrefs);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPrefs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: t("settings.saved"),
        description: t("settings.savedCopy"),
      });
    } catch (error: any) {
      console.error("Error saving notification preference:", error);
      toast({
        title: t("settings.saveError"),
        description: error.message,
        variant: "destructive",
      });
      // Revert on error
      setNotifications(notifications);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          fullName: data.display_name || data.full_name || user.user_metadata?.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
        });
        setAvatarUrl(data.avatar_url);
        // Note: Payout info would ideally be in a separate 'merchant_profiles' table or similar
        // For now we just keep it in state or would save it to a jsonb column if we had one.
        // Assuming we might have a column 'payment_instructions' in profiles in the future.
      } else {
        setFormData({
          fullName: user.user_metadata?.full_name || "",
          bio: "",
          location: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      profileSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleAvatarSelect = async (file: File) => {
    if (!user) return;

    const url = await uploadImage(file, "avatars", user.id);
    if (url) {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            avatar_url: url,
            full_name: formData.fullName || user.user_metadata?.full_name || null,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        toast({
          title: "Photo uploaded, but not saved",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAvatarUrl(url);
      toast({
        title: "Avatar updated! 📸",
        description: "Your profile photo has been saved.",
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setSaving(true);

    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.fullName,
            bio: formData.bio || null,
            location: formData.location || null,
          })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert({
          user_id: user.id,
          full_name: formData.fullName,
          bio: formData.bio || null,
          location: formData.location || null,
        });
        if (error) throw error;
      }

      toast({
        title: t("settings.profileSaved"),
        description: t("settings.profileSavedCopy"),
      });
    } catch (error: any) {
      toast({
        title: t("settings.profileError"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Mock saving payout info
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t("settings.paymentSaved"),
      description: t("settings.paymentSavedCopy"),
    });
    setSaving(false);
  }

  const toggleChoice = (value: string, current: string[], setter: (values: string[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const handlePreferenceSubmit = async () => {
    await updatePreferences.mutateAsync({
      preferred_categories: selectedCategories,
      preferred_times: selectedTimes,
      location_sharing_enabled: locationSharing,
      city: formData.location || preferences?.city || null,
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      await supabase.from("profiles").delete().eq("user_id", user.id);
      await supabase.from("user_roles").delete().eq("user_id", user.id);
      await supabase.from("moment_participants").delete().eq("user_id", user.id);
      await supabase.from("check_ins").delete().eq("user_id", user.id);
      await supabase.from("notifications").delete().eq("user_id", user.id);

      await signOut();
      toast({
        title: t("settings.accountDeleted"),
        description: t("settings.accountDeletedCopy"),
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: t("settings.accountDeleteError"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#090909] pb-20 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <img src={cultureImages.streetArt} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
        <div className="relative mx-auto grid min-h-[330px] max-w-6xl items-end gap-8 px-5 pb-10 pt-20 sm:px-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {t("settings.eyebrow")}
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">{t("settings.title")}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55">{t("settings.copy")}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/55 p-5 backdrop-blur">
            <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">{t("settings.signal")}</p><p className="mt-2 text-3xl font-black">{completion}%</p></div><span className="text-xs text-white/40">{t("settings.complete", { count: completionItems.filter(Boolean).length })}</span></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-orange-500 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]" style={{ width: `${completion}%` }} /></div>
            <p className="mt-4 text-xs leading-5 text-white/45">{completion === 100 ? t("settings.strong") : t("settings.missing")}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="profile" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
          <div className="overflow-x-auto pb-2">
          <TabsList className="mb-8 h-auto min-w-max justify-start gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
            <TabsTrigger value="profile">{t("settings.identity")}</TabsTrigger>
            <TabsTrigger value="preferences">{t("settings.discovery")}</TabsTrigger>
            <TabsTrigger value="access-rank">{t("settings.status")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("settings.notifications")}</TabsTrigger>
            <TabsTrigger value="payouts">{t("settings.payouts")}</TabsTrigger>
            <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
          </TabsList>
          </div>

          {/* --- PROFILE TAB --- */}
          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-2xl">
              {/* Avatar Section */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  {t("settings.photo")}
                </h2>
                <div className="flex items-center gap-6">
                  <AvatarUpload
                    value={avatarUrl}
                    fallback={formData.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                    onChange={(url) => setAvatarUrl(url)}
                    onFileSelect={handleAvatarSelect}
                    uploading={uploading}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {formData.fullName || user.email?.split("@")[0]}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("settings.photoHelp")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t("settings.basic")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">{t("settings.fullName")}</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder={t("settings.fullNamePlaceholder")}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {t("settings.location")}
                </h2>
                <div>
                  <Label htmlFor="location">{t("settings.region")}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder={t("settings.regionPlaceholder")}
                    className={errors.location ? "border-destructive" : ""}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t("settings.about")}
                </h2>
                <div>
                  <Label htmlFor="bio">{t("settings.bio")}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder={t("settings.bioPlaceholder")}
                    rows={4}
                    className={errors.bio ? "border-destructive" : ""}
                  />
                  <p className="text-muted-foreground text-sm mt-1">
                    {t("settings.characters", { count: formatNumber(formData.bio?.length || 0) })}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="hero" size="lg" disabled={saving || uploading}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("settings.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t("settings.saveProfile")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="grid max-w-4xl gap-5 lg:grid-cols-[1fr_300px]">
              <div className="rounded-lg border border-white/10 bg-[#111] p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">{t("settings.tune")}</p>
                <h2 className="mt-3 text-2xl font-black">{t("settings.feedTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">{t("settings.feedCopy")}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {discoveryCategories.map((category) => {
                    const active = selectedCategories.includes(category);
                    return <button type="button" key={category} onClick={() => toggleChoice(category, selectedCategories, setSelectedCategories)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-orange-500 bg-orange-500 text-black" : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"}`}>{active && <Check className="mr-1.5 inline h-3.5 w-3.5" />}{categoryLabels[category]}</button>;
                  })}
                </div>
                <div className="mt-9 border-t border-white/10 pt-7">
                  <h3 className="font-bold">{t("settings.when")}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {preferredTimes.map((time) => <button type="button" key={time} onClick={() => toggleChoice(time, selectedTimes, setSelectedTimes)} className={`rounded-md border px-3 py-2 text-sm transition ${selectedTimes.includes(time) ? "border-orange-500/60 bg-orange-500/15 text-orange-300" : "border-white/10 text-white/55 hover:bg-white/[0.05]"}`}>{timeLabels[time]}</button>)}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between gap-5 rounded-lg border border-white/10 bg-black/40 p-4">
                  <div><p className="font-semibold">{t("settings.nearby")}</p><p className="mt-1 text-xs leading-5 text-white/40">{t("settings.nearbyCopy")}</p></div>
                  <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                </div>
                <Button onClick={handlePreferenceSubmit} disabled={updatePreferences.isPending || selectedCategories.length === 0} className="mt-7 bg-orange-500 font-bold text-black hover:bg-orange-400">
                  {updatePreferences.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {t("settings.saveDiscovery")}
                </Button>
              </div>
              <aside className="rounded-lg border border-orange-500/25 bg-gradient-to-b from-orange-500/10 to-transparent p-6">
                <Compass className="h-7 w-7 text-orange-400" />
                <h3 className="mt-8 text-xl font-black">{t("settings.discoveryEffect")}</h3>
                <div className="mt-6 space-y-5 text-sm text-white/50">
                  <p>{t("settings.discoveryEffect1")}</p><p>{t("settings.discoveryEffect2")}</p><p>{t("settings.discoveryEffect3")}</p>
                </div>
                <Link to="/discover" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-orange-400">{t("settings.seeDiscovery")} <ArrowRight className="h-4 w-4" /></Link>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="access-rank">
            <div className="grid max-w-4xl gap-5 md:grid-cols-[1fr_320px]">
              <div className="rounded-lg border border-white/10 bg-[#111] p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">{t("settings.standing")}</p>
                <h2 className="mt-3 text-3xl font-black">{t("settings.statusTitle")}</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">{t("settings.statusCopy")}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">{[["Explorer", "Current level"], ["Contributor", "Next unlock"], ["Host", "Mastery path"]].map(([title, copy], index) => <div key={title} className={`rounded-lg border p-4 ${index === 0 ? "border-orange-500/50 bg-orange-500/10" : "border-white/10 bg-black/30"}`}><p className="text-xs text-white/35">0{index + 1}</p><p className="mt-5 font-bold">{title}</p><p className="mt-1 text-xs text-white/40">{copy}</p></div>)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#111] p-6"><LockKeyhole className="h-6 w-6 text-orange-400" /><h3 className="mt-6 text-xl font-black">{t("settings.proofVisibility")}</h3><p className="mt-3 text-sm leading-6 text-white/45">{t("settings.proofVisibilityCopy")}</p><Button asChild variant="outline" className="mt-7 w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/profile">{t("settings.viewProfile")}</Link></Button></div>
            </div>
          </TabsContent>

          {/* --- PAYOUTS TAB --- */}
          <TabsContent value="payouts">
            <div className="max-w-2xl space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {t("settings.paymentInstructions")}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("settings.paymentCopy")}
                </p>

                <form onSubmit={handlePayoutSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="payoutInfo">{t("settings.paymentDetails")}</Label>
                    <Textarea
                      id="payoutInfo"
                      value={payoutInfo}
                      onChange={(e) => setPayoutInfo(e.target.value)}
                      placeholder="Examples:&#10;Zelle: myemail@gmail.com&#10;PayPal: @myhandle&#10;Bank: Routing X, Account Y"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      <Shield className="w-3 h-3 inline mr-1" />
                      {t("settings.paymentPrivate")}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? t("settings.saving") : t("settings.savePayment")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* --- NOTIFICATIONS TAB --- */}
          <TabsContent value="notifications">
            <div className="max-w-2xl space-y-6">
              {/* Device Push Notifications Card */}
              <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-foreground">Phone & Lock Screen Notifications</h2>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            pushState.isSubscribed
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {pushState.isSubscribed ? "Active on this device" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Receive real-time alerts for RSVP countdowns, Moment start times, and Gem payouts.
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={pushState.isSubscribed}
                    disabled={pushState.loading || !pushState.isSupported}
                    onCheckedChange={(checked) => (checked ? pushState.subscribe() : pushState.unsubscribe())}
                  />
                </div>

                {pushState.isSubscribed && (
                  <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Verify your phone lock screen delivery:</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pushState.sendTestNotification}
                      className="rounded-xl text-xs font-bold gap-1.5 border-primary/40 hover:bg-primary/10 text-primary"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Test Alert
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  {t("settings.preferences")}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t("settings.momentUpdates")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.momentUpdatesCopy")}</p>
                    </div>
                    <Switch
                      checked={notifications.moment_updates ?? true}
                      onCheckedChange={(c) => updateNotificationPreference('moment_updates', c)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t("settings.payoutNotifications")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.payoutNotificationsCopy")}</p>
                    </div>
                    <Switch
                      checked={notifications.payouts ?? true}
                      onCheckedChange={(c) => updateNotificationPreference('payouts', c)}
                    />
                  </div>

                  {(primaryRole === 'merchant' || roles.includes('merchant')) && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t("settings.lowStock")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.lowStockCopy")}</p>
                      </div>
                      <Switch
                        checked={notifications.low_stock ?? true}
                        onCheckedChange={(c) => updateNotificationPreference('low_stock', c)}
                      />
                    </div>
                  )}

                  {(primaryRole === 'brand' || roles.includes('brand')) && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t("settings.budgetAlerts")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.budgetAlertsCopy")}</p>
                      </div>
                      <Switch
                        checked={notifications.budget_alerts ?? true}
                        onCheckedChange={(c) => updateNotificationPreference('budget_alerts', c)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t("settings.marketing")}</Label>
                      <p className="text-sm text-muted-foreground">{t("settings.marketingCopy")}</p>
                    </div>
                    <Switch
                      checked={notifications.marketing ?? false}
                      onCheckedChange={(c) => updateNotificationPreference('marketing', c)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* --- ACCOUNT TAB --- */}
          <TabsContent value="account">
            <div className="max-w-2xl space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {t("settings.guidance")}
                </h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  {t("settings.guidanceCopy")}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {guidanceDensityOptions.map((option) => {
                    const active = guidanceDensity === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGuidanceDensity(option.value)}
                        className={`rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}
                        aria-pressed={active}
                      >
                        <span className="text-sm font-bold">{option.label}</span>
                        <span className="mt-2 block text-xs leading-5">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4">{t("settings.security")}</h2>
                <div className="grid gap-4">
                  <div>
                    <Label>{t("settings.email")}</Label>
                    <Input value={user.email || ""} disabled className="bg-muted mt-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">{t("settings.emailManaged")}</p>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t("settings.resetPassword")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-destructive/20 bg-destructive/5 rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  {t("settings.danger")}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("settings.dangerCopy")}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      {t("settings.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("settings.deleteConfirm")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("settings.deleteConfirmCopy")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("wallet.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                      >
                        {deleting ? t("settings.deleting") : t("settings.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Settings;
