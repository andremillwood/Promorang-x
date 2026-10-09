import { currentUiLocale } from "@/i18n/geo-locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(currentUiLocale(), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat(currentUiLocale(), num >= 1000
    ? { notation: "compact", maximumFractionDigits: 1 }
    : { maximumFractionDigits: 20 }
  ).format(num);
}

const PLACEHOLDER_MEDIA_MAP: Record<string, string> = {
  "wellness-recap": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800",
  "morning-stack": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800",
  "launch-bts": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
  "launch-ad": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
  "launch-poster": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
};

export function getSafeMediaUrl(
  url?: string | null,
  fallback = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800"
): string | null {
  if (!url) return null;
  if (url.includes("cdn.promorang.com")) {
    for (const [key, mapped] of Object.entries(PLACEHOLDER_MEDIA_MAP)) {
      if (url.includes(key)) return mapped;
    }
    return fallback;
  }
  return url;
}

