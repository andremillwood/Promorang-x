import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Sparkles, Building2, Store, ArrowLeft, Eye, EyeOff, PlayCircle, Briefcase, Mail } from "lucide-react";
import logo from "@/assets/promorang-logo-full.png";
import { z } from "zod";
import { DEMO_EMAIL_STORAGE_KEY, DemoRole } from "@/lib/demo-session";
import { captureGrowthAttribution, markPendingSignup, trackGrowthEvent } from "@/lib/marketing-attribution";
import { trackMetaEvent } from "@/components/MetaPixel";
import { useI18n } from "@/i18n/I18nContext";

type UserRole = "participant" | "creator" | "host" | "brand" | "merchant";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const roleInfo: Record<UserRole, { icon: typeof Users; title: string; description: string }> = {
  participant: {
    icon: Users,
    title: "Join Moments",
    description: "Discover and participate in experiences",
  },
  creator: {
    icon: PlayCircle,
    title: "Create Missions",
    description: "Publish content and drive real-world unlocks",
  },
  host: {
    icon: Sparkles,
    title: "Host Moments",
    description: "Create gatherings and bring people together",
  },
  brand: {
    icon: Building2,
    title: "For Brands",
    description: "Reward real participation with your brand",
  },
  merchant: {
    icon: Store,
    title: "For Venues",
    description: "Welcome moments to your location",
  },
};

