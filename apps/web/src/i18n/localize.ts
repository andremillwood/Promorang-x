import type { StakeholderLens, StakeholderNavRole } from "@promorang/shared";
import { isPlaceholderDisplayName } from "@promorang/shared";
import type { TranslationKey } from "./translations";

type Translate = (key: TranslationKey, variables?: Record<string, string | number>) => string;

const ROLE_KEYS: StakeholderNavRole[] = [
  "participant",
  "creator",
  "host",
  "brand",
  "merchant",
  "agency",
  "promoter",
  "marketing",
  "admin",
];

export function localizedGreeting(name: string, t: Translate, now = new Date()): string {
  const hour = now.getHours();
  const named = !isPlaceholderDisplayName(name);
  if (hour < 12) return named ? t("people.morningNamed", { name }) : t("people.morning");
  if (hour < 17) return named ? t("people.afternoonNamed", { name }) : t("people.afternoon");
  return named ? t("people.eveningNamed", { name }) : t("people.evening");
}

export function localizeLens(lens: StakeholderLens, t: Translate): StakeholderLens {
  const role = ROLE_KEYS.includes(lens.role) ? lens.role : "participant";
  const prefix = `lens.${role}` as const;
  const workspace = t(`${prefix}.workspace` as TranslationKey);
  const promise = t(`${prefix}.promise` as TranslationKey);
  const ticker = t(`${prefix}.ticker` as TranslationKey);
  const putInLabel = t(`${prefix}.putIn` as TranslationKey);
  const putInDetail = t(`${prefix}.putInDetail` as TranslationKey);
  const cardMeaning = t(`${prefix}.card` as TranslationKey);
  const worldLabel = t(`${prefix}.world` as TranslationKey);
  const worldMeaning = t(`${prefix}.worldMeaning` as TranslationKey);
  const activityLabel = t(`${prefix}.activity` as TranslationKey);
  const activityMeaning = t(`${prefix}.activityMeaning` as TranslationKey);

  return {
    ...lens,
    workspaceLabel: workspace,
    promise,
    ticker,
    putIn: { ...lens.putIn, label: putInLabel, detail: putInDetail },
    promoCard: { meaning: cardMeaning },
    world: { ...lens.world, label: worldLabel, meaning: worldMeaning },
    activity: { ...lens.activity, label: activityLabel, meaning: activityMeaning },
    destinations: lens.destinations.map((item) => {
      if (item.id === "today") return { ...item, label: t("lens.today"), meaning: t("lens.todayMeaning") };
      if (item.id === "world") return { ...item, label: worldLabel, meaning: worldMeaning };
      if (item.id === "activity") return { ...item, label: activityLabel, meaning: activityMeaning };
      if (item.id === "putIn") return { ...item, label: putInLabel, meaning: putInDetail };
      if (item.id === "promoCard") return { ...item, label: t("lens.card"), meaning: cardMeaning };
      return item;
    }),
    extras: lens.extras.map((item) => {
      if (item.href === "/wallet") return { ...item, label: t("lens.wallet") };
      if (item.href === "/dashboard/settings") return { ...item, label: t("lens.settings") };
      if (item.href === "/people") return { ...item, label: t("lens.people") };
      if (item.href === "/demand") return { ...item, label: t("lens.demand") };
      return item;
    }),
  };
}

export function localizedRemainingLabel(percent: number, soldOut: boolean, t: Translate): string {
  if (soldOut || Number(percent || 0) <= 0) return t("aftrhrs.claimedLabel");
  return `${Math.max(0, Math.min(100, Math.round(Number(percent))))}%`;
}

export function localizedGuestPassStatus(status: string | null | undefined, t: Translate): string {
  if (status === "redeemed") return t("aftrhrs.passUsed");
  if (status === "cancelled" || status === "expired") return t("aftrhrs.passInvalid");
  return t("aftrhrs.passReady");
}

export function localizedPerkKind(kind: string, t: Translate): string {
  return t(`give.kind.${kind}` as TranslationKey);
}

export function localizedAudience(audience: string, t: Translate): string {
  return t(`give.audience.${audience}` as TranslationKey);
}

export function localizedCreateIntent(intent: string, t: Translate): { label: string; prompt: string } {
  return {
    label: t(`create.intent.${intent}` as TranslationKey),
    prompt: t(`create.prompt.${intent}` as TranslationKey),
  };
}

export function localizedCommunityTheme(themeId: string, t: Translate): string {
  return t(`start.theme.${themeId}` as TranslationKey);
}
