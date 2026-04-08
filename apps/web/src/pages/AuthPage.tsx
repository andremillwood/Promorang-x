import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Sparkles, Building2, Store, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/promorang-logo.png";
import { z } from "zod";

type UserRole = "participant" | "host" | "brand" | "merchant";

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
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("participant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, demoSignIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
            newErrors[err.path[0] as string] = err.message;
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
            title: "Error signing in",
            description: error.message === "Invalid login credentials"
              ? "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
        } else {
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          toast({
            title: "Error signing up",
            description: error.message.includes("already registered")
              ? "This email is already registered. Please sign in instead."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome to Promorang!",
            description: "Your account has been created successfully.",
          });
          navigate("/dashboard");
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
          title: "Error signing in with Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const { error } = await demoSignIn(role);
      if (error) {
        toast({
          title: "Demo login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Logo */}
          <img src={logo} alt="Promorang" className="h-10 mb-8" />

          {/* Header */}
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            {mode === "login" ? "Welcome back" : "Join Promorang"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === "login"
              ? "Sign in to continue your moment journey"
              : "Create your account to start discovering moments"}
          </p>

          {/* Role Selection (Signup only) */}
          {mode === "signup" && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">I want to...</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(roleInfo) as [UserRole, typeof roleInfo[UserRole]][]).map(
                  ([role, info]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${selectedRole === role
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        }`}
                    >
                      <info.icon className={`w-5 h-5 mb-2 ${selectedRole === role ? "text-primary" : "text-muted-foreground"
                        }`} />
                      <p className="font-medium text-sm">{info.title}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
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
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
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
              {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Social Auth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
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
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Try a demo account
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("participant")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">Participant</span>
                <span className="text-xs text-muted-foreground">Join moments</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("host")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium">Host</span>
                <span className="text-xs text-muted-foreground">Create moments</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("brand")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium">Brand</span>
                <span className="text-xs text-muted-foreground">Run campaigns</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDemoLogin("merchant")}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Store className="w-5 h-5 text-primary" />
                <span className="font-medium">Merchant</span>
                <span className="text-xs text-muted-foreground">Manage venues</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-sunset items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThDMzYgMTMuNzkxIDM0LjIwOSAxMiAzMiAxMnMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bS0xOCAxOGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Where moments happen, together
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands discovering experiences that matter. Create memories that last.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
