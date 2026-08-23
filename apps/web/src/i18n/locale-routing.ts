import type { Locale } from "./translations";

export const localePrefixes: Record<Locale, string> = {
  en: "",
  "es-419": "/es",
  "pt-BR": "/pt-br",
};

export const localeFromPath = (pathname: string): Locale | null => {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (segment === "es" || segment === "es-419") return "es-419";
  if (segment === "pt-br" || segment === "pt") return "pt-BR";
  return null;
};

export const stripLocalePrefix = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  if (segment === "es" || segment === "es-419" || segment === "pt-br" || segment === "pt") {
    const rawPrefix = `/${segment}`;
    return pathname.slice(rawPrefix.length) || "/";
  }
  return pathname || "/";
};

export const localizePath = (pathname: string, locale: Locale) => {
  const cleanPath = stripLocalePrefix(pathname);
  return `${localePrefixes[locale]}${cleanPath === "/" ? "/" : cleanPath}`;
};

export const routerBasename = () => {
  if (typeof window === "undefined") return undefined;
  const locale = localeFromPath(window.location.pathname);
  return locale ? localePrefixes[locale] : undefined;
};

