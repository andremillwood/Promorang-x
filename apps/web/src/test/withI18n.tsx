import type { ReactNode } from "react";
import { I18nProvider } from "@/i18n/I18nContext";
import { saveLocalePreference } from "@/i18n/geo-locale";
import type { Locale } from "@/i18n/translations";

/** Render production localization in component tests, without a geo-IP request. */
export function withI18n(children: ReactNode, locale: Locale = "en") {
  saveLocalePreference(locale);
  return <I18nProvider>{children}</I18nProvider>;
}
