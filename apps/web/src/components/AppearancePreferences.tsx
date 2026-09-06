import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/I18nContext";
import { localeNames, supportedLocales, type Locale } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const themeOptions: Array<{ value: Theme; labelKey: "theme.light" | "theme.dark" | "theme.system"; icon: typeof Sun }> = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
];

export const AppearancePreferences = ({ className }: { className?: string }) => {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

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
    </div>
  );
};
