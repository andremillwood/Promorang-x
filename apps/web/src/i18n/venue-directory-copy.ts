import type { Locale } from "./translations";

export const venueDirectoryCopy: Record<Locale, { search: string; allAreaParishes: string; loadError: string; retry: string }> = {
  en: {
    search: "Search venues by name, type, or city...",
    allAreaParishes: "All parishes in this area",
    loadError: "We could not load venues for this area.",
    retry: "Try again",
  },
  "es-419": {
    search: "Busca lugares por nombre, tipo o ciudad...",
    allAreaParishes: "Todas las parroquias de esta zona",
    loadError: "No pudimos cargar los lugares de esta zona.",
    retry: "Intentar de nuevo",
  },
  "pt-BR": {
    search: "Busque locais por nome, tipo ou cidade...",
    allAreaParishes: "Todas as paróquias desta área",
    loadError: "Não foi possível carregar os locais desta área.",
    retry: "Tentar novamente",
  },
};