const AuthPage = () => {
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("participant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showDemoAccess, setShowDemoAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, demoSignIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const commercialIntent = searchParams.get("intent");
  const selectedPlan = searchParams.get("plan");
  const selectedSku = searchParams.get("sku");
  const localizedRoleInfo: Record<UserRole, { title: string; description: string }> = {
    participant: { title: t("auth.participant"), description: t("persona.explorerDesc") },
    creator: { title: t("auth.creator"), description: t("persona.creatorDesc") },
    host: { title: t("auth.host"), description: t("persona.mayorDesc") },
    brand: { title: t("auth.brand"), description: t("persona.brandDesc") },
    merchant: { title: t("auth.merchant"), description: t("persona.merchantDesc") },
  };

  useEffect(() => {
    captureGrowthAttribution();
    const requestedRole = searchParams.get("role");
    const next = searchParams.get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) {
      sessionStorage.setItem("promorang_post_auth_next", next);
    }
    if (searchParams.get("mode") === "signup") setMode("signup");
    if (!requestedRole) return;

    if (["participant", "creator", "host", "brand", "merchant"].includes(requestedRole)) {
      setSelectedRole(requestedRole as UserRole);
      setShowRolePicker(requestedRole !== "participant");
      setMode("signup");
    }
  }, [searchParams]);

  useEffect(() => {
    const savedDemoEmail = localStorage.getItem(DEMO_EMAIL_STORAGE_KEY);
    if (savedDemoEmail) {
      setDemoEmail(savedDemoEmail);
    }
  }, []);

  const validateForm = () => {
    try {
      if (mode === "signup") {
        authSchema.parse({ email, password, fullName });
      } else {
        authSchema.omit({ fullName: true }).parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            const field = err.path[0] as string;
            newErrors[field] = field === "email"
              ? t("auth.errorEmail")
              : field === "password"
                ? t("auth.errorPassword")
                : t("auth.errorName");
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: t("auth.signInError"),
            description: error.message === "Invalid login credentials"
              ? t("auth.invalidCredentials")
              : error.message,
            variant: "destructive",
          });
        } else {
          // Use post-login router for intelligent landing
          navigate("/post-login", { replace: true });
        }
      } else {
        void trackGrowthEvent({ eventName: "signup_started", journey: "participant", stage: "captured", properties: { role: selectedRole } });
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          toast({
            title: t("auth.signUpError"),
            description: error.message.includes("already registered")
              ? t("auth.alreadyRegistered")
              : error.message,
            variant: "destructive",
          });
        } else {
          markPendingSignup();
          trackMetaEvent("CompleteRegistration", {
            content_name: "Promorang account",
            status: true,
            user_role: selectedRole,
          });
          toast({
            title: t("auth.welcome"),
            description: t("auth.accountCreated"),
          });
          // New users always go through onboarding first
          navigate("/post-login", { replace: true });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: t("auth.googleError"),
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: DemoRole) => {
    setIsLoading(true);
    try {
      const parsedDemoEmail = (
        demoEmail ||
        email ||
        localStorage.getItem(DEMO_EMAIL_STORAGE_KEY) ||
        ""
      ).trim().toLowerCase();
      if (!parsedDemoEmail) {
        toast({
          title: t("auth.demoEmailRequired"),
          description: t("auth.demoEmailRequiredCopy"),
          variant: "destructive",
        });
        return;
      }

      const emailResult = z.string().email().safeParse(parsedDemoEmail);
      if (!emailResult.success) {
        toast({
          title: t("auth.invalidEmail"),
          description: t("auth.invalidDemoEmail"),
          variant: "destructive",
        });
        return;
      }

      setDemoEmail(parsedDemoEmail);
      const { error } = await demoSignIn(role, parsedDemoEmail);
      if (error) {
        toast({
          title: t("auth.demoFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/post-login?demo=1", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#f3efe6] flex text-[#171512]">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-start justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 sm:p-8 lg:items-center">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-[#6d645a] transition-colors mb-4 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("auth.back")}
          </Link>

          {/* Logo */}
          <img src={logo} alt="Promorang" className="h-8 mb-7 sm:h-10 sm:mb-8" />

          {/* Header */}
          <h1 className="font-serif text-[2.35rem] leading-none font-black text-[#171512] mb-3 sm:text-3xl">
            {mode === "login" ? t("auth.welcomeBack") : t("auth.join")}
          </h1>
          <p className="text-[#6d645a] leading-6 mb-7">
            {mode === "login"
              ? t("auth.loginCopy")
              : t("auth.signupCopy")}
          </p>
          {commercialIntent && (
            <div className="mb-6 rounded-xl border border-primary/25 bg-primary/[0.07] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("auth.saved")}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedPlan
                  ? t("auth.continuePlan", { plan: selectedPlan })
                  : selectedSku
                    ? t("auth.continueSku", { sku: selectedSku })
                    : t("auth.continueRoute")}
              </p>
            </div>
          )}

          {/* Role Selection (Signup only) */}
          {mode === "signup" && !showRolePicker && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#171512]/10 bg-white/55 px-4 py-3">
              <div><p className="text-sm font-black">{t("auth.personalMembership")}</p><p className="text-xs text-[#756b5f]">{t("auth.personalMembershipCopy")}</p></div>
              <button type="button" onClick={() => setShowRolePicker(true)} className="min-h-11 shrink-0 text-xs font-black text-primary">{t("auth.businessQ")}</button>
            </div>
          )}
          {mode === "signup" && showRolePicker && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between"><Label className="text-sm font-medium">{t("auth.chooseRole")}</Label><button type="button" onClick={() => { setSelectedRole("participant"); setShowRolePicker(false); }} className="min-h-11 text-xs font-black text-primary">{t("auth.usePersonal")}</button></div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(roleInfo) as [UserRole, typeof roleInfo[UserRole]][]).map(
                  ([role, info]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`min-h-[5.5rem] p-3 rounded-xl border text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${selectedRole === role
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <info.icon className={`w-5 h-5 mb-2 ${selectedRole === role ? "text-primary" : "text-muted-foreground"
                        }`} />
                      <p className="font-medium text-sm">{localizedRoleInfo[role].title}</p>
                      <p className="text-xs text-muted-foreground">{localizedRoleInfo[role].description}</p>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">{t("auth.name")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.name")}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" variant="hero" size="lg" disabled={isLoading}>
              {isLoading ? t("auth.wait") : mode === "login" ? t("auth.signIn") : t("auth.create")}
            </Button>
          </form>

          {/* Social Auth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("auth.continueWith")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </Button>

          {/* Toggle Mode */}
          <p className="text-center text-muted-foreground mt-6">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-[#171512]/10">
            <button type="button" onClick={() => setShowDemoAccess(value => !value)} className="flex min-h-11 w-full items-center justify-between text-left text-sm font-black">
              <span>{t("auth.previewWorkspace")}</span><span className="text-primary">{showDemoAccess ? t("auth.hide") : t("auth.open")}</span>
            </button>
            {showDemoAccess && <div className="pt-4">
            <div className="mb-4 text-center">
              <p className="text-sm font-medium text-foreground">{t("auth.demoTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("auth.demoCopy")}
              </p>
            </div>
            <div className="mb-4">
              <Label htmlFor="demo-email">{t("auth.demoEmail")}</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="demo-email"
                  type="email"
                  value={demoEmail}
                  onChange={(event) => setDemoEmail(event.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  className="pl-10"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("auth.demoPrivacy")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("participant")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("auth.participant")}</span>
                <span className="text-xs text-muted-foreground">{t("auth.demoJoinMoments")}</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("creator")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <PlayCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("auth.creator")}</span>
                <span className="text-xs text-muted-foreground">{t("auth.demoPublishMissions")}</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("host")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("auth.host")}</span>
                <span className="text-xs text-muted-foreground">{t("auth.demoCreateMoments")}</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("brand")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("auth.brand")}</span>
                <span className="text-xs text-muted-foreground">{t("auth.demoRunCampaigns")}</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("agency")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("auth.agency")}</span>
                <span className="text-xs text-muted-foreground">{t("auth.demoManageClients")}</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("merchant")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Store className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("auth.merchant")}</span>
                <span className="text-xs text-muted-foreground">{t("auth.demoManageVenues")}</span>
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("auth.demoWorkspaceNote")}
            </p>
            </div>}
          </div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-sunset items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThDMzYgMTMuNzkxIDM0LjIwOSAxMiAzMiAxMnMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <h2 className="font-serif text-4xl font-bold mb-4">
            {t("auth.visualTitle")}
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            {t("auth.visualCopy")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
