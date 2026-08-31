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
import { cn } from "@/lib/utils";

const shortNames = { en: "EN", "es-419": "ES", "pt-BR": "PT" } as const;

export const LanguageSelector = ({
  tone = "app",
  className,
}: {
  tone?: "marketing" | "app";
  className?: string;
}) => {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t("language.label")}
        onPointerDown={(event) => event.stopPropagation()}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold outline-none transition",
          tone === "marketing"
            ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1] hover:text-white"
            : "border-border bg-muted/50 text-foreground hover:bg-muted",
          className,
        )}
      >
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{shortNames[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onPointerDown={(event) => event.stopPropagation()}
        className={cn(
          "w-44 rounded-xl p-1.5",
          tone === "marketing"
            ? "border-white/10 bg-[#0e0e11] text-white"
            : "border-border bg-popover text-popover-foreground",
        )}
      >
        <DropdownMenuLabel
          className={cn(
            "text-[10px] uppercase tracking-wider",
            tone === "marketing" ? "text-white/40" : "text-muted-foreground",
          )}
        >
          {t("language.label")}
        </DropdownMenuLabel>
        {supportedLocales.map((option) => (
          <DropdownMenuItem
            key={option}
            lang={option}
            onSelect={(event) => {
              event.preventDefault();
              setLocale(option);
            }}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg text-xs",
              tone === "marketing"
                ? "focus:bg-white/10 focus:text-white"
                : "focus:bg-muted focus:text-foreground",
            )}
          >
            {localeNames[option]}
            {locale === option && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
