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

const shortNames = { en: "EN", "es-419": "ES", "pt-BR": "PT" } as const;

export const LanguageSelector = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language.label")}
        className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 text-xs font-bold text-white/80 outline-none transition hover:bg-white/[0.1] hover:text-white"
      >
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{shortNames[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl border-white/10 bg-[#0e0e11] p-1.5 text-white">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-white/40">
          {t("language.label")}
        </DropdownMenuLabel>
        {supportedLocales.map((option) => (
          <DropdownMenuItem
            key={option}
            lang={option}
            onClick={() => setLocale(option)}
            className="flex cursor-pointer items-center justify-between rounded-lg text-xs focus:bg-white/10 focus:text-white"
          >
            {localeNames[option]}
            {locale === option && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
