import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { localeNames, supportedLocales, type Locale } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import {
  getLandingPageOptions,
  ROLE_DEFAULT_LANDING_ID,
  selectedLandingPageId,
} from "@/lib/landing-page-preference";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const themeOptions: Array<{ value: Theme; labelKey: "theme.light" | "theme.dark" | "theme.system"; icon: typeof Sun }> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
];

export const AppearancePreferences = ({ className }: { className?: string }) => {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, roles, activeRole } = useAuth();
  const { toast } = useToast();
  const [landingPageId, setLandingPageId] = useState(ROLE_DEFAULT_LANDING_ID);
  const [savingLandingPage, setSavingLandingPage] = useState(false);

  const landingPageOptions = useMemo(
    () => getLandingPageOptions(roles, activeRole),
    [roles, activeRole],
  );

  useEffect(() => {
    setLandingPageId(selectedLandingPageId({
      path: user?.user_metadata?.preferred_landing_path,
      role: user?.user_metadata?.preferred_landing_role,
      roles,
      activeRole,
    }));
  }, [user, roles, activeRole]);

  const saveLandingPage = async (nextId: string) => {
    if (!user || savingLandingPage) return;
    const option = landingPageOptions.find((item) => item.id === nextId);
    if (!option) return;

    const previousId = landingPageId;
    setLandingPageId(nextId);
    setSavingLandingPage(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        preferred_landing_path: option.path,
        preferred_landing_role: option.role,
      },
    });

    setSavingLandingPage(false);

    if (error) {
      setLandingPageId(previousId);
      toast({
        title: "Start page not saved",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Start page saved",
      description: option.path
        ? `Promorang will open ${option.label} after your next sign-in.`
        : "Promorang will open the default workspace for your active role.",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">{t("language.label")}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {supportedLocales.map((option: Locale) => {
            const active = locale === option;
            return (
              <button
                key={option}
                type="button"
                lang={option}
                aria-pressed={active}
                onClick={() => setLocale(option)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  {localeNames[option]}
                  {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">{t("theme.label")}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const active = theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {t(option.labelKey)}
                  </span>
                  {active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {user && (
        <div className="border-t border-border pt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Start page after sign-in</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Choose where Promorang opens. Role-specific workspaces are shown only for roles assigned to your account.
              </p>
            </div>
            {savingLandingPage && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Saving start page" />}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {landingPageOptions.map((option) => {
              const active = landingPageId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  disabled={savingLandingPage}
                  onClick={() => saveLandingPage(option.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition disabled:cursor-wait disabled:opacity-60",
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                    </span>
                    {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
