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
  LockKeyhole
} from "lucide-react";
import { z } from "zod";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { GuidanceDensity, useGuidancePreferences } from "@/hooks/useGuidancePreferences";
import { cultureImages } from "@/data/culture-demo";
import { Link } from "react-router-dom";

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
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const { density: guidanceDensity, setDensity: setGuidanceDensity } = useGuidancePreferences();

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
        title: "Preferences saved",
        description: `Notification for ${key.replace('_', ' ')} updated.`,
      });
    } catch (error: any) {
      console.error("Error saving notification preference:", error);
      toast({
        title: "Error saving preference",
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
        title: "Profile updated! ✨",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
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
      title: "Payment Info Saved",
      description: "We will use this information to process your earnings.",
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
        title: "Account deleted",
        description: "Your account has been removed.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error deleting account",
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
              <Sparkles className="h-3.5 w-3.5" /> Shape your Promorang
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">Make the platform know what moves you.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/55">Your identity and preferences sharpen discovery, make proof recognizable, and help the right opportunities find you.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/55 p-5 backdrop-blur">
            <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Profile signal</p><p className="mt-2 text-3xl font-black">{completion}%</p></div><span className="text-xs text-white/40">{completionItems.filter(Boolean).length} of 5 complete</span></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-orange-500 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]" style={{ width: `${completion}%` }} /></div>
            <p className="mt-4 text-xs leading-5 text-white/45">{completion === 100 ? "Your signal is strong. Keep it current as your scene changes." : "Add the missing details to improve recommendations and recognition."}</p>
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
            <TabsTrigger value="profile">Identity</TabsTrigger>
            <TabsTrigger value="preferences">Discovery</TabsTrigger>
            <TabsTrigger value="access-rank">Status</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="account">Privacy & account</TabsTrigger>
          </TabsList>
          </div>

          {/* --- PROFILE TAB --- */}
          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-2xl">
              {/* Avatar Section */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Profile Photo
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
                      Click the avatar to upload a new photo
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Your full name"
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location
                </h2>
                <div>
                  <Label htmlFor="location">City / Region</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g., New York, NY"
                    className={errors.location ? "border-destructive" : ""}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  About You
                </h2>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Tell others a bit about yourself..."
                    rows={4}
                    className={errors.bio ? "border-destructive" : ""}
                  />
                  <p className="text-muted-foreground text-sm mt-1">
                    {formData.bio?.length || 0}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="hero" size="lg" disabled={saving || uploading}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="grid max-w-4xl gap-5 lg:grid-cols-[1fr_300px]">
              <div className="rounded-lg border border-white/10 bg-[#111] p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Tune your discovery</p>
                <h2 className="mt-3 text-2xl font-black">What deserves a place in your feed?</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">Choose broadly enough to discover, narrowly enough that Promorang learns your taste.</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {discoveryCategories.map((category) => {
                    const active = selectedCategories.includes(category);
                    return <button type="button" key={category} onClick={() => toggleChoice(category, selectedCategories, setSelectedCategories)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-orange-500 bg-orange-500 text-black" : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"}`}>{active && <Check className="mr-1.5 inline h-3.5 w-3.5" />}{category}</button>;
                  })}
                </div>
                <div className="mt-9 border-t border-white/10 pt-7">
                  <h3 className="font-bold">When are you usually open to something?</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {preferredTimes.map((time) => <button type="button" key={time} onClick={() => toggleChoice(time, selectedTimes, setSelectedTimes)} className={`rounded-md border px-3 py-2 text-sm transition ${selectedTimes.includes(time) ? "border-orange-500/60 bg-orange-500/15 text-orange-300" : "border-white/10 text-white/55 hover:bg-white/[0.05]"}`}>{time}</button>)}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between gap-5 rounded-lg border border-white/10 bg-black/40 p-4">
                  <div><p className="font-semibold">Use my location for nearby moments</p><p className="mt-1 text-xs leading-5 text-white/40">Promorang can prioritize moments and scenes within reach.</p></div>
                  <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                </div>
                <Button onClick={handlePreferenceSubmit} disabled={updatePreferences.isPending || selectedCategories.length === 0} className="mt-7 bg-orange-500 font-bold text-black hover:bg-orange-400">
                  {updatePreferences.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save discovery preferences
                </Button>
              </div>
              <aside className="rounded-lg border border-orange-500/25 bg-gradient-to-b from-orange-500/10 to-transparent p-6">
                <Compass className="h-7 w-7 text-orange-400" />
                <h3 className="mt-8 text-xl font-black">This changes what comes forward.</h3>
                <div className="mt-6 space-y-5 text-sm text-white/50">
                  <p>Discover ranks moments closer to your interests and location.</p>
                  <p>Pulse brings forward activity from scenes you are more likely to value.</p>
                  <p>Creator and host suggestions become more relevant over time.</p>
                </div>
                <Link to="/discover" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-orange-400">See your discovery <ArrowRight className="h-4 w-4" /></Link>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="access-rank">
            <div className="grid max-w-4xl gap-5 md:grid-cols-[1fr_320px]">
              <div className="rounded-lg border border-white/10 bg-[#111] p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Your standing</p>
                <h2 className="mt-3 text-3xl font-black">Status is earned in public, controlled by you.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">Verified attendance, completed missions, repeat scenes, and trusted contributions build a proof trail. That trail can unlock earlier access, stronger placement, and better opportunities.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">{[["Explorer", "Current level"], ["Contributor", "Next unlock"], ["Host", "Mastery path"]].map(([title, copy], index) => <div key={title} className={`rounded-lg border p-4 ${index === 0 ? "border-orange-500/50 bg-orange-500/10" : "border-white/10 bg-black/30"}`}><p className="text-xs text-white/35">0{index + 1}</p><p className="mt-5 font-bold">{title}</p><p className="mt-1 text-xs text-white/40">{copy}</p></div>)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#111] p-6"><LockKeyhole className="h-6 w-6 text-orange-400" /><h3 className="mt-6 text-xl font-black">Proof visibility</h3><p className="mt-3 text-sm leading-6 text-white/45">Your public profile can show earned status without exposing private receipts or sensitive account details.</p><Button asChild variant="outline" className="mt-7 w-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/profile">View public profile</Link></Button></div>
            </div>
          </TabsContent>

          {/* --- PAYOUTS TAB --- */}
          <TabsContent value="payouts">
            <div className="max-w-2xl space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Instructions
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Where should we send your earnings? Please provide details for your preferred payment method (e.g., Zelle, PayPal, Venmo, or Bank Wire).
                </p>

                <form onSubmit={handlePayoutSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="payoutInfo">Payment Details</Label>
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
                      This information is encrypted and only visible to admin staff processing payments.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Payment Info"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* --- NOTIFICATIONS TAB --- */}
          <TabsContent value="notifications">
            <div className="max-w-2xl space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Preferences
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Moment Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about moments you've joined or created.</p>
                    </div>
                    <Switch
                      checked={notifications.moment_updates ?? true}
                      onCheckedChange={(c) => updateNotificationPreference('moment_updates', c)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Payout Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when a payout is processed.</p>
                    </div>
                    <Switch
                      checked={notifications.payouts ?? true}
                      onCheckedChange={(c) => updateNotificationPreference('payouts', c)}
                    />
                  </div>

                  {(primaryRole === 'merchant' || roles.includes('merchant')) && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">Alerts when your products are running low.</p>
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
                        <Label className="text-base">Budget Alerts</Label>
                        <p className="text-sm text-muted-foreground">Alerts when your campaign budgets are running low.</p>
                      </div>
                      <Switch
                        checked={notifications.budget_alerts ?? true}
                        onCheckedChange={(c) => updateNotificationPreference('budget_alerts', c)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing & News</Label>
                      <p className="text-sm text-muted-foreground">Stay updated on new features and platform news.</p>
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
                  Guidance Density
                </h2>
                <p className="mb-5 text-sm text-muted-foreground">
                  Choose how much guide content Promorang shows while you work.
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
                <h2 className="font-semibold text-foreground mb-4">Account Security</h2>
                <div className="grid gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input value={user.email || ""} disabled className="bg-muted mt-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">Managed via authentication provider.</p>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Reset Password
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-destructive/20 bg-destructive/5 rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete Account"}
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
