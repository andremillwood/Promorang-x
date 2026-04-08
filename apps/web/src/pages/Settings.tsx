import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import DashboardLayout from "@/components/DashboardLayout";
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
  Smartphone
} from "lucide-react";
import { z } from "zod";

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
          fullName: data.full_name || user.user_metadata?.full_name || "",
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
      setAvatarUrl(url);

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from("profiles")
          .update({ avatar_url: url })
          .eq("user_id", user.id);
      }

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
    <DashboardLayout currentRole={primaryRole}>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your identity, payments, and security.
        </p>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-8 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="access-rank">Access Rank</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

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
    </DashboardLayout>
  );
};

export default Settings;
