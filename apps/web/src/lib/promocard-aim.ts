import {
  PROMOCARD_AIM_STORAGE_KEY,
  resolvePromoCardAim,
  type PromoCardAim,
} from "@promorang/shared";
import { intentMatchCount, type PathablePoll } from "@/lib/discovery-path";

export function readPromoCardAim(): PromoCardAim | null {
  if (typeof window === "undefined") return null;
  try {
    return resolvePromoCardAim(window.localStorage.getItem(PROMOCARD_AIM_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writePromoCardAim(aim?: PromoCardAim | null): PromoCardAim | null {
  if (typeof window === "undefined") return aim || null;
  try {
    if (!aim) {
      window.localStorage.removeItem(PROMOCARD_AIM_STORAGE_KEY);
      return null;
    }
    window.localStorage.setItem(PROMOCARD_AIM_STORAGE_KEY, aim.id);
    return aim;
  } catch {
    return aim || null;
  }
}

export function promoCardAimFromSearch(search?: string | URLSearchParams | null): PromoCardAim | null {
  const params = typeof search === "string"
    ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
    : search || (typeof window === "undefined" ? null : new URLSearchParams(window.location.search));
  return resolvePromoCardAim(params?.get("aim"));
}

export function promoCardAimFromNext(next?: string | null): PromoCardAim | null {
  const path = String(next || "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  try {
    return promoCardAimFromSearch(new URL(path, "https://promorang.co").searchParams);
  } catch {
    return null;
  }
}

export function resolveStoredPromoCardAim(search?: string | URLSearchParams | null): PromoCardAim | null {
  return promoCardAimFromSearch(search) || readPromoCardAim();
}

export function matchPollForAim<T extends PathablePoll>(aim: PromoCardAim, polls: T[]): T | null {
  const ranked = polls
    .map((poll) => ({
      poll,
      score: intentMatchCount(poll, [aim.lens], aim.discoverQuery),
    }))
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || left.poll.id.localeCompare(right.poll.id));
  return ranked[0]?.poll || null;
}
