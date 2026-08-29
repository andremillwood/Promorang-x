import { Check, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/I18nContext";
import { localeNames, supportedLocales } from "@/i18n/translations";
import { themeChipClass, themeOverlayClass } from "@/components/nav/theme-surfaces";
import { cn } from "@/lib/utils";

const shortNames = { en: "EN", "es-419": "ES", "pt-BR": "PT" } as const;

export const LanguageSelector = ({
  tone: _tone = "app",
}: {
  tone?: "marketing" | "app";
}) => {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language.label")}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold outline-none transition",
          themeChipClass,
        )}
      >
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{shortNames[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-44 p-1.5", themeOverlayClass)}>
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t("language.label")}
        </DropdownMenuLabel>
        {supportedLocales.map((option) => (
          <DropdownMenuItem
            key={option}
            lang={option}
            onClick={() => setLocale(option)}
            className="flex cursor-pointer items-center justify-between rounded-lg text-xs focus:bg-accent focus:text-accent-foreground"
          >
            {localeNames[option]}
            {locale === option && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
